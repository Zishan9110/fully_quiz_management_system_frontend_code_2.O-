import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { adminLogin, adminGoogleLogin, clearPending } from '@/store/slices/adminAuthSlice';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isPendingApproval, pendingMessage } = useSelector(s => s.adminAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pending = params.get('pending');
    const message = params.get('message');
    const error = params.get('error');
    const token = params.get('token');
    const adminData = params.get('admin');

    console.log('🔍 URL Params:', Object.fromEntries(params));

    if (error) {
      toast.error('Google login failed: ' + error);
      navigate('/admin/login', { replace: true });
    }

    if (pending === 'true' && message) {
      setShowPending(true);
      dispatch({
        type: 'adminAuth/setPending',
        payload: { isPendingApproval: true, pendingMessage: decodeURIComponent(message) }
      });
    }

    if (token && adminData) {
      try {
        const admin = JSON.parse(decodeURIComponent(adminData));
        localStorage.setItem('adminAccessToken', token);
        localStorage.setItem('admin', JSON.stringify(admin));
        navigate('/admin/dashboard');
        toast.success('Welcome, Admin!');
      } catch (error) {
        console.error('Error parsing admin data:', error);
        toast.error('Login failed');
      }
    }
  }, [location, dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(adminLogin(form));
    if (!result.error) {
      navigate('/admin/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const redirectUrl = `${apiUrl}/admin/auth/google`;

    console.log('🔗 Redirecting to:', redirectUrl);
    console.log('📡 API URL:', apiUrl);

    if (!apiUrl) {
      toast.error('API URL not configured');
      setGoogleLoading(false);
      return;
    }

    window.location.href = redirectUrl;
  };

  // ============================================
  // PENDING APPROVAL UI
  // ============================================
  if (isPendingApproval || showPending) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md"
        >
          <div className="card shadow-xl border-2 p-8 text-center" style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}>
            {/* Icon */}
            <div className="text-6xl mb-4">⏳</div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Pending Approval
            </h2>
            
            {/* Message */}
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {pendingMessage || 'Your admin account is pending approval from super administrator.'}
            </p>
            
            {/* Email Notification Box */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800">
                    Email Notification
                  </p>
                  <p className="text-xs text-blue-600">
                    You will receive an email notification once your account is approved by the super administrator.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Support */}
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <p className="text-xs text-gray-500">
                Need help? Contact support at{' '}
                <a href="mailto:zishanshams44@gmail.com" className="text-blue-600 hover:underline">
                  zishanshams44@gmail.com
                </a>
              </p>
            </div>
            
            {/* Back Button */}
            <button
              onClick={() => {
                dispatch(clearPending());
                setShowPending(false);
                localStorage.removeItem('adminAccessToken');
                navigate('/admin/login');
              }}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))' }}
            >
              Go Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // MAIN LOGIN UI
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center text-white text-3xl mb-4"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))' }}>
            🛡️
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Admin Portal
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Restricted access — Administrators only
          </p>
        </div>

        {/* Login Card */}
        <div className="card shadow-xl border-2" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: 'rgba(99,102,241,0.3)',
              background: 'transparent',
              color: 'var(--color-text-primary)'
            }}
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" 
                    style={{ borderColor: 'var(--color-primary-500)' }} />
            ) : (
              <>
                {/* Google SVG Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-medium">Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgba(99,102,241,0.15)' }}></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3" style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Admin Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{
                  background: 'var(--color-input-bg)',
                  borderColor: 'rgba(99,102,241,0.2)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="admin@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{
                  background: 'var(--color-input-bg)',
                  borderColor: 'rgba(99,102,241,0.2)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))' }}
              disabled={loading}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In to Admin'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <a
              href="/admin/forgot-password"
              className="text-sm hover:underline transition-all duration-200"
              style={{ color: 'var(--color-primary-500)' }}
            >
              Forgot Password?
            </a>
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Need an admin account? Contact{' '}
              <a href="mailto:zishanshams44@gmail.com" className="text-blue-600 hover:underline">
                zishanshams44@gmail.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}