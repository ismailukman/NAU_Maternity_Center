/**
 * Firebase Seed Script
 *
 * This script creates the initial admin user and sample data in Firestore.
 * Run once to set up your Firebase database.
 *
 * Usage: node scripts/seed-firebase.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'nau-maternity-center'
});

const auth = admin.auth();
const db = admin.firestore();

async function seedDatabase() {
  console.log('🌱 Starting Firebase database seed...\n');

  try {
    // 1. Create Admin User in Firebase Auth
    console.log('Creating admin user in Firebase Authentication...');
    let adminUser;
    try {
      adminUser = await auth.createUser({
        email: 'admin@naumaternity.com',
        password: 'Main@super54321',
        displayName: 'Super Admin',
        emailVerified: true
      });
      console.log('✅ Admin user created:', adminUser.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('ℹ️  Admin user already exists, fetching...');
        adminUser = await auth.getUserByEmail('admin@naumaternity.com');
        console.log('✅ Admin user found:', adminUser.uid);
      } else {
        throw error;
      }
    }

    // 2. Add Admin to Firestore admins collection
    console.log('\nCreating admin document in Firestore...');
    await db.collection('admins').doc(adminUser.uid).set({
      email: 'admin@naumaternity.com',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+234 900 000 0000',
      role: 'admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Admin document created');

    // 3. Seed Doctors
    console.log('\nSeeding doctors...');
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialty: 'Obstetrician',
        qualification: 'MD, FRCOG',
        experience: '15 years',
        image: '/doctors/sarah.jpg',
        availability: ['Monday', 'Wednesday', 'Friday'],
        bio: 'Specialized in high-risk pregnancies and prenatal care.',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Dr. Michael Chen',
        specialty: 'Pediatrician',
        qualification: 'MD, FAAP',
        experience: '12 years',
        image: '/doctors/michael.jpg',
        availability: ['Tuesday', 'Thursday', 'Saturday'],
        bio: 'Expert in newborn care and childhood development.',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Dr. Emily Williams',
        specialty: 'Gynecologist',
        qualification: 'MD, FACOG',
        experience: '10 years',
        image: '/doctors/emily.jpg',
        availability: ['Monday', 'Tuesday', 'Thursday'],
        bio: 'Focused on women\'s reproductive health and wellness.',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const doctor of doctors) {
      const docRef = await db.collection('doctors').add(doctor);
      console.log('✅ Created doctor:', doctor.name, '(ID:', docRef.id + ')');
    }

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Admin Email: admin@naumaternity.com');
    console.log('🔑 Admin Password: Main@super54321');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seed
seedDatabase();
