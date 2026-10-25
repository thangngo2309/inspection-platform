import { apiClient } from "../api-client";

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class BaseRepository<T> {
  constructor(private readonly endpoint: string) {}

  async list(params?: ListParams): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get<PaginatedResponse<T>>(this.endpoint, {
      params,
    });

    return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const response = await apiClient.get<T>(`${this.endpoint}/${id}`);

    return response.data;
  }
}
