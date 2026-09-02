import path from 'node:path';

import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: [path.join(import.meta.dirname, 'migrations', '*.ts')],
  synchronize: false,
  migrationsRun: false,
  logging: true,
  ssl: process.env.DB_HOST?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export default AppDataSource;
