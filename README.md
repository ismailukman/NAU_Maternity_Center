# NAU Maternity Center Management System

A comprehensive maternity center management system built with Next.js, Firebase, and Firestore.

🌐 **Live App**: https://nau-maternity-center.web.app/

## 🎯 Features

- ✅ Patient appointment booking system
- ✅ Admin dashboard for managing appointments
- ✅ Doctor profiles and schedules
- ✅ Real-time appointment status updates
- ✅ Secure Firebase Authentication
- ✅ Firestore database with security rules
- ✅ Responsive design with TailwindCSS
- ✅ Automatic deployment to Firebase Hosting

## 🏗️ Architecture

### Pure Firebase Stack
- **Frontend**: Next.js 14 (Static Export)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **CI/CD**: GitHub Actions

No backend server required - all data operations happen client-side using Firebase SDKs.

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/ismailukman/NAU_Maternity_Center.git
cd NAU_Maternity_Center/app
npm install
```

### 2. Set Up Firebase

**📖 See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for complete setup instructions**

Quick steps:
1. Enable Firestore Database in Firebase Console
2. Download service account key
3. Run seed script to create admin user and sample data

```bash
# Run the seed script
node scripts/seed-firebase.js
```

### 3. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Login as Admin

- **URL**: http://localhost:3000/admin/login
- **Email**: `admin@naumaternity.com`
- **Password**: `Main@super54321`

## 📁 Project Structure

```
/app
├── app/                    # Next.js pages
│   ├── admin/             # Admin dashboard & login
│   ├── appointments/      # Appointment booking
│   └── ...                # Other pages
├── components/            # React components
├── lib/
│   ├── firebase-config.ts      # Firebase initialization
│   └── firestore-service.ts    # Database operations
├── scripts/
│   └── seed-firebase.js        # Database seed script
├── firebase.json               # Firebase Hosting config
└── firestore.rules            # Firestore security rules
```

## 🔐 Admin Features

The admin dashboard allows you to:

- View statistics (total appointments, patients, doctors)
- Manage appointments (view, update status, check-in, delete)
- Filter and search appointments
- View doctor schedules
- Track appointment utilization

## 🗄️ Firestore Collections

- `admins` - Admin user profiles
- `doctors` - Doctor profiles and availability
- `appointments` - Patient appointments
- `patients` - Patient records

## 🔒 Security

Firestore security rules ensure:
- Only authenticated admins can manage data
- Patients can create appointments and view their own data
- Doctors are publicly readable
- All writes are properly authenticated

## 🚢 Deployment

### Automatic Deployment

Every push to `main` branch automatically:
1. Builds the Next.js static site
2. Deploys to Firebase Hosting

The GitHub Actions workflow is already configured in `.github/workflows/firebase-deploy.yml`

### Manual Deployment

```bash
cd app
npm run build
firebase deploy --only hosting
```

## 🛠️ Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **CI/CD**: GitHub Actions
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
