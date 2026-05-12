# 🌿 Kakuab Market

**Marketplace B2B para produtos naturais, orgânicos, sustentáveis e artesanais do Brasil.**

Conecta compradores empresariais a fornecedores verificados numa plataforma completa com autenticação, painel do fornecedor, painel administrativo, avaliações, favoritos e muito mais.

---

## 📑 Índice

1. [Visão Geral](#-visão-geral)
2. [Tecnologias](#-tecnologias)
3. [Estrutura do Projeto](#-estrutura-do-projeto)
4. [Páginas do Frontend](#-páginas-do-frontend)
5. [API — Endpoints](#-api--endpoints)
6. [Banco de Dados](#-banco-de-dados)
7. [Perfis de Acesso](#-perfis-de-acesso)
8. [Como Rodar Localmente](#-como-rodar-localmente)
9. [Variáveis de Ambiente](#-variáveis-de-ambiente)
10. [Contas de Teste](#-contas-de-teste)

---

## 📌 Visão Geral

O Kakuab Market é uma plataforma **B2B** (Business to Business) onde:

- **Compradores** exploram produtos, salvam favoritos, entram em contato com fornecedores e deixam avaliações.
- **Fornecedores** criam e gerenciam anúncios de produtos com fotos, preços, descrição, MOQ e prazo de entrega.
- **Administradores** aprovam/reprovam anúncios, moderam avaliações, bloqueiam usuários e acompanham rankings.

---

## 🛠️ Tecnologias

### Backend
| Tecnologia | Uso |
|---|---|
| **Node.js** | Ambiente de execução |
| **Express.js v5** | Framework da API REST |
| **SQLite3** | Banco de dados relacional local |
| **JSON Web Token (JWT)** | Autenticação de sessão |
| **Bcrypt** | Criptografia de senhas |
| **Multer** | Upload de imagens |
| **Helmet** | Segurança HTTP |
| **CORS** | Controle de acesso entre origens |
| **Nodemon** | Hot-reload em desenvolvimento |

### Frontend
| Tecnologia | Uso |
|---|---|
| **HTML5 Semântico** | Estrutura das páginas |
| **CSS3 (Vanilla)** | Estilização e responsividade |
| **JavaScript puro (ES6+)** | Lógica de interface |
| **Fetch API** | Comunicação com o backend |
| **Google Fonts (Poppins)** | Tipografia |
| **Material Icons** | Ícones |

---

## 📂 Estrutura do Projeto

```
backendkakuab-main-main/
│
├── src/
│   ├── config/
│   │   └── database.js          # Conexão SQLite + criação automática das tabelas
│   ├── controllers/
│   │   ├── authController.js    # Login, cadastro, geração de JWT
│   │   ├── anuncioController.js # CRUD de anúncios
│   │   ├── avaliacaoController.js
│   │   ├── favoritoController.js
│   │   ├── userController.js    # Listagem, bloqueio, atualizar perfil
│   │   └── adminController.js   # Aprovação de anúncios, moderação
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Valida JWT no header Authorization
│   │   ├── roleMiddleware.js    # Checa o tipo de usuário (comprador/fornecedor/admin)
│   │   ├── uploadMiddleware.js  # Multer para upload de imagens
│   │   └── errorMiddleware.js   # Tratamento global de erros
│   ├── models/
│   │   ├── userModel.js         # Queries de usuário
│   │   ├── anuncioModel.js      # Queries de anúncio
│   │   ├── avaliacaoModel.js    # Queries de avaliação
│   │   └── favoritoModel.js     # Queries de favorito
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth
│   │   ├── anuncioRoutes.js     # /api/anuncios
│   │   ├── adminRoutes.js       # /api/admin
│   │   ├── avaliacaoRoutes.js   # /api/avaliacoes
│   │   ├── favoritoRoutes.js    # /api/favoritos
│   │   ├── imagemRoutes.js      # /api/imagens
│   │   └── userRoutes.js        # /api/users
│   └── server.js                # Entrypoint — Express, middlewares, rotas
│
├── Frontend_conectado/
│   ├── index.html               # Vitrine de produtos (comprador)
│   ├── vitrine.html             # Landing Page de marketing
│   ├── login.html               # Login de usuários
│   ├── cadastro.html            # Cadastro (comprador ou fornecedor)
│   ├── fornecedor.html          # Painel do Fornecedor
│   ├── admin.html               # Painel Administrativo
│   ├── detalhes-anuncio.html    # Página de detalhes de produto
│   ├── meu-perfil.html          # Perfil do usuário logado
│   ├── favoritos.html           # Lista de favoritos do comprador
│   ├── css/
│   │   ├── styles.css           # Design system global (variáveis, reset)
│   │   ├── home.css             # Estilos da vitrine
│   │   ├── landing.css          # Estilos da landing page
│   │   ├── detalhes.css         # Estilos da página de detalhes
│   │   └── perfil.css           # Estilos do painel de perfil
│   └── js/
│       ├── api.js               # Classe KakuabAPI (fetch wrapper)
│       ├── home-api.js          # Lógica da vitrine (busca, filtros)
│       ├── fornecedor.js        # Lógica do painel do fornecedor
│       ├── admin.js             # Lógica do painel administrativo
│       ├── detalhes.js          # Lógica da página de detalhes
│       ├── favoritos.js         # Lógica da página de favoritos
│       ├── perfil.js            # Lógica do painel de perfil
│       ├── login.js             # Lógica de login
│       └── cadastro.js          # Lógica de cadastro
│
├── uploads/                     # Imagens enviadas pelos fornecedores
├── .env                         # Variáveis de ambiente (não versionar)
├── package.json
└── README.md
```

---

## 🖥️ Páginas do Frontend

| Página | Arquivo | Acesso |
|---|---|---|
| Landing Page | `vitrine.html` | Público |
| Vitrine de Produtos | `index.html` | Público |
| Detalhes do Produto | `detalhes-anuncio.html` | Público |
| Login | `login.html` | Público |
| Cadastro | `cadastro.html` | Público |
| Painel do Fornecedor | `fornecedor.html` | 🔒 Fornecedor |
| Meu Perfil | `meu-perfil.html` | 🔒 Logado |
| Favoritos | `favoritos.html` | 🔒 Comprador |
| Painel Administrativo | `admin.html` | 🔒 Admin |

---

## 🔌 API — Endpoints

### Autenticação — `/api/auth`
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/api/auth/cadastro` | Cadastra novo usuário | Público |
| `POST` | `/api/auth/login` | Realiza login, retorna JWT | Público |

### Anúncios — `/api/anuncios`
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/anuncios` | Lista todos os anúncios ativos | Público |
| `GET` | `/api/anuncios/:id` | Busca anúncio por ID | Público |
| `POST` | `/api/anuncios` | Cria novo anúncio (com imagem) | 🔒 Fornecedor |
| `PUT` | `/api/anuncios/:id` | Atualiza anúncio | 🔒 Fornecedor |
| `DELETE` | `/api/anuncios/:id` | Remove anúncio | 🔒 Fornecedor |

### Admin — `/api/admin`
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/admin/anuncios/pendentes` | Lista anúncios pendentes | 🔒 Admin |
| `PATCH` | `/api/admin/anuncios/:id/aprovar` | Aprova anúncio | 🔒 Admin |
| `PATCH` | `/api/admin/anuncios/:id/reprovar` | Reprova com motivo | 🔒 Admin |
| `GET` | `/api/admin/avaliacoes` | Lista todas as avaliações | 🔒 Admin |
| `DELETE` | `/api/admin/avaliacoes/:id` | Remove avaliação | 🔒 Admin |
| `GET` | `/api/admin/ranking` | Top anúncios mais favoritados | 🔒 Admin |

### Avaliações — `/api/avaliacoes`
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/avaliacoes/anuncios/:id` | Lista avaliações de um anúncio | Público |
| `GET` | `/api/avaliacoes/anuncios/:id/media` | Média de notas do anúncio | Público |
| `POST` | `/api/avaliacoes/:anuncioId` | Cria avaliação | 🔒 Comprador |
| `DELETE` | `/api/avaliacoes/:avaliacaoId` | Remove própria avaliação | 🔒 Comprador |

### Favoritos — `/api/favoritos`
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/favoritos` | Lista favoritos do comprador | 🔒 Comprador |
| `POST` | `/api/favoritos/:anuncioId` | Adiciona aos favoritos | 🔒 Comprador |
| `DELETE` | `/api/favoritos/:anuncioId` | Remove dos favoritos | 🔒 Comprador |

### Usuários — `/api/users`
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `PUT` | `/api/users/me` | Atualiza nome/senha do usuário | 🔒 Logado |
| `GET` | `/api/users` | Lista todos os usuários | 🔒 Admin |
| `PATCH` | `/api/users/:id/bloquear` | Bloqueia usuário | 🔒 Admin |
| `PATCH` | `/api/users/:id/desbloquear` | Desbloqueia usuário | 🔒 Admin |

### Imagens — `/api/imagens`
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/imagens/anuncios/:id` | Retorna imagem do anúncio |

> As imagens também são acessíveis diretamente via `/uploads/<nome-do-arquivo>`.

---

## 🗄️ Banco de Dados

O banco é **SQLite** e o arquivo é gerado automaticamente em `src/database/` na primeira execução.

### Tabelas Principais

| Tabela | Descrição |
|---|---|
| `usuarios` | Dados básicos: nome, e-mail, senha (hash), tipo, status ativo |
| `fornecedores` | CNPJ, cidade, estado, e-mail do fornecedor vinculado ao usuário |
| `compradores` | CNPJ, cidade, estado do comprador vinculado ao usuário |
| `anuncios` | Produto: nome, descrição, preço, MOQ, prazo, status, id do fornecedor |
| `anuncio_imagens` | URLs das imagens vinculadas a cada anúncio |
| `avaliacoes` | Nota (1-5), comentário, id do comprador, id do anúncio |
| `favoritos` | Relação entre comprador e anúncio favoritado |

---

## 🔐 Perfis de Acesso

O sistema usa **Role-Based Access Control (RBAC)** via `roleMiddleware`.

| Perfil | O que pode fazer |
|---|---|
| **Público** | Ver vitrine, landing page, detalhes de produtos e avaliações |
| **Comprador** | Favoritar, avaliar produtos, ver favoritos, editar seu perfil |
| **Fornecedor** | Criar, editar e remover seus próprios anúncios, editar perfil |
| **Admin** | Tudo acima + aprovar/reprovar anúncios, bloquear usuários, moderar avaliações |

### Fluxo de Autenticação
1. O frontend envia e-mail e senha para `POST /api/auth/login`
2. O backend verifica a senha com `bcrypt.compare()`
3. Se válido, retorna um **JWT** assinado com `JWT_SECRET`
4. O frontend armazena o token no `localStorage` (`kakuab_token`)
5. Toda requisição protegida envia o token no header: `Authorization: Bearer <token>`

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- NPM (vem junto com o Node)

### Passo a passo

```bash
# 1. Clone ou extraia o projeto
cd backendkakuab-main-main

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Crie o arquivo .env na raiz (veja a seção abaixo)

# 4. (Opcional) Crie a conta admin
node create_admin.js

# 5. Inicie o servidor em modo de desenvolvimento
npm run dev
```

O servidor será iniciado em: **http://localhost:3000**

Para acessar o frontend, abra diretamente os arquivos HTML da pasta `Frontend_conectado/` no navegador, ou use uma extensão como **Live Server** no VS Code.

> ⚠️ O banco de dados SQLite é criado automaticamente na primeira execução. Não é necessário instalar nada além do Node.js.

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
PORT=3000
JWT_SECRET=SuaChaveSuperSecretaAqui
```

| Variável | Descrição | Obrigatório |
|---|---|---|
| `PORT` | Porta do servidor (padrão: 3000) | Não |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT | **Sim** |

> ⚠️ **Nunca versione o `.env` no Git.** Ele já está no `.gitignore`.

---

## 🧪 Contas de Teste

Para criar a conta de administrador inicial, execute:

```bash
node create_admin.js
```

Após rodar o script, a conta admin estará disponível com as credenciais definidas dentro do próprio `create_admin.js`.

Para verificar usuários e contas no banco durante o desenvolvimento:

```bash
node check_users.js     # Lista usuários cadastrados
node check_accounts.js  # Lista contas de fornecedores e compradores
node check_tables.js    # Exibe estrutura das tabelas do banco
```

---

## 📄 Scripts Disponíveis

```bash
npm run dev    # Inicia o servidor com Nodemon (hot-reload)
npm start      # Inicia o servidor em modo produção
```

---

*Projeto desenvolvido com 💚 para o Brasil sustentável.*
