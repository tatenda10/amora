import React from 'react'
import { FaApple, FaGooglePlay, FaArrowRight } from 'react-icons/fa'

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Driven Meaningful
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Connections Right Away
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
            From first conversation to deep connection – experience authentic relationships with personalized AI companions seamlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a 
              href="https://apps.apple.com/app/amora-ai-companion" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center gap-3 shadow-lg"
            >
              <FaApple size={24} />
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-base font-bold">App Store</div>
              </div>
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.amora.companion" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-black border-2 border-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center gap-3 shadow-lg"
            >
              <FaGooglePlay size={24} />
              <div className="text-left">
                <div className="text-xs">Get it on</div>
                <div className="text-base font-bold">Google Play</div>
              </div>
            </a>
          </div>

          {/* Phone Mockup with Features */}
          <div className="relative max-w-4xl mx-auto">
            {/* Central Phone Mockup */}
            <div className="relative z-10 flex justify-center">
              <div className="w-64 md:w-80 bg-black rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5] relative">
                  {/* Phone Status Bar */}
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-purple-600 p-3 text-white text-xs flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
                          alt="Companion"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-semibold">Sarah</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs">Live</span>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="pt-16 pb-20 px-4 h-full bg-gradient-to-b from-gray-50 to-white overflow-y-auto">
                    <div className="space-y-4">
                      {/* AI Message */}
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
                            alt="AI Companion"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm max-w-[80%]">
                          <p className="text-sm text-gray-800">Hey! How was your day? 😊</p>
                        </div>
                      </div>

                      {/* User Message */}
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm max-w-[80%]">
                          <p className="text-sm text-white">It was great! Just finished work</p>
                        </div>
                      </div>

                      {/* AI Message with Image */}
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
                            alt="AI Companion"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-sm overflow-hidden shadow-sm max-w-[80%]">
                          <img 
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop" 
                            alt="Shared moment"
                            className="w-full h-32 object-cover"
                          />
                          <div className="px-4 py-2">
                            <p className="text-sm text-gray-800">This reminded me of you! 🌸</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        readOnly
                      />
                      <button className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                        <FaArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Feature Cards */}
            {/* Engagement Card */}
            <div className="absolute top-10 left-0 md:left-10 bg-yellow-100 rounded-2xl p-4 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                </div>
              </div>
            </div>

            {/* Connection Card */}
            <div className="absolute top-40 right-0 md:right-10 bg-blue-100 rounded-2xl p-4 shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Connection</p>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="absolute bottom-20 left-0 md:left-10 bg-green-100 rounded-2xl p-4 shadow-xl transform rotate-2 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">10K+</p>
                </div>
              </div>
            </div>

            {/* Conversation Quality Card */}
            <div className="absolute bottom-10 right-0 md:right-10 bg-pink-100 rounded-2xl p-4 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-400 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Quality</p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★★★★★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

