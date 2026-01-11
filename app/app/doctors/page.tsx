'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Award, Calendar, Languages, Clock } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/firebase-config'
import { collection, getDocs, query } from 'firebase/firestore'

const stripDoctorPrefix = (name: string) => name.replace(/^Dr\.?\s*/i, '').trim()

export default function DoctorsPage() {
  const [doctorList, setDoctorList] = useState(doctors)

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'doctors')))
        if (snapshot.empty) return
        const mapped = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data()
          const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()
          return {
            id: docSnapshot.id,
            name: stripDoctorPrefix(name || `${docSnapshot.id}`),
            qualification: data.qualification || '',
            specialization: data.specialization || data.specialty || 'General Consultation',
            rating: data.rating || 4.7,
            reviews: data.reviews || 0,
            experience: data.experience || '',
            languages: Array.isArray(data.languages) ? data.languages : [],
            consultationDuration: data.consultationDuration || 30,
            fee: data.fee || 15000,
            bio: data.bio || 'Experienced specialist providing compassionate care.',
          }
        })
        setDoctorList(mapped)
      } catch (error) {
        console.error('Failed to load doctors:', error)
      }
    }

    loadDoctors()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-r from-maternal-primary to-maternal-secondary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Our Expert Doctors
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Meet our team of board-certified specialists dedicated to providing the best care for mothers and babies
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap gap-3">
              <Badge className="cursor-pointer px-4 py-2 bg-maternal-primary">All Doctors</Badge>
              <Badge variant="secondary" className="cursor-pointer px-4 py-2">OB/GYN</Badge>
              <Badge variant="secondary" className="cursor-pointer px-4 py-2">Pediatrics</Badge>
              <Badge variant="secondary" className="cursor-pointer px-4 py-2">Neonatology</Badge>
              <Badge variant="secondary" className="cursor-pointer px-4 py-2">Lactation Consultant</Badge>
            </div>
          </div>
        </section>

        {/* Doctors Grid */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctorList.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mb-4">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {stripDoctorPrefix(doctor.name).split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{stripDoctorPrefix(doctor.name)}</CardTitle>
                    <CardDescription className="text-base">
                      <span className="text-maternal-primary font-semibold">{doctor.qualification}</span>
                    </CardDescription>
                    <Badge className="mt-2 bg-maternal-light text-maternal-primary">
                      {doctor.specialization}
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center justify-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(doctor.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{doctor.rating}</span>
                      <span className="text-sm text-gray-500">({doctor.reviews} reviews)</span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Award className="h-4 w-4 text-maternal-primary" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Languages className="h-4 w-4 text-maternal-primary" />
                        <span>{doctor.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Clock className="h-4 w-4 text-maternal-primary" />
                        <span>{doctor.consultationDuration} min consultation</span>
                      </div>
                    </div>

                    {/* Fee */}
                    <div className="bg-maternal-lighter p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Consultation Fee</p>
                      <p className="text-2xl font-bold text-maternal-primary">
                        ₦{doctor.fee.toLocaleString()}
                      </p>
                    </div>

                    {/* Bio Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {doctor.bio}
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link href={`/doctors/${doctor.id}`}>
                        <Button variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                      <Link href={`/appointments/book?doctor=${doctor.id}`}>
                        <Button className="w-full maternal-gradient">
                          <Calendar className="mr-2 h-4 w-4" />
                          Book
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

const doctors = [
  {
    id: '1',
    name: 'Dr. Aisha Abdullahi',
    qualification: 'MBBS, FWACS',
    specialization: 'Obstetrics & Gynecology',
    rating: 4.9,
    reviews: 127,
    experience: 15,
    languages: ['English', 'Hausa', 'Yoruba'],
    consultationDuration: 30,
    fee: 15000,
    bio: 'Specialist in high-risk pregnancies with extensive experience in maternal-fetal medicine. Dedicated to providing personalized care for every mother.',
  },
  {
    id: '2',
    name: 'Dr. Chidi Okonkwo',
    qualification: 'MBBS, MRCOG',
    specialization: 'Pediatrics',
    rating: 4.8,
    reviews: 98,
    experience: 12,
    languages: ['English', 'Igbo'],
    consultationDuration: 25,
    fee: 12000,
    bio: 'Passionate pediatrician specializing in newborn care and child development. Committed to the health and wellbeing of every child.',
  },
  {
    id: '3',
    name: 'Dr. Fatima Ibrahim',
    qualification: 'MBBS, MD',
    specialization: 'Neonatology',
    rating: 4.9,
    reviews: 156,
    experience: 18,
    languages: ['English', 'Hausa'],
    consultationDuration: 30,
    fee: 18000,
    bio: 'Expert neonatologist with special interest in premature infant care. Provides comprehensive care for newborns requiring intensive support.',
  },
  {
    id: '4',
    name: 'Dr. Ngozi Eze',
    qualification: 'MBBS, FRCOG',
    specialization: 'OB/GYN',
    rating: 4.7,
    reviews: 89,
    experience: 10,
    languages: ['English', 'Igbo', 'Yoruba'],
    consultationDuration: 30,
    fee: 14000,
    bio: 'Dedicated to women\'s health with expertise in prenatal care and minimally invasive gynecological procedures.',
  },
  {
    id: '5',
    name: 'Dr. Blessing Adebayo',
    qualification: 'RN, IBCLC',
    specialization: 'Lactation Consultant',
    rating: 5.0,
    reviews: 67,
    experience: 8,
    languages: ['English', 'Yoruba'],
    consultationDuration: 45,
    fee: 8000,
    bio: 'Certified lactation consultant helping mothers navigate breastfeeding challenges with compassion and expertise.',
  },
  {
    id: '6',
    name: 'Dr. Usman Bello',
    qualification: 'MBBS, FMCOG',
    specialization: 'Maternal-Fetal Medicine',
    rating: 4.8,
    reviews: 112,
    experience: 16,
    languages: ['English', 'Hausa', 'Fulani'],
    consultationDuration: 35,
    fee: 20000,
    bio: 'Specialist in complex pregnancies and fetal diagnostics. Uses advanced ultrasound technology for comprehensive prenatal care.',
  },
]
