import React, { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";

export default function CONSidebarducondidat({ activeTab, setActiveTab, handleLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token) return;
      
      try {
        const res = await fetch("http://localhost:3000/notifications/non-lues/count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Erreur compteur notifications:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="candidat-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-wrapper">
          <h2>Espace Candidat</h2>
          <NotificationBell />
        </div>
      </div>
      
      <div className="sidebar-menu">
        <button
          onClick={() => setActiveTab("TabCondidat")}
          className={activeTab === "TabCondidat" ? "active" : ""}
        >
          <span className="menu-icon"></span>
          TABLEAU DE BORD
        </button>
        
        <button
          onClick={() => setActiveTab("LesOffresC")}
          className={activeTab === "LesOffresC" ? "active" : ""}
        >
          <span className="menu-icon"></span>
          LES OFFRES
        </button>
        
        <button
          onClick={() => setActiveTab("MONProfil")}
          className={activeTab === "MONProfil" ? "active" : ""}
        >
          <span className="menu-icon"></span>
          Mon Profil
        </button>

        <button
          onClick={() => setActiveTab("MesCandidatures")}
          className={activeTab === "MesCandidatures" ? "active" : ""}
        >
          <span className="menu-icon"></span>
          Mes Candidatures
        </button>
        
        <button
          onClick={() => setActiveTab("Notification")}
          className={activeTab === "Notification" ? "active" : ""}
        >
          <span className="menu-icon"></span>
          Notification
          {unreadCount > 0 && (
            <span className="menu-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ASSISTANTIA")}
          className={activeTab === "ASSISTANTIA" ? "active" : ""}
        >
          <span className="menu-icon"></span>
          Assistant IA
        </button>

        <button className="btn-logout" onClick={handleLogout}>
          <span className="menu-icon"></span>
          Déconnecter
        </button>
      </div>
    </div>
  );
}