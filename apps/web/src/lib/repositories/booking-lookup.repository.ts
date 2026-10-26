import { apiClient } from "../api-client";

export interface BookingLookupPayload {
  bookingCode: string;
  phone: string;
}

export interface BookingLookupResult {
  id: string;
  bookingCode: string;
  status: string;
  createdAt: string;

  customerName: string;

  licensePlate: string;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;

  serviceName: string;
  totalAmount: string;

  slotDate: string | null;
  startTime: string | null;
  endTime: string | null;

  centerName: string | null;
  centerAddress: string | null;

  staffName: string | null;

  pickupRequired: boolean;

  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export const bookingLookupRepository = {
  async lookup(payload: BookingLookupPayload): Promise<BookingLookupResult> {
    const response = await apiClient.post<BookingLookupResult>(
      "/booking-lookup",
      payload
    );

    return response.data;
  },
};
