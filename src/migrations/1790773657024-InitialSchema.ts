import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1790773657024 implements MigrationInterface {
    name = 'InitialSchema1790773657024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."trips" ("id" SERIAL NOT NULL, "driver_id" integer NOT NULL, "start_location" character varying NOT NULL, "end_location" character varying NOT NULL, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "available_seats" integer NOT NULL, "price" numeric(5,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f71c231dee9c05a9522f9e840f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "public"."bookings" ("id" SERIAL NOT NULL, "passenger_id" integer NOT NULL, "trip_id" integer NOT NULL, "seats" integer NOT NULL DEFAULT '1', "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."bookings" ADD CONSTRAINT "FK_1a764d454e20296cfa277d8742e" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."bookings" ADD CONSTRAINT "FK_45fa98a28a6944e39d8a5754bd1" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."bookings" DROP CONSTRAINT "FK_45fa98a28a6944e39d8a5754bd1"`);
        await queryRunner.query(`ALTER TABLE "public"."bookings" DROP CONSTRAINT "FK_1a764d454e20296cfa277d8742e"`);
        await queryRunner.query(`DROP TABLE "public"."bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "public"."trips"`);
        await queryRunner.query(`DROP TABLE "public"."users"`);
    }

}
