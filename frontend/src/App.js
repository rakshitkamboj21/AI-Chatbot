// src/App.js
import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ChatWindowDating from "./components/ChatWindowDating";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className={`App ${activeTab === "dating" ? "dating-theme" : ""}`}>
      <h1 className="app-title">AI Chatbots</h1>

      {/* Tab Navigation */}
      <div className="tab-bar">
        <div
          className={`tab ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          🤖 General
        </div>
        <div
          className={`tab ${activeTab === "dating" ? "active" : ""}`}
          onClick={() => setActiveTab("dating")}
        >
          💖 Dating
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-container">
        {activeTab === "general" ? <ChatWindow /> : <ChatWindowDating />}
      </div>
    </div>
  );
}

export default App;
