'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Heart,
  Baby,
  Activity,
  Bell,
  FileText,
  User,
  Phone,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Sarah! 👋
            </h1>
            <p className="text-gray-600">
              Here's your maternity care overview
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Pregnancy Tracker */}
            <div className="md:col-span-2 space-y-6">
              {/* Pregnancy Progress */}
              <Card className="border-t-4 border-t-maternal-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="h-6 w-6 text-maternal-primary" />
                        <span>Your Pregnancy Journey</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Week 24 of 40 weeks
                      </CardDescription>
                    </div>
                    <Badge className="bg-maternal-primary text-white">
                      Trimester 2
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">Progress</span>
                        <span className="text-maternal-primary font-bold">60%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full maternal-gradient transition-all"
                          style={{ width: '60%' }}
                        ></div>
                      </div>
                    </div>

                    {/* Key Dates */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-maternal-lighter p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Expected Due Date</p>
                        <p className="text-lg font-bold text-maternal-primary">
                          June 15, 2026
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
                        <p className="text-lg font-bold text-maternal-secondary">
                          112 days
                        </p>
                      </div>
                    </div>

                    {/* Baby Development */}
                    <div className="bg-gradient-to-r from-maternal-lighter to-purple-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Baby className="h-8 w-8 text-maternal-primary flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Baby Development This Week
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your baby is about the size of a cantaloupe and weighs approximately 1.3 lbs.
                            Their lungs are developing rapidly, and they can now hear sounds!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-maternal-primary" />
                    <span>Upcoming Appointments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-maternal-primary transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-maternal-light rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-maternal-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{apt.type}</h4>
                          <p className="text-sm text-gray-600">{apt.doctor}</p>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {apt.date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {apt.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}

                  <Link href="/appointments/book">
                    <Button className="w-full maternal-gradient">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book New Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Health Reminders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-6 w-6 text-maternal-primary" />
                    <span>Health Reminders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reminders.map((reminder, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-maternal-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{reminder.title}</p>
                        <p className="text-sm text-gray-600">{reminder.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                      SJ
                    </div>
                    <CardTitle>Sarah Johnson</CardTitle>
                    <CardDescription>Patient ID: MAT-2026-001</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-semibold">28 years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Blood Group:</span>
                    <span className="font-semibold">O+</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pregnancy:</span>
                    <span className="font-semibold">First</span>
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full mt-4">
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Medical Records
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    Test Results
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Appointment History
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Emergency: 112
                  </Button>
                </CardContent>
              </Card>

              {/* Health Tips */}
              <Card className="bg-gradient-to-br from-maternal-lighter to-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Stay hydrated! Drink at least 8-10 glasses of water daily to support your baby's development
                    and maintain your health during pregnancy. 💧
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

const upcomingAppointments = [
  {
    id: '1',
    type: 'Prenatal Checkup',
    doctor: 'Dr. Aisha Abdullahi',
    date: 'Jan 15, 2026',
    time: '10:00 AM',
    status: 'confirmed',
  },
  {
    id: '2',
    type: 'Ultrasound Scan',
    doctor: 'Dr. Fatima Ibrahim',
    date: 'Jan 22, 2026',
    time: '02:30 PM',
    status: 'pending',
  },
]

const reminders = [
  {
    title: 'Prenatal Vitamins',
    description: 'Take your daily prenatal vitamins with food',
  },
  {
    title: 'Exercise',
    description: '30 minutes of light walking recommended today',
  },
  {
    title: 'Next Appointment',
    description: 'Prenatal checkup in 5 days',
  },
]
