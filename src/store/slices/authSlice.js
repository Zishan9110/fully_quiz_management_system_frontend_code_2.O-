import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentApi as api } from '@/services/api';
import toast from 'react-hot-toast';

// ============ EXISTING AUTH THUNKS ============
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    console.log('📤 Login attempt:', credentials.email);
    const response = await api.post('/auth/login', credentials);
    console.log('📥 Login response:', response.data);
    
    const { data } = response;
    
    if (data.success && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } else {
      return rejectWithValue(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('❌ Login error:', err.response?.data);
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    
    if (data.success) {
      toast.success('Registration successful! Please login.');
      return data.data;
    } else {
      return rejectWithValue(data.message || 'Registration failed');
    }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return rejectWithValue('No token found');
    }
    
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/update-profile', profileData);
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.data));
      toast.success('Profile updated successfully');
      return data.data;
    }
    return rejectWithValue(data.message || 'Update failed');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (passwordData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/change-password', passwordData);
    if (data.success) {
      toast.success('Password changed successfully');
      return data.data;
    }
    return rejectWithValue(data.message || 'Password change failed');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Password change failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { 
    await api.post('/auth/logout'); 
  } catch (e) {}
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
});

// ============ 🔥 GOOGLE LOGIN THUNK ============
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleData, { rejectWithValue }) => {
    try {
      console.log('📤 Google login attempt');
      
      const response = await api.post('/auth/google/token', googleData);
      console.log('📥 Google login response:', response.data);
      
      const { data } = response;
      
      if (data.success && data.token) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast.success(`Welcome ${data.user.firstName}!`);
        return data.user;
      } else {
        return rejectWithValue(data.message || 'Google login failed');
      }
    } catch (err) {
      console.error('❌ Google login error:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Google login failed. Please try again.';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ============ 🔥 GOOGLE REDIRECT HANDLER ============
export const handleGoogleRedirect = createAsyncThunk(
  'auth/handleGoogleRedirect',
  async (_, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (!token) {
        return rejectWithValue('No token found in URL');
      }
      
      localStorage.setItem('accessToken', token);
      
      const { data } = await api.get('/auth/me');
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        toast.success(`Welcome ${data.data.firstName}!`);
        return data.data;
      } else {
        return rejectWithValue('Failed to fetch user data');
      }
    } catch (err) {
      console.error('❌ Google redirect error:', err);
      return rejectWithValue('Google authentication failed');
    }
  }
);

// ============ AUTH SLICE ============
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    googleLoading: false,
    isCheckingAuth: true // 🔥 ADD THIS - AppRoutes ke liye
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetGoogleLoading: (state) => {
      state.googleLoading = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    // 🔥 ADD THIS - setCheckingDone reducer
    setCheckingDone: (state) => {
      state.isCheckingAuth = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // ============ LOGIN ============
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
        toast.success('Welcome back!');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isCheckingAuth = false;
      })
      
      // ============ REGISTER ============
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // ============ GET ME ============
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
      })
      
      // ============ UPDATE PROFILE ============
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      
      // ============ CHANGE PASSWORD ============
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // ============ LOGOUT ============
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.googleLoading = false;
        state.isCheckingAuth = false;
        toast.success('Logged out successfully');
      })
      
      // ============ 🔥 GOOGLE LOGIN ============
      .addCase(loginWithGoogle.pending, (state) => {
        state.googleLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.googleLoading = false;
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.isCheckingAuth = false;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.googleLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
      })
      
      // ============ 🔥 GOOGLE REDIRECT ============
      .addCase(handleGoogleRedirect.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleGoogleRedirect.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.isCheckingAuth = false;
      })
      .addCase(handleGoogleRedirect.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
      });
  }
});

// ============ EXPORT ACTIONS ============
export const { clearError, resetGoogleLoading, setUser, setCheckingDone } = authSlice.actions;
export default authSlice.reducer;