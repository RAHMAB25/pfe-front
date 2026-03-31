import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import "./TableauB.css";

export default function TableauDeBord() {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  useEffect(() => {
    const fetchOffres = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/mesoffres", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setOffres(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (decoded?.role === "RECRUTEUR") {
      fetchOffres();
    }
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bienvenue 👋</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="card">
          <h3>Total Offres</h3>
          <p>{offres.length}</p>
        </div>

        <div className="card">
          <h3>Dernière Offre</h3>
          <p>
            {offres.length > 0
              ? offres[0].titre
              : "Aucune offre"}
          </p>
        </div>
      </div>

      {/* Liste des offres */}
      <div className="recent-offres">
        <h2>Mes dernières offres</h2>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement...</p>
          </div>
        ) : offres.length === 0 ? (
          <p className="empty-message">Aucune offre publiée</p>
        ) : (
          offres.slice(0, 5).map((offre, index) => (
            <div key={offre.id || index} className="offre-item">
              <h4>{offre.titre}</h4>
              <p className="offre-date">Publiée le {formatDate(offre.date_publication)}</p>
              <p className="offre-description">{offre.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}