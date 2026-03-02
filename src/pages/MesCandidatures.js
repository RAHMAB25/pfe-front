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
  Table
} from "react-bootstrap";
import { 
  FaFilePdf, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaHourglassHalf,
  FaBuilding,
  FaCalendarAlt,
  FaEye,
  FaDownload,
  FaChartLine
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MesCandidatures.css"; // Fichier CSS personnalisé (optionnel)

export default function MesCandidatures() {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    acceptees: 0,
    refusees: 0
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
    const stats = {
      total: data.length,
      enAttente: data.filter(c => c.statut === "EN_ATTENTE").length,
      acceptees: data.filter(c => c.statut === "ACCEPTE").length,
      refusees: data.filter(c => c.statut === "REFUSE").length
    };
    setStats(stats);
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      "EN_ATTENTE": { bg: "warning", text: "dark", icon: FaHourglassHalf, label: "En attente" },
      "ACCEPTE": { bg: "success", text: "light", icon: FaCheckCircle, label: "Acceptée" },
      "REFUSE": { bg: "danger", text: "light", icon: FaTimesCircle, label: "Refusée" }
    };

    const config = statusConfig[statut] || statusConfig["EN_ATTENTE"];
    const Icon = config.icon;

    return (
      <Badge bg={config.bg} text={config.text} className="status-badge">
        <Icon className="me-1" /> {config.label}
      </Badge>
    );
  };

  const handleViewDetails = (candidature) => {
    setSelectedCandidature(candidature);
    setShowDetailsModal(true);
  };

  const handleDownloadCV = async () => {
    if (!selectedCandidature?.cv) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/uploads/${selectedCandidature.cv}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Erreur lors du téléchargement");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedCandidature.cv;
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

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement de vos candidatures...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  return (

     <Container fluid className="mes-candidatures-container px-0">
      {/* Header avec gris foncé */}
      <div className="header-section-gris-fonce py-4 px-3 px-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <h2 className="text-gris-clair mb-3 mb-md-0">
            <span className="me-2">📊</span> Mes Candidatures
          </h2>
          <Badge className="total-badge-gris p-3">Total: {stats.total}</Badge>
        </div>
      </div>
    
      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-warning">En attente</h6>
                  <h3>{stats.enAttente}</h3>
                </div>
                <FaHourglassHalf className="stat-icon text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-success">Acceptées</h6>
                  <h3>{stats.acceptees}</h3>
                </div>
                <FaCheckCircle className="stat-icon text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-danger">Refusées</h6>
                  <h3>{stats.refusees}</h3>
                </div>
                <FaTimesCircle className="stat-icon text-danger" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Liste des candidatures */}
      {candidatures.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FaFilePdf size={50} className="text-muted mb-3" />
            <h5>Aucune candidature</h5>
            <p className="text-muted">
              Vous n'avez pas encore postulé à une offre. 
              Parcourez les offres disponibles et postulez !
            </p>
            <Button variant="primary" href="/offres">
              Voir les offres
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {candidatures.map((c) => (
            <Col lg={6} key={c.candidature_id} className="mb-4">
              <Card className="candidature-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title className="mb-0">
                      {c.offre_titre}
                    </Card.Title>
                    {getStatusBadge(c.statut)}
                  </div>

                  <div className="candidature-details">
                    <p className="mb-2">
                      <FaBuilding className="me-2 text-primary" />
                      <strong>Recruteur :</strong> {c.recruteur_nom}
                    </p>
                    
                    <p className="mb-2">
                      <FaCalendarAlt className="me-2 text-primary" />
                      <strong>Date :</strong> {formatDate(c.date_postulation)}
                    </p>

                    {c.cv && (
                      <p className="mb-2">
                        <FaFilePdf className="me-2 text-danger" />
                        <strong>CV :</strong> {c.cv}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleViewDetails(c)}
                    >
                      <FaEye className="me-1" /> Détails
                    </Button>
                    
                    {c.cv && (
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleDownloadCV(c)}
                      >
                        <FaDownload className="me-1" /> CV
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal des détails */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Détails de la candidature</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidature && (
            <>
              <Table borderless className="details-table">
                <tbody>
                  <tr>
                    <td><strong>Offre :</strong></td>
                    <td>{selectedCandidature.offre_titre}</td>
                  </tr>
                  <tr>
                    <td><strong>Recruteur :</strong></td>
                    <td>{selectedCandidature.recruteur_nom}</td>
                  </tr>
                  <tr>
                    <td><strong>Date de postulation :</strong></td>
                    <td>{formatDate(selectedCandidature.date_postulation)}</td>
                  </tr>
                  <tr>
                    <td><strong>Statut :</strong></td>
                    <td>{getStatusBadge(selectedCandidature.statut)}</td>
                  </tr>
                  <tr>
                    <td><strong>CV :</strong></td>
                    <td>
                      {selectedCandidature.cv ? (
                        <Button 
                          variant="link" 
                          onClick={handleDownloadCV}
                          className="p-0"
                        >
                          <FaFilePdf className="text-danger me-1" />
                          {selectedCandidature.cv}
                        </Button>
                      ) : (
                        "Non fourni"
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}