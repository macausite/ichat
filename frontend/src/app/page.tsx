'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaComments, FaLock, FaUserFriends, FaBolt, FaMobileAlt, FaGlobe } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="z-10 w-full backdrop-blur-sm bg-white/70 fixed top-0 left-0 right-0 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <FaComments className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">iChat</span>
            </div>
            <div className="hidden md:flex space-x-4 items-center">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Testimonials</a>
              <Link href="/login" className="ml-8 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ease-in-out">
                Sign In
              </Link>
              <Link href="/register" className="ml-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ease-in-out">
                Sign Up
              </Link>
            </div>
            <div className="md:hidden">
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                onClick={() => router.push('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center animate-slide-in-left" style={{animationDelay: '0.2s'}}>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Communicate with</span>
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">style and ease</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
                Experience real-time messaging with a modern, intuitive interface. Connect with friends, colleagues, and communities seamlessly.  
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors duration-300 ease-in-out">
                  Get Started
                </Link>
                <a 
                  href="#features" 
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-colors duration-300 ease-in-out"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6 xl:col-span-7 flex justify-center lg:justify-end animate-slide-in-right" style={{animationDelay: '0.4s'}}>
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-2xl opacity-30 animate-pulse-slow"></div>
                <div className="relative bg-white shadow-lg rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                          <FaUserFriends className="h-5 w-5" />
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">Team Chat</h3>
                        <p className="text-xs opacity-80">8 members • 2 online</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 h-80 bg-gray-50 flex flex-col">
                    <div className="flex-grow space-y-4 overflow-hidden">
                      <div className="flex">
                        <div className="bg-white rounded-lg rounded-bl-none px-4 py-2 shadow-sm max-w-[75%] text-sm text-gray-800">
                          <p>Hey team! Has everyone reviewed the new design?</p>
                          <div className="mt-1 text-xs text-gray-500 text-right">9:32 AM</div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg rounded-br-none px-4 py-2 shadow-sm max-w-[75%] text-sm text-white">
                          <p>Yes! I love the new interface, especially the message bubbles and animations.</p>
                          <div className="mt-1 text-xs text-indigo-100 text-right">9:34 AM</div>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-white rounded-lg rounded-bl-none px-4 py-2 shadow-sm max-w-[75%] text-sm text-gray-800">
                          <p>The responsiveness is impressive too! Works great on mobile.</p>
                          <div className="mt-1 text-xs text-gray-500 text-right">9:36 AM</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 relative">
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm" 
                        placeholder="Type a message..." 
                        disabled
                      />
                      <button className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-4 text-indigo-600 disabled:opacity-50" disabled>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Features that make communication better
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need for seamless, modern messaging
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-slide-in-up" style={{animationDelay: '0.5s'}}>
            {/* Feature 1 */}
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <FaBolt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Real-time Messaging</h3>
              <p className="mt-2 text-center text-base text-gray-500">
                Instant communication with real-time message delivery and typing indicators.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <FaUserFriends className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Group Chats</h3>
              <p className="mt-2 text-center text-base text-gray-500">
                Create and manage group conversations with multiple participants easily.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <FaLock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Secure Communication</h3>
              <p className="mt-2 text-center text-base text-gray-500">
                End-to-end encryption ensures your conversations remain private and secure.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <FaMobileAlt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Mobile Friendly</h3>
              <p className="mt-2 text-center text-base text-gray-500">
                Responsive design ensures a great experience on any device, from desktop to phone.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <FaGlobe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Cross-Platform</h3>
              <p className="mt-2 text-center text-base text-gray-500">
                Access your chats from anywhere - web, desktop, and mobile applications.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Rich Media Sharing</h3>
              <p className="mt-2 text-center text-base text-gray-500">
                Share photos, videos, and documents directly in your conversations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-indigo-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What our users are saying
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Don't just take our word for it
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3 animate-slide-in-up" style={{animationDelay: '0.5s'}}>
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-indigo-800">AK</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Alex Kim</h4>
                  <p className="text-gray-500">Product Manager</p>
                </div>
              </div>
              <p className="text-gray-600">
                "iChat has transformed how our team communicates. The interface is intuitive, and the real-time features make collaboration so much more efficient."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-indigo-800">SJ</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Sarah Johnson</h4>
                  <p className="text-gray-500">UX Designer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As a designer, I appreciate the clean and modern interface. The attention to detail in animations and the overall user experience is outstanding."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-indigo-800">MR</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Michael Rodriguez</h4>
                  <p className="text-gray-500">Software Developer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The performance and reliability of iChat is impressive. Even with large group chats, everything stays fast and responsive. Great job on the technical implementation!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Start chatting today
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-indigo-100">
            Join thousands of users who've already upgraded their messaging experience
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/register" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-colors duration-300 ease-in-out">
              Sign up for free
            </Link>
            <Link href="/login" className="ml-4 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-800 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10 transition-colors duration-300 ease-in-out">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="/careers" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/community" className="text-gray-300 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms</a></li>
                <li><a href="/security" className="text-gray-300 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <FaComments className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">iChat</span>
            </div>
            <p className="mt-4 md:mt-0 text-gray-400 text-sm">
              © {new Date().getFullYear()} iChat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
