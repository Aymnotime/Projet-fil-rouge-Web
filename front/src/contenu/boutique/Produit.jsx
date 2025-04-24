import React from "react";
import "./produit.css";

function Produit(props) {
  return (
    <div className="card produit w-100">
      <img src={props.image} className="card-img-top" alt="..."></img>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{props.nom}</h5>
        <p className="card-text">
          {props.prix}€
        </p>
        <a href="#" className="btn btn-primary w-100 mt-auto" onClick={() => props.ajoutPanier()}>
          Ajouter au panier
        </a>
      </div>
    </div>
  );
}

export default Produit;
