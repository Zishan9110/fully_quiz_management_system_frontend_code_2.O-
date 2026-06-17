import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, setCheckingDone } from '@/store/slices/authSlice';
import { getAdminMe, setAdminCheckingDone } from '@/store/slices/adminAuthSlice';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPassword from '@/pages/auth/ForgotPasswordPage';
import ResetPassword from '@/pages/auth/ResetPasswordPage';
import VerifyEmail from '@/pages/auth/VerifyEmailPage';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';

// 🔥 ADD THIS IMPORT
import AuthSuccess from '@/pages/auth/AuthSuccess';

// Student Pages
import StudentLayout from '@/layouts/StudentLayout';
import StudentDashboard from '@/pages/student/DashboardPage';
import QuizzesPage from '@/pages/student/QuizzesPage';
import QuizInterface from '@/pages/student/QuizInterfacePage';
import ResultsPage from '@/pages/student/ResultsPage';
import ResultDetail from '@/pages/student/ResultDetailPage';
import LeaderboardPage from '@/pages/student/LeaderboardPage';
import ProfilePage from '@/pages/student/ProfilePage';
import CoursesPage from '@/pages/student/CoursesPage';
import MessagesPage from '@/pages/student/MessagesPage';
import SettingsPage from '@/pages/student/SettingsPage';

// Admin Pages
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/DashboardPage';
import StudentsPage from '@/pages/admin/StudentsPage';
import AdminQuizzesPage from '@/pages/admin/QuizzesPage';
import QuizBuilderPage from '@/pages/admin/QuizBuilderPage';
import AdminCoursesPage from '@/pages/admin/CoursesPage';
import AdminResultsPage from '@/pages/admin/ResultsPage';
import AdminLeaderboardPage from '@/pages/admin/LeaderboardPage';
import AnnouncementsPage from '@/pages/admin/AnnouncementsPage';
import AdminMessagesPage from '@/pages/admin/MessagesPage';
import AdminSettingsPage from '@/pages/admin/SettingsPage';

// Route Guards
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminAccessToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const StudentRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function AppRoutes() {
  const dispatch = useDispatch();
  const { isCheckingAuth } = useSelector((state) => state.auth);
  const { isCheckingAuth: isAdminCheckingAuth } = useSelector((state) => state.adminAuth);

  useEffect(() => {
    const userToken = localStorage.getItem('accessToken');
    const adminToken = localStorage.getItem('adminAccessToken');
    
    if (userToken) {
      dispatch(getMe());
    } else {
      dispatch(setCheckingDone());
    }
    
    if (adminToken) {
      dispatch(getAdminMe());
    } else {
      dispatch(setAdminCheckingDone());
    }
  }, [dispatch]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth || isAdminCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div 
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" 
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} 
        />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* 🔥 ADD THIS - Google OAuth Success Route */}
      <Route path="/auth-success" element={<AuthSuccess />} />

      {/* Student Routes */}
      <Route path="/student" element={<StudentRoute><StudentLayout /></StudentRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="quizzes/:id" element={<QuizInterface />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="results/:id" element={<ResultDetail />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="quizzes" element={<AdminQuizzesPage />} />
        <Route path="quizzes/builder" element={<QuizBuilderPage />} />
        <Route path="quizzes/builder/:id" element={<QuizBuilderPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="results" element={<AdminResultsPage />} />
        <Route path="leaderboard" element={<AdminLeaderboardPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 404 - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}