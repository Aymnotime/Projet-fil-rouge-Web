const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  session({
    secret: "dsof82445qs*2E",
    resave: false,
    saveUninitialized: true,
  })
);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

app.get("/api", (req, res) => {
  res.send("API is up");
});

app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.send({ success: true, user: req.session.user });
  } else {
    res.send({ success: false, message: "Non connecté" });
  }
});

app.post("/api/user", (req, res) => {
    if (!req.session.user) {
        res.send({ success: false, message: "Non connecté" });
        return;
    }

    const { nom, prenom, email } = req.body;

    if (!nom || !prenom || !email) {
        res.send({ success: false, message: "Veuillez remplir tous les champs" });
        return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        res.send({ success: false, message: "Email invalide" });
        return;
    }

    const id = req.session.user.id;

    pool.query('UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE id = ?', [nom, prenom, email, id], (err, rows) => {
        if (err) {
            res.send({ success: false, message: err });
        } else {
            req.session.user.nom = nom;
            req.session.user.prenom = prenom;
            req.session.user.email = email;
            res.send({ success: true, message: "success" });
        }
    });
});

app.post("/api/password", (req, res) => {
    if (!req.session.user) {
        res.send({ success: false, message: "Non connecté" });
        return;
    }

    const { oldPassword, password, confirm } = req.body;

    if (!oldPassword || !password || !confirm) {
        res.send({ success: false, message: "Veuillez remplir tous les champs" });
        return;
    }

    if (password.length < 8) {
        res.send({ success: false, message: "Mot de passe trop court" });
        return;
    }

    if (password !== confirm) {
        res.send({ success: false, message: "Les mots de passe ne correspondent pas" });
        return;
    }

    const id = req.session.user.id;

    pool.query('SELECT * FROM utilisateur WHERE id = ?', [id], (err, rows) => {
        if (err) {
            res.send({ success: false, message: err });
        } else {
            bcrypt.compare(oldPassword, rows[0].mdp, (err, result) => {
                if (result) {
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (err) {
                            res.send({ success: false, message: err });
                        } else {
                            pool.query('UPDATE utilisateur SET mdp = ? WHERE id = ?', [hash, id], (err, rows) => {
                                if (err) {
                                    res.send({ success: false, message: err });
                                } else {
                                    res.send({ success: true, message: "success" });
                                }
                            });
                        }
                    });
                } else {
                    res.send({ success: false, message: "Mot de passe incorrect" });
                }
            });
        }
    });
});

app.post("/api/commande", (req, res) => {
    if (!req.session.user) {
        res.send({ success: false, message: "Non connecté" });
        return;
    }

    const { produits } = req.body;

    if (!produits) {
        res.send({ success: false, message: "Veuillez remplir tous les champs" });
        return;
    }

    const id = uuid.v4();
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const produitsParsed = JSON.parse(produits);

    pool.query('SELECT * FROM produits', (err, rows) => {
        if (err) {
            res.send({ success: false, message: err });
        } else {
            const stock = rows;
            let allProductsExist = true;
            let total = 0;
            produitsParsed.forEach((produit) => {
                const product = stock.find((p) => p.id === produit.id);
                if (!product) {
                    allProductsExist = false;
                } else {
                    total += product.prix * produit.quantite;
                }
            });

            if (!allProductsExist) {
                res.send({ success: false, message: "Un ou plusieurs produits n'existent pas" });
                return;
            }

            pool.query('INSERT INTO commande (id, date, produits, id_utilisateur) VALUES (?, ?, ?, ?)', [id, date, produits, req.session.user.id], (err, rows) => {
                if (err) {
                    res.send({ success: false, message: err });
                }

                res.send({ success: true, message: "success" });
            });
        }
    });
});

app.get("/api/commandes", (req, res) => {
    if (!req.session.user) {
        res.send({ success: false, message: "Non connecté" });
    }

    pool.query('SELECT * FROM commande WHERE id_utilisateur = ?', [req.session.user.id], (err, rows) => {
        if (err) {
            res.send({ success: false, message: err });
        }

        const commands = rows;
        pool.query('SELECT * FROM produits', (err, rows) => {
            if (err) {
                res.send({ success: false, message: err });
            }

            const stock = rows;
            const commandsWithProducts = commands.map((command) => {
                const products = JSON.parse(command.produits);
                const productsWithDetails = products.map((product) => {
                    const productDetails = stock.find((p) => p.id === product.id);
                    return {
                        ...product,
                        nom: productDetails.nom,
                        prix: productDetails.prix,
                        image: productDetails.image,
                        description: productDetails.description,
                    };
                });

                return {
                    ...command,
                    produits: productsWithDetails,
                };
            });

            res.send({ success: true, commands: commandsWithProducts });
        });
    });
});



app.get("/api/produits", (req, res) => {
  // On fait un JOIN pour récupérer le nom de la catégorie
  pool.query(`
    SELECT p.*, c.nom AS categorie
    FROM produits p
    LEFT JOIN categorie c ON p.categorie_id = c.id
    LIMIT 20
  `, (err, rows) => {
    if (err) {
      res.send({ error: err });
    } else {
      res.send(rows);
    }
  });
});

app.delete("/api/produits/:id", (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM produits WHERE id = ?", [id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, message: "success" });
    }
  });
});

app.post("/api/produits", (req, res) => {
  const nom = req.body.nom;
  const quantite = req.body.quantite;
  const prix = req.body.prix;
  const description = req.body.description;
  const id = uuid.v4();
  pool.query(
    "INSERT INTO produits (nom, quantite, prix, description, id) VALUES (?, ?, ?, ?, ?)",
    [nom, quantite, prix, description, id],
    (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        res.send({ success: true, message: "success" });
      }
    }
  );
});

const annonces = [
  {
    id: "123",
    nom: "annonce 1",
    contenu: "description 1",
    auteur: "Auteur",
  },
];

app.get("/api/annonces", (req, res) => {
  res.send(annonces);
});

app.post("/api/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.send({ success: false, message: "Veuillez remplir tous les champs" });
    return;
  }

  // 1. Vérifier si l'utilisateur est archivé
  pool.query(
    "SELECT * FROM utilisateur_archive WHERE email = ?",
    [email],
    (err, archivedRows) => {
      if (err) {
        res.send({ error: err });
        return;
      }

      if (archivedRows.length > 0) {
        // Utilisateur archivé => bloqué
        res.send({
          success: false,
          message: "Ce compte a été archivé et ne peut plus se connecter.",
        });
        return;
      }

      // 2. Vérifier dans la table utilisateur normale
      pool.query(
        "SELECT * FROM utilisateur WHERE email = ?",
        [email],
        (err, rows) => {
          if (err) {
            res.send({ error: err });
          } else {
            if (rows.length > 0) {
              bcrypt.compare(password, rows[0].mdp, (err, result) => {
                if (result) {
                  const user = rows[0];

                  // 🔁 Mettre à jour la date de dernière connexion
                  pool.query(
                    "UPDATE utilisateur SET derniere_connexion = NOW() WHERE id = ?",
                    [user.id],
                    (updateErr) => {
                      if (updateErr) {
                        console.error("Erreur mise à jour dernière connexion :", updateErr);
                      }
                    }
                  );

                  req.session.user = {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    fonction: user.fonction,
                  };

                  res.send({ success: true, message: "success" });
                } else {
                  res.send({
                    success: false,
                    message: "Mot de passe ou email incorrect",
                  });
                }
              });
            } else {
              res.send({
                success: false,
                message: "Mot de passe ou email incorrect",
              });
            }
          }
        }
      );
    }
  );
});


app.delete("/api/user", (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: "Non connecté" });
    return;
  }

  const userId = req.session.user.id;

  // Supprimer ou anonymiser les données associées
  pool.query(
    `
    DELETE FROM commande WHERE id_utilisateur = ?;
    DELETE FROM adresse WHERE id_utilisateur = ?;
    UPDATE utilisateur SET nom = 'Anonyme', prenom = 'Anonyme', email = CONCAT('anonyme_', id, '@example.com'), mdp = '', fonction = 'anonyme' WHERE id = ?;
    `,
    [userId, userId, userId],
    (err, result) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        // Détruire la session après suppression
        req.session.destroy();
        res.send({ success: true, message: "Compte utilisateur supprimé avec succès" });
      }
    }
  );
});
app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.send({ success: true, message: "success" });
});

app.post("/api/register", (req, res) => {
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const email = req.body.email;
  const password = req.body.password;
  const confirm = req.body.confirm;

  // check all fields are filled
  if (!nom || !prenom || !email || !password || !confirm) {
    res.send({ success: false, message: "Veuillez remplir tous les champs" });
    return;
  }

  // check email is valid with regex
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    res.send({ success: false, message: "Email invalide" });
    return;
  }

  // check password length
  if (password.length < 8) {
    res.send({ success: false, message: "Mot de passe trop court" });
    return;
  }

  // check password and confirm password match
  if (password !== confirm) {
    res.send({
      success: false,
      message: "Les mots de passe ne correspondent pas",
    });
    return;
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      pool.query(
        "INSERT INTO utilisateur (nom, prenom, email, mdp, fonction) VALUES (?, ?, ?, ?, ?)",
        [nom, prenom, email, hash, "client"],
        (err, result) => {
          if (err) {
            res.send({ success: false, message: err });
          } else {
            pool.query(
              "SELECT * FROM utilisateur WHERE email = ?",
              [email],
              (err, rows) => {
                if (err) {
                  res.send({ success: false, message: err });
                } else {
                  const user = rows[0];
                  req.session.user = {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    fonction: user.fonction,
                  };
                  res.send({
                    success: true,
                    message: "User successfully created",
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

const PDFDocument = require("pdfkit"); // Importer pdfkit

app.get("/api/user/pdf", (req, res) => {
  if (!req.session.user) {
    res.status(401).send({ success: false, message: "Non connecté" });
    return;
  }

  // Récupérer les données de l'utilisateur
  const user = req.session.user;

  // Créer un nouveau document PDF
  const doc = new PDFDocument();

  // Configurer l'en-tête de réponse pour le téléchargement
  const fileName = `${user.nom}_${user.prenom}_données.pdf`.replace(/ /g, "_"); // Remplacer les espaces par des underscores
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  // Ajouter les données personnelles au PDF
  doc.pipe(res); // Envoyer le PDF directement dans la réponse HTTP
  doc.fontSize(20).text("Données personnelles", { underline: true });
  doc.moveDown();
  doc.fontSize(14).text(`Nom : ${user.nom}`);
  doc.text(`Prénom : ${user.prenom}`);
  doc.text(`Email : ${user.email}`);
  doc.text(`Fonction : ${user.fonction}`);
  doc.moveDown();

  // Terminer le PDF
  doc.end();
});


app.delete("/api/user/delete", (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: "Non connecté" });
    return;
  }

  const userId = req.session.user.id;

  // Supprimer les données associées dans la table commande
  pool.query("DELETE FROM commande WHERE id_utilisateur = ?", [userId], (err) => {
    if (err) {
      console.error("Erreur SQL (commande) :", err);
      res.send({ success: false, message: err });
      return;
    }

    // Supprimer l'utilisateur
    pool.query("DELETE FROM utilisateur WHERE id = ?", [userId], (err) => {
      if (err) {
        console.error("Erreur SQL (utilisateur) :", err);
        res.send({ success: false, message: err });
        return;
      }

      // Détruire la session après suppression
      req.session.destroy((err) => {
        if (err) {
          console.error("Erreur destruction session :", err);
          res.send({ success: false, message: "Utilisateur supprimé, mais erreur de déconnexion" });
          return;
        }

        res.send({ success: true, message: "Compte utilisateur supprimé avec succès" });
      });
    });
  });
});

require('dotenv').config({ path: './back/.env' });  

require('./archiveUsers');

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Route pour récupérer toutes les catégories
app.get('/api/categories', (req, res) => {
  pool.query('SELECT * FROM categorie', (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, categories: rows });
    }
  });
});

// --- Gestion du panier persistant ---
// Ajouter un produit au panier
app.post('/api/panier', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }
  const { id_produit, quantite } = req.body;
  if (!id_produit || !quantite) {
    res.send({ success: false, message: 'Données manquantes' });
    return;
  }
  // Vérifier si le produit est déjà dans le panier
  pool.query('SELECT * FROM panier WHERE id_utilisateur = ? AND id_produit = ?', [req.session.user.id, id_produit], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else if (rows.length > 0) {
      // Mettre à jour la quantité
      pool.query('UPDATE panier SET quantite = quantite + ? WHERE id_utilisateur = ? AND id_produit = ?', [quantite, req.session.user.id, id_produit], (err) => {
        if (err) {
          res.send({ success: false, message: err });
        } else {
          res.send({ success: true, message: 'Quantité mise à jour' });
        }
      });
    } else {
      // Ajouter une nouvelle ligne
      pool.query('INSERT INTO panier (id_utilisateur, id_produit, quantite) VALUES (?, ?, ?)', [req.session.user.id, id_produit, quantite], (err) => {
        if (err) {
          res.send({ success: false, message: err });
        } else {
          res.send({ success: true, message: 'Produit ajouté au panier' });
        }
      });
    }
  });
});

// Lire le panier avec infos produit dynamiques
app.get('/api/panier', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }
  pool.query(`
    SELECT p.id, p.id_produit, p.quantite, pr.nom, pr.image, pr.prix, pr.brand_name
    FROM panier p
    JOIN produits pr ON p.id_produit = pr.id
    WHERE p.id_utilisateur = ?
  `, [req.session.user.id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, panier: rows });
    }
  });
});

// Supprimer un produit du panier
app.delete('/api/panier/:id_produit', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }
  const id_produit = req.params.id_produit;
  pool.query('DELETE FROM panier WHERE id_utilisateur = ? AND id_produit = ?', [req.session.user.id, id_produit], (err) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, message: 'Produit supprimé du panier' });
    }
  });
});

// Modifier la quantité d'un produit dans le panier
app.put('/api/panier/:id_produit', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }
  const id_produit = req.params.id_produit;
  const { quantite } = req.body;
  if (!quantite || quantite < 1) {
    res.send({ success: false, message: 'Quantité invalide' });
    return;
  }
  pool.query('UPDATE panier SET quantite = ? WHERE id_utilisateur = ? AND id_produit = ?', [quantite, req.session.user.id, id_produit], (err, result) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, message: 'Quantité modifiée' });
    }
  });
});
