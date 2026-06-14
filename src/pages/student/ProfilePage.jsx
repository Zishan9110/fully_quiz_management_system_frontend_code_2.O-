import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { studentApi as api } from '@/services/api';
import { updateProfile } from '@/store/slices/authSlice';

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    address:   user?.address   || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const updateMut = useMutation({
    mutationFn: (data) => api.put('/auth/update-profile', data),
    onSuccess: ({ data }) => { dispatch(updateProfile(data.data)); toast.success('Profile updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });

  const changePwMut = useMutation({
    mutationFn: (data) => api.put('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
    // Upload to Cloudinary via backend
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('profilePicture', file);
    try {
      const { data } = await api.post('/upload/profile-picture', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update user in store
      dispatch(updateProfile({ ...user, profilePicture: data.data.profilePicture }));
      setPreviewUrl(null);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const avatarSrc = previewUrl || user?.profilePicture;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Manage your personal information</p>
      </div>

      {/* Avatar Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-700 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            {/* Upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
              style={{ background: 'var(--color-primary)' }}>
              {uploading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span className="text-sm">📷</span>}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePictureChange}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-primary capitalize">{user?.role}</span>
              {user?.isEmailVerified && <span className="badge badge-success">✓ Verified</span>}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Click the camera icon to upload a new photo (JPG, PNG, WebP, GIF · max 10MB)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
        <h3 className="font-semibold mb-5" style={{ color: 'var(--color-text-primary)' }}>Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['firstName', 'First Name', 'text'],
            ['lastName',  'Last Name',  'text'],
            ['phone',     'Phone',      'tel'],
            ['dateOfBirth','Date of Birth','date']
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{label}</label>
              <input type={type} className="input-field" value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Address</label>
            <textarea className="input-field resize-none h-20" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Your address..." />
          </div>
        </div>
        <button className="btn-primary mt-5" onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending}>
          {updateMut.isPending
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            : '💾 Save Changes'}
        </button>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <h3 className="font-semibold mb-5" style={{ color: 'var(--color-text-primary)' }}>Change Password</h3>
        <div className="space-y-4">
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{label}</label>
              <input type="password" className="input-field" value={pwForm[key]}
                onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} placeholder="••••••••" />
            </div>
          ))}
        </div>
        <button className="btn-primary mt-5" disabled={changePwMut.isPending}
          onClick={() => {
            if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
            if (pwForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
            changePwMut.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
          }}>
          {changePwMut.isPending
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Changing...</>
            : '🔒 Change Password'}
        </button>
      </motion.div>
    </div>
  );
}
