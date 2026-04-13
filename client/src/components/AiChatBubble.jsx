import { useState, useRef, useEffect } from "react";

export default function AiChatBubble({ moduleId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // 🔥 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);
  useEffect(() => {
  if (chat.length === 0) {
    setSuggestions([
      "What should I do before this disaster?",
      "How to stay safe?",
      "Emergency steps?"
    ]);
  }
}, []);
  const generateSuggestions = (chatHistory) => {
  const lastUserMsg = chatHistory[chatHistory.length - 1]?.user?.toLowerCase() || "";

  if (!lastUserMsg) {
    return [
      "What should I do before this disaster?",
      "How to stay safe?",
      "What are emergency steps?",
    ];
  }

  if (lastUserMsg.includes("before")) {
    return [
      "What to do during?",
      "What mistakes to avoid?",
      "How to prepare better?",
    ];
  }

  if (lastUserMsg.includes("during")) {
    return [
      "What to do after?",
      "How to rescue others?",
      "What are danger signs?",
    ];
  }

  if (lastUserMsg.includes("after")) {
    return [
      "How to recover safely?",
      "When to return home?",
      "Who to contact?",
    ];
  }

  return [
    "What should I do during this?",
    "How to stay safe?",
    "Emergency tips?",
  ];
};

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const userText = userMessage;
    setUserMessage("");



    // Optimistic UI
    setChat(prev => [...prev, { user: userText, ai: null }]);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          message: userText,
          moduleId
        })
      });

      const data = await res.json();

      // Update last message with AI reply
      setChat(prev => {
        const updated = [...prev];
        updated[updated.length - 1].ai = data.reply;

         // 🔥 Generate suggestions here
  setSuggestions(generateSuggestions(updated));
        return updated;
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
const formatAIResponse = (text) => {
  try {
    // Remove unwanted characters like { } and quotes
    const cleaned = text
      .replace(/[{}"]/g, "") // remove { } "
      .split(",");

    return cleaned.map((line, i) => {
      // Remove BulletPoint1:, BulletPoint2:
      const cleanedLine = line.replace(/BulletPoint\d+:/, "").trim();

      if (!cleanedLine) return null;

      return (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
          <span>✅</span>
          <span>{cleanedLine}</span>
        </div>
      );
    });
  } catch {
    return text;
  }
};

  return (
    <>
      {/* Floating Button */}
      <div style={styles.bubble} onClick={() => setIsOpen(!isOpen)}>
        💬
      </div>

      {isOpen && (
        <div style={styles.chatBox}>
          {/* Header */}
         <div style={styles.header}>
  🤖 Disaster AI Assistant
  <span
    style={{ float: "right", cursor: "pointer" }}
    onClick={() => {
      setChat([]);
      setSuggestions([]);
    }}
  >
    🗑
  </span>
</div>

          {/* Messages */}
          <div style={styles.messages}>
            {chat.map((msg, index) => (
              <div key={index}>
                {/* USER */}
                <div style={styles.userBubble}>
                  {msg.user}
                </div>

                {/* AI */}
                {msg.ai && (
                  <div style={styles.aiBubble}>
  <strong style={{ display: "block", marginBottom: "6px" }}>
    💡 Safety Tips
  </strong>

  {formatAIResponse(msg.ai)}
</div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div style={styles.aiBubble}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          {suggestions.length > 0 && (
  <div style={styles.suggestionBox}>
    <p style={{ fontSize: "12px", color: "#666" }}>💡 Try asking:</p>

    <div style={styles.suggestionList}>
      {suggestions.map((s, i) => (
        <button
          key={i}
          style={styles.suggestionBtn}
          onClick={() => {
            setUserMessage(s);
          }}
        >
          {s}
        </button>
      ))}
    </div>
  </div>
)}

          {/* Input */}
          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Ask about this disaster..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button style={styles.sendBtn}
  onClick={sendMessage}
  disabled={loading}>
               {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Typing animation */}
      <style>
        {`
          .typing-dot {
            height: 6px;
            width: 6px;
            margin: 0 2px;
            background-color: #555;
            border-radius: 50%;
            display: inline-block;
            animation: bounce 1.3s infinite;
          }

          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }

          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </>
  );
}

const styles = {
  bubble: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "white",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
    zIndex: 1000
  },

  chatBox: {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "360px",
    height: "480px",
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.85)",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },

  header: {
    padding: "12px",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "white",
    fontWeight: "bold"
  },

  messages: {
    flex: 1,
    padding: "12px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  userBubble: {
    alignSelf: "flex-end",
    background: "#6366f1",
    color: "white",
    padding: "8px 12px",
    borderRadius: "12px",
    maxWidth: "75%"
  },

  aiBubble: {
  alignSelf: "flex-start",
  background: "linear-gradient(135deg,#f8fafc,#e2e8f0)",
  color: "#111",
  padding: "12px",
  borderRadius: "14px",
  maxWidth: "80%",
  fontSize: "14px",
  lineHeight: "1.5",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
},

  inputArea: {
    display: "flex",
    borderTop: "1px solid #ddd"
  },

  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    outline: "none",
    background: "transparent"
  },

  sendBtn: {
    padding: "10px 14px",
    background: "#6366f1",
    color: "white",
    border: "none",
    cursor: "pointer"
  },
  suggestionBox: {
  padding: "8px",
  borderTop: "1px solid #eee",
  background: "#fafafa"
},

suggestionList: {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px"
},

suggestionBtn: {
  fontSize: "12px",
  padding: "6px 10px",
  borderRadius: "20px",
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer"
}
};