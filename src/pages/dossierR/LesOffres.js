// LesOffres.js - Version complète avec modal de suppression amélioré
import { useState, useEffect, useCallback, useMemo } from "react";
import jwtDecode from "jwt-decode";
import "./LesOffres.css";

// Composant modal pour les détails de l'offre
const OffreDetailsModal = ({ offre, onClose }) => {
  if (!offre) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>{offre.titre}</h2>
          {offre.recruteur_nom && (
            <div className="modal-recruteur">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {offre.recruteur_nom}
            </div>
          )}
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3>Description du poste</h3>
            <p>{offre.description}</p>
          </div>

          <div className="modal-info-grid">
            <div className="modal-info-item">
              <span className="info-label">📅 Publiée le</span>
              <span className="info-value">{formatDate(offre.date_creation)}</span>
            </div>
            {offre.date_limite && (
              <div className="modal-info-item">
                <span className="info-label">⏰ Date limite</span>
                <span className="info-value">{formatDate(offre.date_limite)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

// Composant modal pour postuler
const PostulerModal = ({ offreId, offreTitre, onClose, onSuccess }) => {
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size <= 5 * 1024 * 1024) {
        setCvFile(file);
        setError("");
      } else {
        setError("Le CV ne doit pas dépasser 5 Mo");
      }
    } else if (file) {
      setError("Veuillez sélectionner un fichier PDF");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      setError("Le CV est obligatoire");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("cv", cvFile);

    try {
      const res = await fetch(`http://localhost:3000/postuler/${offreId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Erreur lors de la candidature");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>Postuler</h2>
          <p className="modal-subtitle">{offreTitre}</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>CV (PDF) <span className="required">*</span></label>
            <div className="file-dropzone" onClick={() => document.getElementById('cv-file').click()}>
              <input id="cv-file" type="file" accept=".pdf" onChange={handleFileChange} hidden />
              {cvFile ? (
                <div className="file-selected">📄 {cvFile.name}</div>
              ) : (
                <div className="file-placeholder">
                  <span className="upload-icon">📁</span>
                  <span>Cliquez pour sélectionner votre CV</span>
                  <small>PDF uniquement (max 5 Mo)</small>
                </div>
              )}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant modal pour nouvelle offre
const NouvelleOffreModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({ titre: "", description: "", date_limite: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titre.trim() || !formData.description.trim() || !formData.date_limite) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    setLoading(true);
    await onAdd(formData);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>Nouvelle offre</h2>
          <p className="modal-subtitle">Créez une nouvelle opportunité</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Titre <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Ex: Développeur Full Stack"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Description <span className="required">*</span></label>
            <textarea
              placeholder="Décrivez le poste, les missions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label>Date limite <span className="required">*</span></label>
            <input
              type="date"
              value={formData.date_limite}
              onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="form-input"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Création..." : "Créer l'offre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de suppression amélioré
const DeleteConfirmModal = ({ onConfirm, onCancel, offreTitre }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container delete-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>✕</button>
        
        <div className="delete-modal-content">
          <div className="delete-icon-wrapper">
            <div className="delete-icon-circle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
                <path d="M9 3h6v2H9z"/>
              </svg>
            </div>
          </div>
          
          <div className="delete-modal-header">
            <h2>Confirmer la suppression</h2>
            <p>Cette action est irréversible</p>
          </div>
          
          <div className="delete-modal-body">
            <div className="delete-warning-box">
              <span className="warning-icon">⚠️</span>
              <div className="warning-text">
                <strong>Vous êtes sur le point de supprimer :</strong>
                <span className="offre-title-to-delete">"{offreTitre}"</span>
              </div>
            </div>
            
            <ul className="delete-consequences">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                L'offre sera définitivement supprimée
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 12H4M12 4v16"/>
                </svg>
                Toutes les candidatures associées seront perdues
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Cette action ne peut pas être annulée
              </li>
            </ul>
          </div>
          
          <div className="delete-modal-footer">
            <button className="btn-cancel" onClick={onCancel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Annuler
            </button>
            <button className="btn-confirm-delete" onClick={onConfirm}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
                <path d="M9 3h6v2H9z"/>
              </svg>
              Oui, supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Carte d'offre
const OffreCard = ({ offre, role, onViewDetails, onEdit, onDelete, onPostuler, isExpired }) => {
  return (
    <div className={`offer-card ${isExpired ? 'expired' : ''}`}>
      <div className="offer-card-content">
        <div className="offer-header">
          <div className="offer-title-wrapper">
            <h3 className="offer-title">{offre.titre}</h3>
            {isExpired && <span className="offer-badge expired-badge">Expirée</span>}
          </div>
          <div className="offer-actions">
            <button className="offer-action view" onClick={() => onViewDetails(offre)} title="Voir">
              👁️
            </button>
            {role === "RECRUTEUR" && (
              <>
                <button className="offer-action edit" onClick={() => onEdit(offre)} title="Modifier">
                  ✏️
                </button>
                <button className="offer-action delete" onClick={() => onDelete(offre.id, offre.titre)} title="Supprimer">
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>
        
        <p className="offer-description">
          {offre.description.length > 120 ? offre.description.substring(0, 120) + "..." : offre.description}
        </p>
        
        <div className="offer-footer">
          <div className="offer-meta">
            <span className="offer-date">📅 {new Date(offre.date_creation).toLocaleDateString('fr-FR')}</span>
            {role === "CANDIDAT" && offre.recruteur_nom && (
              <span className="offer-recruiter">👤 {offre.recruteur_nom}</span>
            )}
          </div>
          
          {role === "CANDIDAT" && (
            <button
              onClick={() => onPostuler(offre)}
              className={`apply-btn ${isExpired ? 'disabled' : ''}`}
              disabled={isExpired}
            >
              {isExpired ? "Expirée" : "Postuler →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant principal
export default function LesOffres() {
  const [offres, setOffres] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPostulerModal, setShowPostulerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [selectedOffreDetails, setSelectedOffreDetails] = useState(null);
  const [offreToDelete, setOffreToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedOffre, setEditedOffre] = useState({ titre: "", description: "", date_limite: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }
  }, [token]);

  useEffect(() => {
    if (role) fetchOffres();
  }, [role]);

  const fetchOffres = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = role === "RECRUTEUR" ? "mesoffres" : "offres";
      const res = await fetch(`http://localhost:3000/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOffres(data);
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [role, token]);

  const handleAddOffre = async (newOffre) => {
    try {
      const res = await fetch("http://localhost:3000/addoffre", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newOffre),
      });
      const data = await res.json();
      if (res.ok) {
        setOffres([data, ...offres]);
        setShowNewModal(false);
        showMessage("Offre créée avec succès !");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Erreur lors de la création");
    }
  };

  const handleDeleteClick = (id, titre) => {
    setOffreToDelete({ id, titre });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!offreToDelete) return;
    try {
      const res = await fetch(`http://localhost:3000/deleteoffre/${offreToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOffres(offres.filter(o => o.id !== offreToDelete.id));
        showMessage("Offre supprimée avec succès");
      }
    } catch {
      setError("Erreur lors de la suppression");
    } finally {
      setShowDeleteModal(false);
      setOffreToDelete(null);
    }
  };

  const handleEdit = (offre) => {
    setEditingId(offre.id);
    setEditedOffre({
      titre: offre.titre,
      description: offre.description,
      date_limite: offre.date_limite?.split('T')[0] || ""
    });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/updateoffre/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editedOffre),
      });
      const data = await res.json();
      if (res.ok) {
        setOffres(offres.map(o => o.id === id ? data : o));
        setEditingId(null);
        showMessage("Offre modifiée avec succès");
      }
    } catch {
      setError("Erreur lors de la modification");
    }
  };

  const showMessage = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getFilteredOffres = useMemo(() => {
    let filtered = [...offres];
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      switch(sortBy) {
        case "date_desc": return new Date(b.date_creation) - new Date(a.date_creation);
        case "date_asc": return new Date(a.date_creation) - new Date(b.date_creation);
        case "titre_asc": return a.titre.localeCompare(b.titre);
        case "titre_desc": return b.titre.localeCompare(a.titre);
        default: return 0;
      }
    });
    return filtered;
  }, [offres, searchTerm, sortBy]);

  const isExpired = (dateLimite) => dateLimite && new Date(dateLimite) < new Date();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="offers-page">
      {/* Header */}
      <div className="offers-header">
        <div className="offers-header-left">
          <h1>{role === "RECRUTEUR" ? "Mes offres" : "Offres disponibles"}</h1>
          <span className="offers-count">{getFilteredOffres.length}</span>
        </div>
        {role === "RECRUTEUR" && (
          <button className="create-btn" onClick={() => setShowNewModal(true)}>
            + Nouvelle offre
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="offers-filters">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher une offre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm("")}>✕</button>
          )}
        </div>
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="date_desc">📅 Plus récent</option>
          <option value="date_asc">📅 Plus ancien</option>
          <option value="titre_asc">🔤 A → Z</option>
          <option value="titre_desc">🔤 Z → A</option>
        </select>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="toast-message">
          <span className="toast-icon">✓</span>
          {successMessage}
        </div>
      )}

      {/* Content */}
      {getFilteredOffres.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">📭</div>
          <h3>Aucune offre trouvée</h3>
          <p>{role === "RECRUTEUR" ? "Créez votre première offre" : "Revenez plus tard"}</p>
        </div>
      ) : (
        <div className="offers-grid">
          {getFilteredOffres.map((offre) => (
            <OffreCard
              key={offre.id}
              offre={offre}
              role={role}
              onViewDetails={(o) => { setSelectedOffreDetails(o); setShowDetailsModal(true); }}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPostuler={(o) => { setSelectedOffre(o); setShowPostulerModal(true); }}
              isExpired={isExpired(offre.date_limite)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="modal-overlay" onClick={() => setEditingId(null)}>
          <div className="modal-container small" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditingId(null)}>✕</button>
            <div className="modal-header">
              <h2>Modifier l'offre</h2>
            </div>
            <div className="modal-form">
              <input
                type="text"
                value={editedOffre.titre}
                onChange={(e) => setEditedOffre({ ...editedOffre, titre: e.target.value })}
                placeholder="Titre"
                className="form-input"
              />
              <textarea
                value={editedOffre.description}
                onChange={(e) => setEditedOffre({ ...editedOffre, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="form-textarea"
              />
              <input
                type="date"
                value={editedOffre.date_limite}
                onChange={(e) => setEditedOffre({ ...editedOffre, date_limite: e.target.value })}
                className="form-input"
              />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setEditingId(null)}>Annuler</button>
                <button className="btn-primary" onClick={() => handleUpdate(editingId)}>Sauvegarder</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal amélioré */}
      {showDeleteModal && offreToDelete && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setOffreToDelete(null);
          }}
          offreTitre={offreToDelete.titre}
        />
      )}

      {/* Modals */}
      {showNewModal && <NouvelleOffreModal onClose={() => setShowNewModal(false)} onAdd={handleAddOffre} />}
      {showDetailsModal && selectedOffreDetails && <OffreDetailsModal offre={selectedOffreDetails} onClose={() => { setShowDetailsModal(false); setSelectedOffreDetails(null); }} />}
      {showPostulerModal && selectedOffre && <PostulerModal offreId={selectedOffre.id} offreTitre={selectedOffre.titre} onClose={() => { setShowPostulerModal(false); setSelectedOffre(null); }} onSuccess={() => showMessage("Candidature envoyée !")} />}
    </div>
  );
}