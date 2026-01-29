import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatWindow.css";

function ChatWindowDating() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Persistent userId
  const getUserId = () => {
    let userId = localStorage.getItem("datingUserId");
    if (!userId) {
      userId = "user_" + Date.now();
      localStorage.setItem("datingUserId", userId);
    }
    return userId;
  };

  const userId = getUserId();

  // 📥 Fetch history when component mounts
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/ai/history/${userId}/dating`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error loading dating history:", err.message);
        setMessages([{ sender: "bot", text: "⚠️ Failed to load chat history." }]);
      }
    }
    fetchHistory();
  }, [userId]);

  // 📌 Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/dating", {
        userId,
        message: input,
      });

      const botMessage = {
        sender: "bot",
        text: res.data.response || "💔 No response this time.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Dating bot error:", err.message);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 New chat
  const startNewChat = async () => {
    try {
      await axios.post("http://localhost:5000/api/ai/new-chat", {
        userId,
        botType: "dating",
      });
      setMessages([
        { sender: "bot", text: "💕 New chat started! Let’s flirt 😉" },
      ]);
    } catch (err) {
      console.error("Error starting new dating chat:", err.message);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Could not start new chat." },
      ]);
    }
  };

  return (
    <div className="chat-window-container dating">
      <div className="chat-header">
        <h2>💖 Dating Bot</h2>
      </div>

      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.sender === "bot" ? (
              <div className="avatar">💖</div>
            ) : (
              <div className="avatar">🧑</div>
            )}
            {/* 🧹 Clean text: remove ** and extra spaces */}
            <div className="bubble">{msg.text.replace(/\*\*/g, "").trim()}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-message bot typing">
            <div className="avatar">💖</div>
            <div className="bubble typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input + Buttons */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Send a flirty message... 💌"
        />
        <button onClick={sendMessage} className="send-btn">
          Send
        </button>
        <button onClick={startNewChat} className="new-chat-btn">
          New Chat
        </button>
      </div>
    </div>
  );
}

export default ChatWindowDating;