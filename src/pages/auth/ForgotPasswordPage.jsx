import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { studentApi as api } from '@/services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-2xl mb-4"
              style={{ background: 'rgba(99,102,241,0.1)' }}>🔑</div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Forgot Password</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>We'll send a reset link to your email</p>
          </div>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✉️</div>
              <p className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Check your inbox</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Reset link sent to {email}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Email Address</label>
                <input type="email" className="input-field" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          )}
          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
            <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>← Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
