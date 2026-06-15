import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { register } from '@/store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmPassword) { 
      setError('Passwords do not match'); 
      return; 
    }
    
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    const { confirmPassword, ...data } = form;
    const result = await dispatch(register(data));
    
    if (!result.error) {
      navigate('/login');
    } else {
      setError(result.payload || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--color-bg)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-white text-2xl mb-4"
            style={{ background: 'var(--color-primary)' }}>📝</div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Create account</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Join QuizMaster today</p>
        </div>
        <div className="card shadow-xl">
          {error && <div className="mb-4 p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>First Name</label>
                <input 
                  className="input-field" 
                  placeholder="John" 
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} 
                  required 
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Last Name</label>
                <input 
                  className="input-field" 
                  placeholder="Doe" 
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} 
                  required 
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Email</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="you@example.com" 
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                required 
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Min. 8 characters" 
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                required 
                minLength={8}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Confirm Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} 
                required 
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full justify-center py-3" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}