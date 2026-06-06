// TableauB.jsx - Version complète corrigée
import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';
import jwtDecode from "jwt-decode";
import "./TableauB.css";

export default function TableauDeBord() {
  const [offres, setOffres] = useState([]);
  const [topOffres, setTopOffres] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [statsGlobales, setStatsGlobales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recruteurNom, setRecruteurNom] = useState('');

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const chartColors = {
    grid: '#E5E7EB',
    text: '#6B7280',
    barPrimary: '#4B5563',
    barSecondary: '#8A9AA8',
    linePrimary: '#4B5563',
    lineSecondary: '#8A9AA8',
    tooltipBg: '#FFFFFF',
    tooltipBorder: '#E5E7EB'
  };

  useEffect(() => {
    if (decoded?.role === "RECRUTEUR") {
      fetchAllData();
      
      // Récupérer le nom complet du recruteur depuis le token
      if (decoded.prenom && decoded.nom) {
        setRecruteurNom(`${decoded.prenom} ${decoded.nom}`);
      } else if (decoded.prenom) {
        setRecruteurNom(decoded.prenom);
      } else if (decoded.nom) {
        setRecruteurNom(decoded.nom);
      } else {
        setRecruteurNom('Recruteur');
      }
    }
  }, [token]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [offresRes, topRes, evolutionRes, statsRes] = await Promise.all([
        fetch("http://localhost:3000/recruteur/offres-analyse", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/recruteur/top-offres", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/recruteur/evolution-candidatures", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/recruteur/stats-globales", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const offresData = await offresRes.json();
      const topData = await topRes.json();
      const evolutionData = await evolutionRes.json();
      const statsData = await statsRes.json();

      setOffres(offresData);
      setTopOffres(topData);
      setEvolution(evolutionData);
      setStatsGlobales(statsData);
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header avec nom du recruteur */}
      <div className="header">
        <div>
          <h1>Tableau de bord</h1>
          <p className="subtitle">Bonjour {recruteurNom}</p>
        </div>
        {statsGlobales && (
          <div className="stats">
            <div className="stat">
              <span className="stat-number">{statsGlobales.total_offres}</span>
              <span className="stat-label">offres</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">{statsGlobales.total_candidatures}</span>
              <span className="stat-label">candidatures</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">{statsGlobales.taux_acceptation}%</span>
              <span className="stat-label">acceptation</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">{statsGlobales.moyenne_candidatures_par_offre}</span>
              <span className="stat-label">moy/offre</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Aperçu
        </button>
        <button 
          className={`tab ${activeTab === 'offres' ? 'active' : ''}`}
          onClick={() => setActiveTab('offres')}
        >
          Mes offres
        </button>
      </div>

      {/* Vue Aperçu */}
      {activeTab === 'overview' && (
        <>
          <div className="card">
            <div className="card-header">
              <h3>Offres les plus demandées</h3>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={topOffres}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis 
                  dataKey="titre" 
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-40}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    fontSize: 12
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Bar 
                  dataKey="total_candidatures" 
                  name="Candidatures" 
                  fill={chartColors.barPrimary}
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Bar 
                  dataKey="acceptees" 
                  name="Acceptées" 
                  fill={chartColors.barSecondary}
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Évolution des candidatures</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={evolution}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis 
                  dataKey="mois" 
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Line 
                  type="monotone" 
                  dataKey="nombre_candidatures" 
                  name="Candidatures" 
                  stroke={chartColors.linePrimary} 
                  strokeWidth={1.8}
                  dot={{ r: 3, fill: chartColors.linePrimary, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="acceptees" 
                  name="Acceptées" 
                  stroke={chartColors.lineSecondary} 
                  strokeWidth={1.8}
                  dot={{ r: 3, fill: chartColors.lineSecondary, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Vue Mes offres */}
      {activeTab === 'offres' && (
        <div className="offres">
          {offres.length === 0 ? (
            <div className="empty">
              <p>Aucune offre publiée</p>
            </div>
          ) : (
            offres.map((offre) => {
              // Déterminer la classe du badge
              let countClass = '';
              if (offre.total_candidatures >= 20) countClass = 'high';
              else if (offre.total_candidatures >= 10) countClass = 'medium';
              else if (offre.total_candidatures > 0) countClass = 'low';
              
              return (
                <div key={offre.id} className="offre">
                  <div className="offre-header">
                    <div>
                      <h4>{offre.titre}</h4>
                      <span className="offre-date">Publiée le {formatDate(offre.date_creation)}</span>
                    </div>
                    <span className={`offre-count ${countClass}`}>
                      {offre.total_candidatures || 0} candidature(s)
                    </span>
                  </div>
                  <p className="offre-description">{offre.description}</p>
                  <div className="offre-stats">
                    <span className="stat-waiting">⏳ En attente: <strong>{offre.en_attente || 0}</strong></span>
                    <span className="stat-accepted">✅ Acceptées: <strong>{offre.acceptees || 0}</strong></span>
                    <span className="stat-rejected">❌ Refusées: <strong>{offre.refusees || 0}</strong></span>
                    <span className="stat-rate">📊 Taux: <strong>{offre.taux_acceptation || 0}%</strong></span>
                  </div>
                  <div className="offre-progress">
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${offre.taux_acceptation || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}