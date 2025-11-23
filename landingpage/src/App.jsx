import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Stats from './components/Stats'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import PrivacyPolicy from './components/PrivacyPolicy'
import CSAEPolicy from './components/CSAEPolicy'
import TermsOfService from './components/TermsOfService'

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Pricing />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/csae-standards" element={<CSAEPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </Router>
  )
}

export default App
