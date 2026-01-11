'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
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

export default function DoctorDashboardPage() {
  const [search, setSearch] = useState('')

  const filteredTimeline = useMemo(() => {
    if (!search.trim()) return prenatalTimeline
    return prenatalTimeline.filter((item) =>
      `${item.title} ${item.detail}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

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
              <Badge className="bg-orange-100 text-orange-800 border border-orange-200">
                Risk Level: {patientProfile.riskLevel}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-maternal-lighter/40 border border-maternal-primary/10">
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="text-lg font-semibold text-gray-900">{patientProfile.name}</p>
                  <p className="text-sm text-gray-600">ID: {patientProfile.patientId}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <p className="text-xs text-gray-500">Gestational Age</p>
                  <p className="text-lg font-semibold text-gray-900">{patientProfile.gestationalAge}</p>
                  <p className="text-sm text-gray-600">Blood Group: {patientProfile.bloodGroup}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <p className="text-xs text-gray-500">Next Appointment</p>
                  <p className="text-lg font-semibold text-gray-900">{patientProfile.nextVisit}</p>
                  <p className="text-sm text-gray-600">Last visit {patientProfile.lastVisit}</p>
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
                    {vitals.map((item) => (
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
                    {fetalMetrics.map((item) => (
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
              <Button variant="outline" className="w-full border-maternal-primary text-maternal-primary">
                <LineChart className="mr-2 h-4 w-4" />
                View Growth Trends
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
                        {filteredTimeline.map((item) => (
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
                        {labResults.map((item) => (
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
                        {postnatalPlan.map((item) => (
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
                        {postpartumCare.map((item) => (
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
                        <p>✓ Schedule pelvic exam at week 6</p>
                        <p>✓ Monitor sleep, appetite, and mood weekly</p>
                        <p>✓ Provide breastfeeding resources</p>
                        <p>✓ Discuss contraception options</p>
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
