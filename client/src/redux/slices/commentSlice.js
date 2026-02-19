// src/redux/slices/commentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as commentAPI from "../api/commentApi";

// 💬 Add a comment to post
export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ postId, text, token }, { rejectWithValue }) => {
    try {
      const res =await commentAPI.addCommentAPI(postId, text, token);
      console.log("data.comment", data.comment);
      return data.comment;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add comment");
    }
  }
);

// 💭 Get all comments
export const getPostComments = createAsyncThunk(
  "comments/getPostComments",
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const { data } = await commentAPI.getPostCommentsAPI(postId, token);
      console.log("data.comments", data.comments);
      return data.comments;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load comments");
    }
  }
);

// ✏️ Update comment
export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, text, token }, { rejectWithValue }) => {
    try {
      const { data } = await commentAPI.updateCommentAPI(commentId, text, token);
      return data.comment;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update comment");
    }
  }
);

// 🗑️ Delete comment
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async ({ commentId, token }, { rejectWithValue }) => {
    try {
      await commentAPI.deleteCommentAPI(commentId, token);
      return commentId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete comment");
    }
  }
);

// 💬 Reply to comment
export const replyToComment = createAsyncThunk(
  "comments/replyToComment",
  async ({ commentId, text, token }, { rejectWithValue }) => {
    try {
      const { data } = await commentAPI.replyToCommentAPI(commentId, text, token);
      return { parentId: commentId, reply: data.reply };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to reply");
    }
  }
);

// ❤️ Like/Unlike comment
export const toggleComment = createAsyncThunk(
  "comments/toggleComment",
  async ({ commentId, token }, { rejectWithValue }) => {
    try {
      const { data } = await commentAPI.toggleCommentAPI(commentId, token);
      console.log("toggleComment",data.likesCount)
      return {
        commentId,
        liked: data.liked,
        likesCount: data.likesCount,
        UserId:data.UserId
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to like/unlike comment");
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    comments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add comment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.unshift(action.payload);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch comments
      .addCase(getPostComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPostComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(getPostComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.comments[index] = { ...state.comments[index], ...action.payload };
        }
      })

      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c._id !== action.payload);
      })

      // Reply to comment
      .addCase(replyToComment.fulfilled, (state, action) => {
        const parent = state.comments.find((c) => c._id === action.payload.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(action.payload.reply);
        }
      })

      // Like/Unlike comment
      .addCase(toggleComment.fulfilled, (state, action) => {
        const comment = state.comments.find((c) => c._id === action.payload.commentId);
        if (comment) {
          comment.likesCount = action.payload.likesCount;
          comment.liked = action.payload.liked;
        }
      });
  },
});

export default commentSlice.reducer;
