import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import * as api from "../api/searchApi";

export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async (query, { rejectWithValue }) => {
    try {
      const data = await api.searchApi(query);
      console.log("data",data)
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Search request failed"
      );
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    users: [],
    posts: [],
    fallback: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearSearch: (state) => {
      state.users = [];
      state.posts = [];
      state.error = null;
      state.fallback = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.posts = action.payload.posts || [];
        state.fallback = action.payload.fallback || false;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;