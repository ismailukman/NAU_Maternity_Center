'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Heart, Lock, Mail, Eye, EyeOff, User, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Implement patient authentication
      // For now, show a message
      toast.info('Patient login coming soon!')
      console.log('Login attempt:', { email, password })
    } catch (error) {
      setError('An error occurred. Please try again.')
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-maternal-primary/10 via-white to-maternal-secondary/10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-maternal-primary/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-maternal-secondary/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        {/* Decorative hearts */}
        <div className="absolute top-10 right-1/4 opacity-5">
          <Heart className="h-16 w-16 text-maternal-primary animate-float" fill="currentColor" />
        </div>
        <div className="absolute bottom-10 left-1/4 opacity-5">
          <Heart className="h-20 w-20 text-maternal-secondary animate-float animation-delay-1000" fill="currentColor" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-maternal-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32 animate-float-logo">
            <Image
              src="/logo.png"
              alt="Hospital Logo"
              fill
              className="object-contain"
              style={{
                filter: 'drop-shadow(0 10px 20px rgba(233, 30, 99, 0.3))',
              }}
            />
          </div>
        </div>

        <Card className="border-2 border-maternal-primary/20 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-maternal-primary to-maternal-secondary rounded-full flex items-center justify-center mb-4 shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-maternal-primary to-maternal-secondary bg-clip-text text-transparent">
              Patient Login
            </CardTitle>
            <CardDescription className="text-base">
              Natasha Akpoti-Uduaghan Maternity Centre
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address or Phone Number
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="your@email.com or phone number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 border-2 focus:border-maternal-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-maternal-primary hover:text-maternal-secondary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-12 border-2 focus:border-maternal-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 maternal-gradient text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="font-medium text-maternal-primary hover:text-maternal-secondary transition-colors"
                  >
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  Are you staff?{' '}
                  <Link
                    href="/admin/login"
                    className="font-medium text-maternal-secondary hover:text-maternal-primary transition-colors"
                  >
                    Admin Login
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Secure patient portal access
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-gray-600">
          &copy; {new Date().getFullYear()} Natasha Akpoti-Uduaghan Maternity Centre
        </p>
      </div>
    </div>
  )
}
