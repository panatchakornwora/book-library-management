# Book Library Management - Frontend

Frontend (Next.js) สำหรับระบบ Book Library Management

## Prerequisites

- ใช้ Node.js เวอร์ชันตาม `.nvmrc` (Node.js 24 ที่ root)
- ต้องมี backend รันอยู่ หากจะใช้งานจริง

## Quick Start

สำหรับการตั้งค่าระบบทั้งหมด (DB + backend + frontend) ให้ดูที่ README ที่ root:

```text
../README.md
```

ถ้าต้องการรันเฉพาะ frontend ในเครื่อง:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Frontend จะรันที่:

```text
http://localhost:3000
```

## Environment Variables

- ดูตัวอย่างที่ `frontend/.env.example`
- `NEXT_PUBLIC_API_URL` ค่าเริ่มต้นคือ `http://localhost:3001`

## Scripts (ที่ใช้บ่อย)

```bash
npm run dev
```

## Notes

- ไฟล์แปลภาษาอยู่ที่ `src/translate/en.json` และ `src/translate/th.json`

## Project Structure (Frontend)

```text
frontend/
├─ src/          # โค้ดหลักของแอป (pages/app, components, services)
├─ public/       # static assets
└─ README.md
```

## Troubleshooting

- หากหน้าเว็บเรียก API ไม่ได้ ให้ตรวจสอบ `NEXT_PUBLIC_API_URL`
