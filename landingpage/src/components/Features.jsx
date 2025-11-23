import React from 'react'
import { FaHeart, FaComments, FaBrain, FaShieldAlt, FaMobileAlt, FaClock } from 'react-icons/fa'

const Features = () => {
  const features = [
    {
      icon: FaHeart,
      title: 'Personalized Companions',
      description: 'AI companions tailored to your preferences and personality',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50'
    },
    {
      icon: FaComments,
      title: 'Natural Conversations',
      description: 'Engage in authentic, meaningful conversations that feel real',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: FaBrain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI that learns and adapts to your communication style',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: FaShieldAlt,
      title: 'Private & Secure',
      description: 'Your conversations are encrypted and completely private',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: FaMobileAlt,
      title: 'Available Everywhere',
      description: 'Access your companions on iOS, Android, and Web',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: FaClock,
      title: '24/7 Availability',
      description: 'Your companions are always there when you need them',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50'
    }
  ]

  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need for
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Meaningful Connections
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of AI companionship with features designed for authentic relationships
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`${feature.bgColor} rounded-2xl p-8 hover:shadow-xl transition-all transform hover:-translate-y-2`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features

