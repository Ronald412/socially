import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import * as api from "../api/userApi";

// --- Thunks ---

export const fetchCurrentAuthUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.CurrentAuthUser(token); // call the exported function
      console.log("CurrentUser", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Auth check failed"
      );
    }
  }
);
export const fetchAllUser = createAsyncThunk(
  "user/fetchAllUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchAllUserAPI();
      console.log("CurrentUser", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Auth check failed"
      );
    }
  }
);

// ✅ Toggle Follow/Unfollow
export const toggleFollow = createAsyncThunk(
  "user/toggleFollow",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const res = await api.toggleFollowAPI(userId, token);
      console.log("Follow/unfollow response:", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle follow"
      );
    }
  }
);
// --- Slice ---

const userSlice = createSlice({
  name: "authUser",
  initialState: {
    users: [],
    viewingUser: null,
    currentAuthUser: null,
    loading: false,
    authUserLoading: false,
   
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Auth Check
      .addCase(fetchCurrentAuthUser.pending, (state) => {
        state.authUserLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentAuthUser.fulfilled, (state, action) => {
        state.currentAuthUser = action.payload;
      })
      .addCase(fetchCurrentAuthUser.rejected, (state, action) => {
        state.error = action.payload;
        state.authUserLoading = false;
      })

      // ====== FETCH ALL USERS ======
      .addCase(fetchAllUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(toggleFollow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        state.loading = false;
        const { user, isFollowing } = action.payload;

        // ✅ Update global user list
        state.users = state.users.map((u) => (u._id === user._id ? user : u));

        // ✅ Update viewed user if currently selected
        if (state.viewingUser && state.viewingUser._id === user._id) {
          state.viewingUser = user;
        }

        // ✅ Update currentAuthUser.following
        if (state.currentAuthUser) {
          const alreadyFollowing = state.currentAuthUser.following.some(
            (f) => f._id === user._id
          );

          if (isFollowing && !alreadyFollowing) {
            state.currentAuthUser.following.push(user);
          } else if (!isFollowing && alreadyFollowing) {
            state.currentAuthUser.following =
              state.currentAuthUser.following.filter((f) => f._id !== user._id);
          }
        }
      })

      .addCase(toggleFollow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { clearError, reset } = userSlice.actions;
export default userSlice.reducer;
