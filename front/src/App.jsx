import './App.css';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './api';
import Contenu from './contenu';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/AdminDashboard';
import ResetPasswordPage from './layout/ResetPasswordPage';
import { AuthProvider } from './context/AuthContext';
import PaiementPage from "./contenu/Stripe/PaiementPage";

function App() {
  const [user, setUser] = useState();
  const [equipes, setEquipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [useAlternateNavbar, setUseAlternateNavbar] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    api.getUser().then((res) => {
      if (res.data.success) {
        setUser(res.data.user);
        return;
      }
      setUser(null);
    })

    api.getEquipes().then((res) => {
      if (res.data.success) {
        setEquipes(res.data.equipes);
        console.log(res.data.equipes);
      }
    })

    api.getArticles().then((res) => {
      if (res.data.success) {
        setArticles(res.data.articles);
        console.log(res.data.articles);
      }
    })
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
          <div className='d-flex'>
            <label className="hamburger">
              <input 
                type="checkbox" 
                checked={navbarOpen} 
                onChange={() => setNavbarOpen(!navbarOpen)} 
              />
              <svg viewBox="0 0 32 32">
                <path 
                  className="line line-top-bottom" 
                  d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                />
                <path className="line" d="M7 16 27 16" />
              </svg>
            </label>
            <Navbar 
              user={user} 
              setUser={setUser} 
              navbarOpen={navbarOpen} 
              useAlternateNavbar={useAlternateNavbar} 
              setUseAlternateNavbar={setUseAlternateNavbar} 
            />
            <button onClick={toggleDarkMode} className="toggle-dark-mode">
              {isDarkMode ? 'Mode Jour' : 'Mode Nuit'}
            </button>
            
            <Routes>
              <Route 
                path="/*" 
                element={
                  <Contenu 
                    user={user} 
                    equipes={equipes} 
                    articles={articles} 
                  />
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="/admin/commandes" 
                  element={<AdminDashboard />} />

              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/paiement" element={<PaiementPage />} />
            </Routes>
          </div>
          
          <Footer 
            user={user} 
            useAlternateFooter={useAlternateNavbar}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;