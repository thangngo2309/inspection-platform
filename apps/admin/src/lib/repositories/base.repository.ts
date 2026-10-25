import type { AxiosInstance } from "axios";
import { apiClient } from "../api-client";

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class BaseRepository<
  TEntity,
  TCreate = Partial<TEntity>,
  TUpdate = Partial<TCreate>
> {
  constructor(
    protected readonly endpoint: string,
    protected readonly client: AxiosInstance = apiClient
  ) {}

  async list(params?: QueryParams): Promise<PaginatedResponse<TEntity>> {
    const { data } = await this.client.get<PaginatedResponse<TEntity>>(
      this.endpoint,
      { params }
    );

    return data;
  }

  async getById(id: string | number): Promise<TEntity> {
    const { data } = await this.client.get<TEntity>(`${this.endpoint}/${id}`);

    return data;
  }

  async create(payload: TCreate): Promise<TEntity> {
    const { data } = await this.client.post<TEntity>(this.endpoint, payload);

    return data;
  }

  async update(id: string | number, payload: TUpdate): Promise<TEntity> {
    const { data } = await this.client.patch<TEntity>(
      `${this.endpoint}/${id}`,
      payload
    );

    return data;
  }

  async delete(id: string | number): Promise<void> {
    await this.client.delete(`${this.endpoint}/${id}`);
  }
}
