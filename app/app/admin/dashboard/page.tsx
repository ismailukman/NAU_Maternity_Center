'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Search,
  Filter,
  LogOut,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  ClipboardCheck,
  Stethoscope,
} from 'lucide-react'
import { toast } from 'sonner'
import { auth, db } from '@/lib/firebase-config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Admin {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface Appointment {
  id: string
  appointmentNumber: string
  appointmentType: string
  appointmentDate: string
  appointmentTime: string
  status: string
  checkedIn: boolean
  checkInTime: string | null
  queueNumber: string | null
  patient: {
    user: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
  }
  doctor: {
    user: {
      firstName: string
      lastName: string
    }
  }
}

interface Stats {
  totalAppointments: number
  todayAppointments: number
  scheduledAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalPatients: number
  totalDoctors: number
}

interface DoctorSchedule {
  doctor: {
    id: string
    name: string
    specialization: string
    workingHours: string
    consultationDuration: number
  }
  appointments: Array<{
    id: string
    appointmentNumber: string
    patientName: string
    time: string
    status: string
    type: string
  }>
  stats: {
    totalSlots: number
    bookedSlots: number
    availableSlots: number
    utilizationRate: string
  }
}

const buildNameParts = (fullName?: string) => {
  if (!fullName) return { firstName: '', lastName: '' }
  const parts = fullName.trim().split(/\s+/)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || '',
  }
}

const normalizeDateValue = (value: any) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  return String(value)
}

const parseWorkingHours = (workingHours: string, durationMinutes: number) => {
  if (!workingHours || !durationMinutes) return 0
  const [startRaw, endRaw] = workingHours.split('-').map((segment) => segment.trim())
  if (!startRaw || !endRaw) return 0

  const parseTime = (value: string) => {
    const trimmed = value.trim().toUpperCase()
    const hasMeridiem = trimmed.includes('AM') || trimmed.includes('PM')
    const normalized = hasMeridiem ? trimmed : `${trimmed} AM`
    const [timePart, meridiem] = normalized.split(/\s+/)
    const [hoursRaw, minutesRaw] = timePart.split(':')
    let hours = Number(hoursRaw)
    const minutes = Number(minutesRaw || '0')
    if (meridiem === 'PM' && hours < 12) hours += 12
    if (meridiem === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  }

  const startMinutes = parseTime(startRaw)
  const endMinutes = parseTime(endRaw)
  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || endMinutes <= startMinutes) return 0
  return Math.floor((endMinutes - startMinutes) / durationMinutes)
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [editStatus, setEditStatus] = useState('')
  const [activeTab, setActiveTab] = useState('appointments')
  const todayString = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login')
        setLoading(false)
        return
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid))
        const adminData = adminDoc.exists() ? adminDoc.data() : null

        if (!adminData) {
          await signOut(auth)
          router.push('/admin/login')
          setLoading(false)
          return
        }

        setAdmin({
          id: user.uid,
          email: adminData.email || user.email || '',
          firstName: adminData.firstName || '',
          lastName: adminData.lastName || '',
          role: adminData.role || 'admin',
        })
      } catch (error) {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!admin) return
    fetchStats()
    fetchAppointments()
    markMissedAppointments()
    fetchDoctorSchedules()
  }, [admin])

  useEffect(() => {
    if (!admin) return
    fetchAppointments()
  }, [currentPage, filterStatus, admin])

  const markMissedAppointments = async () => {
    try {
      const appointmentsQuery = query(collection(db, 'appointments'))
      const snapshot = await getDocs(appointmentsQuery)
      const now = new Date()
      const updates = snapshot.docs
        .map((docSnapshot) => ({ id: docSnapshot.id, data: docSnapshot.data() }))
        .filter(({ data }) => {
          const dateValue = normalizeDateValue(data.appointmentDate)
          if (!dateValue) return false
          const appointmentDate = new Date(dateValue)
          appointmentDate.setHours(0, 0, 0, 0)
          const today = new Date(now)
          today.setHours(0, 0, 0, 0)
          const status = data.status || 'PENDING'
          return appointmentDate < today && !['COMPLETED', 'CANCELLED', 'MISSED'].includes(status)
        })

      await Promise.all(
        updates.map(({ id }) =>
          updateDoc(doc(db, 'appointments', id), { status: 'MISSED' })
        )
      )
    } catch (error) {
      console.error('Failed to update missed appointments:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments')
      const patientsRef = collection(db, 'patients')
      const doctorsRef = collection(db, 'doctors')

      const [
        totalAppointmentsSnap,
        todayAppointmentsSnap,
        scheduledAppointmentsSnap,
        completedAppointmentsSnap,
        cancelledAppointmentsSnap,
        totalPatientsSnap,
        totalDoctorsSnap,
      ] = await Promise.all([
        getCountFromServer(query(appointmentsRef)),
        getCountFromServer(query(appointmentsRef, where('appointmentDate', '==', todayString))),
        getCountFromServer(query(appointmentsRef, where('status', '==', 'SCHEDULED'))),
        getCountFromServer(query(appointmentsRef, where('status', '==', 'COMPLETED'))),
        getCountFromServer(query(appointmentsRef, where('status', '==', 'CANCELLED'))),
        getCountFromServer(query(patientsRef)),
        getCountFromServer(query(doctorsRef)),
      ])

      setStats({
        totalAppointments: totalAppointmentsSnap.data().count,
        todayAppointments: todayAppointmentsSnap.data().count,
        scheduledAppointments: scheduledAppointmentsSnap.data().count,
        completedAppointments: completedAppointmentsSnap.data().count,
        cancelledAppointments: cancelledAppointmentsSnap.data().count,
        totalPatients: totalPatientsSnap.data().count,
        totalDoctors: totalDoctorsSnap.data().count,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments')
      const constraints = []
      if (filterStatus && filterStatus.trim()) {
        constraints.push(where('status', '==', filterStatus.trim()))
      }

      const appointmentsQuery = query(appointmentsRef, ...constraints)
      const snapshot = await getDocs(appointmentsQuery)
      const mapped = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data()
          const patientName = data.patientName || data.patient?.name || ''
          const patientParts = buildNameParts(patientName)
          const doctorName = data.doctorName || data.doctor?.name || ''
          const doctorParts = buildNameParts(doctorName.replace(/^Dr\\.?\\s*/, ''))
          const appointmentDate = normalizeDateValue(data.appointmentDate)
          const appointmentTime = data.appointmentTime || data.timeSlot || ''
          const appointmentType = data.appointmentType || data.specialty || data.service || 'General Consultation'

          return {
            id: docSnapshot.id,
            appointmentNumber: data.appointmentNumber || docSnapshot.id,
            appointmentType,
            appointmentDate,
            appointmentTime,
            status: data.status || 'PENDING',
            checkedIn: Boolean(data.checkedIn),
            checkInTime: data.checkInTime ? normalizeDateValue(data.checkInTime) : null,
            queueNumber: data.queueNumber || null,
            patient: {
              user: {
                firstName: data.patientFirstName || patientParts.firstName,
                lastName: data.patientLastName || patientParts.lastName,
                email: data.patientEmail || data.patient?.email || '',
                phone: data.patientPhone || data.patient?.phone || '',
              },
            },
            doctor: {
              user: {
                firstName: data.doctorFirstName || doctorParts.firstName,
                lastName: data.doctorLastName || doctorParts.lastName,
              },
            },
          } as Appointment
        })
      )

      const searchLower = searchTerm.trim().toLowerCase()
      const filtered = searchLower
        ? mapped.filter((appointment) => {
            const name = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`.toLowerCase()
            return name.includes(searchLower)
          })
        : mapped

      filtered.sort((a, b) => {
        const dateA = new Date(a.appointmentDate).getTime()
        const dateB = new Date(b.appointmentDate).getTime()
        if (dateA !== dateB) return dateA - dateB
        return (a.appointmentTime || '').localeCompare(b.appointmentTime || '')
      })

      const pageSize = 10
      const total = filtered.length
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)))
      const start = (currentPage - 1) * pageSize
      const paged = filtered.slice(start, start + pageSize)
      setAppointments(paged)
    } catch (error) {
      console.error('Failed to load appointments:', error)
    }
  }

  const fetchDoctorSchedules = async () => {
    try {
      const doctorsSnapshot = await getDocs(query(collection(db, 'doctors')))
      const appointmentsSnapshot = await getDocs(
        query(collection(db, 'appointments'), where('appointmentDate', '==', todayString))
      )

      const appointmentsData = appointmentsSnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        data: docSnapshot.data(),
      }))

      const schedules = doctorsSnapshot.docs.map((docSnapshot) => {
        const doctorData = docSnapshot.data()
        const doctorId = docSnapshot.id
        const doctorName = doctorData.name || `${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim()
        const doctorAppointments = appointmentsData.filter(
          (appointment) => appointment.data.doctorId === doctorId
        )

        const appointmentItems = doctorAppointments.map(({ id, data }) => ({
          id,
          appointmentNumber: data.appointmentNumber || id,
          patientName: data.patientName || `${data.patientFirstName || ''} ${data.patientLastName || ''}`.trim(),
          time: data.appointmentTime || data.timeSlot || '',
          status: data.status || 'PENDING',
          type: data.appointmentType || data.specialty || data.service || 'General Consultation',
        }))

        const totalSlots = parseWorkingHours(
          doctorData.workingHours || '09:00 AM - 05:00 PM',
          doctorData.consultationDuration || 30
        )
        const bookedSlots = appointmentItems.length
        const availableSlots = Math.max(totalSlots - bookedSlots, 0)
        const utilizationRate = totalSlots ? Math.round((bookedSlots / totalSlots) * 100) : 0

        return {
          doctor: {
            id: doctorId,
            name: doctorName || `Dr. ${doctorId}`,
            specialization: doctorData.specialization || 'General',
            workingHours: doctorData.workingHours || '09:00 AM - 05:00 PM',
            consultationDuration: doctorData.consultationDuration || 30,
          },
          appointments: appointmentItems,
          stats: {
            totalSlots,
            bookedSlots,
            availableSlots,
            utilizationRate: String(utilizationRate),
          },
        }
      })

      setDoctorSchedules(schedules)
    } catch (error) {
      console.error('Failed to load doctor schedules:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
      router.push('/admin/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchAppointments()
  }

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const todayAppointments = await getCountFromServer(
        query(collection(db, 'appointments'), where('appointmentDate', '==', todayString), where('checkedIn', '==', true))
      )
      const queueNumber = String(todayAppointments.data().count + 1).padStart(3, '0')
      await updateDoc(doc(db, 'appointments', appointmentId), {
        checkedIn: true,
        status: 'CHECKED_IN',
        checkInTime: new Date().toISOString(),
        queueNumber,
      })

      toast.success(`Patient checked in! Queue Number: ${queueNumber}`)
      fetchAppointments()
      fetchStats()
      fetchDoctorSchedules()
    } catch (error) {
      toast.error('An error occurred during check-in')
    }
  }

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return

    try {
      await updateDoc(doc(db, 'appointments', selectedAppointment.id), {
        status: editStatus,
        checkedIn: editStatus === 'CHECKED_IN' ? true : selectedAppointment.checkedIn,
      })

      toast.success('Appointment updated successfully')
      setShowEditDialog(false)
      fetchAppointments()
      fetchStats()
      fetchDoctorSchedules()
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      await deleteDoc(doc(db, 'appointments', id))
      toast.success('Appointment deleted successfully')
      fetchAppointments()
      fetchStats()
      fetchDoctorSchedules()
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      SCHEDULED: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock },
      CONFIRMED: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      CHECKED_IN: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: UserCheck },
      COMPLETED: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
      MISSED: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle },
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertCircle },
    }

    const variant = variants[status] || variants.PENDING
    const Icon = variant.icon

    return (
      <Badge className={`${variant.color} border flex items-center gap-1 text-xs`}>
        <Icon className="h-3 w-3" />
        <span className="hidden sm:inline">{status}</span>
      </Badge>
    )
  }

  const canCheckIn = (appointment: Appointment) => {
    if (appointment.checkedIn) return false
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED' || appointment.status === 'MISSED') return false

    const appointmentDate = new Date(appointment.appointmentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return appointmentDate >= today
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-maternal-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-maternal-lighter/10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md border border-maternal-light/40">
                <div className="relative w-7 h-7 sm:w-9 sm:h-9">
                  <Image
                    src="/logo.png"
                    alt="Natasha Akpoti-Uduaghan Maternity Centre Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">NAU Maternity Centre Management</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs text-gray-600">{admin?.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-2 border-maternal-primary text-maternal-primary hover:bg-maternal-lighter text-sm sm:text-base px-3 sm:px-4"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Appointments',
              value: stats?.totalAppointments || 0,
              icon: Calendar,
              color: 'from-blue-500 to-blue-600',
            },
            {
              title: "Today's Appointments",
              value: stats?.todayAppointments || 0,
              icon: Activity,
              color: 'from-maternal-primary to-pink-600',
            },
            {
              title: 'Total Patients',
              value: stats?.totalPatients || 0,
              icon: Users,
              color: 'from-maternal-secondary to-purple-600',
            },
            {
              title: 'Scheduled',
              value: stats?.scheduledAppointments || 0,
              icon: TrendingUp,
              color: 'from-green-500 to-green-600',
            },
          ].map((stat, index) => (
            <Card key={index} className="border-2 border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="appointments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <ClipboardCheck className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Appointments</span>
              <span className="xs:hidden">Appts</span>
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Doctor Schedules</span>
              <span className="xs:hidden">Doctors</span>
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">Appointments Management</CardTitle>
                    <CardDescription className="text-sm">View, check-in, edit, and manage all appointments</CardDescription>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10 text-sm sm:text-base"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-40 text-sm sm:text-base">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">All Status</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="MISSED">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} className="maternal-gradient text-sm sm:text-base">
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-2 sm:p-6">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-2 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">Appointment #</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">Patient</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">Doctor</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">Date & Time</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">Queue</th>
                        <th className="text-right p-2 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-2 sm:p-4">
                            <span className="font-mono text-xs sm:text-sm font-semibold text-maternal-primary">
                              {appointment.appointmentNumber}
                            </span>
                          </td>
                          <td className="p-2 sm:p-4">
                            <div>
                              <p className="font-medium text-gray-900 text-xs sm:text-base">
                                {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">{appointment.patient.user.phone}</p>
                            </div>
                          </td>
                          <td className="p-2 sm:p-4">
                            <p className="text-gray-900 text-xs sm:text-base">
                              Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                            </p>
                          </td>
                          <td className="p-2 sm:p-4">
                            <div>
                              <p className="text-gray-900 text-xs sm:text-base">
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">{appointment.appointmentTime}</p>
                            </div>
                          </td>
                          <td className="p-2 sm:p-4">{getStatusBadge(appointment.status)}</td>
                          <td className="p-2 sm:p-4">
                            {appointment.queueNumber && (
                              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 border font-mono text-xs">
                                {appointment.queueNumber}
                              </Badge>
                            )}
                          </td>
                          <td className="p-2 sm:p-4">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              {canCheckIn(appointment) && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 sm:px-3"
                                  onClick={() => handleCheckIn(appointment.id)}
                                >
                                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Check In</span>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-2 sm:px-3"
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setShowViewDialog(true)
                                }}
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 px-2 sm:px-3"
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setEditStatus(appointment.status)
                                  setShowEditDialog(true)
                                }}
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 px-2 sm:px-3"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {appointments.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No appointments found</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="maternal-gradient"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctor Schedules Tab */}
          <TabsContent value="doctors">
            <div className="space-y-4">
              <Card className="border-2 border-gray-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Doctor Schedules for Today</CardTitle>
                  <CardDescription>View doctor availability and appointments to avoid scheduling conflicts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctorSchedules.map((schedule) => (
                      <Card key={schedule.doctor.id} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{schedule.doctor.name}</CardTitle>
                              <CardDescription>
                                {schedule.doctor.specialization} • {schedule.doctor.workingHours}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="flex gap-2 items-center">
                                <Badge className="bg-green-100 text-green-800 border-green-300 border">
                                  {schedule.stats.availableSlots} Slots Available
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300 border">
                                  {schedule.stats.utilizationRate}% Utilized
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {schedule.appointments.length > 0 ? (
                            <div className="space-y-2">
                              {schedule.appointments.map((apt) => (
                                <div
                                  key={apt.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-4">
                                    <span className="font-mono text-sm font-semibold text-maternal-primary">
                                      {apt.time}
                                    </span>
                                    <span className="text-gray-900">{apt.patientName}</span>
                                    <span className="text-sm text-gray-600">{apt.type}</span>
                                  </div>
                                  {getStatusBadge(apt.status)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">No appointments scheduled</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {doctorSchedules.length === 0 && (
                      <div className="text-center py-12">
                        <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No doctors available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the status of appointment {selectedAppointment?.appointmentNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status">Appointment Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="MISSED">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowEditDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateAppointment} className="flex-1 maternal-gradient">
                Update Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Full details for appointment {selectedAppointment?.appointmentNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Patient Name</Label>
                  <p className="font-medium">
                    {selectedAppointment.patient.user.firstName} {selectedAppointment.patient.user.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Contact</Label>
                  <p className="font-medium">{selectedAppointment.patient.user.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Doctor</Label>
                  <p className="font-medium">
                    Dr. {selectedAppointment.doctor.user.firstName} {selectedAppointment.doctor.user.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Appointment Type</Label>
                  <p className="font-medium">{selectedAppointment.appointmentType}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Date</Label>
                  <p className="font-medium">
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Time</Label>
                  <p className="font-medium">{selectedAppointment.appointmentTime}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                </div>
                {selectedAppointment.checkedIn && (
                  <>
                    <div>
                      <Label className="text-gray-600">Check-In Time</Label>
                      <p className="font-medium">
                        {selectedAppointment.checkInTime
                          ? new Date(selectedAppointment.checkInTime).toLocaleTimeString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Queue Number</Label>
                      <p className="font-medium font-mono">{selectedAppointment.queueNumber || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
