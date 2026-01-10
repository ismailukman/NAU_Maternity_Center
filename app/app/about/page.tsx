import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Award, Users, Shield, Baby, Stethoscope } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-r from-maternal-primary to-maternal-secondary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Dedicated to providing compassionate, expert care for mothers and babies
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  To provide world-class maternity and pediatric care with compassion, excellence, and
                  innovation. We are committed to ensuring the health and wellbeing of every mother and
                  child who walks through our doors, offering personalized care that meets their unique needs.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-gray-700 leading-relaxed">
                  To be the leading maternity care provider, recognized for excellence in maternal and
                  child health services. We envision a future where every pregnancy is a joyful journey
                  and every child receives the best possible start in life.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-bold text-maternal-primary mb-2">50+</p>
                <p className="text-gray-600">Expert Doctors</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-maternal-primary mb-2">10,000+</p>
                <p className="text-gray-600">Happy Mothers</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-maternal-primary mb-2">15+</p>
                <p className="text-gray-600">Years of Excellence</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-maternal-primary mb-2">24/7</p>
                <p className="text-gray-600">Emergency Care</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

const values = [
  {
    title: 'Compassion',
    description: 'We treat every patient with kindness, empathy, and respect, understanding the unique journey of motherhood.',
    icon: Heart,
  },
  {
    title: 'Excellence',
    description: 'We maintain the highest standards of medical care, continuously improving our services and expertise.',
    icon: Award,
  },
  {
    title: 'Safety',
    description: 'The safety of mother and baby is our top priority in every procedure and decision we make.',
    icon: Shield,
  },
  {
    title: 'Family-Centered',
    description: 'We involve families in care decisions and create a supportive environment for the entire family.',
    icon: Users,
  },
  {
    title: 'Innovation',
    description: 'We embrace the latest medical technologies and techniques to provide cutting-edge care.',
    icon: Stethoscope,
  },
  {
    title: 'Holistic Care',
    description: 'We address the physical, emotional, and social aspects of maternal and child health.',
    icon: Baby,
  },
]
