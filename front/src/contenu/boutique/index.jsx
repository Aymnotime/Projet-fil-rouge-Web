import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./boutique.css";
import Produit from "./Produit";
import api from "../../api";

function Boutique(props) {
  const [showCart, setShowCart] = useState(false);
  const [filterSelection, setFilterSelection] = useState("all");
  const [filterText, setFilterText] = useState("");
  const searchRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [minPrix, setMinPrix] = useState("");
  const [maxPrix, setMaxPrix] = useState("");
  const [categories, setCategories] = useState([]); // Initialiser comme tableau vide
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les produits
    api.getProduits().then((response) => {
      if (response.data) {
        setProducts(response.data);
      }
    }).catch((error) => {
      console.error("Erreur lors de la récupération des produits:", error);
    });

    // Récupérer les catégories
    api.getCategories().then((response) => {
      console.log("Réponse catégories:", response); // Pour déboguer
      
      // Vérifier la structure de la réponse
      if (response.data && response.data.success && response.data.data) {
        setCategories(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error("Format de réponse inattendu pour les catégories:", response);
        setCategories([]); // Assurer un tableau vide en cas d'erreur
      }
    }).catch((error) => {
      console.error("Erreur lors de la récupération des catégories:", error);
      setCategories([]); // Assurer un tableau vide en cas d'erreur
    });
  }, []);

  const ajoutPanier = (productToAdd) => {
    const existingProduct = props.panier.find((p) => p.id === productToAdd.id);

    if (existingProduct) {
      const newPanier = props.panier.map((p) =>
        p.id === productToAdd.id ? { ...p, quantity: p.quantity + 1 } : p
      );
      props.setPanier(newPanier);
    } else {
      props.setPanier([...props.panier, { ...productToAdd, quantity: 1 }]);
    }
  };

  const retirerPanier = (productToRemove) => {
    const existingProduct = props.panier.find(
      (p) => p.id === productToRemove.id
    );

    if (existingProduct) {
      if (existingProduct.quantity > 1) {
        const newPanier = props.panier.map((p) =>
          p.id === productToRemove.id ? { ...p, quantity: p.quantity - 1 } : p
        );
        props.setPanier(newPanier);
      } else {
        const newPanier = props.panier.filter(
          (p) => p.id !== productToRemove.id
        );
        props.setPanier(newPanier);
      }
    }
  };

  const commander = () => {
  console.log("🛒 Commande en cours:", props.panier);
  
  const commandeData = {
    produits: JSON.stringify(
      props.panier.map((p) => ({ 
        id: p.id, 
        quantity: p.quantity || 1 // S'assurer que quantity existe
      }))
    )
  };

  console.log("📤 Données envoyées:", commandeData);

  api
    .newCommande(commandeData)
    .then((response) => {
      console.log("✅ Réponse commande:", response.data);
      
      if (response.data && response.data.success) {
        props.setPanier([]);
        console.log("🎉 Commande créée, redirection vers les commandes...");
        
        // Forcer un petit délai pour laisser le temps à la BDD de se mettre à jour
        setTimeout(() => {
          navigate("/compte?onglet=commandes");
        }, 100);
      } else {
        console.error("❌ Erreur dans la réponse:", response.data);
        alert("Erreur lors de la création de la commande: " + (response.data.message || "Erreur inconnue"));
      }
    })
    .catch((error) => {
      console.error("❌ Erreur lors de la commande:", error);
      alert("Erreur lors de la création de la commande: " + error.message);
    });
};

  const sizePanier = props.panier.reduce(
    (acc, product) => acc + product.quantity,
    0
  );

  const prixTotal = props.panier.reduce(
    (acc, product) => acc + product.prix * product.quantity,
    0
  );

  // Fonction de filtrage utilisant les catégories de la BDD
  const getFilteredProducts = () => {
    return products
      .filter((product) => {
        // Filtre par catégorie
        if (filterSelection === "all") {
          return true;
        } else {
          // Filtrer par categorie_id
          return product.categorie_id === parseInt(filterSelection);
        }
      })
      .filter((product) => {
        // Filtre par texte de recherche
        if (!filterText) return true;
        
        const searchText = filterText.toLowerCase();
        return (
          product.nom.toLowerCase().includes(searchText) ||
          product.description.toLowerCase().includes(searchText) ||
          (product.brand_name && product.brand_name.toLowerCase().includes(searchText))
        );
      })
      .filter((product) => {
        // Filtre par prix
        const prix = parseFloat(product.prix);
        const min = parseFloat(minPrix);
        const max = parseFloat(maxPrix);

        if (!isNaN(min) && prix < min) return false;
        if (!isNaN(max) && prix > max) return false;
        return true;
      });
  };

  return (
    <>
      <div className="firstblock">
        <h3>
          Bonjour, <b>{props.user ? props.user.nom : "utilisateur"}</b>
        </h3>
        <i
          className="bi bi-cart-fill cart position-relative"
          onClick={() => setShowCart(!showCart)}
        >
          {sizePanier > 0 && (
            <span className="badge bg-primary rounded-pill position-absolute">
              {sizePanier}
            </span>
          )}
        </i>
      </div>
      
      <div
        className={`offcanvas-backdrop fade ${showCart ? "show" : "pe-none"}`}
      ></div>
      
      <div
        className={`offcanvas offcanvas-end ${
          showCart ? "show" : "hiding"
        } z-index-1`}
        tabIndex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasExampleLabel">
            Panier
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            onClick={() => setShowCart(false)}
          ></button>
        </div>
        <div className="offcanvas-body">
          {props.panier.length === 0 ? (
            <div className="text-center">Votre panier est vide</div>
          ) : (
            <div>
              <ul className="list-group position-relative">
                {props.panier.map((product) => (
                  <li 
                    key={product.id} 
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <img
                      src={product.image}
                      alt={product.nom}
                      style={{ width: "24px", marginRight: "10px" }}
                    />
                    {product.nom}
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic example"
                    >
                      <button
                        type="button"
                        className="btn"
                        onClick={() => retirerPanier(product)}
                      >
                        <i className="bi bi-dash-circle-fill"></i>
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => ajoutPanier(product)}
                      >
                        <i className="bi bi-plus-circle-fill"></i>
                      </button>
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {product.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              {props.user ? (
                <div>
                  <div className="text-center mt-3">
                    Prix total : {prixTotal} €
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary mt-3 w-100"
                    onClick={() => commander()}
                  >
                    Commander
                  </button>
                </div>
              ) : (
                <div className="text-center mt-3">
                  Veuillez vous connecter pour commander
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div ref={searchRef}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un produit ..."
              aria-label="Search"
              aria-describedby="basic-addon1"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <select
              className="custom-select mr-sm-2 form-control"
              value={filterSelection}
              onChange={(e) => setFilterSelection(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {/* Vérifier que categories est un tableau avant de mapper */}
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text">Prix min</span>
            <input
              type="number"
              className="form-control"
              value={minPrix}
              onChange={(e) => setMinPrix(e.target.value)}
              placeholder="0"
              min="0"
              style={{ maxWidth: "300px" }}
            />
            <span className="input-group-text">Prix max</span>
            <input
              type="number"
              className="form-control"
              value={maxPrix}
              onChange={(e) => setMaxPrix(e.target.value)}
              placeholder="1000"
              min="0"
              style={{ maxWidth: "300px" }}
            />
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setMinPrix('');
                setMaxPrix('');
              }}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
      
      <div className="d-grid gap-3 produits">
        {getFilteredProducts().map((product) => (
          <Produit
            key={product.id}
            nom={product.nom}
            description={product.description}
            prix={product.prix}
            image={product.image}
            id={product.id}
            ajoutPanier={() => ajoutPanier(product)}
          />
        ))}
      </div>
    </>
  );
}

export default Boutique;