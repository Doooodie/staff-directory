import path from 'node:path';

import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: [path.join(__dirname, 'migrations/*.ts')],
  synchronize: false,
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
