import React, { useState, useEffect } from "react";
import api from "../../../api";
import "./commande.css";

const CommandePage = () => {
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
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
  console.log(commandes);
  console.log(commandes.produits);
  return (
    <div>
      {commandes &&
        commandes.map((commande, index) => (
          <div className="cont" key={index}>
            <p>Commande effectue le : {commande.date}</p>
            <p>Produits commander:</p>

            <div className="blockcard">
              {commande.produits.map((product, index) => (
                <div className="card-bodynew" key={index}>
                  <div className="d-flex align-items-center ">
                    <img className="imagecommande" src={product.image} alt="" />{" "}
                    <p className="nbcommande">{product.quantity} X</p>
                  </div>

                  <h5>{product.prix} €</h5>
                  <p className="descriptionproduits">{product.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default CommandePage;
