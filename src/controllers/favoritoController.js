// Importa o model de favoritos
const favoritoModel = require("../models/favoritoModel");

// Adicionar favorito
exports.adicionar = (req, res) => {
  const compradorId = req.user.id;
  const { anuncioId } = req.params;

  favoritoModel.adicionarFavorito(compradorId, anuncioId, (err, favorito) => {
    if (err) {
      // Erro de UNIQUE significa que já favoritou esse anúncio
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({
          error: "Este anúncio já está nos seus favoritos"
        });
      }

      return res.status(500).json({
        error: err.message
      });
    }

    return res.status(201).json({
      message: "Anúncio favoritado com sucesso",
      favorito
    });
  });
};

// Remover favorito
exports.remover = (req, res) => {
  const compradorId = req.user.id;
  const { anuncioId } = req.params;

  favoritoModel.removerFavorito(compradorId, anuncioId, (err, resultado) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (resultado.removidos === 0) {
      return res.status(404).json({
        error: "Favorito não encontrado"
      });
    }

    return res.json({
      message: "Favorito removido com sucesso"
    });
  });
};

// Listar favoritos do comprador logado
exports.listar = (req, res) => {
  const compradorId = req.user.id;

  favoritoModel.listarFavoritos(compradorId, (err, favoritos) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json(favoritos);
  });
};