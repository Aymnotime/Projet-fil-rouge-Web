
const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const dotenv = require("dotenv");
const cardValidator = require("card-validator");

// Charger les variables d'environnement EN PREMIER
require('dotenv').config({ path: './back/.env' });
dotenv.config();






// Initialiser Stripe APRÈS avoir chargé les variables d'environnement
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(
  session({
    secret: "dsof82445qs*2E",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax", // ou "none" si Flutter web + HTTPS
      secure: false, // mettre true si HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 jours
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



app.get("/api", (req, res) => {
  res.send("API is up");
});

app.get("/api/user", (req, res) => {
  if (req.session.user) {
    // Récupérer les infos utilisateur avec adresse via JOIN
    pool.query(`
      SELECT u.*, a.telephone, a.adresse, a.complement_adresse, a.code_postal, 
             a.ville, a.pays, a.par_defaut as adresse_par_defaut
      FROM utilisateur u
      LEFT JOIN adresse_utilisateur a ON u.id = a.id_utilisateur AND a.par_defaut = 1
      WHERE u.id = ?
    `, [req.session.user.id], (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        const userWithAddress = rows[0] || req.session.user;
        res.send({ success: true, user: userWithAddress });
      }
    });
  } else {
    res.send({ success: false, message: "Non connecté" });
  }
});

app.post("/api/user", (req, res) => {
    if (!req.session.user) {
        res.send({ success: false, message: "Non connecté" });
        return;
    }

    const { nom, prenom, email, telephone, adresse, complement_adresse, code_postal, ville, pays, adresse_par_defaut } = req.body;

    if (!nom || !prenom || !email) {
        res.send({ success: false, message: "Veuillez remplir tous les champs obligatoires" });
        return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        res.send({ success: false, message: "Email invalide" });
        return;
    }

    const id = req.session.user.id;

    // 1. Mettre à jour les infos de base dans utilisateur
    pool.query('UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE id = ?', 
    [nom, prenom, email, id], (err, rows) => {
        if (err) {
            res.send({ success: false, message: err });
            return;
        }

        // 2. Gérer l'adresse si fournie
        if (adresse && telephone) {
            // Vérifier si une adresse existe déjà
            pool.query('SELECT * FROM adresse_utilisateur WHERE id_utilisateur = ?', [id], (err, existing) => {
                if (err) {
                    res.send({ success: false, message: err });
                    return;
                }

                if (existing.length > 0) {
                    // Mettre à jour l'adresse existante
                    pool.query(`UPDATE adresse_utilisateur SET 
                        telephone = ?, adresse = ?, complement_adresse = ?, 
                        code_postal = ?, ville = ?, pays = ?, par_defaut = ?
                        WHERE id_utilisateur = ?`, 
                    [telephone, adresse, complement_adresse, code_postal, ville, pays, adresse_par_defaut || 1, id], 
                    (err) => {
                        if (err) {
                            res.send({ success: false, message: err });
                        } else {
                            // Mettre à jour la session
                            req.session.user.nom = nom;
                            req.session.user.prenom = prenom;
                            req.session.user.email = email;
                            res.send({ success: true, message: "Informations mises à jour avec succès" });
                        }
                    });
                } else {
                    // Créer une nouvelle adresse
                    pool.query(`INSERT INTO adresse_utilisateur 
                        (id_utilisateur, telephone, adresse, complement_adresse, code_postal, ville, pays, par_defaut) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [id, telephone, adresse, complement_adresse, code_postal, ville, pays, adresse_par_defaut || 1], 
                    (err) => {
                        if (err) {
                            res.send({ success: false, message: err });
                        } else {
                            // Mettre à jour la session
                            req.session.user.nom = nom;
                            req.session.user.prenom = prenom;
                            req.session.user.email = email;
                            res.send({ success: true, message: "Informations mises à jour avec succès" });
                        }
                    });
                }
            });
        } else {
            // Pas d'adresse, juste mettre à jour la session
            req.session.user.nom = nom;
            req.session.user.prenom = prenom;
            req.session.user.email = email;
            res.send({ success: true, message: "Informations mises à jour avec succès" });
        }
    });
});


app.post("/api/commandes", (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: "Non connecté" });
    return;
  }
  const userId = req.session.user.id;
  const id = uuid.v4();
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  // Récupérer le panier de l'utilisateur
  pool.query(`
    SELECT p.id_produit, p.quantite, pr.nom, pr.prix, pr.prix_promo, pr.image
    FROM panier p
    JOIN produits pr ON p.id_produit = pr.id
    WHERE p.id_utilisateur = ?
  `, [userId], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
      return;
    }
    if (!rows || rows.length === 0) {
      res.send({ success: false, message: "Votre panier est vide" });
      return;
    }
    // Préparer la liste des produits pour la commande
    const produitsCommande = rows.map(item => ({
      id: item.id_produit,
      quantity: item.quantite,
      nom: item.nom,
      prix: item.prix,
      prix_promo: item.prix_promo,
      image: item.image
    }));
    // Calcul du total (en tenant compte du prix promo si présent)
    let montant_total = 0;
    produitsCommande.forEach(item => {
      const prix = (item.prix_promo && item.prix_promo > 0 && item.prix_promo < item.prix) ? item.prix_promo : item.prix;
      montant_total += prix * item.quantity;
    });
    // Insérer la commande
    pool.query(
      'INSERT INTO commande (id, id_utilisateur, produits, date, montant_total) VALUES (?, ?, ?, ?, ?)',
      [id, userId, JSON.stringify(produitsCommande), date, montant_total],
      (err, result) => {
        if (err) {
          res.send({ success: false, message: err });
        } else {
          // Réponse API uniquement, plus de génération/envoi de facture ici
          res.send({ success: true, id, montant_total, produits: produitsCommande });
        }
      }
    );
  });
});



app.get("/api/produits", (req, res) => {
  // On fait un JOIN pour récupérer le nom de la catégorie et le prix promo
  pool.query(`
    SELECT p.*, c.nom AS categorie, p.prix_promo,
      CASE WHEN p.image IS NULL OR p.image = '' THEN '' ELSE p.image END AS image
    FROM produits p
    LEFT JOIN categorie c ON p.categorie_id = c.id
    LIMIT 20
  `, (err, rows) => {
    if (err) {
      res.send({ error: err });
    } else {
      // Correction : s'assurer que chaque produit a bien un champ image (même si vide)
      const fixedRows = rows.map(row => ({
        ...row,
        image: row.image || '',
      }));
      res.send(fixedRows);
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
  const prix_promo = req.body.prix_promo;
  const id = uuid.v4();
  // Si prix_promo est défini et inférieur au prix, on met isFlashSale à 1
  let isFlashSale = 0;
  if (prix_promo !== undefined && prix_promo !== null && !isNaN(prix_promo) && Number(prix_promo) > 0 && Number(prix_promo) < Number(prix)) {
    isFlashSale = 1;
  }
  pool.query(
    "INSERT INTO produits (nom, quantite, prix, description, prix_promo, isFlashSale, id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [nom, quantite, prix, description, prix_promo, isFlashSale, id],
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
  const { email, password } = req.body;
  if (!email || !password) {
    return res.send({ success: false, message: "Veuillez remplir tous les champs" });
  }

  // 1. Vérifier si l'utilisateur est archivé
  pool.query(
    "SELECT * FROM utilisateur_archive WHERE email = ?",
    [email],
    (err, archivedRows) => {
      if (err) {
        return res.send({ error: err });
      }
      if (archivedRows.length > 0) {
        return res.send({
          success: false,
          message: "Ce compte a été archivé et ne peut plus se connecter.",
        });
      }

      // 2. Vérifier dans la table utilisateur normale
      pool.query(
        "SELECT * FROM utilisateur WHERE email = ?",
        [email],
        (err, rows) => {
          if (err) {
            return res.send({ error: err });
          }
          if (rows.length > 0) {
            bcrypt.compare(password, rows[0].mdp, (err, result) => {
              if (err) {
                return res.send({ success: false, message: "Erreur serveur" });
              }
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
                return res.send({ success: true, message: "success" });
              } else {
                return res.send({
                  success: false,
                  message: "Mot de passe ou email incorrect",
                });
              }
            });
          } else {
            return res.send({
              success: false,
              message: "Mot de passe ou email incorrect",
            });
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
  if (password.length < 12) {
    res.send({ success: false, message: "Le mot de passe doit contenir au moins 12 caractères" });
    return;
  }

  // check password contains special characters
  if (!password.match(/(?=.*?[#?!@$%^&*-])/)) {
    res.send({ success: false, message: "Le mot de passe doit contenir au moins un caractère spécial" });
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
                  // Suppression de l'envoi du mail de bienvenue ici
                  res.send({
                    success: true,
                    message: "User successfully created",
                    userId: user.id
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

app.post("/api/user/change-password", (req, res) => {
    if (!req.session.user) {
        res.send({ success: false, message: "Non connecté" });
        return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.send({ success: false, message: "Veuillez remplir tous les champs" });
        return;
    }

    if (newPassword.length < 12) {
        res.send({ success: false, message: "Le nouveau mot de passe doit contenir au moins 12 caractères" });
        return;
    }

    if (!newPassword.match(/(?=.*?[#?!@$%^&*-])/)) {
        res.send({ success: false, message: "Le nouveau mot de passe doit contenir au moins un caractère spécial" });
        return;
    }

    const id = req.session.user.id;

    // Vérifier l'ancien mot de passe
    pool.query('SELECT * FROM utilisateur WHERE id = ?', [id], (err, rows) => {
        if (err) {
            res.send({ success: false, message: err });
            return;
        }

        if (rows.length === 0) {
            res.send({ success: false, message: "Utilisateur introuvable" });
            return;
        }

        const user = rows[0];
        bcrypt.compare(currentPassword, user.mdp, (err, result) => {
            if (err) {
                res.send({ success: false, message: "Erreur lors de la vérification du mot de passe" });
                return;
            }

            if (!result) {
                res.send({ success: false, message: "Mot de passe actuel incorrect" });
                return;
            }

            // Hasher le nouveau mot de passe
            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    res.send({ success: false, message: "Erreur lors du hashage du mot de passe" });
                    return;
                }

                // Mettre à jour le mot de passe
                pool.query('UPDATE utilisateur SET mdp = ? WHERE id = ?', [hashedPassword, id], (err, rows) => {
                    if (err) {
                        res.send({ success: false, message: err });
                    } else {
                        res.send({ success: true, message: "Mot de passe changé avec succès" });
                    }
                });
            });
        });
    });
});

require('dotenv').config({ path: './back/.env' });  



// Route pour créer un Payment Intent Stripe
app.post("/api/create-payment-intent", async (req, res) => {
  const { amount, commande_id, paymentMethodId } = req.body;
  if (!req.session.user) {
    return res.status(401).json({ error: "Non connecté" });
  }
  console.log(" Demande de Payment Intent:", { amount, commande_id, paymentMethodId });

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Montant invalide" });
  }

  try {
    // 1. Récupérer ou créer le customer Stripe pour l'utilisateur
    const userId = req.session.user.id;
    let customerId = null;
    const [userRows] = await pool.promise().query('SELECT stripe_client_id, email FROM utilisateur WHERE id = ?', [userId]);
    if (userRows.length > 0 && userRows[0].stripe_client_id) {
      customerId = userRows[0].stripe_client_id;
    } else {
      const customer = await stripe.customers.create({
        email: userRows[0]?.email || undefined,
        metadata: { userId: String(userId) }
      });
      customerId = customer.id;
      await pool.promise().query('UPDATE utilisateur SET stripe_client_id = ? WHERE id = ?', [customerId, userId]);
    }

    // 2. Créer le PaymentIntent avec Stripe (montant en centimes !)
    const stripeAmount = Math.round(Number(amount) * 100);
    const paymentIntentParams = {
      amount: stripeAmount, // Stripe attend le montant en centimes
      currency: "eur",
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        commande_id: commande_id || '',
        user_id: userId,
      },
    };
    if (paymentMethodId) {
      paymentIntentParams.payment_method = paymentMethodId;
      paymentIntentParams.confirm = false;
    } else {
      paymentIntentParams.automatic_payment_methods = { enabled: true };
      paymentIntentParams.setup_future_usage = 'off_session';
    }
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    console.log("✅ Payment Intent créé:", paymentIntent.id);

    // 3. Sauvegarder en base de données (montant en euros, pas en centimes !)
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
      amount, // montant en euros pour la BDD
      'EUR',
      'pending'
    ]);

    console.log(" Paiement sauvegardé en BDD:", paiementId);

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paiementId: paiementId,
      customerId: customerId
    });

  } catch (err) {
    console.error(" Erreur:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/utilisateurs/archiver-inactifs', (req, res) => {
  const maintenant = new Date();
  const sixMoisAvant = new Date();
  sixMoisAvant.setMonth(maintenant.getMonth() - 6);
  const unAnAvant = new Date();
  unAnAvant.setFullYear(maintenant.getFullYear() - 1);
  const formatDate = (date) => date.toISOString().slice(0, 19).replace("T", " ");

  // 1️⃣ Archiver les utilisateurs inactifs depuis 6 mois
  const archiverQuery = `
    INSERT INTO utilisateur_archive (id, nom, prenom, email, mdp, fonction, derniere_connexion, date_archivage)
    SELECT id, nom, prenom, email, mdp, fonction, derniere_connexion, NOW()
    FROM utilisateur
    WHERE derniere_connexion < ? 
    AND id NOT IN (SELECT id FROM utilisateur_archive)
  `;

  pool.query(archiverQuery, [formatDate(sixMoisAvant)], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur archivage', error: err });
    // 2️⃣ Supprimer les utilisateurs archivés de la table principale
    const deleteArchivedFromUser = `
      DELETE FROM utilisateur 
      WHERE id IN (SELECT id FROM utilisateur_archive)
    `;
    pool.query(deleteArchivedFromUser, (err2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Erreur suppression utilisateur', error: err2 });
      // 3️⃣ Supprimer ceux archivés depuis plus d’un an
      const deleteOldArchives = `
        DELETE FROM utilisateur_archive
        WHERE date_archivage < ?
      `;
      pool.query(deleteOldArchives, [formatDate(unAnAvant)], (err3) => {
        if (err3) return res.status(500).json({ success: false, message: 'Erreur suppression archives anciennes', error: err3 });
        res.json({ success: true, message: 'Archivage terminé' });
      });
    });
  });
});
// Route pour envoyer la facture par email
app.post("/api/send-facture-mail", async (req, res) => {
  const { commande_id, email } = req.body;

  try {
    // Récupérer les données de la commande
    const [commandeRows] = await pool.promise().execute(
      'SELECT * FROM commande WHERE id = ?', 
      [commande_id]
    );

    if (commandeRows.length === 0) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    const commande = commandeRows[0];
    let produitsCommande;
    try {
      produitsCommande = JSON.parse(commande.produits);
    } catch (parseErr) {
      // Tentative de réparation automatique : suppression des caractères non valides en fin de chaîne
      let produitsStr = commande.produits;
      // Supprimer les espaces et caractères non JSON en fin de chaîne
      produitsStr = produitsStr.trim();
      // Si la chaîne ne finit pas par ] ou }, on tente de la compléter
      if (!produitsStr.endsWith(']') && !produitsStr.endsWith('}')) {
        if (produitsStr.includes(']')) {
          produitsStr = produitsStr.substring(0, produitsStr.lastIndexOf(']') + 1);
        } else if (produitsStr.includes('}')) {
          produitsStr = produitsStr.substring(0, produitsStr.lastIndexOf('}') + 1);
        }
      }
      try {
        produitsCommande = JSON.parse(produitsStr);
        console.warn("⚠️ JSON produits réparé automatiquement:", produitsStr);
      } catch (repairErr) {
        console.error("❌ Erreur parsing JSON commande.produits (après réparation):", produitsStr);
        // Pour éviter l'erreur, on renvoie une facture vide mais sans crash
        produitsCommande = [];
      }
    }

    // Récupérer les données utilisateur
    let user = { email: email || '', prenom: '', nom: '' };
    if (email) {
      const [userRows] = await pool.promise().execute(
        'SELECT prenom, nom FROM utilisateur WHERE email = ?', 
        [email]
      );
      if (userRows.length > 0) {
        user = { email, prenom: userRows[0].prenom, nom: userRows[0].nom };
      }
    }

    // Récupérer l'adresse de livraison
    let adresse = null;
    if (email) {
      const [adresseRows] = await pool.promise().execute(
        'SELECT * FROM adresse_utilisateur WHERE id_utilisateur = (SELECT id FROM utilisateur WHERE email = ?) AND par_defaut = 1 LIMIT 1', 
        [email]
      );
      adresse = adresseRows[0] || null;
    }

    // Générer le HTML de la facture
    const htmlContent = generateInvoiceHTML(commande, user, adresse, produitsCommande);

    // Générer le PDF
    const pdfBuffer = await generateInvoicePDF(commande, user, adresse, produitsCommande);

    // Envoyer l'email avec la facture
    await sendInvoiceEmail(user, commande, htmlContent, pdfBuffer);

    console.log(`✅ Facture envoyée pour la commande ${commande_id}`);
    res.json({ success: true, message: "Facture envoyée par email" });

  } catch (error) {
    console.error("❌ Erreur envoi facture:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de la facture" });
  }
});

// Fonction pour générer le HTML de la facture
function generateInvoiceHTML(commande, user, adresse, produitsCommande) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Générer les lignes de produits
  let produitsHTML = '';
  if (produitsCommande && produitsCommande.length > 0) {
    produitsCommande.forEach(prod => {
      const prixUnitaire = (prod.prix_promo && prod.prix_promo > 0 && prod.prix_promo < prod.prix) 
        ? prod.prix_promo 
        : prod.prix;
      const totalProduit = prixUnitaire * prod.quantity;

      produitsHTML += `
        <tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e9ecef;">
            <p style="margin: 0; font-weight: bold; color: #333333; font-size: 14px;">${prod.nom || 'Produit'}</p>
          </td>
          <td style="padding: 12px 8px; text-align: center; color: #495057; font-size: 14px; border-bottom: 1px solid #e9ecef;">${prod.quantity}</td>
          <td style="padding: 12px 8px; text-align: right; color: #495057; font-size: 14px; border-bottom: 1px solid #e9ecef;">${formatPrice(prixUnitaire)}€</td>
          <td style="padding: 12px 8px; text-align: right; color: #495057; font-size: 14px; font-weight: bold; border-bottom: 1px solid #e9ecef;">${formatPrice(totalProduit)}€</td>
        </tr>
      `;
    });
  } else {
    produitsHTML = `
      <tr>
        <td colspan="4" style="padding: 20px; text-align: center; color: #6c757d; font-style: italic;">
          Aucun produit dans cette commande
        </td>
      </tr>
    `;
  }

  // Template HTML complet
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture TechnoShop #${commande.id}</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
            font-family: Arial, Helvetica, sans-serif; 
        }
        
        .container {
            max-width: 650px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            padding: 30px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        
        .logo p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .invoice-info {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
            text-align: right;
            margin-left: auto;
            min-width: 200px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .thank-you {
            color: #28a745;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .customer-info {
            display: flex;
            gap: 20px;
            margin: 30px 0;
        }
        
        .info-box {
            flex: 1;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        
        .info-box h3 {
            margin: 0 0 15px 0;
            color: #495057;
            font-size: 16px;
            font-weight: bold;
        }
        
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .invoice-table th {
            background-color: #f8f9fa;
            padding: 12px 8px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
            font-weight: bold;
            color: #495057;
        }
        
        .invoice-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .total-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
        }
        
        .total-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            min-width: 250px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
        }
        
        .total-final {
            border-top: 2px solid #dee2e6;
            padding-top: 10px;
            font-weight: bold;
            color: #28a745;
            font-size: 18px;
        }
        
        .footer {
            background-color: #343a40;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        
        .footer p {
            margin: 0 0 15px 0;
            font-size: 12px;
            opacity: 0.8;
        }
        
        @media only screen and (max-width: 600px) {
            .container { margin: 10px; }
            .header { flex-direction: column; text-align: center; }
            .invoice-info { margin-top: 20px; }
            .customer-info { flex-direction: column; }
            .content { padding: 20px; }
            .invoice-table { font-size: 12px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <h1>TechnoShop</h1>
                <p>Votre boutique tech de confiance</p>
            </div>
            <div class="invoice-info">
                <p style="margin: 0; font-weight: bold;">Facture #${commande.id}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px;">${formatDate(commande.date)}</p>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Message de remerciement -->
            <div class="thank-you">Merci pour votre commande !</div>
            
            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">
                Bonjour <strong>${user.prenom} ${user.nom}</strong>,
            </p>
            
            <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px;">
                Nous vous remercions pour votre achat ! Votre commande a été confirmée et sera traitée dans les plus brefs délais.
            </p>

            <!-- Informations client et adresse -->
            <div class="customer-info">
                <div class="info-box">
                    <h3>📦 Adresse de livraison</h3>
                    <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.5;">
                        ${user.prenom} ${user.nom}<br>
                        ${adresse?.adresse || 'Non renseignée'}<br>
                        ${adresse?.complement_adresse ? adresse.complement_adresse + '<br>' : ''}
                        ${adresse?.code_postal || ''} ${adresse?.ville || ''}<br>
                        ${adresse?.pays || ''}<br>
                        ${adresse?.telephone ? 'Tél: ' + adresse.telephone : ''}
                    </p>
                </div>
                <div class="info-box">
                    <h3>💳 Informations de paiement</h3>
                    <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.5;">
                        Email : ${user.email}<br>
                        Statut : <span style="color: #28a745; font-weight: bold;">Payé</span><br>
                        Date de commande : ${formatDate(commande.date)}
                    </p>
                </div>
            </div>

            <!-- Détail de la commande -->
            <h3 style="margin: 30px 0 20px 0; color: #495057; font-size: 18px; font-weight: bold;">
                📋 Détail de votre commande
            </h3>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th style="width: 50%;">Article</th>
                        <th style="width: 15%; text-align: center;">Qté</th>
                        <th style="width: 17.5%; text-align: right;">Prix unit.</th>
                        <th style="width: 17.5%; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${produitsHTML}
                </tbody>
            </table>

            <!-- Total -->
            <div class="total-section">
                <div class="total-box">
                    <div class="total-row total-final">
                        <span>Total :</span>
                        <span>${formatPrice(commande.montant_total)}€</span>
                    </div>
                </div>
            </div>

            <!-- Informations importantes -->
            <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px; font-weight: bold;">
                    ℹ️ Informations importantes
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    <li>Cette facture fait office de garantie pour tous vos produits</li>
                    <li>Vous disposez de <strong>14 jours</strong> pour retourner vos articles</li>
                    <li>Conservez cette facture pour toute demande de SAV</li>
                </ul>
            </div>

            <!-- Support client -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px; font-weight: bold;">
                    💬 Besoin d'aide ?
                </h3>
                <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 14px;">
                    Notre équipe support est à votre disposition
                </p>
                <div>
                    <a href="mailto:support@technoshop.com" style="color: #667eea; text-decoration: none; font-weight: bold; margin-right: 20px;">
                        📧 support@technoshop.com
                    </a>
                    <a href="tel:+33123456789" style="color: #667eea; text-decoration: none; font-weight: bold;">
                        📞 01 23 45 67 89
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <h3>TechnoShop</h3>
            <p>
                123 Rue de la Tech, 75001 Paris, France<br>
                SIRET: 123 456 789 00012 | TVA: FR12345678901
            </p>
            <p style="opacity: 0.7;">
                © 2024 TechnoShop. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>`;
}

// Fonction pour générer le PDF professionnel
async function generateInvoicePDF(commande, user, adresse, produitsCommande) {
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // Couleurs
    const primaryColor = '#28a745';
    const secondaryColor = '#6c757d';
    const textColor = '#333333';
    const lightGray = '#f8f9fa';

    // === HEADER ===
    let currentY = 50;
    
    // Logo et nom entreprise
    doc.fontSize(24).fillColor(primaryColor).text('TechnoShop', 50, currentY);
    currentY += 30;
    doc.fontSize(10).fillColor(secondaryColor)
       .text('123 Rue de la Tech, 75001 Paris, France', 50, currentY);
    currentY += 12;
    doc.text('SIRET: 123 456 789 00012 | TVA: FR12345678901', 50, currentY);

    // Infos facture (à droite)
    doc.fontSize(18).fillColor(primaryColor).text('FACTURE', 400, 50, { align: 'right' });
    doc.fontSize(11).fillColor(textColor)
       .text(`N° ${commande.id.substring(0, 8)}`, 400, 75, { align: 'right' })
       .text(`Date: ${new Date(commande.date).toLocaleDateString('fr-FR')}`, 400, 90, { align: 'right' });

    // Ligne de séparation
    currentY = 120;
    doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor(primaryColor).lineWidth(2).stroke();
    currentY += 20;

    // === INFORMATIONS CLIENT ===
    doc.fontSize(12).fillColor(primaryColor).text('FACTURÉ À:', 50, currentY);
    currentY += 20;
    doc.fontSize(11).fillColor(textColor)
       .text(`${user.prenom} ${user.nom}`, 50, currentY);
    currentY += 15;
    doc.text(`${user.email}`, 50, currentY);
    currentY += 25;

    // Adresse de livraison (si disponible)
    if (adresse && adresse.adresse) {
      doc.fontSize(12).fillColor(primaryColor).text('ADRESSE DE LIVRAISON:', 50, currentY);
      currentY += 20;
      doc.fontSize(11).fillColor(textColor);
      
      if (adresse.adresse) {
        doc.text(adresse.adresse, 50, currentY);
        currentY += 15;
      }
      if (adresse.complement_adresse) {
        doc.text(adresse.complement_adresse, 50, currentY);
        currentY += 15;
      }
      if (adresse.code_postal && adresse.ville) {
        doc.text(`${adresse.code_postal} ${adresse.ville}`, 50, currentY);
        currentY += 15;
      }
      if (adresse.pays) {
        doc.text(adresse.pays, 50, currentY);
        currentY += 15;
      }
      if (adresse.telephone) {
        doc.text(`Tél: ${adresse.telephone}`, 50, currentY);
        currentY += 15;
      }
    }

    currentY += 20;

    // === TABLEAU DES PRODUITS ===
    doc.fontSize(12).fillColor(primaryColor).text('DÉTAIL DE LA COMMANDE:', 50, currentY);
    currentY += 25;

    // En-têtes du tableau avec fond gris
    const tableTop = currentY;
    doc.rect(50, tableTop, 495, 25).fillColor(lightGray).fill();
    
    doc.fontSize(10).fillColor(textColor)
       .text('Article', 60, tableTop + 8, { width: 280 })
       .text('Qté', 350, tableTop + 8, { width: 40, align: 'center' })
       .text('Prix Unit.', 400, tableTop + 8, { width: 70, align: 'right' })
       .text('Total', 480, tableTop + 8, { width: 60, align: 'right' });

    currentY = tableTop + 25;

    // Lignes de produits
    let totalGeneral = 0;
    const rowHeight = 25;
    
    produitsCommande.forEach((prod, index) => {
      const prixUnitaire = (prod.prix_promo && prod.prix_promo > 0 && prod.prix_promo < prod.prix) 
        ? parseFloat(prod.prix_promo) || 0
        : parseFloat(prod.prix) || 0;
      const quantite = parseInt(prod.quantity) || 0;
      const totalProduit = prixUnitaire * quantite;
      totalGeneral += totalProduit;

      // Ligne alternée avec fond gris clair
      if (index % 2 === 1) {
        doc.rect(50, currentY, 495, rowHeight).fillColor('#fafafa').fill();
      }

      // Texte du produit (tronqué si nécessaire)
      const nomProduit = prod.nom && prod.nom.length > 40 ? prod.nom.substring(0, 37) + '...' : (prod.nom || 'Produit');
      
      doc.fontSize(9).fillColor(textColor)
         .text(nomProduit, 60, currentY + 8, { width: 280 })
         .text(quantite.toString(), 350, currentY + 8, { width: 40, align: 'center' })
         .text(`${prixUnitaire.toFixed(2)}€`, 400, currentY + 8, { width: 70, align: 'right' })
         .text(`${totalProduit.toFixed(2)}€`, 480, currentY + 8, { width: 60, align: 'right' });

      currentY += rowHeight;
      
      // Ligne de séparation
      doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor('#e9ecef').lineWidth(0.5).stroke();
    });

    currentY += 15;

    // === TOTAL FINAL ===
    const totalBoxY = currentY;
    doc.rect(350, totalBoxY, 195, 30).fillColor(primaryColor).fill();
    doc.fontSize(12).fillColor('white')
       .text('TOTAL:', 360, totalBoxY + 10, { width: 100 })
       .text(`${parseFloat(commande.montant_total).toFixed(2)}€`, 460, totalBoxY + 10, { width: 80, align: 'right' });

    currentY += 50;

    // === NOTES ET PIED DE PAGE ===
    // Vérifier s'il reste assez d'espace, sinon nouvelle page
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    doc.fontSize(10).fillColor(secondaryColor)
       .text('Merci pour votre confiance !', 50, currentY);
    currentY += 15;
    doc.text('Cette facture fait office de garantie pour tous vos produits.', 50, currentY);
    currentY += 15;
    doc.text('Vous disposez de 14 jours pour retourner vos articles.', 50, currentY);
    currentY += 25;
    doc.text('Support: support@technoshop.com | Tél: 01 23 45 67 89', 50, currentY);
    currentY += 30;
    doc.text('© 2024 TechnoShop - Tous droits réservés', 50, currentY, { align: 'center', width: 495 });

    doc.end();
  });
}

// Fonction pour envoyer l'email
async function sendInvoiceEmail(user, commande, htmlContent, pdfBuffer) {
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@technoshop.com',
    to: user.email,
    subject: `Facture TechnoShop #${commande.id} - Merci pour votre commande !`,
    html: htmlContent,
    attachments: [{
      filename: `facture_${commande.id}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }]
  };

  return transporter.sendMail(mailOptions);
}

// Route pour télécharger directement le PDF
app.get("/api/download-invoice/:commande_id", async (req, res) => {
  const { commande_id } = req.params;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  try {
    // Récupérer les données (même logique que pour l'email)
    const [commandeRows] = await pool.promise().execute(
      'SELECT * FROM commande WHERE id = ? AND id_utilisateur = ?', 
      [commande_id, userId]
    );

    if (commandeRows.length === 0) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    const commande = commandeRows[0];
    const produitsCommande = JSON.parse(commande.produits);

    const [userRows] = await pool.promise().execute(
      'SELECT email, prenom, nom FROM utilisateur WHERE id = ?', 
      [userId]
    );
    const user = userRows[0];

    const [adresseRows] = await pool.promise().execute(
      'SELECT * FROM adresse_utilisateur WHERE id_utilisateur = ? AND par_defaut = 1 LIMIT 1', 
      [userId]
    );
    const adresse = adresseRows[0] || null;

    // Générer le PDF
    const pdfBuffer = await generateInvoicePDF(commande, user, adresse, produitsCommande);

    // Renvoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture_${commande_id}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ Erreur génération PDF:", error);
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
  }
});

// Route pour mettre à jour le statut du paiement
app.post("/api/update-payment-status", async (req, res) => {
  const { payment_intent_id, statut, commande_id } = req.body;

  console.log("🔄 Mise à jour statut paiement:", { payment_intent_id, statut, commande_id });

  let stripeStatus = statut;
  try {
    // Récupérer le statut réel Stripe du PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    stripeStatus = paymentIntent.status; // 'succeeded', 'requires_capture', etc.
  } catch (err) {
    console.error("Erreur Stripe retrieve:", err);
    // Si erreur, on garde le statut reçu du front
  }

  try {
    // Mettre à jour le statut du paiement
    const updateQuery = `
      UPDATE paiements 
      SET statut = ?, date_mise_a_jour = NOW() 
      WHERE payment_intent_id = ?
    `;
    const [result] = await pool.promise().execute(updateQuery, [stripeStatus, payment_intent_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Paiement non trouvé" });
    }

    // Si paiement réussi et commande_id présent, on met à jour la commande + envoi facture
    if (stripeStatus === "succeeded" && commande_id) {
      try {
        // Mise à jour du statut dans la table paiements
        const updatePaiementQuery = `
          UPDATE paiements 
          SET statut = 'payée', date_mise_a_jour = NOW()
          WHERE commande_id = ?
        `;
        await pool.promise().execute(updatePaiementQuery, [commande_id]);

        // Récupérer l'email du client lié à la commande
        const [commandeRows] = await pool.promise().execute(
          'SELECT id_utilisateur FROM commande WHERE id = ?',
          [commande_id]
        );
        let userEmail = '';
        if (commandeRows.length > 0) {
          const userId = commandeRows[0].id_utilisateur;
          const [userRows] = await pool.promise().execute(
            'SELECT email FROM utilisateur WHERE id = ?',
            [userId]
          );
          if (userRows.length > 0) {
            userEmail = userRows[0].email;
          }
        }

        // Envoi de la facture avec l'email
        const response = await fetch("http://localhost:3000/api/send-facture-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commande_id, email: userEmail })
        });
        console.log("✅ Facture envoyée automatiquement");
      } catch (error) {
        console.error("❌ Erreur envoi facture:", error);
      }
    }

    return res.json({ success: true, statut: stripeStatus });
  } catch (err) {
    console.error("Erreur SQL:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Le app.listen doit être en dehors de la route
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// --- Gestion des avis produits ---
// Récupérer les avis d'un produit
app.get('/api/produits/:id/avis', (req, res) => {
  const id_produit = req.params.id;
  pool.query(`
    SELECT a.*, u.prenom, u.nom 
    FROM avis a
    JOIN utilisateur u ON a.id_utilisateur = u.id
    WHERE a.id_produit = ?
    ORDER BY a.date_creation DESC
  `, [id_produit], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, avis: rows });
    }
  });
});


// === ROUTES EMAILS (copiées depuis main2.js) ===
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Transporteur email (adapter selon config)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Route pour demander un reset de mot de passe
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;
  console.log("[POST /api/forgot-password] Requête reçue avec email :", email);

  if (!email) {
    console.warn("[POST /api/forgot-password] Aucun email fourni.");
    res.send({ success: false, message: "Veuillez fournir une adresse email" });
    return;
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    console.warn("[POST /api/forgot-password] Email invalide :", email);
    res.send({ success: false, message: "Email invalide" });
    return;
  }

  console.log("[POST /api/forgot-password] Vérification de l'email dans la base :", email);
  pool.query('SELECT * FROM utilisateur WHERE email = ?', [email], (err, rows) => {
    if (err) {
      console.error("[POST /api/forgot-password] Erreur SQL (SELECT) :", err);
      res.status(500).send({ success: false, message: "Erreur serveur" });
      return;
    }

    console.log(`[POST /api/forgot-password] Résultat de la requête SELECT : ${rows.length} utilisateur(s) trouvé(s).`);

    if (rows.length === 0) {
      console.info("[POST /api/forgot-password] Aucun utilisateur trouvé avec cet email :", email);
      res.send({ 
        success: true, 
        message: "Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation." 
      });
      return;
    }

    const user = rows[0];
    console.log("[POST /api/forgot-password] Utilisateur trouvé :", user.id, user.email);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1h
    console.log(`[POST /api/forgot-password] Token généré : ${resetToken}, expiration : ${tokenExpiry}`);

    pool.query(
      'UPDATE utilisateur SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id],
      (err, result) => {
        if (err) {
          console.error("[POST /api/forgot-password] Erreur SQL (UPDATE) :", err);
          res.status(500).send({ success: false, message: "Erreur serveur" });
          return;
        }

        console.log("[POST /api/forgot-password] Mise à jour réussie pour l'utilisateur :", user.id);

        // Utiliser un schéma d’URL personnalisé pour l’application mobile
        // Correction : utiliser le nom 'technoshop' uniquement
        const resetUrl = `technoshop://reset-password/${resetToken}`;
        console.log("[POST /api/forgot-password] Lien de réinitialisation (mobile) :", resetUrl);

        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@votresite.com',
          to: email,
          subject: 'Réinitialisation de votre mot de passe',
          html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Réinitialisation de mot de passe - TechnoShop</title>
    <style>
        body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .mobile-padding { padding: 15px !important; }
            .mobile-center { text-align: center !important; }
            .button { padding: 12px 25px !important; font-size: 16px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">TechnoShop</h1>
                            <h2 style="margin: 15px 0 0 0; color: #ffffff; font-size: 20px; font-weight: normal;">Réinitialisation de votre mot de passe</h2>
                        </td>
                    </tr>
                    <tr>
                        <td class="mobile-padding" style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Bonjour ${user.prenom} ${user.nom},
                            </p>
                            <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Vous avez demandé la réinitialisation de votre mot de passe pour votre compte TechnoShop. Cliquez sur le bouton ci-dessous pour procéder :
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                                    <a href="${resetUrl}" 
                                                       class="button"
                                                       style="display: inline-block; padding: 16px 32px; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px;">
                                                        Réinitialiser mon mot de passe
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :
                            </p>
                            <p style="margin: 0 0 30px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; word-break: break-all;">
                                <a href="${resetUrl}" style="color: #667eea; font-size: 14px; text-decoration: none;">
                                    ${resetUrl}
                                </a>
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #e8f4f8; border-radius: 6px; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; color: #0066cc; font-size: 16px; font-weight: bold;">
                                            📱 Instructions pour mobile :
                                        </p>
                                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.5;">
                                            Sur votre téléphone ou tablette, ce lien ouvrira automatiquement l'application TechnoShop si elle est installée. Sinon, il vous sera proposé de la télécharger.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            <div style="border-left: 4px solid #ffc107; padding-left: 15px; margin: 30px 0;">
                                <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px; font-weight: bold;">
                                    ⚠️ Informations importantes :
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.5;">
                                    <li>Ce lien expire dans <strong>1 heure</strong> pour des raisons de sécurité</li>
                                    <li>Le lien ne peut être utilisé qu'<strong>une seule fois</strong></li>
                                    <li>Si vous n'avez pas demandé cette réinitialisation, <strong>ignorez cet email</strong></li>
                                </ul>
                            </div>
                            <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                Besoin d'aide ? Contactez notre support à 
                                <a href="mailto:support@technoshop.com" style="color: #667eea; text-decoration: none;">
                                    support@technoshop.com
                                </a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 10px 10px;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px;">
                                © 2024 TechnoShop. Tous droits réservés.
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 11px;">
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
          `
        };

        console.log("[POST /api/forgot-password] Envoi de l'email en cours...");
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("[POST /api/forgot-password] Erreur lors de l'envoi de l'email :", error);
            res.status(500).send({ success: false, message: "Erreur lors de l'envoi de l'email" });
          } else {
            console.log("[POST /api/forgot-password] Email envoyé avec succès :", info.response);
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


// Ajouter un avis
app.post('/api/produits/:id/avis', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }
  
  const id_produit = req.params.id;
  const { note, titre, commentaire } = req.body;
  const id_utilisateur = req.session.user.id;

  if (!note || note < 1 || note > 5) {
    res.send({ success: false, message: 'Note invalide (1-5)' });
    return;
  }

  // Vérifier si l'utilisateur a déjà donné un avis
  pool.query('SELECT * FROM avis WHERE id_produit = ? AND id_utilisateur = ?', [id_produit, id_utilisateur], (err, existing) => {
    if (err) {
      res.send({ success: false, message: err });
      return;
    }

    if (existing.length > 0) {
      res.send({ success: false, message: 'Vous avez déjà donné un avis pour ce produit' });
      return;
    }

    pool.query(
      'INSERT INTO avis (id_produit, id_utilisateur, note, titre, commentaire) VALUES (?, ?, ?, ?, ?)',
      [id_produit, id_utilisateur, note, titre || null, commentaire || null],
      (err) => {
        if (err) {
          res.send({ success: false, message: err });
        } else {
          res.send({ success: true, message: 'Avis ajouté avec succès' });
        }
      }
    );
  });
});

// Route pour récupérer toutes les catégories
app.get('/api/categories', (req, res) => {
  pool.query('SELECT * FROM categories', (err, rows) => {
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
    SELECT p.id, p.id_produit, p.quantite, pr.nom, pr.image, pr.prix, pr.brand_name, pr.prix_promo
    FROM panier p
    JOIN produits pr ON p.id_produit = pr.id
    WHERE p.id_utilisateur = ?
  `, [req.session.user.id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      // Correction : toujours renvoyer un objet avec success et panier
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

// --- Gestion des adresses de livraison ---
// Récupérer toutes les adresses d'un utilisateur
app.get('/api/adresses', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }
  
  pool.query('SELECT * FROM adresse_utilisateur WHERE id_utilisateur = ? ORDER BY par_defaut DESC, id DESC', 
  [req.session.user.id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, adresses: rows });
    }
  });
});

// --- Cartes bancaires Stripe ---
// Récupérer la liste des cartes de l'utilisateur (GET)
app.get('/api/cartes', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Non connecté' });
  const userId = req.session.user.id;
  pool.query('SELECT id, stripe_payment_method_id, brand, last4, exp_month, exp_year, par_defaut, nom FROM carte_bancaire WHERE id_utilisateur = ? ORDER BY par_defaut DESC, id DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur SQL', err });
    res.json({ success: true, cartes: rows });
  });
});

// Enregistrer une carte bancaire (POST)
app.post('/api/cartes', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Non connecté' });
  const userId = req.session.user.id;
  const { stripe_payment_method_id, card_number, last4, exp_month, exp_year, par_defaut, nom } = req.body;

  // On accepte soit stripe_payment_method_id (mode Stripe), soit card_number (mode manuel)
  if (!stripe_payment_method_id && !card_number) {
    return res.status(400).json({ success: false, message: 'Numéro de carte ou Stripe Payment Method requis' });
  }
  if (!last4 || !exp_month || !exp_year) {
    return res.status(400).json({ success: false, message: 'Champs manquants' });
  }

  // Si on a un numéro de carte, on valide et on identifie la marque
  let brand = req.body.brand;
  if (card_number) {
    const numberValidation = cardValidator.number(card_number);
    if (!numberValidation.isValid) {
      return res.status(400).json({ success: false, message: 'Numéro de carte invalide' });
    }
    brand = numberValidation.card ? numberValidation.card.type : null;
    if (!brand) {
      return res.status(400).json({ success: false, message: 'Type de carte non reconnu' });
    }
  }

  // Attacher le paymentMethodId Stripe au customer Stripe si fourni
  async function attachStripeCardAndInsert() {
    let customerId;
    let stripeBrand = null;
    try {
      // Récupérer le customer Stripe de l'utilisateur
      const [userRows] = await pool.promise().query('SELECT stripe_client_id, email FROM utilisateur WHERE id = ?', [userId]);
      if (userRows.length > 0 && userRows[0].stripe_client_id) {
        customerId = userRows[0].stripe_client_id;
      } else {
        // Créer le customer Stripe si pas encore fait
        const customer = await stripe.customers.create({
          email: userRows[0]?.email || undefined,
          metadata: { userId: String(userId) }
        });
        customerId = customer.id;
        await pool.promise().query('UPDATE utilisateur SET stripe_client_id = ? WHERE id = ?', [customerId, userId]);
      }

      // Attacher la carte Stripe au customer Stripe
      if (stripe_payment_method_id) {
        await stripe.paymentMethods.attach(stripe_payment_method_id, { customer: customerId });
        // Récupérer la marque de la carte Stripe
        const paymentMethod = await stripe.paymentMethods.retrieve(stripe_payment_method_id);
        stripeBrand = paymentMethod.card ? paymentMethod.card.brand : null;
        // Définir comme carte par défaut Stripe si demandé
        if (par_defaut) {
          await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: stripe_payment_method_id } });
        }
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Erreur Stripe', error: err.message });
    }

    // Si par_defaut = 1, on retire le défaut des autres cartes
    if (par_defaut) {
      pool.query('UPDATE carte_bancaire SET par_defaut = 0 WHERE id_utilisateur = ?', [userId], () => {
        insertCard();
      });
    } else {
      insertCard();
    }
    function insertCard() {
      pool.query(
        'INSERT INTO carte_bancaire (id_utilisateur, stripe_payment_method_id, brand, last4, exp_month, exp_year, par_defaut, nom) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, stripe_payment_method_id || null, stripeBrand, last4, exp_month, exp_year, par_defaut ? 1 : 0, nom || null],
        (err, result) => {
          if (err) return res.status(500).json({ success: false, message: 'Erreur SQL', err });
          res.json({ success: true, id: result.insertId, brand: stripeBrand });
        }
      );
    }
  }
  if (stripe_payment_method_id) {
    attachStripeCardAndInsert();
  } else {
    // Pas Stripe, insertion classique
    if (par_defaut) {
      pool.query('UPDATE carte_bancaire SET par_defaut = 0 WHERE id_utilisateur = ?', [userId], () => {
        insertCard();
      });
    } else {
      insertCard();
    }
    function insertCard() {
      pool.query(
        'INSERT INTO carte_bancaire (id_utilisateur, stripe_payment_method_id, brand, last4, exp_month, exp_year, par_defaut, nom) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, null, brand, last4, exp_month, exp_year, par_defaut ? 1 : 0, nom || null],
        (err, result) => {
          if (err) return res.status(500).json({ success: false, message: 'Erreur SQL', err });
          res.json({ success: true, id: result.insertId, brand });
        }
      );
    }
  }
});

// Supprimer une carte
app.delete('/api/cartes/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Non connecté' });
  const userId = req.session.user.id;
  const cardId = req.params.id;
  pool.query('DELETE FROM carte_bancaire WHERE id = ? AND id_utilisateur = ?', [cardId, userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur SQL', err });
    res.json({ success: true });
  });
});

// Définir une carte par défaut
app.put('/api/cartes/:id/defaut', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Non connecté' });
  const userId = req.session.user.id;
  const cardId = req.params.id;
  pool.query('UPDATE carte_bancaire SET par_defaut = 0 WHERE id_utilisateur = ?', [userId], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur SQL', err });
    pool.query('UPDATE carte_bancaire SET par_defaut = 1 WHERE id = ? AND id_utilisateur = ?', [cardId, userId], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Erreur SQL', err2 });
      res.json({ success: true });
    });
  });
});

// Ajouter une nouvelle adresse
app.post('/api/adresses', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }

  const { telephone, adresse, complement_adresse, code_postal, ville, pays, par_defaut } = req.body;

  if (!telephone || !adresse || !code_postal || !ville) {
    res.send({ success: false, message: 'Veuillez remplir tous les champs obligatoires' });
    return;
  }

  // Si cette adresse est définie par défaut, retirer le statut par défaut des autres
  if (par_defaut) {
    pool.query('UPDATE adresse_utilisateur SET par_defaut = 0 WHERE id_utilisateur = ?', 
    [req.session.user.id], (err) => {
      if (err) {
        res.send({ success: false, message: err });
        return;
      }
      
      // Insérer la nouvelle adresse
      pool.query(`INSERT INTO adresse_utilisateur 
        (id_utilisateur, telephone, adresse, complement_adresse, code_postal, ville, pays, par_defaut) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [req.session.user.id, telephone, adresse, complement_adresse, code_postal, ville, pays || 'France', par_defaut ? 1 : 0], 
      (err, result) => {
        if (err) {
          res.send({ success: false, message: err });
        } else {
          res.send({ success: true, message: 'Adresse ajoutée avec succès', id: result.insertId });
        }
      });
    });
  } else {
    // Insérer directement sans modifier les autres adresses
    pool.query(`INSERT INTO adresse_utilisateur 
      (id_utilisateur, telephone, adresse, complement_adresse, code_postal, ville, pays, par_defaut) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [req.session.user.id, telephone, adresse, complement_adresse, code_postal, ville, pays || 'France', 0], 
    (err, result) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        res.send({ success: true, message: 'Adresse ajoutée avec succès', id: result.insertId });
      }
    });
  }
});

// Modifier une adresse existante
app.put('/api/adresses/:id', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }

  const addressId = req.params.id;
  const { telephone, adresse, complement_adresse, code_postal, ville, pays, par_defaut } = req.body;

  if (!telephone || !adresse || !code_postal || !ville) {
    res.send({ success: false, message: 'Veuillez remplir tous les champs obligatoires' });
    return;
  }

  // Vérifier que l'adresse appartient bien à l'utilisateur connecté
  pool.query('SELECT * FROM adresse_utilisateur WHERE id = ? AND id_utilisateur = ?', 
  [addressId, req.session.user.id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
      return;
    }

    if (rows.length === 0) {
      res.send({ success: false, message: 'Adresse non trouvée' });
      return;
    }

    // Si cette adresse devient par défaut, retirer le statut des autres
    if (par_defaut) {
      pool.query('UPDATE adresse_utilisateur SET par_defaut = 0 WHERE id_utilisateur = ? AND id != ?', 
      [req.session.user.id, addressId], (err) => {
        if (err) {
          res.send({ success: false, message: err });
          return;
        }

        // Mettre à jour l'adresse
        pool.query(`UPDATE adresse_utilisateur SET 
          telephone = ?, adresse = ?, complement_adresse = ?, 
          code_postal = ?, ville = ?, pays = ?, par_defaut = ?
          WHERE id = ? AND id_utilisateur = ?`, 
        [telephone, adresse, complement_adresse, code_postal, ville, pays || 'France', 1, addressId, req.session.user.id], 
        (err) => {
          if (err) {
            res.send({ success: false, message: err });
          } else {
            res.send({ success: true, message: 'Adresse mise à jour avec succès' });
          }
        });
      });
    } else {
      // Mettre à jour directement sans modifier les autres adresses
      pool.query(`UPDATE adresse_utilisateur SET 
        telephone = ?, adresse = ?, complement_adresse = ?, 
        code_postal = ?, ville = ?, pays = ?, par_defaut = ?
        WHERE id = ? AND id_utilisateur = ?`, 
      [telephone, adresse, complement_adresse, code_postal, ville, pays || 'France', 0, addressId, req.session.user.id], 
      (err) => {
        if (err) {
          res.send({ success: false, message: err });
        } else {
          res.send({ success: true, message: 'Adresse mise à jour avec succès' });
        }
      });
    }
  });
});
// Route pour réinitialiser le mot de passe avec le token
app.post('/api/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  console.log('--- [RESET PASSWORD] ---');
  console.log('Token reçu:', token);
  console.log('Nouveau mot de passe reçu:', newPassword);

  if (!newPassword) {
    console.log('Mot de passe manquant');
    return res.send({ success: false, message: 'Veuillez fournir un nouveau mot de passe' });
  }
  if (newPassword.length < 12) {
    console.log('Mot de passe trop court');
    return res.send({ success: false, message: 'Le mot de passe doit contenir au moins 12 caractères' });
  }
  if (!newPassword.match(/(?=.*?[#?!@$%^&*-])/)) {
    console.log('Mot de passe sans caractère spécial');
    return res.send({ success: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' });
  }

  pool.query('SELECT * FROM utilisateur WHERE reset_token = ?', [token], (err, rows) => {
    if (err) {
      console.error('Erreur SQL SELECT:', err);
      return res.status(500).send({ success: false, message: 'Erreur serveur' });
    }
    if (rows.length === 0) {
      console.log('Token introuvable en base');
      return res.send({ success: false, message: 'Token invalide ou expiré' });
    }
    const user = rows[0];
    const now = new Date();
    console.log('Utilisateur trouvé:', user.id);
    console.log('reset_token_expiry:', user.reset_token_expiry);
    if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < now) {
      console.log('Token expiré');
      return res.send({ success: false, message: 'Token expiré' });
    }
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Erreur hashage:', err);
        return res.status(500).send({ success: false, message: 'Erreur lors du hashage du mot de passe' });
      }
      pool.query('UPDATE utilisateur SET mdp = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, user.id], (err) => {
        if (err) {
          console.error('Erreur SQL UPDATE:', err);
          return res.status(500).send({ success: false, message: 'Erreur SQL' });
        }
        console.log('Mot de passe réinitialisé pour user:', user.id);
        res.send({ success: true, message: 'Mot de passe réinitialisé avec succès' });
      });
    });
  });
});
// Route API pour archiver les utilisateurs inactifs


// Supprimer une adresse
app.delete('/api/adresses/:id', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }

  const addressId = req.params.id;

  // Vérifier que l'adresse appartient bien à l'utilisateur connecté
  pool.query('SELECT * FROM adresse_utilisateur WHERE id = ? AND id_utilisateur = ?', 
  [addressId, req.session.user.id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
      return;
    }

    if (rows.length === 0) {
      res.send({ success: false, message: 'Adresse non trouvée' });
      return;
    }

    // Supprimer l'adresse
    pool.query('DELETE FROM adresse_utilisateur WHERE id = ? AND id_utilisateur = ?', 
    [addressId, req.session.user.id], (err) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        res.send({ success: true, message: 'Adresse supprimée avec succès' });
      }
    });
  });
});

// Définir une adresse comme adresse par défaut
app.put('/api/adresses/:id/defaut', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }

  const addressId = req.params.id;

  // Vérifier que l'adresse appartient bien à l'utilisateur connecté
  pool.query('SELECT * FROM adresse_utilisateur WHERE id = ? AND id_utilisateur = ?', 
  [addressId, req.session.user.id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
      return;
    }

    if (rows.length === 0) {
      res.send({ success: false, message: 'Adresse non trouvée' });
      return;
    }

    // Retirer le statut par défaut de toutes les adresses de l'utilisateur
    pool.query('UPDATE adresse_utilisateur SET par_defaut = 0 WHERE id_utilisateur = ?', 
    [req.session.user.id], (err) => {
      if (err) {
        res.send({ success: false, message: err });
        return;
      }

      // Définir cette adresse comme par défaut
      pool.query('UPDATE adresse_utilisateur SET par_defaut = 1 WHERE id = ? AND id_utilisateur = ?', 
      [addressId, req.session.user.id], (err) => {
        if (err) {
          res.send({ success: false, message: err });
        } else {
          res.send({ success: true, message: 'Adresse définie comme adresse par défaut' });
        }
      });
    });
  });
});
// Vider complètement le panier de l'utilisateur
app.delete('/api/panier', (req, res) => {
  if (!req.session.user) {
    res.send({ success: false, message: 'Non connecté' });
    return;
  }
  pool.query('DELETE FROM panier WHERE id_utilisateur = ?', [req.session.user.id], (err, result) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, message: 'Panier vidé' });
    }
  });
});
// Route GET pour récupérer les commandes de l'utilisateur connecté
app.get("/api/commandes", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Non connecté" });
  }
  const userId = req.session.user.id;
  pool.query(
    "SELECT * FROM commande WHERE id_utilisateur = ? ORDER BY date DESC",
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur SQL", error: err });
      }
      res.json({ success: true, commandes: rows });
    }
  );
});



app.post("/api/send-welcome-mail", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: "userId manquant" });

  pool.query("SELECT nom, prenom, email FROM utilisateur WHERE id = ?", [userId], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    const user = rows[0];
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@votresite.com',
      to: user.email,
      subject: 'Bienvenue sur Techoshop !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bienvenue ${user.prenom} ${user.nom} !</h2>
          <p>Votre inscription sur Techoshop a bien été prise en compte.</p>
          <p>Vous pouvez maintenant profiter de nos services et découvrir nos produits.</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        </div>
      `
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('[REGISTER] Erreur lors de l\'envoi du mail de bienvenue :', error);
        return res.status(500).json({ success: false, message: "Erreur envoi mail" });
      } else {
        console.log('[REGISTER] Email de bienvenue envoyé :', info.response);
        return res.json({ success: true, message: "Mail envoyé" });
      }
    });
  });
});