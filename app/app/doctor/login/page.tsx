'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Stethoscope, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

const DEMO_EMAIL = 'onimisi@@naumaternity.com'
const DEMO_PASSWORD = 'Onimisi@54321'
const ALT_DEMO_EMAIL = 'onimisi@naumaternity.com'

export default function DoctorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (
      (normalizedEmail === DEMO_EMAIL.toLowerCase() || normalizedEmail === ALT_DEMO_EMAIL) &&
      password === DEMO_PASSWORD
    ) {
      toast.success('Welcome, Prof. Dr. Onimisi Okene')
      router.push('/doctor/dashboard')
      return
    }

    toast.error('Invalid doctor credentials.')
  }

  const handleDemoFill = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maternal-primary/10 via-white to-maternal-secondary/15 px-4 py-12">
      <div className="w-full max-w-4xl grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-2 border-maternal-primary/20 shadow-2xl bg-white/95">
          <CardHeader className="space-y-2">
            <div className="flex justify-center">
              <Link href="/" className="relative w-24 h-24">
                <Image
                  src="/logo.png"
                  alt="Natasha Akpoti-Uduaghan Maternity Centre Logo"
                  fill
                  className="object-contain"
                  style={{ filter: 'drop-shadow(0 10px 20px rgba(233, 30, 99, 0.3))' }}
                />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-maternal-primary to-maternal-secondary flex items-center justify-center text-white">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Doctor Portal</CardTitle>
                <CardDescription>Secure access to patient records and care plans.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-email">Email</Label>
                <Input
                  id="doctor-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="doctor@naumaternity.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-password">Password</Label>
                <div className="relative">
                  <Input
                    id="doctor-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="maternal-gradient w-full">
                  Doctor Loging
                </Button>
                <Button type="button" variant="outline" onClick={handleDemoFill} className="w-full">
                  Use Demo Login
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                By signing in you agree to the clinic privacy policy.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card className="border-2 border-maternal-primary/10 shadow-lg bg-gradient-to-br from-maternal-primary to-maternal-secondary text-white">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" />
              <div>
                <CardTitle>Demo Doctor Login</CardTitle>
                <CardDescription className="text-white/80">
                  Use this access to explore the medical record tracking UI.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-white/10 border border-white/20 p-4">
              <p className="text-sm uppercase tracking-wide text-white/70">Doctor</p>
              <p className="text-lg font-semibold">Prof. Dr. Onimisi Okene</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/20 p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Qualifications</p>
                <p className="text-sm font-semibold">MBBS, FWACS, FMCOG</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Specialty</p>
                <p className="text-sm font-semibold">Obstetrics & Gynecology</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Experience</p>
                <p className="text-sm font-semibold">18+ years in maternal-fetal medicine</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Awards</p>
                <p className="text-sm font-semibold">Kogi Maternal Health Excellence Award (2024)</p>
              </div>
            </div>
            <p className="text-sm text-white/80">
              This workspace tracks prenatal, postnatal, and postpartum records with lab insights and care plans.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
