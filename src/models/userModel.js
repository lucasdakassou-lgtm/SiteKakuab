// Importa a conexão com o banco SQLite
const db = require("../config/database");

// Lista todos os usuários do sistema
function listarUsuarios(callback) {
  const sql = `
    SELECT 
      u.id_usuario as id,
      u.nome,
      u.email,
      u.tipo_usuario as tipo,
      u.ativo as status,
      u.data_criacao as criado_em,
      COALESCE(f.cnpj, c.cnpj) as cnpj,
      COALESCE(f.cidade, c.cidade) as cidade,
      COALESCE(f.estado, c.estado) as estado
    FROM usuarios u
    LEFT JOIN fornecedores f ON u.id_usuario = f.id_usuario
    LEFT JOIN compradores c ON u.id_usuario = c.id_usuario
    ORDER BY u.data_criacao DESC
  `;

  db.all(sql, [], callback);
}

// Busca um usuário específico pelo ID
function buscarUsuarioPorId(id, callback) {
  const sql = `
    SELECT 
      id_usuario as id,
      nome,
      email,
      tipo_usuario as tipo,
      ativo as status
    FROM usuarios
    WHERE id_usuario = ?
  `;

  db.get(sql, [id], callback);
}

// Atualiza o status de um usuário
// status aqui vira 1 (ativo) ou 0 (bloqueado)
function atualizarStatusUsuario(id, statusString, callback) {
  const ativo = statusString === 'ativo' ? 1 : 0;
  const sql = `
    UPDATE usuarios
    SET ativo = ?
    WHERE id_usuario = ?
  `;

  db.run(sql, [ativo, id], function (err) {
    callback(err, {
      alterados: this ? this.changes : 0
    });
  });
}

// Atualiza nome e/ou senha do usuário
function atualizarPerfilUsuario(id, nome, senhaHash, callback) {
  let sql = "UPDATE usuarios SET ";
  const params = [];

  if (nome) {
    sql += "nome = ? ";
    params.push(nome);
  }

  if (senhaHash) {
    if (params.length > 0) sql += ", ";
    sql += "senha = ? ";
    params.push(senhaHash);
  }

  sql += "WHERE id_usuario = ?";
  params.push(id);

  if (params.length === 1) { // Só tem o ID, não há o que atualizar
    return callback(null, { alterados: 0 });
  }

  db.run(sql, params, function (err) {
    callback(err, {
      alterados: this ? this.changes : 0
    });
  });
}

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarStatusUsuario,
  atualizarPerfilUsuario
};
