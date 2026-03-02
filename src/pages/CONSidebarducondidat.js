import React from "react";


export default function CONSidebarducondidat({ activeTab, setActiveTab, handleLogout }) {
  return (
    <div className="candidat-sidebar">
      <h2>Espace Candidat</h2>
      <div className="sidebar-menu">

      <button
        onClick={() => setActiveTab("TabCondidat")}
        className={activeTab === "TabCondidat" ? "active" : ""}
      >
       TABLEAU DE BORD 
      </button>
      <button
        onClick={() => setActiveTab("LesOffrespourCondidat")}
        className={activeTab === "LesOffrespourCondidat" ? "active" : ""}
      >
        LES OFFRES
      </button>
      <button
        onClick={() => setActiveTab("MONProfil")}
        className={activeTab === "MONProfil" ? "active" : ""}
      >
      Mon Profil
      </button>

<button
        onClick={() => setActiveTab("MesCandidatures")}
        className={activeTab === "MesCandidatures" ? "active" : ""}
      >
      Mes Candidatures
      </button>

      <button
        onClick={() => setActiveTab("ASSISTANTIA")}
        className={activeTab === "ASSISTANTIA" ? "active" : ""}
      >
        Assistant IA 
      </button>

      <button className="btn-logout" onClick={handleLogout}>
        Déconnecter
      </button>
    </div>
    </div>
    
  );
}
