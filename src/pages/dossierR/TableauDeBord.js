// TableauB.jsx - Version sans le graphique des offres les moins demandées
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

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  // Configuration des couleurs en niveaux de gris
  const chartColors = {
    grid: '#E5E7EB',        // gray-200
    text: '#6B7280',        // gray-500
    barPrimary: '#374151',  // gray-700
    barSecondary: '#9CA3AF', // gray-400
    linePrimary: '#374151',  // gray-700
    lineSecondary: '#6B7280', // gray-500
    tooltipBg: '#FFFFFF',
    tooltipBorder: '#E5E7EB'
  };

  useEffect(() => {
    if (decoded?.role === "RECRUTEUR") {
      fetchAllData();
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord Recruteur</h1>
          <p>Bienvenue dans votre espace de gestion 👋</p>
        </div>
        {statsGlobales && (
          <div className="header-stats">
            <div className="mini-stat">
              <span className="stat-value">{statsGlobales.total_offres}</span>
              <span className="stat-label">Offres</span>
            </div>
            <div className="mini-stat">
              <span className="stat-value">{statsGlobales.total_candidatures}</span>
              <span className="stat-label">Candidatures</span>
            </div>
            <div className="mini-stat">
              <span className="stat-value">{statsGlobales.taux_acceptation}%</span>
              <span className="stat-label">Taux acceptation</span>
            </div>
            <div className="mini-stat">
              <span className="stat-value">{statsGlobales.moyenne_candidatures_par_offre}</span>
              <span className="stat-label">Moy/offre</span>
            </div>
          </div>
        )}
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={`tab ${activeTab === 'demand' ? 'active' : ''}`}
          onClick={() => setActiveTab('demand')}
        >
          Analyse des demandes
        </button>
        <button 
          className={`tab ${activeTab === 'offres' ? 'active' : ''}`}
          onClick={() => setActiveTab('offres')}
        >
          Mes offres
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="charts-grid">
            <div className="chart-card full-width">
              <h3>🏆 Offres les plus demandées</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topOffres}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="titre" 
                    tick={{ fill: chartColors.text, fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: chartColors.tooltipBg, 
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                  <Bar 
                    dataKey="total_candidatures" 
                    name="Candidatures" 
                    fill={chartColors.barPrimary}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="acceptees" 
                    name="Acceptées" 
                    fill={chartColors.barSecondary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card full-width">
            <h3>📈 Évolution des candidatures</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolution}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="mois" tick={{ fill: chartColors.text, fontSize: 12 }} />
                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: chartColors.tooltipBg, 
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <Line 
                  type="monotone" 
                  dataKey="nombre_candidatures" 
                  name="Candidatures" 
                  stroke={chartColors.linePrimary} 
                  strokeWidth={2.5}
                  dot={{ fill: chartColors.linePrimary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="acceptees" 
                  name="Acceptées" 
                  stroke={chartColors.lineSecondary} 
                  strokeWidth={2.5}
                  dot={{ fill: chartColors.lineSecondary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {activeTab === 'demand' && (
        <div className="demand-analysis">
          <div className="ranking-section">
            <h3>🎯 Analyse comparative</h3>
            <div className="ranking-grid">
              <div className="ranking-card best">
                <div className="ranking-icon">🥇</div>
                <h4>Plus demandée</h4>
                {topOffres[0] && (
                  <>
                    <p className="offre-title">{topOffres[0].titre}</p>
                    <p className="stat">{topOffres[0].total_candidatures} candidatures</p>
                    <p className="taux">
                      Taux succès: {Math.round((topOffres[0].acceptees / topOffres[0].total_candidatures) * 100)}%
                    </p>
                  </>
                )}
              </div>
              <div className="ranking-card avg">
                <div className="ranking-icon">⭐</div>
                <h4>Moyenne générale</h4>
                <p className="stat">{statsGlobales?.moyenne_candidatures_par_offre} candidatures/offre</p>
                <p className="taux">Taux acceptation: {statsGlobales?.taux_acceptation}%</p>
              </div>
            </div>
          </div>

          <div className="advice-section">
            <h3>💡 Conseils personnalisés</h3>
            <div className="advice-grid">
              {statsGlobales?.taux_acceptation < 30 && (
                <div className="advice-card info">
                  <span className="advice-icon">💪</span>
                  <div>
                    <strong>Taux d'acceptation faible</strong>
                    <p>Seulement {statsGlobales.taux_acceptation}% de vos candidatures sont acceptées. Revoyez vos critères de sélection.</p>
                  </div>
                </div>
              )}
              {topOffres[0] && topOffres[0].total_candidatures > 20 && (
                <div className="advice-card success">
                  <span className="advice-icon">🎯</span>
                  <div>
                    <strong>Offre très populaire</strong>
                    <p>"{topOffres[0].titre}" a reçu {topOffres[0].total_candidatures} candidatures. Utilisez un système de pré-sélection.</p>
                  </div>
                </div>
              )}
              {topOffres.length > 0 && topOffres[topOffres.length - 1]?.total_candidatures === 0 && (
                <div className="advice-card warning">
                  <span className="advice-icon">⚠️</span>
                  <div>
                    <strong>Offre sans candidature</strong>
                    <p>Certaines offres n'ont reçu aucune candidature. Envisagez de modifier le titre ou la description.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'offres' && (
        <div className="recent-offres">
          <h2>Mes offres</h2>
          {offres.length === 0 ? (
            <p className="empty-message">Aucune offre publiée</p>
          ) : (
            offres.map((offre) => (
              <div key={offre.id} className="offre-item">
                <div className="offre-header">
                  <h4>{offre.titre}</h4>
                  <span className={`status-badge ${offre.total_candidatures > 0 ? 'has-candidatures' : 'no-candidatures'}`}>
                    {offre.total_candidatures || 0} candidature(s)
                  </span>
                </div>
                <p className="offre-date">Publiée le {formatDate(offre.date_creation)}</p>
                <p className="offre-description">{offre.description}</p>
                <div className="offre-stats-mini">
                  <div className="stat-item">📊 En attente: {offre.en_attente || 0}</div>
                  <div className="stat-item">✅ Acceptées: {offre.acceptees || 0}</div>
                  <div className="stat-item">❌ Refusées: {offre.refusees || 0}</div>
                  <div className="stat-item">📈 Taux: {offre.taux_acceptation || 0}%</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}