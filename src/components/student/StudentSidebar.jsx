import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/store/slices/authSlice';

const NAV = [
  { to: '/student/dashboard',   icon: '⊞', label: 'Dashboard' },
  { to: '/student/quizzes',     icon: '📝', label: 'Quizzes' },
  { to: '/student/courses',     icon: '📚', label: 'Courses' },
  { to: '/student/results',     icon: '📊', label: 'Results' },
  { to: '/student/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { to: '/student/messages',    icon: '💬', label: 'Messages' },
  { to: '/student/profile',     icon: '👤', label: 'Profile' },
  { to: '/student/settings',    icon: '⚙️', label: 'Settings' }
];

export default function StudentSidebar({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: open ? 260 : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="flex-shrink-0 overflow-hidden z-30 lg:relative fixed h-full"
        style={{ background: 'var(--color-sidebar)' }}
      >
        <div className="flex flex-col h-full w-[260px]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'var(--color-primary)' }}>Q</div>
            <div>
              <div className="text-white font-bold text-sm">QuizMaster</div>
              <div className="text-white/50 text-xs">Student Panel</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-white/10">
            <button onClick={handleLogout} className="sidebar-link w-full hover:bg-red-500/20 hover:text-red-300">
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
