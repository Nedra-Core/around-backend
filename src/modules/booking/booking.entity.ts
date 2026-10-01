import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Index} from 'typeorm';
import { User } from '../user/user.entity';
import { Trip } from '../trip/trip.entity';

export enum BookingStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'
}

export const ACTIVE_BOOKING_UNIQUE_INDEX = 'UQ_bookings_active_passenger_trip';

@Entity({ name: 'bookings' })
@Index(ACTIVE_BOOKING_UNIQUE_INDEX, ['passengerId', 'tripId'], {
    unique: true,
    where: `status IN ('pending', 'approved') AND deleted_at IS NULL`,
})
export class Booking {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'passenger_id' })
    passengerId!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'passenger_id' })
    passenger!: User;

    @Column({ name: 'trip_id' })
    tripId!: number;

    @ManyToOne(() => Trip)
    @JoinColumn({ name: 'trip_id' })
    trip!: Trip;

    @Column({ type: 'int', default: 1 })
    seats!: number;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    status!: BookingStatus;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    deletedAt!: Date | null;
}