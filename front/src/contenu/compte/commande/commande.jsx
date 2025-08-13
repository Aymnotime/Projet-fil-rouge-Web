import React, { useState, useEffect } from "react";
import api from "../../../api";
import StripeContainer from "../../Stripe/StripeContainer";
import "./commande.css";
import { useNavigate } from "react-router-dom";

const CommandePage = () => {
  const [commandes, setCommandes] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.getUser().then((res) => {
      if (res.data && res.data.user) {
        setUserEmail(res.data.user.email);
      }
    });
    const fetchCommandes = () => {
      api
        .getCommandes()
        .then((response) => {
          if (response.data) {
            setCommandes(response.data.commands);
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des commandes:", error);
        });
    };

    fetchCommandes();
  }, []);

  // Fonction pour calculer le total d'une commande
  const calculateTotal = (produits) => {
    return produits.reduce((total, product) => {
      return total + (product.prix * product.quantity);
    }, 0);
  };

  return (
    <div>
      {commandes &&
        commandes.map((commande, index) => {
          const totalAmount = calculateTotal(commande.produits);
          
          return (
            <div className="cont" key={index}>
              <p>Commande effectuée le : {commande.date}</p>
              <p>Produits commandés:</p>

              <div className="blockcard">
                {commande.produits.map((product, productIndex) => (
                  <div className="card-bodynew" key={productIndex}>
                    <div className="d-flex align-items-center">
                      <img className="imagecommande" src={product.image} alt="" />
                      <p className="nbcommande">{product.quantity} X</p>
                    </div>
                    <h5>{product.prix} €</h5>
                    <p className="descriptionproduits">{product.description}</p>
                  </div>
                ))}
                
                <div className="total-section">
                  <h4>Total: {totalAmount.toFixed(2)} €</h4>
                </div>
                
                {!commande.paye && (
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      navigate(`/paiement?commande_id=${commande.id}&amount=${totalAmount}`)
                    }
                  >
                    Valider la commande
                  </button>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default CommandePage;