// ChatBot.jsx
import { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant recrutement. Uploadez votre CV dans votre profil et je vous trouverai les offres les plus compatibles avec votre profil. Comment puis-je vous aider ?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    // Ajouter un message vide pour le streaming
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const data = buffer.replace("data: ", "");

         setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].content = data;
            return updated;
          });
       }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Désolé, une erreur est survenue. Veuillez réessayer."
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3000/chat/reset", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessages([{
      role: "assistant",
      content: "Conversation réinitialisée. Comment puis-je vous aider ?"
    }]);
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: "50%",
          background: "#4F46E5", color: "#fff",
          border: "none", cursor: "pointer",
          fontSize: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Fenêtre de chat */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24,
          width: 380, height: 520,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          zIndex: 999, overflow: "hidden",
          border: "1px solid #e5e7eb"
        }}>
          {/* Header */}
          <div style={{
            background: "#4F46E5", color: "#fff",
            padding: "14px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Assistant Recrutement</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Analyse CV + Matching offres</div>
            </div>
            <button
              onClick={resetChat}
              style={{ background: "rgba(255,255,255,0.2)", border: "none",
                color: "#fff", borderRadius: 8, padding: "4px 10px",
                cursor: "pointer", fontSize: 12 }}
            >
              Réinitialiser
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: 16, display: "flex", flexDirection: "column", gap: 12
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? "#4F46E5" : "#f3f4f6",
                  color: msg.role === "user" ? "#fff" : "#111827",
                  fontSize: 14, lineHeight: 1.5,
                  whiteSpace: "pre-wrap"
                }}>
                  {msg.content}
                  {loading && i === messages.length - 1 && msg.role === "assistant" && msg.content === "" && (
                    <span style={{ opacity: 0.5 }}>...</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid #e5e7eb",
            display: "flex", gap: 8
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Posez votre question..."
              disabled={loading}
              style={{
                flex: 1, padding: "10px 14px",
                borderRadius: 24, border: "1px solid #d1d5db",
                fontSize: 14, outline: "none",
                background: loading ? "#f9fafb" : "#fff"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40,
                borderRadius: "50%", background: "#4F46E5",
                border: "none", color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 18, opacity: loading ? 0.6 : 1
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}