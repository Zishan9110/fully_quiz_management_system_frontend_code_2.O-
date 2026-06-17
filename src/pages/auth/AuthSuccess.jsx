import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { setUser } from '@/store/slices/authSlice';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    console.log('🔍 AuthSuccess - Token:', token ? 'Present' : 'Missing');
    
    if (error) {
      navigate('/login?error=google_auth_failed');
      return;
    }
    
    if (token) {
      // Store token
      localStorage.setItem('accessToken', token);
      
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch(setUser(user));
          setTimeout(() => {
            navigate('/student/dashboard');
          }, 1500);
          return;
        } catch (e) {
          console.error('Failed to parse user:', e);
        }
      }
      
      // If no user in localStorage, redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      navigate('/login');
    }
  }, [location, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Successfully Authenticated!
        </h2>
        <p className="text-gray-500">Redirecting to dashboard...</p>
      </motion.div>
    </div>
  );
}