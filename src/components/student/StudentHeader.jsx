import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleDark } from '@/store/slices/themeSlice';

export default function StudentHeader({ onMenuClick }) {
  const { user } = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);
  const { unreadCount } = useSelector(s => s.notifications);
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
        {/* Dark mode toggle */}
        <button onClick={() => dispatch(toggleDark())} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-lg">
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <Link to="/student/messages" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <span className="text-lg">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-xs text-white rounded-full"
              style={{ background: 'var(--color-danger)' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </Link>

        {/* Profile */}
        <Link to="/student/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'var(--color-primary)' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>
            {user?.firstName} {user?.lastName}
          </span>
        </Link>
      </div>
    </header>
  );
}
