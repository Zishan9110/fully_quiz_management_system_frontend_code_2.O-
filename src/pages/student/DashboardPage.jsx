import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { studentApi as api } from '@/services/api';
import { SkeletonStat } from '@/components/common/SkeletonLoader';

const StatCard = ({ icon, label, value, sub, color, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card flex items-start gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: `${color}18` }}>{icon}</div>
    <div>
      <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5 font-medium" style={{ color }}>{sub}</p>}
    </div>
  </motion.div>
);

export default function StudentDashboard() {
  const { user } = useSelector(s => s.auth);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['student-stats'],
    queryFn: () => api.get('/auth/stats').then(r => r.data.data)
  });

  const { data: announcements } = useQuery({
    queryKey: ['student-announcements'],
    queryFn: () => api.get('/announcements/my').then(r => r.data.data).catch(() => [])
  });

  const performanceTrend = stats?.recentResults?.slice().reverse().map((r, i) => ({
    name: `Q${i + 1}`,
    score: Math.round(r.percentage || 0)
  })) || [];

  const subjectData = stats?.subjectBreakdown?.length
    ? stats.subjectBreakdown
    : [{ name: 'No data', value: 100 }];

  const COLORS = ['#6366f1','#0ea5e9','#22c55e','#f59e0b','#f43f5e','#8b5cf6'];
  const PRIORITY_BORDER = { low: '#94a3b8', normal: '#6366f1', high: '#f59e0b', urgent: '#f43f5e' };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Here's your learning overview
          </p>
        </div>
        <Link to="/student/quizzes" className="btn-primary hidden sm:flex">Take a Quiz →</Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? Array(4).fill(0).map((_, i) => <SkeletonStat key={i} />) : <>
          <StatCard icon="📝" label="Quizzes Attempted" value={stats?.totalAttempts ?? 0} color="#6366f1" delay={0} />
          <StatCard icon="⭐" label="Average Score" value={`${stats?.avgScore ?? 0}%`} sub="Keep it up!" color="#22c55e" delay={0.05} />
          <StatCard icon="🏆" label="Highest Score" value={`${stats?.highestScore ?? 0}%`} color="#f59e0b" delay={0.1} />
          <StatCard icon="📊" label="Global Rank" value={stats?.rank ? `#${stats.rank}` : '—'} color="#0ea5e9" delay={0.15} />
        </>}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Performance Trend</h3>
          {performanceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={performanceTrend}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.5)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid rgba(226,232,240,0.6)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-4xl">📈</div>
              <p className="text-sm">Take quizzes to see your performance trend</p>
              <Link to="/student/quizzes" className="btn-primary text-sm">Browse Quizzes</Link>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Subject Performance</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={subjectData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {subjectData.slice(0, 4).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="truncate max-w-[100px]" style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
                </div>
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Recent Results</h3>
            <Link to="/student/results" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>View All →</Link>
          </div>
          <div className="space-y-2">
            {!stats?.recentResults?.length ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>No results yet. Take a quiz!</p>
            ) : stats.recentResults.map(r => (
              <Link key={r._id} to={`/student/results/${r._id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:shadow-sm transition-all"
                style={{ background: 'rgba(248,250,252,0.8)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{r.quiz?.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {r.correctAnswers} correct · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${r.isPassed ? 'badge-success' : 'badge-danger'}`}>
                  {Math.round(r.percentage)}%
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Announcements</h3>
          </div>
          <div className="space-y-2">
            {!announcements?.length ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>No announcements</p>
            ) : announcements.map(a => (
              <div key={a._id} className="p-3 rounded-xl border-l-4"
                style={{ background: 'rgba(248,250,252,0.8)', borderLeftColor: PRIORITY_BORDER[a.priority] || '#6366f1' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.title}</p>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
