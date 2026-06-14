import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi as api } from '@/services/api';
import toast from 'react-hot-toast';

export const adminLogin = createAsyncThunk(
  'adminAuth/login',
  async (credentials, { rejectWithValue }) => {
    console.log("LOGIN REQUEST STARTED");

    try {
      const { data } = await api.post('/admin/auth/login', credentials);

      localStorage.setItem('adminAccessToken', data.accessToken);
      localStorage.setItem('adminRefreshToken', data.refreshToken);
      localStorage.setItem('admin', JSON.stringify(data.data));

      return data.data;
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE:", err.response);
      console.log("DATA:", err.response?.data);

      return rejectWithValue(
        err.response?.data?.message || err.message || 'Login failed'
      );
    }
  }
);

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

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    admin: null,
    loading: false,
    error: null,
    isAuthenticated: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isAuthenticated = true;
        toast.success('Welcome, Admin!');
      })

      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

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

      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;