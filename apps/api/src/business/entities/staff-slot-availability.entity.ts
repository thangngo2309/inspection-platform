import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('staff_slot_availabilities')
@Index('uq_staff_slot_availability', ['staffId', 'slotId'], {
  unique: true,
})
@Index('ix_staff_slot_availabilities_slot', ['slotId', 'active'])
export class StaffSlotAvailability {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'staff_id', type: 'bigint' })
  staffId!: string;

  @Column({ name: 'slot_id', type: 'bigint' })
  slotId!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
