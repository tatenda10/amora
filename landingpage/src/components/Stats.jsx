import React from 'react'

const Stats = () => {
  const stats = [
    { value: '100K+', label: 'Active Users', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop' },
    { value: '5M+', label: 'Messages Sent', image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=300&fit=crop' },
    { value: '50+', label: 'AI Companions', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop' },
    { value: '4.9/5', label: 'User Rating', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop' }
  ]

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="relative h-32 mb-4 rounded-xl overflow-hidden">
                <img
                  src={stat.image}
                  alt={stat.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats

