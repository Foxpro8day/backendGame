// src/config/mongo.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydb";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Dừng chương trình nếu không thể kết nối
  }
};

module.exports = connectMongoDB;
