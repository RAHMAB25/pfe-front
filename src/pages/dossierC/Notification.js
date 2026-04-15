// Notifications.jsx - Version avec design amélioré et intégration parfaite
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
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const toastTimeoutRef = useRef(null);

  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  const showToast = (notification) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast(notification);

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
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
          socketService.connect(token, decoded.id);
          
          const listenerId = socketService.onNotification((newNotification) => {
            console.log("Nouvelle notification temps réel:", newNotification);
            
            setNotifications(prev => {
              const exists = prev.some(n => n.id === newNotification.id);
              if (exists) return prev;
              return [newNotification, ...prev];
            });
            
            showToast(newNotification);
            playNotificationSound();
            
            if (Notification.permission === "granted") {
              new Notification("📢 Nouvelle notification", {
                body: newNotification.message,
                icon: "/logo.png",
                badge: "/logo.png",
                silent: false,
                vibrate: [200, 100, 200]
              });
            }
            
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

  const animateFavicon = () => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      const originalHref = favicon.href;
      favicon.href = "/favicon-bell.ico";
      setTimeout(() => {
        favicon.href = originalHref;
      }, 2000);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
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
      year: 'numeric'
    });
  };

  const getIconForStatut = (statut) => {
    if (!statut) return '📌';
    
    switch(statut) {
      case 'ACCEPTÉE': return '✓';
      case 'REFUSÉE': return '✗';
      case 'EN COURS': return '⟳';
      case 'EN ATTENTE': return '⏱';
      default: return '📌';
    }
  };

  const getColorForStatut = (statut) => {
    if (!statut) return '#6c5ce7';
    
    switch(statut) {
      case 'ACCEPTÉE': return '#00b894';
      case 'REFUSÉE': return '#ff7675';
      case 'EN COURS': return '#74b9ff';
      case 'EN ATTENTE': return '#fdcb6e';
      default: return '#6c5ce7';
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
              {toast.nouveau_statut === 'ACCEPTÉE' ? 'Félicitations !' :
               toast.nouveau_statut === 'REFUSÉE' ? 'Mise à jour' :
               'Nouvelle notification'}
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
        {/* En-tête */}
        <div className="notifications-header">
          <div className="notifications-header-content">
            <div className="header-title">
              <h1>
                <span className="header-icon">🔔</span>
                Notifications
              </h1>
              {nonLuesCount > 0 && (
                <span className="non-lues-badge pulse">
                  {nonLuesCount} nouvelle{nonLuesCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="header-actions">
              <div className="filter-wrapper">
                <select 
                  className="filter-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="toutes">Toutes les notifications</option>
                  <option value="non-lues">Non lues ({nonLuesCount})</option>
                  <option value="lues">Lues</option>
                  <option value="acceptees">Acceptées</option>
                  <option value="refusees">Refusées</option>
                </select>
              </div>
              
              {nonLuesCount > 0 && (
                <button className="btn-mark-all" onClick={marquerToutCommeLu}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Tout marquer comme lu
                </button>
              )}
            </div>
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

        {/* Liste des notifications avec scroll */}
        <div className="notifications-list-container">
          {notificationsFiltrees.length === 0 ? (
            <div className="notifications-empty fade-in">
              <div className="empty-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3>Aucune notification</h3>
              <p>
                {filter === 'non-lues' 
                  ? "Vous êtes à jour ! Aucune notification non lue." 
                  : filter === 'acceptees'
                  ? "Aucune candidature acceptée pour le moment"
                  : filter === 'refusees'
                  ? "Aucune candidature refusée, continuez comme ça !"
                  : "Vous n'avez pas encore de notifications"}
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
                    style={{ animationDelay: `${index * 0.03}s` }}
                    onClick={() => isNew && marquerCommeLue(notif.id)}
                  >
                    <div 
                      className="notification-icon"
                      style={{ backgroundColor: color + '15' }}
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {notif.recruteur_prenom || ""} {notif.recruteur_nom || "Recruteur"}
                        </div>
                        
                        {notif.nouveau_statut && (
                          <div 
                            className="statut-badge"
                            style={{ 
                              backgroundColor: color + '10',
                              color: color,
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
        </div>
        
        {/* Bouton pour rafraîchir */}
        <button 
          className="refresh-btn"
          onClick={fetchNotifications}
          title="Rafraîchir les notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default Notifications;