// Importa a conexão com o banco SQLite
const db = require("../config/database");

// Adiciona um anúncio aos favoritos do comprador
function adicionarFavorito(usuarioId, anuncioId, callback) {
  db.get("SELECT id_comprador FROM compradores WHERE id_usuario = ?", [usuarioId], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error("Comprador não encontrado"));

    const idComp = row.id_comprador;
    
    const sql = `
      INSERT INTO favoritos (id_comprador, id_anuncio)
      VALUES (?, ?)
    `;

    db.run(sql, [idComp, anuncioId], function (errInsert) {
      callback(errInsert, {
        id_comprador: idComp,
        id_anuncio: anuncioId
      });
    });
  });
}

// Remove um anúncio dos favoritos do comprador
function removerFavorito(usuarioId, anuncioId, callback) {
  db.get("SELECT id_comprador FROM compradores WHERE id_usuario = ?", [usuarioId], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error("Comprador não encontrado"));

    const idComp = row.id_comprador;
    
    const sql = `
      DELETE FROM favoritos
      WHERE id_comprador = ? AND id_anuncio = ?
    `;

    db.run(sql, [idComp, anuncioId], function (errDelete) {
      callback(errDelete, {
        removidos: this.changes
      });
    });
  });
}

// Lista todos os anúncios favoritos de um comprador
function listarFavoritos(usuarioId, callback) {
  db.get("SELECT id_comprador FROM compradores WHERE id_usuario = ?", [usuarioId], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(null, []);

    const idComp = row.id_comprador;
    
    const sql = `
      SELECT 
        favoritos.id_anuncio AS favorito_id,
        anuncios.*,
        fornecedores.razao_social AS nome_fornecedor,
        (SELECT url FROM anuncio_imagens WHERE id_anuncio = anuncios.id_anuncio LIMIT 1) AS imagem
      FROM favoritos
      INNER JOIN anuncios ON anuncios.id_anuncio = favoritos.id_anuncio
      INNER JOIN fornecedores ON fornecedores.id_fornecedor = anuncios.id_fornecedor
      WHERE favoritos.id_comprador = ?
      ORDER BY favoritos.data_favorito DESC
    `;

    db.all(sql, [idComp], callback);
  });
}

module.exports = {
  adicionarFavorito,
  removerFavorito,
  listarFavoritos
};
