import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ficheProduit.css";
import api from "../../../api";

function FicheProduit(props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [similaires, setSimilaires] = useState([]);

  useEffect(() => {
    // Récupérer le produit spécifique par son ID
    api.getProduits().then((response) => {
      if (response.data) {
        const produitTrouve = response.data.find(p => p.id === parseInt(id));
        if (produitTrouve) {
          setProduit(produitTrouve);

          // Charger les produits similaires (même catégorie, exclure le produit courant)
          api.getProduits().then((res) => {
            if (res.data) {
              const similaires = res.data.filter(
                p => p.categorie_id === produitTrouve.categorie_id && p.id !== produitTrouve.id
              ).slice(0, 6); // Limite à 6 similaires
              setSimilaires(similaires);
            }
          });
        } else {
          setError("Produit non trouvé");
        }
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Erreur lors du chargement du produit:', error);
      setError("Erreur lors du chargement");
      setLoading(false);
    });
  }, [id]);

  const ajoutPanier = () => {
    // Debug : vérifier si les props sont bien passées
    console.log('Props panier:', props.panier);
    console.log('Props setPanier:', props.setPanier);
    console.log('Produit:', produit);
    
    // Vérification plus robuste
    if (!props.setPanier) {
      console.error('setPanier function not provided as prop');
      alert('Erreur : fonction setPanier non disponible');
      return;
    }

    if (!produit) {
      console.error('No product data available');
      alert('Erreur : données du produit non disponibles');
      return;
    }

    // Initialiser panier s'il n'existe pas
    const currentPanier = props.panier || [];
    
    try {
      const existingProduct = currentPanier.find((p) => p.id === produit.id);

      if (existingProduct) {
        const newPanier = currentPanier.map((p) =>
          p.id === produit.id ? { ...p, quantity: p.quantity + quantite } : p
        );
        props.setPanier(newPanier);
        console.log('Produit mis à jour dans le panier:', newPanier);
      } else {
        const newPanier = [...currentPanier, { ...produit, quantity: quantite }];
        props.setPanier(newPanier);
        console.log('Nouveau produit ajouté au panier:', newPanier);
      }
      
      // Message de confirmation
      alert(`${quantite} ${produit.nom}(s) ajouté(s) au panier !`);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      alert('Erreur lors de l\'ajout au panier');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du produit...</p>
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="error-container">
        <h2>Oops !</h2>
        <p>{error || "Produit non trouvé"}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(-1)}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="fiche-produit-container">
      {/* Debug info - à retirer en production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{background: '#f0f0f0', padding: '10px', margin: '10px', fontSize: '12px'}}>
          <strong>Debug:</strong> Panier disponible: {props.panier ? 'Oui' : 'Non'}, 
          setPanier disponible: {props.setPanier ? 'Oui' : 'Non'}
        </div>
      )}

      {/* Bouton retour */}
      <button 
        className="btn-retour" 
        onClick={() => navigate(-1)}
      >
        <i className="bi bi-arrow-left"></i> Retour
      </button>

      <div className="fiche-produit">
        {/* Image du produit */}
        <div className="produit-image-section">
          <img 
            src={produit.image} 
            alt={produit.nom}
            className="produit-image-principale"
          />
        </div>

        {/* Informations du produit */}
        <div className="produit-info-section">
          <h1 className="produit-nom">{produit.nom}</h1>
          
          <div className="produit-prix-container">
            <span className="produit-prix">{produit.prix} €</span>
          </div>

          <div className="produit-description-container">
            <h3>Description</h3>
            <p className="produit-description">{produit.description}</p>
          </div>

          {/* Contrôles d'achat */}
          <div className="achat-controls">
            <div className="quantite-container">
              <label htmlFor="quantite">Quantité :</label>
              <div className="quantite-input">
                <button 
                  type="button"
                  className="btn-quantite"
                  onClick={() => setQuantite(Math.max(1, quantite - 1))}
                  disabled={quantite <= 1}
                >
                  -
                </button>
                <input 
                  type="number"
                  id="quantite"
                  value={quantite}
                  onChange={(e) => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="quantite-field"
                />
                <button 
                  type="button"
                  className="btn-quantite"
                  onClick={() => setQuantite(quantite + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button 
              className="btn-ajouter-panier"
              onClick={ajoutPanier}
            >
              <i className="bi bi-cart-plus"></i>
              Ajouter au panier ({(produit.prix * quantite).toFixed(2)} €)
            </button>
          </div>

          {/* Informations supplémentaires */}
          <div className="produit-details">
            <div className="detail-item">
              <strong>Référence :</strong> #{produit.id}
            </div>
            {produit.stock && (
              <div className="detail-item">
                <strong>Stock :</strong> 
                <span className={produit.stock > 10 ? "stock-ok" : "stock-limite"}>
                  {produit.stock} disponible(s)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {similaires.length > 0 && (
        <div className="similaires-section">
          <h3>Produits similaires</h3>
          <div className="similaires-list">
            {similaires.map((sim, idx) => (
              <div key={sim.id} className="similaire-card" onClick={() => navigate(`/produit/${sim.id}`)}>
                <img src={sim.image} alt={sim.nom} className="similaire-image" />
                <div className="similaire-info">
                  <div className="similaire-nom">{sim.nom}</div>
                  <div className="similaire-prix">{sim.prix} €</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FicheProduit;