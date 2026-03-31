import React, { useState, useEffect } from "react";
import "./AnalyseIA.css";

const AnalyseIA = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffre, setSelectedOffre] = useState("all");

  // 🔹 Fetch candidatures au chargement
  useEffect(() => {
    const fetchCandidatures = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/recruteur/candidatures-analyse", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Candidatures reçues:", data);
        setCandidatures(data);
      } catch (err) {
        console.error("Erreur chargement candidatures:", err);
        setError("Impossible de charger les candidatures.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidatures();
  }, []);

  // 🔹 Fonction d'analyse (à compléter plus tard)
  const handleAnalyze = (candidature) => {
    // TODO: Appeler l'API d'analyse
    console.log("Analyser:", candidature.nom);
    alert(`Analyse de ${candidature.nom} - À implémenter plus tard`);
  };

  // Filtrer par offre
  const offresUniques = [...new Set(candidatures.map(c => c.offre_titre))];
  const filteredCandidatures = selectedOffre === "all" 
    ? candidatures 
    : candidatures.filter(c => c.offre_titre === selectedOffre);

  const getStatusStyle = (statut) => {
    switch(statut) {
      case 'ACCEPTE': return { class: "status-accepted", text: "ACCEPTÉE" };
      case 'REFUSE': return { class: "status-rejected", text: "REFUSÉE" };
      case 'EN_COURS': return { class: "status-progress", text: "EN COURS" };
      default: return { class: "status-pending", text: "EN ATTENTE" };
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des candidatures...</p>
      </div>
    );
  }

  return (
    <div className="analyse-container">
      <div className="header">
        <h1>🤖 Analyse des CV</h1>
        <p className="subtitle">Évaluation automatique des compétences et scores</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {/* Filtre par offre */}
      {candidatures.length > 0 && (
        <div className="filter-section">
          <label className="filter-label">
            📋 Filtrer par offre :
            <select 
              value={selectedOffre} 
              onChange={(e) => setSelectedOffre(e.target.value)}
              className="filter-select"
            >
              <option value="all">📌 Toutes les offres</option>
              {offresUniques.map(offre => (
                <option key={offre} value={offre}>{offre}</option>
              ))}
            </select>
          </label>
          <div className="stats-badge">
            <span className="stats-count">{filteredCandidatures.length}</span>
            <span className="stats-label">candidat(s)</span>
          </div>
        </div>
      )}
      
      {candidatures.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>Aucun candidat n'a postulé à vos offres pour le moment.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Offre</th>
                  <th>Candidat</th>
                  <th>Email</th>
                  <th>Date postulation</th>
                  <th>Statut</th>
                  <th>Compétences</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidatures.map((candidature) => {
                  const statusInfo = getStatusStyle(candidature.statut);
                  const datePostulation = candidature.date_postulation 
                    ? new Date(candidature.date_postulation).toLocaleDateString('fr-FR')
                    : "—";

                  return (
                    <tr key={candidature.id}>
                      <td className="offre-cell">
                        <strong>{candidature.offre_titre}</strong>
                      </td>
                      <td className="candidate-name">
                        <div className="avatar">
                          {candidature.nom.charAt(0).toUpperCase()}
                        </div>
                        {candidature.nom}
                      </td>
                      <td className="email-cell">{candidature.email}</td>
                      <td className="date-cell">{datePostulation}</td>
                      <td>
                        <span className={`status-badge ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="skills-cell">
                        <span className="no-skills">—</span>
                      </td>
                      <td className="score-cell">
                        <span className="no-score">—</span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleAnalyze(candidature)}
                          className="analyze-btn"
                        >
                          📊 Analyser
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Statistiques */}
          <div className="stats-section">
            <h3>📈 Statistiques</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{candidatures.length}</div>
                <div className="stat-label">Total candidats</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{offresUniques.length}</div>
                <div className="stat-label">Offres disponibles</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Candidats analysés</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">—%</div>
                <div className="stat-label">Score moyen</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyseIA;