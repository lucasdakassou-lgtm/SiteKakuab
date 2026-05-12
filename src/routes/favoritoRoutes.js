const express = require("express");
const router = express.Router();

const favoritoController = require("../controllers/favoritoController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Listar favoritos do comprador logado
router.get(
  "/",
  authMiddleware,
  roleMiddleware("comprador"),
  favoritoController.listar
);

// Adicionar anúncio aos favoritos
router.post(
  "/:anuncioId",
  authMiddleware,
  roleMiddleware("comprador"),
  favoritoController.adicionar
);

// Remover anúncio dos favoritos
router.delete(
  "/:anuncioId",
  authMiddleware,
  roleMiddleware("comprador"),
  favoritoController.remover
);

module.exports = router;