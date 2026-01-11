'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { auth, db } from '@/lib/firebase-config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  arrayUnion,
  arrayRemove,
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
  patientId?: string
  patient: {
    user: {
      firstName: string
      lastName: string
      email: string
      phone: string
      gender?: string
    }
  }
  doctorId?: string
  doctor: {
    user: {
      firstName: string
      lastName: string
      gender?: string
    }
  }
  checkedOutTime?: string | null
  reasonForVisit?: string
  symptoms?: string
  timeWithDoctor?: string
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

interface DoctorProfile {
  id: string
  name: string
  specialization: string
  specialties: string[]
  qualification: string
  experience: string
  consultationDuration: number
  workingHours: string
  fee: number
  languages: string[]
  bio: string
  email: string
  phone: string
  availability?: string[]
  bookedSlots?: string[]
  gender?: string
}

interface PatientProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender?: string
  dateOfBirth?: string
  address?: string
}

const stripDoctorPrefix = (name: string) =>
  name.replace(/^prof\.?\s*dr\.?\s*/i, '').replace(/^dr\.?\s*/i, '').trim()

const formatDoctorName = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) return ''
  if (/^prof\.?\s*dr\.?\s*/i.test(trimmed)) return trimmed.replace(/\s+/g, ' ')
  if (/^dr\.?\s*/i.test(trimmed)) return trimmed.replace(/\s+/g, ' ')
  return `Dr. ${trimmed}`
}

const buildNameParts = (fullName?: string) => {
  if (!fullName) return { firstName: '', lastName: '' }
  const parts = stripDoctorPrefix(fullName).split(/\s+/)
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

const toDateKey = (value: any) => {
  const normalized = normalizeDateValue(value)
  if (!normalized) return ''
  return normalized.includes('T') ? normalized.split('T')[0] : normalized
}

const buildAppointmentPatientName = (data: Record<string, any>) => {
  if (data.patientName) return String(data.patientName)
  if (data.patient?.name) return String(data.patient.name)
  if (data.patient?.user?.firstName || data.patient?.user?.lastName) {
    return `${data.patient.user.firstName || ''} ${data.patient.user.lastName || ''}`.trim()
  }
  const firstName = data.patientFirstName || ''
  const lastName = data.patientLastName || ''
  return `${firstName} ${lastName}`.trim()
}

const parseSpecialties = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const buildAppointmentSpecialties = (value: string | string[]) => {
  const base = parseSpecialties(value)
  const withGeneral = base.includes('General Consultation')
    ? base
    : ['General Consultation', ...base]
  return Array.from(new Set(withGeneral))
}

const parseLanguages = (value: string | string[]) =>
  (Array.isArray(value) ? value : String(value || '').split(','))
    .map((item) => String(item).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

const parseTimeToMinutes = (value: string) => {
  const trimmed = value.trim().toUpperCase()
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = Number(match[2] || '0')
  const meridiem = match[3]
  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

const parseTimeInput = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const upper = trimmed.toUpperCase()
  const ampmMatch = upper.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)
  if (ampmMatch) {
    const hoursRaw = Number(ampmMatch[1])
    const minutes = Number(ampmMatch[2] || '0')
    const meridiem = ampmMatch[3]
    const hours12 = hoursRaw % 12 || 12
    const label = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiem}`
    const minutesValue = parseTimeToMinutes(label)
    if (minutesValue === null) return null
    return { minutes: minutesValue, label }
  }
  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (twentyFourMatch) {
    const hours = Number(twentyFourMatch[1])
    const minutes = Number(twentyFourMatch[2])
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
    const totalMinutes = hours * 60 + minutes
    const meridiem = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    const label = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiem}`
    return { minutes: totalMinutes, label }
  }
  return null
}

const parseWorkingRange = (value: string) => {
  const [startRaw, endRaw] = value.split('-').map((part) => part.trim())
  if (!startRaw || !endRaw) return null
  const start = parseTimeToMinutes(startRaw)
  const end = parseTimeToMinutes(endRaw)
  if (start === null || end === null) return null
  return { start, end }
}

const formatTimeLabel = (totalMinutes: number) => {
  const hours24 = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiem}`
}

const buildTimeSlots = (workingHours: string, durationMinutes: number) => {
  const range = parseWorkingRange(workingHours)
  if (!range || !durationMinutes) return []
  const slots: string[] = []
  for (let minutes = range.start; minutes <= range.end; minutes += durationMinutes) {
    slots.push(formatTimeLabel(minutes))
  }
  return slots
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

const formatDuration = (diffMs: number) => {
  const totalSeconds = Math.max(Math.floor(diffMs / 1000), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${hours}H:${pad(minutes)}M:${pad(seconds)}s`
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [liveAppointments, setLiveAppointments] = useState<Appointment[]>([])
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([])
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [editStatus, setEditStatus] = useState('')
  const [editAvailableTimes, setEditAvailableTimes] = useState<string[]>([])
  const [editSpecialties, setEditSpecialties] = useState<string[]>([])
  const [editAppointmentForm, setEditAppointmentForm] = useState({
    appointmentId: '',
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    reasonForVisit: '',
    symptoms: '',
    status: '',
  })
  const [activeTab, setActiveTab] = useState('appointments')
  const [now, setNow] = useState<number>(() => Date.now())
  const [showDoctorDialog, setShowDoctorDialog] = useState(false)
  const [showPatientDialog, setShowPatientDialog] = useState(false)
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [appointmentSpecialties, setAppointmentSpecialties] = useState<string[]>([])
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null)
  const [editingPatient, setEditingPatient] = useState<PatientProfile | null>(null)
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationDuration: 30,
    workingHours: '09:00 AM - 05:00 PM',
    fee: 15000,
    languages: '',
    bio: '',
    email: '',
    phone: '',
    gender: '',
  })
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
  })
  const [appointmentForm, setAppointmentForm] = useState({
    patientType: 'existing',
    patientId: '',
    patientFirstName: '',
    patientLastName: '',
    patientEmail: '',
    patientPhone: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    reasonForVisit: '',
    symptoms: '',
  })
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
    fetchDoctorsList()
    fetchPatientsList()
  }, [admin])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!admin) return
    const liveQuery = query(
      collection(db, 'appointments'),
      where('status', '==', 'CHECKED_IN')
    )
    const unsubscribe = onSnapshot(liveQuery, (snapshot) => {
      const mapped = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data()
        const patientParts = buildNameParts(data.patientName || '')
        const doctorParts = buildNameParts(
          String(data.doctorName || '').replace(/^Dr\\.?\\s*/, '')
        )
        return {
          id: docSnapshot.id,
          appointmentNumber: data.appointmentNumber || docSnapshot.id,
          appointmentType: data.appointmentType || data.specialty || 'General Consultation',
          appointmentDate: normalizeDateValue(data.appointmentDate),
          appointmentTime: data.appointmentTime || data.timeSlot || '',
          status: data.status || 'CHECKED_IN',
          checkedIn: true,
          checkInTime: data.checkInTime ? normalizeDateValue(data.checkInTime) : null,
          checkedOutTime: data.checkedOutTime ? normalizeDateValue(data.checkedOutTime) : null,
          queueNumber: data.queueNumber || null,
          patientId: data.patientId || '',
          patient: {
            user: {
              firstName: data.patientFirstName || patientParts.firstName,
              lastName: data.patientLastName || patientParts.lastName,
              email: data.patientEmail || '',
              phone: data.patientPhone || '',
              gender: data.patientGender || '',
            },
          },
          doctorId: data.doctorId || '',
          doctor: {
            user: {
              firstName: data.doctorFirstName || doctorParts.firstName,
              lastName: data.doctorLastName || doctorParts.lastName,
              gender: data.doctorGender || '',
            },
          },
          reasonForVisit: data.reasonForVisit || '',
          symptoms: data.symptoms || '',
          timeWithDoctor: data.timeWithDoctor || '',
        } as Appointment
      })
      setLiveAppointments(mapped)
    })
    return () => unsubscribe()
  }, [admin])

  useEffect(() => {
    const loadAvailability = async () => {
      if (!showAppointmentDialog) return
      if (!appointmentForm.doctorId || !appointmentForm.appointmentDate) {
        setAvailableTimes([])
        return
      }

      try {
        const doctorDoc = await getDoc(doc(db, 'doctors', appointmentForm.doctorId))
        const doctorData = doctorDoc.exists() ? doctorDoc.data() : {}
        const workingHours = String(doctorData?.workingHours || '09:00 AM - 05:00 PM')
        const consultationDuration = Number(doctorData?.consultationDuration || 30)
        const availability = Array.isArray(doctorData?.availability) ? doctorData.availability : []
        const bookedSlots = Array.isArray(doctorData?.bookedSlots) ? doctorData.bookedSlots : []

        const appointmentDay = new Date(appointmentForm.appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
        if (
          availability.length > 0 &&
          !availability.some((day: string) => day.toLowerCase() === appointmentDay.toLowerCase())
        ) {
          setAvailableTimes([])
          return
        }

        const allSlots = buildTimeSlots(workingHours, consultationDuration)
        const datePrefix = `${appointmentForm.appointmentDate}|`
        const blocked = new Set(
          bookedSlots
            .filter((slot: string) => slot.startsWith(datePrefix))
            .map((slot: string) => slot.slice(datePrefix.length))
        )

        const appointmentsSnapshot = await getDocs(
          query(
            collection(db, 'appointments'),
            where('appointmentDate', '==', appointmentForm.appointmentDate),
            where('doctorId', '==', appointmentForm.doctorId)
          )
        )
        appointmentsSnapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data()
          const time = String(data.appointmentTime || data.timeSlot || '').trim()
          if (time) blocked.add(time)
        })

        const available = allSlots.filter((slot) => !blocked.has(slot))
        setAvailableTimes(available)
        if (available.length > 0 && !available.includes(appointmentForm.appointmentTime)) {
          setAppointmentForm((prev) => ({ ...prev, appointmentTime: '' }))
        }
      } catch (error) {
        console.error('Failed to load available times:', error)
        setAvailableTimes([])
      }
    }

    loadAvailability()
  }, [appointmentForm.appointmentDate, appointmentForm.doctorId, showAppointmentDialog])

  useEffect(() => {
    const loadEditAvailability = async () => {
      if (!showEditDialog) return
      if (!editAppointmentForm.doctorId || !editAppointmentForm.appointmentDate) {
        setEditAvailableTimes([])
        return
      }

      try {
        const doctorDoc = await getDoc(doc(db, 'doctors', editAppointmentForm.doctorId))
        const doctorData = doctorDoc.exists() ? doctorDoc.data() : {}
        const workingHours = String(doctorData?.workingHours || '09:00 AM - 05:00 PM')
        const consultationDuration = Number(doctorData?.consultationDuration || 30)
        const availability = Array.isArray(doctorData?.availability) ? doctorData.availability : []
        const bookedSlots = Array.isArray(doctorData?.bookedSlots) ? doctorData.bookedSlots : []

        const appointmentDay = new Date(editAppointmentForm.appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
        if (
          availability.length > 0 &&
          !availability.some((day: string) => day.toLowerCase() === appointmentDay.toLowerCase())
        ) {
          setEditAvailableTimes([])
          return
        }

        const allSlots = buildTimeSlots(workingHours, consultationDuration)
        const datePrefix = `${editAppointmentForm.appointmentDate}|`
        const blocked = new Set(
          bookedSlots
            .filter((slot: string) => slot.startsWith(datePrefix))
            .map((slot: string) => slot.slice(datePrefix.length))
        )

        const appointmentsSnapshot = await getDocs(
          query(
            collection(db, 'appointments'),
            where('appointmentDate', '==', editAppointmentForm.appointmentDate),
            where('doctorId', '==', editAppointmentForm.doctorId)
          )
        )
        appointmentsSnapshot.docs.forEach((docSnapshot) => {
          if (docSnapshot.id === editAppointmentForm.appointmentId) return
          const data = docSnapshot.data()
          const time = String(data.appointmentTime || data.timeSlot || '').trim()
          if (time) blocked.add(time)
        })

        const available = allSlots.filter((slot) =>
          slot === editAppointmentForm.appointmentTime || !blocked.has(slot)
        )
        const sorted = available.sort((a, b) => {
          const aMinutes = parseTimeToMinutes(a) ?? 0
          const bMinutes = parseTimeToMinutes(b) ?? 0
          return aMinutes - bMinutes
        })
        setEditAvailableTimes(sorted)
      } catch (error) {
        console.error('Failed to load edit availability:', error)
        setEditAvailableTimes([])
      }
    }

    loadEditAvailability()
  }, [editAppointmentForm.appointmentDate, editAppointmentForm.doctorId, editAppointmentForm.appointmentId, showEditDialog])

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
          updateDoc(doc(db, 'appointments', id), { status: 'MISSED', checkedIn: false, timeWithDoctor: '0H:00M:00s' })
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
          const doctorName = stripDoctorPrefix(String(data.doctorName || data.doctor?.name || ''))
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
            checkedOutTime: data.checkedOutTime ? normalizeDateValue(data.checkedOutTime) : null,
            queueNumber: data.queueNumber || null,
            patientId: data.patientId || '',
            patient: {
              user: {
                firstName: data.patientFirstName || patientParts.firstName,
                lastName: data.patientLastName || patientParts.lastName,
                email: data.patientEmail || data.patient?.email || '',
                phone: data.patientPhone || data.patient?.phone || '',
                gender: data.patientGender || data.patient?.gender || '',
              },
            },
            doctorId: data.doctorId || '',
            doctor: {
              user: {
                firstName: data.doctorFirstName || doctorParts.firstName,
                lastName: data.doctorLastName || doctorParts.lastName,
                gender: data.doctorGender || '',
              },
            },
            reasonForVisit: data.reasonForVisit || '',
            symptoms: data.symptoms || '',
            timeWithDoctor: data.timeWithDoctor || '',
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
      const appointmentsSnapshot = await getDocs(query(collection(db, 'appointments')))

      const appointmentsData = appointmentsSnapshot.docs
        .map((docSnapshot) => ({
          id: docSnapshot.id,
          data: docSnapshot.data(),
        }))
        .filter(({ data }) => toDateKey(data.appointmentDate) === todayString)

      const schedules = doctorsSnapshot.docs.map((docSnapshot) => {
        const doctorData = docSnapshot.data()
        const doctorId = docSnapshot.id
        const rawDoctorName = String(
          doctorData.name || `${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim()
        ).trim()
        const doctorAppointments = appointmentsData.filter(
          (appointment) => appointment.data.doctorId === doctorId
        )

        const appointmentItems = doctorAppointments
          .map(({ id, data }) => ({
            id,
            appointmentNumber: data.appointmentNumber || id,
            patientName: buildAppointmentPatientName(data),
            time: data.appointmentTime || data.timeSlot || '',
            status: data.status || 'PENDING',
            type: data.appointmentType || data.specialty || data.service || 'General Consultation',
          }))
          .sort((a, b) => (a.time || '').localeCompare(b.time || ''))

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
            name: rawDoctorName ? formatDoctorName(rawDoctorName) : `Dr. ${doctorId}`,
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

  const fetchDoctorsList = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'doctors')))
      const mapped = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data()
        const specializationValue = data.specialization || data.specialty || ''
        const specialties = parseSpecialties(data.specialties || specializationValue)
        return {
          id: docSnapshot.id,
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          specialization: specializationValue,
          specialties,
          qualification: data.qualification || '',
          experience: data.experience || '',
          consultationDuration: data.consultationDuration || 30,
          workingHours: data.workingHours || '09:00 AM - 05:00 PM',
          fee: data.fee || 15000,
          languages: parseLanguages(data.languages || []),
          bio: data.bio || '',
          email: data.email || '',
          phone: data.phone || '',
          availability: Array.isArray(data.availability) ? data.availability : [],
          bookedSlots: Array.isArray(data.bookedSlots) ? data.bookedSlots : [],
          gender: data.gender || '',
        } as DoctorProfile
      })
      setDoctors(mapped)
    } catch (error) {
      console.error('Failed to load doctors:', error)
    }
  }

  const fetchPatientsList = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'patients')))
      const mapped = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data()
        return {
          id: docSnapshot.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth || '',
          address: data.address || '',
        } as PatientProfile
      })
      setPatients(mapped)
    } catch (error) {
      console.error('Failed to load patients:', error)
    }
  }

  const resetAppointmentForm = () => {
    setAppointmentForm({
      patientType: 'existing',
      patientId: '',
      patientFirstName: '',
      patientLastName: '',
      patientEmail: '',
      patientPhone: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentType: '',
      reasonForVisit: '',
      symptoms: '',
    })
    setAvailableTimes([])
    setAppointmentSpecialties([])
  }

  const openAddAppointment = () => {
    resetAppointmentForm()
    setShowAppointmentDialog(true)
  }

  const openEditAppointment = (appointment: Appointment) => {
    const doctorName = formatDoctorName(
      `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
    )
    const matchedDoctor = appointment.doctorId
      ? doctors.find((doctor) => doctor.id === appointment.doctorId)
      : doctors.find((doctor) => formatDoctorName(doctor.name) === doctorName)

    const matchedPatient = appointment.patientId
      ? patients.find((patient) => patient.id === appointment.patientId)
      : patients.find((patient) => {
          if (appointment.patient.user.email && patient.email) {
            return appointment.patient.user.email === patient.email
          }
          if (appointment.patient.user.phone && patient.phone) {
            return appointment.patient.user.phone === patient.phone
          }
          return false
        })

    const specialties = matchedDoctor?.specialties?.length
      ? buildAppointmentSpecialties(matchedDoctor.specialties)
      : buildAppointmentSpecialties(matchedDoctor?.specialization || '')

    setEditSpecialties(specialties)
    setEditAppointmentForm({
      appointmentId: appointment.id,
      patientId: matchedPatient?.id || appointment.patientId || '',
      doctorId: matchedDoctor?.id || appointment.doctorId || '',
      appointmentDate: appointment.appointmentDate || '',
      appointmentTime: appointment.appointmentTime || '',
      appointmentType: appointment.appointmentType || specialties[0] || 'General Consultation',
      reasonForVisit: appointment.reasonForVisit || '',
      symptoms: appointment.symptoms || '',
      status: appointment.status || 'SCHEDULED',
    })
    setEditStatus(appointment.status || 'SCHEDULED')
    setSelectedAppointment(appointment)
    setShowEditDialog(true)
  }

  const openAddDoctor = () => {
    setEditingDoctor(null)
    setDoctorForm({
      name: '',
      specialization: '',
      qualification: '',
      experience: '',
      consultationDuration: 30,
      workingHours: '09:00 AM - 05:00 PM',
      fee: 15000,
      languages: '',
      bio: '',
      email: '',
      phone: '',
      gender: '',
    })
    setShowDoctorDialog(true)
  }

  const openEditDoctor = (doctor: DoctorProfile) => {
    setEditingDoctor(doctor)
    setDoctorForm({
      name: doctor.name,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      consultationDuration: doctor.consultationDuration,
      workingHours: doctor.workingHours,
      fee: doctor.fee,
      languages: doctor.languages.join(', '),
      bio: doctor.bio,
      email: doctor.email,
      phone: doctor.phone,
      gender: doctor.gender || '',
    })
    setShowDoctorDialog(true)
  }

  const handleSaveDoctor = async () => {
    try {
      const payload = {
        name: doctorForm.name.trim(),
        specialization: doctorForm.specialization.trim(),
        specialty: doctorForm.specialization.trim(),
        specialties: parseSpecialties(doctorForm.specialization),
        qualification: doctorForm.qualification.trim(),
        experience: doctorForm.experience.trim(),
        consultationDuration: Number(doctorForm.consultationDuration) || 30,
        workingHours: doctorForm.workingHours.trim(),
        fee: Number(doctorForm.fee) || 0,
        languages: parseLanguages(doctorForm.languages),
        bio: doctorForm.bio.trim(),
        email: doctorForm.email.trim(),
        phone: doctorForm.phone.trim(),
        gender: doctorForm.gender.trim(),
      }

      if (editingDoctor) {
        await updateDoc(doc(db, 'doctors', editingDoctor.id), payload)
        toast.success('Doctor updated successfully')
      } else {
        await addDoc(collection(db, 'doctors'), payload)
        toast.success('Doctor created successfully')
      }
      setShowDoctorDialog(false)
      fetchDoctorsList()
      fetchDoctorSchedules()
    } catch (error) {
      toast.error('Unable to save doctor')
    }
  }

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return
    try {
      await deleteDoc(doc(db, 'doctors', doctorId))
      toast.success('Doctor deleted')
      fetchDoctorsList()
      fetchDoctorSchedules()
    } catch (error) {
      toast.error('Unable to delete doctor')
    }
  }

  const openAddPatient = () => {
    setEditingPatient(null)
    setPatientForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      address: '',
    })
    setShowPatientDialog(true)
  }

  const openEditPatient = (patient: PatientProfile) => {
    setEditingPatient(patient)
    setPatientForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender || '',
      dateOfBirth: patient.dateOfBirth || '',
      address: patient.address || '',
    })
    setShowPatientDialog(true)
  }

  const handleSavePatient = async () => {
    try {
      const payload = {
        firstName: patientForm.firstName.trim(),
        lastName: patientForm.lastName.trim(),
        email: patientForm.email.trim(),
        phone: patientForm.phone.trim(),
        gender: patientForm.gender.trim(),
        dateOfBirth: patientForm.dateOfBirth.trim(),
        address: patientForm.address.trim(),
      }

      if (editingPatient) {
        await updateDoc(doc(db, 'patients', editingPatient.id), payload)
        toast.success('Patient updated successfully')
      } else {
        await addDoc(collection(db, 'patients'), payload)
        toast.success('Patient created successfully')
      }
      setShowPatientDialog(false)
      fetchPatientsList()
      fetchStats()
    } catch (error) {
      toast.error('Unable to save patient')
    }
  }

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    try {
      await deleteDoc(doc(db, 'patients', patientId))
      toast.success('Patient deleted')
      fetchPatientsList()
      fetchStats()
    } catch (error) {
      toast.error('Unable to delete patient')
    }
  }

  const handleCreateAppointment = async () => {
    const appointmentDate = appointmentForm.appointmentDate.trim()
    const appointmentTime = appointmentForm.appointmentTime.trim()
    if (!appointmentForm.doctorId) {
      toast.error('Please select a doctor.')
      return
    }
    if (!appointmentDate) {
      toast.error('Please select a date.')
      return
    }
    if (!appointmentTime) {
      toast.error('Please select a time.')
      return
    }
    if (appointmentForm.patientType === 'existing' && !appointmentForm.patientId) {
      toast.error('Please select an existing patient.')
      return
    }
    if (appointmentForm.patientType === 'new') {
      if (!appointmentForm.patientFirstName.trim() || !appointmentForm.patientLastName.trim() || !appointmentForm.patientPhone.trim()) {
        toast.error('Please enter the new patient details.')
        return
      }
    }

    if (!appointmentForm.reasonForVisit.trim()) {
      toast.error('Please enter a reason for visit.')
      return
    }

    const selectedDoctor = doctors.find((doctor) => doctor.id === appointmentForm.doctorId)
    if (!selectedDoctor) {
      toast.error('Selected doctor is not available.')
      return
    }

    const timeInfo = parseTimeInput(appointmentTime)
    if (!timeInfo) {
      toast.error('Please use a valid time (e.g., 09:00 AM).')
      return
    }

    try {
      const doctorDoc = await getDoc(doc(db, 'doctors', selectedDoctor.id))
      const doctorData = doctorDoc.exists() ? doctorDoc.data() : {}
      const workingHours = String(doctorData?.workingHours || selectedDoctor.workingHours || '09:00 AM - 05:00 PM')
      const availability = Array.isArray(doctorData?.availability) ? doctorData.availability : []
      const workingRange = parseWorkingRange(workingHours)
      if (!workingRange) {
        toast.error('Doctor working hours are not configured.')
        return
      }

      const appointmentDay = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
      if (
        availability.length > 0 &&
        !availability.some((day: string) => day.toLowerCase() === appointmentDay.toLowerCase())
      ) {
        toast.error(`Doctor is not available on ${appointmentDay}.`)
        return
      }

      if (timeInfo.minutes < workingRange.start || timeInfo.minutes > workingRange.end) {
        toast.error('Selected time is outside doctor working hours.')
        return
      }

      const dateSnapshot = await getDocs(
        query(collection(db, 'appointments'), where('appointmentDate', '==', appointmentDate))
      )

      const timeConflicts = dateSnapshot.docs
        .map((docSnapshot) => docSnapshot.data())
        .filter((appointment) => {
          const apptTime = String(appointment.appointmentTime || appointment.timeSlot || '').trim()
          if (!apptTime) return false
          const apptMinutes = parseTimeToMinutes(apptTime)
          if (apptMinutes !== null) {
            return apptMinutes === timeInfo.minutes
          }
          return apptTime === timeInfo.label
        })

      const doctorConflict = timeConflicts.some(
        (appointment) => appointment.doctorId === selectedDoctor.id
      )
      if (doctorConflict) {
        toast.error('This time slot is already booked for the selected doctor.')
        return
      }

      let patientId = ''
      let patientFirstName = ''
      let patientLastName = ''
      let patientEmail = ''
      let patientPhone = ''

      if (appointmentForm.patientType === 'existing') {
        const patient = patients.find((item) => item.id === appointmentForm.patientId)
        if (!patient) {
          toast.error('Selected patient was not found.')
          return
        }
        patientId = patient.id
        patientFirstName = patient.firstName
        patientLastName = patient.lastName
        patientEmail = patient.email
        patientPhone = patient.phone
      } else {
        patientFirstName = appointmentForm.patientFirstName.trim()
        patientLastName = appointmentForm.patientLastName.trim()
        patientEmail = appointmentForm.patientEmail.trim()
        patientPhone = appointmentForm.patientPhone.trim()

        let existingPatientId = ''
        if (patientEmail) {
          const existingPatientQuery = query(
            collection(db, 'patients'),
            where('email', '==', patientEmail)
          )
          const patientSnapshot = await getDocs(existingPatientQuery)
          if (!patientSnapshot.empty) {
            existingPatientId = patientSnapshot.docs[0].id
          }
        }

        if (!existingPatientId && patientPhone) {
          const existingPatientQuery = query(
            collection(db, 'patients'),
            where('phone', '==', patientPhone)
          )
          const patientSnapshot = await getDocs(existingPatientQuery)
          if (!patientSnapshot.empty) {
            existingPatientId = patientSnapshot.docs[0].id
          }
        }

        if (existingPatientId) {
          patientId = existingPatientId
        } else {
          const patientRef = await addDoc(collection(db, 'patients'), {
            firstName: patientFirstName,
            lastName: patientLastName,
            email: patientEmail,
            phone: patientPhone,
            createdAt: serverTimestamp(),
          })
          patientId = patientRef.id
        }
      }

      const patientConflict = timeConflicts.some((appointment) => {
        if (patientId && appointment.patientId) {
          return appointment.patientId === patientId
        }
        if (patientEmail && appointment.patientEmail) {
          return appointment.patientEmail === patientEmail
        }
        return patientPhone && appointment.patientPhone === patientPhone
      })
      if (patientConflict) {
        toast.error('This patient already has an appointment at this time.')
        return
      }

      const appointmentNumber = `APT-${appointmentDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
      const appointmentType = appointmentForm.appointmentType.trim() || selectedDoctor.specialization || 'General Consultation'
      const patientName = `${patientFirstName} ${patientLastName}`.trim()

      await addDoc(collection(db, 'appointments'), {
        appointmentNumber,
        appointmentType,
        appointmentDate,
        appointmentTime: timeInfo.label,
        status: 'SCHEDULED',
        checkedIn: false,
        queueNumber: null,
        patientId,
        patientName,
        patientFirstName,
        patientLastName,
        patientEmail,
        patientPhone,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialization,
        reasonForVisit: appointmentForm.reasonForVisit.trim(),
        symptoms: appointmentForm.symptoms.trim(),
        createdAt: serverTimestamp(),
      })

      await updateDoc(doc(db, 'doctors', selectedDoctor.id), {
        bookedSlots: arrayUnion(`${appointmentDate}|${timeInfo.label}`),
      })

      toast.success('Appointment created successfully')
      setShowAppointmentDialog(false)
      resetAppointmentForm()
      fetchAppointments()
      fetchDoctorSchedules()
      fetchStats()
      fetchPatientsList()
    } catch (error) {
      console.error('Failed to create appointment:', error)
      toast.error('Unable to create appointment. Please try again.')
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
      const appointmentSnap = await getDoc(doc(db, 'appointments', appointmentId))
      const appointmentData = appointmentSnap.exists() ? appointmentSnap.data() : null
      const patientFirst = String(
        appointmentData?.patientFirstName || appointmentData?.patient?.firstName || ''
      ).trim()
      const patientLast = String(
        appointmentData?.patientLastName || appointmentData?.patient?.lastName || ''
      ).trim()
      const patientInitials = `${patientFirst.charAt(0) || 'P'}${patientLast.charAt(0) || 'X'}`.toUpperCase()

      const queueNumber = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'queueCounters', todayString)
        const counterSnap = await transaction.get(counterRef)
        const current = counterSnap.exists() ? Number(counterSnap.data()?.lastNumber || 0) : 0
        const next = current + 1
        transaction.set(counterRef, { lastNumber: next, updatedAt: serverTimestamp() }, { merge: true })
        return `${patientInitials}${String(next).padStart(3, '0')}`
      })

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
    const appointmentDate = editAppointmentForm.appointmentDate.trim()
    const appointmentTime = editAppointmentForm.appointmentTime.trim()
    if (!editAppointmentForm.doctorId) {
      toast.error('Please select a doctor.')
      return
    }
    if (!editAppointmentForm.patientId) {
      toast.error('Please select a patient.')
      return
    }
    if (!appointmentDate) {
      toast.error('Please select a date.')
      return
    }
    if (!appointmentTime) {
      toast.error('Please select a time.')
      return
    }
    if (!editAppointmentForm.reasonForVisit.trim()) {
      toast.error('Please enter a reason for visit.')
      return
    }

    const selectedDoctor = doctors.find((doctor) => doctor.id === editAppointmentForm.doctorId)
    if (!selectedDoctor) {
      toast.error('Selected doctor is not available.')
      return
    }
    const selectedPatient = patients.find((patient) => patient.id === editAppointmentForm.patientId)
    if (!selectedPatient) {
      toast.error('Selected patient was not found.')
      return
    }

    const timeInfo = parseTimeInput(appointmentTime)
    if (!timeInfo) {
      toast.error('Please use a valid time (e.g., 09:00 AM).')
      return
    }

    try {
      const doctorDoc = await getDoc(doc(db, 'doctors', selectedDoctor.id))
      const doctorData = doctorDoc.exists() ? doctorDoc.data() : {}
      const workingHours = String(doctorData?.workingHours || selectedDoctor.workingHours || '09:00 AM - 05:00 PM')
      const availability = Array.isArray(doctorData?.availability) ? doctorData.availability : []
      const workingRange = parseWorkingRange(workingHours)
      if (!workingRange) {
        toast.error('Doctor working hours are not configured.')
        return
      }

      const appointmentDay = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
      if (
        availability.length > 0 &&
        !availability.some((day: string) => day.toLowerCase() === appointmentDay.toLowerCase())
      ) {
        toast.error(`Doctor is not available on ${appointmentDay}.`)
        return
      }

      if (timeInfo.minutes < workingRange.start || timeInfo.minutes > workingRange.end) {
        toast.error('Selected time is outside doctor working hours.')
        return
      }

      const dateSnapshot = await getDocs(
        query(
          collection(db, 'appointments'),
          where('appointmentDate', '==', appointmentDate),
          where('doctorId', '==', selectedDoctor.id)
        )
      )

      const timeConflicts = dateSnapshot.docs
        .filter((docSnapshot) => docSnapshot.id !== selectedAppointment.id)
        .map((docSnapshot) => docSnapshot.data())
        .filter((appointment) => {
          const time = String(appointment.appointmentTime || appointment.timeSlot || '').trim()
          if (!time) return false
          const minutes = parseTimeToMinutes(time)
          if (minutes !== null) {
            return minutes === timeInfo.minutes
          }
          return time === timeInfo.label
        })

      const doctorConflict = timeConflicts.some(
        (appointment) => appointment.doctorId === selectedDoctor.id
      )
      if (doctorConflict) {
        toast.error('This time slot is already booked for the selected doctor.')
        return
      }

      const patientConflict = timeConflicts.some((appointment) => {
        if (selectedPatient.id && appointment.patientId) {
          return appointment.patientId === selectedPatient.id
        }
        if (selectedPatient.email && appointment.patientEmail) {
          return appointment.patientEmail === selectedPatient.email
        }
        return selectedPatient.phone && appointment.patientPhone === selectedPatient.phone
      })
      if (patientConflict) {
        toast.error('This patient already has an appointment at this time.')
        return
      }

      const doctorNameParts = buildNameParts(selectedDoctor.name)
      const updates: Record<string, any> = {
        appointmentType: editAppointmentForm.appointmentType.trim() || selectedDoctor.specialization || 'General Consultation',
        appointmentDate,
        appointmentTime: timeInfo.label,
        status: editStatus,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorFirstName: doctorNameParts.firstName,
        doctorLastName: doctorNameParts.lastName,
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`.trim(),
        patientFirstName: selectedPatient.firstName,
        patientLastName: selectedPatient.lastName,
        patientEmail: selectedPatient.email,
        patientPhone: selectedPatient.phone,
        reasonForVisit: editAppointmentForm.reasonForVisit.trim(),
        symptoms: editAppointmentForm.symptoms.trim(),
      }

      if (editStatus === 'CHECKED_IN') {
        updates.checkedIn = true
        if (!selectedAppointment.checkInTime) {
          updates.checkInTime = new Date().toISOString()
        }
      } else {
        updates.checkedIn = false
      }

      if (editStatus === 'COMPLETED') {
        const startTime = (selectedAppointment.checkInTime || updates.checkInTime)
          ? new Date(selectedAppointment.checkInTime || updates.checkInTime).getTime()
          : null
        updates.checkedOutTime = new Date().toISOString()
        updates.checkedIn = false
        updates.timeWithDoctor = startTime ? formatDuration(Date.now() - startTime) : '0H:00M:00s'
      }

      if (editStatus === 'CANCELLED' || editStatus === 'MISSED') {
        updates.checkedIn = false
        updates.timeWithDoctor = '0H:00M:00s'
      }

      const hasPreviousSlot = Boolean(selectedAppointment.appointmentDate && selectedAppointment.appointmentTime)
      const previousSlot = hasPreviousSlot
        ? `${selectedAppointment.appointmentDate}|${selectedAppointment.appointmentTime}`
        : ''
      const nextSlot = `${appointmentDate}|${timeInfo.label}`
      if (
        hasPreviousSlot &&
        selectedAppointment.doctorId &&
        (selectedAppointment.doctorId !== selectedDoctor.id || previousSlot !== nextSlot)
      ) {
        await updateDoc(doc(db, 'doctors', selectedAppointment.doctorId), {
          bookedSlots: arrayRemove(previousSlot),
        })
      }

      if (!selectedAppointment.doctorId || selectedAppointment.doctorId !== selectedDoctor.id || previousSlot !== nextSlot) {
        await updateDoc(doc(db, 'doctors', selectedDoctor.id), {
          bookedSlots: arrayUnion(nextSlot),
        })
      }

      await updateDoc(doc(db, 'appointments', selectedAppointment.id), updates)

      toast.success('Appointment updated successfully')
      setShowEditDialog(false)
      fetchAppointments()
      fetchStats()
      fetchDoctorSchedules()
    } catch (error) {
      console.error('Failed to update appointment:', error)
      const message = error instanceof Error ? error.message : 'An error occurred'
      toast.error(message)
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

  const handlePrintAppointment = (appointment: Appointment) => {
    const dateLabel = appointment.appointmentDate
      ? new Date(appointment.appointmentDate).toLocaleDateString()
      : ''
    const doctorName = formatDoctorName(
      `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
    )
    const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`.trim()

    const printWindow = window.open('', '_blank', 'width=720,height=600')
    if (!printWindow) {
      toast.error('Unable to open print window')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Appointment Card</title>
          <style>
            body { font-family: "Times New Roman", Times, serif; margin: 24px; color: #111; }
            .card { border: 2px solid #d1d5db; border-radius: 12px; padding: 24px; max-width: 520px; margin: 0 auto; }
            h1 { font-size: 20px; margin: 0 0 8px; }
            .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 16px; }
            .row { display: flex; justify-content: space-between; gap: 16px; margin: 8px 0; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
            .value { font-size: 14px; font-weight: 600; }
            .footer { margin-top: 16px; font-size: 11px; color: #6b7280; text-align: center; }
            @media print { body { margin: 0; } .card { border: none; border-radius: 0; } }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Appointment Card</h1>
            <div class="subtitle">Natasha Akpoti-Uduaghan Maternity Centre</div>
            <div class="row">
              <div>
                <div class="label">Appointment #</div>
                <div class="value">${appointment.appointmentNumber}</div>
              </div>
              <div>
                <div class="label">Status</div>
                <div class="value">${appointment.status}</div>
              </div>
            </div>
            <div class="row">
              <div>
                <div class="label">Patient</div>
                <div class="value">${patientName}</div>
              </div>
              <div>
                <div class="label">Doctor</div>
                <div class="value">${doctorName}</div>
              </div>
            </div>
            <div class="row">
              <div>
                <div class="label">Date</div>
                <div class="value">${dateLabel}</div>
              </div>
              <div>
                <div class="label">Time</div>
                <div class="value">${appointment.appointmentTime || ''}</div>
              </div>
            </div>
            <div class="row">
              <div>
                <div class="label">Type</div>
                <div class="value">${appointment.appointmentType}</div>
              </div>
              <div>
                <div class="label">Queue</div>
                <div class="value">${appointment.queueNumber || 'N/A'}</div>
              </div>
            </div>
            <div class="footer">Please arrive 10 minutes early for check-in.</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleCheckout = async (appointmentId: string) => {
    try {
      const liveAppointment = liveAppointments.find((appointment) => appointment.id === appointmentId)
      const startTime = liveAppointment?.checkInTime ? new Date(liveAppointment.checkInTime).getTime() : null
      const timeWithDoctor = startTime ? formatDuration(Date.now() - startTime) : '0H:00M:00s'
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'COMPLETED',
        checkedIn: false,
        checkedOutTime: new Date().toISOString(),
        timeWithDoctor,
      })
      toast.success('Patient checked out')
      fetchAppointments()
      fetchStats()
      fetchDoctorSchedules()
    } catch (error) {
      toast.error('Unable to check out patient')
    }
  }

  const formatElapsed = (start?: string | null) => {
    if (!start) return '0H:00M:00s'
    const startDate = new Date(start)
    const diffMs = now - startDate.getTime()
    return formatDuration(diffMs)
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
          <TabsList className="grid w-full max-w-2xl grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="appointments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <ClipboardCheck className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Schedules</span>
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Patients</span>
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
                    <Button
                      onClick={openAddAppointment}
                      className="bg-maternal-primary hover:bg-maternal-primary/90 text-white text-sm sm:text-base"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Appointment
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-2 sm:p-6">
                <div className="mb-6 rounded-2xl border border-maternal-light/40 bg-gradient-to-r from-maternal-lighter/70 via-white to-maternal-light/40 p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Live Check-Ins</h3>
                      <p className="text-sm text-gray-600">
                        Real-time view of patients currently with doctors
                      </p>
                    </div>
                    <Badge className="bg-maternal-primary text-white border-transparent flex items-center gap-2 w-fit">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                      Live
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {liveAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-maternal-primary">
                            {appointment.queueNumber ? `Queue #${appointment.queueNumber}` : 'In Progress'}
                          </span>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            Checked In
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDoctorName(`${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`)}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Time with doctor
                            <div className="text-sm font-semibold text-gray-900">
                              {formatElapsed(appointment.checkInTime)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="maternal-gradient text-xs"
                            onClick={() => handleCheckout(appointment.id)}
                          >
                            Check Out
                          </Button>
                        </div>
                      </div>
                    ))}
                    {liveAppointments.length === 0 && (
                      <div className="col-span-full text-center py-6 text-sm text-gray-600">
                        No patients are currently checked in.
                      </div>
                    )}
                  </div>
                </div>
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
                            {formatDoctorName(`${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`)}
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
                                onClick={() => openEditAppointment(appointment)}
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 sm:px-3"
                                onClick={() => handlePrintAppointment(appointment)}
                              >
                                Print
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
          <TabsContent value="schedules">
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

          {/* Doctors Management Tab */}
          <TabsContent value="doctors">
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Doctors Directory</CardTitle>
                  <CardDescription>Create, update, or remove doctor profiles</CardDescription>
                </div>
                <Button onClick={openAddDoctor} className="maternal-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Doctor
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{formatDoctorName(doctor.name)}</p>
                        <p className="text-sm text-gray-600">
                          {doctor.specialization} • {doctor.workingHours}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₦{doctor.fee.toLocaleString()} • {doctor.consultationDuration} min
                        </p>
                        {(doctor.gender || doctor.languages.length > 0) && (
                          <p className="text-xs text-gray-500">
                            {[doctor.gender, doctor.languages.join(', ')].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          onClick={() => openEditDoctor(doctor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteDoctor(doctor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {doctors.length === 0 && (
                    <div className="text-center py-12">
                      <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No doctors found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Management Tab */}
          <TabsContent value="patients">
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Patients Directory</CardTitle>
                  <CardDescription>Create, update, or remove patient profiles</CardDescription>
                </div>
                <Button onClick={openAddPatient} className="maternal-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                        <p className="text-xs text-gray-500">{patient.email}</p>
                        {(patient.gender || patient.dateOfBirth) && (
                          <p className="text-xs text-gray-500">
                            {[patient.gender, patient.dateOfBirth].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          onClick={() => openEditPatient(patient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeletePatient(patient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {patients.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No patients found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Doctor Dialog */}
      <Dialog open={showDoctorDialog} onOpenChange={setShowDoctorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
            <DialogDescription>Manage doctor profile details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor-name">Full Name</Label>
                <Input
                  id="doctor-name"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="doctor-specialization">Specialization</Label>
                <Input
                  id="doctor-specialization"
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="doctor-qualification">Qualification</Label>
                <Input
                  id="doctor-qualification"
                  value={doctorForm.qualification}
                  onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="doctor-experience">Experience</Label>
                <Input
                  id="doctor-experience"
                  value={doctorForm.experience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                  placeholder="e.g. 10 years"
                />
              </div>
              <div>
                <Label htmlFor="doctor-duration">Consultation Duration (mins)</Label>
                <Input
                  id="doctor-duration"
                  type="number"
                  value={doctorForm.consultationDuration}
                  onChange={(e) => setDoctorForm({ ...doctorForm, consultationDuration: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="doctor-fee">Consultation Fee (NGN)</Label>
                <Input
                  id="doctor-fee"
                  type="number"
                  value={doctorForm.fee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, fee: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="doctor-hours">Working Hours</Label>
                <Input
                  id="doctor-hours"
                  value={doctorForm.workingHours}
                  onChange={(e) => setDoctorForm({ ...doctorForm, workingHours: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="doctor-languages">Languages</Label>
                <Input
                  id="doctor-languages"
                  list="doctor-languages-list"
                  value={doctorForm.languages}
                  onChange={(e) => setDoctorForm({ ...doctorForm, languages: e.target.value })}
                  placeholder="English, Hausa, Ebira"
                />
                <datalist id="doctor-languages-list">
                  <option value="English" />
                  <option value="Hausa" />
                  <option value="Igala" />
                  <option value="Igbo" />
                  <option value="Yoruba" />
                  <option value="Fulani" />
                  <option value="Ebira" />
                </datalist>
              </div>
              <div>
                <Label htmlFor="doctor-gender">Gender</Label>
                <Select
                  value={doctorForm.gender}
                  onValueChange={(value) => setDoctorForm({ ...doctorForm, gender: value })}
                >
                  <SelectTrigger id="doctor-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doctor-email">Email</Label>
                <Input
                  id="doctor-email"
                  type="email"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="doctor-phone">Phone</Label>
                <Input
                  id="doctor-phone"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="doctor-bio">Bio</Label>
              <Textarea
                id="doctor-bio"
                rows={4}
                value={doctorForm.bio}
                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDoctorDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveDoctor} className="flex-1 maternal-gradient">
                {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Dialog */}
      <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
            <DialogDescription>Manage patient profile details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-first-name">First Name</Label>
                <Input
                  id="patient-first-name"
                  value={patientForm.firstName}
                  onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="patient-last-name">Last Name</Label>
                <Input
                  id="patient-last-name"
                  value={patientForm.lastName}
                  onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="patient-gender">Gender</Label>
                <Select
                  value={patientForm.gender}
                  onValueChange={(value) => setPatientForm({ ...patientForm, gender: value })}
                >
                  <SelectTrigger id="patient-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="patient-dob">Date of Birth</Label>
                <Input
                  id="patient-dob"
                  type="date"
                  value={patientForm.dateOfBirth}
                  onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="patient-email">Email</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="patient-phone">Phone</Label>
                <Input
                  id="patient-phone"
                  value={patientForm.phone}
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="patient-address">Address</Label>
                <Textarea
                  id="patient-address"
                  value={patientForm.address}
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  placeholder="Home address"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowPatientDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSavePatient} className="flex-1 maternal-gradient">
                {editingPatient ? 'Update Patient' : 'Create Patient'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Dialog */}
      <Dialog
        open={showAppointmentDialog}
        onOpenChange={(open) => {
          setShowAppointmentDialog(open)
          if (!open) resetAppointmentForm()
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Appointment</DialogTitle>
            <DialogDescription>Schedule a new appointment with a doctor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Patient Type</Label>
              <Select
                value={appointmentForm.patientType}
                onValueChange={(value) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    patientType: value,
                    patientId: '',
                    patientFirstName: '',
                    patientLastName: '',
                    patientEmail: '',
                    patientPhone: '',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">Registered Patient</SelectItem>
                  <SelectItem value="new">New Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {appointmentForm.patientType === 'existing' ? (
              <div className="grid gap-2">
                <Label>Select Patient</Label>
                <Select
                  value={appointmentForm.patientId}
                  onValueChange={(value) => {
                    const patient = patients.find((item) => item.id === value)
                    setAppointmentForm((prev) => ({
                      ...prev,
                      patientId: value,
                      patientFirstName: patient?.firstName || '',
                      patientLastName: patient?.lastName || '',
                      patientEmail: patient?.email || '',
                      patientPhone: patient?.phone || '',
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input
                    value={appointmentForm.patientFirstName}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({ ...prev, patientFirstName: e.target.value }))
                    }
                    placeholder="First name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input
                    value={appointmentForm.patientLastName}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({ ...prev, patientLastName: e.target.value }))
                    }
                    placeholder="Last name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={appointmentForm.patientEmail}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({ ...prev, patientEmail: e.target.value }))
                    }
                    placeholder="Email (optional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input
                    value={appointmentForm.patientPhone}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({ ...prev, patientPhone: e.target.value }))
                    }
                    placeholder="Phone number"
                  />
                </div>
              </div>
            )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Doctor</Label>
                  <Select
                    value={appointmentForm.doctorId}
                    onValueChange={(value) => {
                      const doctor = doctors.find((item) => item.id === value)
                      const specialties = doctor?.specialties?.length
                        ? buildAppointmentSpecialties(doctor.specialties)
                        : buildAppointmentSpecialties(doctor?.specialization || '')
                      setAppointmentSpecialties(specialties)
                      setAppointmentForm((prev) => ({
                        ...prev,
                        doctorId: value,
                        appointmentType: prev.appointmentType || specialties[0] || doctor?.specialization || 'General Consultation',
                        appointmentTime: '',
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {formatDoctorName(doctor.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Appointment Type</Label>
                  <Select
                    value={appointmentForm.appointmentType}
                    onValueChange={(value) =>
                      setAppointmentForm((prev) => ({ ...prev, appointmentType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                    {(appointmentSpecialties.length ? appointmentSpecialties : ['General Consultation']).map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={appointmentForm.appointmentDate}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        appointmentDate: e.target.value,
                        appointmentTime: '',
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Time</Label>
                  <Select
                    value={appointmentForm.appointmentTime}
                    onValueChange={(value) =>
                      setAppointmentForm((prev) => ({ ...prev, appointmentTime: value }))
                    }
                    disabled={!appointmentForm.doctorId || !appointmentForm.appointmentDate || availableTimes.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={availableTimes.length ? 'Select time' : 'No availability'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            <div className="grid gap-2">
              <Label>Reason for Visit *</Label>
              <Textarea
                value={appointmentForm.reasonForVisit}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({ ...prev, reasonForVisit: e.target.value }))
                }
                placeholder="Reason for visit"
              />
            </div>

            <div className="grid gap-2">
              <Label>Symptoms</Label>
              <Textarea
                value={appointmentForm.symptoms}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({ ...prev, symptoms: e.target.value }))
                }
                placeholder="Symptoms (optional)"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAppointmentDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateAppointment} className="flex-1 maternal-gradient">
                Create Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update details for appointment {selectedAppointment?.appointmentNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Patient</Label>
                <Select
                  value={editAppointmentForm.patientId}
                  onValueChange={(value) =>
                    setEditAppointmentForm((prev) => ({ ...prev, patientId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Doctor</Label>
                <Select
                  value={editAppointmentForm.doctorId}
                  onValueChange={(value) => {
                    const doctor = doctors.find((item) => item.id === value)
                    const specialties = doctor?.specialties?.length
                      ? buildAppointmentSpecialties(doctor.specialties)
                      : buildAppointmentSpecialties(doctor?.specialization || '')
                    setEditSpecialties(specialties)
                    setEditAppointmentForm((prev) => ({
                      ...prev,
                      doctorId: value,
                      appointmentType: specialties[0] || prev.appointmentType || 'General Consultation',
                      appointmentTime: '',
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {formatDoctorName(doctor.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Appointment Type</Label>
                <Select
                  value={editAppointmentForm.appointmentType}
                  onValueChange={(value) =>
                    setEditAppointmentForm((prev) => ({ ...prev, appointmentType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {(editSpecialties.length ? editSpecialties : ['General Consultation']).map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editAppointmentForm.appointmentDate}
                  onChange={(e) =>
                    setEditAppointmentForm((prev) => ({
                      ...prev,
                      appointmentDate: e.target.value,
                      appointmentTime: '',
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Time</Label>
                <Select
                  value={editAppointmentForm.appointmentTime}
                  onValueChange={(value) =>
                    setEditAppointmentForm((prev) => ({ ...prev, appointmentTime: value }))
                  }
                  disabled={!editAppointmentForm.doctorId || !editAppointmentForm.appointmentDate || editAvailableTimes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={editAvailableTimes.length ? 'Select time' : 'No availability'} />
                  </SelectTrigger>
                  <SelectContent>
                    {editAvailableTimes.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Appointment Status</Label>
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
            </div>

            <div className="grid gap-2">
              <Label>Reason for Visit *</Label>
              <Textarea
                value={editAppointmentForm.reasonForVisit}
                onChange={(e) =>
                  setEditAppointmentForm((prev) => ({ ...prev, reasonForVisit: e.target.value }))
                }
                placeholder="Reason for visit"
              />
            </div>
            <div className="grid gap-2">
              <Label>Symptoms</Label>
              <Textarea
                value={editAppointmentForm.symptoms}
                onChange={(e) =>
                  setEditAppointmentForm((prev) => ({ ...prev, symptoms: e.target.value }))
                }
                placeholder="Symptoms (optional)"
              />
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
                    <Label className="text-gray-600">Patient Gender</Label>
                    <p className="font-medium">{selectedAppointment.patient.user.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Doctor</Label>
                    <p className="font-medium">
                      {formatDoctorName(`${selectedAppointment.doctor.user.firstName} ${selectedAppointment.doctor.user.lastName}`)}
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
                    <Label className="text-gray-600">Time With Doctor</Label>
                    <p className="font-medium">{selectedAppointment.timeWithDoctor || 'N/A'}</p>
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
                <div>
                  <Label className="text-gray-600">Reason for Visit</Label>
                  <p className="font-medium">{selectedAppointment.reasonForVisit || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Symptoms</Label>
                  <p className="font-medium">{selectedAppointment.symptoms || 'N/A'}</p>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
