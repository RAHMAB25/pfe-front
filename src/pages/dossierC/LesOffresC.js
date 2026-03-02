import { useState, useEffect, useRef } from "react";
import "./LesOffresC.css";

export default function LesOffresC() {
  const [offres, setOffres] = useState([]);
  const [search, setSearch] = useState("");
  const [postulatingId, setPostulatingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [currentOffreId, setCurrentOffreId] = useState(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const res = await fetch("http://localhost:3000/offres", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setOffres(data);
        } else {
          setOffres([]);
        }
      } catch (err) {
        console.error("ERROR:", err);
      }
    };

    fetchOffres();
  }, [token]);

  const filteredOffres = offres.filter((o) =>
    (o.titre || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCVModal = (offreId) => {
    setCurrentOffreId(offreId);
    setShowCVModal(true);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePostuler = async () => {
    if (!selectedFile) {
      alert("Veuillez sélectionner un CV (format PDF)");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      alert("Seuls les fichiers PDF sont acceptés");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 5 Mo");
      return;
    }

    try {
      setPostulatingId(currentOffreId);
      
      const formData = new FormData();
      formData.append("cv", selectedFile);

      const res = await fetch(`http://localhost:3000/postuler/${currentOffreId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Ne PAS mettre Content-Type ici, le navigateur le définira automatiquement avec la boundary
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Candidature envoyée avec succès !");
        setShowCVModal(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert(`Erreur : ${data.error || data.details || "Une erreur est survenue"}`);
        console.error("Détails:", data);
      }
    } catch (err) {
      console.error("Erreur lors de la candidature", err);
      alert("❌ Erreur serveur lors de la candidature");
    } finally {
      setPostulatingId(null);
      setCurrentOffreId(null);
    }
  };

  return (
    <div className="les-offres-container">
      <input
        type="text"
        placeholder="🔍 Rechercher par titre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {filteredOffres.length === 0 && <p>Aucune offre trouvée</p>}

      {filteredOffres.map((offre) => (
        <div key={offre.id} className="offre-card">
          <h3>{offre.titre}</h3>
          <p>{offre.description}</p>
          <p>
            <b>Recruteur:</b> {offre.recruteur_nom}
          </p>
          <button 
            onClick={() => openCVModal(offre.id)}
            disabled={postulatingId === offre.id}
          >
            {postulatingId === offre.id ? "Envoi en cours..." : "Postuler"}
          </button>
        </div>
      ))}

      {/* Modal pour uploader le CV */}
      {showCVModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Uploader votre CV</h3>
            <p>Format accepté : PDF (max 5 Mo)</p>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <div className="modal-actions">
              <button onClick={handlePostuler} disabled={!selectedFile}>
                Envoyer ma candidature
              </button>
              <button onClick={() => {
                setShowCVModal(false);
                setSelectedFile(null);
                setCurrentOffreId(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}