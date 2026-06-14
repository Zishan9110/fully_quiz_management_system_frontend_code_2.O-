import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminMe } from '@/store/slices/adminAuthSlice';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader  from '@/components/admin/AdminHeader';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(s => s.adminAuth);
  const token = localStorage.getItem('adminAccessToken');

  // // Sync Redux state with localStorage
  // useEffect(() => {
  //   if (token && !isAuthenticated && !loading) {
  //     console.log('🔄 Syncing admin auth state in AdminLayout...');
  //     dispatch(getAdminMe());
  //   }
  // }, [token, isAuthenticated, loading, dispatch]);

  // Show loading spinner while checking auth
  if (loading && token && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}