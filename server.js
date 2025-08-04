require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ Improved CORS config
app.use(cors({
  origin: "http://localhost:3000",  // ✅ Allow frontend origin
  credentials: true
}));

// ✅ Middleware
app.use(express.json()); // Parse JSON requests
app.use("/uploads", express.static("uploads"));


// ✅ Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)

  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/users", require("./routes/users"));

// ✅ Default Route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Backend is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
