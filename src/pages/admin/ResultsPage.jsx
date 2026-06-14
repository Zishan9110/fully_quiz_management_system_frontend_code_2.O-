import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';
import DataTable from '@/components/common/DataTable';

export default function AdminResultsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [quizFilter, setQuizFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-results', page, quizFilter],
    queryFn: () => api.get(`/results/admin?page=${page}&limit=15${quizFilter ? `&quizId=${quizFilter}` : ''}`).then(r => r.data)
  });

  const { data: quizzes } = useQuery({
    queryKey: ['quiz-list-filter'],
    queryFn: () => api.get('/quizzes/admin?limit=100').then(r => r.data.data)
  });

  const publishMut = useMutation({
    mutationFn: (id) => api.put(`/results/admin/${id}/publish`),
    onSuccess: () => { qc.invalidateQueries(['admin-results']); toast.success('Result published!'); },
    onError: () => toast.error('Failed to publish')
  });

  const handleExport = async () => {
    try {
      const { data: res } = await api.get(`/results/admin?limit=10000${quizFilter ? `&quizId=${quizFilter}` : ''}`);
      const rows = res.data.map(r => ({
        student: `${r.student?.firstName} ${r.student?.lastName}`,
        email: r.student?.email,
        quiz: r.quiz?.title,
        marks: r.marksObtained,
        total: r.totalMarks,
        percentage: `${Math.round(r.percentage)}%`,
        passed: r.isPassed ? 'Yes' : 'No',
        date: new Date(r.createdAt).toLocaleDateString()
      }));
      const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'results.csv';
      a.click();
      toast.success('Exported!');
    } catch { toast.error('Export failed'); }
  };

  const columns = [
    { key: 'student', title: 'Student', render: (_, row) => (
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {row.student?.firstName} {row.student?.lastName}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.student?.email}</p>
      </div>
    )},
    { key: 'quiz', title: 'Quiz', render: (_, row) => (
      <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{row.quiz?.title}</p>
    )},
    { key: 'marksObtained', title: 'Score', render: (v, row) => (
      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {v}/{row.totalMarks}
      </span>
    )},
    { key: 'percentage', title: '%', render: (v, row) => (
      <span className={`font-bold ${row.isPassed ? 'text-green-600' : 'text-red-500'}`}>
        {Math.round(v)}%
      </span>
    )},
    { key: 'isPassed', title: 'Result', render: (v) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Pass' : 'Fail'}</span>
    )},
    { key: 'isPublished', title: 'Published', render: (v) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-warning'}`}>{v ? 'Yes' : 'No'}</span>
    )},
    { key: 'createdAt', title: 'Date', render: (v) => (
      <span className="text-xs">{new Date(v).toLocaleDateString()}</span>
    )},
    { key: 'actions', title: 'Actions', render: (_, row) => (
      !row.isPublished && (
        <button className="text-xs btn-secondary py-1.5 px-3"
          onClick={() => publishMut.mutate(row._id)}>
          Publish
        </button>
      )
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Results</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>View and manage all quiz results</p>
        </div>
        <button className="btn-secondary text-sm" onClick={handleExport}>⬇ Export CSV</button>
      </div>

      <div className="flex gap-3">
        <select className="input-field max-w-xs" value={quizFilter} onChange={e => { setQuizFilter(e.target.value); setPage(1); }}>
          <option value="">All Quizzes</option>
          {quizzes?.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data?.data} loading={isLoading}
        pagination={{ page, pages: data?.pages, total: data?.total }}
        onPageChange={setPage} />
    </div>
  );
}
