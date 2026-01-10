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

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    // Find all scheduled or confirmed appointments that are in the past and not checked in
    const missedAppointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { status: 'SCHEDULED' },
          { status: 'CONFIRMED' },
        ],
        checkedIn: false,
        appointmentDate: {
          lt: now,
        },
      },
    })

    // Update them to MISSED status
    const updatePromises = missedAppointments.map((appointment) =>
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'MISSED' },
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      missedCount: missedAppointments.length,
      message: `Marked ${missedAppointments.length} appointments as missed`,
    })
  } catch (error) {
    console.error('Mark missed error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark missed appointments' },
      { status: 500 }
    )
  }
}
