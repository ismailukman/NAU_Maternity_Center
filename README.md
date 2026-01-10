# NAU Maternity Center Management System

A comprehensive maternity center management system built with Next.js, Prisma, and Firebase.

## Project Structure

- `/app` - Main Next.js application
  - Frontend and backend code
  - Database schema (Prisma)
  - API routes

## Deployment

This project is configured to automatically deploy to Firebase Hosting on every push to the `main` branch.

### Firebase Setup (One-time)

To enable automatic deployment, you need to add a Firebase service account to your GitHub repository:

1. Go to your [Firebase Console](https://console.firebase.google.com/u/0/project/nau-maternity-center/overview)

2. Navigate to Project Settings > Service Accounts

3. Click "Generate New Private Key" and download the JSON file

4. Go to your GitHub repository: https://github.com/ismailukman/NAU_Maternity_Center

5. Navigate to Settings > Secrets and variables > Actions

6. Click "New repository secret"

7. Name: `FIREBASE_SERVICE_ACCOUNT_NAU_MATERNITY_CENTER`

8. Value: Paste the entire contents of the downloaded JSON file

9. Click "Add secret"

### Automatic Deployment

After setting up the secret, every push to the `main` branch will automatically:
- Install dependencies
- Build the Next.js application
- Deploy to Firebase Hosting

## Local Development

```bash
cd app
npm install
npm run dev
```

Visit http://localhost:3000 to view the application.

## Environment Variables

Create a `.env.local` file in the `/app` directory with required environment variables.

## Technologies

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma
- **Authentication**: NextAuth.js
- **Deployment**: Firebase Hosting
- **CI/CD**: GitHub Actions
