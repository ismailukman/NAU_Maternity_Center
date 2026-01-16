import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Mail, MapPin, Twitter, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* About */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Natasha Akpoti-Uduaghan Maternity Centre Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight">Natasha Akpoti-Uduaghan</h3>
                <p className="text-xs text-maternal-light">Maternity Centre</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm">
              Providing compassionate and expert care for mothers and babies. Your trusted partner in the journey of motherhood.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/services" className="hover:text-maternal-primary transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-maternal-primary transition-colors">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link href="/appointments/book" className="hover:text-maternal-primary transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-maternal-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Our Services</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>Prenatal Care</li>
              <li>Postnatal Care</li>
              <li>Pediatrics</li>
              <li>Ultrasound Services</li>
              <li>Family Planning</li>
              <li>Baby Vaccination</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact Us</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-maternal-primary flex-shrink-0 mt-0.5" />
                <span>123 Ohi Market Road, Ihima, Okehi LGA, Kogi State, Nigeria</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-maternal-primary flex-shrink-0" />
                <span>+234 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-maternal-primary flex-shrink-0" />
                <span>info@maternitycare.com</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-maternal-primary transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-maternal-primary transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-maternal-primary transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center rounded-full border border-maternal-primary/60 px-4 py-2 text-xs sm:text-sm font-semibold text-maternal-primary hover:bg-maternal-primary hover:text-white transition-colors"
            >
              Admin Portal
            </Link>
            <Link
              href="/doctor/login"
              className="inline-flex items-center justify-center rounded-full border border-maternal-primary/60 px-4 py-2 text-xs sm:text-sm font-semibold text-maternal-primary hover:bg-maternal-primary hover:text-white transition-colors"
            >
              Doctor Portal
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Natasha Akpoti-Uduaghan Maternity Centre. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:text-maternal-primary transition-colors">
              Privacy Policy
            </Link>
            {' • '}
            <Link href="/terms" className="hover:text-maternal-primary transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
