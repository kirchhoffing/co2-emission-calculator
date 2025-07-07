// Purpose: Responsive, reusable Navbar for all pages in the CO2 Emission Calculator app.
// Uses Tailwind CSS for styling and next/link for navigation.

import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Calculator", href: "/calculator" },
  { name: "Reports", href: "/reports" },
  { name: "Help", href: "/help" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 left-0 z-50 bg-gradient-to-r from-green-900 via-black to-green-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* Left: Logo and App Name */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/co2-main-logo.png"
              alt="CO2 Emission Calculator Logo"
              width={36}
              height={36}
              priority
              className="rounded-full bg-white p-1 shadow"
            />
            <span className="text-xl font-bold text-white tracking-tight hidden sm:inline">
              CO2 Emission Calculator
            </span>
          </Link>
        </div>
        {/* Center: Navigation Links */}
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-2 sm:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        {/* Right: Auth Buttons */}
        <div className="flex items-center flex-shrink-0 space-x-2 sm:space-x-2">
          <Link
            href="/login"
            className="px-4 py-2 bg-white text-green-900 font-semibold rounded-md shadow hover:bg-green-100 transition-colors text-sm hidden sm:inline-block"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition-colors text-sm hidden sm:inline-block"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
} 