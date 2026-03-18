import express from "express";
// Import the correct name 'requireAuth' from your middleware
import { requireAuth } from "../middleware/clerkAuth.js";
import User from "../models/user.model.js";
const router = express.Router();

// Get all users
router.get("/all", (req, res) => {
  res.status(200).json({ message: "Get all users successful" });
});

// Get current user
// Use requireAuth here to match your middleware export
router.get("/me", requireAuth, async (req, res) => {
  try {
    // Clerk usually attaches data to req.auth
    res.status(200).json(req.auth || req.user || {});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to create a new user in MongoDB after Clerk sign-up
router.post("/webhook", async (req, res) => {
  try {
    // 1. Extract data from Clerk's nested structure
    const { id: clerkId, email_addresses, username, image_url: img } = req.body.data;
    const email = email_addresses[0].email_address;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    // 3. Create and Save
    const newUser = new User({
      clerkId,
      email,
      username: username || email.split('@')[0], // Fallback if no username
      img,
    });

    await newUser.save();
    console.log("User successfully saved to MongoDB");
    res.status(201).json(newUser);

  } catch (error) {
    console.error("Webhook Save Error:", error);
    res.status(500).json({ message: "Error saving user to database" });
  }
});


export default router;