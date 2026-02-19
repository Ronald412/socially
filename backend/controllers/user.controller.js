import User from "../models/user.model.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";
import Post from "../models/post.model.js";


export const getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    // Fetch user with selected fields and populate only necessary info
    const user = await User.findOne({ clerkId })
      .select(
        "clerkId fullName profileImage email  followers following likedPosts savedPosts uploadedPosts"
      )
      .populate({
        path: "followers following",
        select: "clerkId fullName profileImage",
      })
      .populate({
        path: "likedPosts savedPosts uploadedPosts",
        select: "caption media createdAt", // only relevant post info
      })
      .lean(); // returns plain JS object, not Mongoose document

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params; // person to follow/unfollow
    const clerkId = req.auth.userId; // logged-in user’s Clerk ID

    // find logged-in user
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    // prevent following yourself
    if (currentUser._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser)
      return res.status(404).json({ message: "Target user not found" });

    let isFollowing;

    // check if already following
    if (currentUser.following.includes(userId)) {
      // 🔹 Unfollow logic
      await Promise.all([
        User.findByIdAndUpdate(currentUser._id, {
          $pull: { following: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { followers: currentUser._id },
        }),
      ]);

      isFollowing = false;
    } else {
      // 🔹 Follow logic
      await Promise.all([
        User.findByIdAndUpdate(currentUser._id, {
          $addToSet: { following: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $addToSet: { followers: currentUser._id },
        }),
      ]);

      isFollowing = true;
    }

    const updatedUser = await User.findById(userId)
      .select("fullName profileImage followers following")
      .populate("followers", "fullName profileImage")
      .populate("following", "fullName profileImage");

    return res.status(200).json({
      success: true,
      message: isFollowing
        ? "Followed successfully."
        : "Unfollowed successfully.",
      isFollowing,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Toggle follow error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle follow.",
    });
  }
};

export const handleClerkWebhook = async (req, res) => {
  try {
    const event = req.event;
    const { type, data } = event;

    if (type === "user.created") {
      const clerkId = data.id;
      const existingUser = await User.findOne({ clerkId });

      if (!existingUser) {
        const newUser = new User({
          clerkId,
          fullName: data.first_name
            ? `${data.first_name} ${data.last_name || ""}`.trim()
            : "Anonymous",
          email: data.email_addresses?.[0]?.email_address || "",
          profileImage: data.image_url || "",
          username:
            data.username ||
            data.first_name?.toLowerCase() ||
            `user_${Date.now()}`,
        });

        await newUser.save();
      }
    } else if (type === "user.updated") {
      const clerkId = data.id;
      const updates = {
        fullName: data.first_name
          ? `${data.first_name} ${data.last_name || ""}`.trim()
          : undefined,
        email: data.email_addresses?.[0]?.email_address,
        profileImage: data.image_url,
        username: data.username,
      };

      Object.keys(updates).forEach(
        (key) => updates[key] === undefined && delete updates[key]
      );

      await User.findOneAndUpdate({ clerkId }, updates, { new: true });
    } else if (type === "user.deleted") {
      const clerkId = data.id;
      const user = await User.findOne({ clerkId });

      if (user) {
        if (user.coverImage) {
          try {
            await deleteFromCloudinary(user.coverImage);
          } catch (err) {}
        }

        await User.updateMany(
          { followers: user._id },
          { $pull: { followers: user._id } }
        );
        await User.updateMany(
          { following: user._id },
          { $pull: { following: user._id } }
        );
        await Post.updateMany(
          { likes: user._id },
          { $pull: { likes: user._id } }
        );
        await Post.updateMany(
          { savedBy: user._id },
          { $pull: { savedBy: user._id } }
        );

        const uploadedPosts = await Post.find({ uploadedBy: user._id });
        for (const post of uploadedPosts) {
          for (const media of post.media) {
            try {
              await deleteFromCloudinary(media.url);
            } catch (err) {}
          }
          await Post.deleteOne({ _id: post._id });
        }

        await User.deleteOne({ clerkId });
      }
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
