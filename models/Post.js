const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: { type: String },
    imageUrl: { type: String }, // 🌄 New field for uploaded image
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
