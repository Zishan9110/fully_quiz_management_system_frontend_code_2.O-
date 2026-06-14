import { useSelector, useDispatch } from 'react-redux';
import { toggleDark } from '@/store/slices/themeSlice';

export default function AdminHeader({ onMenuClick }) {
  const { admin } = useSelector(s => s.adminAuth);
  const { isDark } = useSelector(s => s.theme);
  const dispatch = useDispatch();

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b"
      style={{ background: 'var(--color-card)', borderColor: 'rgba(226,232,240,0.6)', height: 'var(--header-height)' }}>
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)' }}>
          {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </span>
        <button onClick={() => dispatch(toggleDark())} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-lg">
          {isDark ? '☀️' : '🌙'}
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'var(--color-primary)' }}>
            {admin?.firstName?.[0]}{admin?.lastName?.[0]}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>
            {admin?.firstName} {admin?.lastName}
          </span>
        </div>
      </div>
    </header>
  );
}
