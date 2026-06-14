import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';
import Modal from '@/components/common/Modal';

const PRIORITIES = ['low','normal','high','urgent'];
const PRIORITY_COLORS = { low: 'badge-primary', normal: 'badge-primary', high: 'badge-warning', urgent: 'badge-danger' };
const defaultForm = { title: '', content: '', targetType: 'all', priority: 'normal', expiresAt: '' };

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements', page],
    queryFn: () => api.get(`/announcements/admin?page=${page}&limit=10`).then(r => r.data)
  });

  const createMut = useMutation({
    mutationFn: (d) => api.post('/announcements', d),
    onSuccess: () => { qc.invalidateQueries(['admin-announcements']); setModal(null); setForm(defaultForm); toast.success('Announcement created!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }) => api.put(`/announcements/${id}`, d),
    onSuccess: () => { qc.invalidateQueries(['admin-announcements']); setModal(null); toast.success('Updated!'); }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/announcements/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-announcements']); toast.success('Deleted'); }
  });

  const AnnouncementForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Title *</label>
        <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Content *</label>
        <textarea className="input-field resize-none h-28" value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your announcement..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Target</label>
          <select className="input-field" value={form.targetType} onChange={e => setForm(f => ({ ...f, targetType: e.target.value }))}>
            <option value="all">All Students</option>
            <option value="course">By Course</option>
            <option value="specific">Specific Students</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Priority</label>
          <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Expires At (optional)</label>
        <input type="datetime-local" className="input-field" value={form.expiresAt}
          onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
      </div>
    </div>
  );

  const PRIORITY_BORDER = { low: '#94a3b8', normal: '#6366f1', high: '#f59e0b', urgent: '#f43f5e' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Announcements</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Broadcast messages to students</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ New Announcement</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : data?.data?.length === 0 ? (
        <div className="card text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          <div className="text-5xl mb-4">📢</div>
          <p className="font-medium">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data?.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="card border-l-4 flex items-start justify-between gap-4"
              style={{ borderLeftColor: PRIORITY_BORDER[a.priority] }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{a.title}</h3>
                  <span className={`badge ${PRIORITY_COLORS[a.priority]} capitalize`}>{a.priority}</span>
                  <span className={`badge ${a.isActive ? 'badge-success' : 'badge-danger'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{a.content}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>🎯 {a.targetType === 'all' ? 'All students' : a.targetType}</span>
                  <span>📅 {new Date(a.createdAt).toLocaleDateString()}</span>
                  {a.expiresAt && <span>⏱ Expires {new Date(a.expiresAt).toLocaleDateString()}</span>}
                  <span>👁 {a.readBy?.length || 0} read</span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                  onClick={() => { setSelected(a); setForm({ title: a.title, content: a.content, targetType: a.targetType, priority: a.priority, expiresAt: a.expiresAt ? a.expiresAt.split('T')[0] : '' }); setModal('edit'); }}>✏️</button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-sm"
                  onClick={() => { if (confirm('Delete this announcement?')) deleteMut.mutate(a._id); }}>🗑️</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex gap-2 justify-center">
          <button className="btn-secondary py-1.5 px-3 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="py-1.5 px-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Page {page} / {data.pages}</span>
          <button className="btn-secondary py-1.5 px-3 text-xs" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'add' ? 'New Announcement' : 'Edit Announcement'} size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" disabled={createMut.isPending || updateMut.isPending}
              onClick={() => modal === 'add' ? createMut.mutate(form) : updateMut.mutate({ id: selected._id, ...form })}>
              {createMut.isPending || updateMut.isPending ? 'Saving...' : modal === 'add' ? 'Publish' : 'Update'}
            </button>
          </div>
        }>
        <AnnouncementForm />
      </Modal>
    </div>
  );
}
