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

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // Format: YYYY-MM-DD

    let targetDate: Date
    if (date) {
      targetDate = new Date(date)
    } else {
      targetDate = new Date()
    }
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Get all doctors
    const doctors = await prisma.doctor.findMany({
      where: {
        isAcceptingPatients: true,
        isOnLeave: false,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    })

    // Get appointments for each doctor on the target date
    const doctorSchedules = await Promise.all(
      doctors.map(async (doctor) => {
        const appointments = await prisma.appointment.findMany({
          where: {
            doctorId: doctor.id,
            appointmentDate: {
              gte: targetDate,
              lt: nextDay,
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'],
            },
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
          },
          orderBy: {
            appointmentTime: 'asc',
          },
        })

        // Calculate available slots
        const totalSlots = calculateTotalSlots(doctor.workingHours)
        const bookedSlots = appointments.length
        const availableSlots = totalSlots - bookedSlots

        return {
          doctor: {
            id: doctor.id,
            name: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
            specialization: doctor.specialization,
            workingHours: doctor.workingHours,
            consultationDuration: doctor.consultationDuration,
          },
          appointments: appointments.map((apt) => ({
            id: apt.id,
            appointmentNumber: apt.appointmentNumber,
            patientName: `${apt.patient.user.firstName} ${apt.patient.user.lastName}`,
            time: apt.appointmentTime,
            status: apt.status,
            type: apt.appointmentType,
          })),
          stats: {
            totalSlots,
            bookedSlots,
            availableSlots,
            utilizationRate: totalSlots > 0 ? ((bookedSlots / totalSlots) * 100).toFixed(1) : '0',
          },
        }
      })
    )

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString(),
      schedules: doctorSchedules,
    })
  } catch (error) {
    console.error('Get doctor schedule error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctor schedules' },
      { status: 500 }
    )
  }
}

// Helper function to calculate total slots based on working hours
function calculateTotalSlots(workingHours: string): number {
  try {
    // Expecting format like "09:00-17:00" or "9:00 AM - 5:00 PM"
    const hourMatch = workingHours.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?\s*-\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i)

    if (!hourMatch) {
      // Default to 8 hours if format is not recognized
      return 16 // 8 hours * 2 slots per hour (30 min each)
    }

    let startHour = parseInt(hourMatch[1])
    const startMin = hourMatch[2] ? parseInt(hourMatch[2]) : 0
    let endHour = parseInt(hourMatch[4])
    const endMin = hourMatch[5] ? parseInt(hourMatch[5]) : 0

    // Convert to 24-hour format if AM/PM is specified
    if (hourMatch[3] && hourMatch[3].toUpperCase() === 'PM' && startHour !== 12) {
      startHour += 12
    }
    if (hourMatch[6] && hourMatch[6].toUpperCase() === 'PM' && endHour !== 12) {
      endHour += 12
    }

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const totalMinutes = endMinutes - startMinutes

    // Assuming 30-minute consultation slots
    return Math.floor(totalMinutes / 30)
  } catch (error) {
    return 16 // Default to 8 hours
  }
}
