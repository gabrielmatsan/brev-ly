import { env } from "./env";
import type {
  CreateLink,
  ExportResponse,
  Link,
  LinksResponse,
  RedirectResponse
} from "./types";

const API_BASE_URL = env.VITE_BACKEND_URL;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  //@ts-ignore
  const headers: Record<string, string> = {
    ...options.headers,
  };

  // Só adicionar Content-Type se houver body
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}`
    );
  }

  return response.json();
}

export const api = {
  // Criar link encurtado
  async createLink(data: CreateLink): Promise<Link> {
    return apiRequest<Link>("/v1/link/shorten", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Listar todos os links
  async getLinks(page = 1, limit = 10): Promise<LinksResponse> {
    try {
      return await apiRequest<LinksResponse>(`/v1/link/?page=${page}&limit=${limit}`);
    } catch (error) {
      // Se for erro 404 ou similar, retornar lista vazia
      if (error instanceof ApiError && error.status === 404) {
        return {
          message: "Nenhum link encontrado",
          links: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        };
      }
      throw error;
    }
  },

  // Deletar link
  async deleteLink(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/v1/link/shortUrl/${id}`, {
      method: "DELETE",
    });


  },

  // Obter URL original e incrementar visitas
  async getOriginalUrl(shortUrl: string): Promise<RedirectResponse> {
    return apiRequest<RedirectResponse>(`/v1/link/shortUrl/${shortUrl}`, {
      method: "PATCH", // PATCH incrementa visitas e retorna URL original
    });
  },

  // Exportar links para CSV
  async exportToCsv(): Promise<ExportResponse> {
    return apiRequest<ExportResponse>("/v1/link/export", {
      method: "POST",
    });
  },
}; 