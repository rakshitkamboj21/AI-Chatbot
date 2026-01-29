import express from "express";
import Knowledge from "../models/Knowledge.js";
import { getAIResponse } from "../utils/aiUtil.js"; // updated util
import { getDatingResponse } from "../utils/datingUtil.js";
import Chat from "../models/chat.js";

const router = express.Router();

// Save message in DB
async function saveMessage(userId, botType, sender, text) {
  let chat = await Chat.findOne({ userId, botType });
  if (!chat) {
    chat = new Chat({ userId, botType, messages: [] });
  }
  chat.messages.push({ sender, text });
  await chat.save();
  return chat;
}

// 📌 Get chat history (last 50 messages)
router.get("/history/:userId/:botType", async (req, res) => {
  try {
    const { userId, botType } = req.params;
    const chat = await Chat.findOne({ userId, botType });
    res.json(chat ? chat.messages.slice(-50) : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// 🟦 General Bot
router.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ response: "userId and message are required" });
    }

    // Save user message
    await saveMessage(userId, "general", "user", message);

    // Fetch chat history to provide context to AI
    const chat = await Chat.findOne({ userId, botType: "general" });
    const messagesForAI = chat.messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }));

    // Knowledge Base lookup
    const faq = await Knowledge.findOne({
      question: { $regex: message, $options: "i" }
    });

    let aiReply;
    if (faq) {
      aiReply = faq.answer;
    } else {
      aiReply = await getAIResponse(messagesForAI); // pass full chat context
    }

    // ✅ Aggressively clean AI reply to remove all "Bot:" occurrences
    aiReply = (aiReply || "").replace(/Bot:\s*/gi, "").trim();

    // Save bot reply
    await saveMessage(userId, "general", "bot", aiReply);

    res.json({ response: aiReply });
  } catch (err) {
    console.error("General Bot Error:", err.message);
    res.status(500).json({ response: "Internal Server Error" });
  }
});

// 💖 Dating Bot
router.post("/dating", async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ response: "userId and message are required" });
    }

    await saveMessage(userId, "dating", "user", message);

    const chat = await Chat.findOne({ userId, botType: "dating" });
    const messagesForAI = chat.messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }));

    let aiReply = await getDatingResponse(messagesForAI);

    // ✅ Aggressively clean AI reply
    aiReply = (aiReply || "").replace(/Bot:\s*/gi, "").trim();

    await saveMessage(userId, "dating", "bot", aiReply);

    res.json({ response: aiReply });
  } catch (err) {
    console.error("Dating Bot Error:", err.message);
    res.status(500).json({ response: "Internal Server Error" });
  }
});

// 🔄 Start a New Chat
router.post("/new-chat", async (req, res) => {
  try {
    const { userId, botType } = req.body;
    if (!userId || !botType) {
      return res.status(400).json({ response: "userId and botType are required" });
    }

    let chat = await Chat.findOne({ userId, botType });
    if (chat) {
      chat.messages = [];
      chat.memorySummary = "";
      await chat.save();
    }

    res.json({ response: `New ${botType} chat started!` });
  } catch (err) {
    console.error("New Chat Error:", err.message);
    res.status(500).json({ response: "Internal Server Error" });
  }
});

export default router;
