import React from "react";


export default function RCSidebar({ activeTab, setActiveTab, handleLogout }) {
  return (
    <div className="recruteur-sidebar">
      <h2>Espace Recruteur</h2>
      <button
        onClick={() => setActiveTab("Tableau de bord")}
        className={activeTab === "Tableau de bord" ? "active" : ""}
      >
       TABLEAU DE BORD 
      </button>
      <button
        onClick={() => setActiveTab("les offres")}
        className={activeTab === "les offres" ? "active" : ""}
      >
        LES OFFRES
      </button>
      <button
        onClick={() => setActiveTab("Candidatenrecruteur")}
        className={activeTab === "Candidatenrecruteur" ? "active" : ""}
      >
      LES CANDIDAT 
      </button>
      <button
        onClick={() => setActiveTab("Analyse IA")}
        className={activeTab === "Analyse IA" ? "active" : ""}
      >
        ANALYSE IA 
      </button>

      <button className="btn-logout" onClick={handleLogout}>
        Déconnecter
      </button>
    </div>
    
  );
}
