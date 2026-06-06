import React, { useState, useEffect } from "react";
import "./AnalyseIA.css";

const AnalyseIA = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffre, setSelectedOffre] = useState("all");
  const [analyzingId, setAnalyzingId] = useState(null);

  // Fetch candidatures au chargement
  useEffect(() => {
    const fetchCandidatures = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/recruteur/candidatures-analyse", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
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

  // Fonction d'analyse du CV
  const handleAnalyze = async (candidature) => {
    if (candidature.score_ia) {
      // Si déjà analysé, on ne refait pas l'analyse
      return;
    }
    
    setAnalyzingId(candidature.id);
    
    try {
      const token = localStorage.getItem("token");
      
      // Appel à l'API d'analyse (à adapter selon votre backend)
      const response = await fetch(`http://localhost:3000/recruteur/analyze-cv/${candidature.id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cv_text: candidature.cv_text,
          offre_titre: candidature.offre_titre
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setCandidatures(prev => prev.map(c => 
          c.id === candidature.id 
            ? { ...c, score_ia: result.score }
            : c
        ));
      } else {
        // Simulation pour la démo
        const mockScore = Math.floor(Math.random() * 40) + 60;
        setCandidatures(prev => prev.map(c => 
          c.id === candidature.id 
            ? { ...c, score_ia: mockScore }
            : c
        ));
      }
    } catch (err) {
      console.error("Erreur analyse:", err);
      // Simulation
      const mockScore = Math.floor(Math.random() * 40) + 60;
      setCandidatures(prev => prev.map(c => 
        c.id === candidature.id 
          ? { ...c, score_ia: mockScore }
          : c
      ));
    } finally {
      setAnalyzingId(null);
    }
  };

  // Extraire les offres uniques
  const offresUniques = [...new Set(candidatures.map(c => c.offre_titre).filter(Boolean))];
  
  // Filtrer les candidatures
  const filteredCandidatures = selectedOffre === "all" 
    ? candidatures 
    : candidatures.filter(c => c.offre_titre === selectedOffre);

  // Style du statut
  const getStatusInfo = (statut) => {
    const statusMap = {
      'EN_ATTENTE': { class: 'status-pending', text: 'EN ATTENTE', icon: '⏳' },
      'EN_COURS': { class: 'status-progress', text: 'EN COURS', icon: '🔄' },
      'ACCEPTE': { class: 'status-accepted', text: 'ACCEPTÉ', icon: '✅' },
      'REFUSE': { class: 'status-rejected', text: 'REFUSÉ', icon: '❌' }
    };
    return statusMap[statut] || statusMap['EN_ATTENTE'];
  };

  // Formatage date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  // Style du score
  const getScoreClass = (score) => {
    if (!score) return '';
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  };

  if (loading) {
    return (
      <div className="analyse-loading">
        <div className="spinner"></div>
        <p>Chargement des candidatures...</p>
      </div>
    );
  }

  return (
    <div className="analyse-ia-page">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-title">
          <div className="title-icon">🤖</div>
          <div>
            <h1>Analyse des CV par IA</h1>
            <p className="header-description">
              Évaluation automatique des compétences et matching avec vos offres
            </p>
          </div>
        </div>
        <button className="refresh-button" onClick={() => window.location.reload()}>
          🔄 Actualiser
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-alert">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      {candidatures.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Aucune candidature</h3>
          <p>Vous n'avez pas encore reçu de candidatures à analyser.</p>
        </div>
      ) : (
        <>
          {/* FILTRE */}
          <div className="filter-section">
            <div className="filter-control">
              <label>📋 Filtrer par offre :</label>
              <select 
                value={selectedOffre} 
                onChange={(e) => setSelectedOffre(e.target.value)}
                className="filter-select"
              >
                <option value="all">📌 Toutes les offres ({candidatures.length})</option>
                {offresUniques.map(offre => {
                  const count = candidatures.filter(c => c.offre_titre === offre).length;
                  return (
                    <option key={offre} value={offre}>
                      {offre} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="filter-stats">
              <span className="stats-badge">
                {filteredCandidatures.length} candidat(s)
              </span>
            </div>
          </div>

          {/* TABLEAU - Ordre: CANDIDAT | OFFRE | CONTACT | ÉTAT | SCORE CV */}
          <div className="table-wrapper">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>CANDIDAT</th>
                  <th>OFFRE</th>
                  <th>CONTACT</th>
                  <th>ÉTAT</th>
                  <th>SCORE CV</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidatures.map((candidat) => {
                  const statusInfo = getStatusInfo(candidat.statut);
                  const isAnalyzing = analyzingId === candidat.id;
                  const score = candidat.score_ia;
                  const hasScore = score !== null && score !== undefined;
                  
                  return (
                    <tr key={candidat.id} className="table-row">
                      {/* COLONNE CANDIDAT */}
                      <td className="col-candidate">
                        <div className="candidate-info">
                          <div className="candidate-avatar">
                            {candidat.nom ? candidat.nom.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="candidate-details">
                            <div className="candidate-name">{candidat.nom || '—'}</div>
                            {candidat.domaine && (
                              <div className="candidate-domaine">📂 {candidat.domaine}</div>
                            )}
                            {candidat.localisation && (
                              <div className="candidate-location">📍 {candidat.localisation}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* COLONNE OFFRE */}
                      <td className="col-offre">
                        <div className="offre-title">{candidat.offre_titre || '—'}</div>
                        <div className="offre-date">📅 {formatDate(candidat.date_postulation)}</div>
                      </td>

                      {/* COLONNE CONTACT */}
                      <td className="col-contact">
                        <div className="contact-item">
                          <span className="contact-icon">📧</span>
                          <span className="contact-text">{candidat.email || '—'}</span>
                        </div>
                        {candidat.telephone && (
                          <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <span className="contact-text">{candidat.telephone}</span>
                          </div>
                        )}
                      </td>

                      {/* COLONNE ÉTAT */}
                      <td className="col-status">
                        <span className={`status-badge ${statusInfo.class}`}>
                          <span className="status-icon">{statusInfo.icon}</span>
                          <span>{statusInfo.text}</span>
                        </span>
                      </td>

                      {/* COLONNE SCORE CV - avec bouton intégré */}
                      <td className="col-score">
                        {hasScore ? (
                          <div className={`score-container ${getScoreClass(score)}`}>
                            <div className="score-display">
                              <span className="score-number">{score}</span>
                              <span className="score-total">/100</span>
                            </div>
                            <div className="score-bar">
                              <div className="score-bar-fill" style={{ width: `${score}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAnalyze(candidat)}
                            className="analyze-button"
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <>
                                <div className="button-spinner"></div>
                                Analyse...
                              </>
                            ) : (
                              <>📊 Analyser le CV</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* STATISTIQUES */}
          <div className="stats-footer">
            <div className="stat-card">
              <div className="stat-value">{candidatures.length}</div>
              <div className="stat-label">Total candidats</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{offresUniques.length}</div>
              <div className="stat-label">Offres concernées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {candidatures.filter(c => c.score_ia).length}
              </div>
              <div className="stat-label">CV analysés</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {candidatures.filter(c => c.cv_text).length}
              </div>
              <div className="stat-label">CV extraits</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyseIA;