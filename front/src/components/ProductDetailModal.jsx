import React, { useState, useEffect } from 'react';

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Bloquer le défilement quand le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Gestion de la touche Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Empêcher les clics sur le modal de fermer celui-ci
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      // Si la fonction accepte une quantité
      if (onAddToCart.length >= 1) {
        onAddToCart(quantity);
      } else {
        onAddToCart();
      }
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  return (
    <div className="product-modal-backdrop" onClick={onClose}>
      <div className="product-modal" onClick={stopPropagation}>
        <button className="product-modal-close" onClick={onClose}>&times;</button>
        
        <div className="product-modal-body">
          <div className="product-modal-image">
            <img 
              src={product.image || "https://via.placeholder.com/400x400?text=Pas+d'image"} 
              alt={product.nom} 
            />
          </div>
          
          <div className="product-modal-info">
            <h2 className="product-modal-name">{product.nom}</h2>
            <p className="product-modal-price">{product.prix} €</p>
            
            <div className="product-modal-description">
              {product.description || "Aucune description disponible pour ce produit."}
            </div>
            
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantité:</label>
              <input 
                type="number" 
                id="quantity" 
                min="1" 
                value={quantity} 
                onChange={handleQuantityChange} 
              />
            </div>
            
            <button 
              className={`modal-add-to-cart ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={addedToCart}
            >
              {addedToCart ? (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Ajouté !
                </>
              ) : (
                <>
                  <i className="bi bi-cart-plus me-2"></i>
                  Ajouter au panier
                </>
              )}
            </button>
            
            {addedToCart && (
              <div className="success-message">
                <i className="bi bi-check-circle me-2"></i>
                Produit ajouté au panier avec succès !
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;