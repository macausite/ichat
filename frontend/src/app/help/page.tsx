import React from 'react';
import Link from 'next/link';

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600">
            Resources and support to help you make the most of iChat
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Support Resources</h2>
          <p className="text-gray-600 mb-6">
            This is a placeholder page. Help and support resources will be added soon.
          </p>
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
