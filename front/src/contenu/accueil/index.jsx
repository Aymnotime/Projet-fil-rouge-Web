import React, { useState, useEffect } from "react";
import "./accueil.css";

import Carrousel from "./carousel";
import Article from "./article/article";
import { Link } from "react-router-dom";

function Accueil(props) {
  return (
    <>
      <div className="firstblock">
        <h3>
          <span className="titre">Bienvenue sur notre site</span>
        </h3>
        <p>
          <span className="titre">Nous sommes heureux de vous accueillir</span>
        </p>
      
      </div>
      <div className="deproduits">
        <div>
          <h4>
            Découvrez notre <b>nouvelle gamme de produits</b> !
          </h4>
          <Link to="/boutique">
            Voir les produits <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <img src="src/assets/logo-pc.png" className="" alt="" style={{ width: "290px", height: "auto" }} />
      </div>
      {/* <Carrousel equipes={props.equipes} /> */}
      <Article articles={props.articles} />
    </>
  );
}

export default Accueil;
