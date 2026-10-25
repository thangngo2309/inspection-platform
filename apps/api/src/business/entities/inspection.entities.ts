import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

abstract class BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

// ===========================================
// 1. USER
// ===========================================

@Entity('users')
@Index('uq_users_phone', ['phone'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName!: string;

  @Column({ type: 'varchar' })
  role!: string;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;
}

// ===========================================
// 2. USER SESSION
// ===========================================

@Entity('user_sessions')
@Index('ix_user_sessions_user_id', ['userId'])
@Index('uq_user_sessions_refresh_token_hash', ['refreshTokenHash'], {
  unique: true,
})
export class UserSession extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId!: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar' })
  refreshTokenHash!: string;

  @Column({ name: 'device_name', type: 'varchar', nullable: true })
  deviceName!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}

// ===========================================
// 3. CUSTOMER
// ===========================================

@Entity('customers')
@Index('uq_customers_phone', ['phone'], { unique: true })
@Index('uq_customers_user_id', ['userId'], { unique: true })
export class Customer extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId!: string | null;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName!: string;

  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ name: 'phone_verified_at', type: 'timestamptz', nullable: true })
  phoneVerifiedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

// ===========================================
// 4. VEHICLE
// ===========================================

@Entity('vehicles')
@Index('ix_vehicles_customer_id', ['customerId'])
export class Vehicle extends BaseEntity {
  @Column({ name: 'customer_id', type: 'bigint' })
  customerId!: string;

  @Column({ name: 'license_plate', type: 'varchar' })
  licensePlate!: string;

  @Column({ name: 'vehicle_type', type: 'varchar' })
  vehicleType!: string;

  @Column({ type: 'varchar', nullable: true })
  brand!: string | null;

  @Column({ type: 'varchar', nullable: true })
  model!: string | null;

  @Column({ name: 'manufacture_year', type: 'integer', nullable: true })
  manufactureYear!: number | null;

  @Column({ name: 'chassis_number', type: 'varchar', nullable: true })
  chassisNumber!: string | null;

  @Column({ name: 'engine_number', type: 'varchar', nullable: true })
  engineNumber!: string | null;

  @Column({ type: 'integer', nullable: true })
  seats!: number | null;

  @Column({
    name: 'payload_kg',
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  payloadKg!: string | null;

  @Column({
    name: 'inspection_expiry_date',
    type: 'date',
    nullable: true,
  })
  inspectionExpiryDate!: string | null;

  @Column({
    name: 'insurance_expiry_date',
    type: 'date',
    nullable: true,
  })
  insuranceExpiryDate!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

// ===========================================
// 5. INSPECTION CENTER
// ===========================================

@Entity('inspection_centers')
@Index('uq_inspection_centers_code', ['code'], { unique: true })
export class InspectionCenter extends BaseEntity {
  @Column({ type: 'varchar' })
  code!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({
    type: 'numeric',
    precision: 11,
    scale: 7,
    nullable: true,
  })
  latitude!: string | null;

  @Column({
    type: 'numeric',
    precision: 11,
    scale: 7,
    nullable: true,
  })
  longitude!: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;
}

// ===========================================
// 6. INSPECTION CENTER USER
// ===========================================

@Entity('inspection_center_users')
@Index('uq_inspection_center_users_center_user', ['centerId', 'userId'], {
  unique: true,
})
export class InspectionCenterUser extends BaseEntity {
  @Column({ name: 'center_id', type: 'bigint' })
  centerId!: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: string;

  @Column({ type: 'varchar', default: 'operator' })
  role!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;
}

// ===========================================
// 7. CENTER SCHEDULE
// ===========================================

@Entity('center_schedules')
export class CenterSchedule extends BaseEntity {
  @Column({ name: 'center_id', type: 'bigint' })
  centerId!: string;

  @Column({ type: 'integer' })
  weekday!: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ name: 'slot_minutes', type: 'integer' })
  slotMinutes!: number;

  @Column({ name: 'default_capacity', type: 'integer' })
  defaultCapacity!: number;

  @Column({ type: 'boolean', default: true })
  active!: boolean;
}

// ===========================================
// 8. CENTER TIME SLOT
// ===========================================

@Entity('center_time_slots')
@Index(
  'uq_center_time_slots_unique',
  ['centerId', 'slotDate', 'startTime', 'vehicleType'],
  { unique: true },
)
export class CenterTimeSlot extends BaseEntity {
  @Column({ name: 'center_id', type: 'bigint' })
  centerId!: string;

  @Column({ name: 'schedule_id', type: 'bigint', nullable: true })
  scheduleId!: string | null;

  @Column({ name: 'slot_date', type: 'date' })
  slotDate!: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ name: 'vehicle_type', type: 'varchar' })
  vehicleType!: string;

  @Column({ type: 'integer', default: 0 })
  capacity!: number;

  @Column({ name: 'reserved_count', type: 'integer', default: 0 })
  reservedCount!: number;

  @Column({ type: 'varchar', default: 'open' })
  status!: string;
}

// ===========================================
// 9. CENTER CLOSURE
// ===========================================

@Entity('center_closures')
@Index('uq_center_closures_center_date', ['centerId', 'closedDate'], {
  unique: true,
})
export class CenterClosure extends BaseEntity {
  @Column({ name: 'center_id', type: 'bigint' })
  centerId!: string;

  @Column({ name: 'closed_date', type: 'date' })
  closedDate!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;
}

// ===========================================
// 10. SERVICE
// ===========================================

@Entity('services')
@Index('uq_services_code', ['code'], { unique: true })
export class Service extends BaseEntity {
  @Column({ type: 'varchar' })
  code!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'service_type', type: 'varchar' })
  serviceType!: string;

  @Column({
    name: 'base_price',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  basePrice!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;
}

// ===========================================
// 11. STAFF PROFILE
// ===========================================

@Entity('staff_profiles')
@Index('uq_staff_profiles_user_id', ['userId'], { unique: true })
@Index('uq_staff_profiles_employee_code', ['employeeCode'], { unique: true })
export class StaffProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId!: string;

  @Column({ name: 'employee_code', type: 'varchar' })
  employeeCode!: string;

  @Column({ type: 'varchar' })
  phone!: string;

  @Column({
    name: 'driver_license_number',
    type: 'varchar',
    nullable: true,
  })
  driverLicenseNumber!: string | null;

  @Column({ name: 'service_area', type: 'text', nullable: true })
  serviceArea!: string | null;

  @Column({ type: 'varchar', default: 'available' })
  status!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;
}

// ===========================================
// 12. BOOKING
// ===========================================

@Entity('bookings')
@Index('uq_bookings_booking_code', ['bookingCode'], { unique: true })
@Index('ix_bookings_center_status', ['centerId', 'status'])
@Index('ix_bookings_customer_id', ['customerId'])
export class Booking extends BaseEntity {
  @Column({ name: 'booking_code', type: 'varchar' })
  bookingCode!: string;

  @Column({ name: 'customer_id', type: 'bigint' })
  customerId!: string;

  @Column({ name: 'vehicle_id', type: 'bigint' })
  vehicleId!: string;

  @Column({ name: 'center_id', type: 'bigint' })
  centerId!: string;

  @Column({ name: 'slot_id', type: 'bigint' })
  slotId!: string;

  @Column({ name: 'service_id', type: 'bigint' })
  serviceId!: string;

  @Column({ type: 'varchar', default: 'pending_confirmation' })
  status!: string;

  @Column({ name: 'customer_name', type: 'varchar' })
  customerName!: string;

  @Column({ name: 'customer_phone', type: 'varchar' })
  customerPhone!: string;

  @Column({ name: 'license_plate', type: 'varchar' })
  licensePlate!: string;

  @Column({ name: 'service_name', type: 'varchar' })
  serviceName!: string;

  @Column({
    name: 'service_fee',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  serviceFee!: string;

  @Column({
    name: 'inspection_fee',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  inspectionFee!: string;

  @Column({
    name: 'insurance_fee',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  insuranceFee!: string;

  @Column({
    name: 'discount_amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  discountAmount!: string;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  totalAmount!: string;

  @Column({ name: 'pickup_required', type: 'boolean', default: false })
  pickupRequired!: boolean;

  @Column({ name: 'pickup_address', type: 'text', nullable: true })
  pickupAddress!: string | null;

  @Column({
    name: 'pickup_latitude',
    type: 'numeric',
    precision: 11,
    scale: 7,
    nullable: true,
  })
  pickupLatitude!: string | null;

  @Column({
    name: 'pickup_longitude',
    type: 'numeric',
    precision: 11,
    scale: 7,
    nullable: true,
  })
  pickupLongitude!: string | null;

  @Column({ name: 'return_address', type: 'text', nullable: true })
  returnAddress!: string | null;

  @Column({ name: 'customer_note', type: 'text', nullable: true })
  customerNote!: string | null;

  @Column({ name: 'internal_note', type: 'text', nullable: true })
  internalNote!: string | null;

  @Column({ name: 'phone_verified_at', type: 'timestamptz' })
  phoneVerifiedAt!: Date;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt!: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason!: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}

// ===========================================
// 13. BOOKING STATUS HISTORY
// ===========================================

@Entity('booking_status_histories')
@Index('ix_booking_status_histories_booking_id', ['bookingId'])
export class BookingStatusHistory extends BaseEntity {
  @Column({ name: 'booking_id', type: 'bigint' })
  bookingId!: string;

  @Column({ name: 'from_status', type: 'varchar', nullable: true })
  fromStatus!: string | null;

  @Column({ name: 'to_status', type: 'varchar' })
  toStatus!: string;

  @Column({ name: 'actor_user_id', type: 'bigint', nullable: true })
  actorUserId!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

// ===========================================
// 14. STAFF ASSIGNMENT
// ===========================================

@Entity('staff_assignments')
@Index('ix_staff_assignments_booking_id', ['bookingId'])
export class StaffAssignment extends BaseEntity {
  @Column({ name: 'booking_id', type: 'bigint' })
  bookingId!: string;

  @Column({ name: 'staff_id', type: 'bigint' })
  staffId!: string;

  @Column({ name: 'assigned_by_user_id', type: 'bigint', nullable: true })
  assignedByUserId!: string | null;

  @Column({ type: 'varchar', default: 'assigned' })
  status!: string;

  @Column({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt!: Date;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt!: Date | null;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

// ===========================================
// 15. VEHICLE HANDOVER
// ===========================================

@Entity('vehicle_handovers')
@Index('ix_vehicle_handovers_booking_id', ['bookingId'])
export class VehicleHandover extends BaseEntity {
  @Column({ name: 'booking_id', type: 'bigint' })
  bookingId!: string;

  @Column({ name: 'staff_id', type: 'bigint' })
  staffId!: string;

  @Column({ name: 'handover_type', type: 'varchar' })
  handoverType!: string;

  @Column({ name: 'odometer_km', type: 'integer', nullable: true })
  odometerKm!: number | null;

  @Column({ name: 'fuel_level', type: 'varchar', nullable: true })
  fuelLevel!: string | null;

  @Column({ name: 'vehicle_condition', type: 'text', nullable: true })
  vehicleCondition!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({
    name: 'customer_confirmed_at',
    type: 'timestamptz',
    nullable: true,
  })
  customerConfirmedAt!: Date | null;

  @Column({ name: 'handover_at', type: 'timestamptz' })
  handoverAt!: Date;
}

// ===========================================
// 16. HANDOVER PHOTO
// ===========================================

@Entity('handover_photos')
export class HandoverPhoto extends BaseEntity {
  @Column({ name: 'handover_id', type: 'bigint' })
  handoverId!: string;

  @Column({ name: 'document_id', type: 'bigint' })
  documentId!: string;

  @Column({ name: 'photo_type', type: 'varchar' })
  photoType!: string;
}

// ===========================================
// 17. INSPECTION RESULT
// ===========================================

@Entity('inspection_results')
@Index('uq_inspection_results_booking_id', ['bookingId'], {
  unique: true,
})
export class InspectionResult extends BaseEntity {
  @Column({ name: 'booking_id', type: 'bigint' })
  bookingId!: string;

  @Column({ type: 'varchar' })
  result!: string;

  @Column({ name: 'inspection_date', type: 'date', nullable: true })
  inspectionDate!: string | null;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate!: string | null;

  @Column({ name: 'certificate_number', type: 'varchar', nullable: true })
  certificateNumber!: string | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({
    name: 'recorded_by_user_id',
    type: 'bigint',
    nullable: true,
  })
  recordedByUserId!: string | null;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt!: Date | null;
}

// ===========================================
// 18. PAYMENT
// ===========================================

@Entity('payments')
@Index('uq_payments_payment_code', ['paymentCode'], { unique: true })
export class Payment extends BaseEntity {
  @Column({ name: 'booking_id', type: 'bigint' })
  bookingId!: string;

  @Column({ name: 'payment_code', type: 'varchar' })
  paymentCode!: string;

  @Column({ type: 'varchar' })
  provider!: string;

  @Column({ type: 'varchar' })
  method!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({
    name: 'provider_transaction_id',
    type: 'varchar',
    nullable: true,
  })
  providerTransactionId!: string | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}

// ===========================================
// 19. DOCUMENT
// ===========================================

@Entity('documents')
export class Document extends BaseEntity {
  @Column({ name: 'customer_id', type: 'bigint', nullable: true })
  customerId!: string | null;

  @Column({ name: 'vehicle_id', type: 'bigint', nullable: true })
  vehicleId!: string | null;

  @Column({ name: 'booking_id', type: 'bigint', nullable: true })
  bookingId!: string | null;

  @Column({
    name: 'uploaded_by_user_id',
    type: 'bigint',
    nullable: true,
  })
  uploadedByUserId!: string | null;

  @Column({ name: 'document_type', type: 'varchar' })
  documentType!: string;

  @Column({ name: 'object_key', type: 'text' })
  objectKey!: string;

  @Column({ name: 'original_name', type: 'varchar' })
  originalName!: string;

  @Column({ name: 'mime_type', type: 'varchar' })
  mimeType!: string;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize!: number;

  @Column({ name: 'is_private', type: 'boolean', default: true })
  isPrivate!: boolean;
}

// ===========================================
// 20. OTP VERIFICATION
// ===========================================

@Entity('otp_verifications')
@Index('ix_otp_verifications_phone_purpose', ['phone', 'purpose'])
export class OtpVerification extends BaseEntity {
  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar' })
  purpose!: string;

  @Column({ name: 'otp_hash', type: 'varchar' })
  otpHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt!: Date | null;

  @Column({ name: 'attempt_count', type: 'integer', default: 0 })
  attemptCount!: number;

  @Column({ name: 'request_ip', type: 'varchar', nullable: true })
  requestIp!: string | null;
}

// ===========================================
// 21. NOTIFICATION
// ===========================================

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ name: 'customer_id', type: 'bigint', nullable: true })
  customerId!: string | null;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId!: string | null;

  @Column({ name: 'booking_id', type: 'bigint', nullable: true })
  bookingId!: string | null;

  @Column({ type: 'varchar' })
  channel!: string;

  @Column({ type: 'varchar' })
  recipient!: string;

  @Column({ name: 'template_code', type: 'varchar' })
  templateCode!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({
    name: 'provider_message_id',
    type: 'varchar',
    nullable: true,
  })
  providerMessageId!: string | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown> | null;
}

// ===========================================
// 22. AUDIT LOG
// ===========================================

@Entity('audit_logs')
@Index('ix_audit_logs_entity', ['entityType', 'entityId'])
export class AuditLog extends BaseEntity {
  @Column({ name: 'actor_user_id', type: 'bigint', nullable: true })
  actorUserId!: string | null;

  @Column({ type: 'varchar' })
  action!: string;

  @Column({ name: 'entity_type', type: 'varchar' })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'varchar' })
  entityId!: string;

  @Column({ name: 'before_data', type: 'jsonb', nullable: true })
  beforeData!: Record<string, unknown> | null;

  @Column({ name: 'after_data', type: 'jsonb', nullable: true })
  afterData!: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'work_id', type: 'varchar', nullable: true })
  workId!: string | null;
}

// ===========================================
// 23. SYSTEM SETTING
// ===========================================

@Entity('system_settings')
@Index('uq_system_settings_setting_key', ['settingKey'], { unique: true })
export class SystemSetting extends BaseEntity {
  @Column({ name: 'setting_key', type: 'varchar' })
  settingKey!: string;

  @Column({ name: 'setting_value', type: 'jsonb' })
  settingValue!: unknown;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'updated_by_user_id',
    type: 'bigint',
    nullable: true,
  })
  updatedByUserId!: string | null;
}
