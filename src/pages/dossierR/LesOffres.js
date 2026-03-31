import { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import "./LesOffres.css";

// Composant modal pour les détails de l'offre - Version améliorée
const OffreDetailsModal = ({ offre, onClose }) => {
  if (!offre) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutInfo = (dateLimite) => {
    if (!dateLimite) return { 
      color: "#10b981", 
      text: "Active", 
      icon: "✅",
      bg: "rgba(16, 185, 129, 0.1)"
    };
    
    
    if (joursRestants <= 3) return { 
      color: "#f59e0b", 
      text: "Expire bientôt", 
      icon: "⚠️",
      bg: "rgba(245, 158, 11, 0.1)"
    };
    return { 
      color: "#10b981", 
      text: "Active", 
      icon: "✅",
      bg: "rgba(16, 185, 129, 0.1)"
    };
  };

  const statut = getStatutInfo(offre.date_limite);

  const calculerJoursRestants = () => {
    if (!offre.date_limite) return null;
    const aujourdhui = new Date();
    const limite = new Date(offre.date_limite);
    const diff = limite - aujourdhui;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const joursRestants = calculerJoursRestants();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {/* En-tête avec image de fond décorative */}
        <div className="details-header">
          <div className="details-header-content">
            <div className="details-title-section">
              <h2>{offre.titre}</h2>
              <div 
                className="details-statut" 
                style={{ 
                  backgroundColor: statut.bg,
                  color: statut.color,
                  border: `1px solid ${statut.color}20`
                }}
              >
                <span className="statut-icon">{statut.icon}</span>
                {statut.text}
              </div>
            </div>
            
            {joursRestants > 0 && (
              <div className="details-timer">
                <div className="timer-icon">⏳</div>
                <div className="timer-info">
                  <span className="timer-label">{joursRestants} jours restants</span>
                  <div className="timer-progress">
                    <div 
                      className="timer-progress-bar"
                      style={{ 
                        width: `${Math.min(100, (joursRestants / 30) * 100)}%`,
                        backgroundColor: joursRestants <= 3 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="details-body">
          {/* Description avec style amélioré */}
          <div className="details-section">
            <h3>
              <span className="section-icon">📋</span>
              Description du poste
            </h3>
            <div className="description-card">
              <p className="details-description">{offre.description}</p>
            </div>
          </div>

          {/* Informations clés en cartes */}
          <div className="details-section">
      
            <div className="details-grid">
              {offre.lieu && (
                <div className="detail-card">
                  <div className="detail-card-icon">📍</div>
                  <div className="detail-card-content">
                    <span className="detail-card-label">Lieu</span>
                    <span className="detail-card-value">{offre.lieu}</span>
                  </div>
                </div>
              )}

              {offre.type_contrat && (
                <div className="detail-card">
                  <div className="detail-card-icon">📄</div>
                  <div className="detail-card-content">
                    <span className="detail-card-label">Type de contrat</span>
                    <span className="detail-card-value">{offre.type_contrat}</span>
                  </div>
                </div>
              )}

              {offre.salaire && (
                <div className="detail-card">
                  <div className="detail-card-icon">💰</div>
                  <div className="detail-card-content">
                    <span className="detail-card-label">Salaire</span>
                    <span className="detail-card-value">{offre.salaire}</span>
                  </div>
                </div>
              )}

              {offre.date_limite && (
                <div className="detail-card">
                  <div className="detail-card-icon">⏰</div>
                  <div className="detail-card-content">
                    <span className="detail-card-label">Date limite</span>
                    <span className="detail-card-value">{formatDate(offre.date_limite)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations supplémentaires en liste */}
          <div className="details-section">
            <h3>
              <span className="section-icon">📌</span>
              Informations complémentaires
            </h3>
            <div className="info-list">
              {offre.date_creation && (
                <div className="info-item">
                  <span className="info-item-icon">📅</span>
                  <span className="info-item-label">Publiée le :</span>
                  <span className="info-item-value">{formatDate(offre.date_creation)}</span>
                </div>
              )}

              {offre.recruteur_nom && (
                <div className="info-item">
                  <span className="info-item-icon">👤</span>
                  <span className="info-item-label">Recruteur :</span>
                  <span className="info-item-value">{offre.recruteur_nom}</span>
                </div>
              )}

              {offre.date_limite && new Date(offre.date_limite) < new Date() && (
                <div className="info-item expired">
                  <span className="info-item-icon">⚠️</span>
                  <span className="info-item-label">Statut :</span>
                  <span className="info-item-value">Cette offre est expirée</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="details-footer">
          <button className="btn-fermer" onClick={onClose}>
            Fermer
          </button>
          {offre.date_limite && new Date(offre.date_limite) > new Date() && (
            <button className="btn-postuler-rapide">
              Postuler rapidement →
            </button>
          )}
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
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size > 5 * 1024 * 1024) {
          setError("Le fichier ne doit pas dépasser 5 Mo");
          setCvFile(null);
        } else {
          setCvFile(file);
          setError("");
        }
      } else {
        setError("Veuillez sélectionner un fichier PDF");
        setCvFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cvFile) {
      setError("CV obligatoire (PDF)");
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append("cv", cvFile);

    try {
      const res = await fetch(`http://localhost:3000/postuler/${offreId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Erreur lors de la candidature");
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content postuler-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2>📝 Postuler</h2>
          <p className="modal-subtitle">Offre : {offreTitre}</p>
        </div>
        <form onSubmit={handleSubmit} className="postuler-form">
          <div className="form-group">
            <label htmlFor="cv">
              <span className="field-icon">📎</span>
              CV (PDF uniquement) <span className="required">*</span>
            </label>
            <div className="file-upload-area">
              <input
                type="file"
                id="cv"
                name="cv"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="file-input"
                required
              />
              <div className="file-upload-placeholder">
                {cvFile ? (
                  <span className="file-selected">✓ {cvFile.name}</span>
                ) : (
                  <>
                    <span className="upload-icon">📤</span>
                    <span>Cliquez ou glissez votre CV</span>
                  </>
                )}
              </div>
            </div>
            <small className="file-hint">Taille max : 5 Mo - Format PDF uniquement</small>
          </div>
          
          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Envoi en cours...
                </>
              ) : (
                'Envoyer ma candidature'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant modal pour nouvelle offre
const NouvelleOffreModal = ({ onClose, onAdd, typesContrat }) => {
  const [newOffre, setNewOffre] = useState({
    titre: "",
    description: "",
    date_limite: "",
    lieu: "",
    type_contrat: "CDI",
    salaire: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newOffre.titre || !newOffre.description || !newOffre.date_limite) {
      setError("Veuillez remplir le titre, la description et la date limite");
      return;
    }

    const dateLimite = new Date(newOffre.date_limite);
    const aujourdhui = new Date();
    if (dateLimite < aujourdhui) {
      setError("La date limite doit être dans le futur");
      return;
    }

    setLoading(true);
    await onAdd(newOffre);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content nouvelle-offre-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>✨ Nouvelle offre</h2>
          <p className="modal-subtitle">Créez une nouvelle offre d'emploi</p>
        </div>

        <form onSubmit={handleSubmit} className="nouvelle-offre-form">
          <div className="form-section">
            <h3>Informations principales</h3>
            
            <div className="form-group">
              <label htmlFor="titre">
                Titre de l'offre <span className="required">*</span>
              </label>
              <input
                type="text"
                id="titre"
                placeholder="ex: Développeur React Senior"
                value={newOffre.titre}
                onChange={(e) =>
                  setNewOffre({ ...newOffre, titre: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                placeholder="Décrivez le poste, les missions, le profil recherché..."
                value={newOffre.description}
                onChange={(e) =>
                  setNewOffre({ ...newOffre, description: e.target.value })
                }
                rows="5"
                className="form-textarea"
              />
              <span className="input-hint">
                {newOffre.description.length} caractères (minimum 50 recommandé)
              </span>
            </div>
          </div>

          <div className="form-section">
            <h3>Détails du poste</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lieu">
                  <span className="field-icon">📍</span> Lieu
                </label>
                <input
                  type="text"
                  id="lieu"
                  placeholder="ex: Paris, Télétravail..."
                  value={newOffre.lieu}
                  onChange={(e) =>
                    setNewOffre({ ...newOffre, lieu: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type_contrat">
                  <span className="field-icon">📋</span> Type de contrat
                </label>
                <select
                  id="type_contrat"
                  value={newOffre.type_contrat}
                  onChange={(e) =>
                    setNewOffre({ ...newOffre, type_contrat: e.target.value })
                  }
                  className="form-select"
                >
                  {typesContrat.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salaire">
                  <span className="field-icon">💰</span> Salaire
                </label>
                <input
                  type="text"
                  id="salaire"
                  placeholder="ex: 45-55K€, à négocier..."
                  value={newOffre.salaire}
                  onChange={(e) =>
                    setNewOffre({ ...newOffre, salaire: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_limite">
                  <span className="field-icon">⏰</span> Date limite <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="date_limite"
                  value={newOffre.date_limite}
                  onChange={(e) =>
                    setNewOffre({ ...newOffre, date_limite: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Création...
                </>
              ) : (
                'Créer l\'offre'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function LesOffres() {
  const [offres, setOffres] = useState([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [showNouvelleOffreModal, setShowNouvelleOffreModal] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editedOffre, setEditedOffre] = useState({ 
    titre: "", 
    description: "",
    date_limite: "",
    lieu: "",
    type_contrat: "",
    salaire: ""
  });

  const [selectedOffre, setSelectedOffre] = useState(null);
  const [selectedOffreDetails, setSelectedOffreDetails] = useState(null);
  const [showPostulerModal, setShowPostulerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tout");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  const token = localStorage.getItem("token");

  const typesContrat = ["CDI", "CDD", "Stage", "Alternance", "Freelance"];

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Token invalide :", err);
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }
  }, [token]);

  useEffect(() => {
    if (role) {
      fetchOffres();
    }
  }, [role]);

  const fetchOffres = async () => {
    setLoading(true);
    try {
      const endpoint = role === "RECRUTEUR" ? "mesoffres" : "offres";
      
      const res = await fetch(`http://localhost:3000/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Erreur lors du chargement");
      }

      const data = await res.json();
      setOffres(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des offres");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffre = async (newOffre) => {
    try {
      const res = await fetch("http://localhost:3000/addoffre", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newOffre),
      });

      const data = await res.json();

      if (res.ok) {
        setOffres([data, ...offres]);
        setError("");
        setShowNouvelleOffreModal(false);
        setSuccessMessage("Offre ajoutée avec succès !");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.error || "Erreur lors de l'ajout");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'ajout de l'offre.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/deleteoffre/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setOffres(offres.filter((offre) => offre.id !== id));
        setSuccessMessage("Offre supprimée avec succès !");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    }
  };

  const handleEdit = (offre) => {
    setEditingId(offre.id);
    setEditedOffre({
      titre: offre.titre,
      description: offre.description,
      date_limite: offre.date_limite?.split('T')[0] || "",
      lieu: offre.lieu || "",
      type_contrat: offre.type_contrat || "CDI",
      salaire: offre.salaire || ""
    });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/updateoffre/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedOffre),
      });

      const data = await res.json();

      if (res.ok) {
        setOffres(
          offres.map((offre) =>
            offre.id === id ? data : offre
          )
        );
        setEditingId(null);
        setSuccessMessage("Offre modifiée avec succès !");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.error || "Erreur lors de la modification");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la modification");
    }
  };

  const handleViewDetails = (offre) => {
    setSelectedOffreDetails(offre);
    setShowDetailsModal(true);
  };

  const handlePostuler = (offre) => {
    if (offre.date_limite && new Date(offre.date_limite) < new Date()) {
      setError("Cette offre n'est plus disponible (date limite dépassée)");
      return;
    }
    setSelectedOffre(offre);
    setShowPostulerModal(true);
  };

  const handlePostulerSuccess = () => {
    setSuccessMessage("Candidature envoyée avec succès !");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getOffresFiltrees = () => {
    let filtered = [...offres];

    if (searchTerm) {
      filtered = filtered.filter(offre => 
        offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offre.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offre.lieu && offre.lieu.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filter !== "tout") {
      filtered = filtered.filter(offre => offre.type_contrat === filter);
    }

    filtered.sort((a, b) => {
      switch(sortBy) {
        case "date_asc":
          return new Date(a.date_creation) - new Date(b.date_creation);
        case "date_desc":
          return new Date(b.date_creation) - new Date(a.date_creation);
        case "titre_asc":
          return a.titre.localeCompare(b.titre);
        case "titre_desc":
          return b.titre.localeCompare(a.titre);
        case "date_limite":
          return new Date(a.date_limite) - new Date(b.date_limite);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOffreExpiree = (dateLimite) => {
    if (!dateLimite) return false;
    return new Date(dateLimite) < new Date();
  };

  const truncateDescription = (description, maxLength = 50) => {
    if (!description) return "";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  const offresFiltrees = getOffresFiltrees();

  if (loading) {
    return <div className="loading">Chargement des offres...</div>;
  }

  return (
    <div className="les-offres-container">
      <div className="header-offres">
        <h1>
          {role === "RECRUTEUR" ? "Mes offres" : "Offres disponibles"}
        </h1>
        {role === "RECRUTEUR" && (
          <button
            className="btn-add"
            onClick={() => setShowNouvelleOffreModal(true)}
          >
            + Nouvelle offre
          </button>
        )}
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="tout">Tous</option>
          {typesContrat.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="date_desc">Plus récent</option>
          <option value="date_asc">Plus ancien</option>
          <option value="titre_asc">A-Z</option>
          <option value="titre_desc">Z-A</option>
        </select>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && (
        <div className="error-message-global">{error}</div>
      )}

      <div className="offres-count">
        {offresFiltrees.length} offre(s)
      </div>

      {offresFiltrees.length === 0 ? (
        <p className="no-offres">
          {role === "RECRUTEUR" 
            ? "Aucune offre créée" 
            : "Aucune offre disponible"}
        </p>
      ) : (
        <ul className="offres-list">
          {offresFiltrees.map((offre) => {
            const expiree = isOffreExpiree(offre.date_limite);
            
            return (
              <li key={offre.id} className={`offre-card ${expiree ? 'offre-expiree' : ''}`}>
                {editingId === offre.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editedOffre.titre}
                      onChange={(e) =>
                        setEditedOffre({ ...editedOffre, titre: e.target.value })
                      }
                      placeholder="Titre"
                    />
                    
                    <textarea
                      value={editedOffre.description}
                      onChange={(e) =>
                        setEditedOffre({ ...editedOffre, description: e.target.value })
                      }
                      placeholder="Description"
                      rows="3"
                    />
                    
                    <div className="form-row">
                      <input
                        type="text"
                        value={editedOffre.lieu}
                        onChange={(e) =>
                          setEditedOffre({ ...editedOffre, lieu: e.target.value })
                        }
                        placeholder="Lieu"
                      />
                      
                      <select
                        value={editedOffre.type_contrat}
                        onChange={(e) =>
                          setEditedOffre({ ...editedOffre, type_contrat: e.target.value })
                        }
                      >
                        {typesContrat.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-row">
                      <input
                        type="text"
                        value={editedOffre.salaire}
                        onChange={(e) =>
                          setEditedOffre({ ...editedOffre, salaire: e.target.value })
                        }
                        placeholder="Salaire"
                      />
                      
                      <input
                        type="date"
                        value={editedOffre.date_limite}
                        onChange={(e) =>
                          setEditedOffre({ ...editedOffre, date_limite: e.target.value })
                        }
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="edit-actions">
                      <button
                        onClick={() => handleUpdate(offre.id)}
                        className="btn-save"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-cancel"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="offre-content">
                    {/* Partie gauche - Informations */}
                    <div className="offre-info">
                      <div className="offre-header-compact">
                        <h3>{offre.titre}</h3>
                        {expiree && <span className="badge-expiree">Expirée</span>}
                      </div>
                      
                      <p className="offre-description-simple">
                        {truncateDescription(offre.description)}
                      </p>
                      
                      <div className="offre-details-compact">
                        {offre.lieu && <span>📍 {offre.lieu}</span>}
                        {offre.type_contrat && <span>📋 {offre.type_contrat}</span>}
                        {offre.salaire && <span>💰 {offre.salaire}</span>}
                      </div>
                      
                      {offre.recruteur_nom && role === "CANDIDAT" && (
                        <div className="recruteur-info">👤 {offre.recruteur_nom}</div>
                      )}
                    </div>
                    
                    {/* Partie droite - Actions verticales */}
                    <div className="offre-actions-vertical">
                      <div className="action-buttons-vertical">
                        <button 
                          className="action-icon view-icon"
                          onClick={() => handleViewDetails(offre)}
                          title="Détails"
                        >
                          👁️
                        </button>
                        
                        {role === "RECRUTEUR" && (
                          <>
                            <button 
                              className="action-icon edit-icon"
                              onClick={() => handleEdit(offre)}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-icon delete-icon"
                              onClick={() => handleDelete(offre.id)}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        
                        {role === "CANDIDAT" && (
                          <button
                            onClick={() => handlePostuler(offre)}
                            className="apply-button"
                            disabled={expiree}
                          >
                            {expiree ? "Expirée" : "Postuler"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Modals */}
      {showNouvelleOffreModal && (
        <NouvelleOffreModal
          onClose={() => setShowNouvelleOffreModal(false)}
          onAdd={handleAddOffre}
          typesContrat={typesContrat}
        />
      )}

      {showDetailsModal && selectedOffreDetails && (
        <OffreDetailsModal
          offre={selectedOffreDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOffreDetails(null);
          }}
        />
      )}

      {showPostulerModal && selectedOffre && (
        <PostulerModal
          offreId={selectedOffre.id}
          offreTitre={selectedOffre.titre}
          onClose={() => {
            setShowPostulerModal(false);
            setSelectedOffre(null);
          }}
          onSuccess={handlePostulerSuccess}
        />
      )}
    </div>
  );
}