import { useState } from "react";
import "./Condidat.css";
import CONSidebarducondidat from "./CONSidebarducondidat.js"; 
import TabCondidat from "./TabCondidat.js";
import LesOffresC from "./LesOffresC.js";
import MONProfil from "./MONProfil.js";
import MesCandidatures from "./MesCandidatures.js";
import ASSISTANTIA from "./ASSISTANTIA";
export default function Condidat() {
  const [activeTab, setActiveTab] = useState("TabCondidat");

 const handleLogout = () => {
    
    localStorage.removeItem("token");

    window.location.href = "/"; 
  };

  return (
    <div className="candidat-page">
      {/* Sidebar gauche */}
      <CONSidebarducondidat 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      {/* Contenu droite */}
      <div className="candidat-content">
        {activeTab === "TabCondidat" && <TabCondidat />}
{activeTab === "LesOffresC" && <LesOffresC/>}
{activeTab === "MONProfil" && <MONProfil />}
{activeTab === "MesCandidatures" && <MesCandidatures />}
{activeTab === "ASSISTANTIA" && <ASSISTANTIA />}
      </div>
    </div>
  );
}