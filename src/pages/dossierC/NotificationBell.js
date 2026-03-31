import { useState, useEffect } from "react";
import socketService from "./socketService";

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const token = localStorage.getItem("token");

  // Récupérer le compteur de notifications non lues
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("http://localhost:3000/notifications/non-lues/count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const newCount = data.count;
      
      // Animation si nouveau message
      if (newCount > unreadCount) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }
      
      setUnreadCount(newCount);
    } catch (err) {
      console.error("Erreur compteur:", err);
    }
  };

  // Écouter les notifications en temps réel
  useEffect(() => {
    if (!token) return;

    fetchUnreadCount();
    
    // Connexion Socket.IO
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      socketService.connect(token, decoded.id);
      
      const listenerId = socketService.onNotification((newNotification) => {
        // Incrémenter le compteur
        setUnreadCount(prev => prev + 1);
        
        // Animation de la cloche
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
        
        // Jouer un son (optionnel)
        const audio = new Audio("/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Son non joué"));
      });
      
      // Rafraîchir le compteur toutes les 30 secondes
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => {
        socketService.offNotification(listenerId);
        clearInterval(interval);
      };
    } catch (err) {
      console.error("Erreur Socket.IO:", err);
    }
  }, [token]);

  return (
    <div className={`notification-indicator ${isAnimating ? 'bell-animate' : ''}`}>
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span className="bell-count">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;