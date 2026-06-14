import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { studentApi as api } from '@/services/api';
import { SkeletonCard } from '@/components/common/SkeletonLoader';

const QuizCard = ({ quiz }) => {
  const isAvailable = quiz.status === 'published';
  const typeColors = { exam: '#6366f1', practice: '#22c55e', assignment: '#f59e0b' };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <span className="badge" style={{ background: `${typeColors[quiz.type] || '#6366f1'}15`, color: typeColors[quiz.type] || '#6366f1' }}>
          {quiz.type?.toUpperCase()}
        </span>
        <span className={`badge ${isAvailable ? 'badge-success' : 'badge-warning'}`}>
          {isAvailable ? 'Available' : quiz.status}
        </span>
      </div>
      <h3 className="font-semibold mb-1 group-hover:text-primary-600 transition-colors"
        style={{ color: 'var(--color-text-primary)' }}>{quiz.title}</h3>
      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
        {quiz.description || 'No description'}
      </p>
      <div className="flex items-center gap-4 text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        <span>⏱ {quiz.duration} min</span>
        <span>📊 {quiz.totalMarks} marks</span>
        <span>🔄 {quiz.attemptsAllowed} attempt{quiz.attemptsAllowed > 1 ? 's' : ''}</span>
      </div>
      {quiz.course && (
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>📚 {quiz.course.name}</p>
      )}
      {quiz.schedule?.startDate && (
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          📅 {new Date(quiz.schedule.startDate).toLocaleDateString()} – {quiz.schedule.endDate ? new Date(quiz.schedule.endDate).toLocaleDateString() : 'No end date'}
        </p>
      )}
      <Link to={`/student/quizzes/${quiz._id}`}
        className={`btn-primary w-full justify-center text-sm ${!isAvailable ? 'opacity-50 pointer-events-none' : ''}`}>
        {isAvailable ? 'Start Quiz →' : 'Not Available'}
      </Link>
    </motion.div>
  );
};

export default function QuizzesPage() {
  const [tab, setTab] = useState('available');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['student-quizzes', tab, type],
    queryFn: () => api.get(`/quizzes/available?type=${type}`).then(r => r.data.data)
  });

  const filtered = quizzes?.filter(q =>
    !search || q.title.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { key: 'available', label: 'Available', icon: '📋' },
    { key: 'practice', label: 'Practice', icon: '🏋️' },
    { key: 'completed', label: 'Completed', icon: '✅' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Quizzes</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Browse and take available quizzes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input className="input-field max-w-sm" placeholder="Search quizzes..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <select className="input-field max-w-[160px]" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="exam">Exam</option>
          <option value="practice">Practice</option>
          <option value="assignment">Assignment</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(226,232,240,0.4)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow-sm text-primary-600 dark:bg-slate-700' : ''}`}
            style={{ color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />) :
          filtered?.length === 0 ? (
            <div className="col-span-full text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-5xl mb-4">📭</div>
              <p className="font-medium">No quizzes found</p>
            </div>
          ) : filtered?.map(q => <QuizCard key={q._id} quiz={q} />)
        }
      </div>
    </div>
  );
}
