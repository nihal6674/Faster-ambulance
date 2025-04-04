import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    role: null,
    userId: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.userId = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
