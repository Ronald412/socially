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
      const { username, email_addresses, image_url, first_name, last_name } = evt.data;
      
      // ✅ Schema Matching: Map Clerk data to your User schema fields
      const email = email_addresses[0]?.email_address;
      const fullName = `${first_name || ""} ${last_name || ""}`.trim();
      const userUsername = username || email.split("@")[0];

      await User.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          username: userUsername,
          email: email,
          profileImage: image_url, // Matches your schema
          fullName: fullName,       // Matches your schema
        },
        { upsert: true, new: true }
      );
      
      console.log(`✅ User ${id} synced with MongoDB Atlas`);
    }

    if (eventType === "user.deleted") {
      await User.findOneAndDelete({ clerkId: id });
      console.log(`❌ User ${id} deleted from MongoDB Atlas`);
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });

  } catch (dbError) {
    console.error("MongoDB Sync Error:", dbError.message);
    return res.status(500).json({ success: false, message: "Database sync failed" });
  }
};
