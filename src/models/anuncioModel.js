const db = require("../config/database");

function criarAnuncio(dados, callback) {
  const sql = `
    INSERT INTO anuncios (
      id_fornecedor,
      id_categoria,
      titulo,
      descricao,
      unidade_embalagem,
      marca,
      moq,
      regiao_atendida,
      prazo_entrega,
      formas_contato,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    dados.id_fornecedor,
    dados.id_categoria,
    dados.titulo,
    dados.descricao,
    dados.unidade_embalagem,
    dados.marca,
    dados.moq,
    dados.regiao_atendida,
    dados.prazo_entrega,
    dados.formas_contato,
    dados.status || "pendente"
  ];

  db.run(sql, params, function (err) {
    if (err) return callback(err);
    const idAnuncio = this?.lastID;
    
    if (dados.imagemUrl) {
      db.run(`INSERT INTO anuncio_imagens (id_anuncio, url) VALUES (?, ?)`, [idAnuncio, dados.imagemUrl], (errImg) => {
        callback(errImg, { id_anuncio: idAnuncio, ...dados });
      });
    } else {
      callback(null, { id_anuncio: idAnuncio, ...dados });
    }
  });
}

function listarAnuncios(callback) {
  const sql = `
    SELECT 
      anuncios.*,
      categorias.nome AS categoria_nome,
      fornecedores.razao_social AS nome_fornecedor,
      usuarios.email AS email_fornecedor,
      (SELECT url FROM anuncio_imagens WHERE id_anuncio = anuncios.id_anuncio LIMIT 1) AS imagem
    FROM anuncios
    INNER JOIN categorias ON categorias.id_categoria = anuncios.id_categoria
    INNER JOIN fornecedores ON fornecedores.id_fornecedor = anuncios.id_fornecedor
    INNER JOIN usuarios ON usuarios.id_usuario = fornecedores.id_usuario
    ORDER BY anuncios.data_criacao DESC
  `;
  db.all(sql, [], callback);
}

function listarAnunciosPublicos(callback) {
  const sql = `
    SELECT 
      anuncios.*,
      categorias.nome AS categoria_nome,
      fornecedores.razao_social AS nome_fornecedor,
      (SELECT url FROM anuncio_imagens WHERE id_anuncio = anuncios.id_anuncio LIMIT 1) AS imagem
    FROM anuncios
    INNER JOIN categorias ON categorias.id_categoria = anuncios.id_categoria
    INNER JOIN fornecedores ON fornecedores.id_fornecedor = anuncios.id_fornecedor
    WHERE anuncios.status = 'ativo'
    ORDER BY anuncios.data_criacao DESC
  `;
  db.all(sql, [], callback);
}

function buscarAnuncioPorId(id, callback) {
  const sql = `
    SELECT 
      anuncios.*,
      categorias.nome AS categoria_nome,
      fornecedores.razao_social AS nome_fornecedor,
      usuarios.email AS email_fornecedor,
      (SELECT url FROM anuncio_imagens WHERE id_anuncio = anuncios.id_anuncio LIMIT 1) AS imagem
    FROM anuncios
    INNER JOIN categorias ON categorias.id_categoria = anuncios.id_categoria
    INNER JOIN fornecedores ON fornecedores.id_fornecedor = anuncios.id_fornecedor
    INNER JOIN usuarios ON usuarios.id_usuario = fornecedores.id_usuario
    WHERE anuncios.id_anuncio = ?
  `;
  db.get(sql, [id], callback);
}

function listarPorFornecedor(fornecedorId, callback) {
  const sql = `
    SELECT 
      anuncios.*,
      categorias.nome AS categoria_nome,
      (SELECT url FROM anuncio_imagens WHERE id_anuncio = anuncios.id_anuncio LIMIT 1) AS imagem
    FROM anuncios
    INNER JOIN categorias ON categorias.id_categoria = anuncios.id_categoria
    WHERE anuncios.id_fornecedor = ?
    ORDER BY anuncios.data_criacao DESC
  `;
  db.all(sql, [fornecedorId], callback);
}

function atualizarAnuncio(id, fornecedorId, dados, callback) {
  const sql = `
    UPDATE anuncios
    SET 
      id_categoria = ?,
      titulo = ?,
      descricao = ?,
      unidade_embalagem = ?,
      marca = ?,
      moq = ?,
      regiao_atendida = ?,
      prazo_entrega = ?,
      formas_contato = ?,
      status = ?
    WHERE id_anuncio = ? AND id_fornecedor = ?
  `;
  const params = [
    dados.id_categoria, dados.titulo, dados.descricao, dados.unidade_embalagem,
    dados.marca, dados.moq, dados.regiao_atendida, dados.prazo_entrega,
    dados.formas_contato, dados.status, id, fornecedorId
  ];

  db.run(sql, params, function (err) {
    if (err) return callback(err);
    const alterados = this.changes;

    if (dados.imagemUrl && alterados > 0) {
      // Atualiza a imagem (se já existir atualiza, senão insere, mas como o sqlite nativo é chato com UPSERT aqui, vamos tentar dar UPDATE primeiro)
      db.run("UPDATE anuncio_imagens SET url = ? WHERE id_anuncio = ?", [dados.imagemUrl, id], function(errUpd) {
        if (this.changes === 0) {
          db.run("INSERT INTO anuncio_imagens (id_anuncio, url) VALUES (?, ?)", [id, dados.imagemUrl], () => {
            callback(null, { alterados });
          });
        } else {
          callback(null, { alterados });
        }
      });
    } else {
      callback(null, { alterados });
    }
  });
}

function removerAnuncio(id, fornecedorId, callback) {
  // Primeiro remove as imagens
  db.run("DELETE FROM anuncio_imagens WHERE id_anuncio = ?", [id], () => {
    // Depois o anúncio
    const sql = `DELETE FROM anuncios WHERE id_anuncio = ? AND id_fornecedor = ?`;
    db.run(sql, [id, fornecedorId], function (err) {
      callback(err, { removidos: this.changes });
    });
  });
}
function listarPendentes(callback) {
  console.log("[AnuncioModel] Buscando anúncios pendentes...");
  const sql = `
    SELECT 
      anuncios.*,
      categorias.nome AS categoria_nome,
      fornecedores.razao_social AS nome_fornecedor,
      usuarios.email AS email_fornecedor,
      (SELECT url FROM anuncio_imagens WHERE id_anuncio = anuncios.id_anuncio LIMIT 1) AS imagem
    FROM anuncios
    INNER JOIN categorias ON categorias.id_categoria = anuncios.id_categoria
    INNER JOIN fornecedores ON fornecedores.id_fornecedor = anuncios.id_fornecedor
    INNER JOIN usuarios ON usuarios.id_usuario = fornecedores.id_usuario
    WHERE anuncios.status = 'pendente'
    ORDER BY anuncios.data_criacao DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) console.error("[AnuncioModel] Erro ao buscar pendentes:", err);
    callback(err, rows);
  });
}

function aprovarAnuncio(id, callback) {
  console.log(`[AnuncioModel] Aprovando anúncio ${id}`);
  const sql = `UPDATE anuncios SET status = 'ativo' WHERE id_anuncio = ?`;
  db.run(sql, [id], function (err) {
    if (err) console.error("[AnuncioModel] Erro ao aprovar:", err);
    callback(err, { alterados: this ? this.changes : 0 });
  });
}

function reprovarAnuncio(id, callback) {
  console.log(`[AnuncioModel] Reprovando anúncio ${id}`);
  const sql = `UPDATE anuncios SET status = 'reprovado' WHERE id_anuncio = ?`;
  db.run(sql, [id], function (err) {
    if (err) console.error("[AnuncioModel] Erro ao reprovar:", err);
    callback(err, { alterados: this ? this.changes : 0 });
  });
}

function registrarLogAdmin(log, callback) {
  console.log(`[AnuncioModel] Registrando log admin:`, log);
  const descricao = `Entidade: ${log.entidade} (ID: ${log.entidade_id}). Motivo: ${log.motivo || 'N/A'}`;
  const sql = `INSERT INTO log_auditoria (id_admin, tipo_acao, descricao) VALUES (?, ?, ?)`;
  db.run(sql, [log.admin_id, log.acao, descricao], function (err) {
    if (err) console.error("[AnuncioModel] Erro ao registrar log:", err);
    callback(err, { id: this ? this.lastID : null });
  });
}

module.exports = {
  criarAnuncio,
  listarAnuncios,
  listarAnunciosPublicos,
  buscarAnuncioPorId,
  listarPorFornecedor,
  atualizarAnuncio,
  removerAnuncio,
  listarPendentes,
  aprovarAnuncio,
  reprovarAnuncio,
  registrarLogAdmin
};
