const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const dotenv = require("dotenv");
const isAdmin = require('./isAdmin');
const cors = require('cors');
const PDFDocument = require("pdfkit");




require('dotenv').config({ path: './back/.env' });
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors({
  origin: true, 
  credentials: true               
}));


const router = express.Router();
app.use(express.json());
app.use(
  session({
    secret: "dsof82445qs*2E",
    resave: false,
    saveUninitialized: true,
    cookie: {

      secure: false, 
      sameSite: 'lax', // Protection CSRF de base
      maxAge: 24 * 60 * 60 * 1000 // 1 jour
    }
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


// ===================== ROUTES POUR LES CATÉGORIES (ADMIN) =====================

// Récupérer toutes les catégories (admin)
app.get("/api/admin/categories", isAdmin, (req, res) => {
  pool.query("SELECT * FROM categories ORDER BY nom ASC", (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des catégories:", err);
      res.status(500).send({ success: false, message: err.message });
    } else {
      console.log("Catégories récupérées:", rows.length);
      res.send({ success: true, categories: rows });
    }
  });
});

// Ajouter une nouvelle catégorie (admin)
app.post("/api/admin/categories", isAdmin, (req, res) => {
  const { nom, description } = req.body;

  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Le nom de la catégorie est obligatoire"
    });
  }

  // Vérifier si la catégorie existe déjà
  pool.query("SELECT * FROM categories WHERE nom = ?", [nom.trim()], (err, existing) => {
    if (err) {
      console.error("Erreur vérification catégorie existante:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Une catégorie avec ce nom existe déjà"
      });
    }

    // Ajouter la nouvelle catégorie
    const id = uuid.v4();
    pool.query(
      "INSERT INTO categories (id, nom, description) VALUES (?, ?, ?)",
      [id, nom.trim(), description || ""],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de l'ajout de la catégorie:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur lors de l'ajout de la catégorie",
            error: err.message
          });
        }
        
        console.log("Catégorie ajoutée avec succès, ID:", id);
        return res.json({
          success: true,
          message: "Catégorie ajoutée avec succès",
          category: {
            id,
            nom: nom.trim(),
            description: description || ""
          }
        });
      }
    );
  });
});

// Modifier une catégorie (admin)
app.put("/api/admin/categories/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  const { nom, description } = req.body;

  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Le nom de la catégorie est obligatoire"
    });
  }

  // Vérifier si une autre catégorie avec ce nom existe déjà
  pool.query("SELECT * FROM categories WHERE nom = ? AND id != ?", [nom.trim(), id], (err, existing) => {
    if (err) {
      console.error("Erreur vérification catégorie existante:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Une autre catégorie avec ce nom existe déjà"
      });
    }

    // Modifier la catégorie
    pool.query(
      "UPDATE categories SET nom = ?, description = ? WHERE id = ?",
      [nom.trim(), description || "", id],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de la modification de la catégorie:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la modification de la catégorie",
            error: err.message
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Catégorie non trouvée"
          });
        }
        
        console.log("Catégorie modifiée avec succès, ID:", id);
        return res.json({
          success: true,
          message: "Catégorie modifiée avec succès",
          category: {
            id,
            nom: nom.trim(),
            description: description || ""
          }
        });
      }
    );
  });
});

// Supprimer une catégorie (admin)
app.delete("/api/admin/categories/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  
  // Vérifier d'abord si des produits utilisent cette catégorie
  pool.query("SELECT COUNT(*) as count FROM produits WHERE categorie_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur vérification produits liés:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    const produitsLies = result[0].count;
    if (produitsLies > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer cette catégorie car ${produitsLies} produit(s) l'utilisent encore.`
      });
    }

    // Supprimer la catégorie
    pool.query("DELETE FROM categories WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Erreur suppression catégorie:", err);
        res.status(500).send({ success: false, message: err.message });
      } else if (result.affectedRows === 0) {
        res.status(404).send({ success: false, message: "Catégorie non trouvée" });
      } else {
        console.log("Catégorie supprimée:", id);
        res.send({ success: true, message: "Catégorie supprimée avec succès" });
      }
    });
  });
});

// Retourne tous les utilisateurs (admin seulement)
app.get("/api/admin/utilisateurs", isAdmin, (req, res) => {
  pool.query("SELECT id, nom, prenom, email, fonction FROM utilisateur", (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, utilisateurs: rows });
    }
  });
});

// Retourne les commandes d'un utilisateur (admin seulement)
app.get("/api/admin/commandes/:id_utilisateur", isAdmin, (req, res) => {
  const userId = req.params.id_utilisateur;
  pool.query("SELECT * FROM commande WHERE id_utilisateur = ?", [userId], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, commandes: rows });
    }
  });
});

// Mettre à jour le statut d'une commande (admin seulement)
app.put("/api/admin/commandes/:id/statut", isAdmin, (req, res) => {
  const { id } = req.params;
  const { statutPaiement } = req.body;
  
  if (!statutPaiement) {
    return res.status(400).json({ 
      success: false, 
      message: "Le statut de paiement est requis" 
    });
  }
  
  // Vérifier que le statut est valide
  const statutsValides = ["En attente", "Payé", "Commande en cours", "Expédition de la commande", "Livré"];
  if (!statutsValides.includes(statutPaiement)) {
    return res.status(400).json({
      success: false,
      message: "Statut de paiement non valide"
    });
  }
  
  // Mise à jour dans la base de données - utiliser statut_paiement comme nom de colonne
  pool.query(
    "UPDATE commande SET statut_paiement = ? WHERE id = ?", 
    [statutPaiement, id],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du statut:", err);
        return res.status(500).json({
          success: false,
          message: "Erreur serveur lors de la mise à jour du statut"
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Commande non trouvée"
        });
      }
      
      res.json({
        success: true,
        message: "Statut de la commande mis à jour avec succès"
      });
    }
  );
});

// Retourne tous les produits (admin seulement)
app.get("/api/admin/produits", isAdmin, (req, res) => {
  pool.query("SELECT * FROM produits", (err, rows) => {
    if (err) {
      res.status(500).send({ success: false, message: err.message });
    } else {
      res.send({ success: true, produits: rows });
    }
  });
});

// Ajouter un nouveau produit (admin seulement)
app.post("/api/admin/produits", isAdmin, (req, res) => {
  console.log("Requête reçue pour ajouter un produit:", req.body);
  
  const { nom, prix, description, quantite, image, categorie_id } = req.body; // Ajouter categorie_id

  // Validation de base
  if (!nom || !prix) {
    return res.status(400).json({
      success: false,
      message: "Le nom et le prix sont obligatoires"
    });
  }

  // Générer un ID unique
  const id = uuid.v4();
  console.log("ID généré pour le nouveau produit:", id);
  
  pool.query(
    "INSERT INTO produits (id, nom, prix, description, quantite, image, categorie_id) VALUES (?, ?, ?, ?, ?, ?, ?)", // Ajouter categorie_id
    [id, nom, parseFloat(prix).toFixed(2), description || "", quantite || 0, image || "", categorie_id || null], // Ajouter categorie_id
    (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout du produit:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors de l'ajout du produit",
          error: err.message
        });
      }
      
      console.log("Produit ajouté avec succès, ID:", id);
      return res.json({
        success: true,
        message: "Produit ajouté avec succès",
        produit: {
          id,
          nom,
          prix: parseFloat(prix).toFixed(2),
          description: description || "",
          quantite: quantite || 0,
          image: image || "",
          categorie_id: categorie_id || null // Ajouter categorie_id
        }
      });
    }
  );
});
// Supprimer un utilisateur (admin seulement)
app.delete("/api/admin/utilisateurs/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM utilisateur WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true });
    }
  });
});

// Supprimer une commande (admin seulement)
app.delete("/api/admin/commandes/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM commande WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true });
    }
  });
});

// Supprimer un produit (admin seulement)
app.delete("/api/admin/produits/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM produits WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true });
    }
  });
});


// Ajoutez ces routes après les autres routes admin (vers ligne 400)

// ===================== ROUTES POUR LES STATISTIQUES DE VENTES =====================

// Statistiques des ventes par jour
app.get("/api/admin/stats/ventes-par-jour", isAdmin, (req, res) => {
  const query = `
    SELECT 
      DATE(c.date) as date_vente,
      COUNT(*) as nombre_commandes,
      SUM(
        CASE 
          WHEN c.produits LIKE '%:%' THEN
            (SELECT SUM(
              CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(item.value, ':', -1), ',', 1) AS DECIMAL(10,2)) * 
              p.prix
            ) FROM JSON_TABLE(
              CONCAT('[', REPLACE(REPLACE(c.produits, ':', '":'), ',', ',"'), ']'), 
              '$[*]' COLUMNS (value VARCHAR(255) PATH '$')
            ) item
            JOIN produits p ON p.id = SUBSTRING_INDEX(item.value, ':', 1))
          ELSE
            (SELECT SUM(p.prix) FROM produits p 
             WHERE FIND_IN_SET(p.id, c.produits))
        END
      ) as chiffre_affaires
    FROM commande c
    WHERE c.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND c.statut_paiement IN ('Payé', 'paye')
    GROUP BY DATE(c.date)
    ORDER BY DATE(c.date) DESC
    LIMIT 30
  `;

  pool.query(query, (err, rows) => {
    if (err) {
      console.error("Erreur statistiques ventes par jour:", err);
      res.status(500).send({ success: false, message: err.message });
    } else {
      res.send({ success: true, data: rows });
    }
  });
});

// Statistiques du panier moyen
app.get("/api/admin/stats/panier-moyen", isAdmin, (req, res) => {
  const query = `
    SELECT 
      DATE(c.date) as date_commande,
      AVG(
        CASE 
          WHEN c.produits LIKE '%:%' THEN
            (SELECT SUM(
              CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(item.value, ':', -1), ',', 1) AS DECIMAL(10,2)) * 
              p.prix
            ) FROM JSON_TABLE(
              CONCAT('[', REPLACE(REPLACE(c.produits, ':', '":'), ',', ',"'), ']'), 
              '$[*]' COLUMNS (value VARCHAR(255) PATH '$')
            ) item
            JOIN produits p ON p.id = SUBSTRING_INDEX(item.value, ':', 1))
          ELSE
            (SELECT SUM(p.prix) FROM produits p 
             WHERE FIND_IN_SET(p.id, c.produits))
        END
      ) as panier_moyen,
      COUNT(*) as nombre_commandes
    FROM commande c
    WHERE c.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND c.statut_paiement IN ('Payé', 'paye')
    GROUP BY DATE(c.date)
    ORDER BY DATE(c.date) DESC
    LIMIT 30
  `;

  pool.query(query, (err, rows) => {
    if (err) {
      console.error("Erreur statistiques panier moyen:", err);
      res.status(500).send({ success: false, message: err.message });
    } else {
      res.send({ success: true, data: rows });
    }
  });
});

// Statistiques des ventes par catégorie
app.get("/api/admin/stats/ventes-par-categorie", isAdmin, (req, res) => {
  const query = `
    SELECT 
      COALESCE(cat.nom, 'Sans catégorie') as categorie,
      COUNT(DISTINCT c.id) as nombre_commandes,
      SUM(
        CASE 
          WHEN c.produits LIKE '%:%' THEN
            (SELECT SUM(
              CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(item.value, ':', -1), ',', 1) AS DECIMAL(10,2)) * 
              p.prix
            ) FROM JSON_TABLE(
              CONCAT('[', REPLACE(REPLACE(c.produits, ':', '":'), ',', ',"'), ']'), 
              '$[*]' COLUMNS (value VARCHAR(255) PATH '$')
            ) item
            JOIN produits p ON p.id = SUBSTRING_INDEX(item.value, ':', 1)
            WHERE p.categorie_id = cat.id)
          ELSE
            (SELECT SUM(p.prix) FROM produits p 
             WHERE FIND_IN_SET(p.id, c.produits) AND p.categorie_id = cat.id)
        END
      ) as chiffre_affaires
    FROM commande c
    CROSS JOIN produits p
    LEFT JOIN categories cat ON p.categorie_id = cat.id
    WHERE c.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND c.statut_paiement IN ('Payé', 'paye')
      AND (
        (c.produits LIKE '%:%' AND FIND_IN_SET(SUBSTRING_INDEX(c.produits, ':', 1), c.produits)) OR
        (c.produits NOT LIKE '%:%' AND FIND_IN_SET(p.id, c.produits))
      )
    GROUP BY cat.id, cat.nom
    HAVING chiffre_affaires > 0
    ORDER BY chiffre_affaires DESC
  `;

  pool.query(query, (err, rows) => {
    if (err) {
      console.error("Erreur statistiques ventes par catégorie:", err);
      res.status(500).send({ success: false, message: err.message });
    } else {
      res.send({ success: true, data: rows });
    }
  });
});

// Statistiques générales du dashboard
app.get("/api/admin/stats/generales", isAdmin, (req, res) => {
  const queries = {
    totalCommandes: `
      SELECT COUNT(*) as total 
      FROM commande 
      WHERE statut_paiement IN ('Payé', 'paye')
    `,
    chiffreAffairesTotal: `
      SELECT SUM(
        CASE 
          WHEN c.produits LIKE '%:%' THEN
            (SELECT SUM(
              CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(item.value, ':', -1), ',', 1) AS DECIMAL(10,2)) * 
              p.prix
            ) FROM JSON_TABLE(
              CONCAT('[', REPLACE(REPLACE(c.produits, ':', '":'), ',', ',"'), ']'), 
              '$[*]' COLUMNS (value VARCHAR(255) PATH '$')
            ) item
            JOIN produits p ON p.id = SUBSTRING_INDEX(item.value, ':', 1))
          ELSE
            (SELECT SUM(p.prix) FROM produits p 
             WHERE FIND_IN_SET(p.id, c.produits))
        END
      ) as total
      FROM commande c
      WHERE c.statut_paiement IN ('Payé', 'paye')
    `,
    totalUtilisateurs: `SELECT COUNT(*) as total FROM utilisateur`,
    totalProduits: `SELECT COUNT(*) as total FROM produits`
  };

  const results = {};
  let completedQueries = 0;
  let hasError = false;

  Object.keys(queries).forEach(key => {
    pool.query(queries[key], (err, rows) => {
      if (err && !hasError) {
        hasError = true;
        console.error(`Erreur statistique ${key}:`, err);
        return res.status(500).send({ success: false, message: err.message });
      }
      
      if (!hasError) {
        results[key] = rows[0].total || 0;
        completedQueries++;
        
        if (completedQueries === Object.keys(queries).length) {
          res.send({ success: true, data: results });
        }
      }
    });
  });
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

app.post("/api/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log("Tentative de connexion:", email);
  
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
        console.error("Erreur vérification utilisateur archivé:", err);
        res.status(500).send({ success: false, error: err.message });
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
            console.error("Erreur recherche utilisateur:", err);
            res.status(500).send({ success: false, error: err.message });
            return;
          } 
          
          if (rows.length > 0) {
            const user = rows[0];
            
            bcrypt.compare(password, user.mdp, (err, result) => {
              if (err) {
                console.error("Erreur comparaison mot de passe:", err);
                res.status(500).send({ success: false, error: err.message });
                return;
              }
              
              if (result) {
                // Vérifier le rôle si accès admin est demandé
                if (req.body.requireAdmin && user.fonction !== 'admin') {
                  res.send({ success: false, message: "Accès réservé aux administrateurs" });
                  return;
                }

                // 🔁 Mettre à jour la date de dernière connexion
                pool.query(
                  "UPDATE utilisateur SET derniere_connexion = NOW() WHERE id = ?",
                  [user.id],
                  (updateErr) => {
                    if (updateErr) {
                      console.error("Erreur mise à jour dernière connexion:", updateErr);
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
                
                console.log("Connexion réussie pour", email, "- fonction:", user.fonction);
                res.send({ success: true, message: "success", user: req.session.user });
              } else {
                console.log("Échec connexion - mot de passe incorrect pour", email);
                res.send({
                  success: false,
                  message: "Mot de passe ou email incorrect",
                });
              }
            });
          } else {
            console.log("Échec connexion - utilisateur non trouvé:", email);
            res.send({
              success: false,
              message: "Mot de passe ou email incorrect",
            });
          }
        }
      );
    }
  );
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
    return res.status(401).send({ success: false, message: "Non connecté" });
  }

  pool.query('SELECT * FROM commande WHERE id_utilisateur = ?', [req.session.user.id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
      return;
    }

    const commands = rows;
    pool.query('SELECT * FROM produits', (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
        return;
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

app.get("/api/equipes", (req, res) => {
  pool.query("SELECT * FROM equipe", (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, equipes: rows });
    }
  });
});

app.get('/api/articles', (req, res) => {
    pool.query('SELECT * FROM article', (err, rows) => {
        if (err) {
            res.send({ 'success': false, 'message': err });
        } else {
            res.send({ 'success': true, 'articles': rows });
        }
    });
});

app.get("/api/produits", (req, res) => {
  pool.query("SELECT * FROM produits", (err, rows) => {
    if (err) {
      res.send({ error: err });
    } else {
      res.send(rows.slice(0, 20));
    }
  });
});

// Corriger cette route pour utiliser la table stock au lieu de produits
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

// Corriger cette route pour utiliser la table stock au lieu de produits
app.post("/api/produits", (req, res) => {
  const nom = req.body.nom;
  const quantite = req.body.quantite || 0;
  const prix = req.body.prix;
  const description = req.body.description || "";
  const id = uuid.v4();
  
  pool.query(
    "INSERT INTO produits (id, nom, quantite, prix, description) VALUES (?, ?, ?, ?, ?)",
    [id, nom, quantite, prix, description],
    (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        res.send({ 
          success: true, 
          message: "success",
          produit: {
            id,
            nom,
            quantite,
            prix,
            description
          }
        });
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

app.get("/api/logout", (req, res) => {
  const userEmail = req.session.user?.email;
  console.log("Déconnexion utilisateur:", userEmail);
  
  req.session.destroy(err => {
    if (err) {
      console.error("Erreur lors de la destruction de la session:", err);
      res.status(500).send({ success: false, message: "Erreur de déconnexion" });
    } else {
      res.send({ success: true, message: "success" });
    }
  });
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

 
  doc.end();
});

app.delete("/api/user/delete", (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: "Non connecté" });
    return;
  }

  const userId = req.session.user.id;

  
  pool.query("DELETE FROM commande WHERE id_utilisateur = ?", [userId], (err) => {
    if (err) {
      console.error("Erreur SQL (commande) :", err);
      res.send({ success: false, message: err });
      return;
    }


    pool.query("DELETE FROM utilisateur WHERE id = ?", [userId], (err) => {
      if (err) {
        console.error("Erreur SQL (utilisateur) :", err);
        res.send({ success: false, message: err });
        return;
      }

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


app.post('/api/check-admin', (req, res) => {
  if (req.session.user && req.session.user.fonction === 'admin') {
    res.json({ 
      isAdmin: true, 
      user: {
        id: req.session.user.id,
        nom: req.session.user.nom,
        email: req.session.user.email,
        fonction: req.session.user.fonction
      }
    });
  } else {
    res.json({ isAdmin: false });
  }
});

app.post("/api/create-payment-intent", async (req, res) => {
  const { amount, commande_id } = req.body;

  console.log("📝 Demande de Payment Intent:", { amount, commande_id });

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Montant invalide" });
  }

  try {
    // 1. Créer le Payment Intent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convertir en centimes
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("✅ Payment Intent créé:", paymentIntent.id);

    // 2. Sauvegarder en base de données (AVEC pool au lieu de db)
    const paiementId = uuid.v4();
    const insertPaiementQuery = `
      INSERT INTO paiements (
        id, 
        payment_intent_id, 
        commande_id, 
        montant, 
        devise, 
        statut, 
        date_creation
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    await pool.promise().execute(insertPaiementQuery, [
      paiementId,
      paymentIntent.id,
      commande_id || null,
      amount,
      'EUR',
      'pending'
    ]);

    console.log("✅ Paiement sauvegardé en BDD:", paiementId);

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paiementId: paiementId
    });

  } catch (err) {
    console.error("❌ Erreur:", err);
    
    // Si erreur de base de données mais Payment Intent créé
    if (err.code && err.code.startsWith('ER_')) {
      console.error("❌ Erreur BDD:", err.message);
      return res.status(500).json({ error: "Erreur de sauvegarde en base de données" });
    }
    
    // Erreur Stripe
    res.status(500).json({ error: err.message });
  }
});

// Route pour mettre à jour le statut du paiement
app.post("/api/update-payment-status", async (req, res) => {
  const { payment_intent_id, statut, commande_id } = req.body;

  console.log("🔄 Mise à jour statut paiement:", { payment_intent_id, statut, commande_id });

  try {
    // Mettre à jour le statut du paiement
    const updateQuery = `
      UPDATE paiements 
      SET statut = ?, date_mise_a_jour = NOW() 
      WHERE payment_intent_id = ?
    `;

    const [result] = await pool.promise().execute(updateQuery, [statut, payment_intent_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Paiement non trouvé" });
    }

    // Si le paiement est réussi et qu'on a un commande_id, mettre à jour le statut de la commande
    if (statut === 'succeeded' && commande_id) {
      const updateCommandeQuery = `
        UPDATE commande 
        SET statut_paiement = 'paye', date_paiement = NOW() 
        WHERE id = ?
      `;

      try {
        await pool.promise().execute(updateCommandeQuery, [commande_id]);
        console.log("✅ Statut commande mis à jour:", commande_id);
      } catch (commandeError) {
        console.error("⚠️ Erreur mise à jour commande (non bloquant):", commandeError);
        // On ne bloque pas la réponse même si la mise à jour de la commande échoue
      }
    }

    console.log("✅ Statut paiement mis à jour:", statut);
    res.json({ 
      success: true, 
      message: "Statut mis à jour",
      payment_intent_id: payment_intent_id,
      commande_id: commande_id 
    });

  } catch (err) {
    console.error("❌ Erreur mise à jour:", err);
    res.status(500).json({ error: err.message });
  }
});




});
