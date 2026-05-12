// Importa o model de avaliações
const avaliacaoModel = require("../models/avaliacaoModel");
const db = require("../config/database");

// Criar avaliação
exports.criar = async (req, res) => {
  const usuarioId = req.user.id;
  const { anuncioId } = req.params;
  const { nota, comentario } = req.body;

  // Validação da nota
  if (!nota || nota < 1 || nota > 5) {
    return res.status(400).json({
      error: "A nota deve ser entre 1 e 5"
    });
  }

  try {
    const compradorId = await new Promise((resolve, reject) => {
      db.get("SELECT id_comprador FROM compradores WHERE id_usuario = ?", [usuarioId], (err, row) => {
        if (err) reject(err);
        else if (!row) reject(new Error("Comprador não encontrado"));
        else resolve(row.id_comprador);
      });
    });

    const dados = {
      nota,
      comentario,
      comprador_id: compradorId,
      anuncio_id: anuncioId
    };

    avaliacaoModel.criarAvaliacao(dados, (err, avaliacao) => {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Você já avaliou este anúncio" });
        }
        return res.status(500).json({ error: err.message });
      }

      return res.status(201).json({
        message: "Avaliação criada com sucesso",
        avaliacao
      });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Listar avaliações de um anúncio
exports.listarPorAnuncio = (req, res) => {
  const { anuncioId } = req.params;

  avaliacaoModel.listarPorAnuncio(anuncioId, (err, avaliacoes) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json(avaliacoes);
  });
};

// Ver média das avaliações de um anúncio
exports.mediaPorAnuncio = (req, res) => {
  const { anuncioId } = req.params;

  avaliacaoModel.mediaPorAnuncio(anuncioId, (err, resultado) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json({
      anuncio_id: anuncioId,
      media: resultado.media || 0,
      total_avaliacoes: resultado.total_avaliacoes
    });
  });
};

// Remover própria avaliação
exports.remover = (req, res) => {
  const compradorId = req.user.id;
  const { avaliacaoId } = req.params;

  avaliacaoModel.removerAvaliacao(compradorId, avaliacaoId, (err, resultado) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (resultado.removidos === 0) {
      return res.status(404).json({
        error: "Avaliação não encontrada ou você não tem permissão"
      });
    }

    return res.json({
      message: "Avaliação removida com sucesso"
    });
  });
};
