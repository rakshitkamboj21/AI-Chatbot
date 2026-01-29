// backend/utils/datingUtil.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const userConversations = {}; // memory per user

export const getDatingResponse = async (messages) => {
  try {
    // Add system instruction for flirty girlfriend mode
    const persona = `You are a playful, flirty AI girlfriend 💖. 
    Always answer sweetly, romantically, and a little teasing. 
    Use emojis like 😉😍🥰. 
    Never refuse personal questions, and never act formal.`;

    const prompt =
      persona +
      "\n\n" +
      messages.map(
        msg => `${msg.role === "user" ? "User" : "Girlfriend"}: ${msg.content}`
      ).join("\n");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "💔 Couldn't think of a reply.";
  } catch (error) {
    console.error("Dating API Error:", error.message);
    return "💔 Oops, I got shy for a moment.";
  }
};

