import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { toggleDark } from '@/store/slices/themeSlice';
import { adminApi as api } from '@/services/api';

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(226,232,240,0.4)' }}>
    <div>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
      {description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
    </div>
    <button onClick={onChange} className="relative flex-shrink-0">
      <div className="w-11 h-6 rounded-full transition-colors" style={{ background: checked ? 'var(--color-primary)' : 'rgba(226,232,240,0.8)' }} />
      <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform: checked ? 'translateX(20px)' : 'none' }} />
    </button>
  </div>
);

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { admin } = useSelector(s => s.adminAuth);
  const { isDark } = useSelector(s => s.theme);
  const dispatch = useDispatch();
  const [thumbUploading, setThumbUploading] = useState(false);
  const avatarRef = useRef(null);
  const [siteSettings, setSiteSettings] = useState({ site_name: 'QuizMaster', site_tagline: 'Enterprise Quiz System', allow_registration: true, email_verification: true, default_quiz_duration: 60, leaderboard_enabled: true });

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/settings').then(r => r.data.data),
    onSuccess: (data) => {
      setSiteSettings(prev => ({ ...prev, ...data }));
    }
  });

  const saveMut = useMutation({
    mutationFn: (s) => api.put('/settings/bulk', {
      settings: Object.entries(s).map(([key, value]) => ({ key, value }))
    }),
    onSuccess: () => { qc.invalidateQueries(['admin-settings']); toast.success('Settings saved!'); },
    onError: () => toast.error('Save failed')
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbUploading(true);
    const fd = new FormData();
    fd.append('profilePicture', file);
    try {
      await api.post('/upload/admin/profile-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile picture updated!');
    } catch { toast.error('Upload failed'); }
    finally { setThumbUploading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>System configuration</p>
      </div>

      {/* Admin Profile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>👤 Admin Profile</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {admin?.profilePicture
              ? <img src={admin.profilePicture} className="w-16 h-16 rounded-2xl object-cover" alt="" />
              : <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: 'var(--color-primary)' }}>
                  {admin?.firstName?.[0]}{admin?.lastName?.[0]}
                </div>}
            <button onClick={() => avatarRef.current?.click()} disabled={thumbUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
              style={{ background: 'var(--color-primary)' }}>
              {thumbUploading ? '⏳' : '📷'}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{admin?.firstName} {admin?.lastName}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{admin?.email}</p>
            <span className="badge badge-primary text-xs mt-1 capitalize">{admin?.role?.replace('_', ' ')}</span>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>🎨 Appearance</h3>
        <Toggle checked={isDark} onChange={() => dispatch(toggleDark())} label="Dark Mode" description="Toggle light/dark theme" />
      </motion.div>

      {/* Site Settings */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>⚙️ Site Settings</h3>
        <div className="space-y-4">
          {[['site_name','Site Name'],['site_tagline','Tagline']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{label}</label>
              <input className="input-field" value={siteSettings[key] || ''}
                onChange={e => setSiteSettings(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Default Quiz Duration (minutes)</label>
            <input type="number" className="input-field max-w-[120px]" value={siteSettings.default_quiz_duration || 60}
              onChange={e => setSiteSettings(p => ({ ...p, default_quiz_duration: Number(e.target.value) }))} />
          </div>
          <Toggle checked={!!siteSettings.allow_registration}
            onChange={() => setSiteSettings(p => ({ ...p, allow_registration: !p.allow_registration }))}
            label="Allow Student Registration" description="Enable/disable public student registration" />
          <Toggle checked={!!siteSettings.email_verification}
            onChange={() => setSiteSettings(p => ({ ...p, email_verification: !p.email_verification }))}
            label="Email Verification Required" description="Require students to verify email before login" />
          <Toggle checked={!!siteSettings.leaderboard_enabled}
            onChange={() => setSiteSettings(p => ({ ...p, leaderboard_enabled: !p.leaderboard_enabled }))}
            label="Enable Leaderboard" description="Show leaderboard to students" />
        </div>
        <button className="btn-primary mt-5" onClick={() => saveMut.mutate(siteSettings)} disabled={saveMut.isPending}>
          {saveMut.isPending
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            : '💾 Save Settings'}
        </button>
      </motion.div>

      {/* AI Status */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>🤖 AI Module Status</h3>
        <AIStatus />
      </motion.div>
    </div>
  );
}

function AIStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => api.get('/ai/status').then(r => r.data.data).catch(() => ({ available: false }))
  });

  if (isLoading) return <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${data?.available ? 'bg-green-500' : 'bg-red-400'}`} />
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Gemini AI {data?.available ? 'Connected' : 'Not configured'}
        </span>
      </div>
      {data?.available ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {data.features?.map(f => <span key={f} className="badge badge-success text-xs">{f}</span>)}
        </div>
      ) : (
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Set GEMINI_API_KEY in .env to enable AI features</p>
      )}
    </div>
  );
}
