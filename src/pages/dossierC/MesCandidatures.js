import { useEffect, useState } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Spinner, 
  Alert,
  Button,
  Modal,
  Table,
  ProgressBar
} from "react-bootstrap";
import { 
  FaFilePdf, 
  FaCheckCircle, 
  FaTimesCircle,
  FaHourglassHalf,
  FaBuilding,
  FaCalendarAlt,
  FaEye,
  FaDownload,
  FaChartLine,
  FaBriefcase,
  FaUserTie
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MesCandidatures.css";

export default function MesCandidatures() {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("TOUS");
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    acceptees: 0,
    refusees: 0,
    tauxAcceptation: 0
  });

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const fetchCandidatures = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch("http://localhost:3000/mescandidatures", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des candidatures");
      }
      
      const data = await res.json();
      setCandidatures(data);
      calculateStats(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger vos candidatures. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const enAttente = data.filter(c => c.statut === "EN_ATTENTE").length;
    const acceptees = data.filter(c => c.statut === "ACCEPTE").length;
    const refusees = data.filter(c => c.statut === "REFUSE").length;
    const total = data.length;
    
    setStats({
      total,
      enAttente,
      acceptees,
      refusees,
      tauxAcceptation: total > 0 ? Math.round((acceptees / total) * 100) : 0
    });
  };

// Dans MesCandidatures.jsx, corrigez la fonction getStatusBadge
const getStatusBadge = (statut) => {
  // Gérer les deux formats possibles
  let normalizedStatut = statut;
  if (statut === "ACCEPTÉE") normalizedStatut = "ACCEPTE";
  if (statut === "REFUSÉE") normalizedStatut = "REFUSE";
  
  const statusConfig = {
    "EN_ATTENTE": { 
      bg: "#e4cf98", 
      text: "#1F2937", 
      icon: FaHourglassHalf, 
      label: "En attente",
      light: "#FEF3C7"
    },
    "ACCEPTE": { 
      bg: "#beddd3", 
      text: "#FFFFFF", 
      icon: FaCheckCircle, 
      label: "Acceptée",
      light: "#D1FAE5"
    },
    "REFUSE": { 
      bg: "#e1c2c2", 
      text: "#FFFFFF", 
      icon: FaTimesCircle, 
      label: "Refusée",
      light: "#FEE2E2"
    }
  };

  const config = statusConfig[normalizedStatut] || statusConfig["EN_ATTENTE"];
  const Icon = config.icon;

  return (
    <Badge 
      bg="none" 
      className="status-badge-modern"
      style={{ 
        backgroundColor: config.light,
        color: config.text,
        borderLeft: `4px solid ${config.bg}`
      }}
    >
      <Icon style={{ color: config.bg }} className="me-2" /> 
      {config.label}
    </Badge>
  );
};


  const handleViewDetails = (candidature) => {
    setSelectedCandidature(candidature);
    setShowDetailsModal(true);
  };

  const handleDownloadCV = async (cvFilename) => {
    if (!cvFilename) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/uploads/${cvFilename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Erreur lors du téléchargement");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cvFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setError("Impossible de télécharger le CV");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFilteredCandidatures = () => {
    if (filterStatus === "TOUS") return candidatures;
    return candidatures.filter(c => c.statut === filterStatus);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="loading-spinner-modern">
          <Spinner animation="border" variant="primary" />
        </div>
        <p className="mt-3 text-muted">Chargement de vos candidatures...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center error-alert">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mes-candidatures-container px-4 px-md-5 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="page-title-modern">
            <FaChartLine className="me-3 text-primary" />
            Mes Candidatures
          </h1>
          <p className="text-muted mt-2">
            Suivez l'évolution de vos candidatures en temps réel
          </p>
        </div>
        <Badge className="total-badge-modern p-3">
          <FaBriefcase className="me-2" />
          Total: {stats.total} candidature{stats.total > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Cartes de statistiques */}
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="stat-card-modern border-0">
            <Card.Body>
              <div className="stat-icon-wrapper bg-warning-subtle">
                <FaHourglassHalf className="text-warning" />
              </div>
              <div className="mt-3">
                <h6 className="text-muted mb-1">En attente</h6>
                <h2 className="mb-0 fw-bold">{stats.enAttente}</h2>
                <small className="text-muted">
                  {stats.total > 0 ? Math.round((stats.enAttente / stats.total) * 100) : 0}% du total
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="stat-card-modern border-0">
            <Card.Body>
              <div className="stat-icon-wrapper bg-success-subtle">
                <FaCheckCircle className="text-success" />
              </div>
              <div className="mt-3">
                <h6 className="text-muted mb-1">Acceptées</h6>
                <h2 className="mb-0 fw-bold">{stats.acceptees}</h2>
                <small className="text-muted">
                  {stats.total > 0 ? Math.round((stats.acceptees / stats.total) * 100) : 0}% du total
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="stat-card-modern border-0">
            <Card.Body>
              <div className="stat-icon-wrapper bg-danger-subtle">
                <FaTimesCircle className="text-danger" />
              </div>
              <div className="mt-3">
                <h6 className="text-muted mb-1">Refusées</h6>
                <h2 className="mb-0 fw-bold">{stats.refusees}</h2>
                <small className="text-muted">
                  {stats.total > 0 ? Math.round((stats.refusees / stats.total) * 100) : 0}% du total
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card-modern border-0">
            <Card.Body>
              <div className="stat-icon-wrapper bg-primary-subtle">
                <FaChartLine className="text-primary" />
              </div>
              <div className="mt-3">
                <h6 className="text-muted mb-1">Taux de réussite</h6>
                <h2 className="mb-0 fw-bold">{stats.tauxAcceptation}%</h2>
                <ProgressBar 
                  now={stats.tauxAcceptation} 
                  variant="success" 
                  className="mt-2"
                  style={{ height: '6px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      {candidatures.length > 0 && (
        <div className="filters-section mb-4">
          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "TOUS" ? "primary" : "outline-secondary"}
              onClick={() => setFilterStatus("TOUS")}
              className="filter-btn"
            >
              Tous ({stats.total})
            </Button>
            <Button
              variant={filterStatus === "EN_ATTENTE" ? "warning" : "outline-warning"}
              onClick={() => setFilterStatus("EN_ATTENTE")}
              className="filter-btn"
            >
              En attente ({stats.enAttente})
            </Button>
            <Button
              variant={filterStatus === "ACCEPTE" ? "success" : "outline-success"}
              onClick={() => setFilterStatus("ACCEPTE")}
              className="filter-btn"
            >
              Acceptées ({stats.acceptees})
            </Button>
            <Button
              variant={filterStatus === "REFUSE" ? "danger" : "outline-danger"}
              onClick={() => setFilterStatus("REFUSE")}
              className="filter-btn"
            >
              Refusées ({stats.refusees})
            </Button>
          </div>
        </div>
      )}

      {/* Liste des candidatures - STYLE SIMPLE COMME L'IMAGE */}
      {candidatures.length === 0 ? (
        <Card className="empty-state-modern text-center p-5 border-0">
          <Card.Body>
            <div className="empty-icon-wrapper mb-4">
              <FaFilePdf size={50} className="text-muted" />
            </div>
            <h4 className="mb-3">Aucune candidature pour le moment</h4>
            <p className="text-muted mb-4">
              Vous n'avez pas encore postulé à une offre. 
              Parcourez les offres disponibles et lancez-vous !
            </p>
            <Button 
              variant="primary" 
              href="/offres"
              className="px-5 py-3"
            >
              Voir les offres d'emploi
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="candidatures-grid">
          {getFilteredCandidatures().map((c) => (
            <div key={c.candidature_id} className="candidature-item">
              {/* Ligne avec titre et bouton œil */}
              <div className="candidature-item-header">
  <span className="candidature-item-title">{c.offre_titre}</span>

  <div className="candidature-header-actions">
    <span className={`candidature-item-status ${
  c.statut === 'EN_ATTENTE' ? 'status-en-attente' : 
  c.statut === 'ACCEPTE' || c.statut === 'ACCEPTÉE' ? 'status-acceptee' : 'status-refusee'
}`}>
  {c.statut === 'EN_ATTENTE' ? 'En attente' : 
   c.statut === 'ACCEPTE' || c.statut === 'ACCEPTÉE' ? 'Acceptée' : 'Refusée'}
</span>

    <Button 
      variant="link"
      className="candidature-item-eye"
      onClick={() => handleViewDetails(c)}
      title="Voir les détails"
    >
      <FaEye />
    </Button>
  </div>
</div>
              
              {/* Entreprise */}
              <div className="candidature-item-company">
                {c.recruteur_nom}
              </div>
              
              {/* Statut et date */}
              
                <div className="candidature-item-date">
                  {formatDateShort(c.date_postulation)}
                
              </div>

              {/* Lien CV si présent */}
              {c.cv && (
                <div className="candidature-item-cv">
                  <Button 
                    variant="link"
                    className="cv-link"
                    onClick={() => handleDownloadCV(c.cv)}
                    title="Télécharger le CV"
                  >
                    <FaFilePdf /> {c.cv.length > 20 ? c.cv.substring(0, 18) + '...' : c.cv}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal des détails */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
        className="details-modal-modern"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            <div className="d-flex align-items-center">
              <FaEye className="me-2 text-primary" />
              Détails de la candidature
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4">
          {selectedCandidature && (
            <>
              <div className="details-header mb-4">
                <h4 className="h5 mb-2">{selectedCandidature.offre_titre}</h4>
                <div className="d-flex align-items-center text-muted">
                  <FaUserTie className="me-2" />
                  <span>{selectedCandidature.recruteur_nom}</span>
                </div>
              </div>

              <Table borderless className="details-table-modern">
                <tbody>
                  <tr>
                    <td className="text-muted">Date de postulation</td>
                    <td className="fw-medium">
                      <FaCalendarAlt className="me-2 text-primary" size={14} />
                      {formatDate(selectedCandidature.date_postulation)}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Statut actuel</td>
                    <td>{getStatusBadge(selectedCandidature.statut)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">CV associé</td>
                    <td>
                      {selectedCandidature.cv ? (
                        <Button 
                          variant="link" 
                          onClick={() => handleDownloadCV(selectedCandidature.cv)}
                          className="p-0 text-decoration-none"
                        >
                          <FaFilePdf className="text-danger me-2" />
                          {selectedCandidature.cv}
                          <FaDownload className="ms-2" size={12} />
                        </Button>
                      ) : (
                        <span className="text-muted">Non fourni</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>

              {selectedCandidature.statut === "EN_ATTENTE" && (
                <Alert variant="info" className="mt-3">
                  <FaHourglassHalf className="me-2" />
                  Votre candidature est en cours d'examen par le recruteur. Vous serez notifié dès qu'une décision sera prise.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}