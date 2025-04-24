import { useState } from "react";
import Accueil from "./accueil";
import Boutique from "./boutique";
import "./partiedroite.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Compte from "./compte";
import Matchs from "./matchs";
import ArticleUrl from "./accueil/articleUrl/articleurl";

function Contenu(props) {
  const [panier, setPanier] = useState([]);

  return (
    <div className="contenu">
      <Routes>
        <Route path="/" element={<Accueil equipes={props.equipes} articles={props.articles} />} />
        <Route path="/boutique" element={<Boutique user={props.user} panier={panier} setPanier={setPanier} />} />
        <Route path="/compte" element={props.user ? <Compte user={props.user} panier={panier} setPanier={setPanier} /> : (props.user === null ? <Navigate to="/" /> : <></>)} />
        <Route path="/matchs" element={<Matchs equipes={props.equipes} />} />
        <Route path="/article/:id" element={<ArticleUrl articles={props.articles}/>} />
      </Routes>
    </div>
  );
}

export default Contenu;