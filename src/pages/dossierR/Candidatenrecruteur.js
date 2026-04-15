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
  const token = localStorage.getItem('token');

  const fetchCandidatures = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/recruteur/candidatures', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur chargement');
      
      const data = await response.json();
      setCandidatures(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCandidatures();
  }, [fetchCandidatures]);

  // Fonction corrigée pour changer le statut
  const changerStatut = async (candidatureId, nouveauStatut) => {
    // Convertir le statut affiché en valeur backend
    const statutBackend = {
      'EN ATTENTE': 'EN_ATTENTE',
      'EN COURS': 'EN_COURS',
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur mise à jour');
      }

      // Mettre à jour l'état local avec le nouveau statut (garder le format d'affichage)
      setCandidatures(prevCandidatures => 
        prevCandidatures.map(c => 
          c.candidature_id === candidatureId 
            ? { ...c, statut: nouveauStatut }
            : c
        )
      );

      if (selectedCandidat && selectedCandidat.candidature_id === candidatureId) {
        setSelectedCandidat(prev => ({ ...prev, statut: nouveauStatut }));
      }

    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const openModal = (candidat) => {
    setSelectedCandidat(candidat);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidat(null);
  };

  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig.key, sortConfig.direction]);

  const candidaturesFiltrees = useMemo(() => {
    return candidatures.filter(c => {
      const matchStatut = filter === 'tous' || c.statut === filter;
      const matchSearch = searchTerm === '' || 
        `${c.candidat_nom} ${c.candidat_prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.offre_titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.candidat_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.candidat_domaine && c.candidat_domaine.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchStatut && matchSearch;
    });
  }, [candidatures, filter, searchTerm]);

  const sortedCandidatures = useMemo(() => {
    let sortableItems = [...candidaturesFiltrees];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'date_postulation') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [candidaturesFiltrees, sortConfig]);

  const stats = useMemo(() => ({
    total: candidatures.length,
    enAttente: candidatures.filter(c => c.statut === 'EN ATTENTE').length,
    enCours: candidatures.filter(c => c.statut === 'EN COURS').length,
    acceptees: candidatures.filter(c => c.statut === 'ACCEPTÉE').length,
    refusees: candidatures.filter(c => c.statut === 'REFUSÉE').length
  }), [candidatures]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateSimple = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatutIcon = (statut) => {
    switch(statut) {
      case 'EN ATTENTE': return '⏳';
      case 'EN COURS': return '🔄';
      case 'ACCEPTÉE': return '✅';
      case 'REFUSÉE': return '❌';
      default: return '📋';
    }
  };

  const getStatutClass = (statut) => {
    switch(statut) {
      case 'EN ATTENTE': return 'statut-attente';
      case 'EN COURS': return 'statut-cours';
      case 'ACCEPTÉE': return 'statut-acceptee';
      case 'REFUSÉE': return 'statut-refusee';
      default: return '';
    }
  };

  const getStatutLibelle = (statut) => {
    switch(statut) {
      case 'EN ATTENTE': return 'En attente';
      case 'EN COURS': return 'En cours';
      case 'ACCEPTÉE': return 'Acceptée';
      case 'REFUSÉE': return 'Refusée';
      default: return statut;
    }
  };

  const getStatutPastelColor = (statut) => {
    switch(statut) {
      case 'EN ATTENTE': return '#fef3e2';
      case 'EN COURS': return '#e2f0fa';
      case 'ACCEPTÉE': return '#e2f3e2';
      case 'REFUSÉE': return '#fee2e2';
      default: return '#f5f5f5';
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕️';
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Chargement des candidatures...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p>Erreur: {error}</p>
      <button onClick={fetchCandidatures}>Réessayer</button>
    </div>
  );

  return (
    <div className="candidatures-page">
      <div className="page-title">
        <h1>
          <span className="title-icon">📋</span>
          Gestion des candidatures
        </h1>
        <p className="title-subtitle">{candidatures.length} candidature{candidatures.length > 1 ? 's' : ''} au total</p>
      </div>

      <div className="stats-pastel">
        <div className="stat-pastel-card total">
          <div className="stat-pastel-icon">📊</div>
          <div className="stat-pastel-content">
            <span className="stat-pastel-label">Total</span>
            <span className="stat-pastel-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-pastel-card attente">
          <div className="stat-pastel-icon">⏳</div>
          <div className="stat-pastel-content">
            <span className="stat-pastel-label">En attente</span>
            <span className="stat-pastel-value">{stats.enAttente}</span>
          </div>
        </div>
        <div className="stat-pastel-card cours">
          <div className="stat-pastel-icon">🔄</div>
          <div className="stat-pastel-content">
            <span className="stat-pastel-label">En cours</span>
            <span className="stat-pastel-value">{stats.enCours}</span>
          </div>
        </div>
        <div className="stat-pastel-card acceptee">
          <div className="stat-pastel-icon">✅</div>
          <div className="stat-pastel-content">
            <span className="stat-pastel-label">Acceptées</span>
            <span className="stat-pastel-value">{stats.acceptees}</span>
          </div>
        </div>
        <div className="stat-pastel-card refusee">
          <div className="stat-pastel-icon">❌</div>
          <div className="stat-pastel-content">
            <span className="stat-pastel-label">Refusées</span>
            <span className="stat-pastel-value">{stats.refusees}</span>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="search-section">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Rechercher un candidat, une offre, un email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-pastel"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'tous' ? 'active' : ''}`}
            onClick={() => setFilter('tous')}
          >
            Tous
          </button>
          <button 
            className={`filter-btn ${filter === 'EN ATTENTE' ? 'active' : ''}`}
            onClick={() => setFilter('EN ATTENTE')}
          >
            ⏳ En attente
          </button>
          <button 
            className={`filter-btn ${filter === 'EN COURS' ? 'active' : ''}`}
            onClick={() => setFilter('EN COURS')}
          >
            🔄 En cours
          </button>
          <button 
            className={`filter-btn ${filter === 'ACCEPTÉE' ? 'active' : ''}`}
            onClick={() => setFilter('ACCEPTÉE')}
          >
            ✅ Acceptées
          </button>
          <button 
            className={`filter-btn ${filter === 'REFUSÉE' ? 'active' : ''}`}
            onClick={() => setFilter('REFUSÉE')}
          >
            ❌ Refusées
          </button>
        </div>
      </div>

      {candidaturesFiltrees.length === 0 ? (
        <div className="empty-table">
          <div className="empty-icon">📭</div>
          <h3>Aucune candidature trouvée</h3>
          <p>Essayez de modifier vos filtres de recherche</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="candidatures-table-pastel">
            <thead>
              <tr>
                <th onClick={() => requestSort('candidat_nom')}>
                  Candidat {getSortIcon('candidat_nom')}
                </th>
                <th onClick={() => requestSort('offre_titre')}>
                  Offre {getSortIcon('offre_titre')}
                </th>
                <th onClick={() => requestSort('date_postulation')}>
                  Date {getSortIcon('date_postulation')}
                </th>
                <th>Contact & Infos</th>
                <th>CV</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCandidatures.map((c) => (
                <tr key={c.candidature_id}>
                  <td>
                    <div className="candidat-cell">
                      <div className="candidat-avatar-pastel">
                        {c.candidat_prenom?.[0]}{c.candidat_nom?.[0]}
                      </div>
                      <div className="candidat-name">
                        <strong>{c.candidat_prenom} {c.candidat_nom}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="offre-cell">
                      <span className="offre-icon">📌</span>
                      {c.offre_titre}
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <span className="date-icon">📅</span>
                      {formatDate(c.date_postulation)}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="info-button"
                      onClick={() => openModal(c)}
                      title="Voir les informations détaillées"
                    >
                      <span className="info-icon">👤</span>
                      <span className="info-text">Voir détails</span>
                    </button>
                  </td>
                  <td>
                    <div className="cv-cell">
                      {c.cv ? (
                        <a 
                          href={`http://localhost:3000/uploads/${c.cv}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="cv-pastel-link"
                          title="Voir le CV"
                        >
                          📄 CV
                        </a>
                      ) : (
                        <span className="cv-indisponible">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-cell">
                      <select 
                        value={c.statut}
                        onChange={(e) => changerStatut(c.candidature_id, e.target.value)}
                        className="statut-pastel-select"
                        style={{
                          backgroundColor: getStatutPastelColor(c.statut)
                        }}
                      >
                        <option value="EN ATTENTE" style={{ backgroundColor: '#fef3e2' }}>
                          ⏳ En attente
                        </option>
                        <option value="EN COURS" style={{ backgroundColor: '#e2f0fa' }}>
                          🔄 En cours
                        </option>
                        <option value="ACCEPTÉE" style={{ backgroundColor: '#e2f3e2' }}>
                          ✅ Accepter
                        </option>
                        <option value="REFUSÉE" style={{ backgroundColor: '#fee2e2' }}>
                          ❌ Refuser
                        </option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="table-footer">
            <span className="results-count">
              {candidaturesFiltrees.length} résultat{candidaturesFiltrees.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Modal des informations du candidat */}
      {showModal && selectedCandidat && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Informations du candidat</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-candidat-header">
                <div className="modal-avatar">
                  {selectedCandidat.candidat_prenom?.[0]}{selectedCandidat.candidat_nom?.[0]}
                </div>
                <div className="modal-candidat-nom">
                  <h3>{selectedCandidat.candidat_prenom} {selectedCandidat.candidat_nom}</h3>
                  <span 
                    className="modal-statut-badge"
                    style={{
                      backgroundColor: getStatutPastelColor(selectedCandidat.statut)
                    }}
                  >
                    {getStatutIcon(selectedCandidat.statut)} {getStatutLibelle(selectedCandidat.statut)}
                  </span>
                </div>
              </div>

              <div className="modal-info-grid">
                <div className="modal-info-section">
                  <h4>📧 Contact</h4>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Email</span>
                    <a href={`mailto:${selectedCandidat.candidat_email}`} className="modal-info-value">
                      {selectedCandidat.candidat_email}
                    </a>
                  </div>
                  {selectedCandidat.candidat_telephone && (
                    <div className="modal-info-item">
                      <span className="modal-info-label">Téléphone</span>
                      <a href={`tel:${selectedCandidat.candidat_telephone}`} className="modal-info-value">
                        {selectedCandidat.candidat_telephone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="modal-info-section">
                  <h4>💼 Professionnel</h4>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Domaine</span>
                    <span className="modal-info-value">
                      {selectedCandidat.candidat_domaine || 'Non spécifié'}
                    </span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Offre postulée</span>
                    <span className="modal-info-value">{selectedCandidat.offre_titre}</span>
                  </div>
                </div>

                <div className="modal-info-section">
                  <h4>📅 Candidature</h4>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Date de postulation</span>
                    <span className="modal-info-value">
                      {formatDateSimple(selectedCandidat.date_postulation)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <h4>⚡ Actions rapides</h4>
                <div className="modal-action-buttons">
                  {selectedCandidat.cv && (
                    <a 
                      href={`http://localhost:3000/uploads/${selectedCandidat.cv}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="modal-action-btn cv"
                    >
                      📄 Voir le CV
                    </a>
                  )}
                  <select 
                    value={selectedCandidat.statut}
                    onChange={(e) => {
                      changerStatut(selectedCandidat.candidature_id, e.target.value);
                    }}
                    className="modal-statut-select"
                    style={{
                      backgroundColor: getStatutPastelColor(selectedCandidat.statut)
                    }}
                  >
                    <option value="EN ATTENTE" style={{ backgroundColor: '#fef3e2' }}>
                      ⏳ En attente
                    </option>
                    <option value="EN COURS" style={{ backgroundColor: '#e2f0fa' }}>
                      🔄 En cours
                    </option>
                    <option value="ACCEPTÉE" style={{ backgroundColor: '#e2f3e2' }}>
                      ✅ Accepter
                    </option>
                    <option value="REFUSÉE" style={{ backgroundColor: '#fee2e2' }}>
                      ❌ Refuser
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidatenrecruteur;