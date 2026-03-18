import { Webhook } from "svix";
import User from "../models/user.model.js";

export const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ message: "Webhook secret not found" });
  }

  const payload = req.body;
  const headers = req.headers;

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(payload, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });
  } catch (err) {
    return res.status(400).json({ message: "Verification failed" });
  }

  const { id, ...attributes } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      const newUser = new User({
        clerkId: id,
        username: attributes.username || attributes.email_addresses[0].email_address.split('@')[0],
        email: attributes.email_addresses[0].email_address,
        photo: attributes.image_url,
      });

      await newUser.save();
      return res.status(200).json({ message: "User created in DB" });
    } catch (error) {
      return res.status(500).json({ message: "Error saving user", error });
    }
  }

  res.status(200).json({ message: "Webhook received" });
};