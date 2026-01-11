# Firebase Setup Guide

## Prerequisites

Your app is already deployed at: **https://nau-maternity-center.web.app/**

To enable admin login and database operations, follow these one-time setup steps:

## Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/nau-maternity-center/firestore)
2. Click "Create Database"
3. Select "Start in production mode"
4. Choose a location (e.g., `us-central`)
5. Click "Enable"

## Step 2: Get Service Account Key

1. Go to [Project Settings > Service Accounts](https://console.firebase.google.com/u/0/project/nau-maternity-center/settings/serviceaccounts/adminsdk)
2. Click "Generate New Private Key"
3. Click "Generate Key" to download the JSON file
4. Save it as `service-account.json` in the `/app` directory

**⚠️ IMPORTANT**: The `service-account.json` file is already in `.gitignore` and will NOT be committed to GitHub.

## Step 3: Run the Seed Script

This creates the admin user and sample data in Firestore.

```bash
cd app/scripts
npm install
cd ..
node scripts/seed-firebase.js
```

You should see:
```
🌱 Starting Firebase database seed...

Creating admin user in Firebase Authentication...
✅ Admin user created: <uid>

Creating admin document in Firestore...
✅ Admin document created

Seeding doctors...
✅ Created doctor: Dr. Sarah Johnson (ID: ...)
✅ Created doctor: Dr. Michael Chen (ID: ...)
✅ Created doctor: Dr. Emily Williams (ID: ...)

🎉 Database seeded successfully!

📧 Admin Email: admin@naumaternity.com
🔑 Admin Password: Main@super54321

⚠️  IMPORTANT: Change the password after first login!
```

## Step 4: Test Admin Login

1. Go to https://nau-maternity-center.web.app/admin/login
2. Login with:
   - **Email**: `admin@naumaternity.com`
   - **Password**: `Main@super54321`
3. You should be redirected to the admin dashboard

## Step 5: Change Default Password (Recommended)

1. Go to [Firebase Console > Authentication](https://console.firebase.google.com/u/0/project/nau-maternity-center/authentication/users)
2. Find the admin user (`admin@naumaternity.com`)
3. Click the three dots (...) and select "Reset password"
4. Send password reset email or set new password manually

## Admin Features

Once logged in, the admin can:

### Dashboard
- ✅ View statistics (total appointments, patients, doctors)
- ✅ See today's appointments
- ✅ View appointment status breakdown

### Appointment Management
- ✅ View all appointments
- ✅ Filter by status (Pending, Confirmed, Completed, Cancelled)
- ✅ Search appointments by patient name
- ✅ Update appointment status
- ✅ Check-in patients
- ✅ Delete appointments

### Doctor Management
- ✅ View all doctors
- ✅ See doctor schedules for today
- ✅ View appointment utilization rates

### User Management
- Create new admin users (via Firebase Console)
- Manage user permissions

## Firestore Collections

The app uses these Firestore collections:

### `admins`
- Stores admin user profiles
- Linked to Firebase Authentication by UID
- Fields: `email`, `firstName`, `lastName`, `phone`, `role`, `isActive`

### `doctors`
- Doctor profiles
- Fields: `name`, `specialty`, `qualification`, `experience`, `availability`, `bio`

### `appointments`
- Patient appointments
- Fields: `patientName`, `patientEmail`, `patientPhone`, `doctorId`, `doctorName`, `specialty`, `appointmentDate`, `appointmentTime`, `status`, `notes`

### `patients`
- Patient records
- Fields: `name`, `email`, `phone`, `dateOfBirth`, `address`, `emergencyContact`

## Security Rules

Firestore security rules are configured in `/app/firestore.rules`:

- **Admins**: Can read/write all collections
- **Patients**: Can create appointments and read their own data
- **Doctors**: Publicly readable
- **Public**: Can read doctors, can create appointments

## Troubleshooting

### Seed script fails
```bash
# Make sure you're in the app directory
cd app

# Make sure service-account.json exists
ls service-account.json

# Run the seed script
node scripts/seed-firebase.js
```

### Cannot login
1. Check Firebase Console > Authentication to verify the user exists
2. Check Firestore > admins collection to verify the admin document exists
3. Try password reset from Firebase Console

### "Admin account not found" error
The user exists in Firebase Auth but not in the Firestore `admins` collection. Run the seed script again or manually create the admin document in Firestore.

## Next Steps

1. Change the default admin password
2. Create additional admin users if needed
3. Customize the Firestore security rules if needed
4. Add more doctors via the Firebase Console or create a doctor management page

## Clean Up

After seeding, you can optionally delete the service account file (it's already gitignored):
```bash
rm app/service-account.json
```

You can always download it again from Firebase Console if needed.

---

**Your app is now fully configured and ready to use!** 🎉
