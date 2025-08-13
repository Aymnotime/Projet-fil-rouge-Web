import * as React from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import api from "../api";
import { useEffect } from "react";

function Navbar(props) {
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openRegister, setOpenRegister] = React.useState(false);
  const [openForgotPassword, setOpenForgotPassword] = React.useState(false);
  const [openResetPassword, setOpenResetPassword] = React.useState(false);

  const [nom, setNom] = React.useState("");
  const [prenom, setPrenom] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [resetToken, setResetToken] = React.useState("");
  const [forgotEmail, setForgotEmail] = React.useState("");

  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setError("");
    setSuccess("");
    setNom("");
    setPrenom("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setForgotEmail("");
    setResetToken("");
  }, [openLogin, openRegister, openForgotPassword, openResetPassword]);

  const handleLogin = (e) => {
    e.preventDefault();
    api.login(email, password).then((res) => {
      if (res.data.success) {
        api.getUser().then((res) => {
          if (res.data.success) {
            props.setUser(res.data.user);
            setOpenLogin(false);
          }
        })
      } else {
        setError(res.data.message);
      }
    });
  }

  const handleLogout = () => {
    api.logout().then((res) => {
      if (res.data.success) {
        props.setUser(null);
      }
    })
  }

  const handleRegister = (e) => {
    e.preventDefault();
    api.register(nom, prenom, email, password, passwordConfirm).then((res) => {
      if (res.data.success) {
        api.getUser().then((res) => {
          if (res.data.success) {
            props.setUser(res.data.user);
            setOpenRegister(false);
          }
        })
      } else {
        setError(res.data.message);
      }
    });
  }

  const handleForgotPassword = (e) => {
    e.preventDefault();
    api.forgotPassword(forgotEmail).then((res) => {
      if (res.data.success) {
        setSuccess("Un email de réinitialisation a été envoyé à votre adresse.");
        setError("");
        // Optionnel : fermer le modal après 3 secondes
        setTimeout(() => setOpenForgotPassword(false), 3000);
      } else {
        setError(res.data.message);
        setSuccess("");
      }
    }).catch((err) => {
      setError("Une erreur est survenue lors de l'envoi de l'email.");
      setSuccess("");
    });
  }

  const handleResetPassword = (e) => {
    e.preventDefault();
    api.resetPassword(resetToken, password, passwordConfirm).then((res) => {
      if (res.data.success) {
        setSuccess("Votre mot de passe a été réinitialisé avec succès.");
        setError("");
        // Rediriger vers la connexion après 2 secondes
        setTimeout(() => {
          setOpenResetPassword(false);
          setOpenLogin(true);
        }, 2000);
      } else {
        setError(res.data.message);
        setSuccess("");
      }
    }).catch((err) => {
      setError("Une erreur est survenue lors de la réinitialisation.");
      setSuccess("");
    });
  }

  return (
    <>
      <Modal title="Connexion" show={openLogin} onClose={() => setOpenLogin(false)}>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" className="form-control" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn btn-primary">Connexion</button>
          <div className="mt-2">
            <button 
              type="button" 
              className="btn btn-link p-0 text-decoration-none" 
              onClick={() => {
                setOpenLogin(false);
                setOpenForgotPassword(true);
              }}
            >
              Mot de passe oublié ?
            </button>
          </div>
          {error && <div className="alert alert-danger w-100 mb-0">{error}</div>}
        </form>
      </Modal>

      <Modal title="Inscription" show={openRegister} onClose={() => setOpenRegister(false)}>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Nom" className="form-control" name="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
          <input type="text" placeholder="Prénom" className="form-control" name="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          <input type="email" placeholder="Email" className="form-control" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirmer le mot de passe" className="form-control" name="confirm" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
          <div className="form-check mb-3 mt-2">
            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" required />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              J'accepte les <NavLink to="/confidentialite">conditions d'utilisation</NavLink> et la <NavLink to="/confidentialite">politique de confidentialité</NavLink>
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Inscription</button>
          {error && <div className="alert alert-danger w-100 mb-0">{error}</div>}
        </form>
      </Modal>

      <Modal title="Mot de passe oublié" show={openForgotPassword} onClose={() => setOpenForgotPassword(false)}>
        <form onSubmit={handleForgotPassword}>
          <div className="mb-3">
            <p className="text-muted">Entrez votre adresse email pour recevoir un lien de réinitialisation de votre mot de passe.</p>
          </div>
          <input 
            type="email" 
            placeholder="Votre adresse email" 
            className="form-control" 
            name="forgotEmail" 
            value={forgotEmail} 
            onChange={(e) => setForgotEmail(e.target.value)} 
            required 
          />
          <button type="submit" className="btn btn-primary">Envoyer le lien</button>
          <div className="mt-2">
            <button 
              type="button" 
              className="btn btn-link p-0 text-decoration-none" 
              onClick={() => {
                setOpenForgotPassword(false);
                setOpenLogin(true);
              }}
            >
              Retour à la connexion
            </button>
          </div>
          {error && <div className="alert alert-danger w-100 mb-0">{error}</div>}
          {success && <div className="alert alert-success w-100 mb-0">{success}</div>}
        </form>
      </Modal>

      <Modal title="Réinitialiser le mot de passe" show={openResetPassword} onClose={() => setOpenResetPassword(false)}>
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <p className="text-muted">Entrez votre nouveau mot de passe.</p>
          </div>
          <input 
            type="text" 
            placeholder="Code de réinitialisation" 
            className="form-control" 
            name="resetToken" 
            value={resetToken} 
            onChange={(e) => setResetToken(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Nouveau mot de passe" 
            className="form-control" 
            name="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Confirmer le nouveau mot de passe" 
            className="form-control" 
            name="passwordConfirm" 
            value={passwordConfirm} 
            onChange={(e) => setPasswordConfirm(e.target.value)} 
            required 
          />
          <button type="submit" className="btn btn-primary">Réinitialiser</button>
          {error && <div className="alert alert-danger w-100 mb-0">{error}</div>}
          {success && <div className="alert alert-success w-100 mb-0">{success}</div>}
        </form>
      </Modal>

      <div className="overflow-hidden nav-wrapper" style={props.navbarOpen ? { maxWidth: "300px" } : { maxWidth: 0 }} >
        <nav>
            <div className="topnav">
              <img src="public/Logo_app_cyna.png" className="" alt="" />

              <NavLink to="/">
                <button className="btn">
                  <i className="bi bi-house-fill"></i>
                  Accueil
                </button>
              </NavLink>
              <NavLink to="/boutique">
                <button className="btn">
                  <i className="bi bi-cart-fill"></i>
                  Boutique
                </button>
              </NavLink>
              
            </div>

            <div className="bottomnav">
              {props.user ?
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate("/compte")} >
                    <i className="bi bi-person-fill"></i>
                    Mon compte
                  </button>
                  <button type="button" className="btn btn-warning" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" color="white"></i>
                    Deconnexion
                  </button>
                   {props.user.fonction === "admin" && (
      <button
        type="button"
        className="btn btn-info"
        onClick={() => navigate("/admin/commandes")}
      >
        <i className="bi bi-speedometer2"></i>
        Admin Dashboard
      </button>
    )}
                </>
                :
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setOpenLogin(true)}>
                    <i className="bi bi-box-arrow-in-right"></i>
                    Connexion
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setOpenRegister(true)}>
                    <i className="bi bi-person-plus-fill"></i>
                    Inscription
                  </button>
                </>
              }
            </div>
        </nav>
      </div>
    </>
  );
}

export default Navbar;