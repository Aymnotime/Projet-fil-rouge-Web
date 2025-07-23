import React, { useEffect } from "react";
import "./compte.css";
import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import CommandePage from "./commande/commande";
import Confidentialité from "../confidentialite/index";
import { useLocation } from "react-router-dom";

function Compte(props) {
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [password, setPassword] = useState("");
  const [modifie, setModifie] = useState(false);
  const [mdpmodifie, setMdpodifie] = useState(false);
  const location = useLocation();
  const [activeKey, setActiveKey] = useState("0");

  useEffect(() => {
    // Vérifie le paramètre d'URL pour ouvrir l'onglet Commandes
    const params = new URLSearchParams(location.search);
    if (params.get("onglet") === "commandes") {
      setActiveKey("1");
    }
  }, [location.search]);

  // Mise à jour de l'état local lorsque les props changent
  useEffect(() => {
    if (props.user) {
      setEmail(props.user.email || "");
      setNom(props.user.nom || "");
      setPrenom(props.user.prenom || "");
      setPassword(props.user.password || ""); // Soyez prudent avec les mots de passe
    }
  }, [props.user]);

  const handleChange = (updateFunc) => (e) => {
    updateFunc(e.target.value);
    setModifie(true);
  };
  const changementdemotdepasse = () => {
    setMdpodifie(true);
  };
  return (
    <div className="compte">
      <Accordion activeKey={activeKey} onSelect={setActiveKey}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <i className="bi bi-person-circle"></i>
            Paramètres
          </Accordion.Header>
          <Accordion.Body>
            <h4>
              Fonction :{" "}
              <strong className="fonctionjoueur">
                {props.user && props.user.fonction}
              </strong>
            </h4>
            <div className="d-flex ">
              <Form>
                <Form.Group
                  className="mb-3 w-100 p-4"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Adresse Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={handleChange(setEmail)}
                  />

                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={nom}
                    onChange={handleChange(setNom)}
                  />

                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    value={prenom}
                    onChange={handleChange(setPrenom)}
                  />
                  {modifie && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        /* Logique de confirmation ici */
                      }}
                      className="fade-in mt-4 w-50"
                    >
                      Confirmer
                    </Button>
                  )}
                </Form.Group>
              </Form>
              <div className="petittraitaccount"></div>
              <Form>
                <Form.Group
                  className="mb-3 w-100 p-4"
                  controlId="exampleForm.ControlInput1"
                >
                  <br />

                  {mdpmodifie == false && (
                    <Button
                      variant="primary"
                      onClick={changementdemotdepasse}
                      className="w-100"
                    >
                      Modifier votre mot de passe
                    </Button>
                  )}
                  {/* Bouton pour télécharger les données utilisateur en PDF */}
                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      fetch("/api/user/pdf", {
                                        method: "GET",
                                        headers: {
                                          "Content-Type": "application/pdf",
                                        },
                                      })
                                        .then((response) => {
                                          if (response.ok) {
                                            return response.blob();
                                          } else {
                                            throw new Error("Erreur lors de la récupération du PDF");
                                          }
                                        })
                                        .then((blob) => {
                                          const url = window.URL.createObjectURL(blob);
                                          const a = document.createElement("a");
                                          a.href = url;

                                          // Utiliser le nom et le prénom de l'utilisateur pour nommer le fichier
                                          const fileName = `${props.user.nom}_${props.user.prenom}_données.pdf`.replace(/ /g, "_");
                                          a.download = fileName;

                                          document.body.appendChild(a);
                                          a.click();
                                          a.remove();
                                        })
                                        .catch((error) => {
                                          console.error(error);
                                          alert("Une erreur est survenue lors de la récupération du PDF.");
                                        });
                                    }}
                                    className="mt-3 w-100"
                                  >
                                    Télécharger mes données en PDF
                                  </Button>

                                  <Button
                                    variant="danger"
                                    onClick={() => {
                                      if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
                                        fetch("/api/user/delete", {
                                          method: "DELETE",
                                          credentials: "include", // Inclure les cookies de session
                                        })
                                          .then((response) => response.json())
                                          .then((data) => {
                                            if (data.success) {
                                              alert("Votre compte a été supprimé avec succès.");
                                              window.location.href = "/"; // Rediriger après suppression
                                            } else {
                                              alert("Erreur : " + JSON.stringify(data));
                                            }
                                          })
                                          .catch((error) => {
                                            console.error("Erreur réseau :", error);
                                            alert("Une erreur est survenue lors de la suppression de votre compte.");
                                          });
                                      }
                                    }}
                                    className="mt-3 w-100"
                                  >
                                    Supprimer mon compte
                                  </Button>
                  {mdpmodifie && (
                    <div className="fade-in">
                      <Form.Label>Ancien mot de passe </Form.Label>
                      <Form.Control type="text" />

                      <Form.Label>Nouveau mot de passe</Form.Label>
                      <Form.Control type="password" />
                      <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                      <Form.Control type="password" />
                      <br />

                      <Button
                        variant="primary"
                        onClick={() => {
                          /* Logique de confirmation ici */
                        }}
                        className=" mt-4 w-50"
                      >
                        Confirmer
                      </Button>
                    </div>
                  )}
                </Form.Group>
              </Form>
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item className="Accordion.Item" eventKey="1">
          <Accordion.Header>
            <i className="bi bi-box"></i>
            Commandes
          </Accordion.Header>
          <Accordion.Body>
            <CommandePage />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item className="Accordion.Item" eventKey="5">
          <Accordion.Header>
            <i className="bi bi-box"></i>
            Panier
          </Accordion.Header>
          <Accordion.Body>
            <div className="display">
              {props.panier.map((panier) => {
                return (
                  <div className="panier">
                    <img src={panier.image} className="panierimg" alt="" />
                    <p>{panier.nom}</p>
                    <p>{panier.prix}</p>
                  </div>
                );
              })}
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <i className="bi bi-android"></i>
            Application
          </Accordion.Header>
          <Accordion.Body></Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header>
            <i className="bi bi-android"></i>
            Politique de confidentialité
          </Accordion.Header>
          <Accordion.Body>
            <Confidentialité />
            
          
            
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <div className="basdepage">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#FEC817"
            fill-opacity="1"
            d="M0,160L80,160C160,160,320,160,480,181.3C640,203,800,245,960,224C1120,203,1280,117,1360,74.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}

export default Compte;
