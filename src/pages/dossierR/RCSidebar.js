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
        onClick={() => setActiveTab("Les offres")}  // CORRECTION: "L" majuscule
        className={activeTab === "Les offres" ? "active" : ""}  // CORRECTION
      >
        LES OFFRES
      </button>
      <button
        onClick={() => setActiveTab("Candidats")}  // CORRECTION: nom plus naturel
        className={activeTab === "Candidats" ? "active" : ""}  // CORRECTION
      >
        LES CANDIDATURES
      </button>
      

      <button className="btn-logout" onClick={handleLogout}>
        Se déconnecter
      </button>
    </div>
  );
}