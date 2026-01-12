/**
 * Assign Oncology and Radiology specialties to random doctors.
 *
 * Usage:
 *   ADMIN_EMAIL="admin@naumaternity.com" ADMIN_PASSWORD="..." node scripts/assign-doctor-specialties.js
 */

const https = require('https')

const PROJECT_ID = 'nau-maternity-center'
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyD-mNTcfRz7zBZq-SZClnXlfV6iTUuzkb4'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables.')
  process.exit(1)
}

const stringField = (value) => ({ stringValue: String(value || '') })
const arrayField = (values) => ({
  arrayValue: {
    values: (values || []).map((item) => stringField(item)),
  },
})

const makeRequest = (options, data) =>
  new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) })
        } catch (error) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })
    req.on('error', reject)
    if (data) req.write(JSON.stringify(data))
    req.end()
  })

const signInWithPassword = async () => {
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/accounts:signInWithPassword?key=${API_KEY}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }

  const payload = {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    returnSecureToken: true,
  }

  const result = await makeRequest(options, payload)
  if (result.status !== 200 || !result.data.idToken) {
    throw new Error(`Failed to sign in: ${JSON.stringify(result.data)}`)
  }
  return result.data.idToken
}

const listDoctors = async (idToken) => {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/doctors`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  }

  const result = await makeRequest(options)
  if (result.status !== 200 || !result.data.documents) {
    return []
  }

  return result.data.documents.map((doc) => {
    const docId = doc.name.split('/').pop()
    const fields = doc.fields || {}
    const name = fields.name?.stringValue || ''
    return { id: docId, name }
  })
}

const updateDoctor = async (idToken, doctorId, specialties) => {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/doctors/${doctorId}?updateMask.fieldPaths=specialties&updateMask.fieldPaths=specialization&updateMask.fieldPaths=specialty`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  }

  const payload = {
    fields: {
      specialties: arrayField(specialties),
      specialization: stringField(specialties[0]),
      specialty: stringField(specialties[0]),
    },
  }

  const result = await makeRequest(options, payload)
  if (result.status !== 200) {
    throw new Error(`Failed to update doctor ${doctorId}: ${JSON.stringify(result.data)}`)
  }
}

const shuffle = (items) => items.sort(() => Math.random() - 0.5)

const run = async () => {
  try {
    console.log('🔐 Signing in...')
    const idToken = await signInWithPassword()
    const doctors = await listDoctors(idToken)
    if (doctors.length === 0) {
      console.log('No doctors found.')
      return
    }

    const shuffled = shuffle([...doctors])
    const oncologyDoctors = shuffled.slice(0, Math.min(2, shuffled.length))
    const radiologyDoctors = shuffled.slice(Math.min(2, shuffled.length), Math.min(4, shuffled.length))

    for (const doctor of oncologyDoctors) {
      await updateDoctor(idToken, doctor.id, ['Oncology', 'General Consultation'])
      console.log(`✅ Assigned Oncology to ${doctor.name || doctor.id}`)
    }

    for (const doctor of radiologyDoctors) {
      await updateDoctor(idToken, doctor.id, ['Radiology', 'General Consultation'])
      console.log(`✅ Assigned Radiology to ${doctor.name || doctor.id}`)
    }

    if (oncologyDoctors.length === 0 && radiologyDoctors.length === 0) {
      console.log('No doctors available for assignment.')
    }
  } catch (error) {
    console.error('❌ Failed to assign specialties:', error.message || error)
    process.exit(1)
  }
}

run()
