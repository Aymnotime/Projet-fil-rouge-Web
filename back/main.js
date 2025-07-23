
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
          res.send({ success: true, id, montant_total, produits: produitsCommande });
        }
      }
    );
  });
});




app.get("/api/produits", (req, res) => {
  // On fait un JOIN pour récupérer le nom de la catégorie et le prix promo
  pool.query(`
    SELECT p.*, c.nom AS categorie, p.prix_promo
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


// Route pour lancer l'archivage des utilisateurs inactifs (admin seulement)
const { archiverEtSupprimer } = require('./archiveUsers');
app.post('/api/admin/archiver-utilisateurs', (req, res) => {
  // TODO: ajouter une vérification d'admin si besoin
  archiverEtSupprimer((err, result) => {
    if (err) {
      res.status(500).send({ success: false, message: 'Erreur lors de l\'archivage', error: err });
    } else {
      res.send({ success: true, message: 'Archivage terminé', details: result });
    }
  });
});

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
    // Utilise le champ stripe_client_id (et non stripe_customer_id)
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


    // 2. Créer le PaymentIntent avec Stripe (NE PAS confirmer ici !)
    const paymentIntentParams = {
      amount: Math.round(amount * 100),
      currency: "eur",
      customer: customerId,
      // On ne met PAS confirm ici, le front doit gérer la confirmation
      payment_method: paymentMethodId || undefined,
      // Ne PAS mettre off_session ici, Stripe refuse si confirm n'est pas true
      automatic_payment_methods: paymentMethodId ? undefined : { enabled: true },
    };
    if (!paymentMethodId) {
      paymentIntentParams.setup_future_usage = 'off_session';
    }
    // Toujours confirm: false ici !
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    console.log("✅ Payment Intent créé:", paymentIntent.id);

    // 3. Sauvegarder en base de données
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