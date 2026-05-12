// Importa o model de usuários
const userModel = require("../models/userModel");

// Lista todos os usuários
// Apenas admin deve acessar essa rota
exports.listar = (req, res) => {
  userModel.listarUsuarios((err, usuarios) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json(usuarios);
  });
};

// Busca usuário por ID
// Útil para o admin visualizar detalhes antes de bloquear/desbloquear
exports.buscarPorId = (req, res) => {
  const { id } = req.params;

  userModel.buscarUsuarioPorId(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    return res.json(usuario);
  });
};

// Bloqueia um usuário
// Regra: admin não deve bloquear outro admin por segurança
exports.bloquear = (req, res) => {
  const { id } = req.params;

  userModel.buscarUsuarioPorId(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    // Evita bloquear administradores
    if (usuario.tipo === "admin") {
      return res.status(403).json({
        error: "Não é permitido bloquear administradores"
      });
    }

    userModel.atualizarStatusUsuario(id, "bloqueado", (err, resultado) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (resultado.alterados === 0) {
        return res.status(400).json({
          error: "Não foi possível bloquear o usuário"
        });
      }

      return res.json({
        message: "Usuário bloqueado com sucesso"
      });
    });
  });
};

// Desbloqueia um usuário
exports.desbloquear = (req, res) => {
  const { id } = req.params;

  userModel.buscarUsuarioPorId(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    userModel.atualizarStatusUsuario(id, "ativo", (err, resultado) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (resultado.alterados === 0) {
        return res.status(400).json({
          error: "Não foi possível desbloquear o usuário"
        });
      }

      return res.json({
        message: "Usuário desbloqueado com sucesso"
      });
    });
  });
};

const bcrypt = require("bcrypt");

// Atualiza o perfil do usuário logado (nome/senha)
exports.atualizarPerfil = async (req, res) => {
  const id = req.user.id;
  const { nome, senha } = req.body;

  if (!nome && !senha) {
    return res.status(400).json({ error: "Nenhum dado fornecido para atualização" });
  }

  try {
    let senhaHash = null;
    if (senha) {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    userModel.atualizarPerfilUsuario(id, nome, senhaHash, (err, resultado) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (resultado.alterados === 0) {
        return res.status(400).json({ error: "Não foi possível atualizar o perfil" });
      }

      return res.json({ message: "Perfil atualizado com sucesso" });
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
