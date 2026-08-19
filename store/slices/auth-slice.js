"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "@/lib/api";

const initialState = {
  user: null,
  token: null,
  hasHydrated: false,
  sessionChecked: false,
  status: "idle",
  error: null,
};

export const authLogin = createAsyncThunk(
  "auth/login",
  async ({ email, password, remember }) => api.authLogin({ email, password, remember })
);

export const authRegister = createAsyncThunk(
  "auth/register",
  async (values) => api.authRegister(values)
);

export const authLogout = createAsyncThunk("auth/logout", async (_, { getState }) => {
  const { token } = getState().auth;
  try {
    if (token) await api.authLogout(token);
  } catch {
    // Ignore network errors; always clear the local session.
  }
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.sessionChecked = false;
      state.status = "idle";
      state.error = null;
    },
    setSessionChecked: (state, action) => {
      state.sessionChecked = Boolean(action.payload);
    },
    hydrateAuth: (state, action) => {
      const stored = action.payload;
      if (stored && stored.user && stored.token) {
        state.user = stored.user;
        state.token = stored.token;
      }
      state.sessionChecked = false;
      state.hasHydrated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(authLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(authLogin.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(authRegister.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(authRegister.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(authRegister.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(authLogout.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
      });
  },
});

export const { setUser, hydrateAuth, forceLogout, setSessionChecked } = authSlice.actions;
export default authSlice.reducer;
