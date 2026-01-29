import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

// Import routes
import aiRoutes from "./routes/aiRoutes.js";
import knowledgeRoutes from "./routes/KnowledgeRoutes.js";
import datingRoutes from "./routes/datingRoutes.js";
import searchRoutes from "./routes/searchRoutes.js"; // ✅ NEW Search API

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/ai", aiRoutes);                 // General AI chatbot
app.use("/api/knowledge", knowledgeRoutes);   // Knowledge base
app.use("/api/dating", datingRoutes);         // Dating chatbot 💖
app.use("/api/search", searchRoutes);         // 🌐 Web Search

// Health check
app.get("/", (req, res) => res.send("API is running 🚀"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) =>
    console.error("❌ MongoDB Connection Error:", err.message)
  );

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
