import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { adminLogin, clearPending } from '@/store/slices/adminAuthSlice';
import AdminGoogleLoginButton from '@/components/AdminGoogleLoginButton';
import { GoogleOAuthProvider } from '@react-oauth/google';
import toast from 'react-hot-toast';

// 🔥 Production Client ID
const GOOGLE_CLIENT_ID = '911883997962-ssvol6fp3hak0nf2mah881sn81p5n42f.apps.googleusercontent.com';

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

    // ✅ Handle redirect callback (if using backend redirect flow)
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
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Pending Approval
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {pendingMessage || 'Your admin account is pending approval from super administrator.'}
            </p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800">Email Notification</p>
                  <p className="text-xs text-blue-600">
                    You will receive an email notification once your account is approved by the super administrator.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <p className="text-xs text-gray-500">
                Need help? Contact support at{' '}
                <a href="mailto:zishanshams44@gmail.com" className="text-blue-600 hover:underline">
                  zishanshams44@gmail.com
                </a>
              </p>
            </div>
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md"
        >
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

          <div className="card shadow-xl border-2" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>

            {/* ✅ Google Login Button - Using Google SDK */}
            <AdminGoogleLoginButton 
              isLoading={googleLoading} 
              setIsLoading={setGoogleLoading}
              buttonText="Continue with Google"
            />

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
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In to Admin'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <a
                href="/admin/forgot-password"
                className="text-sm hover:underline transition-all duration-200"
                style={{ color: 'var(--color-primary-500)' }}
              >
                Forgot Password?
              </a>
            </div>
            
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
    </GoogleOAuthProvider>
  );
}