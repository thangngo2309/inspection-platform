import { apiClient } from "../api-client";
import { getAuth } from "@/lib/auth";
import { myVehiclesRepository } from "./my-vehicles.repository";

export interface MyBooking {
  id: string;
  bookingCode: string;
  status: string;
  customerName: string;
  licensePlate: string;
  serviceName: string;
  totalAmount: string;
  slotDate: string | null;
  startTime: string | null;
  endTime: string | null;
  centerName: string | null;
  staffName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface MyVehicle {
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
  bookingCount?: number;
  lastBookingAt?: string | null;
}

export interface MyPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MyVehicleDetail {
  vehicle: MyVehicle;
  bookings: MyBooking[];
}

function getAccountHeaders(): {
  Authorization: string;
} {
  const auth = getAuth();
  const accessToken = auth?.accessToken;

  if (!accessToken) {
    throw new Error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export const customerAccountRepository = {
  async bookings(page = 1, limit = 20) {
    const { data } = await apiClient.get<MyPage<MyBooking>>(
      "/account/bookings",
      {
        params: { page, limit },
        headers: getAccountHeaders(),
      }
    );

    return data;
  },

  async bookingDetail(id: string) {
    const { data } = await apiClient.get<MyBooking>(
      `/account/bookings/${encodeURIComponent(id)}`,
      {
        headers: getAccountHeaders(),
      }
    );

    return data;
  },

  async vehicles() {
    return myVehiclesRepository.list();
  },

  async vehicleDetail(plate: string) {
    const { data } = await apiClient.get<MyVehicleDetail>(
      `/account/vehicles/${encodeURIComponent(plate)}`,
      {
        headers: getAccountHeaders(),
      }
    );

    return data;
  },

  async history(page = 1, limit = 20) {
    const { data } = await apiClient.get<MyPage<MyBooking>>(
      "/account/history",
      {
        params: { page, limit },
        headers: getAccountHeaders(),
      }
    );

    return data;
  },
};
