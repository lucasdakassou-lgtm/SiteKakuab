const db = require("../config/database");

// ── Criar anúncio ─────────────────────────────────────────────────────────────
exports.criar = async (req, res) => {
  console.log("[AnuncioController] POST /criar - Body recebido do front:", req.body);
  console.log("[AnuncioController] POST /criar - Arquivo recebido:", req.file);
  console.log("[AnuncioController] POST /criar - Usuário logado:", req.user);

  const {
    titulo, descricao, categoria,
    unidade_embalagem, marca, moq,
    regiao_atendida, prazo_entrega, formas_contato
  } = req.body;

  if (!titulo || !descricao || !categoria) {
    return res.status(400).json({ error: "Título, descrição e categoria são obrigatórios" });
  }

  try {
    // 1. Buscar id_fornecedor na tabela fornecedores usando o id_usuario logado
    const fornecedorId = await new Promise((resolve, reject) => {
      db.get("SELECT id_fornecedor FROM fornecedores WHERE id_usuario = ?", [req.user.id], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else resolve(row.id_fornecedor);
      });
    });

    if (!fornecedorId) {
      console.log("[AnuncioController] Erro: Usuário logado não tem perfil de fornecedor");
      return res.status(403).json({ error: "Perfil de fornecedor não encontrado" });
    }

    // 2. Buscar id_categoria na tabela categorias
    console.log(`[AnuncioController] Procurando categoria com o nome exato: '${categoria}'`);
    
    // Log para debug: vamos ver todas as categorias que tem no banco
    db.all("SELECT * FROM categorias", [], (err, rows) => {
      if (err) console.log("[AnuncioController] Erro ao listar categorias para debug:", err);
      else console.log("[AnuncioController] Categorias que existem atualmente no banco:", rows);
    });

    const categoriaId = await new Promise((resolve, reject) => {
      db.get("SELECT id_categoria FROM categorias WHERE LOWER(nome) = LOWER(?) LIMIT 1", [categoria], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else resolve(row.id_categoria);
      });
    });

    if (!categoriaId) {
      console.log(`[AnuncioController] Erro crítico: Categoria '${categoria}' não encontrada no banco`);
      return res.status(400).json({ error: `Categoria "${categoria}" não encontrada. Verifique se as categorias existem no banco.` });
    }

    // 3. Criar anúncio
    let imagemUrl = null;
    if (req.file) {
      imagemUrl = `/uploads/${req.file.filename}`;
    }

    const dados = {
      id_fornecedor: fornecedorId,
      id_categoria: categoriaId,
      titulo, descricao, unidade_embalagem, marca,
      moq, regiao_atendida, prazo_entrega, formas_contato,
      imagemUrl,
      status: "pendente"
    };

    console.log("[AnuncioController] Dados para salvar no banco:", dados);

    const anuncioModel = require("../models/anuncioModel");
    const anuncio = await new Promise((resolve, reject) => {
      anuncioModel.criarAnuncio(dados, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    console.log("[AnuncioController] Anúncio criado com sucesso:", anuncio);

    return res.status(201).json({
      message: "Anúncio criado com sucesso e enviado para aprovação",
      anuncio
    });
  } catch (err) {
    console.error("[AnuncioController Criar Error]:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ── Listar todos (admin) ───────────────────────────────────────────────────────
exports.listarTodos = (req, res) => {
  const anuncioModel = require("../models/anuncioModel");
  anuncioModel.listarAnuncios((err, anuncios) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(anuncios);
  });
};

// ── Listar públicos ────────────────────────────────────────────────────────────
exports.listarPublicos = (req, res) => {
  const anuncioModel = require("../models/anuncioModel");
  anuncioModel.listarAnunciosPublicos((err, anuncios) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(anuncios);
  });
};

// ── Listar categorias ──────────────────────────────────────────────────────────
exports.listarCategorias = (req, res) => {
  db.all("SELECT id_categoria, nome FROM categorias", [], (err, cats) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(cats);
  });
};

// ── Buscar por ID ──────────────────────────────────────────────────────────────
exports.buscarPorId = (req, res) => {
  const anuncioModel = require("../models/anuncioModel");
  const { id } = req.params;
  anuncioModel.buscarAnuncioPorId(id, (err, anuncio) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!anuncio) return res.status(404).json({ error: "Anúncio não encontrado" });
    return res.json(anuncio);
  });
};

// ── Meus anúncios (fornecedor) ────────────────────────────────────────────────
exports.meusAnuncios = async (req, res) => {
  const anuncioModel = require("../models/anuncioModel");
  try {
    const fornecedorId = await new Promise((resolve, reject) => {
      db.get("SELECT id_fornecedor FROM fornecedores WHERE id_usuario = ?", [req.user.id], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else resolve(row.id_fornecedor);
      });
    });

    if (!fornecedorId) return res.json([]);

    anuncioModel.listarPorFornecedor(fornecedorId, (err, anuncios) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json(anuncios);
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── Atualizar anúncio ─────────────────────────────────────────────────────────
exports.atualizar = async (req, res) => {
  console.log("[AnuncioController] PUT /atualizar - Body recebido:", req.body);
  const { id } = req.params;
  const {
    titulo, descricao, categoria,
    unidade_embalagem, marca, moq,
    regiao_atendida, prazo_entrega, formas_contato, status
  } = req.body;

  if (!titulo || !descricao || !categoria) {
    return res.status(400).json({ error: "Título, descrição e categoria são obrigatórios" });
  }

  try {
    const fornecedorId = await new Promise((resolve, reject) => {
      db.get("SELECT id_fornecedor FROM fornecedores WHERE id_usuario = ?", [req.user.id], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else resolve(row.id_fornecedor);
      });
    });

    const categoriaId = await new Promise((resolve, reject) => {
      db.get("SELECT id_categoria FROM categorias WHERE LOWER(nome) = LOWER(?) LIMIT 1", [categoria], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else resolve(row.id_categoria);
      });
    });

    if (!categoriaId) return res.status(400).json({ error: "Categoria não encontrada" });

    let imagemUrl = undefined;
    if (req.file) {
      imagemUrl = `/uploads/${req.file.filename}`;
    }

    const dados = {
      id_categoria: categoriaId,
      titulo, descricao, unidade_embalagem, marca,
      moq, regiao_atendida, prazo_entrega, formas_contato,
      imagemUrl,
      status: status || "pendente"
    };

    const anuncioModel = require("../models/anuncioModel");
    anuncioModel.atualizarAnuncio(id, fornecedorId, dados, (err, resultado) => {
      if (err) return res.status(500).json({ error: err.message });
      if (resultado.alterados === 0) {
        return res.status(404).json({ error: "Anúncio não encontrado ou sem permissão" });
      }
      return res.json({ message: "Anúncio atualizado com sucesso" });
    });
  } catch (err) {
    console.error("[AnuncioController Atualizar Error]:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ── Remover anúncio ───────────────────────────────────────────────────────────
exports.remover = async (req, res) => {
  const { id } = req.params;
  const anuncioModel = require("../models/anuncioModel");
  try {
    const fornecedorId = await new Promise((resolve, reject) => {
      db.get("SELECT id_fornecedor FROM fornecedores WHERE id_usuario = ?", [req.user.id], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else resolve(row.id_fornecedor);
      });
    });

    anuncioModel.removerAnuncio(id, fornecedorId, (err, resultado) => {
      if (err) return res.status(500).json({ error: err.message });
      if (resultado.removidos === 0) {
        return res.status(404).json({ error: "Anúncio não encontrado ou sem permissão" });
      }
      return res.json({ message: "Anúncio removido com sucesso" });
    });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};
