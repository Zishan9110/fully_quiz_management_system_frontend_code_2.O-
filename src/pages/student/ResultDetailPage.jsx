import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { studentApi as api } from '@/services/api';
import { PageLoader } from '@/components/common/LoadingSpinner';

export default function ResultDetailPage() {
  const { id } = useParams();
  const { data: result, isLoading } = useQuery({
    queryKey: ['result-detail', id],
    queryFn: () => api.get(`/quizzes/results/${id}`).then(r => r.data.data)
  });

  if (isLoading) return <PageLoader />;
  if (!result) return <div className="text-center py-16">Result not found</div>;

  const pieData = [
    { name: 'Correct',  value: result.correctAnswers,  color: '#22c55e' },
    { name: 'Wrong',    value: result.wrongAnswers,     color: '#f43f5e' },
    { name: 'Skipped',  value: result.skippedAnswers,   color: '#94a3b8' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/student/results" className="btn-secondary py-2 px-3 text-sm">← Back</Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{result.quiz?.title}</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {new Date(result.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Score Banner */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-10"
        style={{ background: result.isPassed ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))' : 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(244,63,94,0.03))' }}>
        <div className="text-6xl mb-3">{result.isPassed ? '🎉' : '😔'}</div>
        <div className="text-6xl font-bold mb-2"
          style={{ color: result.isPassed ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {Math.round(result.percentage)}%
        </div>
        <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {result.isPassed ? 'Congratulations! You Passed' : 'Keep Practicing! You can do better'}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Score: {result.marksObtained} / {result.totalMarks} marks
        </p>
        {result.rank && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-primary)' }}>🏆 Rank #{result.rank}</p>
        )}
      </motion.div>

      {/* Stats + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Answer Breakdown</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} innerRadius={40} paddingAngle={2} dataKey="value">
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{d.name}</p>
                    <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Analysis */}
        {result.subjectAnalysis?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Subject Analysis</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={result.subjectAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.5)" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="percentage" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
