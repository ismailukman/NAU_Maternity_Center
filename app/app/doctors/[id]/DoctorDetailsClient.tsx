'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/firebase-config'
import { doc, getDoc } from 'firebase/firestore'
import {
  Calendar,
  Clock,
  Languages,
  Mail,
  Phone,
  Star,
  User,
  BriefcaseMedical,
} from 'lucide-react'

const stripDoctorPrefix = (name: string) =>
  name.replace(/^prof\.?\s*dr\.?\s*/i, '').replace(/^dr\.?\s*/i, '').trim()

const formatDoctorName = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) return ''
  if (/^prof\.?\s*dr\.?\s*/i.test(trimmed)) return trimmed.replace(/\s+/g, ' ')
  if (/^dr\.?\s*/i.test(trimmed)) return trimmed.replace(/\s+/g, ' ')
  return `Dr. ${trimmed}`
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

type DoctorRecord = {
  id: string
  name: string
  specialization: string
  specialties?: string[]
  qualification?: string
  experience?: string | number
  rating?: number
  reviews?: number
  consultationDuration?: number
  fee?: number
  languages?: string[]
  bio?: string
  workingHours?: string
  availability?: string[]
  email?: string
  phone?: string
}

const normalizeExperience = (value?: string | number) => {
  if (value === undefined || value === null) return ''
  if (typeof value === 'number') return `${value} years`
  return value
}

export default function DoctorDetailsClient({ doctorId }: { doctorId: string }) {
  const resolvedId = useMemo(() => doctorId || '', [doctorId])
  const [doctor, setDoctor] = useState<DoctorRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!resolvedId) return
    const loadDoctor = async () => {
      setLoading(true)
      setError('')
      try {
        const docRef = doc(db, 'doctors', resolvedId)
        const snapshot = await getDoc(docRef)
        if (!snapshot.exists()) {
          setError('Doctor profile not found.')
          setDoctor(null)
          return
        }

        const data = snapshot.data()
        const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()
        const specialties = parseSpecialties(
          Array.isArray(data.specialties) ? data.specialties : data.specialization || data.specialty || ''
        )
        setDoctor({
          id: snapshot.id,
          name,
          specialization: specialties[0] || 'General Consultation',
          specialties: specialties.length ? specialties : ['General Consultation'],
          qualification: data.qualification || '',
          experience: data.experience ?? '',
          rating: data.rating ?? 4.7,
          reviews: data.reviews ?? 0,
          consultationDuration: data.consultationDuration ?? 30,
          fee: data.fee ?? 15000,
          languages: Array.isArray(data.languages)
            ? [...data.languages].sort((a, b) => String(a).localeCompare(String(b)))
            : [],
          bio: data.bio || 'Experienced specialist providing compassionate care.',
          workingHours: data.workingHours || '09:00 AM - 05:00 PM',
          availability: Array.isArray(data.availability) ? data.availability : [],
          email: data.email || '',
          phone: data.phone || '',
        })
      } catch (err) {
        console.error('Failed to load doctor profile:', err)
        setError('Unable to load doctor profile.')
      } finally {
        setLoading(false)
      }
    }

    loadDoctor()
  }, [resolvedId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-maternal-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-6">
            <p className="text-lg font-semibold text-gray-900 mb-2">{error || 'Doctor not found.'}</p>
            <p className="text-sm text-gray-600 mb-6">
              Please return to the doctors page to choose another profile.
            </p>
            <Link href="/doctors">
              <Button className="maternal-gradient">Back to Doctors</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <section className="bg-gradient-to-r from-maternal-primary to-maternal-secondary text-white py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-36 h-36 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-4xl font-bold">
                {stripDoctorPrefix(doctor.name).split(' ').map((segment) => segment[0]).join('')}
              </div>
              <div className="text-center md:text-left space-y-3">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {(doctor.specialties?.length ? doctor.specialties : [doctor.specialization]).map((specialty) => (
                    <Badge key={specialty} className="bg-white/20 border-white/30 text-white">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">{formatDoctorName(doctor.name)}</h1>
                {doctor.qualification && (
                  <p className="text-lg text-white/90">{doctor.qualification}</p>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/90">
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    {doctor.rating?.toFixed(1)} ({doctor.reviews} reviews)
                  </span>
                  {doctor.experience && (
                    <span className="inline-flex items-center gap-2">
                      <BriefcaseMedical className="h-4 w-4" />
                      {normalizeExperience(doctor.experience)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {doctor.consultationDuration} min consult
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                  <Link href={`/appointments/book?doctor=${doctor.id}`}>
                    <Button className="bg-white text-maternal-primary hover:bg-white/90 shadow-lg">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="border-white text-white hover:bg-white/20">
                      Contact Centre
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">
                  About {formatDoctorName(doctor.name)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>{doctor.bio}</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-maternal-primary" />
                    <span>Working Hours: {doctor.workingHours}</span>
                  </div>
                  {doctor.availability && doctor.availability.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-maternal-primary" />
                      <span>Available: {doctor.availability.join(', ')}</span>
                    </div>
                  )}
                  {doctor.languages && doctor.languages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-maternal-primary" />
                      <span>Languages: {doctor.languages.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-maternal-primary" />
                    <span>Consultation Fee: ₦{doctor.fee?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Contact & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <BriefcaseMedical className="h-4 w-4 text-maternal-primary" />
                  <span>{doctor.specialization}</span>
                </div>
                {doctor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-maternal-primary" />
                    <span>{doctor.email}</span>
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-maternal-primary" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                <div className="rounded-lg bg-maternal-lighter/30 p-4 text-gray-700">
                  <p className="font-semibold mb-2">Specialty Focus</p>
                  <p>{doctor.specialization}</p>
                </div>
                <Link href={`/appointments/book?doctor=${doctor.id}`}>
                  <Button className="w-full maternal-gradient">Book with {doctor.name.split(' ')[0]}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
