import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateLink,
  useDeleteLink,
  useExportCsv,
  useLinks,
} from "../hooks/use-links";
import { createLinkSchema, type CreateLink } from "../lib/types";

// Função para extrair apenas a parte relevante da URL encurtada
function getCleanShortUrl(shortUrl: string): string {
  // Remove prefixos incorretos que podem vir do backend
  const prefixesToRemove = [
    "localhost:3000/",
    "http://localhost:3000/",
    "https://localhost:3000/",
    "http://localhost:5173/",
    "https://localhost:5173/",
    "http://localhost:5174/",
    "https://localhost:5174/",
  ];

  let cleaned = shortUrl;
  for (const prefix of prefixesToRemove) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length);
    }
  }

  return cleaned;
}

export function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: linksData, isLoading, error } = useLinks(currentPage);
  const createLinkMutation = useCreateLink();
  const deleteLinkMutation = useDeleteLink();
  const exportCsvMutation = useExportCsv();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLink>({
    resolver: zodResolver(createLinkSchema),
  });

  const onSubmit = async (data: CreateLink) => {
    try {
      await createLinkMutation.mutateAsync(data);
      reset();
    } catch (error) {
      console.error("Erro ao criar link:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este link?")) {
      try {
        await deleteLinkMutation.mutateAsync(id);
      } catch (error) {
        console.error("Erro ao deletar link:", error);
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportCsvMutation.mutateAsync();
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
    }
  };

  // Verificar se é erro de conexão (não 404)
  const isConnectionError =
    error && "status" in error && (error as any).status !== 404;

  if (isConnectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erro de Conexão
          </h1>
          <p className="text-gray-600 mb-4">
            Não foi possível conectar com o servidor.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brev.ly</h1>
          <p className="text-gray-600">
            Encurte suas URLs de forma simples e rápida
          </p>
        </div>

        {/* Formulário de criação */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Criar novo link
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="originalUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Original
              </label>
              <input
                {...register("originalUrl")}
                type="url"
                id="originalUrl"
                placeholder="https://exemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.originalUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.originalUrl.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="shortUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Encurtada
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                  {window.location.origin}/
                </span>
                <input
                  {...register("shortUrl")}
                  type="text"
                  id="shortUrl"
                  placeholder="meulink"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.shortUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.shortUrl.message}
                </p>
              )}
            </div>

            {createLinkMutation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {createLinkMutation.error instanceof Error
                    ? createLinkMutation.error.message
                    : "Erro ao criar link"}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || createLinkMutation.isPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || createLinkMutation.isPending
                ? "Criando..."
                : "Criar Link"}
            </button>
          </form>
        </div>

        {/* Lista de links */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Links Criados
            </h2>
            <button
              onClick={handleExport}
              disabled={
                exportCsvMutation.isPending ||
                (!linksData?.links.length && !isLoading)
              }
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportCsvMutation.isPending ? "Exportando..." : "Exportar CSV"}
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando links...</p>
            </div>
          ) : !linksData?.links.length || error?.status === 404 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Nenhum link encontrado.</p>
              <p className="text-sm text-gray-500 mt-1">
                Crie seu primeiro link acima!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {linksData.links.map((link) => {
                const cleanShortUrl = getCleanShortUrl(link.shortUrl);
                const fullShortUrl = `${window.location.origin}/${cleanShortUrl}`;

                return (
                  <div key={link.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            {fullShortUrl}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(fullShortUrl)
                            }
                            className="text-gray-400 hover:text-gray-600"
                            title="Copiar link"
                          >
                            📋
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {link.originalUrl}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{link.visits} visitas</span>
                          <span>
                            Criado em{" "}
                            {new Date(link.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={deleteLinkMutation.isPending}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Deletar link"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginação */}
          {linksData && linksData.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Página {linksData.pagination.page} de{" "}
                {linksData.pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(linksData.pagination.totalPages, p + 1)
                    )
                  }
                  disabled={currentPage === linksData.pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
