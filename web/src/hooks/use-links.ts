import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "../lib/query-client";
import type { CreateLink } from "../lib/types";

// Hook para buscar links
export function useLinks(page = 1, limit = 10) {
  return useQuery({
    queryKey: queryKeys.links(page, limit),
    queryFn: () => api.getLinks(page, limit),
    retry: (failureCount, error) => {
      // Não retry para erro 404 (quando não há links)
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status === 404) {
          return false;
        }
      }
      return failureCount < 3;
    },
    // Configuração para lidar com lista vazia
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para criar link
export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLink) => api.createLink(data),
    onSuccess: () => {
      // Invalidar cache dos links para refetch
      queryClient.invalidateQueries({
        queryKey: ["links"],
      });
    },
  });
}

// Hook para deletar link
export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return api.deleteLink(id);
    },
    // Atualização otimista - remove da lista imediatamente
    onMutate: async (deletedId) => {
      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey: ["links"] });

      // Obter dados atuais
      const previousLinks = queryClient.getQueriesData({ queryKey: ["links"] });

      // Atualizar cache removendo o item
      queryClient.setQueriesData({ queryKey: ["links"] }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          links: old.links.filter((link: any) => link.id !== deletedId)
        };
      });

      // Retornar dados anteriores para rollback em caso de erro
      return { previousLinks };
    },
    onSuccess: (_data, _deletedId) => {
      // Invalidar e refetch para sincronizar com servidor
      queryClient.invalidateQueries({
        queryKey: ["links"],
      });
    },
    onError: (error, _deletedId, context) => {
      console.error('Erro ao deletar link:', error);

      // Rollback em caso de erro
      if (context?.previousLinks) {
        context.previousLinks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // Sempre invalidar no final (sucesso ou erro)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

// Hook para exportar CSV
export function useExportCsv() {
  return useMutation({
    mutationFn: () => api.exportToCsv(),
    onSuccess: (data) => {
      // Abrir link para download em nova aba
      window.open(data.url, "_blank");
    },
  });
}

// Hook para redirecionamento
export function useRedirect(shortUrl: string) {
  return useQuery({
    queryKey: queryKeys.redirect(shortUrl),
    queryFn: () => api.getOriginalUrl(shortUrl),
    enabled: !!shortUrl,
    retry: false, // Não retry para redirecionamento
  });
} 