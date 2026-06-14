import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { toggleDark } from '@/store/slices/themeSlice';
import { updateProfile } from '@/store/slices/authSlice';
import { studentApi as api } from '@/services/api';

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
      {description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
    </div>
    <button onClick={onChange} className="relative flex-shrink-0">
      <div className="w-11 h-6 rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--color-primary)' : 'rgba(226,232,240,0.8)' }} />
      <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'none' }} />
    </button>
  </div>
);

export default function SettingsPage() {
  const { user } = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);
  const dispatch = useDispatch();
  const [notif, setNotif] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    push:  user?.preferences?.notifications?.push  ?? true
  });
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');

  const saveMut = useMutation({
    mutationFn: (prefs) => api.put('/auth/update-profile', { preferences: prefs }),
    onSuccess: ({ data }) => { dispatch(updateProfile(data.data)); toast.success('Settings saved!'); },
    onError: () => toast.error('Failed to save settings')
  });

  const handleSave = () => {
    saveMut.mutate({ notifications: notif, language, darkMode: isDark });
  };

  const SECTION = ({ title, children }) => (
    <div className="card">
      <h3 className="font-semibold mb-4 pb-3 border-b" style={{ color: 'var(--color-text-primary)', borderColor: 'rgba(226,232,240,0.6)' }}>{title}</h3>
      <div className="divide-y" style={{ '--tw-divide-opacity': 1 }}>{children}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Customize your experience</p>
      </div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h3 className="font-semibold mb-4 pb-3 border-b" style={{ color: 'var(--color-text-primary)', borderColor: 'rgba(226,232,240,0.6)' }}>
          🎨 Appearance
        </h3>
        <Toggle
          checked={isDark}
          onChange={() => dispatch(toggleDark())}
          label="Dark Mode"
          description="Switch between light and dark theme"
        />
        <div className="py-3">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Language</label>
          <select className="input-field max-w-[200px]" value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="ur">🇵🇰 Urdu</option>
            <option value="ar">🇸🇦 Arabic</option>
            <option value="fr">🇫🇷 French</option>
            <option value="es">🇪🇸 Spanish</option>
          </select>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
        <h3 className="font-semibold mb-4 pb-3 border-b" style={{ color: 'var(--color-text-primary)', borderColor: 'rgba(226,232,240,0.6)' }}>
          🔔 Notifications
        </h3>
        <Toggle
          checked={notif.email}
          onChange={() => setNotif(p => ({ ...p, email: !p.email }))}
          label="Email Notifications"
          description="Receive quiz assignments and results via email"
        />
        <Toggle
          checked={notif.push}
          onChange={() => setNotif(p => ({ ...p, push: !p.push }))}
          label="Push Notifications"
          description="In-app real-time notifications"
        />
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <h3 className="font-semibold mb-4 pb-3 border-b" style={{ color: 'var(--color-text-primary)', borderColor: 'rgba(226,232,240,0.6)' }}>
          👤 Account
        </h3>
        <div className="space-y-3 text-sm">
          {[
            ['Name',    `${user?.firstName} ${user?.lastName}`],
            ['Email',   user?.email],
            ['Role',    user?.role],
            ['Status',  user?.isEmailVerified ? '✓ Verified' : '✗ Unverified'],
            ['Member since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'],
            ['Last login', user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—']
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b last:border-0"
              style={{ borderColor: 'rgba(226,232,240,0.4)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <button className="btn-primary" onClick={handleSave} disabled={saveMut.isPending}>
        {saveMut.isPending
          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
          : '💾 Save Settings'}
      </button>
    </div>
  );
}
