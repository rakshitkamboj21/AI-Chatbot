// backend/routes/datingRoutes.js
import express from "express";
import { datingChat, newDatingChat } from "../controllers/datingController.js";

const router = express.Router();

// 💖 Chat with Dating Bot
router.post("/chat", datingChat);

// 🔄 Start a new Dating Chat
router.post("/new-chat", newDatingChat);

export default router;
