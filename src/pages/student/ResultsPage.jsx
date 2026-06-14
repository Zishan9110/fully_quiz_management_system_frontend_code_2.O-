import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { studentApi as api } from '@/services/api';
import { SkeletonCard } from '@/components/common/SkeletonLoader';

export default function ResultsPage() {
  const { data: results, isLoading } = useQuery({
    queryKey: ['student-results'],
    queryFn: () => api.get('/quizzes/my-results').then(r => r.data.data)
  });

  const chartData = results?.slice(0, 8).reverse().map((r, i) => ({
    name: r.quiz?.title?.slice(0, 10) || `Q${i+1}`,
    score: Math.round(r.percentage || 0)
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>My Results</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Review your quiz performance</p>
      </div>

      {chartData?.length > 0 && (
        <div className="card">
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Score History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.5)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid rgba(226,232,240,0.6)', borderRadius: 8 }} />
              <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />) :
          results?.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-5xl mb-4">📊</div>
              <p className="font-medium">No results yet. Take a quiz first!</p>
              <Link to="/student/quizzes" className="btn-primary mt-4 inline-flex">Browse Quizzes</Link>
            </div>
          ) : results?.map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: r.isPassed ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)' }}>
                  {r.isPassed ? '✅' : '❌'}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{r.quiz?.title}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {r.correctAnswers} correct · {r.wrongAnswers} wrong · {r.skippedAnswers} skipped
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: r.isPassed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {Math.round(r.percentage)}%
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {r.marksObtained}/{r.totalMarks} marks
                  </p>
                </div>
                <Link to={`/student/results/${r._id}`} className="btn-secondary text-xs py-2 px-3">
                  View Details →
                </Link>
              </div>
            </motion.div>
          ))
        }
      </div>
    </div>
  );
}
