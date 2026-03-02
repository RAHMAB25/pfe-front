import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Homepage from "./pages/Homepage";
import Creation from './pages/Creation';
import Condidat from "./pages/Condidat";
import Recruteur from "./pages/Recruteur";



function App() {
  return (
    <div>
      <Router>
     <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/creation" element={<Creation />} />
        <Route path="/condidat" element={<Condidat />} />
        <Route path="/recruteur" element={<Recruteur />} />
      </Routes>
    </Router>
 
    </div>
  );
}

export default App;
