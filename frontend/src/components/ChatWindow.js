import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./ChatWindow.css";

function ChatWindow() {
  const userId = "user123"; // 🔑 Replace with real login later
  const botType = "general";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 🎤 Speech Recognition
  const recognitionRef = useRef(null);
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition not supported in this browser.");
    }
  }, []);

  // 📥 Load chat history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/ai/history/${userId}/${botType}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    }
    fetchHistory();
  }, []);

  // 📌 Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Check if it's a search command
    if (input.startsWith("/search ")) {
      const query = input.replace("search ", "").trim();
      try {
        const res = await axios.get(
          `http://localhost:5000/api/search?query=${encodeURIComponent(query)}`
        );
        const results = res.data.results || [];

        const searchMessage = {
          sender: "bot",
          text:
            results.length > 0
              ? results
                  .map(
                    (item, idx) =>
                      `${idx + 1}. [${item.title}](${item.link})\n${item.snippet}`
                  )
                  .join("\n\n")
              : "No results found 😔",
        };
        setMessages((prev) => [...prev, searchMessage]);
      } catch (err) {
        console.error("Search API error:", err);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "⚠️ Search failed. Try again." },
        ]);
      }
      setInput("");
      setLoading(false);
      return;
    }

    // Otherwise, send to AI bot
    try {
      const res = await axios.post(`http://localhost:5000/api/ai/chat`, {
        userId,
        message: input,
      });

      // ✅ Clean bot response completely (removes any extra "Bot:" from all lines)
      const rawResponse = res.data.response || "";
      const botReply = rawResponse
        .split("\n")
        .map((line) => line.replace(/^(Bot:\s*)+/i, "").trim())
        .join("\n");

      const botMessage = { sender: "bot", text: botReply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);

      // ❌ Show popup error
      alert("❌ Invalid input or server error. Please try again.");

      // Also show error in chat
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong. Try rephrasing your message." },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  // 🔄 Start new chat
  const startNewChat = async () => {
    try {
      await axios.post("http://localhost:5000/api/ai/new-chat", {
        userId,
        botType,
      });
      setMessages([{ sender: "bot", text: "Chat cleared! Let's start fresh." }]);
    } catch (err) {
      console.error("Error starting new chat:", err);
    }
  };

  // 🎤 Start voice
  const startListening = () => {
    if (recognitionRef.current) recognitionRef.current.start();
    else alert("Speech recognition not supported in your browser.");
  };

  return (
    <div className="chat-window-container general">
      <div className="chat-header">
        <h2>🤖 General Bot</h2>
      </div>

      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            <div className="avatar">{msg.sender === "bot" ? "🤖" : "🧑"}</div>
            <div className="bubble">
              {msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message bot typing">
            <div className="avatar">🤖</div>
            <div className="bubble typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder='Type a message... (Use "/search your query" for web search)'
        />
        <button onClick={sendMessage} className="send-btn general">
          Send
        </button>
        <button onClick={startNewChat} className="new-chat-btn general">
          New Chat
        </button>
        <button onClick={startListening} className="mic-btn general">
          🎤
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
