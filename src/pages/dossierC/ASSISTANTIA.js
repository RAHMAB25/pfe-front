
import { useState } from "react";

export default function ASSISTANTIA() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    // Ajouter message du candidat
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);

    // Appel backend pour obtenir réponse
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();

    // Ajouter réponse du bot
    setMessages((prev) => [...prev, { text: input, sender: "user" }, { text: data.reply, sender: "bot" }]);
    setInput("");
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", width: "400px" }}>
      <h3>Assistante AI</h3>
      <div style={{ height: "300px", overflowY: "scroll", border: "1px solid #eee", marginBottom: "10px", padding: "5px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left", margin: "5px 0" }}>
            <span style={{ background: m.sender === "user" ? "#daf1ff" : "#f1f1f1", padding: "5px 10px", borderRadius: "10px", display: "inline-block" }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Écris un message..."
        style={{ width: "80%", padding: "5px" }}
      />
      <button onClick={sendMessage} style={{ width: "18%", padding: "5px" }}>Envoyer</button>
    </div>
  );
}
