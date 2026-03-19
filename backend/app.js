import { Webhook } from "svix";
import User from "../models/user.model.js";

export const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ message: "Clerk Webhook Secret is missing" });
  }

  // 1. Get raw payload (Convert Buffer to String for Svix)
  const payload = req.body.toString();
  const headers = req.headers;

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  // 2. Verify the webhook signature
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  // 3. Handle the events
  const { id } = evt.data;
  const eventType = evt.type;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { username, email_addresses, image_url } = evt.data;
      
      // ✅ FIX: Access the email string correctly from Clerk's array
      const email = email_addresses[0]?.email_address;
      const userUsername = username || email.split("@")[0];

      // Use upsert to handle both create and update efficiently
      await User.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          username: userUsername,
          email: email,
          photo: image_url,
        },
        { upsert: true, new: true }
      );
      console.log(`✅ User ${id} synced with MongoDB`);
    }

    if (eventType === "user.deleted") {
      await User.findOneAndDelete({ clerkId: id });
      console.log(`❌ User ${id} deleted from MongoDB`);
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });

  } catch (dbError) {
    console.error("MongoDB Sync Error:", dbError.message);
    return res.status(500).json({ success: false, message: "Database sync failed" });
  }
};
