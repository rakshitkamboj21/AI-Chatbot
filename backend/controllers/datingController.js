// backend/controllers/datingController.js
import { getDatingResponse } from "../utils/datingUtil.js";
import Chat from "../models/chat.js";

// 🛠️ Generic helper: Save messages in DB
async function saveMessage(userId, botType, sender, text) {
  let chat = await Chat.findOne({ userId, botType });

  if (!chat) {
    chat = new Chat({ userId, botType, messages: [] });
  }

  // Add message with timestamp
  chat.messages.push({ sender, text, timestamp: new Date() });

  // Keep only last 50 messages
  chat.messages = chat.messages.slice(-50);

  await chat.save();
  return chat;
}

// 💖 Dating Bot Controller
export const datingChat = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }

    // Save user message
    await saveMessage(userId, "dating", "user", message);

    // Get AI response
    let aiReply;
    try {
      aiReply = await getDatingResponse(userId, message);
    } catch (err) {
      console.error("AI response error:", err.message);
      aiReply = "Oops! Something went wrong 😅";
    }

    // Save bot reply
    const chat = await saveMessage(userId, "dating", "bot", aiReply);

    // Return bot reply + full chat history
    res.json({ response: aiReply, chat: chat.messages });

  } catch (error) {
    console.error("Dating Chat Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔄 Reset dating chat
export const newDatingChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const chat = await Chat.findOne({ userId, botType: "dating" });
    if (chat) {
      chat.messages = []; // clear history
      await chat.save();
    }

    res.json({ response: "New dating chat started 💕", chat: [] });

  } catch (error) {
    console.error("New Dating Chat Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
