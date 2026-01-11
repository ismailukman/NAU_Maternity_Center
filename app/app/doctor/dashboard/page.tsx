'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/firebase-config'
import { collection, getDocs, query } from 'firebase/firestore'
import {
  Activity,
  Baby,
  Calendar,
  ClipboardCheck,
  Heart,
  LineChart,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Thermometer,
} from 'lucide-react'

const doctorProfile = {
  name: 'Prof. Dr. Onimisi Okene',
  specialty: 'Obstetrics & Gynecology',
  department: 'Maternal Medicine',
}

const patientProfile = {
  name: 'Aisha Yahaya',
  age: 29,
  patientId: 'PT-2026-0412',
  bloodGroup: 'O+',
  gestationalAge: '30 weeks',
  riskLevel: 'Moderate',
  lastVisit: '2026-01-08',
  nextVisit: '2026-01-15',
}

const vitals = [
  { label: 'Blood Pressure', value: '118/76 mmHg', trend: 'Stable' },
  { label: 'Heart Rate', value: '82 bpm', trend: 'Normal' },
  { label: 'Weight', value: '71.8 kg', trend: '+0.4 kg' },
  { label: 'Temperature', value: '36.8°C', trend: 'Normal' },
]

const fetalMetrics = [
  { label: 'Fetal Heart Rate', value: '148 bpm', note: 'Normal range' },
  { label: 'Fundal Height', value: '29 cm', note: 'Appropriate for gestation' },
  { label: 'Fetal Movement', value: 'Active', note: '10+ kicks in 2 hrs' },
  { label: 'Amniotic Fluid', value: 'Adequate', note: 'AFI 13 cm' },
]

const prenatalTimeline = [
  { date: '2025-11-12', title: 'Initial Antenatal Booking', detail: 'BMI, baseline labs, risk assessment completed.' },
  { date: '2025-12-05', title: 'Ultrasound Scan', detail: 'Single live fetus, EDD confirmed.' },
  { date: '2025-12-22', title: 'Glucose Tolerance Test', detail: 'Results normal. Diet counseling given.' },
  { date: '2026-01-08', title: 'Routine Check', detail: 'Blood pressure stable. Mild ankle edema.' },
]

const postnatalPlan = [
  { label: 'Newborn Immunization', value: 'BCG, OPV0, HepB planned' },
  { label: 'Neonate Growth', value: 'Birth weight target 3.0-3.3kg' },
  { label: 'Breastfeeding Support', value: 'Lactation consult scheduled' },
]

const postpartumCare = [
  { label: 'Maternal Recovery', value: 'Monitor bleeding, BP, wound healing' },
  { label: 'Mental Health', value: 'Screen for postpartum depression' },
  { label: 'Family Planning', value: 'Discuss after 6-week visit' },
]

const growthMetrics = [
  {
    id: 'weight',
    label: 'Estimated Fetal Weight',
    unit: 'g',
    color: '#E91E63',
    points: [
      { week: 16, date: '2025-10-02', value: 150 },
      { week: 20, date: '2025-11-01', value: 320 },
      { week: 24, date: '2025-12-01', value: 650 },
      { week: 28, date: '2025-12-28', value: 1050 },
      { week: 30, date: '2026-01-08', value: 1350 },
      { week: 32, date: '2026-01-22', value: 1700 },
    ],
  },
  {
    id: 'bpd',
    label: 'Biparietal Diameter',
    unit: 'mm',
    color: '#6D28D9',
    points: [
      { week: 16, date: '2025-10-02', value: 34 },
      { week: 20, date: '2025-11-01', value: 46 },
      { week: 24, date: '2025-12-01', value: 58 },
      { week: 28, date: '2025-12-28', value: 71 },
      { week: 30, date: '2026-01-08', value: 77 },
      { week: 32, date: '2026-01-22', value: 82 },
    ],
  },
  {
    id: 'fl',
    label: 'Femur Length',
    unit: 'mm',
    color: '#0EA5E9',
    points: [
      { week: 16, date: '2025-10-02', value: 22 },
      { week: 20, date: '2025-11-01', value: 32 },
      { week: 24, date: '2025-12-01', value: 43 },
      { week: 28, date: '2025-12-28', value: 54 },
      { week: 30, date: '2026-01-08', value: 59 },
      { week: 32, date: '2026-01-22', value: 63 },
    ],
  },
  {
    id: 'hc',
    label: 'Head Circumference',
    unit: 'mm',
    color: '#10B981',
    points: [
      { week: 16, date: '2025-10-02', value: 125 },
      { week: 20, date: '2025-11-01', value: 165 },
      { week: 24, date: '2025-12-01', value: 205 },
      { week: 28, date: '2025-12-28', value: 245 },
      { week: 30, date: '2026-01-08', value: 265 },
      { week: 32, date: '2026-01-22', value: 280 },
    ],
  },
]

const labResults = [
  { label: 'Hb', value: '11.2 g/dL', status: 'Borderline' },
  { label: 'Urinalysis', value: 'Protein negative', status: 'Normal' },
  { label: 'HIV/HBsAg', value: 'Non-reactive', status: 'Normal' },
  { label: 'Blood Sugar', value: '88 mg/dL', status: 'Normal' },
]

const notes = [
  'Monitor ankle edema; advise rest and hydration.',
  'Continue prenatal vitamins and iron supplements.',
  'Schedule ultrasound at 32 weeks for growth check.',
]

const tabs = [
  { value: 'overview', label: 'Overview', icon: ClipboardCheck },
  { value: 'prenatal', label: 'Prenatal', icon: Heart },
  { value: 'postnatal', label: 'Postnatal', icon: Baby },
  { value: 'postpartum', label: 'Postpartum', icon: Activity },
]

type PatientOption = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender?: string
  dateOfBirth?: string
  address?: string
  bloodGroup?: string
  allergies?: string
  emergencyContact?: string
}

type PatientRecord = {
  vitals: { label: string; value: string; trend: string }[]
  fetalMetrics: { label: string; value: string; note: string }[]
  prenatalTimeline: { date: string; title: string; detail: string }[]
  labResults: { label: string; value: string; status: string }[]
  postpartumNotes: string[]
  postnatalPlan: { label: string; value: string }[]
  postpartumCare: { label: string; value: string }[]
  pregnancySummary: {
    gestationalAge: string
    riskLevel: string
    lastVisit: string
    nextVisit: string
  }
}

export default function DoctorDashboardPage() {
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [showTrends, setShowTrends] = useState(false)
  const [activeMetricId, setActiveMetricId] = useState(growthMetrics[0].id)
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)

  useEffect(() => {
    const loadPatients = async () => {
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
            bloodGroup: data.bloodGroup || '',
            allergies: data.allergies || '',
            emergencyContact: data.emergencyContact || '',
          }
        })
        const dedupedMap = new Map<string, PatientOption>()
        mapped.forEach((patient) => {
          const emailKey = patient.email ? `email:${patient.email.toLowerCase()}` : ''
          const phoneKey = patient.phone ? `phone:${patient.phone}` : ''
          const nameKey = patient.firstName || patient.lastName ? `name:${patient.firstName}-${patient.lastName}` : ''
          const key = emailKey || phoneKey || nameKey || `id:${patient.id}`
          if (!dedupedMap.has(key)) {
            dedupedMap.set(key, patient)
          }
        })
        const deduped = Array.from(dedupedMap.values())
        deduped.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
        setPatients(deduped)
        if (!selectedPatientId && mapped.length > 0) {
          setSelectedPatientId(deduped[0]?.id || '')
        }
      } catch (error) {
        console.error('Failed to load patients:', error)
      }
    }

    loadPatients()
  }, [])

  const filteredTimeline = useMemo(() => {
    if (!search.trim()) return prenatalTimeline
    return prenatalTimeline.filter((item) =>
      `${item.title} ${item.detail}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const filteredPatientTimeline = useMemo(() => {
    const base = activePatient ? patientRecord.prenatalTimeline : filteredTimeline
    if (!search.trim()) return base
    return base.filter((item) =>
      `${item.title} ${item.detail}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [activePatient, patientRecord, filteredTimeline, search])

  const activePatient = useMemo(() => {
    if (!selectedPatientId) return null
    return patients.find((patient) => patient.id === selectedPatientId) || null
  }, [patients, selectedPatientId])

  const patientRecord = useMemo<PatientRecord>(() => {
    if (!activePatient) {
      return {
        vitals,
        fetalMetrics,
        prenatalTimeline,
        labResults,
        postpartumNotes: notes,
        postnatalPlan,
        postpartumCare,
        pregnancySummary: {
          gestationalAge: patientProfile.gestationalAge,
          riskLevel: patientProfile.riskLevel,
          lastVisit: patientProfile.lastVisit,
          nextVisit: patientProfile.nextVisit,
        },
      }
    }

    const ageLabel = activePatient.dateOfBirth ? `DOB ${activePatient.dateOfBirth}` : `${patientProfile.age} yrs`
    const summary = {
      gestationalAge: patientProfile.gestationalAge,
      riskLevel: patientProfile.riskLevel,
      lastVisit: patientProfile.lastVisit,
      nextVisit: patientProfile.nextVisit,
    }

    return {
      vitals: [
        { label: 'Blood Pressure', value: '116/74 mmHg', trend: 'Stable' },
        { label: 'Heart Rate', value: '80 bpm', trend: 'Normal' },
        { label: 'Weight', value: '70.9 kg', trend: '+0.3 kg' },
        { label: 'Temperature', value: '36.7°C', trend: 'Normal' },
      ],
      fetalMetrics: [
        { label: 'Fetal Heart Rate', value: '146 bpm', note: 'Normal range' },
        { label: 'Fundal Height', value: '28 cm', note: 'Appropriate for gestation' },
        { label: 'Fetal Movement', value: 'Active', note: '10+ kicks in 2 hrs' },
        { label: 'Amniotic Fluid', value: 'Adequate', note: 'AFI 12 cm' },
      ],
      prenatalTimeline: [
        { date: '2025-10-20', title: 'Antenatal Booking', detail: `Vitals captured, ${ageLabel}.` },
        { date: '2025-11-18', title: 'Ultrasound Scan', detail: 'Single live fetus, placenta anterior.' },
        { date: '2025-12-10', title: 'Routine Check', detail: 'Blood pressure stable. Nutrition counseling.' },
        { date: '2026-01-05', title: 'Glucose Test', detail: 'Results normal. Continue diet plan.' },
      ],
      labResults: [
        { label: 'Hb', value: '11.4 g/dL', status: 'Borderline' },
        { label: 'Urinalysis', value: 'Protein negative', status: 'Normal' },
        { label: 'HIV/HBsAg', value: 'Non-reactive', status: 'Normal' },
        { label: 'Blood Sugar', value: '86 mg/dL', status: 'Normal' },
      ],
      postpartumNotes: [
        'Prepare postpartum wellness plan and mental health screening.',
        'Discuss breastfeeding support schedule.',
        'Arrange 6-week postpartum follow-up visit.',
      ],
      postnatalPlan,
      postpartumCare,
      pregnancySummary: summary,
    }
  }, [activePatient])

  const selectedMetric = useMemo(
    () => growthMetrics.find((metric) => metric.id === activeMetricId) || growthMetrics[0],
    [activeMetricId]
  )

  const chartPoints = useMemo(() => {
    const points = selectedMetric.points
    const minValue = Math.min(...points.map((point) => point.value))
    const maxValue = Math.max(...points.map((point) => point.value))
    const minWeek = Math.min(...points.map((point) => point.week))
    const maxWeek = Math.max(...points.map((point) => point.week))
    const paddingX = 40
    const paddingY = 24
    const width = 640
    const height = 220
    const valueRange = maxValue - minValue || 1
    const weekRange = maxWeek - minWeek || 1

    const normalized = points.map((point) => {
      const x = paddingX + ((point.week - minWeek) / weekRange) * (width - paddingX * 2)
      const y = height - paddingY - ((point.value - minValue) / valueRange) * (height - paddingY * 2)
      return { ...point, x, y }
    })

    return { normalized, width, height }
  }, [selectedMetric])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-maternal-lighter/10 to-maternal-secondary/10">
      <header className="bg-white/95 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-maternal-primary to-maternal-secondary flex items-center justify-center text-white">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Doctor Workspace</p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{doctorProfile.name}</h1>
              <p className="text-sm text-gray-600">{doctorProfile.specialty} • {doctorProfile.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-maternal-light text-maternal-primary border border-maternal-primary/30">
              On Duty
            </Badge>
            <Link href="/doctor/login">
              <Button variant="outline" className="border-maternal-primary text-maternal-primary">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid lg:grid-cols-[2.1fr_1fr] gap-6">
          <Card className="border-2 border-gray-100 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Active Patient</CardTitle>
                <CardDescription>Comprehensive maternal record tracking</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="border border-gray-200 rounded-lg bg-white px-3 py-2">
                  <p className="text-xs text-gray-500 mb-1">Select Patient</p>
                  <select
                    className="bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
                    value={selectedPatientId}
                    onChange={(event) => setSelectedPatientId(event.target.value)}
                  >
                    {patients.length === 0 && <option value="">No patients found</option>}
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <Badge className="bg-orange-100 text-orange-800 border border-orange-200">
                  Risk Level: {patientProfile.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-maternal-lighter/40 border border-maternal-primary/10">
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {activePatient ? `${activePatient.firstName} ${activePatient.lastName}` : patientProfile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {activePatient ? activePatient.id : patientProfile.patientId}
                  </p>
                  {activePatient && (
                    <p className="text-xs text-gray-500 mt-1">
                      {[activePatient.email, activePatient.phone].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <p className="text-xs text-gray-500">Gestational Age</p>
                  <p className="text-lg font-semibold text-gray-900">{patientRecord.pregnancySummary.gestationalAge}</p>
                  <p className="text-sm text-gray-600">
                    Blood Group: {activePatient?.bloodGroup || patientProfile.bloodGroup}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <p className="text-xs text-gray-500">Next Appointment</p>
                  <p className="text-lg font-semibold text-gray-900">{patientRecord.pregnancySummary.nextVisit}</p>
                  <p className="text-sm text-gray-600">Last visit {patientRecord.pregnancySummary.lastVisit}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {activePatient?.gender || 'Not recorded'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {activePatient?.dateOfBirth || 'Not recorded'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Allergies</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {activePatient?.allergies || 'None reported'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Emergency Contact</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {activePatient?.emergencyContact || 'Not recorded'}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-maternal-primary" />
                      Maternal Vitals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {patientRecord.vitals.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{item.label}</p>
                          <p className="font-semibold text-gray-900">{item.value}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border border-green-200">
                          {item.trend}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-4 w-4 text-maternal-primary" />
                      Fetal Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {patientRecord.fetalMetrics.map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-600">{item.label}</p>
                          <p className="font-semibold text-gray-900">{item.value}</p>
                        </div>
                        <span className="text-xs text-gray-500">{item.note}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Manage patient journey and follow-ups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full maternal-gradient">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Next Visit
              </Button>
              <Button
                variant="outline"
                className="w-full border-maternal-primary text-maternal-primary"
                onClick={() => setShowTrends((prev) => !prev)}
              >
                <LineChart className="mr-2 h-4 w-4" />
                {showTrends ? 'Hide Growth Trends' : 'View Growth Trends'}
              </Button>
              <Button variant="outline" className="w-full border-gray-300">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Update Care Plan
              </Button>
              <div className="rounded-xl bg-maternal-lighter/40 border border-maternal-primary/10 p-4 space-y-2">
                <p className="text-sm text-gray-600">Clinical Notes</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  {notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-maternal-primary" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {showTrends && (
          <section>
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Fetal Growth Trends</CardTitle>
                  <CardDescription>Interactive ultrasound and biometric tracking over time.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {growthMetrics.map((metric) => (
                    <Button
                      key={metric.id}
                      variant={metric.id === activeMetricId ? 'default' : 'outline'}
                      className={`text-xs sm:text-sm ${
                        metric.id === activeMetricId ? 'maternal-gradient' : 'border-gray-200'
                      }`}
                      onClick={() => setActiveMetricId(metric.id)}
                    >
                      {metric.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Metric</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedMetric.label}</p>
                    </div>
                    <Badge className="bg-maternal-light text-maternal-primary border border-maternal-primary/30">
                      Last reading: {selectedMetric.points[selectedMetric.points.length - 1].value}
                      {selectedMetric.unit}
                    </Badge>
                  </div>

                  <div className="relative">
                    <svg
                      viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                      className="w-full h-64"
                      onMouseLeave={() => setActivePointIndex(null)}
                    >
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={selectedMetric.color} stopOpacity="0.2" />
                          <stop offset="100%" stopColor={selectedMetric.color} stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      {[0, 1, 2, 3, 4].map((row) => (
                        <line
                          key={row}
                          x1="40"
                          x2={chartPoints.width - 40}
                          y1={24 + row * 42}
                          y2={24 + row * 42}
                          stroke="#E5E7EB"
                          strokeDasharray="4 6"
                        />
                      ))}
                      <polyline
                        fill="url(#trendGradient)"
                        stroke={selectedMetric.color}
                        strokeWidth="3"
                        points={chartPoints.normalized.map((point) => `${point.x},${point.y}`).join(' ')}
                      />
                      {chartPoints.normalized.map((point, index) => (
                        <circle
                          key={point.date}
                          cx={point.x}
                          cy={point.y}
                          r={activePointIndex === index ? 7 : 5}
                          fill={selectedMetric.color}
                          stroke="#fff"
                          strokeWidth="2"
                          onMouseEnter={() => setActivePointIndex(index)}
                        />
                      ))}
                    </svg>

                    {activePointIndex !== null && (
                      <div className="absolute right-6 top-6 rounded-xl bg-white shadow-lg border border-gray-200 p-4 text-sm">
                        <p className="text-xs text-gray-500">Week {chartPoints.normalized[activePointIndex].week}</p>
                        <p className="font-semibold text-gray-900">
                          {chartPoints.normalized[activePointIndex].value}
                          {selectedMetric.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          {chartPoints.normalized[activePointIndex].date}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                    {chartPoints.normalized.map((point) => (
                      <span key={point.date}>Week {point.week}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <Card className="border-2 border-gray-100 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Medical Record Tracker</CardTitle>
                <CardDescription>Track pregnancy journey from prenatal to postpartum.</CardDescription>
              </div>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search record notes..."
                className="sm:max-w-xs"
              />
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 text-xs sm:text-sm">
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Timeline</CardTitle>
                        <CardDescription>Latest prenatal visits and screenings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {filteredPatientTimeline.map((item) => (
                          <div key={item.date} className="border-l-2 border-maternal-primary/40 pl-4">
                            <p className="text-xs text-gray-500">{item.date}</p>
                            <p className="font-semibold text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-600">{item.detail}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Lab & Imaging</CardTitle>
                        <CardDescription>Key results for current trimester</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {patientRecord.labResults.map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">{item.label}</p>
                              <p className="font-semibold text-gray-900">{item.value}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                              {item.status}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="prenatal">
                  <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Prenatal Care Checklist</CardTitle>
                        <CardDescription>Track scheduled interventions and screenings.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Ultrasound scans and fetal anomaly check',
                          'Blood pressure and edema monitoring',
                          'Nutrition and anemia counseling',
                          'Tetanus toxoid vaccination status',
                          'Birth plan documentation',
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-maternal-primary" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Risk Alerts</CardTitle>
                        <CardDescription>Clinical flags and recommendations.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Badge className="bg-orange-100 text-orange-800 border border-orange-200">
                          Monitor BP weekly
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Mild edema - advise rest
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 border border-green-200">
                          Fetal growth on track
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="postnatal">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Newborn Care Plan</CardTitle>
                        <CardDescription>Immediate post-delivery checklist.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {patientRecord.postnatalPlan.map((item) => (
                          <div key={item.label} className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-gray-600">{item.label}</p>
                              <p className="font-semibold text-gray-900">{item.value}</p>
                            </div>
                            <Baby className="h-4 w-4 text-maternal-primary" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Growth & Development</CardTitle>
                        <CardDescription>Expected milestones for first 6 weeks.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-gray-700">
                        <p>✓ Weight gain 150-200g/week</p>
                        <p>✓ Umbilical cord care and healing</p>
                        <p>✓ Eye screening and jaundice monitoring</p>
                        <p>✓ Immunization reminders sent</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="postpartum">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Postpartum Recovery</CardTitle>
                        <CardDescription>6-week follow up pathway.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {patientRecord.postpartumCare.map((item) => (
                          <div key={item.label} className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-gray-600">{item.label}</p>
                              <p className="font-semibold text-gray-900">{item.value}</p>
                            </div>
                            <Activity className="h-4 w-4 text-maternal-primary" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Postpartum Notes</CardTitle>
                        <CardDescription>Follow-up counseling and referrals.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-gray-700">
                        {patientRecord.postpartumNotes.map((note) => (
                          <p key={note}>✓ {note}</p>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
