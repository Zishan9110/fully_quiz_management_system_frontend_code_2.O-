import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi as api } from '@/services/api';
import toast from 'react-hot-toast';

// -----------------------------
// ADMIN LOGIN (Email/Password)
// -----------------------------
export const adminLogin = createAsyncThunk(
  'adminAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/auth/login', credentials);

      localStorage.setItem('adminAccessToken', data.accessToken);
      localStorage.setItem('adminRefreshToken', data.refreshToken);
      localStorage.setItem('admin', JSON.stringify(data.data));

      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Login failed'
      );
    }
  }
);

// -----------------------------
// ADMIN GOOGLE LOGIN
// -----------------------------
export const adminGoogleLogin = createAsyncThunk(
  'adminAuth/googleLogin',
  async (googleData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/auth/google-login', googleData);

      // Check if admin is pending approval
      if (data.isPending) {
        return { isPending: true, message: data.message };
      }

      // If approved, store tokens
      if (data.accessToken) {
        localStorage.setItem('adminAccessToken', data.accessToken);
        localStorage.setItem('adminRefreshToken', data.refreshToken);
        localStorage.setItem('admin', JSON.stringify(data.data));
        return data.data;
      }

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Google login failed'
      );
    }
  }
);

// -----------------------------
// GET ADMIN ME
// -----------------------------
export const getAdminMe = createAsyncThunk(
  'adminAuth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminAccessToken');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const { data } = await api.get('/admin/auth/me');

      return data.data;
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('admin');
      }

      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch admin'
      );
    }
  }
);

// -----------------------------
// ADMIN LOGOUT
// -----------------------------
export const adminLogout = createAsyncThunk(
  'adminAuth/logout',
  async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch (err) {
      console.log(err);
    }

    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('admin');
  }
);

// -----------------------------
// SLICE
// -----------------------------
const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    admin: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    isPendingApproval: false,
    pendingMessage: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPending: (state) => {
      state.isPendingApproval = false;
      state.pendingMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isAuthenticated = true;
        state.isPendingApproval = false;
        toast.success('Welcome, Admin!');
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // GOOGLE LOGIN
      .addCase(adminGoogleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGoogleLogin.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload?.isPending) {
          state.isPendingApproval = true;
          state.pendingMessage = action.payload.message;
          state.isAuthenticated = false;
          toast.success(action.payload.message || 'Admin registration pending approval');
        } else if (action.payload?.accessToken) {
          state.admin = action.payload;
          state.isAuthenticated = true;
          state.isPendingApproval = false;
          toast.success('Welcome, Admin!');
        }
      })
      .addCase(adminGoogleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // GET ME
      .addCase(getAdminMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminMe.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getAdminMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.admin = null;
        state.isAuthenticated = false;
      })

      // LOGOUT
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.isAuthenticated = false;
        state.isPendingApproval = false;
        state.pendingMessage = null;
      });
  }
});

export const { clearError, clearPending } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;