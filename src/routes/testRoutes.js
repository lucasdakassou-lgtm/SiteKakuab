const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get("/logado", authMiddleware, (req, res) => {
  res.json({
    message: "Você está logado!",
    user: req.user
  });
});

router.get("/fornecedor", authMiddleware, roleMiddleware("fornecedor"), (req, res) => {
  res.json({
    message: "Área do fornecedor liberada!",
    user: req.user
  });
});

router.get("/comprador", authMiddleware, roleMiddleware("comprador"), (req, res) => {
  res.json({
    message: "Área do comprador liberada!",
    user: req.user
  });
});

router.get("/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({
    message: "Área do administrador liberada!",
    user: req.user
  });
});

module.exports = router;