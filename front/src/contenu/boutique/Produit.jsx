import React from "react";
import { Link } from "react-router-dom";
import "./produit.css";

function Produit(props) {
  return (
    <Link to={`/produit/${props.id}`} className="text-decoration-none">
      <div className="card produit w-100 h-100 card-hover">
        <img src={props.image} className="card-img-top" alt={props.nom}></img>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-dark">{props.nom}</h5>
          <p className="card-text text-dark">
            <strong>{props.prix}€</strong>
          </p>
          <p className="card-text text-muted small">
            {props.description.length > 100 
              ? `${props.description.substring(0, 100)}...` 
              : props.description}
          </p>
          <div className="mt-auto">
            <button 
              className="btn btn-primary w-100" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props.ajoutPanier();
              }}
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Produit;