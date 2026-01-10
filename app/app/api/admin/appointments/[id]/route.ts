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

// GET single appointment by ID
export async function GET(
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

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                dateOfBirth: true,
                gender: true,
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

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment,
    })
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

// PUT update appointment
export async function PUT(
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

    const body = await request.json()
    const {
      status,
      appointmentDate,
      appointmentTime,
      doctorNotes,
      diagnosis,
      prescription,
      followUpRequired,
      followUpDate,
      cancellationReason,
      checkInTime,
      queueNumber,
    } = body

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) updateData.status = status
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate)
    if (appointmentTime) updateData.appointmentTime = appointmentTime
    if (doctorNotes !== undefined) updateData.doctorNotes = doctorNotes
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis
    if (prescription !== undefined) updateData.prescription = prescription
    if (followUpRequired !== undefined) updateData.followUpRequired = followUpRequired
    if (followUpDate) updateData.followUpDate = new Date(followUpDate)
    if (cancellationReason !== undefined) {
      updateData.cancellationReason = cancellationReason
      updateData.cancelledAt = new Date()
    }
    if (checkInTime) {
      updateData.checkedIn = true
      updateData.checkInTime = new Date(checkInTime)
    }
    if (queueNumber) updateData.queueNumber = queueNumber

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
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
    })

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Appointment updated successfully',
    })
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

// DELETE appointment
export async function DELETE(
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

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
    })
  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
