// Importa conexão SQLite
const db = require("../config/database");

// Cria uma avaliação para um anúncio
function criarAvaliacao(dados, callback) {
  const sql = `
    INSERT INTO avaliacoes (
      nota,
      comentario,
      id_comprador,
      id_anuncio
    ) VALUES (?, ?, ?, ?)
  `;

  const params = [
    dados.nota,
    dados.comentario,
    dados.comprador_id,
    dados.anuncio_id
  ];

  db.run(sql, params, function (err) {
    callback(err, {
      id_avaliacao: this?.lastID,
      ...dados
    });
  });
}

// Lista avaliações de um anúncio específico
function listarPorAnuncio(anuncioId, callback) {
  const sql = `
    SELECT 
      avaliacoes.*,
      usuarios.nome AS nome_comprador
    FROM avaliacoes
    INNER JOIN compradores ON compradores.id_comprador = avaliacoes.id_comprador
    INNER JOIN usuarios ON usuarios.id_usuario = compradores.id_usuario
    WHERE avaliacoes.id_anuncio = ?
    ORDER BY avaliacoes.data_avaliacao DESC
  `;

  db.all(sql, [anuncioId], callback);
}

// Calcula a média de avaliação de um anúncio
function mediaPorAnuncio(anuncioId, callback) {
  const sql = `
    SELECT 
      AVG(nota) AS media,
      COUNT(*) AS total_avaliacoes
    FROM avaliacoes
    WHERE id_anuncio = ?
  `;

  db.get(sql, [anuncioId], callback);
}

// Remove avaliação do próprio comprador
function removerAvaliacao(compradorId, avaliacaoId, callback) {
  const sql = `
    DELETE FROM avaliacoes
    WHERE id_avaliacao = ? AND id_comprador = ?
  `;

  db.run(sql, [avaliacaoId, compradorId], function (err) {
    callback(err, {
      removidos: this.changes
    });
  });
}

module.exports = {
  criarAvaliacao,
  listarPorAnuncio,
  mediaPorAnuncio,
  removerAvaliacao
};
