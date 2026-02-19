import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { caption, tags } = req.body;
    const clerkId = req.auth.userId;

    // 🧩 Validation
    if (!req.files || (!req.files.images && !req.files.videos)) {
      return res.status(400).json({
        success: false,
        message: "At least one image or video file is required.",
      });
    }

    // 🔍 Find user by Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 🖼️ Upload media files to Cloudinary
    const mediaUploads = [];

    // Upload images
    if (req.files.images) {
      for (const img of req.files.images) {
        const result = await uploadToCloudinary(img.path, {
          folder: "posts/images",
          resource_type: "image",
        });
        mediaUploads.push({ url: result.secure_url, type: "image" });
      }
    }

    // Upload videos
    if (req.files.videos) {
      for (const vid of req.files.videos) {
        const result = await uploadToCloudinary(vid.path, {
          folder: "posts/videos",
          resource_type: "video",
        });
        mediaUploads.push({ url: result.secure_url, type: "video" });
      }
    }

    // 🏷️ Parse tags (string → array)
    let parsedTags = [];
    if (typeof tags === "string") {
      parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    // 🆕 Create new post
    const newPost = new Post({
      user: user._id, // ✅ Correct: use MongoDB ObjectId, not Clerk ID
      media: mediaUploads,
      caption: caption?.trim() || "",
      tags: parsedTags,
    });

    // 💾 Save post
    await newPost.save();

    await User.findByIdAndUpdate(user._id, {
      $push: { uploadedPosts: newPost._id },
    });

    // ✅ Response
    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post.",
      error: error.message,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    // Optional pagination support (for scalability)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "fullName profileImage ", // minimal user data
      })
      .populate({
        path: "comments",
        select: "text user createdAt",
        populate: { path: "user", select: "fullName profileImage" },
      })
      .select("media caption tags likes commentsCount views createdAt") // only necessary post fields
      .lean(); // plain JS objects for better performance

    const total = await Post.countDocuments();

    res.status(200).json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate({
        path: "user",
        select: "fullName clerkId profileImage ",
      })
      .populate({
        path: "comments",
        select: "text user createdAt",
        populate: { path: "user", select: "fullName profileImage" },
      })
      .select("media caption tags likes createdAt")
      .lean();

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ success: false, message: "Failed to fetch post" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Fetch user info
    const user = await User.findById(userId)
      .select("fullName profileImage  followers following")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Get posts for that user
    const posts = await Post.find({ user: userId })
      .populate("user", "fullName profileImage")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Add counts (for simplicity)
    const userWithCounts = {
      ...user,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    };

    res.status(200).json({
      user: userWithCounts,
      posts,
    });
  } catch (error) {
    console.error("Error fetching user and posts:", error);
    res.status(500).json({ message: "Failed to fetch user and posts" });
  }
};


export const togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const clerkId = req.auth.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found." });

    // 🔥 Use clerkId field instead of _id
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found." });

    const alreadyLiked = post.likes.some(
      (likedUserId) => likedUserId.toString() === user._id.toString()
    );

    if (alreadyLiked) {
      post.likes.pull(user._id);
      user.likedPosts.pull(post._id);
    } else {
      post.likes.addToSet(user._id);
      user.likedPosts.addToSet(post._id);
    }

    post.likesCount = post.likes.length;

    await post.save();
    await user.save();

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      userId: user._id,
      totalLikes: post.likesCount,
      message: alreadyLiked ? "Post unliked." : "Post liked.",
    });
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    res.status(500).json({ message: "Failed to like/unlike post." });
  }
};

export const togglePostSave = async (req, res) => {
  try {
    const { postId } = req.params;
    const clerkId = req.auth.userId;

    // 1️⃣ Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // 2️⃣ Fetch user using Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // 3️⃣ Check if post is already saved
    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== postId.toString()
      );
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      saved: !isSaved,
      message: isSaved
        ? "Post unsaved successfully."
        : "Post saved successfully.",
    });
  } catch (error) {
    console.error("Error toggling saved post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle saved post.",
    });
  }
};

export const incrementPostViewCount = async (req, res) => {
  try {
    const { postId } = req.params; // post ID
    const clerkId = req.auth.userId; // Clerk ID from token

    // 1️⃣ Find the user in your DB using clerkId
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2️⃣ Find the post by its MongoDB ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // 3️⃣ Check if user has already viewed this post
    const hasViewed = post.viewedBy.some(
      (viewerId) => viewerId.toString() === user._id.toString()
    );

    if (hasViewed) {
      return res.status(200).json({
        success: false,
        message: "View already counted for this user.",
        views: post.views,
      });
    }

    // 4️⃣ Increment views and store the user reference
    post.views += 1;
    post.viewedBy.push(user._id);
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Video view count incremented.",
      views: post.views,
    });
  } catch (error) {
    console.error("Error incrementing video view count:", error);
    res.status(500).json({ message: "Failed to increment video view count." });
  }
};


export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId; // Clerk authentication
    const { caption, tags } = req.body;

    // 🔍 Find the user via Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found." });

    // 🔎 Find post
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    // 🔐 Verify ownership
    if (post.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post." });
    }

    // 🖼 Replace existing media if new files are uploaded
    if (req.files?.images?.length > 0 || req.files?.videos?.length > 0) {
      // Delete old media from Cloudinary
      for (const mediaItem of post.media) {
        await deleteFromCloudinary(mediaItem.url, mediaItem.type);
      }

      const newMedia = [];

      // Upload new images
      if (req.files.images) {
        for (const file of req.files.images) {
          const result = await uploadToCloudinary(file.path, {
            folder: "posts/images",
            resource_type: "image",
          });
          newMedia.push({ url: result.secure_url, type: "image" });
        }
      }

      // Upload new videos
      if (req.files.videos) {
        for (const file of req.files.videos) {
          const result = await uploadToCloudinary(file.path, {
            folder: "posts/videos",
            resource_type: "video",
          });
          newMedia.push({ url: result.secure_url, type: "video" });
        }
      }

      post.media = newMedia;
    }

    // ✏️ Update caption and tags
    if (caption) post.caption = caption;
    if (tags)
      post.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t) => t.trim());

    // 💾 Save updated post
    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post." });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    // 🔍 Find the user via Clerk
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found." });

    // 🔎 Find the post
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    // 🔐 Ownership check
    if (post.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post." });
    }

    // 🧹 Remove post from user's uploadedPosts
    await User.updateMany(
      { uploadedPosts: post._id },
      { $pull: { uploadedPosts: post._id } }
    );

    // 🧹 Remove post references from likes/saves
    await User.updateMany(
      { likedPosts: post._id },
      { $pull: { likedPosts: post._id } }
    );

    await User.updateMany(
      { savedPosts: post._id },
      { $pull: { savedPosts: post._id } }
    );

    // 🗑 Delete all comments linked to this post
    await Comment.deleteMany({ _id: { $in: post.comments } });

    // 🌩 Delete media from Cloudinary
    for (const mediaItem of post.media) {
      await deleteFromCloudinary(mediaItem.url, mediaItem.type);
    }

    // 🧾 Delete the post itself
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully and all references cleaned up.",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post." });
  }
};
