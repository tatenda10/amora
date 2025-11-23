import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from '../assets/logo.png'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const handleNavClick = (e, targetId) => {
    // If we're not on the home page, navigate to home first, then scroll
    if (location.pathname !== '/') {
      e.preventDefault()
      window.location.href = `/#${targetId}`
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logo} 
              alt="Amora Logo" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Pricing
            </a>
            <a 
              href="#support" 
              onClick={(e) => handleNavClick(e, 'support')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Support
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <button className="text-gray-700 hover:text-gray-900 transition-colors">
              Sign In
            </button> */}
            <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="block text-gray-700 hover:text-gray-900"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="block text-gray-700 hover:text-gray-900"
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')}
              className="block text-gray-700 hover:text-gray-900"
            >
              Pricing
            </a>
            <a 
              href="#support" 
              onClick={(e) => handleNavClick(e, 'support')}
              className="block text-gray-700 hover:text-gray-900"
            >
              Support
            </a>
            <div className="pt-4 space-y-2 border-t border-gray-200">
              <button className="w-full text-left text-gray-700 hover:text-gray-900">
                Sign In
              </button>
              <button className="w-full bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header

