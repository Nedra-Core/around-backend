import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity({ name: 'trips' })
export class Trip {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'driver_id' })
  driverId!: number;

  @Column({ name: 'start_location' })
  startLocation!: string;

  @Column({ name: 'end_location' })
  endLocation!: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime!: Date;

  @Column({ name: 'available_seats', type: 'int' })
  availableSeats!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  price!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}