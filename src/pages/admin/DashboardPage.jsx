import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi as api } from '@/services/api';
import { SkeletonStat } from '@/components/common/SkeletonLoader';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, bg, sub, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card flex items-center gap-4">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: bg }}>{icon}</div>
    <div>
      <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-success)' }}>{sub}</p>}
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data)
  });

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const growthData = stats?.studentGrowth?.map(d => ({
    month: monthNames[d._id.month - 1],
    students: d.count
  })) || [];

  const quizStatsData = stats?.quizStats?.map(d => ({
    month: monthNames[d._id.month - 1],
    attempts: d.count,
    avgScore: Math.round(d.avgScore || 0)
  })) || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>System overview and analytics</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? Array(4).fill(0).map((_, i) => <SkeletonStat key={i} />) : <>
          <StatCard icon="👥" label="Total Students" value={stats?.totalStudents ?? 0} bg="rgba(99,102,241,0.1)" sub={`${stats?.activeStudents} active`} delay={0} />
          <StatCard icon="📝" label="Published Quizzes" value={stats?.totalQuizzes ?? 0} bg="rgba(14,165,233,0.1)" delay={0.05} />
          <StatCard icon="📚" label="Active Courses" value={stats?.totalCourses ?? 0} bg="rgba(34,197,94,0.1)" delay={0.1} />
          <StatCard icon="🎯" label="Quiz Attempts" value={stats?.totalAttempts ?? 0} bg="rgba(245,158,11,0.1)" delay={0.15} />
        </>}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Student Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.5)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', borderRadius: 8, border: '1px solid rgba(226,232,240,0.6)' }} />
              <Line type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quiz Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={quizStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.5)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', borderRadius: 8, border: '1px solid rgba(226,232,240,0.6)' }} />
              <Bar dataKey="attempts" fill="#0ea5e9" radius={[4,4,0,0]} name="Attempts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Top Performers</h3>
            <Link to="/admin/leaderboard" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>View All</Link>
          </div>
          <div className="space-y-3">
            {stats?.topPerformers?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'var(--color-primary)' }}>
                  {p.student?.firstName?.[0]}{p.student?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {p.student?.firstName} {p.student?.lastName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.totalAttempts} attempts</p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>{Math.round(p.avgScore)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recent Activity</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {stats?.recentActivities?.map(a => (
              <div key={a._id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--color-primary)' }} />
                <div>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.actor?.firstName} </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{a.action.toLowerCase().replace(/_/g,' ')}</span>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(a.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
