import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      retry: (failureCount, error) => {
        // Não retry para erros 4xx
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Query keys para organizar cache
export const queryKeys = {
  links: (page?: number, limit?: number) =>
    ['links', { page, limit }] as const,
  redirect: (shortUrl: string) =>
    ['redirect', shortUrl] as const,
} as const; 