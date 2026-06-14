import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { adminLogout } from '@/store/slices/adminAuthSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(s => s.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return { ...auth, logout: handleLogout };
};

export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(s => s.adminAuth);

  const handleLogout = async () => {
    await dispatch(adminLogout());
    navigate('/admin/login');
  };

  return { ...auth, logout: handleLogout };
};
