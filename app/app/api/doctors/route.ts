import { NextRequest, NextResponse } from 'next/server'

// Mock doctors data
const doctors = [
  {
    id: '1',
    name: 'Dr. Aisha Abdullahi',
    qualification: 'MBBS, FWACS',
    specialization: 'prenatal',
    rating: 4.9,
    reviews: 127,
    experience: 15,
    languages: ['English', 'Hausa', 'Yoruba'],
    consultationDuration: 30,
    fee: 15000,
    bio: 'Specialist in high-risk pregnancies with extensive experience in maternal-fetal medicine.',
  },
  {
    id: '2',
    name: 'Dr. Chidi Okonkwo',
    qualification: 'MBBS, MRCOG',
    specialization: 'pediatrics',
    rating: 4.8,
    reviews: 98,
    experience: 12,
    languages: ['English', 'Igbo'],
    consultationDuration: 25,
    fee: 12000,
    bio: 'Passionate pediatrician specializing in newborn care and child development.',
  },
  {
    id: '3',
    name: 'Dr. Fatima Ibrahim',
    qualification: 'MBBS, MD',
    specialization: 'prenatal',
    rating: 4.9,
    reviews: 156,
    experience: 18,
    languages: ['English', 'Hausa'],
    consultationDuration: 30,
    fee: 18000,
    bio: 'Expert neonatologist with special interest in premature infant care.',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get('specialty')

    let filteredDoctors = doctors

    if (specialty) {
      filteredDoctors = doctors.filter(d => d.specialization === specialty)
    }

    return NextResponse.json({
      success: true,
      doctors: filteredDoctors,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}
