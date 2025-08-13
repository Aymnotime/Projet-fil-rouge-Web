const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require("dotenv");
const isAdmin = require('./isAdmin');
const cors = require('cors');
const PDFDocument = require("pdfkit");



dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not defined in environment variables');
  process.exit(1);
}
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Configuration du transporteur email avec Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

const app = express();
app.use(cors({
  origin: true,
  credentials: true 
}));


const router = express.Router();
app.use(express.json());


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

// Middleware de log pour les requêtes
app.use(
  session({
    secret: "dsof82445qs*2E",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.session?.user?.fonction);
  next();
});


// Route publique pour récupérer les catégories
app.get("/api/categories", (req, res) => {
  pool.query("SELECT * FROM categorie ORDER BY nom ASC", (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des catégories:", err);
      res.status(500).send({ success: false, message: err.message });
    } else {
      console.log("Catégories publiques récupérées:", rows.length);
      res.send({ success: true, categories: rows });
    }
  });
});

// Récupérer toutes les catégories (admin)
app.get("/api/admin/categories", isAdmin, (req, res) => {
  pool.query("SELECT * FROM categorie ORDER BY nom ASC", (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des catégories:", err);
      res.status(500).send({ success: false, message: err.message });
    } else {
      console.log("Catégories admin récupérées:", rows.length);
      res.send({ success: true, categories: rows });
    }
  });
});

// Ajouter une nouvelle catégorie (admin)
app.post("/api/admin/categories", isAdmin, (req, res) => {
  console.log("🔵 Requête reçue pour ajouter une catégorie:", req.body);
  
  const { nom, description } = req.body;

  if (!nom || nom.trim().length === 0) {
    console.log("❌ Nom de catégorie manquant");
    return res.status(400).json({
      success: false,
      message: "Le nom de la catégorie est obligatoire"
    });
  }

  // Vérifier si la catégorie existe déjà
  pool.query("SELECT * FROM categorie WHERE nom = ?", [nom.trim()], (err, existing) => {
    if (err) {
      console.error("❌ Erreur vérification catégorie existante:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    if (existing.length > 0) {
      console.log("⚠️ Catégorie déjà existante");
      return res.status(400).json({
        success: false,
        message: "Une catégorie avec ce nom existe déjà"
      });
    }

    // Ajouter la nouvelle catégorie
    const id = uuid.v4();
    console.log("🆕 Création de la catégorie avec ID:", id);
    
    pool.query(
      "INSERT INTO categorie (id, nom, description) VALUES (?, ?, ?)",
      [id, nom.trim(), description || ""],
      (err, result) => {
        if (err) {
          console.error("❌ Erreur lors de l'ajout de la catégorie:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur lors de l'ajout de la catégorie",
            error: err.message
          });
        }
        
        console.log("✅ Catégorie ajoutée avec succès, ID:", id);
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

  pool.query(
    "UPDATE categorie SET nom = ?, description = ? WHERE id = ?",
    [nom.trim(), description || "", id],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la modification de la catégorie:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors de la modification de la catégorie"
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Catégorie non trouvée"
        });
      }
      
      res.json({
        success: true,
        message: "Catégorie modifiée avec succès"
      });
    }
  );
});

// Supprimer une catégorie (admin)
app.delete("/api/admin/categories/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  
  pool.query("DELETE FROM categorie WHERE id = ?", [id], (err, result) => {
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
  console.log(`🔍 Recherche commandes pour utilisateur: ${userId}`);
  
  pool.query(
    `SELECT c.*, u.nom, u.prenom, u.email 
     FROM commande c 
     LEFT JOIN utilisateur u ON c.id_utilisateur = u.id 
     WHERE c.id_utilisateur = ? 
     ORDER BY c.date DESC`, 
    [userId], 
    (err, rows) => {
      if (err) {
        console.error("❌ Erreur récupération commandes utilisateur:", err);
        res.send({ success: false, message: err.message });
      } else {
        console.log(`✅ ${rows.length} commandes trouvées pour utilisateur ${userId}`);
        
        // Enrichir les données avec des informations supplémentaires
        const commandesEnrichies = rows.map(cmd => {
          let produitsDetails = null;
          
          // Essayer de parser les produits
          if (cmd.produits) {
            try {
              if (typeof cmd.produits === 'string') {
                // Si c'est du JSON
                if (cmd.produits.trim().startsWith('[') || cmd.produits.trim().startsWith('{')) {
                  produitsDetails = JSON.parse(cmd.produits);
                }
                // Si c'est du format id:qty
                else if (cmd.produits.includes(':')) {
                  const produitsObj = {};
                  cmd.produits.split(',').forEach(item => {
                    const [id, qty] = item.split(':');
                    if (id && qty) {
                      produitsObj[id.trim()] = parseInt(qty, 10) || 1;
                    }
                  });
                  produitsDetails = produitsObj;
                }
              }
            } catch (e) {
              console.warn(`⚠️ Impossible de parser les produits pour commande ${cmd.id}:`, e);
            }
          }
          
          return {
            ...cmd,
            produitsDetails,
            montant_total_num: cmd.montant_total ? parseFloat(cmd.montant_total) : 0
          };
        });
        
        res.send({ 
          success: true, 
          commandes: commandesEnrichies,
          count: commandesEnrichies.length,
          utilisateur: rows.length > 0 ? {
            nom: rows[0].nom,
            prenom: rows[0].prenom,
            email: rows[0].email
          } : null
        });
      }
    }
  );
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
// Ligne ~290 - Modifier la route d'ajout de produits
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

// ===================== ROUTES POUR LES STATISTIQUES DE VENTES  =====================

// Statistiques des ventes par jour
app.get("/api/admin/stats/ventes-par-jour", isAdmin, (req, res) => {
  const query = `
    SELECT 
      DATE(c.date) as date_vente,
      COUNT(*) as nombre_commandes,
      COALESCE(SUM(c.montant_total), 0) as chiffre_affaires
    FROM commande c
    WHERE c.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND c.statut_paiement IN ('Payé', 'paye', 'Livré')
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
      ROUND(AVG(COALESCE(c.montant_total, 0)), 2) as panier_moyen,
      COUNT(*) as nombre_commandes
    FROM commande c
    WHERE c.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND c.statut_paiement IN ('Payé', 'paye', 'Livré')
      AND COALESCE(c.montant_total, 0) > 0
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

// Statistiques des ventes par catégorie (version corrigée)
app.get("/api/admin/stats/ventes-par-categorie", isAdmin, (req, res) => {
  console.log("📊 Calcul des ventes par catégorie...");
  
  // D'abord récupérer toutes les commandes payées avec leurs produits (sans limite de date)
  const queryCommandes = `
    SELECT c.id, c.produits, c.montant_total
    FROM commande c
    WHERE c.statut_paiement IN ('Payé', 'paye', 'Livré')
      AND COALESCE(c.montant_total, 0) > 0
  `;

  pool.query(queryCommandes, (err, commandes) => {
    if (err) {
      console.error("Erreur récupération commandes:", err);
      res.status(500).send({ success: false, message: err.message });
      return;
    }

    // Récupérer tous les produits avec leurs catégories
    const queryProduits = `
      SELECT p.id, p.prix, p.nom as produit_nom, 
             COALESCE(c.nom, 'Sans catégorie') as categorie_nom
      FROM produits p
      LEFT JOIN categorie c ON p.categorie_id = c.id
    `;

    pool.query(queryProduits, (err, produits) => {
      if (err) {
        console.error("Erreur récupération produits:", err);
        res.status(500).send({ success: false, message: err.message });
        return;
      }

      // Calculer les ventes par catégorie
      const ventesParCategorie = {};

      commandes.forEach(commande => {
        try {
          const produitsCommande = JSON.parse(commande.produits);
          
          produitsCommande.forEach(produitCommande => {
            const produit = produits.find(p => p.id === produitCommande.id);
            if (produit) {
              const quantite = produitCommande.quantity || produitCommande.quantite || 1;
              const montantProduit = produit.prix * quantite;
              const categorie = produit.categorie_nom;

              if (!ventesParCategorie[categorie]) {
                ventesParCategorie[categorie] = {
                  categorie: categorie,
                  nombre_commandes: new Set(),
                  chiffre_affaires: 0
                };
              }

              ventesParCategorie[categorie].nombre_commandes.add(commande.id);
              ventesParCategorie[categorie].chiffre_affaires += montantProduit;
            }
          });
        } catch (error) {
          console.error(`Erreur parsing commande ${commande.id}:`, error);
        }
      });

      // Convertir en format attendu
      const resultats = Object.values(ventesParCategorie).map(cat => ({
        categorie: cat.categorie,
        nombre_commandes: cat.nombre_commandes.size,
        chiffre_affaires: parseFloat(cat.chiffre_affaires.toFixed(2))
      })).sort((a, b) => b.chiffre_affaires - a.chiffre_affaires);

      console.log("✅ Ventes par catégorie calculées:", resultats.length, "catégories");
      console.log("📊 Données catégories:", JSON.stringify(resultats, null, 2));

      res.send({ success: true, data: resultats });
    });
  });
});

// Statistiques générales du dashboard (version corrigée)
app.get("/api/admin/stats/generales", isAdmin, (req, res) => {
  const queries = {
    totalCommandes: `
      SELECT COUNT(*) as total 
      FROM commande 
      WHERE statut_paiement IN ('Payé', 'paye', 'Livré')
    `,
    chiffreAffairesTotal: `
      SELECT COALESCE(SUM(montant_total), 0) as total
      FROM commande 
      WHERE statut_paiement IN ('Payé', 'paye', 'Livré')
        AND COALESCE(montant_total, 0) > 0
    `,
    totalUtilisateurs: `SELECT COUNT(*) as total FROM utilisateur`,
    totalProduits: `SELECT COUNT(*) as total FROM produits`,
    commandesEnAttente: `
      SELECT COUNT(*) as total 
      FROM commande 
      WHERE statut_paiement = 'En attente'
    `,
    chiffreAffairesMoisActuel: `
      SELECT COALESCE(SUM(montant_total), 0) as total
      FROM commande 
      WHERE statut_paiement IN ('Payé', 'paye', 'Livré')
        AND MONTH(date) = MONTH(CURDATE())
        AND YEAR(date) = YEAR(CURDATE())
        AND COALESCE(montant_total, 0) > 0
    `
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


app.get("/api/admin/utilisateurs", isAdmin, (req, res) => {
  console.log("👥 Récupération des utilisateurs admin...");
  
  const query = `
    SELECT 
      id,
      email,
      nom,
      prenom,
      fonction as role,
      date_creation,
      1 as actif
    FROM utilisateur
    ORDER BY date_creation DESC
  `;
  
  pool.query(query, (err, rows) => {
    if (err) {
      console.error("❌ Erreur récupération utilisateurs admin:", err);
      res.status(500).json({ 
        success: false, 
        message: "Erreur serveur",
        error: err.message 
      });
    } else {
      console.log(`✅ ${rows.length} utilisateurs récupérés`);
      res.json({ 
        success: true, 
        data: rows,
        utilisateurs: rows  // Compatibilité
      });
    }
  });
});

// Route pour récupérer toutes les commandes (admin) - CORRIGER LA TABLE
app.get("/api/admin/commandes", isAdmin, (req, res) => {
  console.log("📋 Récupération des commandes admin...");
  
  const query = `
    SELECT 
      c.id,
      c.produits as produit_id,
      1 as quantite,
      c.montant_total as prix_unitaire,
      c.montant_total as total,
      c.statut_paiement as statut,
      c.date as date_commande,
      c.id_utilisateur as client_id,
      u.email as client_email,
      u.nom as client_nom,
      u.prenom as client_prenom,
      'Commande groupée' as produit_nom
    FROM commande c
    LEFT JOIN utilisateur u ON c.id_utilisateur = u.id
    ORDER BY c.date DESC
  `;
  
  pool.query(query, (err, rows) => {
    if (err) {
      console.error("❌ Erreur récupération commandes admin:", err);
      res.status(500).json({ 
        success: false, 
        message: "Erreur serveur",
        error: err.message 
      });
    } else {
      console.log(`✅ ${rows.length} commandes récupérées`);
      res.json({ 
        success: true, 
        data: rows,
        commandes: rows  // Compatibilité
      });
    }
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
  console.log("📝 Requête POST /api/user reçue");
  console.log("Session:", req.session.user ? "✅ Connecté" : "❌ Non connecté");
  console.log("Body:", req.body);

  if (!req.session.user) {
    console.log("❌ Utilisateur non connecté");
    return res.status(401).json({ success: false, message: "Non connecté" });
  }

  const { nom, prenom, email } = req.body;

  if (!nom || !prenom || !email) {
    console.log("❌ Champs manquants");
    return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    console.log("❌ Email invalide");
    return res.status(400).json({ success: false, message: "Email invalide" });
  }

  const id = req.session.user.id;
  console.log("🔄 Mise à jour utilisateur ID:", id);

  pool.query('UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE id = ?', [nom, prenom, email, id], (err, result) => {
    if (err) {
      console.error("❌ Erreur SQL:", err);
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }

    if (result.affectedRows === 0) {
      console.log("❌ Aucun utilisateur trouvé avec cet ID");
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Mettre à jour la session
    req.session.user.nom = nom;
    req.session.user.prenom = prenom;
    req.session.user.email = email;

    console.log("✅ Utilisateur mis à jour avec succès");
    return res.json({ 
      success: true, 
      message: "Informations mises à jour avec succès",
      user: req.session.user
    });
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

// Route pour demander un reset de mot de passe
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.send({ success: false, message: "Veuillez fournir une adresse email" });
    return;
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    res.send({ success: false, message: "Email invalide" });
    return;
  }

  // Vérifier si l'utilisateur existe
  pool.query('SELECT * FROM utilisateur WHERE email = ?', [email], (err, rows) => {
    if (err) {
      console.error("Erreur recherche utilisateur:", err);
      res.status(500).send({ success: false, message: "Erreur serveur" });
      return;
    }

    if (rows.length === 0) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      res.send({ success: true, message: "Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation." });
      return;
    }

    const user = rows[0];

    // Générer un token de réinitialisation (valide 1 heure)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token en base
    pool.query(
      'UPDATE utilisateur SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id],
      (err, result) => {
        if (err) {
          console.error("Erreur sauvegarde token:", err);
          res.status(500).send({ success: false, message: "Erreur serveur" });
          return;
        }

        // Configuration de l'email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@votresite.com',
          to: email,
          subject: 'Réinitialisation de votre mot de passe',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Réinitialisation de mot de passe</h2>
              <p>Bonjour ${user.prenom} ${user.nom},</p>
              <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
              <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
              <p style="margin-top: 20px;">
                <strong>Ce lien expire dans 1 heure.</strong>
              </p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
              <hr style="margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                ${resetUrl}
              </p>
            </div>
          `
        };

        // Envoyer l'email (nécessite nodemailer configuré)
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Erreur envoi email:', error);
            res.status(500).send({ success: false, message: "Erreur lors de l'envoi de l'email" });
          } else {
            console.log('Email envoyé:', info.response);
            res.send({ 
              success: true, 
              message: "Un email de réinitialisation a été envoyé à votre adresse." 
            });
          }
        });
      }
    );
  });
});

// Route pour réinitialiser le mot de passe avec le token
// ...existing code...
// Route pour réinitialiser le mot de passe avec le token
app.post("/api/reset-password", (req, res) => {
  console.log("Requête de réinitialisation reçue:", req.body);
  
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    res.send({ success: false, message: "Veuillez remplir tous les champs" });
    return;
  }

  if (password.length < 8) {
    res.send({ success: false, message: "Le mot de passe doit contenir au moins 8 caractères" });
    return;
  }

  if (password !== confirmPassword) {
    res.send({ success: false, message: "Les mots de passe ne correspondent pas" });
    return;
  }

  // Vérifier le token et sa validité
  pool.query(
    'SELECT * FROM utilisateur WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token],
    (err, rows) => {
      if (err) {
        console.error("Erreur vérification token:", err);
        res.status(500).send({ success: false, message: "Erreur serveur" });
        return;
      }

      if (rows.length === 0) {
        res.send({ 
          success: false, 
          message: "Token invalide ou expiré. Veuillez faire une nouvelle demande de réinitialisation." 
        });
        return;
      }

      const user = rows[0];

      // Hasher le nouveau mot de passe
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error("Erreur hashage mot de passe:", err);
          res.status(500).send({ success: false, message: "Erreur serveur" });
          return;
        }

        // Mettre à jour le mot de passe et supprimer le token
        pool.query(
          'UPDATE utilisateur SET mdp = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
          [hash, user.id],
          (err, result) => {
            if (err) {
              console.error("Erreur mise à jour mot de passe:", err);
              res.status(500).send({ success: false, message: "Erreur serveur" });
              return;
            }

            console.log(`Mot de passe réinitialisé pour l'utilisateur ${user.email}`);
            res.send({ 
              success: true, 
              message: "Votre mot de passe a été réinitialisé avec succès." 
            });
          }
        );
      });
    }
  );
});
// ...existing code...
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

    const produitsParsed = JSON.parse(produits);

    // D'abord vérifier s'il existe une commande en attente pour cet utilisateur
    pool.query(
        'SELECT * FROM commande WHERE id_utilisateur = ? AND statut_paiement = "En attente" ORDER BY date DESC LIMIT 1',
        [req.session.user.id],
        (err, commandesExistantes) => {
            if (err) {
                console.error("Erreur vérification commande existante:", err);
                res.send({ success: false, message: err.message });
                return;
            }

            pool.query('SELECT * FROM produits', (err, rows) => {
                if (err) {
                    res.send({ success: false, message: err });
                    return;
                }

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

                // Si une commande en attente existe, la mettre à jour
                if (commandesExistantes.length > 0) {
                    const commandeExistante = commandesExistantes[0];
                    
                    // Fusionner les produits existants avec les nouveaux
                    let produitsExistants = [];
                    try {
                        produitsExistants = JSON.parse(commandeExistante.produits);
                    } catch (e) {
                        console.error("Erreur parsing produits existants:", e);
                        produitsExistants = [];
                    }

                    // Ajouter ou mettre à jour les quantités
                    produitsParsed.forEach(nouveauProduit => {
                        const produitExistant = produitsExistants.find(p => p.id === nouveauProduit.id);
                        if (produitExistant) {
                            // Augmenter la quantité
                            produitExistant.quantite = (produitExistant.quantite || 1) + (nouveauProduit.quantite || 1);
                        } else {
                            // Ajouter le nouveau produit
                            produitsExistants.push(nouveauProduit);
                        }
                    });

                    // Recalculer le total
                    let nouveauTotal = 0;
                    produitsExistants.forEach((produit) => {
                        const product = stock.find((p) => p.id === produit.id);
                        if (product) {
                            nouveauTotal += product.prix * (produit.quantite || 1);
                        }
                    });

                    // Mettre à jour la commande existante
                    pool.query(
                        'UPDATE commande SET produits = ?, montant_total = ?, date = ? WHERE id = ?',
                        [JSON.stringify(produitsExistants), nouveauTotal.toFixed(2), new Date().toISOString().slice(0, 19).replace('T', ' '), commandeExistante.id],
                        (err, result) => {
                            if (err) {
                                console.error("Erreur mise à jour commande:", err);
                                res.send({ success: false, message: err.message });
                            } else {
                                console.log("✅ Commande mise à jour:", commandeExistante.id);
                                res.send({ 
                                    success: true, 
                                    message: "Produits ajoutés à votre commande existante",
                                    commande_id: commandeExistante.id,
                                    montant_total: nouveauTotal.toFixed(2)
                                });
                            }
                        }
                    );
                } else {
                    // Créer une nouvelle commande
                    const id = uuid.v4();
                    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

                    pool.query(
                        'INSERT INTO commande (id, date, produits, id_utilisateur, montant_total, statut_paiement) VALUES (?, ?, ?, ?, ?, ?)', 
                        [id, date, JSON.stringify(produitsParsed), req.session.user.id, total.toFixed(2), 'En attente'], 
                        (err, rows) => {
                            if (err) {
                                console.error("Erreur création commande:", err);
                                res.send({ success: false, message: err.message });
                            } else {
                                console.log("✅ Nouvelle commande créée:", id);
                                res.send({ 
                                    success: true, 
                                    message: "Nouvelle commande créée",
                                    commande_id: id,
                                    montant_total: total.toFixed(2)
                                });
                            }
                        }
                    );
                }
            });
        }
    );
});

app.get("/api/admin/commandes", isAdmin, (req, res) => {
  pool.query(`
    SELECT 
      c.*,
      u.nom,
      u.prenom,
      u.email
    FROM commande c
    LEFT JOIN utilisateur u ON c.id_utilisateur = u.id
    ORDER BY c.date DESC
  `, (err, rows) => {
    if (err) {
      console.error("Erreur récupération commandes admin:", err);
      res.status(500).send({ success: false, message: err.message });
    } else {
      res.send({ success: true, commandes: rows });
    }
  });
});

// Retourne les commandes de l'utilisateur connecté
app.get("/api/commandes", (req, res) => {
  console.log("🔍 Route /api/commandes appelée");
  console.log("👤 Session utilisateur:", req.session.user);
  
  if (!req.session.user) {
    console.log("❌ Utilisateur non connecté");
    return res.status(401).send({ success: false, message: "Non connecté" });
  }

  const userId = req.session.user.id;
  console.log("📋 Recherche commandes pour utilisateur ID:", userId);

  pool.query('SELECT * FROM commande WHERE id_utilisateur = ? ORDER BY date DESC', [userId], (err, rows) => {
    if (err) {
      console.error("❌ Erreur SQL commandes:", err);
      res.send({ success: false, message: err.message });
      return;
    }

    console.log(`✅ ${rows.length} commandes trouvées pour l'utilisateur ${userId}`);
    console.log("📋 Commandes brutes:", rows.map(r => ({ id: r.id, date: r.date, montant: r.montant_total })));

    // Si aucune commande trouvée
    if (rows.length === 0) {
      return res.send({ 
        success: true, 
        commands: [],
        commandes: [],
        message: "Aucune commande trouvée" 
      });
    }

    // Récupérer les détails des produits
    pool.query('SELECT * FROM produits', (err, stockRows) => {
      if (err) {
        console.error("❌ Erreur récupération produits:", err);
        res.send({ success: false, message: err.message });
        return;
      }

      const stock = stockRows;
      const commandsWithProducts = rows.map((command) => {
        try {
          let products = [];
          if (command.produits) {
            // Essayer de parser le JSON
            if (typeof command.produits === 'string') {
              products = JSON.parse(command.produits);
            } else {
              products = command.produits;
            }
          }

          const productsWithDetails = products.map((product) => {
            const productDetails = stock.find((p) => p.id == product.id);
            return {
              ...product,
              nom: productDetails ? productDetails.nom : 'Produit non trouvé',
              prix: productDetails ? productDetails.prix : 0,
              image: productDetails ? productDetails.image : '',
              description: productDetails ? productDetails.description : '',
            };
          });

          return {
            ...command,
            produits: productsWithDetails,
          };
        } catch (parseErr) {
          console.error("❌ Erreur parsing produits pour commande", command.id, ":", parseErr);
          return {
            ...command,
            produits: [],
          };
        }
      });

      console.log("✅ Commandes avec détails envoyées:", commandsWithProducts.length);
      res.send({ 
        success: true, 
        commands: commandsWithProducts,
        commandes: commandsWithProducts
      });
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
  const confirm = req.body.passwordConfirm || req.body.confirm;

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

                  // ENVOI DE L'EMAIL DE BIENVENUE
                  const mailOptions = {
                    from: process.env.EMAIL_FROM || 'noreply@votresite.com',
                    to: email,
                    subject: 'Bienvenue sur notre site !',
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Bienvenue ${prenom} ${nom} !</h2>
                        <p>Merci de vous être inscrit sur notre site.</p>
                        <p>Nous sommes ravis de vous compter parmi nos membres.</p>
                        <p>Vous pouvez dès à présent vous connecter et profiter de nos services.</p>
                        <hr style="margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">
                          Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.
                        </p>
                      </div>
                    `
                  };

                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.error('Erreur envoi email bienvenue:', error);
                      // On ne bloque pas l'inscription même si l'email échoue
                    } else {
                      console.log('Email de bienvenue envoyé:', info.response);
                    }
                  });

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
  // Vérifier que l'utilisateur est connecté
  if (!req.session.user) {
    return res.status(401).json({ error: "Non autorisé - connexion requise" });
  }

  const { amount, commande_id } = req.body;

  console.log("📝 Demande de Payment Intent:", { 
    amount, 
    commande_id, 
    utilisateur: req.session.user.email,
    fonction: req.session.user.fonction 
  });

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Montant invalide" });
  }

  try {
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convertir en centimes
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("✅ Payment Intent créé:", paymentIntent.id);

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
  // Vérifier que l'utilisateur est connecté
  if (!req.session.user) {
    return res.status(401).json({ error: "Non autorisé - connexion requise" });
  }

  const { payment_intent_id, statut, commande_id } = req.body;

  console.log("🔄 Mise à jour statut paiement:", { 
    payment_intent_id, 
    statut, 
    commande_id,
    utilisateur: req.session.user.email 
  });

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

        // Récupérer les infos de la commande et de l'utilisateur pour la facture
        const [commandeRows] = await pool.promise().query(
          "SELECT c.*, u.email, u.nom, u.prenom FROM commande c JOIN utilisateur u ON c.id_utilisateur = u.id WHERE c.id = ?",
          [commande_id]
        );
        if (commandeRows.length > 0) {
          const commande = commandeRows[0];
          const produits = JSON.parse(commande.produits);

          // Récupérer les détails des produits
          const [stockRows] = await pool.promise().query(
            "SELECT id, nom, prix FROM produits WHERE id IN (?)",
            [produits.map(p => p.id)]
          );
          // Associer quantité et prix
          let total = 0;
          const lignes = produits.map(p => {
            const prod = stockRows.find(s => s.id === p.id);
            const prix = prod ? prod.prix : 0;
            const nom = prod ? prod.nom : "Produit inconnu";
            const quantite = 1;
            const sousTotal = prix * quantite;
            total += sousTotal;
            return `<tr>
              <td>${nom}</td>
              <td>${quantite}</td>
              <td>${prix.toFixed(2)} €</td>
              <td>${sousTotal.toFixed(2)} €</td>
            </tr>`;
          }).join("");

          // Email HTML
          const factureHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Votre facture</h2>
              <p>Bonjour ${commande.prenom} ${commande.nom},</p>
              <p>Merci pour votre commande. Voici le récapitulatif :</p>
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="border-bottom:1px solid #ccc;text-align:left;">Article</th>
                    <th style="border-bottom:1px solid #ccc;text-align:left;">Quantité</th>
                    <th style="border-bottom:1px solid #ccc;text-align:left;">Prix unitaire</th>
                    <th style="border-bottom:1px solid #ccc;text-align:left;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${lignes}
                </tbody>
              </table>
              <h3 style="margin-top:20px;">Total payé : ${total.toFixed(2)} €</h3>
              <hr style="margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                Merci pour votre confiance.<br>
                Ceci est une facture générée automatiquement.
              </p>
            </div>
          `;

          // Envoi de l'email
          const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@votresite.com',
            to: commande.email,
            subject: 'Votre facture - Merci pour votre commande',
            html: factureHtml
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Erreur envoi email facture:', error);
            } else {
              console.log('Email de facture envoyé:', info.response);
            }
          });
        }

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




require('./archiveUsers');

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

