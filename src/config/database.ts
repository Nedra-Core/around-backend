import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.entity';
import { Trip } from '../modules/trip/trip.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Trip],
});
