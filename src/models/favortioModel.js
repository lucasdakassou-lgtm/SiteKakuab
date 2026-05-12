// Importa a conexão com o banco SQLite
const db = require("../config/database");

// Adiciona um anúncio aos favoritos do comprador
function adicionarFavorito(compradorId, anuncioId, callback) {
  const sql = `
    INSERT INTO favoritos (comprador_id, anuncio_id)
    VALUES (?, ?)
  `;

  db.run(sql, [compradorId, anuncioId], function (err) {
    callback(err, {
      id: this?.lastID,
      comprador_id: compradorId,
      anuncio_id: anuncioId
    });
  });
}

// Remove um anúncio dos favoritos do comprador
function removerFavorito(compradorId, anuncioId, callback) {
  const sql = `
    DELETE FROM favoritos
    WHERE comprador_id = ? AND anuncio_id = ?
  `;

  db.run(sql, [compradorId, anuncioId], function (err) {
    callback(err, {
      removidos: this.changes
    });
  });
}

// Lista todos os anúncios favoritos de um comprador
function listarFavoritos(compradorId, callback) {
  const sql = `
    SELECT 
      favoritos.id AS favorito_id,
      anuncios.*,
      users.nome AS nome_fornecedor
    FROM favoritos
    INNER JOIN anuncios ON anuncios.id = favoritos.anuncio_id
    INNER JOIN users ON users.id = anuncios.fornecedor_id
    WHERE favoritos.comprador_id = ?
    ORDER BY favoritos.criado_em DESC
  `;

  db.all(sql, [compradorId], callback);
}

module.exports = {
  adicionarFavorito,
  removerFavorito,
  listarFavoritos
};
