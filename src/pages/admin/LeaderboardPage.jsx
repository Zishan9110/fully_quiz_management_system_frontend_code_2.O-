import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';

export default function AdminLeaderboardPage() {
  const qc = useQueryClient();
  const [type, setType] = useState('global');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['admin-leaderboard', type],
    queryFn: () => api.get(`/leaderboard?type=${type}&limit=100`).then(r => r.data.data)
  });

  const rebuildMut = useMutation({
    mutationFn: () => api.post('/leaderboard/rebuild', { type }),
    onSuccess: ({ data }) => { qc.invalidateQueries(['admin-leaderboard']); toast.success(`Rebuilt — ${data.data.count} entries`); },
    onError: () => toast.error('Rebuild failed')
  });

  const medal = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Leaderboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Student rankings</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => rebuildMut.mutate()} disabled={rebuildMut.isPending}>
          {rebuildMut.isPending ? '⏳ Rebuilding...' : '🔄 Rebuild Leaderboard'}
        </button>
      </div>

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(226,232,240,0.4)' }}>
        {['global','monthly','weekly'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${type === t ? 'bg-white shadow-sm dark:bg-slate-700' : ''}`}
            style={{ color: type === t ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(248,250,252,0.8)' }}>
              {['Rank','Student','Email','Score','Percentage'].map(h => (
                <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="table-row">
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
                No rankings yet. Click "Rebuild Leaderboard" to generate.
              </td></tr>
            ) : entries.map((e, i) => (
              <motion.tr key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="table-row">
                <td className="px-4 py-3 text-lg">{medal(e.rank)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {e.student?.profilePicture
                      ? <img src={e.student.profilePicture} className="w-8 h-8 rounded-full object-cover" alt="" />
                      : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: 'var(--color-primary)' }}>
                          {e.student?.firstName?.[0]}{e.student?.lastName?.[0]}
                        </div>}
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {e.student?.firstName} {e.student?.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{e.student?.email}</td>
                <td className="px-4 py-3 font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{e.score}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${e.percentage >= 80 ? 'badge-success' : e.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                    {Math.round(e.percentage)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
