import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

    @Column({ name: 'start_time', type: 'timestamp' })
    startTime!: Date;
}