import { useState } from "react";
import "./Condidat.css";
import CONSidebarducondidat from "./CONSidebarducondidat"; 
import TabCondidat from "./TabCondidat";
import LesOffrespourCondidat from "./LesOffrespourCondidat";
import MONProfil from "./MONProfil.js";
import MesCandidatures from "./MesCandidatures";
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
{activeTab === "LesOffrespourCondidat" && <LesOffrespourCondidat />}
{activeTab === "MONProfil" && <MONProfil />}
{activeTab === "MesCandidatures" && <MesCandidatures />}
{activeTab === "ASSISTANTIA" && <ASSISTANTIA />}
      </div>
    </div>
  );
}