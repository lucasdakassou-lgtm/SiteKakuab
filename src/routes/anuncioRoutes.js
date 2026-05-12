const express = require("express");
const router = express.Router();

const anuncioController = require("../controllers/anuncioController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Rotas específicas primeiro
router.get(
  "/fornecedor/meus-anuncios",
  authMiddleware,
  roleMiddleware("fornecedor"),
  anuncioController.meusAnuncios
);

router.get(
  "/admin/todos",
  authMiddleware,
  roleMiddleware("admin"),
  anuncioController.listarTodos
);

// Rotas públicas
router.get("/", anuncioController.listarPublicos);
router.get("/:id", anuncioController.buscarPorId);

// Rotas do fornecedor
router.post(
  "/",
  authMiddleware,
  roleMiddleware("fornecedor"),
  upload.single("imagem"),
  anuncioController.criar
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("fornecedor"),
  upload.single("imagem"),
  anuncioController.atualizar
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("fornecedor"),
  anuncioController.remover
);

module.exports = router;
