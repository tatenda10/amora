import React, { useState } from 'react'
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaGithub, FaPaperPlane } from 'react-icons/fa'
import logo from '../assets/logo.png'

const Footer = () => {
  const [emailData, setEmailData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Create mailto link
    const subject = encodeURIComponent(emailData.subject || 'Support Request')
    const body = encodeURIComponent(
      `Name: ${emailData.name}\nEmail: ${emailData.email}\n\nMessage:\n${emailData.message}`
    )
    const mailtoLink = `mailto:support@amoracompanion.site?subject=${subject}&body=${body}`

    // Open email client
    window.location.href = mailtoLink

    // Reset form after a delay
    setTimeout(() => {
      setEmailData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
      setSubmitStatus('success')
      setTimeout(() => setSubmitStatus(null), 3000)
    }, 500)
  }

  return (
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={logo} 
                alt="Amora Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">Amora</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your AI companion for meaningful connections. Experience authentic relationships powered by advanced AI.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaGithub size={20} />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#support" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Support Column with Email Form */}
          <div id="support">
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm mb-4">
              <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/csae-standards" className="hover:text-white transition-colors">CSAE Standards</a></li>
              <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={emailData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={emailData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={emailData.subject}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={emailData.message}
                onChange={handleChange}
                required
                rows="3"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
              {submitStatus === 'success' && (
                <p className="text-green-400 text-xs text-center">Email client opened!</p>
              )}
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Amora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

