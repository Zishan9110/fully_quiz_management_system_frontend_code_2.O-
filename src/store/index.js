import { configureStore } from '@reduxjs/toolkit';
import authReducer        from './slices/authSlice';
import adminAuthReducer   from './slices/adminAuthSlice';
import themeReducer       from './slices/themeSlice';
import notificationReducer from './slices/notificationSlice';
import quizReducer        from './slices/quizSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    adminAuth:    adminAuthReducer,
    theme:        themeReducer,
    notifications: notificationReducer,
    quiz:         quizReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
});
