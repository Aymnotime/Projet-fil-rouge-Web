import React, { useState } from "react";
import "./produit.css";
import ProductDetailModal from "../../components/ProductDetailModal";

function Produit(props) {
  const [showModal, setShowModal] = useState(false);
  
  const openModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    props.ajoutPanier();
  };

  return (
    <>
      <div className="card produit">
        <img 
          src={props.image || "https://via.placeholder.com/300x200?text=Pas+d'image"} 
          className="card-img-top" 
          alt={props.nom || "Produit"}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{props.nom}</h5>
          <p className="card-text">
            {props.prix}€
          </p>
          <div className="button-container mt-auto">
            <a href="#" className="btn btn-primary btn-sm" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus"></i>
            </a>
            <a href="#" className="btn btn-secondary btn-sm" onClick={openModal}>
              <i className="bi bi-info-circle"></i>
            </a>
          </div>
        </div>
      </div>
      
      {showModal && (
        <ProductDetailModal 
          product={props} 
          onClose={closeModal}
          onAddToCart={props.ajoutPanier}
        />
      )}
    </>
  );
}

export default Produit;