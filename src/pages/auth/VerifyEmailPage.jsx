import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { studentApi as api } from '@/services/api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(({ data }) => { setStatus('success'); setMessage(data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed'); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="card shadow-xl text-center py-12">
          {status === 'loading' && <><div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p style={{ color: 'var(--color-text-secondary)' }}>Verifying your email...</p></>}
          {status === 'success' && <><div className="text-5xl mb-4">✅</div><h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Email Verified!</h2><p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{message}</p><Link to="/login" className="btn-primary">Go to Login</Link></>}
          {status === 'error' && <><div className="text-5xl mb-4">❌</div><h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Verification Failed</h2><p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{message}</p><Link to="/login" className="btn-secondary">Back to Login</Link></>}
        </div>
      </motion.div>
    </div>
  );
}
