// LesOffres.js - Version complète avec modales améliorées
import { useState, useEffect, useCallback, useMemo } from "react";
import jwtDecode from "jwt-decode";
import "./LesOffres.css";

// Composant modal pour les détails de l'offre - Version sans bouton annuler
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
      <div className="modal-container details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-close-wrapper">
          <button type="button" className="modal-close-x" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-header details-header">
          <div className="details-title-section">
            <h2>{offre.titre}</h2>
            {offre.recruteur_nom && (
              <div className="modal-recruteur">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>{offre.recruteur_nom}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-body details-body">
          <div className="details-section description-section">
            <div className="section-icon">📋</div>
            <div className="section-content">
              <h3>Description du poste</h3>
              <p>{offre.description}</p>
            </div>
          </div>
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
      <div className="modal-container postuler-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-close-wrapper">
          <button type="button" className="modal-close-x" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-header">
          <h2>Postuler</h2>
          <p className="modal-subtitle">{offreTitre}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
          </div>

          <div className="modal-footer">
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
    setError("");
    await onAdd(formData);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container add-offre-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-close-wrapper">
          <button type="button" className="modal-close-x" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-header">
          <h2>Nouvelle offre</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
          </div>

          <div className="modal-footer single-button">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Création..." : "Créer l'offre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de suppression - Version améliorée avec design moderne
const DeleteConfirmModal = ({ onConfirm, onCancel, offreTitre }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container delete-modal-modern" onClick={(e) => e.stopPropagation()}>
        <div className="modal-close-wrapper">
          <button type="button" className="modal-close-x" onClick={onCancel}>
            ✕
          </button>
        </div>
        
        <div className="delete-modern-content">
          {/* Icône animée */}
          <div className="delete-icon-modern">
            <div className="delete-icon-circle-modern">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M8 6V4h8v2"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
              </svg>
            </div>
          </div>

          {/* Titre et description */}
          <div className="delete-modern-header">
            <h2>Supprimer cette offre ?</h2>
            <p>Cette action est irréversible et supprimera définitivement l'offre ainsi que toutes les candidatures associées.</p>
          </div>

          {/* Offre à supprimer */}
          <div className="delete-offre-card">
            <div className="delete-offre-icon">📄</div>
            <div className="delete-offre-info">
              <span className="delete-offre-label">Offre concernée</span>
              <strong className="delete-offre-title">"{offreTitre}"</strong>
            </div>
          </div>

          {/* Liste des conséquences */}
          <div className="delete-consequences-modern">
            <div className="consequence-item">
              <div className="consequence-icon warning">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <span>L'offre sera définitivement supprimée</span>
            </div>
            <div className="consequence-item">
              <div className="consequence-icon danger">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 12H4M12 4v16"/>
                </svg>
              </div>
              <span>Toutes les candidatures associées seront perdues</span>
            </div>
            <div className="consequence-item">
              <div className="consequence-icon info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <span>Aucune restauration possible après suppression</span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="delete-modern-footer">
            <button className="btn-delete-cancel" onClick={onCancel}>
              Annuler
            </button>
            <button className="btn-delete-confirm" onClick={handleConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <span className="spinner-small"></span>
                  Suppression...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  </svg>
                  Oui, supprimer
                </>
              )}
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

      {/* Edit Modal - Version sans bouton annuler */}
      {editingId && (
        <div className="modal-overlay" onClick={() => setEditingId(null)}>
          <div className="modal-container edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-close-wrapper">
              <button type="button" className="modal-close-x" onClick={() => setEditingId(null)}>
                ✕
              </button>
            </div>
            <div className="modal-header">
              <h2>Modifier l'offre</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Titre <span className="required">*</span></label>
                <input
                  type="text"
                  value={editedOffre.titre}
                  onChange={(e) => setEditedOffre({ ...editedOffre, titre: e.target.value })}
                  placeholder="Titre"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={editedOffre.description}
                  onChange={(e) => setEditedOffre({ ...editedOffre, description: e.target.value })}
                  placeholder="Description"
                  rows={4}
                  className="form-textarea"
                />
              </div>
              <div className="form-group">
                <label>Date limite <span className="required">*</span></label>
                <input
                  type="date"
                  value={editedOffre.date_limite}
                  onChange={(e) => setEditedOffre({ ...editedOffre, date_limite: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer single-button">
              <button className="btn-primary" onClick={() => handleUpdate(editingId)}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewModal && <NouvelleOffreModal onClose={() => setShowNewModal(false)} onAdd={handleAddOffre} />}
      {showDetailsModal && selectedOffreDetails && <OffreDetailsModal offre={selectedOffreDetails} onClose={() => { setShowDetailsModal(false); setSelectedOffreDetails(null); }} />}
      {showPostulerModal && selectedOffre && <PostulerModal offreId={selectedOffre.id} offreTitre={selectedOffre.titre} onClose={() => { setShowPostulerModal(false); setSelectedOffre(null); }} onSuccess={() => showMessage("Candidature envoyée !")} />}
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
    </div>
  );
}