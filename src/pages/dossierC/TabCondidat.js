import { useEffect, useState } from "react";
import { 
  Container, Row, Col, Spinner
} from "react-bootstrap";
import { 
  FaBell, FaFire, FaUsers, FaChartPie, 
  FaChartLine, FaBriefcase, FaCheckCircle, 
  FaClock, FaTimesCircle, FaArrowRight
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TabCondidat.css";

export default function TabCondidat() {
  const [dashboardData, setDashboardData] = useState(null);
  const [topOffres, setTopOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    
    try {
      const userRes = await fetch("http://localhost:3000/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();

      const candidaturesRes = await fetch("http://localhost:3000/mescandidatures", {
        headers: { Authorization: `Bearer ${token}` }
      });
      let candidatures = await candidaturesRes.json();

      candidatures = candidatures.map(c => {
        let statutNormalise = c.statut;
        if (statutNormalise === "ACCEPTÉE") statutNormalise = "ACCEPTE";
        if (statutNormalise === "REFUSÉE") statutNormalise = "REFUSE";
        if (statutNormalise === "EN ATTENTE") statutNormalise = "EN_ATTENTE";
        return { ...c, statut: statutNormalise };
      });

      const total = candidatures.length;
      const enAttente = candidatures.filter(c => c.statut === "EN_ATTENTE").length;
      const acceptees = candidatures.filter(c => c.statut === "ACCEPTE").length;
      const refusees = candidatures.filter(c => c.statut === "REFUSE").length;

      const notifRes = await fetch("http://localhost:3000/notifications/non-lues/count", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifData = await notifRes.json();

      const topOffresRes = await fetch("http://localhost:3000/dashboard/top-offres-candidats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let topOffresData = [];
      if (topOffresRes.ok) {
        topOffresData = await topOffresRes.json();
      }

      setDashboardData({
        user: userData,
        stats: {
          total,
          enAttente,
          acceptees,
          refusees,
          tauxAcceptation: total > 0 ? Math.round((acceptees / total) * 100) : 0
        },
        notificationsNonLues: notifData.count || 0
      });
      
      setTopOffres(topOffresData);
      
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    if (!dashboardData) return "";
    const prenom = dashboardData.user?.prénom || "Candidat";
    const heure = new Date().getHours();
    
    let salutation = "";
    if (heure < 12) salutation = "Bonjour";
    else if (heure < 18) salutation = "Bon après-midi";
    else salutation = "Bonsoir";
    
    return { salutation, prenom };
  };

  const getPieData = () => {
    if (!dashboardData) return [];
    const data = [];
    
    if (dashboardData.stats.enAttente > 0) {
      data.push({ name: "En attente", value: dashboardData.stats.enAttente, color: "#9CA3AF" });
    }
    if (dashboardData.stats.acceptees > 0) {
      data.push({ name: "Acceptées", value: dashboardData.stats.acceptees, color: "#6B7280" });
    }
    if (dashboardData.stats.refusees > 0) {
      data.push({ name: "Refusées", value: dashboardData.stats.refusees, color: "#4B5563" });
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) return null;

  const welcome = getWelcomeMessage();
  const pieData = getPieData();
  const stats = dashboardData.stats;

  return (
    <div className="dashboard-candidat">
      
      {/* Header clair et élégant */}
      <div className="dashboard-header-candidat">
        <div className="header-content-candidat">
          <div className="header-left">
            <div className="greeting-badge-candidat">
              <FaFire />
              <span>Tableau de bord</span>
            </div>
            <h1>
              {welcome.salutation}, {welcome.prenom}
            </h1>
            <p>Visualisez l'analyse de vos candidatures</p>
          </div>

          {dashboardData.notificationsNonLues > 0 && (
            <div className="notif-chip-candidat">
              <FaBell />
              <span>{dashboardData.notificationsNonLues}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section graphiques uniquement */}
      <div className="charts-section-candidat">
        <div className="section-header-candidat">
          <h3>Analyse des candidatures</h3>
          <p>Visualisez vos statistiques et performances</p>
        </div>

        <Row className="g-4">
          {/* Pie Chart */}
          <Col lg={5} md={12}>
            <div className="chart-card-candidat">
              <div className="chart-header-candidat">
                <FaChartPie />
                <h4>Répartition des statuts</h4>
              </div>
              <div className="chart-body-candidat">
                {stats.total > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          innerRadius={60}
                          outerRadius={90}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend 
                          verticalAlign="bottom" 
                          align="center"
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="success-rate-candidat">
                      <FaChartLine />
                      <span>Taux d'acceptation :</span>
                      <strong>{stats.tauxAcceptation}%</strong>
                    </div>
                  </>
                ) : (
                  <div className="empty-chart">
                    <div className="empty-icon">📭</div>
                    <p>Aucune candidature</p>
                    <span>Commencez à postuler</span>
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Bar Chart */}
          <Col lg={7} md={12}>
            <div className="chart-card-candidat">
              <div className="chart-header-candidat">
                <FaUsers />
                <h4>Offres les plus demandées</h4>
              </div>
              <div className="chart-body-candidat bar-chart-body">
                {topOffres.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart 
                      data={topOffres} 
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 130, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="offre_titre" 
                        width={120}
                        tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                      />
                      <Bar 
                        dataKey="total_candidats" 
                        name="Nombre de candidats"
                        fill="#6B7280"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">
                    <div className="empty-icon">📊</div>
                    <p>Aucune donnée</p>
                    <span>Postulez à des offres</span>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}