import type { AdminBookingRow, BookingStaff } from "@inspection/contracts";

import { apiClient } from "../api-client";

export interface BookingListResponse {
  data: AdminBookingRow[];
  total: number;
  page: number;
  limit: number;
}

export interface StaffOption {
  id: string;
  fullName: string;
  employeeCode: string;
  phone: string;
}

export interface AdminSlot {
  id: string;
  centerId: string;
  centerName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  vehicleType: string;
  centerCapacity: number;
  staffCount: number;
  effectiveCapacity: number;
  booked: number;
  remaining: number;
  status: string;
}

export const bookingRepository = {
  async list(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }): Promise<BookingListResponse> {
    const { data } = await apiClient.get<BookingListResponse>(
      "/admin/bookings",
      { params }
    );
    return data;
  },

  async staff(): Promise<StaffOption[]> {
    const { data } = await apiClient.get<StaffOption[]>("/admin/staff");
    return data;
  },

  async slotStaff(slotId: string): Promise<BookingStaff[]> {
    const { data } = await apiClient.get<BookingStaff[]>(
      `/admin/slots/${slotId}/staff`
    );
    return data;
  },

  async configureStaff(slotId: string, staffId: string): Promise<void> {
    await apiClient.post(`/admin/slots/${slotId}/staff`, { staffId });
  },

  async removeStaff(slotId: string, staffId: string): Promise<void> {
    await apiClient.delete(`/admin/slots/${slotId}/staff/${staffId}`);
  },

  async assign(bookingId: string, staffId: string): Promise<void> {
    await apiClient.post(`/admin/bookings/${bookingId}/assign`, { staffId });
  },

  async adminSlots(params: {
    centerId?: string;
    date?: string;
  }): Promise<AdminSlot[]> {
    const { data } = await apiClient.get<AdminSlot[]>("/admin/slots", {
      params,
    });

    return data;
  },
};
