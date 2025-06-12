import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./article.css"; // Vous pouvez renommer ce fichier en produit.css si vous voulez
import api from "../../../api";

function ProduitsAleatoires(props) {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour mélanger un tableau (algorithme Fisher-Yates)
  const melangerTableau = (array) => {
    const nouveauTableau = [...array];
    for (let i = nouveauTableau.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nouveauTableau[i], nouveauTableau[j]] = [nouveauTableau[j], nouveauTableau[i]];
    }
    return nouveauTableau;
  };

  // Récupérer les produits depuis votre API
  useEffect(() => {
    api.getProduits().then((response) => {
      if (response.data) {
        // Mélanger les produits et prendre les 5 premiers
        const produitsAlea = melangerTableau(response.data).slice(0, 5);
        setProduits(produitsAlea);
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Erreur lors du chargement des produits:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading">Chargement des produits...</div>;
  }

  return (
    <>
      <h1 className="titrearticles">Nos Produits du Moment</h1>
      <div className="d-grid gap-3 produits">
        {produits.map((product) => (
          <Link
            to={`/produit/${product.id}`}
            key={product.id}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="product-card">
              <img 
                src={product.image} 
                alt={product.nom}
                className="product-image"
              />
              <div className="product-info">
                <h3 className="product-title">{product.nom}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">{product.prix} €</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default ProduitsAleatoires;