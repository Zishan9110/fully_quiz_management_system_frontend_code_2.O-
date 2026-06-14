import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';
import DataTable from '@/components/common/DataTable';

export default function AdminQuizzesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-quizzes', page, search],
    queryFn: () => api.get(`/quizzes/admin?page=${page}&limit=10${search ? `&search=${search}` : ''}`).then(r => r.data)
  });

  const publishMut = useMutation({
    mutationFn: (id) => api.put(`/quizzes/${id}/publish`),
    onSuccess: () => { qc.invalidateQueries(['admin-quizzes']); toast.success('Quiz published!'); }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/quizzes/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-quizzes']); toast.success('Quiz deleted'); }
  });

  const statusBadge = (status) => {
    const map = { published: 'badge-success', draft: 'badge-warning', archived: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-primary'}`}>{status}</span>;
  };

  const columns = [
    { key: 'title', title: 'Title', render: (v, row) => (
      <div>
        <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{v}</p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.course?.name || 'No course'}</p>
      </div>
    )},
    { key: 'type', title: 'Type', render: (v) => <span className="badge badge-primary capitalize">{v}</span> },
    { key: 'status', title: 'Status', render: statusBadge },
    { key: 'totalMarks', title: 'Marks' },
    { key: 'duration', title: 'Duration', render: (v) => `${v} min` },
    { key: 'questionCount', title: 'Questions' },
    { key: 'createdAt', title: 'Created', render: (v) => <span className="text-xs">{new Date(v).toLocaleDateString()}</span> },
    { key: 'actions', title: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-1">
        <Link to={`/admin/quizzes/builder/${row._id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-sm">✏️</Link>
        {row.status === 'draft' && (
          <button className="p-1.5 rounded-lg hover:bg-green-50 text-sm"
            onClick={() => publishMut.mutate(row._id)}>🚀</button>
        )}
        <button className="p-1.5 rounded-lg hover:bg-red-50 text-sm"
          onClick={() => { if (confirm('Delete this quiz?')) deleteMut.mutate(row._id); }}>🗑️</button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Quizzes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Create and manage quizzes</p>
        </div>
        <Link to="/admin/quizzes/builder" className="btn-primary">+ Create Quiz</Link>
      </div>
      <DataTable columns={columns} data={data?.data} loading={isLoading}
        pagination={{ page, pages: data?.pages, total: data?.total }}
        onPageChange={setPage} onSearch={setSearch} searchPlaceholder="Search quizzes..." />
    </div>
  );
}
