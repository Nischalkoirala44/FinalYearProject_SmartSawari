import Link from "next/link"
import { MapPin, Mail, Phone, Car } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#0e1f2e] border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full p-1 flex bg-white items-center justify-center">
                <Car className="w-9 h-9 text-red-600" />
              </div>
              <p className="text-lg font-bold text-white">Smart<span className="text-lg font-bold text-red-600"> Sawari</span></p>
            </div>
            <p className="text-sm text-white text-pretty">
              Your trusted platform for verified vehicle rentals and ride-sharing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/vehicles" className="text-white hover:text-red-600 transition-colors">
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-red-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-red-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white hover:text-red-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="font-semibold mb-4 text-white">For Owners</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="text-white hover:text-red-600 transition-colors">
                  List Your Vehicle
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="text-white hover:text-red-600 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner/benefits" className="text-white hover:text-red-600 transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/owner/support" className="text-white hover:text-red-600 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Inaruwa, Sunsari</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+977 9829346882</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@smartsawari.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-white">
          <p>&copy; {new Date().getFullYear()} Smart Sawari. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
