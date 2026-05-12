function roleMiddleware(...tiposPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const tipoUser = (req.user.tipo || "").toLowerCase();
    const tiposLower = tiposPermitidos.map(t => t.toLowerCase());

    if (!tiposLower.includes(tipoUser)) {
      return res.status(403).json({ error: "Acesso negado para este perfil" });
    }

    next();
  };
}

module.exports = roleMiddleware;
