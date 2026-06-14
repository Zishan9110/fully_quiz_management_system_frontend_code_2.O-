import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';
import Modal from '@/components/common/Modal';
import DataTable from '@/components/common/DataTable';

const defaultForm = { firstName: '', lastName: '', email: '', password: '', phone: '' };

export default function StudentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'suspend'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', page, search],
    queryFn: () => api.get(`/admin/students?page=${page}&limit=10${search ? `&search=${search}` : ''}`).then(r => r.data)
  });

  const createMut = useMutation({
    mutationFn: (d) => api.post('/admin/students', d),
    onSuccess: () => { qc.invalidateQueries(['admin-students']); setModal(null); setForm(defaultForm); toast.success('Student created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }) => api.put(`/admin/students/${id}`, d),
    onSuccess: () => { qc.invalidateQueries(['admin-students']); setModal(null); toast.success('Student updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/students/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-students']); toast.success('Student deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  });

  const suspendMut = useMutation({
    mutationFn: ({ id, reason }) => api.put(`/admin/students/${id}/suspend`, { reason }),
    onSuccess: () => { qc.invalidateQueries(['admin-students']); setModal(null); toast.success('Student suspended'); }
  });

  const unsuspendMut = useMutation({
    mutationFn: (id) => api.put(`/admin/students/${id}/unsuspend`),
    onSuccess: () => { qc.invalidateQueries(['admin-students']); toast.success('Student unsuspended'); }
  });

  const handleExport = async () => {
    try {
      const { data: { data: students } } = await api.get('/admin/students/export');
      const csv = [
        Object.keys(students[0]).join(','),
        ...students.map(s => Object.values(s).join(','))
      ].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'students.csv';
      a.click();
      toast.success('Exported!');
    } catch { toast.error('Export failed'); }
  };

  const columns = [
    {
      key: 'name', title: 'Name',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}>
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-sm">{row.firstName} {row.lastName}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'isEmailVerified', title: 'Verified',
      render: (v) => <span className={`badge ${v ? 'badge-success' : 'badge-warning'}`}>{v ? 'Yes' : 'No'}</span>
    },
    {
      key: 'status', title: 'Status',
      render: (_, row) => (
        <span className={`badge ${row.isSuspended ? 'badge-danger' : row.isActive ? 'badge-success' : 'badge-warning'}`}>
          {row.isSuspended ? 'Suspended' : row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt', title: 'Joined',
      render: (v) => <span className="text-xs">{new Date(v).toLocaleDateString()}</span>
    },
    {
      key: 'actions', title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm"
            onClick={() => { setSelected(row); setForm({ firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone || '' }); setModal('edit'); }}>
            ✏️
          </button>
          {row.isSuspended ? (
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
              onClick={() => unsuspendMut.mutate(row._id)}>🔓</button>
          ) : (
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
              onClick={() => { setSelected(row); setModal('suspend'); }}>🔒</button>
          )}
          <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
            onClick={() => { if (confirm('Delete this student?')) deleteMut.mutate(row._id); }}>🗑️</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Students</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Manage student accounts</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={handleExport}>⬇ Export CSV</button>
          <button className="btn-primary text-sm" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ Add Student</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        loading={isLoading}
        pagination={{ page, pages: data?.pages, total: data?.total }}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search students..."
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Student' : 'Edit Student'}
        footer={
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary"
              disabled={createMut.isPending || updateMut.isPending}
              onClick={() => {
                if (modal === 'add') createMut.mutate(form);
                else updateMut.mutate({ id: selected._id, ...form });
              }}>
              {createMut.isPending || updateMut.isPending ? 'Saving...' : modal === 'add' ? 'Create' : 'Update'}
            </button>
          </div>
        }>
        <div className="grid grid-cols-2 gap-4">
          {[['firstName','First Name'],['lastName','Last Name'],['email','Email'],['phone','Phone']].map(([key, label]) => (
            <div key={key} className={key === 'email' ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{label}</label>
              <input className="input-field" type={key === 'email' ? 'email' : 'text'}
                value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          {modal === 'add' && (
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Password</label>
              <input className="input-field" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
          )}
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal isOpen={modal === 'suspend'} onClose={() => setModal(null)} title="Suspend Student"
        footer={
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" style={{ background: 'var(--color-danger)' }}
              onClick={() => suspendMut.mutate({ id: selected._id, reason: form.reason || 'Violation of terms' })}>
              Suspend
            </button>
          </div>
        }>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Suspend <strong>{selected?.firstName} {selected?.lastName}</strong>?
        </p>
        <textarea className="input-field resize-none h-20" placeholder="Reason for suspension..."
          value={form.reason || ''} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
      </Modal>
    </div>
  );
}
