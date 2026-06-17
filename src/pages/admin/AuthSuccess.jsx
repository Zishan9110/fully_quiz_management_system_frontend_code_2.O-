import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const admin = params.get('admin');

    console.log('🔍 Auth Success Params:', { token, admin });

    if (token && admin) {
      try {
        const adminData = JSON.parse(decodeURIComponent(admin));
        localStorage.setItem('adminAccessToken', token);
        localStorage.setItem('admin', JSON.stringify(adminData));
        toast.success('Welcome, Admin!');
        navigate('/admin/dashboard');
      } catch (error) {
        console.error('Error:', error);
        navigate('/admin/login?error=invalid_data');
      }
    } else {
      navigate('/admin/login?error=missing_data');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary-500)' }} />
        <h2 className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Authenticating...
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Please wait while we redirect you
        </p>
      </motion.div>
    </div>
  );
}