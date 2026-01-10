import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Heart,
  Baby,
  Activity,
  Shield,
  Stethoscope,
  CheckCircle,
  Users,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-r from-maternal-primary to-maternal-secondary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Our Services
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Comprehensive maternity and pediatric care services tailored to your needs
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        <service.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/appointments/book">
                      <Button className="w-full maternal-gradient">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Need Help Choosing a Service?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our team is here to guide you. Contact us or book a consultation with our specialists.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8">
                  Contact Us
                </Button>
              </Link>
              <Link href="/appointments/book">
                <Button size="lg" className="px-8 maternal-gradient">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

const services = [
  {
    title: 'Prenatal Care',
    description: 'Comprehensive care throughout your pregnancy journey',
    icon: Heart,
    features: [
      'Regular check-ups and monitoring',
      'Ultrasound scans (2D, 3D, 4D)',
      'Nutritional counseling',
      'High-risk pregnancy management',
      'Prenatal classes and education',
    ],
  },
  {
    title: 'Postnatal Care',
    description: 'Support for mothers after delivery',
    icon: Users,
    features: [
      'Postpartum check-ups',
      'Breastfeeding support',
      'Mental health screening',
      'Recovery guidance',
      'Family planning counseling',
    ],
  },
  {
    title: 'Ultrasound Services',
    description: 'Advanced imaging for monitoring baby development',
    icon: Activity,
    features: [
      '2D, 3D, and 4D ultrasound',
      'Early pregnancy scans',
      'Anomaly screening',
      'Growth monitoring',
      'Gender determination',
    ],
  },
  {
    title: 'Baby Vaccination',
    description: 'Complete immunization program for your baby',
    icon: Shield,
    features: [
      'WHO-recommended vaccines',
      'Vaccination schedule tracking',
      'BCG, DPT, Hepatitis B, Polio',
      'Rotavirus and Pneumococcal vaccines',
      'Digital vaccination records',
    ],
  },
  {
    title: 'Pediatric Care',
    description: 'Expert care for infants and children',
    icon: Baby,
    features: [
      'Newborn care and check-ups',
      'Growth and development monitoring',
      'Treatment of common childhood illnesses',
      'Nutritional guidance',
      'Developmental assessments',
    ],
  },
  {
    title: 'Family Planning',
    description: 'Professional reproductive health services',
    icon: Stethoscope,
    features: [
      'Contraception counseling',
      'Fertility advice',
      'Preconception care',
      'STI screening and treatment',
      'Confidential consultations',
    ],
  },
]
