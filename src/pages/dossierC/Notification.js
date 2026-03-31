import { useState, useEffect, useRef } from "react";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import socketService from "./socketService";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("toutes");
  const [toast, setToast] = useState(null); // État pour le popup toast
  const navigate = useNavigate();
  const toastTimeoutRef = useRef(null);

  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  // Fonction pour afficher un toast de notification
  const showToast = (notification) => {
    // Annuler le timeout précédent
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    // Afficher le toast
    setToast(notification);

    // Masquer automatiquement après 5 secondes
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Jouer un son de notification (optionnel)
  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3"); // Placez un fichier MP3 dans public/
    audio.play().catch(e => console.log("Son non joué:", e));
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        
        if (decoded.role !== "CANDIDAT") {
          navigate("/dashboard");
        } else {
          // Connexion Socket.IO pour les candidats
          socketService.connect(token, decoded.id);
          
          // Écouter les nouvelles notifications en temps réel
          const listenerId = socketService.onNotification((newNotification) => {
            console.log("Nouvelle notification temps réel:", newNotification);
            
            // Ajouter la nouvelle notification en haut de la liste
            setNotifications(prev => {
              const exists = prev.some(n => n.id === newNotification.id);
              if (exists) return prev;
              return [newNotification, ...prev];
            });
            
            // Afficher le popup toast
            showToast(newNotification);
            
            // Jouer un son
            playNotificationSound();
            
            // Notification desktop
            if (Notification.permission === "granted") {
              new Notification("📢 Nouvelle notification", {
                body: newNotification.message,
                icon: "/logo.png",
                badge: "/logo.png",
                silent: false,
                vibrate: [200, 100, 200]
              });
            }
            
            // Animation de la favicon (optionnel)
            animateFavicon();
          });
          
          return () => {
            socketService.offNotification(listenerId);
            socketService.disconnect();
            if (toastTimeoutRef.current) {
              clearTimeout(toastTimeoutRef.current);
            }
          };
        }
      } catch (err) {
        console.error("Token invalide :", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  // Animation de la favicon
  const animateFavicon = () => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      const originalHref = favicon.href;
      favicon.href = "/favicon-bell.ico"; // Avoir une favicon alternative
      setTimeout(() => {
        favicon.href = originalHref;
      }, 2000);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:3000/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors du chargement");
      }

      const data = await res.json();
      setNotifications(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement des notifications");
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeLue = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:3000/notifications/${notificationId}/lire`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications(notifications.map(notif =>
          notif.id === notificationId ? { ...notif, est_lu: true } : notif
        ));
      }
    } catch (err) {
      console.error("Erreur", err);
    }
  };

  const marquerToutCommeLu = async () => {
    try {
      const res = await fetch("http://localhost:3000/notifications/tout-lire", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, est_lu: true })));
      }
    } catch (err) {
      console.error("Erreur", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconForStatut = (statut) => {
    if (!statut) return '📌';
    
    switch(statut) {
      case 'ACCEPTÉE': return '🎉';
      case 'REFUSÉE': return '💼';
      case 'EN COURS': return '📋';
      case 'EN ATTENTE': return '⏳';
      default: return '📌';
    }
  };

  const getColorForStatut = (statut) => {
    if (!statut) return '#6b7280';
    
    switch(statut) {
      case 'ACCEPTÉE': return '#10b981';
      case 'REFUSÉE': return '#ef4444';
      case 'EN COURS': return '#3b82f6';
      case 'EN ATTENTE': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getLibelleStatut = (statut) => {
    if (!statut) return 'Statut inconnu';
    return statut;
  };

  const filtrerNotifications = () => {
    let filtered = [...notifications];
    
    switch(filter) {
      case 'non-lues':
        filtered = filtered.filter(n => !n.est_lu);
        break;
      case 'lues':
        filtered = filtered.filter(n => n.est_lu);
        break;
      case 'acceptees':
        filtered = filtered.filter(n => n.nouveau_statut === 'ACCEPTÉE');
        break;
      case 'refusees':
        filtered = filtered.filter(n => n.nouveau_statut === 'REFUSÉE');
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // Demander la permission pour les notifications desktop
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const notificationsFiltrees = filtrerNotifications();
  const nonLuesCount = notifications.filter(n => !n.est_lu).length;

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="spinner"></div>
        <p>Chargement de vos notifications...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toast Popup Notification */}
      {toast && (
        <div className={`notification-toast toast-${toast.type || 'info'} slide-in`}>
          <div className="toast-icon">
            {getIconForStatut(toast.nouveau_statut)}
          </div>
          <div className="toast-content">
            <div className="toast-title">
              {toast.nouveau_statut === 'ACCEPTÉE' ? '🎉 Félicitations !' :
               toast.nouveau_statut === 'REFUSÉE' ? '💼 Mise à jour' :
               '📢 Nouvelle notification'}
            </div>
            <div className="toast-message">{toast.message}</div>
            <div className="toast-offre">{toast.offre_titre}</div>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}>
            ✕
          </button>
          <div className="toast-progress"></div>
        </div>
      )}

      <div className="notifications-container">
        {/* En-tête avec compteur animé */}
        <div className="notifications-header">
          <div className="header-title">
            <h1>
              <span className="header-icon">🔔</span>
              Mes notifications
            </h1>
            {nonLuesCount > 0 && (
              <span className="non-lues-badge pulse">
                {nonLuesCount} nouvelle{nonLuesCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="header-actions">
            <select 
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="toutes">Toutes les notifications</option>
              <option value="non-lues">Non lues ({nonLuesCount})</option>
              <option value="lues">Lues</option>
              <option value="acceptees">✅ Acceptées</option>
              <option value="refusees">❌ Refusées</option>
            </select>
            
            {nonLuesCount > 0 && (
              <button className="btn-mark-all" onClick={marquerToutCommeLu}>
                ✓ Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="notifications-error">
            <span>⚠️</span>
            {error}
            <button onClick={fetchNotifications} className="retry-btn">
              Réessayer
            </button>
          </div>
        )}

        {/* Liste des notifications */}
        {notificationsFiltrees.length === 0 ? (
          <div className="notifications-empty fade-in">
            <div className="empty-icon">📪</div>
            <h3>Aucune notification</h3>
            <p>
              {filter === 'non-lues' 
                ? "✨ Vous êtes à jour ! Aucune notification non lue." 
                : filter === 'acceptees'
                ? "🎯 Aucune candidature acceptée pour le moment"
                : filter === 'refusees'
                ? "💪 Aucune candidature refusée, continuez comme ça !"
                : "🌟 Vous n'avez pas encore de notifications"}
            </p>
            <p className="empty-hint">
              Les notifications apparaîtront ici quand les recruteurs répondront à vos candidatures
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notificationsFiltrees.map((notif, index) => {
              const icon = getIconForStatut(notif.nouveau_statut);
              const color = getColorForStatut(notif.nouveau_statut);
              const isNew = !notif.est_lu;
              
              return (
                <div
                  key={notif.id}
                  className={`notification-item ${isNew ? 'non-lue' : ''} slide-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => isNew && marquerCommeLue(notif.id)}
                >
                  <div 
                    className="notification-icon"
                    style={{ backgroundColor: color + '20' }}
                  >
                    <span style={{ color: color }}>{icon}</span>
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <div className="notification-title">
                        <span className="offre-titre">{notif.offre_titre || "Offre d'emploi"}</span>
                        {isNew && (
                          <span className="badge-nouveau">
                            <span className="pulse-dot"></span>
                            Nouveau
                          </span>
                        )}
                      </div>
                      <span className="notification-time">{formatDate(notif.date_creation)}</span>
                    </div>
                    
                    <p className="notification-message">{notif.message || "Mise à jour de votre candidature"}</p>
                    
                    <div className="notification-footer">
                      <div className="recruteur-info">
                        <span className="recruteur-icon">👤</span>
                        {notif.recruteur_prenom || ""} {notif.recruteur_nom || "Recruteur"}
                      </div>
                      
                      {notif.nouveau_statut && (
                        <div 
                          className="statut-badge"
                          style={{ 
                            backgroundColor: color + '20',
                            color: color,
                            border: `1px solid ${color}40`
                          }}
                        >
                          {icon} {getLibelleStatut(notif.nouveau_statut)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Bouton pour rafraîchir manuellement */}
        <button 
          className="refresh-btn"
          onClick={fetchNotifications}
          title="Rafraîchir les notifications"
        >
          🔄
        </button>
      </div>
    </>
  );
};

export default Notifications;