/**
 * Firebase Seed Script (Using REST API)
 *
 * This script uses Firebase REST API with your CLI authentication
 * No service account JSON file needed!
 */

const https = require('https');
const { execSync } = require('child_process');

const PROJECT_ID = 'nau-maternity-center';

// Get access token from Firebase CLI
function getAccessToken() {
  try {
    const output = execSync('firebase login:ci', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    // Extract token from output
    const match = output.match(/[\w-]+\.[\w-]+\.[\w-]+/);
    if (match) return match[0];

    // Try alternative method
    const tokenOutput = execSync('firebase --token', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return tokenOutput.trim();
  } catch (error) {
    // If that fails, try getting it from config
    try {
      const configPath = require('os').homedir() + '/.config/firebase';
      const fs = require('fs');
      if (fs.existsSync(configPath)) {
        // Firebase stores tokens differently, let's try another approach
        console.log('Using Firebase CLI authentication...');
        return null;
      }
    } catch (e) {
      console.error('Failed to get access token:', error.message);
      return null;
    }
  }
}

// Make HTTPS request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createAdminViaFirebase() {
  console.log('🌱 Starting Firebase database seed via REST API...\n');

  // Use Firebase Auth REST API (doesn't need authentication for user creation in dev)
  const WEB_API_KEY = 'AIzaSyD-mNTcfRz7zBZq-SZClnXlfV6iTUuzkb4';

  try {
    console.log('Step 1: Creating admin user in Firebase Authentication...');

    // Create user via Firebase Auth REST API
    const createUserOptions = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signUp?key=${WEB_API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const userData = {
      email: 'admin@naumaternity.com',
      password: 'Main@super54321',
      returnSecureToken: true
    };

    const createResult = await makeRequest(createUserOptions, userData);

    let idToken, localId;
    if (createResult.status === 200) {
      console.log('✅ Admin user created!');
      idToken = createResult.data.idToken;
      localId = createResult.data.localId;
    } else if (createResult.data.error?.message?.includes('EMAIL_EXISTS')) {
      console.log('ℹ️  Admin user already exists, logging in...');

      // Sign in to get token
      const signInOptions = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      const signInResult = await makeRequest(signInOptions, {
        email: 'admin@naumaternity.com',
        password: 'Main@super54321',
        returnSecureToken: true
      });

      if (signInResult.status === 200) {
        idToken = signInResult.data.idToken;
        localId = signInResult.data.localId;
        console.log('✅ Admin user authenticated');
      } else {
        throw new Error('Failed to authenticate existing user');
      }
    } else {
      throw new Error(`Failed to create user: ${JSON.stringify(createResult.data)}`);
    }

    console.log('\nStep 2: Adding admin to Firestore...');

    // Add admin document to Firestore
    const firestoreOptions = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/admins/${localId}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    };

    const adminDoc = {
      fields: {
        email: { stringValue: 'admin@naumaternity.com' },
        firstName: { stringValue: 'Super' },
        lastName: { stringValue: 'Admin' },
        phone: { stringValue: '+234 900 000 0000' },
        role: { stringValue: 'admin' },
        isActive: { booleanValue: true },
        createdAt: { timestampValue: new Date().toISOString() },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    };

    const adminResult = await makeRequest(firestoreOptions, adminDoc);
    if (adminResult.status === 200 || adminResult.status === 201) {
      console.log('✅ Admin document created in Firestore');
    } else {
      console.log('⚠️  Admin document may already exist');
    }

    console.log('\nStep 3: Adding sample doctors...');

    const doctors = [
      {
        name: 'Dr. Avidime Otaru',
        specialization: 'Prenatal Care',
        qualification: 'MBBS, FWACS',
        experience: '14 years',
        availability: ['Monday', 'Wednesday', 'Friday'],
        consultationDuration: 30,
        workingHours: '09:00 AM - 04:30 PM',
        rating: 4.9,
        reviews: 120,
        fee: 18000,
        languages: ['English', 'Igala'],
        bio: 'Focused on prenatal care and maternal wellness with a calm, patient-first approach.'
      },
      {
        name: 'Prof. Dr. Onimisi Okene',
        specialization: 'Postnatal Care',
        qualification: 'MBBS, FMCOG',
        experience: '22 years',
        availability: ['Tuesday', 'Thursday'],
        consultationDuration: 40,
        workingHours: '10:00 AM - 05:00 PM',
        rating: 4.8,
        reviews: 210,
        fee: 22000,
        languages: ['English', 'Igala', 'Hausa'],
        bio: 'Specialist in postnatal recovery and maternal health education.'
      },
      {
        name: 'Dr. Oyiza Hadiza Enehezyi',
        specialization: 'Pediatrics',
        qualification: 'MBBS, MRCPCH',
        experience: '11 years',
        availability: ['Monday', 'Tuesday', 'Saturday'],
        consultationDuration: 25,
        workingHours: '09:00 AM - 03:00 PM',
        rating: 4.7,
        reviews: 98,
        fee: 15000,
        languages: ['English', 'Hausa'],
        bio: 'Dedicated pediatrician with experience in newborn and infant care.'
      },
      {
        name: 'Dr. Aisha Abdullahi',
        specialization: 'Prenatal Care',
        qualification: 'MBBS, FWACS',
        experience: '15 years',
        availability: ['Monday', 'Thursday'],
        consultationDuration: 30,
        workingHours: '09:30 AM - 04:00 PM',
        rating: 4.9,
        reviews: 140,
        fee: 17000,
        languages: ['English', 'Hausa', 'Yoruba'],
        bio: 'High-risk pregnancy specialist offering personalized prenatal plans.'
      },
      {
        name: 'Dr. Chidi Okonkwo',
        specialization: 'Pediatrics',
        qualification: 'MBBS, MRCOG',
        experience: '12 years',
        availability: ['Wednesday', 'Friday'],
        consultationDuration: 25,
        workingHours: '10:00 AM - 04:00 PM',
        rating: 4.8,
        reviews: 95,
        fee: 14000,
        languages: ['English', 'Igbo'],
        bio: 'Passionate about pediatric wellness and developmental care.'
      },
      {
        name: 'Dr. Fatima Ibrahim',
        specialization: 'Prenatal Care',
        qualification: 'MBBS, MD',
        experience: '18 years',
        availability: ['Tuesday', 'Thursday', 'Saturday'],
        consultationDuration: 30,
        workingHours: '09:00 AM - 05:30 PM',
        rating: 4.9,
        reviews: 160,
        fee: 20000,
        languages: ['English', 'Hausa'],
        bio: 'Maternal-fetal medicine expert with a focus on patient education.'
      },
      {
        name: 'Dr. Ngozi Eze',
        specialization: 'Ultrasound',
        qualification: 'MBBS, FRCOG',
        experience: '10 years',
        availability: ['Monday', 'Wednesday'],
        consultationDuration: 20,
        workingHours: '08:30 AM - 02:30 PM',
        rating: 4.7,
        reviews: 88,
        fee: 13000,
        languages: ['English', 'Igbo', 'Yoruba'],
        bio: 'Diagnostic imaging specialist with experience in obstetric ultrasound.'
      },
      {
        name: 'Dr. Blessing Adebayo',
        specialization: 'Postnatal Care',
        qualification: 'RN, IBCLC',
        experience: '9 years',
        availability: ['Tuesday', 'Friday'],
        consultationDuration: 35,
        workingHours: '10:30 AM - 05:00 PM',
        rating: 5.0,
        reviews: 70,
        fee: 16000,
        languages: ['English', 'Yoruba'],
        bio: 'Postnatal support and lactation consultant focused on mother-baby bonding.'
      },
      {
        name: 'Dr. Halima Musa',
        specialization: 'General Consultation',
        qualification: 'MBBS',
        experience: '8 years',
        availability: ['Monday', 'Thursday'],
        consultationDuration: 20,
        workingHours: '09:00 AM - 03:30 PM',
        rating: 4.6,
        reviews: 64,
        fee: 12000,
        languages: ['English', 'Hausa'],
        bio: 'General consultation and maternal wellness check-ups.'
      },
      {
        name: 'Dr. Gabriel Afolayan',
        specialization: 'Vaccination',
        qualification: 'MBBS, MPH',
        experience: '7 years',
        availability: ['Wednesday', 'Saturday'],
        consultationDuration: 20,
        workingHours: '10:00 AM - 02:00 PM',
        rating: 4.6,
        reviews: 55,
        fee: 11000,
        languages: ['English', 'Yoruba'],
        bio: 'Specialist in maternal and infant immunization schedules.'
      }
    ];

    for (const doctor of doctors) {
      const docOptions = {
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/doctors`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      };

      const doctorDoc = {
        fields: {
          name: { stringValue: doctor.name },
          specialization: { stringValue: doctor.specialization },
          specialty: { stringValue: doctor.specialization },
          qualification: { stringValue: doctor.qualification },
          experience: { stringValue: doctor.experience },
          availability: { arrayValue: { values: doctor.availability.map(d => ({ stringValue: d })) } },
          bio: { stringValue: doctor.bio },
          consultationDuration: { integerValue: String(doctor.consultationDuration) },
          workingHours: { stringValue: doctor.workingHours },
          rating: { doubleValue: doctor.rating },
          reviews: { integerValue: String(doctor.reviews) },
          fee: { integerValue: String(doctor.fee) },
          languages: { arrayValue: { values: doctor.languages.map(lang => ({ stringValue: lang })) } },
          createdAt: { timestampValue: new Date().toISOString() }
        }
      };

      const result = await makeRequest(docOptions, doctorDoc);
      if (result.status === 200 || result.status === 201) {
        console.log('✅ Created doctor:', doctor.name);
      } else {
        console.log('⚠️  Failed to create doctor:', doctor.name);
      }
    }

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Admin Email: admin@naumaternity.com');
    console.log('🔑 Admin Password: Main@super54321');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');
    console.log('🌐 Admin Login: https://nau-maternity-center.web.app/admin/login\n');

  } catch (error) {
    console.error('\n❌ Seed error:', error.message);
    process.exit(1);
  }
}

// Run
createAdminViaFirebase();
