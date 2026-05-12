const db = require("../config/database");
const { gerarHash, compararSenha } = require("../utils/hash");
const gerarToken = require("../utils/token");

function gerarProximoId(tabela, coluna) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT COALESCE(MAX(${coluna}), 0) + 1 AS proximoId FROM ${tabela}`;
    db.get(sql, [], (err, row) => {
      if (err) reject(err);
      else resolve(row.proximoId);
    });
  });
}

// CADASTRO
exports.register = async (req, res) => {
  console.log("[AuthController] POST /register - Body recebido:", req.body);
  try {
    const { nome, email, senha, tipo, razao_social, nome_fantasia, cnpj, telefone, cidade, estado } = req.body;

    if (!nome || !email || !senha || !tipo) {
      console.log("[AuthController] Erro: Faltam campos obrigatórios");
      return res.status(400).json({ error: "Preencha nome, email, senha e tipo" });
    }

    const tiposValidos = ["fornecedor", "comprador", "admin"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: "Tipo inválido. Use fornecedor, comprador ou admin." });
    }

    db.get("SELECT id_usuario FROM usuarios WHERE email = ?", [email], async (err, row) => {
      if (err) {
        console.error("[AuthController] DB Error (check email):", err);
        return res.status(500).json({ error: "Erro no banco de dados" });
      }
      if (row) {
        console.log("[AuthController] Erro: Email já cadastrado");
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      const senhaHash = await gerarHash(senha);
      const idUsuario = await gerarProximoId("usuarios", "id_usuario");

      const sqlUser = `INSERT INTO usuarios (id_usuario, nome, email, senha_hash, tipo_usuario, ativo) VALUES (?, ?, ?, ?, ?, 1)`;
      db.run(sqlUser, [idUsuario, nome, email, senhaHash, tipo], async function(err) {
        if (err) {
          console.error("[AuthController] Erro ao inserir usuario:", err);
          return res.status(500).json({ error: "Erro ao criar usuário" });
        }
        
        console.log(`[AuthController] Usuário criado! ID: ${idUsuario}, Tipo: ${tipo}`);

        if (tipo === "fornecedor") {
          const idFornecedor = await gerarProximoId("fornecedores", "id_fornecedor");
          const sqlFornecedor = `
            INSERT INTO fornecedores (id_fornecedor, id_usuario, razao_social, nome_fantasia, cnpj, telefone, cidade, estado, bloqueado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
          `;
          db.run(sqlFornecedor, [idFornecedor, idUsuario, razao_social || nome, nome_fantasia || nome, cnpj || null, telefone || null, cidade || null, estado || null], (errF) => {
            if (errF) console.error("[AuthController] Erro ao inserir fornecedor:", errF);
            else console.log(`[AuthController] Fornecedor criado! ID: ${idFornecedor}`);
          });
        } else if (tipo === "comprador") {
          const idComprador = await gerarProximoId("compradores", "id_comprador");
          const sqlComprador = `INSERT INTO compradores (id_comprador, id_usuario, razao_social, bloqueado) VALUES (?, ?, ?, 0)`;
          db.run(sqlComprador, [idComprador, idUsuario, razao_social || nome], (errC) => {
            if (errC) console.error("[AuthController] Erro ao inserir comprador:", errC);
            else console.log(`[AuthController] Comprador criado! ID: ${idComprador}`);
          });
        }

        return res.status(201).json({
          message: "Usuário cadastrado com sucesso",
          user: {
            id: idUsuario,
            nome,
            email,
            tipo,
            ativo: 1
          }
        });
      });
    });
  } catch (error) {
    console.error("[AuthController Register Error]:", error);
    return res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = (req, res) => {
  console.log("[AuthController] POST /login - Body recebido:", req.body);
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Preencha email e senha" });
  }

  const sql = `SELECT * FROM usuarios WHERE email = ?`;
  db.get(sql, [email], async (err, usuario) => {
    if (err) {
      console.error("[AuthController Login DB Error]:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!usuario) {
      console.log("[AuthController] Erro: Usuário não encontrado");
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    if (usuario.ativo === 0 || usuario.ativo === false || usuario.ativo === "false") {
      console.log("[AuthController] Erro: Usuário inativo/bloqueado");
      return res.status(403).json({ error: "Usuário bloqueado. Entre em contato com a administração." });
    }

    const senhaValida = await compararSenha(senha, usuario.senha_hash);

    if (!senhaValida) {
      console.log("[AuthController] Erro: Senha inválida");
      return res.status(400).json({ error: "Senha inválida" });
    }

    const usuarioParaToken = {
      id: usuario.id_usuario,
      email: usuario.email,
      tipo: usuario.tipo_usuario
    };

    console.log("[AuthController] Tentando gerar token para o usuário...", usuario.email);
    let token;
    try {
      token = gerarToken(usuarioParaToken);
    } catch (tokenError) {
      console.error("[AuthController] ERRO AO GERAR TOKEN:", tokenError.message);
      console.error("[AuthController] Stack Trace:", tokenError.stack);
      return res.status(500).json({ error: "Erro interno ao gerar o token de acesso. Verifique as configurações do servidor (.env)." });
    }
    console.log("[AuthController] Login bem-sucedido para:", usuario.email);

    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo_usuario,
        ativo: usuario.ativo
      }
    });
  });
};

// PERFIL DO USUÁRIO LOGADO
exports.me = (req, res) => {
  const usuarioId = req.user.id;
  const sql = `SELECT id_usuario, nome, email, tipo_usuario, ativo, data_criacao FROM usuarios WHERE id_usuario = ?`;

  db.get(sql, [usuarioId], (err, usuario) => {
    if (err) {
      console.error("[AuthController Me DB Error]:", err);
      return res.status(500).json({ error: err.message });
    }
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json({
      user: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo_usuario,
        ativo: usuario.ativo,
        data_criacao: usuario.data_criacao
      }
    });
  });
};
