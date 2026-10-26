import { apiClient } from "../api-client";

export interface CatalogPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CatalogParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  serviceType: string;
  basePrice: string;
  active: boolean;
  createdAt: string;
}

export type ServicePayload = {
  code: string;
  name: string;
  description?: string;
  serviceType: string;
  basePrice: string;
  active: boolean;
};

export interface CenterItem {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: string | null;
  longitude: string | null;
  description: string | null;
  status: "active" | "inactive";
  createdAt: string;
}

export type CenterPayload = {
  code: string;
  name: string;
  address: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
  status: "active" | "inactive";
};

export const catalogRepository = {
  services: {
    async list(params: CatalogParams) {
      const { data } = await apiClient.get<CatalogPage<ServiceItem>>(
        "/admin/services",
        { params }
      );
      return data;
    },

    async create(payload: ServicePayload) {
      const { data } = await apiClient.post<ServiceItem>(
        "/admin/services",
        payload
      );
      return data;
    },

    async update(id: string, payload: ServicePayload) {
      const { data } = await apiClient.patch<ServiceItem>(
        `/admin/services/${id}`,
        payload
      );
      return data;
    },

    async setStatus(id: string, active: boolean) {
      const { data } = await apiClient.patch<ServiceItem>(
        `/admin/services/${id}/status`,
        { active }
      );
      return data;
    },
  },

  centers: {
    async list(params: CatalogParams) {
      const { data } = await apiClient.get<CatalogPage<CenterItem>>(
        "/admin/centers",
        { params }
      );
      return data;
    },

    async create(payload: CenterPayload) {
      const { data } = await apiClient.post<CenterItem>(
        "/admin/centers",
        payload
      );
      return data;
    },

    async update(id: string, payload: CenterPayload) {
      const { data } = await apiClient.patch<CenterItem>(
        `/admin/centers/${id}`,
        payload
      );
      return data;
    },

    async setStatus(id: string, status: "active" | "inactive") {
      const { data } = await apiClient.patch<CenterItem>(
        `/admin/centers/${id}/status`,
        { status }
      );
      return data;
    },
  },
};
