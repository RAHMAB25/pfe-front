import { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import "./LesOffres.css";

// Composant modal pour postuler
const PostulerModal = ({ offreId, offreTitre, onClose, onSuccess }) => {
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier que c'est bien un PDF
      if (file.type === "application/pdf") {
        setCvFile(file);
        setError("");
      } else {
        setError("Veuillez sélectionner un fichier PDF");
        setCvFile(null);
      }
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault(); // ← Vérifiez que ceci est bien présent
  
  console.log("Fichier sélectionné:", cvFile); // Debug
  
  if (!cvFile) {
    setError("CV obligatoire (PDF)");
    return;
  }

  setLoading(true);
  
  // Créer le FormData
  const formData = new FormData();
  formData.append("cv", cvFile);
  
  // Debug : vérifier le contenu du FormData
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]); // Devrait afficher "cv: [object File]"
  }

  try {
    const res = await fetch(`http://localhost:3000/postuler/${offreId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ⚠️ NE METTEZ PAS 'Content-Type' ici
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
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Postuler à l'offre : {offreTitre}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cv">CV (PDF uniquement) :</label>
            <input
              type="file"
              id="cv"
              name="cv"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="file-input"
              required
            />
            <small className="file-hint">Taille max : 5 Mo</small>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="modal-actions">
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-submit"
            >
              {loading ? "Envoi en cours..." : "Postuler"}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-cancel"
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function LesOffres() {
  const [offres, setOffres] = useState([]);
  const [newOffre, setNewOffre] = useState({ titre: "", description: "" });
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editedOffre, setEditedOffre] = useState({ titre: "", description: "" });

  // États pour la candidature
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [showPostulerModal, setShowPostulerModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Décoder le token pour obtenir le rôle
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

  // Charger les offres
  useEffect(() => {
    if (role) {
      fetchOffres();
    }
  }, [role]);

  const fetchOffres = async () => {
    setLoading(true);
    try {
      // Utiliser la route appropriée selon le rôle
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

  const handleAddOffre = async () => {
    if (!newOffre.titre || !newOffre.description) {
      setError("Veuillez remplir le titre et la description !");
      return;
    }

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
        setNewOffre({ titre: "", description: "" });
        setError("");
        setShowForm(false);
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

  const handlePostuler = (offre) => {
    setSelectedOffre(offre);
    setShowPostulerModal(true);
  };

  const handlePostulerSuccess = () => {
    setSuccessMessage("Candidature envoyée avec succès !");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (loading) {
    return <div className="loading">Chargement des offres...</div>;
  }

  return (
    <div className="les-offres-container">
      <div className="header-offres">
        <h1>
          {role === "RECRUTEUR" ? "Mes Offres" : "Offres disponibles"}
        </h1>
        {role === "RECRUTEUR" && (
          <button
            className="btn-add"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Annuler" : "+ Ajouter une offre"}
          </button>
        )}
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {/* Message d'erreur global */}
      {error && (
        <div className="error-message-global">{error}</div>
      )}

      {/* Formulaire ajout (visible uniquement pour recruteurs) */}
      {showForm && role === "RECRUTEUR" && (
        <div className="add-offre-card">
          <h3>Nouvelle offre</h3>
          <input
            type="text"
            placeholder="Titre de l'offre"
            value={newOffre.titre}
            onChange={(e) =>
              setNewOffre({ ...newOffre, titre: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            value={newOffre.description}
            onChange={(e) =>
              setNewOffre({ ...newOffre, description: e.target.value })
            }
            rows="4"
          />
          <div className="form-actions">
            <button onClick={handleAddOffre} className="btn-submit">
              Valider
            </button>
            <button onClick={() => setShowForm(false)} className="btn-cancel">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des offres */}
      {offres.length === 0 ? (
        <p className="no-offres">
          {role === "RECRUTEUR" 
            ? "Vous n'avez pas encore créé d'offres" 
            : "Aucune offre disponible pour le moment"}
        </p>
      ) : (
        <ul className="offres-list">
          {offres.map((offre) => (
            <li key={offre.id} className="offre-card">
              {editingId === offre.id ? (
                // Mode édition
                <div className="edit-form">
                  <input
                    type="text"
                    value={editedOffre.titre}
                    onChange={(e) =>
                      setEditedOffre({
                        ...editedOffre,
                        titre: e.target.value,
                      })
                    }
                    placeholder="Titre"
                  />
                  <textarea
                    value={editedOffre.description}
                    onChange={(e) =>
                      setEditedOffre({
                        ...editedOffre,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description"
                    rows="4"
                  />
                  <div className="offre-actions">
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
                // Mode affichage normal
                <>
                  <h3>{offre.titre}</h3>
                  <p className="offre-description">{offre.description}</p>
                  
                  {/* Afficher le nom du recruteur si disponible (pour les candidats) */}
                  {offre.recruteur_nom && role === "CANDIDAT" && (
                    <p className="offre-recruteur">
                      Publié par : {offre.recruteur_nom}
                    </p>
                  )}
                  
                  <div className="offre-footer">
                    <div className="offre-actions">
                      {role === "RECRUTEUR" ? (
                        // Actions recruteur
                        <>
                          <button
                            onClick={() => handleEdit(offre)}
                            className="btn-edit"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(offre.id)}
                            className="btn-delete"
                          >
                            Supprimer
                          </button>
                        </>
                      ) : role === "CANDIDAT" ? (
                        // Actions candidat
                        <button
                          onClick={() => handlePostuler(offre)}
                          className="btn-apply"
                        >
                          Postuler
                        </button>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Modal de candidature */}
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