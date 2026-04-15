// frontend/src/components/ASSISTANTIA.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ASSISTANTIA.css';

const ASSISTANTIA = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1,
      role: 'assistant', 
      content: 'Bonjour ! Je suis votre assistant IA spécialisé en recrutement et carrière. Comment puis-je vous aider aujourd\'hui ? 😊',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Comment rédiger un bon CV ?",
    "Préparer un entretien d'embauche",
    "Négocier son salaire",
    "Les erreurs à éviter en entretien"
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    // Ajouter le message de l'utilisateur
    const userMessage = { 
      id: Date.now(),
      role: 'user', 
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:3000/chat', {
  message: textToSend
});
      setIsTyping(false);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant', 
        content: response.data.reply || response.data.reply,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Suggestions dynamiques basées sur la conversation
      updateSuggestions(textToSend, response.data.reply);
      
    } catch (error) {
      console.error('Erreur:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1,
        role: 'assistant', 
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer ou contacter le support.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestions = (userMessage, assistantReply) => {
    // Suggestions contextuelles
    if (userMessage.toLowerCase().includes('cv')) {
      setSuggestions([
        "Modèle de CV moderne",
        "CV pour débutant",
        "Compétences à mettre en avant",
        "Photo sur le CV ?"
      ]);
    } else if (userMessage.toLowerCase().includes('entretien')) {
      setSuggestions([
        "Questions pièges en entretien",
        "Tenue pour un entretien",
        "Pitch de présentation",
        "Questions à poser au recruteur"
      ]);
    } else if (userMessage.toLowerCase().includes('salaire')) {
      setSuggestions([
        "Comment négocier ?",
        "Salaire moyen par métier",
        "Demander une augmentation",
        "Avantages négociables"
      ]);
    } else {
      setSuggestions([
        "Comment rédiger un bon CV ?",
        "Préparer un entretien d'embauche",
        "Négocier son salaire",
        "Les erreurs à éviter en entretien"
      ]);
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        id: Date.now(),
        role: 'assistant', 
        content: 'Bonjour ! Je suis votre assistant IA spécialisé en recrutement et carrière. Comment puis-je vous aider aujourd\'hui ? 😊',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // Optionnel: ajouter une notification
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = '📋 Message copié !';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot">
        {/* Header amélioré */}
        <div className="chatbot-header">
          <div className="header-left">
            <div className="bot-avatar">
              <span>🤖</span>
              <div className="online-dot"></div>
            </div>
            <div className="header-info">
              <h2>Assistant IA Recrutement</h2>
              <p>En ligne • Réponse immédiate</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="clear-btn" onClick={clearChat} title="Nouvelle conversation">
              🗑️
            </button>
            <button className="close-btn" onClick={() => window.close()} title="Fermer">
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
              <div className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div className="message-bubble">
                  <div className="message-content">
                    {msg.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="message-footer">
                    <span className="message-time">{msg.timestamp}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyMessage(msg.content)}
                      title="Copier"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message-wrapper assistant">
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && messages.length < 3 && (
          <div className="suggestions">
            <p className="suggestions-title">💡 Suggestions :</p>
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input amélioré */}
        <div className="chatbot-input">
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
              rows={1}
              disabled={loading}
              className="message-input"
            />
            <div className="input-actions">
              <button 
                className="send-btn" 
                onClick={() => sendMessage()} 
                disabled={loading || !input.trim()}
              >
                {loading ? '⏳' : '📤'}
              </button>
            </div>
          </div>
          <p className="input-hint">
            Appuyez sur Entrée pour envoyer • Maj+Entrée pour sauter une ligne
          </p>
        </div>
      </div>
    </div>
  );
};

export default ASSISTANTIA;