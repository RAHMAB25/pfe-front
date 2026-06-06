import { useState } from "react";
import "./Recruteur.css";
import RCSidebar from "./RCSidebar"; 
import TableauDeBord from "./TableauDeBord";
import LesOffres from "./LesOffres";
import Candidatenrecruteur from "./Candidatenrecruteur";


export default function Recruteur() {
  const [activeTab, setActiveTab] = useState("Tableau de bord");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; 
  };

  return (
    <div className="recruteur-page">
      {/* Sidebar gauche */}
      <RCSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      {/* Contenu droite */}
      <div className="recruteur-content">
  {activeTab === "Tableau de bord" && <TableauDeBord />}
  {activeTab === "Les offres" && <LesOffres />} 
  {activeTab === "Candidats" && <Candidatenrecruteur />} 

</div>
    </div>
  );
}