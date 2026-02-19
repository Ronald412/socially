import express from "express";
import { requireAuth } from "../middleware/clerkAuth.js";
import {
  addCommentToPost,
  getPostComments,
  updateComment,
  deleteComment,
  replyToComment,
  toggleComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

// 💬 Add comment to a post(supports nested replies via body.parentCommentId)
router.post("/comment/:postId", requireAuth, addCommentToPost);

// 💭 Get all comments for a post
router.get("/comment/:postId", getPostComments);

// ✏️ Update a comment (owner only)
router.patch("/:commentId", requireAuth, updateComment);

// 🗑️ Delete a comment (owner only)
router.delete("/:commentId", requireAuth, deleteComment);

// 💬 Reply to a comment
router.post("/reply/:commentId", requireAuth, replyToComment);

// ❤️ Like or unlike a comment
router.patch("/like/:commentId", requireAuth, toggleComment);

export default router;
