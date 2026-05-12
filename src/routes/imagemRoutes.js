const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("../config/database");

router.get("/anuncios/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT anuncio_imagens.url AS imagem, anuncios.status
    FROM anuncios
    LEFT JOIN anuncio_imagens ON anuncios.id_anuncio = anuncio_imagens.id_anuncio
    WHERE anuncios.id_anuncio = ?
    LIMIT 1
  `;

  db.get(sql, [id], (err, anuncio) => {
    if (err) {
      return res.status(500).json({
        error: "Erro ao buscar imagem do anúncio"
      });
    }

    if (!anuncio) {
      return res.status(404).json({
        error: "Anúncio não encontrado"
      });
    }

    if (!anuncio.imagem) {
      return res.status(404).json({
        error: "Este anúncio não possui imagem"
      });
    }

    if (anuncio.status !== "ativo") {
      return res.status(403).json({
        error: "Imagem indisponível"
      });
    }

    const filename = path.basename(anuncio.imagem);
    const imagePath = path.join(__dirname, "../../uploads", filename);

    return res.sendFile(imagePath);
  });
});

module.exports = router;