import React from 'react'
import { FaUserPlus, FaComments, FaHeart } from 'react-icons/fa'

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: FaUserPlus,
      title: 'Create Your Profile',
      description: 'Sign up and tell us about yourself. Our AI learns your preferences, interests, and communication style to match you with the perfect companion.',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50'
    },
    {
      number: '02',
      icon: FaComments,
      title: 'Start Conversations',
      description: 'Begin chatting with your AI companion. Experience natural, flowing conversations that feel authentic and meaningful from the very first message.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      number: '03',
      icon: FaHeart,
      title: 'Build Connections',
      description: 'Watch your relationship grow. Your companion remembers your conversations, learns your preferences, and becomes more personalized over time.',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting started with Amora is simple. Follow these three easy steps to begin your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="relative"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center z-10">
                  <span className="text-white font-bold text-xl">{step.number}</span>
                </div>

                {/* Step Card */}
                <div className={`${step.bgColor} rounded-2xl p-8 pt-12 h-full hover:shadow-xl transition-all transform hover:-translate-y-2`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

