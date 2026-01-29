import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // sessionId or real userId
    botType: { type: String, enum: ["general", "dating"], required: true },

    // ✅ Give each chat a title for history list
    title: { type: String, default: "New Chat" },

    // All messages exchanged in this chat session
    messages: [messageSchema],

    // Optional: memory summary for very long conversations
    memorySummary: { type: String, default: "" }
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

// ✅ Index to query chats efficiently
chatSchema.index({ userId: 1, botType: 1, createdAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
