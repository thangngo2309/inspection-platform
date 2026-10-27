import { apiClient } from "../api-client";

export interface SavedVehicle {
  id: string;
  customerId: string;
  licensePlate: string;
  vehicleType: string;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  chassisNumber: string | null;
  engineNumber: string | null;
  seats: number | null;
  payloadKg: string | null;
  inspectionExpiryDate: string | null;
  insuranceExpiryDate: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormPayload {
  licensePlate: string;
  vehicleType: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  chassisNumber?: string;
  engineNumber?: string;
  seats?: number;
  payloadKg?: string;
  inspectionExpiryDate?: string;
  insuranceExpiryDate?: string;
  note?: string;
}

export const myVehiclesRepository = {
  async list(): Promise<SavedVehicle[]> {
    const { data } = await apiClient.get<SavedVehicle[]>("/account/vehicles");

    return data;
  },

  async get(id: string): Promise<SavedVehicle> {
    const { data } = await apiClient.get<SavedVehicle>(
      `/account/vehicles/${encodeURIComponent(id)}`
    );

    return data;
  },

  async create(payload: VehicleFormPayload): Promise<SavedVehicle> {
    const { data } = await apiClient.post<SavedVehicle>(
      "/account/vehicles",
      payload
    );

    return data;
  },

  async update(id: string, payload: VehicleFormPayload): Promise<SavedVehicle> {
    const { data } = await apiClient.patch<SavedVehicle>(
      `/account/vehicles/${encodeURIComponent(id)}`,
      payload
    );

    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/account/vehicles/${encodeURIComponent(id)}`);
  },
};

export interface VehicleBookingHistory {
  id: string;
  bookingCode: string;
  licensePlate: string;
  serviceName: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  completedAt: string | null;
}

export async function getMyVehicleBookings(
  vehicleId: string
): Promise<VehicleBookingHistory[]> {
  const { data } = await apiClient.get<VehicleBookingHistory[]>(
    `/account/vehicles/${encodeURIComponent(vehicleId)}/bookings`
  );

  return data;
}
