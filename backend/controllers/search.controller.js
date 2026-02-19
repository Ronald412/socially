import User from "../models/user.model.js";
import Post from "../models/post.model.js";

export const search = async (req, res) => {
  try {
    const { query } = req.query;
    let users = [];
    let posts = [];

    if (query && query.trim() !== "") {
      // Case-insensitive partial match on name or email for users
      users = await User.find({
        $or: [
          { fullName: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
        .select("fullName profileImage  followers")
        .limit(10);

      // Match posts by caption or tags
      posts = await Post.find({
        $or: [
          { caption: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      })
        .populate("user", "fullName profileImage")
        .limit(10)
        .sort({ createdAt: -1 });
    }

    // If no matches found, fallback
    if ((!users || users.length === 0) && (!posts || posts.length === 0)) {
      const fallbackPosts = await Post.find()
        .populate("user", "fullName profileImage")
        .sort({ createdAt: -1 })
        .limit(5);

      const topUsers = await User.find()
        .sort({ followers: -1 })
        .limit(5)
        .select("fullName profileImage followers");

      return res.status(200).json({
        message: "No direct match found — showing newest and top creators.",
        fallback: true,
        users: topUsers,
        posts: fallbackPosts,
      });
    }

    res.status(200).json({
      message: "Results found",
      fallback: false,
      users,
      posts,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
