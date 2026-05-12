CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fornecedores (
    id_fornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20),
    telefone VARCHAR(20),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    bloqueado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS compradores (
    id_comprador INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    telefone VARCHAR(20),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    bloqueado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS anuncios (
    id_anuncio INTEGER PRIMARY KEY AUTOINCREMENT,
    id_fornecedor INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    unidade_embalagem VARCHAR(100),
    marca VARCHAR(100),
    moq INTEGER,
    regiao_atendida VARCHAR(255),
    prazo_entrega VARCHAR(100),
    formas_contato VARCHAR(255),
    status VARCHAR(20),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_fornecedor) REFERENCES fornecedores(id_fornecedor),
    FOREIGN KEY(id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE IF NOT EXISTS anuncio_imagens (
    id_imagem INTEGER PRIMARY KEY AUTOINCREMENT,
    id_anuncio INTEGER NOT NULL,
    url VARCHAR(500),
    FOREIGN KEY(id_anuncio) REFERENCES anuncios(id_anuncio)
);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id_avaliacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_anuncio INTEGER NOT NULL,
    id_comprador INTEGER NOT NULL,
    nota INTEGER,
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_anuncio) REFERENCES anuncios(id_anuncio),
    FOREIGN KEY(id_comprador) REFERENCES compradores(id_comprador)
);

CREATE TABLE IF NOT EXISTS favoritos (
    id_comprador INTEGER,
    id_anuncio INTEGER,
    data_favorito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_comprador, id_anuncio),
    FOREIGN KEY(id_comprador) REFERENCES compradores(id_comprador),
    FOREIGN KEY(id_anuncio) REFERENCES anuncios(id_anuncio)
);

CREATE TABLE IF NOT EXISTS aprovacoes (
    id_aprovacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_anuncio INTEGER,
    id_admin INTEGER,
    status_aprovacao VARCHAR(20),
    motivo TEXT,
    data_aprovacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_anuncio) REFERENCES anuncios(id_anuncio),
    FOREIGN KEY(id_admin) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS log_auditoria (
    id_log INTEGER PRIMARY KEY AUTOINCREMENT,
    id_admin INTEGER,
    tipo_acao VARCHAR(100),
    descricao TEXT,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_admin) REFERENCES usuarios(id_usuario)
);
