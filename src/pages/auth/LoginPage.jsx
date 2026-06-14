import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { login } from '@/store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

const handleSubmit = async (e) => {
  e.preventDefault();

  const result = await dispatch(login(form));

  // alert(JSON.stringify(result.type));

  if (!result.error) {
    // alert("Navigation Starting");
    navigate('/student/dashboard');
  } else {
    alert("Login Failed");
  }
};

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-secondary))' }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl mb-8">📝</div>
          <h1 className="text-4xl font-bold mb-4">QuizMaster</h1>
          <p className="text-xl text-white/80 mb-8">Enterprise Quiz Management System</p>
          <div className="space-y-4">
            {['Smart Analytics & Insights','Real-time Leaderboards','AI-Powered Questions (Coming Soon)'].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          <div className="card shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Welcome back</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Sign in to your student account</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Email</label>
                <input type="email" className="input-field" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Forgot password?</Link>
                </div>
                <input type="password" className="input-field" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sign up</Link>
            </p>
            <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
              <Link to="/admin/login" className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Admin Portal →</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
