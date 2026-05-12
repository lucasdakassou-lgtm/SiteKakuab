const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Rotas do próprio usuário logado
router.put(
  "/me",
  authMiddleware,
  userController.atualizarPerfil
);

// Todas essas rotas são administrativas
// Por isso usam authMiddleware + roleMiddleware("admin")

// Listar todos os usuários
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  userController.listar
);

// Buscar usuário específico
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  userController.buscarPorId
);

// Bloquear fornecedor ou comprador
router.patch(
  "/:id/bloquear",
  authMiddleware,
  roleMiddleware("admin"),
  userController.bloquear
);

// Desbloquear fornecedor ou comprador
router.patch(
  "/:id/desbloquear",
  authMiddleware,
  roleMiddleware("admin"),
  userController.desbloquear
);

module.exports = router;
