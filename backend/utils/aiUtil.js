import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export const getAIResponse = async (messages) => {
  try {
    // Combine messages into a single prompt for context
    const prompt = messages.map(msg => `${msg.role === "user" ? "User" : "Bot"}: ${msg.content}`).join("\n");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    
    // Return AI response text
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return "Sorry, I couldn't generate a response.";
  }
};
