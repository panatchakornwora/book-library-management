# Book Library Management - Backend

Backend (NestJS + Prisma) สำหรับระบบ Book Library Management

## Prerequisites

- ใช้ Node.js เวอร์ชันตาม `.nvmrc` (ที่ root)
- ต้องมี PostgreSQL รันอยู่ (ผ่าน Docker Compose หรือ local)

## Quick Start

สำหรับการตั้งค่าระบบทั้งหมด (DB + backend + frontend) ให้ดูที่ README ที่ root:

```text
../README.md
```

ถ้าต้องการรันเฉพาะ backend ในเครื่อง:

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

API จะรันที่:

```text
http://localhost:3001
```

## Environment Variables

- ดูตัวอย่างที่ `backend/.env.example`
- `PUBLIC_BASE_URL` ใช้สำหรับ URL ของไฟล์อัปโหลด

## Scripts (ที่ใช้บ่อย)

```bash
npm run start:dev
npm run test
```

## Project Structure (Backend)

```text
backend/
├─ src/          # โค้ดหลักของแอป (modules, controllers, services)
├─ src/prisma/   # schema, migrations, seed
├─ public/       # ไฟล์ static / uploads
├─ test/         # ทดสอบ / e2e
├─ dist/         # build output
└─ README.md
```

## Troubleshooting

- หากเจอ `P1001` ให้ตรวจสอบว่า PostgreSQL รันอยู่และค่าใน `.env` ถูกต้อง
