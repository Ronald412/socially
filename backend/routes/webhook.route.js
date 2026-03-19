import express from "express";
import { clerkWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

// Use express.raw to get the exact bytes Clerk sent
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook
);

export default router;
