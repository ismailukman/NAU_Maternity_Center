'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  Home,
  Stethoscope,
  Briefcase,
  Info,
  Phone,
  LogIn,
  Calendar,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/doctors', label: 'Our Doctors', icon: Stethoscope },
  { href: '/services', label: 'Services', icon: Briefcase },
  { href: '/about', label: 'About Us', icon: Info },
  { href: '/contact', label: 'Contact', icon: Phone },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Responsive with scroll behavior */}
          <Link href="/" className="group relative z-10">
            <div
              className={`transition-all duration-700 ease-out ${
                isScrolled
                  ? 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14'
                  : 'w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-56 lg:h-56'
              }`}
              style={{
                transform: isScrolled ? 'translateY(0)' : 'translateY(20%)',
              }}
            >
              <div
                className={`relative w-full h-full ${isScrolled ? '' : 'animate-float-logo'}`}
                style={{
                  filter: isScrolled ? 'none' : 'drop-shadow(0 8px 16px rgba(233, 30, 99, 0.3))',
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Natasha Akpoti-Uduaghan Maternity Centre Logo"
                  fill
                  className={`object-contain transition-transform duration-300 ${
                    isScrolled ? 'group-hover:scale-110' : 'group-hover:scale-105 group-hover:rotate-3'
                  }`}
                  priority
                />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-gray-700 font-medium hover:text-maternal-primary transition-all duration-300"
              >
                <span className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>{item.label}</span>
                </span>
                {/* Animated underline */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-maternal-primary to-maternal-secondary group-hover:w-full transition-all duration-300 rounded-full"></span>
                {/* Hover background */}
                <span className="absolute inset-0 bg-maternal-lighter opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10"></span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="group relative overflow-hidden hover:bg-maternal-lighter hover:text-maternal-primary transition-all duration-300"
              >
                <LogIn className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>Login</span>
              </Button>
            </Link>
            <Link href="/appointments/book">
              <Button className="maternal-gradient relative overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                <Calendar className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>Book Appointment</span>
                <Sparkles className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - Floating Effect */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-3 rounded-full text-white bg-gradient-to-r from-maternal-primary to-maternal-secondary shadow-lg hover:shadow-2xl transition-all duration-500 ${
              isMenuOpen
                ? 'translate-y-0 scale-100'
                : '-translate-y-6 scale-110'
            }`}
            style={{
              position: 'relative',
              top: isMenuOpen ? '0' : '-40%',
            }}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 rotate-90 transition-transform duration-500" />
            ) : (
              <Menu className="h-6 w-6 animate-pulse" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-maternal-primary hover:bg-maternal-lighter transition-all duration-300 py-3 px-4 rounded-lg group"
                style={{
                  animation: isMenuOpen ? `slideIn 0.3s ease-out ${index * 0.1}s both` : 'none'
                }}
              >
                <item.icon className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full group hover:bg-maternal-lighter hover:border-maternal-primary transition-all duration-300"
                >
                  <LogIn className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  Login
                </Button>
              </Link>
              <Link href="/appointments/book" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full maternal-gradient shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 group">
                  <Calendar className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  Book Appointment
                  <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  )
}
