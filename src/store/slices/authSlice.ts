import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: Omit<User, "password"> | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
}

function loadFromStorage(): AuthState {
  try {
    const stored = localStorage.getItem("drivex-auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: true,
        role: parsed.user?.role || null,
      };
    }
  } catch {}
  return { user: null, token: null, isAuthenticated: false, role: null };
}

const initialState: AuthState = loadFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: Omit<User, "password">; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.role = action.payload.user.role;
      localStorage.setItem("drivex-auth", JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("drivex-auth");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
