import { useState } from "react";
import { useNavigate } from "react-router-dom";

import jwtDecode from "jwt-decode";
import "./Homepage.css";
import "./Condidat";
import "./Recruteur";

const CardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="card-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);



const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="input-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="input-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

// Feature Icons for Left Panel
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

function Homepage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motdepasse, setmotdepasse] = useState("");

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:3000/verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        mot_de_passe: motdepasse,
      })
    });

    const data = await response.json();
    console.log("🚀 ~ handleLogin ~ data:", data)
    


   if (data.success) {
  // 🔹 Stocker le token
  localStorage.setItem("token", data.token);

  // 🔹 Décoder le token pour récupérer le rôle
  const decoded = jwtDecode(data.token);

 if (decoded.role === "CANDIDAT") {
  navigate("/condidat");
} else if (decoded.role === "RECRUTEUR") {
  navigate("/recruteur");
}
else {
    console.warn("Rôle inconnu :", decoded.role);
  }
} else {
      alert("Email ou mot de passe incorrect");
    }
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="homepage-container">
      <div className="homepage-content">

        {/* Left Representative Card */}
        <div className="left-panel">
          <div className="brand-section">
            <h1 className="brand-title">SmartHire</h1>
            <p className="brand-tagline">
              La plateforme intelligente qui connecte les talents aux bonnes opportunités, recrutez plus vite ,plus intelligement.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <BriefcaseIcon />
              <h3>Recruteur</h3>
              <p>Publiez vos offres et recrutez plus intelligement</p>
            </div>

            <div className="feature-card">
              <UserIcon />
              <h3>Candidat</h3>
              <p>Postulez facilement et suivez votre parcours professionnel</p>
            </div>

            <div className="feature-card">
              <SparklesIcon />
              <h3>IA</h3>
              <p>Matching intelligent basé sur vos competances et votre potentiel</p>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="login-card">
          <div className="login-header">
            <h1>Connexion</h1>
            <p className="subtitle">Accédez à votre espace</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <EmailIcon />
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <LockIcon />
              <input
                type="password"
                placeholder="Mot de passe"
                value={motdepasse}
                onChange={(e) => setmotdepasse(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-btn">
              Se connecter
            </button>
          </form>

          <div className="create-account-section">
            <p className="signup-text">
              Pas encore de compte ? <button
                onClick={() => navigate("/creation")}
                className="create-account-btn"
              >
                S'inscrire
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Homepage;