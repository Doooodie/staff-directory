# Staff Directory API

## Tech stack

NestJS · TypeORM · PostgreSQL · Passport.js · JWT · class-validator · @nestjs/swagger · Docker Compose

## Prerequisites

- Node.js 20+
- Docker and Docker Compose

## Getting started

```bash
git clone https://github.com/Doooodie/staff-directory.git
cd staff-directory/backend
cp .env.example .env
docker compose up -d
npm install
npm run migration:run
npm run seed
npm run start:dev
```

## API documentation

- Remote: https://staff-directory-ap59.onrender.com/api/docs
- Local: http://localhost:3000/api/docs

## Default credentials

Seed admin user: `admin@company.com` / `Admin123!`

## Running tests

```bash
npm run test
```
