const express = require("express");
const router = express.Router();

const avaliacaoController = require("../controllers/avaliacaoController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Criar avaliação em um anúncio
router.post(
  "/anuncios/:anuncioId",
  authMiddleware,
  roleMiddleware("comprador"),
  avaliacaoController.criar
);

// Listar avaliações públicas de um anúncio
router.get(
  "/anuncios/:anuncioId",
  avaliacaoController.listarPorAnuncio
);

// Ver média de avaliações de um anúncio
router.get(
  "/anuncios/:anuncioId/media",
  avaliacaoController.mediaPorAnuncio
);

// Remover a própria avaliação
router.delete(
  "/:avaliacaoId",
  authMiddleware,
  roleMiddleware("comprador"),
  avaliacaoController.remover
);

module.exports = router;