'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Heart,
  Baby,
  Stethoscope,
  Calendar,
  Clock,
  Users,
  Star,
  Phone,
  Shield,
  Award,
  Activity,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Pill,
  Syringe,
  Hospital,
  Clipboard,
  HeartPulse,
  Microscope,
  Ambulance,
  Cross,
  Bone,
  BriefcaseMedical,
  Dna,
  FlaskConical,
  Thermometer,
  TestTube,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: { end: number, duration?: number, suffix?: string, prefix?: string }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!counterRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTime: number | null = null
          const startValue = 0

          const animate = (currentTime: number) => {
            if (startTime === null) startTime = currentTime
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentCount = Math.floor(easeOutQuart * (end - startValue) + startValue)

            setCount(currentCount)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(end)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    const currentRef = counterRef.current
    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [end, duration, hasAnimated])

  const formatNumber = (num: number) => {
    if (end >= 1000) {
      return `${(num / 1000).toFixed(num === end ? 0 : 1)}k`
    }
    return num.toString()
  }

  return (
    <span ref={counterRef}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}

function TestimonialsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const cardsPerPage = 3
  const totalPages = Math.ceil(testimonials.length / cardsPerPage)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollInterval: NodeJS.Timeout

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        setCurrentPage((prev) => {
          const nextPage = prev + 1 >= totalPages ? 0 : prev + 1

          if (scrollContainer) {
            // Calculate scroll position for 3 cards at a time
            const cardWidth = scrollContainer.scrollWidth / testimonials.length
            const scrollAmount = cardWidth * cardsPerPage * nextPage
            scrollContainer.scrollTo({ left: scrollAmount, behavior: 'smooth' })
          }

          return nextPage
        })
      }, 5000) // Scroll every 5 seconds
    }

    startAutoScroll()

    return () => clearInterval(scrollInterval)
  }, [totalPages])

  return (
    <section className="relative py-24 overflow-hidden scroll-animate opacity-0 translate-y-10">
      {/* Background with gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-maternal-lighter/20 to-purple-50/30"></div>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(233, 30, 99, 0.2) 1px, transparent 0)`,
        backgroundSize: '55px 55px'
      }}></div>
      <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-maternal-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-maternal-secondary/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <Badge className="mb-4 bg-maternal-secondary/10 text-maternal-secondary border-maternal-secondary/20 px-4 py-2">
            💝 Patient Testimonials
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            What Our Patients Say
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real experiences from mothers we've had the privilege to care for
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-4 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="w-[calc(33.333%-16px)] min-w-[280px] hover:shadow-2xl transition-all duration-500 flex-shrink-0 border-2 border-transparent hover:border-maternal-primary group relative overflow-hidden transform hover:-translate-y-2"
            >
              {/* Quote decoration */}
              <div className="absolute -top-4 -right-4 text-maternal-primary/5 text-9xl font-serif leading-none select-none">
                "
              </div>

              <CardHeader className="relative">
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:scale-125 transition-transform"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
                <CardDescription className="text-base text-gray-700 italic leading-relaxed min-h-[100px] relative z-10">
                  "{testimonial.comment}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 pt-4 border-t border-maternal-light/30">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">{testimonial.name}</p>
                    <Badge variant="outline" className="text-xs mt-1 border-maternal-primary/30 text-maternal-primary">
                      {testimonial.service}
                    </Badge>
                  </div>
                </div>
              </CardContent>

              {/* Bottom gradient accent */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-maternal-primary via-maternal-secondary to-maternal-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Card>
          ))}
        </div>

        {/* Enhanced Pagination Dots */}
        <div className="flex justify-center mt-12 space-x-3">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPage(index)
                const scrollContainer = scrollRef.current
                if (scrollContainer) {
                  const cardWidth = scrollContainer.scrollWidth / testimonials.length
                  const scrollAmount = cardWidth * cardsPerPage * index
                  scrollContainer.scrollTo({ left: scrollAmount, behavior: 'smooth' })
                }
              }}
              className={`transition-all duration-300 rounded-full shadow-sm hover:shadow-md ${
                currentPage === index
                  ? 'w-12 h-3 bg-gradient-to-r from-maternal-primary to-maternal-secondary'
                  : 'w-3 h-3 bg-maternal-primary/30 hover:bg-maternal-primary/60 hover:scale-125'
              }`}
            ></button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}

export default function HomePage() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center animate-zoom-in"
              style={{
                backgroundImage: 'url(/hero-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Overlay for readability with low opacity */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/30 to-white/25"></div>

            {/* Floating Shapes */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-maternal-primary rounded-full opacity-10 blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-maternal-secondary rounded-full opacity-10 blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-pink-300 rounded-full opacity-10 blur-3xl animate-blob animation-delay-4000"></div>

            {/* Decorative Hearts */}
            <div className="absolute top-10 right-1/4 opacity-5">
              <Heart className="h-16 w-16 text-maternal-primary animate-float" fill="currentColor" />
            </div>
            <div className="absolute bottom-20 left-1/4 opacity-5">
              <Baby className="h-20 w-20 text-maternal-secondary animate-float animation-delay-1000" />
            </div>
            <div className="absolute top-1/2 right-10 opacity-5">
              <Heart className="h-12 w-12 text-maternal-primary animate-float animation-delay-3000" fill="currentColor" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(233, 30, 99, 0.05) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <div className="mb-2"></div>
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                  Expert Care for
                  <span className="block mt-2 bg-gradient-to-r from-maternal-primary to-maternal-secondary bg-clip-text text-transparent animate-gradient">
                    Mothers & Babies
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl">
                  Providing compassionate prenatal, postnatal, and pediatric care with the latest medical technology and experienced specialists.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/appointments/book">
                    <Button size="lg" className="maternal-gradient text-lg px-10 py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group">
                      <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                      Book Appointment
                      <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                  <Link href="/emergency">
                    <Button size="lg" className="text-lg px-10 py-6 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 hover:border-red-700 transition-all duration-300 group">
                      <Phone className="mr-2 h-5 w-5 text-white group-hover:animate-pulse" />
                      Emergency: 112
                    </Button>
                  </Link>
                </div>

                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-3 gap-6 mt-16">
                  {[
                    { end: 50, suffix: '+', label: 'Expert Doctors', delay: '0s', isNumber: true },
                    { end: 10000, suffix: '+', label: 'Happy Mothers', delay: '0.1s', isNumber: true },
                    { value: '24/7', label: 'Care Available', delay: '0.2s', isNumber: false }
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-maternal-light/20 hover:bg-white hover:shadow-lg transform hover:scale-110 transition-all duration-300"
                      style={{ animationDelay: stat.delay }}
                    >
                      <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-maternal-primary to-maternal-secondary bg-clip-text text-transparent">
                        {stat.isNumber ? (
                          <AnimatedCounter
                            end={stat.end!}
                            suffix={stat.suffix}
                            duration={2500}
                          />
                        ) : (
                          stat.value
                        )}
                      </p>
                      <p className="text-sm md:text-base text-gray-700 font-medium mt-2">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative hidden md:block animate-fade-in">
                <Badge className="mb-6 bg-maternal-light text-maternal-primary px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow">
                  ✨ Trusted Maternity Care
                </Badge>
                <div className="relative z-10 group">
                  <div className="absolute -top-4 -left-4 w-72 h-72 bg-maternal-primary rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
                  <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-maternal-secondary rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-3xl shadow-2xl p-10 transform hover:scale-105 transition-all duration-500 border border-maternal-light/20">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-full mb-6 shadow-lg animate-pulse-slow">
                        <Heart className="h-14 w-14 text-white animate-float" fill="white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        Your Journey Starts Here
                      </h3>
                      <p className="text-gray-600 mb-8 text-lg">
                        Comprehensive care from pregnancy to motherhood
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-maternal-lighter to-pink-100 p-6 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group/card">
                          <Baby className="h-10 w-10 text-maternal-primary mb-3 mx-auto group-hover/card:scale-110 transition-transform" />
                          <p className="text-sm font-bold text-gray-900">Prenatal Care</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-100 to-maternal-lighter p-6 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group/card">
                          <Heart className="h-10 w-10 text-maternal-secondary mb-3 mx-auto group-hover/card:scale-110 transition-transform" />
                          <p className="text-sm font-bold text-gray-900">Postnatal Care</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 scroll-animate opacity-0 translate-y-10 overflow-hidden">
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-maternal-lighter/20 via-purple-50/30 to-pink-50/20"></div>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(233, 30, 99, 0.15) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-maternal-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-maternal-secondary/10 rounded-full blur-3xl"></div>
          <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge className="mb-4 bg-maternal-secondary/10 text-maternal-secondary border-maternal-secondary/20">
                Our Excellence
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Why Choose Us?
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We combine expert medical care with compassionate support for a complete maternity experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Stethoscope,
                  title: 'Expert Specialists',
                  description: 'Board-certified OB/GYN doctors with decades of combined experience in maternal and child care',
                  color: 'maternal-primary',
                  bgColor: 'maternal-light',
                  delay: '0s'
                },
                {
                  icon: Shield,
                  title: 'Safe & Modern',
                  description: 'State-of-the-art facilities with the latest medical technology ensuring safety for mother and baby',
                  color: 'maternal-secondary',
                  bgColor: 'purple-100',
                  delay: '0.1s'
                },
                {
                  icon: Clock,
                  title: '24/7 Support',
                  description: 'Round-the-clock emergency services and support whenever you need us most',
                  color: 'maternal-primary',
                  bgColor: 'maternal-light',
                  delay: '0.2s'
                }
              ].map((feature, idx) => (
                <Card
                  key={idx}
                  className="group border-2 border-transparent hover:border-maternal-primary bg-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden relative"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-maternal-primary to-maternal-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <CardHeader className="relative">
                    <div className={`w-16 h-16 bg-${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                      <feature.icon className={`h-8 w-8 text-${feature.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <CardTitle className="text-2xl mb-4 group-hover:text-maternal-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-maternal-primary/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-maternal-primary" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="relative py-24 scroll-animate opacity-0 translate-y-10 overflow-hidden">
          {/* Brown blended background - darker */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(180, 83, 9, 0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
          <div className="absolute top-10 right-20 w-[450px] h-[450px] bg-amber-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-[500px] h-[500px] bg-orange-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-200/15 rounded-full blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge className="mb-4 bg-maternal-primary/10 text-maternal-primary border-maternal-primary/20 px-4 py-2">
                ✨ Complete Care Solutions
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Our Services
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive care at every stage of your journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-transparent hover:border-maternal-primary/30"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-maternal-primary/5 to-maternal-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <service.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-maternal-light to-pink-100 text-maternal-primary border-maternal-primary/20 font-semibold px-3 py-1 shadow-sm group-hover:shadow-md transition-shadow">
                        {service.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-4 group-hover:text-maternal-primary transition-colors duration-300">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-gray-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <Link href={`/services/${service.slug}`}>
                      <Button
                        variant="ghost"
                        className="w-full text-maternal-primary hover:bg-maternal-light/50 group/btn transition-all duration-300 border border-transparent hover:border-maternal-primary/20"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Learn More
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </Link>
                  </CardContent>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-maternal-primary to-maternal-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsCarousel />

        {/* CTA Section */}
        <section className="relative py-28 overflow-hidden scroll-animate opacity-0 translate-y-10">
          {/* Gradient Background with Animation */}
          <div className="absolute inset-0 maternal-gradient">
            <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl animate-blob"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-300 rounded-full opacity-10 blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-maternal-secondary rounded-full opacity-5 blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Floating decorative elements */}
            <div className="absolute -top-10 left-10 opacity-20 animate-float">
              <Heart className="h-16 w-16 text-white animate-glow" fill="white" />
            </div>
            <div className="absolute -bottom-10 right-10 opacity-20 animate-float animation-delay-1000">
              <Baby className="h-20 w-20 text-white animate-glow" />
            </div>
            <div className="absolute top-8 right-24 opacity-15 animate-float" style={{ animationDelay: '2s' }}>
              <Stethoscope className="h-14 w-14 text-white animate-glow" />
            </div>
            <div className="absolute -left-8 top-1/2 opacity-20 animate-float" style={{ animationDelay: '3s' }}>
              <Pill className="h-12 w-12 text-white animate-glow" />
            </div>
            <div className="absolute -right-6 top-1/3 opacity-20 animate-float" style={{ animationDelay: '4s' }}>
              <Syringe className="h-12 w-12 text-white animate-glow" />
            </div>
            <div className="absolute left-1/4 -bottom-8 opacity-15 animate-float" style={{ animationDelay: '5s' }}>
              <Hospital className="h-14 w-14 text-white animate-glow" />
            </div>
            <div className="absolute right-1/4 top-2 opacity-15 animate-float" style={{ animationDelay: '6s' }}>
              <Clipboard className="h-12 w-12 text-white animate-glow" />
            </div>
            <div className="absolute -top-6 right-1/3 opacity-20 animate-float" style={{ animationDelay: '7s' }}>
              <HeartPulse className="h-10 w-10 text-white animate-glow" />
            </div>
            <div className="absolute bottom-6 left-12 opacity-15 animate-float" style={{ animationDelay: '8s' }}>
              <Microscope className="h-12 w-12 text-white animate-glow" />
            </div>
            <div className="absolute top-20 left-1/3 opacity-20 animate-float hidden sm:block" style={{ animationDelay: '1.5s' }}>
              <Ambulance className="h-14 w-14 text-white animate-glow" />
            </div>
            <div className="absolute bottom-16 right-1/3 opacity-15 animate-float hidden sm:block" style={{ animationDelay: '2.6s' }}>
              <Cross className="h-12 w-12 text-white animate-glow" />
            </div>
            <div className="absolute top-1/2 right-4 opacity-20 animate-float hidden md:block" style={{ animationDelay: '3.6s' }}>
              <Bone className="h-12 w-12 text-white animate-glow" />
            </div>
            <div className="absolute top-1/4 left-16 opacity-15 animate-float hidden md:block" style={{ animationDelay: '4.4s' }}>
              <BriefcaseMedical className="h-12 w-12 text-white animate-glow" />
            </div>
            <div className="absolute bottom-24 left-1/2 opacity-20 animate-float hidden md:block" style={{ animationDelay: '5.4s' }}>
              <Dna className="h-11 w-11 text-white animate-glow" />
            </div>
            <div className="absolute top-6 left-1/2 opacity-15 animate-float hidden lg:block" style={{ animationDelay: '6.4s' }}>
              <FlaskConical className="h-11 w-11 text-white animate-glow" />
            </div>
            <div className="absolute bottom-8 right-24 opacity-20 animate-float hidden lg:block" style={{ animationDelay: '7.4s' }}>
              <Thermometer className="h-12 w-12 text-white animate-glow" />
            </div>
            <div className="absolute -bottom-6 left-1/3 opacity-15 animate-float hidden lg:block" style={{ animationDelay: '8.4s' }}>
              <TestTube className="h-12 w-12 text-white animate-glow" />
            </div>

            <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-2 backdrop-blur-sm">
              ✨ Start Your Journey Today
            </Badge>

            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white leading-tight">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/95 max-w-3xl mx-auto leading-relaxed">
              Book an appointment today and experience compassionate, expert care for you and your baby
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/appointments/book">
                <Button
                  size="lg"
                  className="text-lg px-10 py-7 bg-white text-maternal-primary hover:bg-gray-50 shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 group"
                >
                  <Calendar className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  <span className="font-semibold">Book Appointment</span>
                  <Sparkles className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-7 border-2 border-white text-white hover:bg-white hover:text-maternal-primary shadow-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 group backdrop-blur-sm"
                >
                  <Phone className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                  <span className="font-semibold">Contact Us</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 pt-12 border-t border-white/20">
              <div className="grid grid-cols-3 gap-8">
                {[
                  { icon: Shield, label: 'Safe & Secure', sublabel: 'Privacy Protected' },
                  { icon: Award, label: 'Expert Care', sublabel: 'Certified Specialists' },
                  { icon: Heart, label: 'Trusted by 10k+', sublabel: 'Happy Mothers' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="text-white transform hover:scale-110 transition-all duration-300"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <item.icon className="h-10 w-10 mx-auto mb-3 opacity-90" />
                    <p className="font-bold text-lg">{item.label}</p>
                    <p className="text-sm opacity-75 mt-1">{item.sublabel}</p>
                  </div>
                ))}
              </div>
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
    description: 'Comprehensive care throughout your pregnancy with regular check-ups and monitoring',
    icon: Heart,
    badge: 'Popular',
    slug: 'prenatal-care',
  },
  {
    title: 'Postnatal Care',
    description: 'Support and medical care for mothers after delivery, ensuring healthy recovery',
    icon: Users,
    badge: 'Essential',
    slug: 'postnatal-care',
  },
  {
    title: 'Ultrasound Services',
    description: '3D/4D ultrasound imaging to monitor baby development and detect any issues early',
    icon: Activity,
    badge: 'Advanced',
    slug: 'ultrasound',
  },
  {
    title: 'Baby Vaccination',
    description: 'Complete immunization schedule for newborns and infants following WHO guidelines',
    icon: Shield,
    badge: 'Recommended',
    slug: 'vaccination',
  },
  {
    title: 'Pediatric Care',
    description: 'Expert care for infants and children with specialized pediatricians',
    icon: Baby,
    badge: 'Available',
    slug: 'pediatric',
  },
  {
    title: 'Family Planning',
    description: 'Professional counseling and services for family planning and reproductive health',
    icon: CheckCircle,
    badge: 'Confidential',
    slug: 'family-planning',
  },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    comment: 'The care I received during my pregnancy was exceptional. The doctors and nurses made me feel safe and supported every step of the way.',
    service: 'Prenatal Care',
  },
  {
    name: 'Amina Mohammed',
    comment: 'From prenatal visits to delivery, everything was handled professionally. I couldn\'t have asked for better care for me and my baby.',
    service: 'Delivery Services',
  },
  {
    name: 'Grace Adeyemi',
    comment: 'The postnatal support was amazing. They helped me with breastfeeding and baby care. Highly recommend this hospital!',
    service: 'Postnatal Care',
  },
  {
    name: 'Blessing Okafor',
    comment: 'Dr. Aisha was incredibly caring and knowledgeable throughout my high-risk pregnancy. My baby and I are healthy thanks to the excellent care here.',
    service: 'High-Risk Pregnancy',
  },
  {
    name: 'Fatima Yusuf',
    comment: 'The ultrasound services are top-notch! Seeing my baby in 4D was such an emotional experience. The staff was gentle and professional.',
    service: 'Ultrasound Services',
  },
  {
    name: 'Chioma Nwosu',
    comment: 'From my first trimester to bringing my baby home, this hospital has been a blessing. The pediatric care for my newborn is exceptional!',
    service: 'Pediatric Care',
  },
]
