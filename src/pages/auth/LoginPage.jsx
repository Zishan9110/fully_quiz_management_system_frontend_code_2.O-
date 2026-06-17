import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { login, getMe } from '@/store/slices/authSlice';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { GoogleOAuthProvider } from '@react-oauth/google';

// 🔥🔥 FINAL FIX: Hardcode Client ID (Vercel build ke liye)
const GOOGLE_CLIENT_ID = '961250183314-9t5r7d6hs1r4i26la2ge68h1r7rdsa1d.apps.googleusercontent.com';

console.log('🔍 Google Client ID:', GOOGLE_CLIENT_ID);

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check for token in URL (OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      console.error('Google auth error:', error);
      alert('Google authentication failed. Please try again.');
    }
    
    if (token) {
      localStorage.setItem('accessToken', token);
      dispatch(getMe()).then((result) => {
        if (!result.error) {
          navigate('/student/dashboard');
        } else {
          localStorage.removeItem('accessToken');
          navigate('/login');
        }
      });
    }
  }, [location, dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (!result.error) {
      navigate('/student/dashboard');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
          <motion.div 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="card shadow-xl p-8 bg-white rounded-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Welcome back</h2>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Sign in to your student account</p>
              </div>

              {/* 🔥 Google Login Button */}
              <GoogleLoginButton 
                isLoading={googleLoading} 
                setIsLoading={setGoogleLoading}
                buttonText="Continue with Google"
              />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'rgba(226,232,240,0.6)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 bg-white" style={{ color: 'var(--color-text-muted)' }}>Or continue with</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="you@example.com"
                    value={form.email} 
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                    required 
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                      Forgot password?
                    </Link>
                  </div>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="••••••••"
                    value={form.password} 
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                  Sign up
                </Link>
              </p>
              <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'rgba(226,232,240,0.6)' }}>
                <Link to="/admin/login" className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Admin Portal →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}