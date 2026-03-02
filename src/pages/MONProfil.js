import { useState, useEffect } from "react";
import { 
  FaUser, FaFile, FaSave, FaSpinner, FaCheckCircle,
  FaExclamationTriangle, FaCloudUploadAlt, FaEye, 
  FaBars, FaTimes, FaTrash
} from "react-icons/fa";
import "./Condidat.css";

export default function MonProfil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({
    nom: "",
    prénom: "",
    email: "",
    téléphone: "",
    domaine: "",
    localisation: "",
    cv: "", // Changed from cvFilename to match database field
    bio: "Décrivez votre parcours et vos objectifs..."
  });
  
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  
  const [progression, setProgression] = useState(85);
  const [showCvBar, setShowCvBar] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:3000/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        // Add bio if not present
        const userData = {
          ...data,
          bio: data.bio || "Décrivez votre parcours et vos objectifs..."
        };
        
        setUser(userData);
        // Calculer progression
        calculerProgression(userData);
      } catch (err) {
        console.error(err);
        showNotification("error", "Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const calculerProgression = (data) => {
    let count = 0;
    let total = 7; // Nombre total de champs à vérifier
    if (data.nom) count++;
    if (data.prénom) count++;
    if (data.email) count++;
    if (data.téléphone) count++;
    if (data.localisation) count++;
    if (data.domaine) count++;
    if (data.cv) count++; // Changed from cvFilename to cv
    setProgression(Math.round((count / total) * 100));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 5000);
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      showNotification("error", "Veuillez sélectionner un fichier PDF");
      e.target.value = null;
      return;
    }
    setCvFile(file);
  };

  const handleRemoveCV = () => {
    setCvFile(null);
  };

  const handleDeleteCV = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch("http://localhost:3000/delete-cv", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression du CV");
      
      setUser({ ...user, cv: "" });
      showNotification("success", "CV supprimé avec succès");
      calculerProgression({ ...user, cv: "" });
    } catch (err) {
      console.error(err);
      showNotification("error", err.message || "Erreur lors de la suppression");
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    
    try {
      // Update profile without CV first
      const profileRes = await fetch("http://localhost:3000/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          nom: user.nom,
          prénom: user.prénom,
          email: user.email,
          téléphone: user.téléphone,
          domaine: user.domaine,
          localisation: user.localisation
        })
      });

      if (!profileRes.ok) throw new Error("Erreur lors de la mise à jour du profil");

      // Upload new CV if selected
      if (cvFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("cv", cvFile);
        
        const uploadRes = await fetch("http://localhost:3000/upload-cv", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (!uploadRes.ok) throw new Error("Erreur lors de l'upload du CV");
        
        const data = await uploadRes.json();
        setUser((prev) => ({ ...prev, cv: data.filename }));
        setCvFile(null);
        setUploading(false);
      }

      showNotification("success", "Profil mis à jour avec succès !");
      calculerProgression(user);
    } catch (err) {
      console.error(err);
      showNotification("error", err.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const toggleCvBar = () => {
    setShowCvBar(!showCvBar);
  };

  if (loading) {
    return (
      <div className="profil-loading-container">
        <div className="profil-loading-content">
          <FaSpinner className="profil-loading-spinner" />
          <p className="profil-loading-text">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-app-container">
      {/* Notification */}
      {notification.show && (
        <div className={`profil-notification alert alert-${notification.type === 'success' ? 'success' : 'danger'}`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Sidebar - version ultra simplifiée */}
      <div className={`profil-sidebar ${sidebarOpen ? 'open' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="profil-sidebar-header">
          <div className="profil-logo">SmartHire</div>
          <button className="profil-sidebar-close" onClick={() => setMobileMenuOpen(false)}>
            <FaTimes />
          </button>
        </div>
        
        <div className="profil-sidebar-user">
          <div className="profil-sidebar-avatar">
            <FaUser />
          </div>
          <div className="profil-sidebar-user-info">
            <h4>{user.prénom} {user.nom}</h4>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profil-sidebar-stats">
          <div className="profil-stat-item">
            <span className="profil-stat-label">Profil actif</span>
            <span className="profil-stat-badge active">Actif</span>
          </div>
          <div className="profil-stat-item">
            <span className="profil-stat-label">Profil complété</span>
            <span className="profil-stat-value">{progression}%</span>
          </div>
          <div className="profil-progress-bar">
            <div className="profil-progress-fill" style={{ width: `${progression}%` }}></div>
          </div>
        </div>

        {/* Mini barre CV dans le sidebar */}
        {showCvBar && (
          <div className="profil-sidebar-cv-mini">
            <div className="profil-sidebar-cv-header">
              <FaFile className="profil-sidebar-cv-icon" />
              <span className="profil-sidebar-cv-title">Mon CV</span>
              <button className="profil-sidebar-cv-close" onClick={toggleCvBar}>
                <FaTimes />
              </button>
            </div>
            
            {(cvFile || user.cv) ? (
              <div className="profil-sidebar-cv-content">
                <div className="profil-sidebar-cv-file">
                  <FaFile />
                  <span className="profil-sidebar-cv-name">
                    {cvFile ? cvFile.name : user.cv}
                  </span>
                </div>
                <div className="profil-sidebar-cv-actions">
                  {user.cv && (
                    <a 
                      href={`http://localhost:3000/uploads/${user.cv}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="profil-sidebar-cv-view"
                    >
                      <FaEye />
                    </a>
                  )}
                  {user.cv && !cvFile && (
                    <button 
                      onClick={handleDeleteCV} 
                      className="profil-sidebar-cv-delete"
                      title="Supprimer le CV"
                    >
                      <FaTrash />
                    </button>
                  )}
                  {cvFile && (
                    <button 
                      onClick={handleRemoveCV} 
                      className="profil-sidebar-cv-delete"
                      title="Annuler"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="profil-sidebar-cv-empty">
                <p>Aucun CV téléchargé</p>
                <label className="profil-sidebar-cv-upload-btn">
                  <FaCloudUploadAlt />
                  Uploader
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Bouton pour réouvrir la barre CV si elle est fermée */}
        {!showCvBar && (
          <button className="profil-sidebar-cv-toggle" onClick={toggleCvBar}>
            <FaFile /> Afficher mon CV
          </button>
        )}

        <div className="profil-sidebar-footer"></div>
      </div>

      {/* Main Content */}
      <div className={`profil-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile Header */}
        <div className="profil-mobile-header">
          <button className="profil-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
            <FaBars />
          </button>
          <div className="profil-mobile-logo">SmartHire</div>
        </div>

        {/* Contenu principal */}
        <div className="profil-content-wrapper">
          {/* En-tête avec email */}
          <div className="profil-header-card">
            <div className="profil-header-info">
              <h2>{user.email}</h2>
              <div className="profil-header-badge">
                <span className="profil-badge-dot"></span>
                Profil actif
              </div>
            </div>
            <div className="profil-header-progress">
              <span>Profil complété</span>
              <span className="profil-header-percent">{progression}%</span>
            </div>
          </div>

          {/* Grille principale - UNE SEULE COLONNE */}
          <div className="profil-grid-single">
            {/* Informations personnelles */}
            <div className="profil-card">
              <div className="profil-card-header">
                <h3>Informations personnelles</h3>
              </div>
              
              <div className="profil-info-list">
                <div className="profil-info-item">
                  <span className="profil-info-label">Nom complet</span>
                  <span className="profil-info-value">{user.nom} {user.prénom}</span>
                </div>
                <div className="profil-info-item">
                  <span className="profil-info-label">Email</span>
                  <span className="profil-info-value">{user.email}</span>
                </div>
                <div className="profil-info-item">
                  <span className="profil-info-label">Téléphone</span>
                  <span className="profil-info-value">{user.téléphone || "Non renseigné"}</span>
                </div>
                <div className="profil-info-item">
                  <span className="profil-info-label">Ville</span>
                  <span className="profil-info-value">{user.localisation || "Non renseigné"}</span>
                </div>
                <div className="profil-info-item">
                  <span className="profil-info-label">Poste recherché</span>
                  <span className="profil-info-value">{user.domaine || "Non renseigné"}</span>
                </div>
              </div>

              <div className="profil-bio-section">
                <span className="profil-info-label">À propos de moi</span>
                <textarea 
                  className="profil-bio-textarea"
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="profil-card-actions">
                <button className="profil-btn-save" onClick={handleUpdate} disabled={saving || uploading}>
                  {saving || uploading ? <FaSpinner className="spin" /> : <FaSave />}
                  {saving ? "Sauvegarde..." : uploading ? "Upload CV..." : "Sauvegarder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}