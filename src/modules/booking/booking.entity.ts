import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { User } from '../user/user.entity';
import { Trip } from '../trip/trip.entity';

export enum BookingStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'
}

@Entity({ name: 'bookings' })
export class Booking {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'passenger_id' })
    passenger!: User;

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

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt!: Date | null;
}