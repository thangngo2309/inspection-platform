export interface BookingCenter {
  id: string;
  code: string;
  name: string;
  address: string;
}

export interface BookingServiceOption {
  id: string;
  code: string;
  name: string;
  basePrice: string;
  serviceType: string;
}

export interface BookingSlot {
  id: string;
  centerId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  remaining: number;
}

export interface CreateBookingPayload {
  centerId: string;
  slotId: string;
  serviceId: string;

  customerName: string;
  customerPhone: string;
  customerEmail?: string;

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

  pickupRequired: boolean;
  pickupAddress?: string;
  returnAddress?: string;
  customerNote?: string;
}

export interface CreatedBooking {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount: string;
}

export interface AdminBookingRow {
  id: string;
  code: string;
  customer: string;
  phone: string;
  plate: string;
  status: string;
  slotId: string;
  centerId: string;
  slotDate: string;
  startTime: string;
  centerName: string;
  staffId: string | null;
  staffName: string | null;
  totalAmount: string;
}

export interface BookingStaff {
  id: string;
  fullName: string;
  employeeCode: string;
  assignedBookingId: string | null;
}
