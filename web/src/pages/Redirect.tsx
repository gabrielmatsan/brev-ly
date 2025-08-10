import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRedirect } from "../hooks/use-links";

export function Redirect() {
  const { shortUrl } = useParams<{ shortUrl: string }>();

  // Usar a URL limpa diretamente dos parâmetros da rota
  const cleanShortUrl = shortUrl || "";
  const { data, isLoading, error } = useRedirect(cleanShortUrl);

  useEffect(() => {
    if (data?.originalUrl) {
      // O PATCH já incrementou as visitas e retornou a URL original
      // Agora só redirecionar
      window.location.href = data.originalUrl;
    }
  }, [data]);

  if (!cleanShortUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">URL Inválida</h1>
          <p className="text-gray-600 mb-4">A URL fornecida não é válida.</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            Voltar para a página inicial
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Redirecionando...
          </h1>
          <p className="text-gray-600">
            Aguarde enquanto processamos seu link.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Link não encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            O link que você está procurando não existe ou foi removido.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              URL solicitada:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {cleanShortUrl}
              </code>
            </p>
            <a
              href="/"
              className="inline-block text-blue-600 hover:text-blue-800 underline"
            >
              Voltar para a página inicial
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Este estado não deveria ser alcançado normalmente
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Processando...
        </h1>
        <p className="text-gray-600">
          Se você não for redirecionado automaticamente,
          <a
            href={data?.originalUrl}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            clique aqui
          </a>
        </p>
      </div>
    </div>
  );
}
