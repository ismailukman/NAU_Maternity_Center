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

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get statistics
    const [
      totalAppointments,
      todayAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPatients,
      totalDoctors,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.appointment.count({
        where: { status: 'SCHEDULED' },
      }),
      prisma.appointment.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.appointment.count({
        where: { status: 'CANCELLED' },
      }),
      prisma.patient.count(),
      prisma.doctor.count(),
    ])

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    // Get appointment status distribution
    const statusDistribution = await prisma.appointment.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalAppointments,
        todayAppointments,
        scheduledAppointments,
        completedAppointments,
        cancelledAppointments,
        totalPatients,
        totalDoctors,
      },
      recentAppointments,
      statusDistribution,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
