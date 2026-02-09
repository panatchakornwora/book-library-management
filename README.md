# 🚀 Local Development Setup

ระบบ Book Library Management ประกอบด้วย Backend (NestJS + Prisma) และ Frontend (Next.js)
ใช้ PostgreSQL และ Redis ผ่าน Docker Compose สำหรับ local development

## Prerequisites
ก่อนเริ่มต้น ตรวจสอบว่ามีเครื่องมือเหล่านี้ติดตั้งไว้เรียบร้อยแล้ว

### 1) Node.js
แนะนำให้ใช้เวอร์ชันที่กำหนดไว้ในไฟล์ `.nvmrc` (Node.js 24)

```bash
nvm use
```

---

### 2) Docker & Docker Compose
ใช้สำหรับรัน PostgreSQL ใน local environment

ตรวจสอบเวอร์ชันด้วยคำสั่ง:
```bash
docker --version
docker compose version
```

---

## Project Structure (Overview)

```text
book-library-management/
├─ backend/        # NestJS + Prisma + PostgreSQL
├─ frontend/       # Next.js + Ant Design + Tailwind CSS + i18n
├─ docker-compose.yml
├─ .nvmrc
└─ README.md
```

---

## Environment Variables (สรุป)

- Root `.env` สำหรับ Docker Compose (PostgreSQL/Redis) ดูตัวอย่างที่ `.env.example`
- `backend/.env` สำหรับ backend ดูตัวอย่างที่ `backend/.env.example`
- `frontend/.env.local` สำหรับ frontend ดูตัวอย่างที่ `frontend/.env.example`

---

## 1️⃣ Start Database (PostgreSQL)

ระบบใช้ **Docker Compose** สำหรับรัน database ใน local

สร้างไฟล์ `.env` จากไฟล์ตัวอย่าง

```bash
cp .env.example .env
```

```bash
docker compose up -d
```

ตรวจสอบว่า container ทำงานเรียบร้อย:
```bash
docker ps
```

PostgreSQL จะพร้อมใช้งานที่:
```text
localhost:5432
```

---

## 1.1️⃣ Docker Compose
ถ้าต้องการรันทั้งระบบด้วย Docker (backend + frontend + postgres + redis):

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

ก่อนรันให้ตั้งค่า `JWT_SECRET` ใน `.env`:
```env
JWT_SECRET=secret
```

จากนั้นรัน Prisma migrate + seed (หลัง compose ขึ้นแล้ว):
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

Frontend จะรันที่:
```text
http://localhost:3000
```

Backend จะรันที่:
```text
http://localhost:3001
```

---

## 2️⃣ Backend Setup (NestJS)

ถ้าต้องการรัน backend ในเครื่อง (ไม่ใช้ Docker) ให้ทำตามขั้นตอนนี้

เข้าไปที่โฟลเดอร์ backend

```bash
cd backend
```

### 2.1 Environment Variables
สร้างไฟล์ `.env` จากไฟล์ตัวอย่าง

```bash
cp .env.example .env
```

⚠️ **หมายเหตุ**
- `.env` ใช้สำหรับ local development เท่านั้น
- ห้าม commit ไฟล์ `.env` ขึ้น Git
- ค่า environment สำหรับ production จะถูก inject จาก platform ตอน deploy

**Local Uploads (สำหรับอัปโหลดรูปหน้าปก)**
ไฟล์จะถูกเก็บไว้ที่ `backend/public/uploads` และเข้าถึงได้ผ่าน URL:
```
http://localhost:3001/uploads/<filename>
```
```env
PUBLIC_BASE_URL=http://localhost:3001
```

---

### 2.2 Install Dependencies
```bash
npm install
```

---

### 2.3 Prisma: Migrate & Seed Database
```bash
npx prisma migrate dev
npx prisma db seed
```

---

### 2.4 Start Backend Server
```bash
npm run start:dev
```

Backend จะรันที่:
```text
http://localhost:3001
```

Swagger API Documentation:
```text
http://localhost:3001/docs
```

---

## 3️⃣ Frontend Setup (Next.js)

เปิด terminal ใหม่ แล้วเข้าโฟลเดอร์ frontend

```bash
cd frontend
```

### 3.1 Environment Variables
สร้างไฟล์ `.env.local` จากไฟล์ตัวอย่าง

```bash
cp .env.example .env.local
```

ค่าเริ่มต้น:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### 3.2 Install Dependencies
```bash
npm install
```

---

### 3.3 Start Frontend Server
```bash
npm run dev
```

Frontend จะรันที่:
```text
http://localhost:3000
```

---

## 4️⃣ Test Account (Seed Data)

ระบบมีข้อมูลตัวอย่างสำหรับทดสอบการใช้งาน role ADMIN, LIBRARIAN
Remark: MEMBER สามารถสร่้างได้จาก ADMIN

```text
Email:    admin@test.com
Password: password123
```

```text
Email:    librarian@test.com
Password: password123
```

---

## 5️⃣ Useful URLs (Local)

| Service       | URL |
|--------------|-----|
| Frontend     | http://localhost:3000 |
| Backend API  | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/docs |

---

## 6️⃣ Notes
- ระบบรองรับหลายภาษา (TH / EN): `/th/login`, `/en/login`
- Authentication ใช้ JWT (Bearer Token)
- Swagger ไม่แสดงข้อมูลที่เป็น sensitive เช่น `password` หรือ `passwordHash`
- Logging ฝั่ง backend ใช้ `pino`

---

## 7️⃣ CI / Quality
- มีโครง GitHub Actions สำหรับ:
  - install dependencies
  - lint (frontend)
  - format check
  - test (backend)
  - build

---

## Scripts

Backend:
```bash
npm run start:dev
npm run test
```

Frontend:
```bash
npm run dev
```

---

## Troubleshooting

- หากเจอ `P1001` ให้ตรวจสอบว่า PostgreSQL รันอยู่และค่าใน `.env` ถูกต้อง
- หาก `docker compose up` เตือนเรื่อง env ให้สร้าง `.env` จาก `.env.example` ก่อน
