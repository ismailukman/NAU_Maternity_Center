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

// GET all appointments with filters
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const patientName = searchParams.get('patientName')
    const doctorId = searchParams.get('doctorId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (doctorId) {
      where.doctorId = doctorId
    }

    if (dateFrom || dateTo) {
      where.appointmentDate = {}
      if (dateFrom) {
        where.appointmentDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.appointmentDate.lte = new Date(dateTo)
      }
    }

    if (patientName) {
      where.patient = {
        OR: [
          { user: { firstName: { contains: patientName, mode: 'insensitive' } } },
          { user: { lastName: { contains: patientName, mode: 'insensitive' } } },
        ],
      }
    }

    // Get appointments with pagination
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
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
        orderBy: {
          appointmentDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
