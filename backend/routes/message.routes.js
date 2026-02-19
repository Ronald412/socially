import express from "express";
import multer from "multer";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { requireAuth } from "../middleware/clerkAuth.js";
import storage from "../config/multerStorage.js";

const router = express.Router();
const upload = multer({ storage });


router.get("/users",requireAuth, getUsersForSidebar);
router.get("/:id",requireAuth, getMessages);
router.post(
  "/:id",
  requireAuth,
  upload.fields([
    { name: "images", maxCount: 5 }, // allow up to 5 images
    { name: "videos", maxCount: 5 }, // allow up to 5 videos
  ]),
  sendMessage
);

export default router;
