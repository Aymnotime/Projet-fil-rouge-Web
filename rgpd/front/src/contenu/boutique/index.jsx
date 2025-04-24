import React, { useState, useRef, useEffect } from "react";
import "./boutique.css";
import Produit from "./Produit";
import api from "../../api";

function Boutique(props) {
  const [showCart, setShowCart] = useState(false);

  const [filterSelection, setFilterSelection] = useState("all");
  const [filterText, setFilterText] = useState("");

  const searchRef = useRef(null);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.getProduits().then((response) => {
      if (response.data) {
        setProducts(response.data);
      }
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
    api
      .newCommande(
        JSON.stringify(
          props.panier.map((p) => ({ id: p.id, quantity: p.quantity }))
        )
      )
      .then((response) => {
        if (response.data) {
          props.setPanier([]);
        }
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
        tabindex="-1"
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
                  <li className="list-group-item d-flex justify-content-between align-items-center">
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
        <form>
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
              <option value="all" selected>
                Choose...
              </option>
              <option value="maillot">Maillots</option>
              <option value="équipement">Équipements</option>
              <option value="foot">Football</option>
            </select>
          </div>
        </form>
      </div>
      <div className="d-grid gap-3 produits">
        {products
          .filter((product) => {
            if (filterSelection === "all") {
              return true;
            } else {
              return (
                product.description
                  .toLowerCase()
                  .includes(filterSelection.toLowerCase()) ||
                product.nom
                  .toLowerCase()
                  .includes(filterSelection.toLowerCase())
              );
            }
          })
          .filter((product) => {
            return (
              product.nom.toLowerCase().includes(filterText.toLowerCase()) ||
              product.description
                .toLowerCase()
                .includes(filterText.toLowerCase())
            );
          })
          .map((product) => (
            <Produit
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
