import { apiClient } from "../api-client";

export interface CustomerRow {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  bookingCount: number;
  vehicleCount: number;
  lastBookingAt: string | null;
  hasAccount: boolean;
}

export interface VehicleRow {
  id: string;
  licensePlate: string;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  chassisNumber: string | null;
  engineNumber: string | null;

  bookingCount: number;
  lastBookingAt: string | null;
  customerName: string;
  customerPhone: string;

  registeredVehicleId: string | null;
  customerId: string | null;
  isRegistered: boolean;
}

export interface BookingHistoryRow {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  licensePlate: string;
  vehicleSnapshot: Record<string, unknown> | null;
  centerName: string | null;
  serviceName: string;
  slotDate: string | null;
  startTime: string | null;
  status: string;
  totalAmount: string;
  staffName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerDetailResponse {
  customer: CustomerRow;
  vehicles: VehicleRow[];
  history: BookingHistoryRow[];
}

export interface VehicleDetailResponse {
  vehicle: VehicleRow;
  contacts: {
    phone: string;
    fullName: string;
    bookingCount: number;
  }[];
  history: BookingHistoryRow[];
}

export interface DirectoryParams {
  page: number;
  limit: number;
  search?: string;
}

export const customerVehiclesRepository = {
  async customers(params: DirectoryParams) {
    const { data } = await apiClient.get<PagedResponse<CustomerRow>>(
      "/admin/customers",
      { params }
    );

    return data;
  },

  async customerDetail(phone: string) {
    const { data } = await apiClient.get<CustomerDetailResponse>(
      `/admin/customers/${encodeURIComponent(phone)}`
    );

    return data;
  },

  async vehicles(params: DirectoryParams) {
    const { data } = await apiClient.get<PagedResponse<VehicleRow>>(
      "/admin/vehicles",
      { params }
    );

    return data;
  },

  async vehicleDetail(plate: string) {
    const { data } = await apiClient.get<VehicleDetailResponse>(
      `/admin/vehicles/${encodeURIComponent(plate)}`
    );

    return data;
  },
};
