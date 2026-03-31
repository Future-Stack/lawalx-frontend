import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  email: string | null;
  token: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
}

// Helper to decode user from token
const getUserFromToken = (token: string): User | null => {
  try {
    const decoded: any = jwtDecode(token);
    // Matching the payload structure from the image: userId, role, userEmail
    return {
      id: decoded.userId || decoded.id || decoded.sub || "1",
      email: decoded.userEmail || decoded.email || decoded.username || "",
      role: decoded.role || "user",
      name: decoded.name || decoded.userName || "",
    };
  } catch (e) {
    return null;
  }
};

// Helper to get initial state from cookies
const getInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, email: null, token: null, refreshToken: null, isHydrated: false };
  }

  const token = Cookies.get("token") || null;
  const refreshToken = Cookies.get("refreshToken") || null;
  const user = token ? getUserFromToken(token) : null;

  return {
    user,
    email: user?.email || null,
    token,
    refreshToken,
    isHydrated: true,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user?: User; token: string; refreshToken: string; email?: string }>
    ) => {
      const { token, refreshToken } = action.payload;

      const decodedUser = getUserFromToken(token);
      const combinedUser = decodedUser || action.payload.user || null;

      // Strictly prioritize the email explicitly passed during login
      const finalEmail = action.payload.email || combinedUser?.email || null;

      if (combinedUser && finalEmail) {
        combinedUser.email = finalEmail;
      }

      state.token = token;
      state.refreshToken = refreshToken;
      state.user = combinedUser;
      state.email = finalEmail;
      state.isHydrated = true;

      // Save tokens to cookies (Secure & SameSite for security)
      Cookies.set("token", token, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set("refreshToken", refreshToken, { expires: 30, secure: true, sameSite: 'strict' });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;

      // Remove cookies
      Cookies.remove("token");
      Cookies.remove("refreshToken");
    },
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      state.user = getUserFromToken(action.payload.token);
      Cookies.set("token", action.payload.token, { expires: 7, secure: true, sameSite: 'strict' });
    }
  },
});

export const { setUser, logout, setToken } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectCurrentRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectIsHydrated = (state: { auth: AuthState }) => state.auth.isHydrated;
export const selectCurrentRole = (state: { auth: AuthState }) => state.auth.user?.role || null;
export const selectCurrentEmail = (state: { auth: AuthState }) => state.auth.email;
