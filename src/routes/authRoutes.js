const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const { register, login, me } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Limita tentativas de login para melhorar segurança
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos."
  }
});

// Cadastro de fornecedor, comprador ou admin
router.post("/register", register);

// Login com proteção contra muitas tentativas
router.post("/login", loginLimiter, login);

// Perfil do usuário logado
router.get("/me", authMiddleware, me);

module.exports = router;
