const express = require('express');
const router = express.Router();
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

// 🔐 Middleware to verify token
const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ✏️ Create a new post
router.post("/", auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Post content is required" });
    }

    const post = new Post({
      content,
      author: req.user.id, // from token
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("❌ Post creation error:", err.message);
    res.status(500).json({ error: "Failed to create post" });
  }
});
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ Create post with optional image
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const post = new Post({
      content,
      imageUrl,
      author: req.user.id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("❌ Post creation error:", err.message);
    res.status(400).json({ error: err.message });
  }
});


// 📜 Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name") // only include author's name
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});
// DELETE post
router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.author.toString() !== req.user.id)
    return res.status(403).json({ error: "Unauthorized" });

  await post.remove();
  res.json({ message: "Post deleted" });
});

// UPDATE post
router.put("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.author.toString() !== req.user.id)
    return res.status(403).json({ error: "Unauthorized" });

  post.content = req.body.content || post.content;
  await post.save();
  res.json(post);
});


module.exports = router;
