import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In production, this would save to the database
    // For now, we'll just return a success response with a mock appointment

    const appointment = {
      id: `APT-${Date.now()}`,
      appointmentNumber: `MAT-2026-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      ...body,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Appointment booked successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to book appointment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock appointments data
    const appointments = [
      {
        id: '1',
        appointmentNumber: 'MAT-2026-0001',
        patientName: 'Sarah Johnson',
        doctorName: 'Dr. Aisha Abdullahi',
        appointmentType: 'Prenatal Checkup',
        appointmentDate: '2026-01-15',
        appointmentTime: '10:00 AM',
        status: 'CONFIRMED',
      },
      {
        id: '2',
        appointmentNumber: 'MAT-2026-0002',
        patientName: 'Sarah Johnson',
        doctorName: 'Dr. Fatima Ibrahim',
        appointmentType: 'Ultrasound',
        appointmentDate: '2026-01-22',
        appointmentTime: '02:30 PM',
        status: 'SCHEDULED',
      },
    ]

    return NextResponse.json({
      success: true,
      appointments,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
