import { createSlice } from '@reduxjs/toolkit';

const savedDark = localStorage.getItem('darkMode') === 'true';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { isDark: savedDark },
  reducers: {
    toggleDark: (state) => {
      state.isDark = !state.isDark;
      localStorage.setItem('darkMode', state.isDark);
      document.documentElement.classList.toggle('dark', state.isDark);
    },
    setDark: (state, action) => {
      state.isDark = action.payload;
      localStorage.setItem('darkMode', state.isDark);
      document.documentElement.classList.toggle('dark', state.isDark);
    }
  }
});

export const { toggleDark, setDark } = themeSlice.actions;
export default themeSlice.reducer;
