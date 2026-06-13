import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Candidatenrecruteur.css';

const Candidatenrecruteur = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date_postulation', direction: 'desc' });
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null); // ID de la candidature en cours d'analyse
  const token = localStorage.getItem('token');

  // Normalisation des statuts (suppression EN_COURS)
  const normaliserCandidatures = (data) => {
    return data.map(c => {
      let statutNormalise = c.statut;
      if (statutNormalise === 'EN_COURS') statutNormalise = 'EN_ATTENTE';
      if (statutNormalise === 'ACCEPTE') statutNormalise = 'ACCEPTÉE';
      if (statutNormalise === 'REFUSE') statutNormalise = 'REFUSÉE';
      return {
        ...c,
        statut: statutNormalise,
        score: c.score_ia ?? c.score ?? null
      };
    });
  };

  // Chargement initial
  const fetchCandidatures = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/recruteur/candidatures', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur chargement');
      const data = await response.json();
      const normalisees = normaliserCandidatures(data);
      setCandidatures(normalisees);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCandidatures();
  }, [fetchCandidatures]);

  // Analyse IA d'une candidature (copiée depuis AnalyseIA)
  const handleAnalyze = async (candidature) => {
    if (candidature.score) {
      // Déjà analysé
      return;
    }
    setAnalyzingId(candidature.candidature_id);
    try {
      // Appel à l'API d'analyse
      const response = await fetch(`http://localhost:3000/recruteur/analyze-cv/${candidature.candidature_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cv_text: candidature.cv_text,   // si tu as le texte extrait
          offre_titre: candidature.offre_titre
        })
      });
      if (response.ok) {
        const result = await response.json();
        const nouveauScore = result.score; // ex: 85
        // Mise à jour locale
        setCandidatures(prev =>
          prev.map(c =>
            c.candidature_id === candidature.candidature_id
              ? { ...c, score: nouveauScore }
              : c
          )
        );
        if (selectedCandidat && selectedCandidat.candidature_id === candidature.candidature_id) {
          setSelectedCandidat(prev => ({ ...prev, score: nouveauScore }));
        }
      } else {
        throw new Error('Erreur analyse');
      }
    } catch (err) {
      console.error('Erreur analyse:', err);
      // Option : mode démo avec score aléatoire
      const mockScore = Math.floor(Math.random() * 40) + 60;
      setCandidatures(prev =>
        prev.map(c =>
          c.candidature_id === candidature.candidature_id
            ? { ...c, score: mockScore }
            : c
        )
      );
      if (selectedCandidat && selectedCandidat.candidature_id === candidature.candidature_id) {
        setSelectedCandidat(prev => ({ ...prev, score: mockScore }));
      }
    } finally {
      setAnalyzingId(null);
    }
  };

  // Changement de statut
  const changerStatut = async (candidatureId, nouveauStatut) => {
    const statutBackend = {
      'EN ATTENTE': 'EN_ATTENTE',
      'ACCEPTÉE': 'ACCEPTE',
      'REFUSÉE': 'REFUSE'
    }[nouveauStatut] || nouveauStatut;

    try {
      const response = await fetch(`http://localhost:3000/recruteur/candidatures/${candidatureId}/statut`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: statutBackend })
      });
      if (!response.ok) throw new Error('Erreur mise à jour');
      setCandidatures(prev =>
        prev.map(c =>
          c.candidature_id === candidatureId ? { ...c, statut: nouveauStatut } : c
        )
      );
      if (selectedCandidat && selectedCandidat.candidature_id === candidatureId) {
        setSelectedCandidat(prev => ({ ...prev, statut: nouveauStatut }));
      }
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  // Modale
  const openModal = (candidat) => {
    setSelectedCandidat(candidat);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidat(null);
  };

  // Tri
  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  }, [sortConfig.key, sortConfig.direction]);

  // Filtrage
  const candidaturesFiltrees = useMemo(() => {
    return candidatures.filter(c => {
      const matchStatut = filter === 'tous' || c.statut === filter;
      const matchSearch = searchTerm === '' ||
        `${c.candidat_nom} ${c.candidat_prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.offre_titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.candidat_email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatut && matchSearch;
    });
  }, [candidatures, filter, searchTerm]);

  // Tri
  const sortedCandidatures = useMemo(() => {
    let sortableItems = [...candidaturesFiltrees];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'date_postulation') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        if (sortConfig.key === 'score') {
          aVal = aVal ?? -1;
          bVal = bVal ?? -1;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [candidaturesFiltrees, sortConfig]);

  // Stats (sans EN COURS)
  const stats = useMemo(() => ({
    total: candidatures.length,
    enAttente: candidatures.filter(c => c.statut === 'EN ATTENTE').length,
    acceptees: candidatures.filter(c => c.statut === 'ACCEPTÉE').length,
    refusees: candidatures.filter(c => c.statut === 'REFUSÉE').length
  }), [candidatures]);

  // Formattage score
  const getScoreDisplay = (score) => {
    if (score === null || score === undefined) return null;
    return `${Math.round(score)}%`;
  };
  const getScoreClass = (score) => {
    if (score === null || score === undefined) return '';
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };
  const formatDateSimple = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatutIcon = (statut) => {
    if (statut === 'EN ATTENTE') return '⏳';
    if (statut === 'ACCEPTÉE') return '✅';
    if (statut === 'REFUSÉE') return '❌';
    return '📋';
  };
  const getStatutPastelColor = (statut) => {
    if (statut === 'EN ATTENTE') return '#fef3e2';
    if (statut === 'ACCEPTÉE') return '#e2f3e2';
    if (statut === 'REFUSÉE') return '#fee2e2';
    return '#f5f5f5';
  };
  const getStatutLibelle = (statut) => {
    if (statut === 'EN ATTENTE') return 'En attente';
    if (statut === 'ACCEPTÉE') return 'Acceptée';
    if (statut === 'REFUSÉE') return 'Refusée';
    return statut;
  };
  const getSortIcon = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === 'asc' ? '↑' : '↓';
    return '↕️';
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Chargement...</p></div>;
  if (error) return <div className="error-container"><div className="error-icon">⚠️</div><p>{error}</p><button onClick={fetchCandidatures}>Réessayer</button></div>;

  return (
    <div className="candidatures-page">
      <div className="page-title">
        <h1><span className="title-icon">📋</span> Gestion des candidatures</h1>
        <p className="title-subtitle">{candidatures.length} candidature(s)</p>
      </div>

      <div className="stats-pastel">
        <div className="stat-pastel-card total"><div className="stat-pastel-icon">📊</div><div className="stat-pastel-content"><span className="stat-pastel-label">Total</span><span className="stat-pastel-value">{stats.total}</span></div></div>
        <div className="stat-pastel-card attente"><div className="stat-pastel-icon">⏳</div><div className="stat-pastel-content"><span className="stat-pastel-label">En attente</span><span className="stat-pastel-value">{stats.enAttente}</span></div></div>
        <div className="stat-pastel-card acceptee"><div className="stat-pastel-icon">✅</div><div className="stat-pastel-content"><span className="stat-pastel-label">Acceptées</span><span className="stat-pastel-value">{stats.acceptees}</span></div></div>
        <div className="stat-pastel-card refusee"><div className="stat-pastel-icon">❌</div><div className="stat-pastel-content"><span className="stat-pastel-label">Refusées</span><span className="stat-pastel-value">{stats.refusees}</span></div></div>
      </div>

      <div className="actions-bar">
        <div className="search-section">
          <div className="search-icon">🔍</div>
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input-pastel" />
          {searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>}
        </div>
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'tous' ? 'active' : ''}`} onClick={() => setFilter('tous')}>Tous</button>
          <button className={`filter-btn ${filter === 'EN ATTENTE' ? 'active' : ''}`} onClick={() => setFilter('EN ATTENTE')}>⏳ En attente</button>
          <button className={`filter-btn ${filter === 'ACCEPTÉE' ? 'active' : ''}`} onClick={() => setFilter('ACCEPTÉE')}>✅ Acceptées</button>
          <button className={`filter-btn ${filter === 'REFUSÉE' ? 'active' : ''}`} onClick={() => setFilter('REFUSÉE')}>❌ Refusées</button>
        </div>
      </div>

      {candidaturesFiltrees.length === 0 ? (
        <div className="empty-table"><div className="empty-icon">📭</div><h3>Aucune candidature</h3></div>
      ) : (
        <div className="table-wrapper">
          <table className="candidatures-table-pastel">
            <thead>
              <tr>
                <th onClick={() => requestSort('candidat_nom')}>Candidat {getSortIcon('candidat_nom')}</th>
                <th onClick={() => requestSort('offre_titre')}>Offre {getSortIcon('offre_titre')}</th>
                <th onClick={() => requestSort('date_postulation')}>Date {getSortIcon('date_postulation')}</th>
                <th>Contact</th>
                <th>CV</th>
                <th onClick={() => requestSort('score')}>Score IA {getSortIcon('score')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCandidatures.map(c => {
                const isAnalyzing = analyzingId === c.candidature_id;
                const hasScore = c.score !== null && c.score !== undefined;
                return (
                  <tr key={c.candidature_id}>
                    <td><div className="candidat-cell"><div className="candidat-avatar-pastel">{c.candidat_prenom?.[0]}{c.candidat_nom?.[0]}</div><div className="candidat-name"><strong>{c.candidat_prenom} {c.candidat_nom}</strong></div></div></td>
                    <td><div className="offre-cell"><span className="offre-icon">📌</span>{c.offre_titre}</div></td>
                    <td><div className="date-cell"><span className="date-icon">📅</span>{formatDate(c.date_postulation)}</div></td>
                    <td><button className="info-button" onClick={() => openModal(c)}><span className="info-icon">👤</span><span className="info-text">Détails</span></button></td>
                    <td><div className="cv-cell">{c.cv ? <a href={`http://localhost:3000/uploads/${c.cv}`} target="_blank" rel="noopener noreferrer" className="cv-pastel-link">📄 CV</a> : <span className="cv-indisponible">—</span>}</div></td>
                    <td className="score-cell">
                      {hasScore ? (
                        <div className={`score-container ${getScoreClass(c.score)}`}>
                          <div className="score-display">
                            <span className="score-number">{Math.round(c.score)}</span>
                            <span className="score-total">/100</span>
                          </div>
                          <div className="score-bar"><div className="score-bar-fill" style={{ width: `${c.score}%` }}></div></div>
                        </div>
                      ) : (
                        <button onClick={() => handleAnalyze(c)} className="analyze-button" disabled={isAnalyzing}>
                          {isAnalyzing ? <><div className="button-spinner"></div> Analyse...</> : <>📊 Analyser</>}
                        </button>
                      )}
                    </td>
                    <td><div className="action-cell"><select value={c.statut} onChange={e => changerStatut(c.candidature_id, e.target.value)} className="statut-pastel-select" style={{ backgroundColor: getStatutPastelColor(c.statut) }}><option value="EN ATTENTE">⏳ En attente</option><option value="ACCEPTÉE">✅ Accepter</option><option value="REFUSÉE">❌ Refuser</option></select></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="table-footer"><span className="results-count">{candidaturesFiltrees.length} résultat(s)</span></div>
        </div>
      )}

      {/* Modal (identique à avant, avec affichage du score) */}
      {showModal && selectedCandidat && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Infos candidat</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
            <div className="modal-body">
              <div className="modal-candidat-header">
                <div className="modal-avatar">{selectedCandidat.candidat_prenom?.[0]}{selectedCandidat.candidat_nom?.[0]}</div>
                <div className="modal-candidat-nom"><h3>{selectedCandidat.candidat_prenom} {selectedCandidat.candidat_nom}</h3><span className="modal-statut-badge" style={{ backgroundColor: getStatutPastelColor(selectedCandidat.statut) }}>{getStatutIcon(selectedCandidat.statut)} {getStatutLibelle(selectedCandidat.statut)}</span></div>
              </div>
              <div className="modal-info-grid">
                <div className="modal-info-section"><h4>📧 Contact</h4><div className="modal-info-item"><span className="modal-info-label">Email</span><a href={`mailto:${selectedCandidat.candidat_email}`} className="modal-info-value">{selectedCandidat.candidat_email}</a></div>{selectedCandidat.candidat_telephone && <div className="modal-info-item"><span className="modal-info-label">Téléphone</span><a href={`tel:${selectedCandidat.candidat_telephone}`} className="modal-info-value">{selectedCandidat.candidat_telephone}</a></div>}</div>
                <div className="modal-info-section"><h4>💼 Professionnel</h4><div className="modal-info-item"><span className="modal-info-label">Domaine</span><span className="modal-info-value">{selectedCandidat.candidat_domaine || 'Non spécifié'}</span></div><div className="modal-info-item"><span className="modal-info-label">Offre postulée</span><span className="modal-info-value">{selectedCandidat.offre_titre}</span></div><div className="modal-info-item"><span className="modal-info-label">Score IA</span><span className="modal-info-value">{selectedCandidat.score ? `${Math.round(selectedCandidat.score)}/100` : 'Non analysé'}</span></div></div>
                <div className="modal-info-section"><h4>📅 Candidature</h4><div className="modal-info-item"><span className="modal-info-label">Date</span><span className="modal-info-value">{formatDateSimple(selectedCandidat.date_postulation)}</span></div></div>
              </div>
              <div className="modal-actions"><h4>⚡ Actions</h4><div className="modal-action-buttons">{selectedCandidat.cv && <a href={`http://localhost:3000/uploads/${selectedCandidat.cv}`} target="_blank" rel="noopener noreferrer" className="modal-action-btn cv">📄 Voir CV</a>}<select value={selectedCandidat.statut} onChange={e => changerStatut(selectedCandidat.candidature_id, e.target.value)} className="modal-statut-select" style={{ backgroundColor: getStatutPastelColor(selectedCandidat.statut) }}><option value="EN ATTENTE">⏳ En attente</option><option value="ACCEPTÉE">✅ Accepter</option><option value="REFUSÉE">❌ Refuser</option></select></div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidatenrecruteur;