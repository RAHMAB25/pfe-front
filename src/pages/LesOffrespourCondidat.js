import { useState, useEffect } from "react";

export default function LesOffrespourCondidat() {
  const [offres, setOffres] = useState([]);
  const [search, setSearch] = useState("");

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
  // 🔍 Filter par titre
  const filteredOffres = offres.filter((o) =>
    (o.titre || "").toLowerCase().includes(search.toLowerCase())
  );

  const handlePostuler = async (offreId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:3000/postuler/${offreId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    const data = await res.json();

    if (res.ok) {
      console.log("Candidature réussie :", data);
      alert("Vous avez postulé avec succès !");
    } else {
      console.error("Erreur :", data.error);
      alert(`Erreur : ${data.error}`);
    }

  } catch (err) {
    console.error("Erreur lors de la candidature", err);
    alert("Erreur serveur lors de la candidature");
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
         <button onClick={() => handlePostuler(offre.id)}>Postuler</button>
        </div>
      ))}
    </div>
  );
}