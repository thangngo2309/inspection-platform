import type {
  BookingCenter,
  BookingServiceOption,
  BookingSlot,
  CreateBookingPayload,
  CreatedBooking,
} from "@inspection/contracts";

import { apiClient } from "../api-client";

export const bookingRepository = {
  async centers(): Promise<BookingCenter[]> {
    const response = await apiClient.get<BookingCenter[]>(
      "/booking-options/centers"
    );
    return response.data;
  },

  async services(): Promise<BookingServiceOption[]> {
    const response = await apiClient.get<BookingServiceOption[]>(
      "/booking-options/services"
    );
    return response.data;
  },

  async slots(params: {
    centerId: string;
    date: string;
    vehicleType: string;
  }): Promise<BookingSlot[]> {
    const response = await apiClient.get<BookingSlot[]>(
      "/booking-options/slots",
      { params }
    );
    return response.data;
  },

  async create(payload: CreateBookingPayload): Promise<CreatedBooking> {
    const response = await apiClient.post<CreatedBooking>("/bookings", payload);
    return response.data;
  },
};
