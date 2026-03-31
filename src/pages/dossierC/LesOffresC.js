import { useState, useEffect, useRef } from "react";
import { 
  FaSearch, 
  FaTimes, 
  FaBuilding, 
  FaCalendarAlt,
  FaFilePdf,
  FaCheckCircle,
  FaClock,
  FaFilter,
  FaSortAmountDown,
  FaBriefcase,
  FaUserTie,
  FaChevronDown 
} from "react-icons/fa";
import { MdWork, MdOutlineUploadFile } from "react-icons/md";
import "./LesOffresC.css";

export default function LesOffresC() {
  const [offres, setOffres] = useState([]);
  const [search, setSearch] = useState("");
  const [postulatingId, setPostulatingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [currentOffreId, setCurrentOffreId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [applications, setApplications] = useState({});
  const [stats, setStats] = useState({ total: 0, postulees: 0 });
  const [filterWeek, setFilterWeek] = useState(false); // Nouvel état pour le filtre semaine
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOffres = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:3000/offres", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          // Trier par défaut par date récente
          const sortedData = [...data].sort((a, b) => 
            new Date(b.date_publication) - new Date(a.date_publication)
          );
          setOffres(sortedData);
          setStats(prev => ({ ...prev, total: data.length }));
          checkExistingApplications(data);
        } else {
          setOffres([]);
        }
      } catch (err) {
        console.error("ERROR:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffres();
  }, [token]);

  const checkExistingApplications = async (offresList) => {
    try {
      const applicationsState = {};
      let postuleesCount = 0;
      
      await Promise.all(offresList.map(async (offre) => {
        try {
          const res = await fetch(`http://localhost:3000/check-application/${offre.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.ok) {
            const data = await res.json();
            applicationsState[offre.id] = data.hasApplied;
            if (data.hasApplied) postuleesCount++;
          }
        } catch (err) {
          console.error(`Erreur vérification offre ${offre.id}:`, err);
          applicationsState[offre.id] = false;
        }
      }));
      
      setApplications(applicationsState);
      setStats(prev => ({ ...prev, postulees: postuleesCount }));
    } catch (err) {
      console.error("Erreur vérification candidatures:", err);
    }
  };

  // Fonction pour vérifier si une date est dans la dernière semaine
  const isInLastWeek = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= oneWeekAgo;
  };

  // Filtrer et trier les offres
  const getFilteredAndSortedOffres = () => {
    let filtered = offres.filter((o) => 
      (o.titre || "").toLowerCase().includes(search.toLowerCase())
    );

    // Appliquer le filtre semaine si activé
    if (filterWeek) {
      filtered = filtered.filter(o => isInLastWeek(o.date_publication));
    }

    // Trier par date récente (toujours)
    filtered.sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication));

    return filtered;
  };

  const filteredOffres = getFilteredAndSortedOffres();

  // Fonction pour basculer le filtre semaine
  const toggleWeekFilter = () => {
    setFilterWeek(!filterWeek);
  };

  const openCVModal = (offreId) => {
    setCurrentOffreId(offreId);
    setShowCVModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowCVModal(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setCurrentOffreId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    document.body.style.overflow = 'unset';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("❌ Seuls les fichiers PDF sont acceptés");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Le fichier ne doit pas dépasser 5 Mo");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePostuler = async () => {
    if (!selectedFile) {
      alert("Veuillez sélectionner un CV (format PDF)");
      return;
    }

    try {
      setPostulatingId(currentOffreId);
      
      const formData = new FormData();
      formData.append("cv", selectedFile);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const res = await fetch(`http://localhost:3000/postuler/${currentOffreId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await res.json();

      if (res.ok) {
        setApplications(prev => ({
          ...prev,
          [currentOffreId]: true
        }));
        setStats(prev => ({ ...prev, postulees: prev.postulees + 1 }));
        
        alert("✅ Candidature envoyée avec succès !");
        closeModal();
      } else {
        alert(`Erreur : ${data.error || data.details || "Une erreur est survenue"}`);
      }
    } catch (err) {
      console.error("Erreur lors de la candidature:", err);
      alert("❌ Erreur serveur lors de la candidature");
    } finally {
      setPostulatingId(null);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateDescription = (description, maxLength = 150) => {
    if (!description) return "";
    if (description.length <= maxLength) return description;
    return description.substr(0, maxLength) + '...';
  };

  return (
    <div className="les-offres-container">
      {/* Header avec stats */}
      {/* Header organisé */}
<div className="page-header">
  {/* Ligne 1 : Titre et stats */}
  <div className="header-row">
    <div className="header-left">
      <h1 className="page-title">
        <MdWork className="title-icon" />
        Offres d'emploi
      </h1>
      
      <div className="header-stats">
        <div className="stat-item">
          <FaBriefcase className="stat-icon" />
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <FaCheckCircle className="stat-icon" style={{ color: '#10B981' }} />
          <span className="stat-label">Postulées</span>
          <span className="stat-value">{stats.postulees}</span>
        </div>
      </div>
    </div>
  </div>

  {/* Ligne 2 : Recherche, filtre et informations */}
  <div className="header-row">
    <div className="search-filter-group">
      <div className="search-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher par titre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {search && (
          <button className="clear-search" onClick={() => setSearch("")}>
            <FaTimes />
          </button>
        )}
      </div>
      
      <button 
        className={`filter-btn ${filterWeek ? 'active' : ''}`}
        onClick={toggleWeekFilter}
        title="Dernière semaine"
      >
        <FaFilter />
        <span>Dernière semaine</span>
      </button>
    </div>

    <div className="info-group">
      <div className="sort-info">
        <span className="sort-icon">☰</span>
        <FaChevronDown className="sort-arrow" />
        <span>{filteredOffres.length} offres</span>
      </div>
      
      {filterWeek && (
        <div className="active-filter">
          <FaClock />
          <span>Dernière semaine</span>
          <button onClick={() => setFilterWeek(false)}>
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  </div>
</div>

      {/* Barre d'information sur le tri et le filtre */}
      {/* Barre d'information sur le tri */}
<div className="sort-info-bar">
  <div className="sort-info-left">
    <span className="sort-icon-menu">☰</span>
    <FaChevronDown className="sort-arrow" />
    <span className="sort-text">
      {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} trouvée{filteredOffres.length > 1 ? 's' : ''}
    </span>
    {filterWeek && (
      <span className="filter-badge">
        <FaClock className="me-1" />
        Dernière semaine
        <button className="remove-filter" onClick={() => setFilterWeek(false)}>
          <FaTimes />
        </button>
      </span>
    )}
  </div>
</div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des offres...</p>
        </div>
      ) : filteredOffres.length === 0 ? (
        <div className="empty-state">
          <FaSearch className="empty-icon" />
          <h3>Aucune offre trouvée</h3>
          <p>Essayez de modifier vos critères de recherche</p>
          {(search || filterWeek) && (
            <div className="empty-actions">
              {search && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearch("")}
                >
                  Effacer la recherche
                </button>
              )}
              {filterWeek && (
                <button 
                  className="clear-filter-btn"
                  onClick={() => setFilterWeek(false)}
                >
                  Désactiver le filtre semaine
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="offres-grid">
          {filteredOffres.map((offre) => {
            const hasApplied = applications[offre.id];
            
            return (
              <div key={offre.id} className="offre-card">
                <div className="offre-card-header">
                  <div className="offre-title-wrapper">
                    <h3 className="offre-title">{offre.titre}</h3>
                    {hasApplied && (
                      <div className="applied-indicator">
                        <FaCheckCircle className="applied-indicator-icon" />
                        <span>Déjà postulé</span>
                      </div>
                    )}
                  </div>
                  
                  {!hasApplied && (
                    <button
                      className="btn-postuler-top"
                      onClick={() => openCVModal(offre.id)}
                      disabled={postulatingId === offre.id}
                    >
                      {postulatingId === offre.id ? (
                        <>
                          <span className="spinner-small"></span>
                          Envoi...
                        </>
                      ) : (
                        <>
                          <MdOutlineUploadFile className="btn-icon-small" />
                          Postuler
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Recruteur */}
                <div className="offre-recruiter">
                  <div className="recruiter-avatar">
                    <FaUserTie />
                  </div>
                  <div className="recruiter-info">
                    <span className="recruiter-label">Recruteur</span>
                    <span className="recruiter-name">{offre.recruteur_nom || "Anonyme"}</span>
                  </div>
                </div>
                
                {/* Date de publication */}
                <div className="offre-date-section">
                  <FaCalendarAlt className="date-icon" />
                  <span className="date-text">
                    {formatDate(offre.date_publication)}
                  </span>
                </div>
                
                {/* Description */}
                <p className="offre-description">
                  {truncateDescription(offre.description)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal pour uploader le CV */}
      {showCVModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <div className="modal-header-custom">
              <div className="modal-icon">
                <FaFilePdf />
              </div>
              <div>
                <h3>Uploader votre CV</h3>
                <p className="modal-subtitle">
                  Format accepté : <strong>PDF</strong> (max 5 Mo)
                </p>
              </div>
            </div>
            
            <div className="file-upload-area">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                id="cv-upload"
                className="file-input"
              />
              
              {!selectedFile ? (
                <label htmlFor="cv-upload" className="file-label">
                  <div className="upload-icon-container">
                    <MdOutlineUploadFile className="upload-icon" />
                  </div>
                  <span className="upload-text">
                    <strong>Cliquez pour parcourir</strong>
                    <span className="upload-hint">ou glissez-déposez votre fichier PDF</span>
                  </span>
                  <span className="browse-button">Choisir un fichier</span>
                </label>
              ) : (
                <div className="file-selected-preview">
                  <div className="file-info">
                    <div className="file-icon">
                      <FaFilePdf />
                    </div>
                    <div className="file-details">
                      <strong className="file-name">{selectedFile.name}</strong>
                      <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} Mo</span>
                    </div>
                  </div>
                  <button 
                    className="file-change-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="progress-container">
                <div className="progress-header">
                  <span className="progress-label">Upload en cours...</span>
                  <span className="progress-percentage">{uploadProgress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="btn-submit"
                onClick={handlePostuler} 
                disabled={!selectedFile || postulatingId === currentOffreId}
              >
                {postulatingId === currentOffreId ? (
                  <>
                    <span className="spinner-small"></span>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <MdOutlineUploadFile />
                    Envoyer ma candidature
                  </>
                )}
              </button>
              <button className="btn-cancel" onClick={closeModal}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}