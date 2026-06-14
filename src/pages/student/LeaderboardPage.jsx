import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { studentApi as api } from '@/services/api';

export default function LeaderboardPage() {
  const [type, setType] = useState('global');
  const { user } = useSelector(s => s.auth);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard', type],
    queryFn: () => api.get(`/leaderboard?type=${type}`).then(r => r.data.data)
  });

  const myRankEntry = entries?.find(e => e.student?._id === user?._id);

  const medal = (rank) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>🏆 Leaderboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>See how you rank against other students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl justify-center" style={{ background: 'rgba(226,232,240,0.4)' }}>
        {['global','monthly','weekly'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize ${type === t ? 'bg-white shadow-sm dark:bg-slate-700' : ''}`}
            style={{ color: type === t ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
            {t}
          </button>
        ))}
      </div>

      {/* My rank banner */}
      {myRankEntry && (
        <div className="card border-2" style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.05)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: 'var(--color-primary)' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Your Ranking</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>#{myRankEntry.rank}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{Math.round(myRankEntry.percentage)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {entries?.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-4">
          {[entries[1], entries[0], entries[2]].map((e, i) => {
            const heights = ['h-28', 'h-36', 'h-24'];
            const medals = ['🥈', '🥇', '🥉'];
            return e ? (
              <div key={e._id} className={`flex flex-col items-center gap-2 ${heights[i]}`}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: i === 1 ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)' }}>
                  {e.student?.firstName?.[0]}{e.student?.lastName?.[0]}
                </div>
                <span className="text-2xl">{medals[i]}</span>
                <p className="text-xs font-medium text-center" style={{ color: 'var(--color-text-primary)' }}>
                  {e.student?.firstName}
                </p>
                <div className={`w-20 rounded-t-lg flex items-center justify-center text-white text-xs font-bold ${heights[i]}`}
                  style={{ background: i === 1 ? 'var(--color-primary)' : 'rgba(99,102,241,0.3)', marginTop: 'auto' }}>
                  #{e.rank}
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Rankings list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : entries?.map((e, i) => (
          <motion.div key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0"
            style={{ borderColor: 'rgba(226,232,240,0.6)', background: e.student?._id === user?._id ? 'rgba(99,102,241,0.05)' : undefined }}>
            <div className="w-8 text-center">
              {medal(e.rank) ? <span className="text-xl">{medal(e.rank)}</span> :
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>#{e.rank}</span>}
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--color-primary)', opacity: e.student?._id === user?._id ? 1 : 0.7 }}>
              {e.student?.firstName?.[0]}{e.student?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                {e.student?.firstName} {e.student?.lastName}
                {e.student?._id === user?._id && <span className="ml-2 badge badge-primary text-xs">You</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{Math.round(e.percentage)}%</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
