const anuncioModel = require("../models/anuncioModel");

exports.listarPendentes = (req, res) => {
  anuncioModel.listarPendentes((err, anuncios) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json(anuncios);
  });
};

exports.obterEstatisticas = (req, res) => {
  const db = require("../config/database");
  const stats = { 
    fornecedores: 0, compradores: 0, anuncios: 0, 
    anuncios_pendentes: 0, anuncios_ativos: 0, anuncios_reprovados: 0,
    media_avaliacoes: 0
  };
  
  db.serialize(() => {
    db.get("SELECT COUNT(*) as c FROM usuarios WHERE tipo_usuario = 'fornecedor'", [], (e, r) => { if(r) stats.fornecedores = r.c; });
    db.get("SELECT COUNT(*) as c FROM usuarios WHERE tipo_usuario = 'comprador'", [], (e, r) => { if(r) stats.compradores = r.c; });
    db.get("SELECT COUNT(*) as c FROM anuncios", [], (e, r) => { if(r) stats.anuncios = r.c; });
    db.get("SELECT COUNT(*) as c FROM anuncios WHERE status = 'pendente'", [], (e, r) => { if(r) stats.anuncios_pendentes = r.c; });
    db.get("SELECT COUNT(*) as c FROM anuncios WHERE status = 'ativo'", [], (e, r) => { if(r) stats.anuncios_ativos = r.c; });
    db.get("SELECT COUNT(*) as c FROM anuncios WHERE status = 'reprovado'", [], (e, r) => { if(r) stats.anuncios_reprovados = r.c; });
    db.get("SELECT AVG(nota) as m FROM avaliacoes", [], (e, r) => { 
      if(r && r.m) stats.media_avaliacoes = parseFloat(r.m).toFixed(1); 
      else stats.media_avaliacoes = 0;
      res.json(stats);
    });
  });
};

exports.aprovarAnuncio = (req, res) => {
  const { id } = req.params;

  anuncioModel.aprovarAnuncio(id, (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultado.alterados === 0) return res.status(404).json({ error: "Anúncio não encontrado" });

    const log = { admin_id: req.user.id, acao: "APROVAR_ANUNCIO", entidade: "anuncios", entidade_id: id, motivo: "Aprovado" };
    anuncioModel.registrarLogAdmin(log, () => {
      res.json({ message: "Anúncio aprovado com sucesso" });
    });
  });
};

exports.reprovarAnuncio = (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  if (!motivo) return res.status(400).json({ error: "Informe o motivo" });

  anuncioModel.reprovarAnuncio(id, (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultado.alterados === 0) return res.status(404).json({ error: "Anúncio não encontrado" });

    const log = { admin_id: req.user.id, acao: "REPROVAR_ANUNCIO", entidade: "anuncios", entidade_id: id, motivo };
    anuncioModel.registrarLogAdmin(log, () => {
      res.json({ message: "Anúncio reprovado", motivo });
    });
  });
};

exports.listarAvaliacoes = (req, res) => {
  const db = require("../config/database");
  const sql = `
    SELECT av.id_avaliacao as id, av.nota, av.comentario, av.data_avaliacao as data,
           u.nome as comprador, an.titulo as anuncio
    FROM avaliacoes av
    JOIN compradores c ON av.id_comprador = c.id_comprador
    JOIN usuarios u ON c.id_usuario = u.id_usuario
    JOIN anuncios an ON av.id_anuncio = an.id_anuncio
    ORDER BY av.data_avaliacao DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.removerAvaliacao = (req, res) => {
  const db = require("../config/database");
  const { id } = req.params;
  db.run("DELETE FROM avaliacoes WHERE id_avaliacao = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Avaliação não encontrada" });

    const log = { admin_id: req.user.id, acao: "REMOVER_AVALIACAO", entidade: "avaliacoes", entidade_id: id, motivo: "Conteúdo inadequado" };
    anuncioModel.registrarLogAdmin(log, () => {
      res.json({ message: "Avaliação removida com sucesso" });
    });
  });
};

exports.listarAuditoria = (req, res) => {
  const db = require("../config/database");
  const sql = `
    SELECT l.id_log as id, l.tipo_acao, l.descricao, l.data_acao as data, u.nome as admin
    FROM log_auditoria l
    JOIN usuarios u ON l.id_admin = u.id_usuario
    ORDER BY l.data_acao DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.obterRanking = (req, res) => {
  const db = require("../config/database");
  // Como não há visualizações, usamos favoritos para o ranking
  const sql = `
    SELECT an.id_anuncio as id, an.titulo, f.razao_social as fornecedor, 
           COUNT(fav.id_anuncio) as qtd_favoritos
    FROM anuncios an
    JOIN fornecedores f ON an.id_fornecedor = f.id_fornecedor
    LEFT JOIN favoritos fav ON an.id_anuncio = fav.id_anuncio
    GROUP BY an.id_anuncio
    ORDER BY qtd_favoritos DESC, an.data_criacao DESC
    LIMIT 10
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
