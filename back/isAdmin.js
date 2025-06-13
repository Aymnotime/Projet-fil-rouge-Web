function isAdmin(req, res, next) {
  console.log("Session user:", req.session.user);
  if (req.session.user && req.session.user.fonction === "admin") {
    next();
  } else {
    res.status(403).send({ success: false, message: "Accès interdit" });
  }
}
module.exports = isAdmin;