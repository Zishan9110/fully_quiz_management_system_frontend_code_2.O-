import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { adminLogin } from '@/store/slices/adminAuthSlice';

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.adminAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log("BUTTON CLICKED");
    console.log(form);

    const result = await dispatch(adminLogin(form));

    console.log("RESULT =", result);

    if (!result.error) {
      navigate('/admin/dashboard');
    } else {
      setError(result.payload || 'Admin login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center text-white text-3xl mb-4"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))' }}>🛡️</div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Portal</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Restricted access — Administrators only</p>
        </div>
        <div className="card shadow-xl border-2" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Admin Email</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="admin@company.com"
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
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
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
                  Signing in...
                </span>
              ) : 'Sign In to Admin'}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
            <Link to="/login" className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              ← Student Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}