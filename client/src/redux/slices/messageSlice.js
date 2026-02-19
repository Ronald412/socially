import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import * as api from "../api/messageApi";

// 🧠 Fetch users for sidebar
export const fetchChatUsers = createAsyncThunk(
  "messages/fetchChatUsers",
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.getChatUsersAPI(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to load users");
    }
  }
);

// 💬 Fetch all messages for a chat
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await api.getMessagesAPI(userId, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to load messages");
    }
  }
);

// 🚀 Send a new message
export const sendMessageThunk = createAsyncThunk(
  "messages/sendMessage",
  async ({ userId, formData, token }, { rejectWithValue }) => {
    try {
      const response = await api.sendMessageAPI(userId, formData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to send message");
    }
  }
);


const messageSlice = createSlice({
  name: "messages",
  initialState: {
    chatUsers: [],
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    // For real-time updates (socket.io)
    addNewMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 🧠 fetchChatUsers
      .addCase(fetchChatUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.chatUsers = action.payload;
      })
      .addCase(fetchChatUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 💬 fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🚀 sendMessage
      .addCase(sendMessageThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessageThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addNewMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
