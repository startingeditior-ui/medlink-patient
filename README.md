# MedLinkID - Digital Medical Record Exchange Platform

![MedLinkID](ML.png)

MedLinkID is a comprehensive digital health identity and medical record exchange platform. It empowers patients with ownership of their medical history across multiple hospitals—without the need to carry physical files. 

This repository contains both the **Patient App** (Frontend) and the **Core API** (Backend) in a monorepo structure.

## Project Structure

```
medlink/
├── medlink-patient-app/     # Patient-facing frontend (Next.js)
├── medlink-backend/         # Core backend API (Node.js + Express)
├── medlink-notification/   # Notification service (Firebase)
├── prisma/                  # Database schema
└── README.md
```

## Goals & Objectives

- Allow patients to securely share medical records with any connected hospital or doctor
- Provide real-time transparency—the patient always knows who is accessing their records
- Give patients full control: approve, revoke, and audit all record access
- Support emergency access with limited data disclosure when the patient is unable to respond

## Key Features

1. **Patient ID Sharing** - Share Patient ID via QR code
2. **Record Access Consent** - OTP or NFC-based approval before record access
3. **Real-Time Notifications** - Live push notifications when records are accessed
4. **Access Control Dashboard** - Monitor, revoke, or block access instantly
5. **Auto-Expiry** - Access automatically expires after configurable duration
6. **Emergency Mode** - Limited data access without consent, with audit log

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **Notifications**: Firebase Cloud Messaging
- **Language**: TypeScript

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Firebase project (for push notifications)

### Environment Setup

#### Backend
```bash
cd medlink-backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database URL and other secrets

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```
Backend runs on `http://localhost:3001`

#### Frontend
```bash
cd medlink-patient-app
npm install

# Configure environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
```
Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/login` - Patient login
- `POST /auth/verify-otp` - Verify OTP login

### Access Management
- `GET /access/active` - Get active access records
- `POST /access/approve` - Approve record access
- `POST /access/revoke` - Revoke active access
- `POST /access/extend` - Extend access duration
- `POST /access/block-hospital` - Block a hospital
- `DELETE /access/block-hospital/:hospitalId` - Unblock a hospital
- `GET /access/blocked-hospitals` - List blocked hospitals

### Patient Data
- `GET /patient/info` - Get patient information
- `PUT /patient/info` - Update patient information
- `GET /patient/records` - Get medical records
- `GET /patient/hospitals` - Get connected hospitals

### Notifications
- `GET /notifications` - Get notification history
- `PUT /notifications/:id/read` - Mark notification as read

## Security Notes

- Patient registration must be done by authorized entities
- Minimum health data stored on device
- All record access is audited for accountability

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## License

This project is built for secure, transparent healthcare interoperability.