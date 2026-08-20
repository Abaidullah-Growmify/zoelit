"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "@/lib/api";

const initialState = {
  admin: null,
  token: null,
  hasHydrated: false,
  status: "idle",
  error: null,
};

export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async ({ email, password, remember }) => api.adminLogin({ email, password, remember })
);

export const adminLogout = createAsyncThunk("adminAuth/logout", async (_, { getState }) => {
  const { token } = getState().adminAuth;
  try {
    if (token) await api.adminLogout(token);
  } catch {
    // Ignore network errors; always clear the local session.
  }
  return null;
});

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
    },
    forceLogout: (state) => {
      state.admin = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    },
    hydrateAdminAuth: (state, action) => {
      const stored = action.payload;
      if (stored && stored.admin && stored.token) {
        state.admin = stored.admin;
        state.token = stored.token;
      }
      state.hasHydrated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.admin = action.payload.admin;
        state.token = action.payload.token;
      })
      .addCase(adminLogin.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.status = "idle";
        state.admin = null;
        state.token = null;
      });
  },
});

export const { setAdmin, hydrateAdminAuth, forceLogout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
