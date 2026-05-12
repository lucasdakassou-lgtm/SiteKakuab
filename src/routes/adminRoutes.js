const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/anuncios/pendentes",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.listarPendentes
);

router.get(
  "/estatisticas",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.obterEstatisticas
);

router.patch(
  "/anuncios/:id/aprovar",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.aprovarAnuncio
);

router.patch(
  "/anuncios/:id/reprovar",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.reprovarAnuncio
);

router.get(
  "/avaliacoes",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.listarAvaliacoes
);

router.delete(
  "/avaliacoes/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.removerAvaliacao
);

router.get(
  "/auditoria",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.listarAuditoria
);

router.get(
  "/ranking",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.obterRanking
);

module.exports = router;
