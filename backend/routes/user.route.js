import express from "express";

const router = express.Router();

// Get user
router.get("/", (req, res) => {
  res.send("Get user");
});
// Update userrouter.put("/:id", verifyToken, updateUser);

export default router;