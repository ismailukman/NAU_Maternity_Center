/**
 * Adds OB/GYN doctors with Ebira background to Firestore.
 *
 * Usage:
 *   ADMIN_EMAIL="admin@naumaternity.com" ADMIN_PASSWORD="..." node scripts/add-obgyn-doctors.js
 */

const https = require('https');

const PROJECT_ID = 'nau-maternity-center';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyD-mNTcfRz7zBZq-SZClnXlfV6iTUuzkb4';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables.');
  process.exit(1);
}

const stringField = (value) => ({ stringValue: String(value || '') });
const intField = (value) => ({ integerValue: String(Number(value) || 0) });
const arrayField = (values) => ({
  arrayValue: {
    values: (values || []).map((item) => stringField(item)),
  },
});

const makeRequest = (options, data) =>
  new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });

const signInWithPassword = async () => {
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/accounts:signInWithPassword?key=${API_KEY}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };

  const payload = {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    returnSecureToken: true,
  };

  const result = await makeRequest(options, payload);
  if (result.status !== 200 || !result.data.idToken) {
    throw new Error(`Failed to sign in: ${JSON.stringify(result.data)}`);
  }
  return result.data.idToken;
};

const listDoctors = async (idToken) => {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/doctors`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  };

  const result = await makeRequest(options);
  if (result.status !== 200 || !result.data.documents) {
    return [];
  }

  return result.data.documents.map((doc) => {
    const fields = doc.fields || {};
    return (fields.name && fields.name.stringValue) || '';
  });
};

const createDoctor = async (idToken, fields) => {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/doctors`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  };

  const result = await makeRequest(options, { fields });
  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`Failed to create doctor: ${JSON.stringify(result.data)}`);
  }
  return result.data.name ? result.data.name.split('/').pop() : '';
};

const buildDoctorFields = (doctor) => ({
  name: stringField(doctor.name),
  specialization: stringField(doctor.specialization),
  specialty: stringField(doctor.specialization),
  specialties: arrayField(doctor.specialties),
  qualification: stringField(doctor.qualification),
  experience: stringField(doctor.experience),
  consultationDuration: intField(doctor.consultationDuration),
  workingHours: stringField(doctor.workingHours),
  fee: intField(doctor.fee),
  languages: arrayField(doctor.languages),
  bio: stringField(doctor.bio),
  email: stringField(doctor.email),
  phone: stringField(doctor.phone),
  gender: stringField(doctor.gender),
  availability: arrayField(doctor.availability),
  bookedSlots: arrayField([]),
  createdAt: { timestampValue: new Date().toISOString() },
});

const doctors = [
  {
    name: 'Dr. Amina Ehize',
    specialization: 'Obstetrics & Gynecology',
    specialties: ['Obstetrics & Gynecology'],
    qualification: 'MBBS, FMCOG',
    experience: '11 years',
    consultationDuration: 30,
    workingHours: '09:00 AM - 04:00 PM',
    fee: 20000,
    languages: ['Ebira', 'English', 'Hausa'],
    bio: 'Focuses on maternal-fetal medicine and comprehensive prenatal care.',
    email: 'amina.ehize@naumaternity.com',
    phone: '+234 801 555 1201',
    availability: ['Monday', 'Wednesday', 'Friday'],
    gender: 'Female',
  },
  {
    name: 'Dr. Rahimah Ozovehe',
    specialization: 'Obstetrics & Gynecology',
    specialties: ['Obstetrics & Gynecology'],
    qualification: 'MBBS, FWACS',
    experience: '9 years',
    consultationDuration: 30,
    workingHours: '10:00 AM - 05:00 PM',
    fee: 18000,
    languages: ['Ebira', 'English'],
    bio: 'Specializes in reproductive health and postnatal recovery programs.',
    email: 'rahimah.ozovehe@naumaternity.com',
    phone: '+234 801 555 1202',
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    gender: 'Female',
  },
  {
    name: 'Dr. Idris Attah',
    specialization: 'Obstetrics & Gynecology',
    specialties: ['Obstetrics & Gynecology'],
    qualification: 'MBBS, FMCOG',
    experience: '14 years',
    consultationDuration: 30,
    workingHours: '08:30 AM - 04:30 PM',
    fee: 22000,
    languages: ['Ebira', 'English'],
    bio: 'Experienced in high-risk pregnancy management and surgical gynecology.',
    email: 'idris.attah@naumaternity.com',
    phone: '+234 801 555 1203',
    availability: ['Monday', 'Tuesday', 'Thursday'],
    gender: 'Male',
  },
  {
    name: 'Dr. Samuel Edeh',
    specialization: 'Obstetrics & Gynecology',
    specialties: ['Obstetrics & Gynecology'],
    qualification: 'MBBS, FWACS',
    experience: '8 years',
    consultationDuration: 30,
    workingHours: '11:00 AM - 06:00 PM',
    fee: 17500,
    languages: ['Ebira', 'English', 'Yoruba'],
    bio: 'Provides comprehensive OB/GYN care with focus on patient education.',
    email: 'samuel.edeh@naumaternity.com',
    phone: '+234 801 555 1204',
    availability: ['Wednesday', 'Friday', 'Saturday'],
    gender: 'Male',
  },
];

const run = async () => {
  try {
    console.log('🔐 Signing in...');
    const idToken = await signInWithPassword();
    console.log('✅ Signed in.');

    const existingNames = await listDoctors(idToken);
    const existingSet = new Set(existingNames.map((name) => name.toLowerCase()));

    let created = 0;
    for (const doctor of doctors) {
      if (existingSet.has(doctor.name.toLowerCase())) {
        console.log(`ℹ️  Skipping existing doctor: ${doctor.name}`);
        continue;
      }
      const docId = await createDoctor(idToken, buildDoctorFields(doctor));
      console.log(`✅ Created doctor: ${doctor.name} (ID: ${docId})`);
      created += 1;
    }

    if (created === 0) {
      console.log('ℹ️  No new doctors were added.');
    }
  } catch (error) {
    console.error('❌ Failed to add doctors:', error.message || error);
    process.exit(1);
  }
};

run();
