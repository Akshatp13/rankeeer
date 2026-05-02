import { createSlice } from '@reduxjs/toolkit';

// NOTE FOR SUPABASE: Run this SQL if the column doesn't exist yet:
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_exam TEXT DEFAULT NULL;

const storedUser = localStorage.getItem('user');
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

const initialState = {
  user: parsedUser,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  weakTopics: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    setSelectedExam: (state, action) => {
      if (state.user) {
        state.user.selectedExam = action.payload;
        state.user.isNewUser = false;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    setWeakTopics: (state, action) => {
      state.weakTopics = action.payload;
    },
  },
});

export const { loginSuccess, logout, setSelectedExam, setWeakTopics } = authSlice.actions;
export default authSlice.reducer;
