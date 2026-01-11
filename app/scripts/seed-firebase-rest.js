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
        name: 'Dr. Sarah Johnson',
        specialty: 'Obstetrician',
        qualification: 'MD, FRCOG',
        experience: '15 years',
        availability: ['Monday', 'Wednesday', 'Friday'],
        bio: 'Specialized in high-risk pregnancies and prenatal care.'
      },
      {
        name: 'Dr. Michael Chen',
        specialty: 'Pediatrician',
        qualification: 'MD, FAAP',
        experience: '12 years',
        availability: ['Tuesday', 'Thursday', 'Saturday'],
        bio: 'Expert in newborn care and childhood development.'
      },
      {
        name: 'Dr. Emily Williams',
        specialty: 'Gynecologist',
        qualification: 'MD, FACOG',
        experience: '10 years',
        availability: ['Monday', 'Tuesday', 'Thursday'],
        bio: 'Focused on women\'s reproductive health and wellness.'
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
          specialty: { stringValue: doctor.specialty },
          qualification: { stringValue: doctor.qualification },
          experience: { stringValue: doctor.experience },
          availability: { arrayValue: { values: doctor.availability.map(d => ({ stringValue: d })) } },
          bio: { stringValue: doctor.bio },
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
