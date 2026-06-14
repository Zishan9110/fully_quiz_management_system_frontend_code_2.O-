// src/pages/auth/PaymentCancel.jsx
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function PaymentCancel() {
  useEffect(() => {
    toast.error('Payment was cancelled');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">💔</div>
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="space-y-3">
          <Link to="/student/courses" className="block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
            Browse Courses
          </Link>
          <Link to="/student/courses" className="block text-gray-600 hover:text-gray-800">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}