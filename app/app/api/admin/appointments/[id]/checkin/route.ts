import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const token = cookies().get('admin_token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Get the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (appointment.checkedIn) {
      return NextResponse.json(
        { success: false, error: 'Patient already checked in' },
        { status: 400 }
      )
    }

    // Check if appointment is today
    const appointmentDate = new Date(appointment.appointmentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (appointmentDate < today) {
      return NextResponse.json(
        { success: false, error: 'Cannot check in for past appointments' },
        { status: 400 }
      )
    }

    // Generate queue number
    const todayCheckIns = await prisma.appointment.count({
      where: {
        checkedIn: true,
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    const queueNumber = `Q${String(todayCheckIns + 1).padStart(3, '0')}`

    // Update appointment as checked in
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        checkedIn: true,
        checkInTime: new Date(),
        queueNumber,
        status: 'CHECKED_IN',
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      queueNumber,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check in patient' },
      { status: 500 }
    )
  }
}
