import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import * as api from "../api/postApi";

// --- Thunks ---

export const createPost = createAsyncThunk(
  "user/signupUser",
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const res = await api.createPost(formData, token);
      return res.data.post;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

export const fetchAllPosts = createAsyncThunk(
  "posts/fetchAllPosts",
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.fetchAllPost(token);
      // console.log("All posts fetched:", res.data);
      return res.data.posts;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);

export const getUserPosts = createAsyncThunk(
  "user/getUserPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.getUserPostsAPI(userId);
      console.log("User Posts:", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user posts"
      );
    }
  }
);
export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const res = await api.getPostById(postId, token);
      // console.log("Fetched Post:", res.data);
      return res.data.post;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch post"
      );
    }
  }
);

export const toggleLike = createAsyncThunk(
  "Post/toggleLike",
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const { data } = await api.toggleLike(postId, token);
      console.log("data :", data);
      return {
        postId,
        userId: data.userId,
        liked: data.liked,
        totalLikes: data.totalLikes,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 🔖 Toggle Save / Unsave Post
export const toggleSavePost = createAsyncThunk(
  "posts/toggleSavePost",
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const response = await api.toggleSave(postId, token);
      return { postId, saved: response.data.saved };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to toggle save");
    }
  }
);

// 👁️ Increment Post View Count
export const incrementPostView = createAsyncThunk(
  "posts/incrementPostView",
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const response = await api.incrementView(postId, token);
      return { postId, views: response.data.views };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to increment view"
      );
    }
  }
);

// 📝 Update existing post
export const updatePostThunk = createAsyncThunk(
  "post/updatePost",
  async ({ postId, formData, token }, { rejectWithValue }) => {
    try {
      const res = await api.updatePost(postId, formData, token);
      return res.data.updatedPost; // expect backend returns updatedPost
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update post"
      );
    }
  }
);

// ❌ Delete existing post
export const deletePostThunk = createAsyncThunk(
  "post/deletePost",
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const res = await api.deletePost(postId, token);
      return { postId, message: res.data.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete post"
      );
    }
  }
);
const postSlice = createSlice({
  name: "post",
  initialState: {
    currentPost: null,
    userInfo: null,
    posts: [],
    userPosts: [],
    loading: false,
    postsLoading: false,
    curPostLoading: false,
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
      // Create
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.token = action.payload.token; // you can use this if you need other wise, remove 
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all posts
      .addCase(fetchAllPosts.pending, (state) => {
        state.postsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.postsLoading = false;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.error = action.payload;
        state.postsLoading = false;
      })
      // Fetch current post
      .addCase(fetchPostById.pending, (state) => {
        state.curPostLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.curPostLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.curPostLoading = false;
        state.error = action.payload;
      })
      // === Fetch Posts by User ===

      .addCase(getUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.userInfo = action.payload.user;
        state.userPosts = action.payload.posts;
        state.loading = false;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked, totalLikes, userId } = action.payload;

        // Find the post in posts array
        const postIndex = state.posts.findIndex((post) => post._id === postId);

        if (postIndex !== -1) {
          const post = state.posts[postIndex];

          post.likesCount = totalLikes;
          post.likes = post.likes || [];

          const alreadyLiked = post.likes.includes(userId);

          if (liked && !alreadyLiked) {
            post.likes.push(userId);
          } else if (!liked && alreadyLiked) {
            post.likes = post.likes.filter((id) => id !== userId);
          }
        }
      })

      // 🔖 Toggle Save
      .addCase(toggleSavePost.fulfilled, (state, action) => {
        const { postId, saved } = action.payload;
        const postIndex = state.posts.findIndex((p) => p._id === postId);
        if (postIndex !== -1) {
          const post = state.posts[postIndex];
        }
      })
      .addCase(toggleSavePost.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 👁️ Increment Views
      .addCase(incrementPostView.fulfilled, (state, action) => {
        const { postId, views } = action.payload;
        const postIndex = state.posts.findIndex((p) => p._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].views = views;
        }
      })
      .addCase(incrementPostView.rejected, (state, action) => {
        state.error = action.payload;
      })

  

      // 🔄 Update Post
      .addCase(updatePostThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;

        // 🔁 Sync with all posts
        state.posts = state.posts.map((post) =>
          post._id === updated._id ? updated : post
        );

        // 🔁 Sync with user posts
        state.userPosts = state.userPosts.map((post) =>
          post._id === updated._id ? updated : post
        );

        // 🔁 Sync with current post
        if (state.currentPost?._id === updated._id) {
          state.currentPost = updated;
        }
      })
      .addCase(updatePostThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🗑️ Delete Post
      .addCase(deletePostThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        const { postId } = action.payload;
        state.loading = false;

        // 🔁 Remove from posts + userPosts
        state.posts = state.posts.filter((p) => p._id !== postId);
        state.userPosts = state.userPosts.filter((p) => p._id !== postId);

        // ❌ Clear current post if it’s the same one
        if (state.currentPost?._id === postId) {
          state.currentPost = null;
        }
      })
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { clearError, reset } = postSlice.actions;
export default postSlice.reducer;
