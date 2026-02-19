import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../redux/slices/userSlice";
import postReducer from "../redux/slices/postSlice"
import commentReducer from "../redux/slices/commentSlice"
import searchReducer from "../redux/slices/searchSlice"
import messageReducer from "../redux/slices/messageSlice"
export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    comments: commentReducer,
    search: searchReducer,
    messages: messageReducer,
  },
});
