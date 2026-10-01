import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueActiveBookingIndex1790855565920 implements MigrationInterface {
    name = 'AddUniqueActiveBookingIndex1790855565920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_bookings_active_passenger_trip" ON "bookings"  ("passenger_id", "trip_id") WHERE status IN ('pending', 'approved') AND deleted_at IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_bookings_active_passenger_trip"`);
    }

}
