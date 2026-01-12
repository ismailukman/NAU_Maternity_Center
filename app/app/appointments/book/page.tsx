'use client'

import { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Heart, Baby, Activity, Stethoscope, Calendar, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/firebase-config'
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

const SPECIALTIES = [
  { id: 'prenatal', name: 'Prenatal Care', icon: Heart, color: 'text-pink-500' },
  { id: 'postnatal', name: 'Postnatal Care', icon: Baby, color: 'text-purple-500' },
  { id: 'ultrasound', name: 'Ultrasound', icon: Activity, color: 'text-blue-500' },
  { id: 'pediatrics', name: 'Pediatrics', icon: Stethoscope, color: 'text-green-500' },
  { id: 'consultation', name: 'General Consultation', icon: Calendar, color: 'text-orange-500' },
  { id: 'vaccination', name: 'Vaccination', icon: CheckCircle, color: 'text-teal-500' },
]

const MOCK_DOCTORS = [
  {
    id: '1',
    name: 'Dr. Aisha Abdullahi',
    specialization: 'prenatal',
    rating: 4.9,
    reviews: 127,
    fee: 15000,
  },
  {
    id: '2',
    name: 'Dr. Chidi Okonkwo',
    specialization: 'pediatrics',
    rating: 4.8,
    reviews: 98,
    fee: 12000,
  },
  {
    id: '3',
    name: 'Dr. Fatima Ibrahim',
    specialization: 'prenatal',
    rating: 4.9,
    reviews: 156,
    fee: 18000,
  },
]

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
]

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    specialty: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    appointmentType: '',
    patientName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: '',
    reasonForVisit: '',
    symptoms: '',
  })
  const [doctors, setDoctors] = useState(MOCK_DOCTORS)

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'doctors')))
        if (snapshot.empty) return
        const mappedDoctors = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data()
          const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()
          const specializationName = String(data.specialization || '').toLowerCase()
          const specialtyMatch = SPECIALTIES.find((specialty) =>
            specializationName.includes(specialty.name.toLowerCase())
          )

          return {
            id: docSnapshot.id,
            name: name || `Dr. ${docSnapshot.id}`,
            specialization: data.specializationId || specialtyMatch?.id || 'consultation',
            rating: data.rating || 4.8,
            reviews: data.reviews || 0,
            fee: data.fee || 15000,
          }
        })
        setDoctors(mappedDoctors)
      } catch (error) {
        console.error('Failed to load doctors:', error)
      }
    }

    loadDoctors()
  }, [])

  const selectedSpecialty = SPECIALTIES.find(s => s.id === formData.specialty)
  const availableDoctors = useMemo(
    () => doctors.filter(d => d.specialization === formData.specialty),
    [doctors, formData.specialty]
  )
const selectedDoctor = doctors.find(d => d.id === formData.doctorId)
const selectedSpecialtyName = selectedSpecialty?.name || 'General Consultation'
  const displayDoctorName = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return ''
    if (/^prof\.?\s*dr\.?\s*/i.test(trimmed)) return trimmed.replace(/\s+/g, ' ')
    if (/^dr\.?\s*/i.test(trimmed)) return trimmed.replace(/\s+/g, ' ')
    return `Dr. ${trimmed}`
  }

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

  const parseWorkingHours = (value: string) => {
    const [startRaw, endRaw] = value.split('-').map((part) => part.trim())
    if (!startRaw || !endRaw) return null
    const start = parseTimeToMinutes(startRaw)
    const end = parseTimeToMinutes(endRaw)
    if (start === null || end === null) return null
    return { start, end }
  }

  const dayNameForDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' })

  const handleNext = () => {
    if (step === 1 && !formData.specialty) {
      toast.error('Please select a specialty')
      return
    }
    if (step === 2 && !formData.doctorId) {
      toast.error('Please select a doctor')
      return
    }
    if (step === 3 && (!formData.date || !formData.timeSlot)) {
      toast.error('Please select date and time')
      return
    }
    if (step === 4 && (!formData.patientName || !formData.phone || !formData.reasonForVisit || !formData.gender || !formData.dateOfBirth)) {
      toast.error('Please fill in all required fields')
      return
    }
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor before confirming.')
      return
    }

    setSubmitting(true)
    try {
      const doctorSnapshot = await getDocs(
        query(collection(db, 'doctors'), where('__name__', '==', selectedDoctor.id))
      )
      const doctorData = doctorSnapshot.docs[0]?.data()
      const workingHours = doctorData?.workingHours || '09:00 AM - 05:00 PM'
      const availability = Array.isArray(doctorData?.availability) ? doctorData.availability : []
      const workingRange = parseWorkingHours(workingHours)
      const slotMinutes = parseTimeToMinutes(formData.timeSlot)

      if (!workingRange || slotMinutes === null) {
        toast.error('Unable to validate the selected time slot.')
        setSubmitting(false)
        return
      }

      const dayName = dayNameForDate(formData.date)
      if (
        availability.length > 0 &&
        !availability.some((day) => day.toLowerCase() === dayName.toLowerCase())
      ) {
        toast.error(`Dr. ${selectedDoctor.name} is not available on ${dayName}.`)
        setSubmitting(false)
        return
      }

      if (slotMinutes < workingRange.start || slotMinutes > workingRange.end) {
        toast.error('Selected time is outside doctor working hours.')
        setSubmitting(false)
        return
      }

      const dateSnapshot = await getDocs(
        query(collection(db, 'appointments'), where('appointmentDate', '==', formData.date))
      )

      const timeConflicts = dateSnapshot.docs
        .map((docSnapshot) => docSnapshot.data())
        .filter((appointment) => {
          const time = appointment.appointmentTime || appointment.timeSlot || ''
          return time === formData.timeSlot
        })

      const doctorConflict = timeConflicts.some(
        (appointment) => appointment.doctorId === selectedDoctor.id
      )
      if (doctorConflict) {
        toast.error('This time slot is already booked for the selected doctor.')
        setSubmitting(false)
        return
      }

      const patientConflict = timeConflicts.some((appointment) => {
        if (formData.email && appointment.patientEmail) {
          return appointment.patientEmail === formData.email
        }
        return appointment.patientPhone === formData.phone
      })
      if (patientConflict) {
        toast.error('You already have an appointment at this time.')
        setSubmitting(false)
        return
      }

      const patientNameParts = formData.patientName.trim().split(/\s+/)
      const patientFirstName = patientNameParts[0] || ''
      const patientLastName = patientNameParts.slice(1).join(' ')

      let patientId = ''
      if (formData.email) {
        const existingPatientQuery = query(
          collection(db, 'patients'),
          where('email', '==', formData.email)
        )
        const patientSnapshot = await getDocs(existingPatientQuery)
        if (!patientSnapshot.empty) {
          patientId = patientSnapshot.docs[0].id
          await updateDoc(doc(db, 'patients', patientId), {
            firstName: patientFirstName,
            lastName: patientLastName,
            phone: formData.phone,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            updatedAt: serverTimestamp(),
          })
        }
      }

      if (!patientId) {
        const patientRef = await addDoc(collection(db, 'patients'), {
          firstName: patientFirstName,
          lastName: patientLastName,
          email: formData.email || '',
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          createdAt: serverTimestamp(),
        })
        patientId = patientRef.id
      }

      const appointmentNumber = `APT-${formData.date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

      await addDoc(collection(db, 'appointments'), {
        appointmentNumber,
        appointmentType: formData.appointmentType || selectedSpecialtyName,
        appointmentDate: formData.date,
        appointmentTime: formData.timeSlot,
        status: 'SCHEDULED',
        checkedIn: false,
        queueNumber: null,
        patientId,
        patientName: formData.patientName,
        patientFirstName,
        patientLastName,
        patientEmail: formData.email || '',
        patientPhone: formData.phone,
        patientGender: formData.gender,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: formData.specialty,
        reasonForVisit: formData.reasonForVisit,
        symptoms: formData.symptoms,
        createdAt: serverTimestamp(),
      })

      await updateDoc(doc(db, 'doctors', selectedDoctor.id), {
        bookedSlots: arrayUnion(`${formData.date}|${formData.timeSlot}`),
      })

      toast.success('Appointment booked successfully!', {
        description: 'You will receive a confirmation SMS and email shortly.',
      })
      setStep(1)
      setFormData({
        specialty: '',
        doctorId: '',
        date: '',
        timeSlot: '',
        appointmentType: '',
        patientName: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        email: '',
        reasonForVisit: '',
        symptoms: '',
      })
    } catch (error) {
      console.error('Failed to book appointment:', error)
      toast.error('Unable to book appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Book an Appointment
            </h1>
            <p className="text-lg text-gray-600">
              Schedule your visit with our expert medical team
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                        s <= step
                          ? 'bg-maternal-primary text-white shadow-lg scale-110'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {s < step ? <CheckCircle className="h-5 w-5" /> : s}
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center hidden sm:block">
                      {s === 1 && 'Specialty'}
                      {s === 2 && 'Doctor'}
                      {s === 3 && 'Date & Time'}
                      {s === 4 && 'Details'}
                      {s === 5 && 'Confirm'}
                    </p>
                  </div>
                  {s < 5 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-all ${
                        s < step ? 'bg-maternal-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              {/* Step 1: Select Specialty */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Select Service Type
                    </h2>
                    <p className="text-gray-600">
                      Choose the type of care you need
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {SPECIALTIES.map((specialty) => (
                      <button
                        key={specialty.id}
                        onClick={() => setFormData({ ...formData, specialty: specialty.id })}
                        className={`p-6 border-2 rounded-lg transition-all text-left hover:shadow-lg ${
                          formData.specialty === specialty.id
                            ? 'border-maternal-primary bg-maternal-lighter'
                            : 'border-gray-200 hover:border-maternal-light'
                        }`}
                      >
                        <specialty.icon className={`h-10 w-10 ${specialty.color} mb-3`} />
                        <div className="font-semibold text-lg text-gray-900">
                          {specialty.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Doctor */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Choose Your Doctor
                    </h2>
                    <p className="text-gray-600">
                      Select from our {selectedSpecialty?.name} specialists
                    </p>
                  </div>

                  <div className="space-y-4">
                    {availableDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => setFormData({ ...formData, doctorId: doctor.id })}
                        className={`w-full p-6 border-2 rounded-lg transition-all text-left hover:shadow-lg ${
                          formData.doctorId === doctor.id
                            ? 'border-maternal-primary bg-maternal-lighter'
                            : 'border-gray-200 hover:border-maternal-light'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {doctor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                              {displayDoctorName(doctor.name)}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-yellow-500">★</span>
                                <span className="font-semibold">{doctor.rating}</span>
                                <span className="text-sm text-gray-500">
                                  ({doctor.reviews} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Consultation Fee</p>
                            <p className="text-2xl font-bold text-maternal-primary">
                              ₦{doctor.fee.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Select Date & Time */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Select Date & Time
                    </h2>
                    <p className="text-gray-600">
                      Choose a convenient time for your appointment
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Appointment Date
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full"
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setFormData({ ...formData, timeSlot: slot })}
                            className={`p-2 border-2 rounded-lg text-sm font-semibold transition-all ${
                              formData.timeSlot === slot
                                ? 'border-maternal-primary bg-maternal-lighter text-maternal-primary'
                                : 'border-gray-200 hover:border-maternal-light'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Patient Details */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Your Information
                    </h2>
                    <p className="text-gray-600">
                      Please provide your details
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+234 XXX XXX XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-maternal-primary focus:outline-none focus:ring-2 focus:ring-maternal-primary/20"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="">Select gender</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date of Birth *
                        </label>
                        <Input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address
                      </label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Residential address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reason for Visit *
                      </label>
                      <Textarea
                        value={formData.reasonForVisit}
                        onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                        placeholder="Please describe why you're seeking medical attention..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Symptoms (Optional)
                      </label>
                      <Textarea
                        value={formData.symptoms}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        placeholder="List any symptoms you're experiencing..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Review Your Appointment
                    </h2>
                    <p className="text-gray-600">
                      Please verify all details before confirming
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-semibold">
                        {SPECIALTIES.find(s => s.id === formData.specialty)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-semibold">{formData.patientName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-semibold">{formData.gender}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="font-semibold">{formData.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-semibold">
                        {selectedDoctor ? displayDoctorName(selectedDoctor.name) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">{formData.date}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold">{formData.timeSlot}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-semibold">{formData.patientName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-semibold">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                      <span className="text-lg font-semibold text-gray-900">Total Fee:</span>
                      <span className="text-2xl font-bold text-maternal-primary">
                        ₦{selectedDoctor?.fee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className="px-8"
                >
                  Back
                </Button>
                {step < 5 ? (
                  <Button onClick={handleNext} className="px-8 maternal-gradient">
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="px-8 maternal-gradient" disabled={submitting}>
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
