import './App.css';
import Navbar from './layout/Navbar';
import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './api';
import Contenu from './contenu';


function App() {
  const [user, setUser] = useState();
  const [equipes, setEquipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [useAlternateNavbar, setUseAlternateNavbar] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(true);

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
      <div className='d-flex'>
        <label class="hamburger">
          <input type="checkbox" checked={navbarOpen} onChange={() => setNavbarOpen(!navbarOpen)} />
          <svg viewBox="0 0 32 32">
            <path class="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
            <path class="line" d="M7 16 27 16"></path>
          </svg>
        </label>
        <Navbar user={user} setUser={setUser} navbarOpen={navbarOpen} useAlternateNavbar={useAlternateNavbar} setUseAlternateNavbar={setUseAlternateNavbar} />
        <Contenu user={user} equipes={equipes} articles={articles} />
      </div>
    </Router>
  );
}

export default App;