import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src="/logo.png"
                  alt="Natasha Akpoti-Uduaghan Maternity Centre Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">Natasha Akpoti-Uduaghan</h3>
                <p className="text-xs text-maternal-light">Maternity Centre</p>
              </div>
            </div>
            <p className="text-sm">
              Providing compassionate and expert care for mothers and babies. Your trusted partner in the journey of motherhood.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
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
            <h3 className="text-white font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Prenatal Care</li>
              <li>Postnatal Care</li>
              <li>Pediatrics</li>
              <li>Ultrasound Services</li>
              <li>Family Planning</li>
              <li>Baby Vaccination</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-maternal-primary flex-shrink-0 mt-0.5" />
                <span>123 Care Street, Medical District, Your City</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-maternal-primary" />
                <span>+234 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-maternal-primary" />
                <span>info@maternitycare.com</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-2">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-maternal-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-maternal-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-maternal-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
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
