import express from "express";
import multer from "multer";
import {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  togglePostLike,
  togglePostSave,
  incrementPostViewCount,
  deletePost,
  updatePost
} from "../controllers/post.controller.js";
import { requireAuth } from "../middleware/clerkAuth.js";
import storage from "../config/multerStorage.js";

const router = express.Router();

const upload = multer({ storage });

router.post(
  "/create",
  requireAuth,
  upload.fields([
    { name: "images", maxCount: 5 }, // allow up to 5 images
    { name: "videos", maxCount: 1 }, // allow up to 1 videos
  ]),
  createPost
);
 
router.get("/:userId/posts", getUserPosts);
router.get("/",  getAllPosts);
router.get("/:postId",  getPostById);
// ❤️ Like / Unlike a video
router.post("/like/:postId",requireAuth,  togglePostLike);

// 🔖 Save / Unsave Video (toggle)
router.put("/save/:postId", requireAuth, togglePostSave);
router.post("/view/:postId", requireAuth, incrementPostViewCount);

// 🧩 Update post
router.put(
  "/update/:id",
  requireAuth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 1 },
  ]),
  updatePost
);

// 🧨 Delete post
router.delete("/delete/:id", requireAuth, deletePost);

export default router;
