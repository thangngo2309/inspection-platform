import { apiClient } from "../api-client";

export interface SlotItem {
  id: string;
  centerId: string;
  centerName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  vehicleType: "car" | "truck" | "bus";
  capacity: number;
  reservedCount: number;
  status: "open" | "closed";
}

export interface SlotFormValues {
  centerId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  vehicleType: "car" | "truck" | "bus";
  capacity: number;
}

export interface SlotPage {
  data: SlotItem[];
  total: number;
  page: number;
  limit: number;
}

export const slotManagementRepository = {
  async list(params: {
    page: number;
    limit: number;
    centerId?: string;
    date?: string;
  }): Promise<SlotPage> {
    const { data } = await apiClient.get<SlotPage>("/admin/slot-management", {
      params,
    });
    return data;
  },

  async create(payload: SlotFormValues) {
    const { data } = await apiClient.post<SlotItem>(
      "/admin/slot-management",
      payload
    );
    return data;
  },

  async update(
    id: string,
    payload: {
      startTime: string;
      endTime: string;
      capacity: number;
    }
  ) {
    const { data } = await apiClient.patch<SlotItem>(
      `/admin/slot-management/${id}`,
      payload
    );
    return data;
  },

  async changeStatus(id: string, status: "open" | "closed") {
    const { data } = await apiClient.patch<SlotItem>(
      `/admin/slot-management/${id}/status`,
      { status }
    );
    return data;
  },
};
