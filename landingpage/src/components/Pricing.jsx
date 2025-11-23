import React from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out Amora',
      features: [
        '1 AI Companion',
        '50 messages per day',
        'Basic conversations',
        'Standard response time',
        'Community support'
      ],
      cta: 'Get Started',
      popular: false,
      color: 'from-gray-400 to-gray-600'
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      description: 'For deeper connections',
      features: [
        'Unlimited Companions',
        'Unlimited messages',
        'Advanced AI responses',
        'Priority support',
        'Custom companion creation',
        'Voice messages',
        'Photo sharing',
        '24/7 availability'
      ],
      cta: 'Start Premium',
      popular: true,
      color: 'from-pink-500 to-purple-600'
    },
    {
      name: 'Pro',
      price: '$19.99',
      period: 'per month',
      description: 'Ultimate experience',
      features: [
        'Everything in Premium',
        'AI companion training',
        'Advanced memory system',
        'Priority AI processing',
        'Dedicated support',
        'Early access to features',
        'API access',
        'Custom integrations'
      ],
      cta: 'Go Pro',
      popular: false,
      color: 'from-purple-600 to-indigo-600'
    }
  ]

  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for you. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-pink-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing

