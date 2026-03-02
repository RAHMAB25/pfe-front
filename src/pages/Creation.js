import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Creation.css";

/* ---------------- ICONES ---------------- */

const CandidatIcon = () => (
  <svg viewBox="0 0 24 24" className="role-icon">
    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.5 0-6 2-6 4v2h12v-2c0-2-2.5-4-6-4z"/>
    <path d="M20 7l-2-2-6 6-3-3-2 2 5 5 8-8z" fill="#4CAF50"/>
  </svg>
);

const RecruteurIcon = () => (
  <svg viewBox="0 0 24 24" className="role-icon">
    <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z"/>
    <circle cx="12" cy="15" r="2" fill="#FFC107"/>
    <path d="M17 19H7v-1c0-1.5 2-3 5-3s5 1.5 5 3v1z" fill="#2196F3"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <path d="M17 9h-1V7a4 4 0 10-8 0v2H7a2 2 0 00-2 2v9h14v-9a2 2 0 00-2-2zm-6 0V7a2 2 0 114 0v2h-4z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11 11 0 003.4.54 1 1 0 011 1V20a1 1 0 01-1 1C10.3 21 3 13.7 3 4a1 1 0 011-1h2.5a1 1 0 011 1c0 1.2.2 2.3.5 3.4a1 1 0 01-.2 1L6.6 10.8z"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <path d="M20 4H4a2 2 0 00-2 2v.5l10 6 10-6V6a2 2 0 00-2-2z"/>
    <path d="M22 8.5l-10 6-10-6V18a2 2 0 002 2h16a2 2 0 002-2V8.5z"/>
  </svg>
);

const DomainIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <path d="M9 6V5a3 3 0 016 0v1h4a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h4zm2 0h2V5a1 1 0 10-2 0v1z" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/>
  </svg>
);

/* ---------------- COMPONENT ---------------- */

function Creation() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [prénom, setPrénom] = useState("");
  const [email, setEmail] = useState("");
  const [téléphone, setTéléphone] = useState("");
  const [domaine, setDomaine] = useState("");
  const [localisation, setLocalisation] = useState("");
  
  // Choix unique - CANDIDAT sélectionné par défaut
  const [role, setRole] = useState("CANDIDAT");

  const [motdepasse, setMotdepasse] = useState("");
  const [confirmMotdepasse, setConfirmMotdepasse] = useState("");
  const [error, setError] = useState("");

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("");

  const [cvFile, setCvFile] = useState(null);

  // 🔹 Gestion force mot de passe
  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length > 5) score += 20;
    if (password.length > 8) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    return score;
  };

  useEffect(() => {
    const score = calculateStrength(motdepasse);
    setPasswordStrength(score);
    if (score === 0) setStrengthLabel("");
    else if (score < 50) setStrengthLabel("Faible");
    else if (score < 80) setStrengthLabel("Moyen");
    else setStrengthLabel("Fort");
  }, [motdepasse]);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  // 🔹 Gestion upload fichier - SANS limite de taille
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification du type PDF uniquement (sans limite de taille)
    if (file.type !== "application/pdf") {
      alert("Veuillez sélectionner un fichier PDF");
      e.target.value = null;
      return;
    }
    
    setCvFile(file);
    console.log("Fichier sélectionné:", file.name, "Taille:", file.size);
  };

  // 🔹 Validation formulaire + envoi
  // Dans la fonction handleSubmit, ajoutez plus de logs
const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("=== DÉBUT SOUMISSION FORMULAIRE ===");
  console.log("Données du formulaire avant envoi:");
  console.log("nom:", nom);
  console.log("prénom:", prénom);
  console.log("email:", email);
  console.log("téléphone:", téléphone);
  console.log("domaine:", domaine);
  console.log("localisation:", localisation);
  console.log("role:", role);
  console.log("cvFile:", cvFile ? cvFile.name : "aucun");

  // validations
  if (!validatePassword(motdepasse)) {
    setError("Mot de passe invalide...");
    return;
  }
  if (motdepasse !== confirmMotdepasse) {
    setError("Les mots de passe ne correspondent pas !");
    return;
  }
  if (!role) {
    setError("Veuillez sélectionner un rôle !");
    return;
  }
  if (role === "CANDIDAT" && !cvFile) {
    setError("Le CV est obligatoire pour les candidats !");
    return;
  }

  const formData = new FormData();
  formData.append("nom", nom);
  formData.append("surname", prénom);  // ← Bien avec l'accent
  formData.append("email", email);
  formData.append("tel", téléphone);
  formData.append("domaine", domaine);
  formData.append("localisation", localisation);
  formData.append("mot_de_passe", motdepasse);
  formData.append("role", role);
  if (cvFile) formData.append("cv", cvFile);
  console.log("🚀 ~ handleSubmit ~ formData:", formData)

  // Afficher le contenu de FormData pour déboguer
  console.log("=== CONTENU DE FORMDATA ===");
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + (pair[0] === 'cv' ? pair[1].name : pair[1]));
  }
  try {
    const response = await fetch("http://localhost:3000/adduser", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    console.log("Réponse du serveur:", data);
    
    if (response.ok) {
      alert("Compte créé avec succès !");
      navigate("/");
    } else {
      setError(data.error || "Erreur lors de la création du compte");
    }

  } catch (error) {
    console.error("Erreur lors de la création du compte:", error);
    alert("Erreur lors de la création du compte");
  }
};
    
  return (
    <div className="creation-container">
      <div className="creation-card">
        <button className="back-btn" onClick={() => navigate("/")}>
          ←
        </button>

        <h1>Créer votre compte</h1>
        <p className="subtitle">Remplissez le formulaire ci-dessous</p>

        <form onSubmit={handleSubmit} className="creation-form">
          
          {/* ⭐ Rôles en PREMIER - Radio buttons (choix unique) */}
          <div className="role-container full">
            <div className="role-options">
              <label className={`role-card ${role === "CANDIDAT" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="CANDIDAT"
                  checked={role === "CANDIDAT"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <div className="role-content">
                  <CandidatIcon />
                  <span>Candidat</span>
                </div>
              </label>
              <label className={`role-card ${role === "RECRUTEUR" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="RECRUTEUR"
                  checked={role === "RECRUTEUR"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <div className="role-content">
                  <RecruteurIcon />
                  <span>Recruteur</span>
                </div>
              </label>
            </div>
          </div>

          {/* Ligne 1 - Nom et Prénom */}
          <div className="form-group">
            <UserIcon />
            <input
              type="text"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <UserIcon />
            <input
              type="text"
              placeholder="Prénom"
              value={prénom}
              onChange={(e) => setPrénom(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* Ligne 2 - Email et Téléphone */}
          <div className="form-group">
            <EmailIcon />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <PhoneIcon />
            <input
              type="tel"
              placeholder="Téléphone"
              value={téléphone}
              onChange={(e) => setTéléphone(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* Ligne 3 - Domaine et Localisation */}
          <div className="form-group">
            <DomainIcon />
            <input
              type="text"
              placeholder="Domaine"
              value={domaine}
              onChange={(e) => setDomaine(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <LocationIcon />
            <input
              type="text"
              placeholder="Localisation"
              value={localisation}
              onChange={(e) => setLocalisation(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* Ligne 4 - Mot de passe et Confirmation */}
          <div className="form-group">
            <LockIcon />
            <input
              type="password"
              placeholder="Mot de passe"
              value={motdepasse}
              onChange={(e) => setMotdepasse(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <LockIcon />
            <input
              type="password"
              placeholder="Confirmer"
              value={confirmMotdepasse}
              onChange={(e) => setConfirmMotdepasse(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* Force du mot de passe - centrée */}
          {motdepasse && (
            <>
              <div className="password-strength-container full">
                <div className="strength-bar" style={{ width: `${passwordStrength}%` }}></div>
              </div>
              <div className="strength-text full">{strengthLabel}</div>
            </>
          )}

          {/* CV pour candidat - affiché seulement si le rôle CANDIDAT est sélectionné */}
         {role === "CANDIDAT" && (
  <div className="form-group full cv-compact-container">
    <div className="cv-compact">
      <span className="cv-label">CV (PDF)</span>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange}
        className="cv-file-input"
      />
    </div>
  </div>
)}
          
          {error && <p className="error-message full">{error}</p>}

          <button type="submit" className="submit-btn full">
            Créer mon compte
          </button>
        </form>
      </div>
    </div>
  );
}

export default Creation;