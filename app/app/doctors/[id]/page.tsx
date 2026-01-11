import DoctorDetailsClient from './DoctorDetailsClient'

const PROJECT_ID = 'nau-maternity-center'
const API_KEY = 'AIzaSyD-mNTcfRz7zBZq-SZClnXlfV6iTUuzkb4'

export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/doctors?key=${API_KEY}`,
      { cache: 'no-store' }
    )
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    const documents = Array.isArray(data.documents) ? data.documents : []
    return documents.map((doc: { name: string }) => ({
      id: doc.name.split('/').pop(),
    }))
  } catch (error) {
    console.error('Failed to generate doctor routes:', error)
    return []
  }
}

export default function DoctorDetailsPage({ params }: { params: { id: string } }) {
  return <DoctorDetailsClient doctorId={params.id} />
}
