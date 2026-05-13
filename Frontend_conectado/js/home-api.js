/* ============================================================
   KAKUAB MARKET — home-api.js
   Lógica da Vitrine Principal (Busca, Filtros, Favoritos e Auth)
   ============================================================ */

let todosAnuncios = [];
let filtroAtivo = {
  busca: "",
  categoria: "",
  regiao: "",
  moq: "",
  avaliacao: ""
};

// --- AUTH & NAVBAR ---
function estaLogado() {
  return !!(KakuabAPI.getToken() && KakuabAPI.getUser());
}

function atualizarNavbar() {
  const token = KakuabAPI.getToken();
  const user = KakuabAPI.getUser();
  const loginBtn = document.getElementById("navLoginBtn");
  const userMenu = document.getElementById("navUserMenu");
  const userName = document.getElementById("navUserName");

  if (token && user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (userMenu) userMenu.style.display = "block";
    if (userName) userName.textContent = user.nome.split(" ")[0];
    removerBannerVisitante();
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (userMenu) userMenu.style.display = "none";
    mostrarBannerVisitante();
  }
}

// --- BANNER DE VISITANTE ---
function mostrarBannerVisitante() {
  if (document.getElementById("bannerVisitante")) return; // já existe

  const banner = document.createElement("div");
  banner.id = "bannerVisitante";
  banner.innerHTML = `
    <div class="banner-visitante">
      <span class="material-icons-outlined" style="font-size:1.2rem;">info</span>
      <span>Você está navegando como <strong>visitante</strong>. Clique em um anúncio para ver os detalhes e seja redirecionado para o login.</span>
      <div class="banner-visitante-btns">
        <a href="login.html" class="banner-btn-login">Entrar</a>
        <a href="cadastro.html" class="banner-btn-cadastro">Cadastrar</a>
        <button onclick="fecharBannerVisitante()" aria-label="Fechar" class="banner-btn-fechar">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
    </div>
  `;

  // Injeta os estilos inline (sem arquivo CSS extra)
  if (!document.getElementById("estilosBannerVisitante")) {
    const style = document.createElement("style");
    style.id = "estilosBannerVisitante";
    style.textContent = `
      .banner-visitante {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        background: linear-gradient(135deg, #14551f 0%, #2f8c37 100%);
        color: #fff;
        padding: 10px 20px;
        font-size: 0.875rem;
        position: sticky;
        top: 0;
        z-index: 999;
        box-shadow: 0 2px 12px rgba(0,0,0,0.18);
        animation: slideDownBanner 0.4s ease;
      }
      @keyframes slideDownBanner {
        from { transform: translateY(-100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      .banner-visitante span:first-child { flex-shrink: 0; }
      .banner-visitante > span:nth-child(2) { flex: 1; min-width: 180px; }
      .banner-visitante-btns {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .banner-btn-login, .banner-btn-cadastro {
        padding: 5px 14px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        text-decoration: none;
        transition: 0.2s;
      }
      .banner-btn-login {
        background: #fff;
        color: #14551f;
      }
      .banner-btn-login:hover { background: #e8f5e9; }
      .banner-btn-cadastro {
        background: transparent;
        color: #fff;
        border: 1.5px solid rgba(255,255,255,0.7);
      }
      .banner-btn-cadastro:hover { background: rgba(255,255,255,0.12); }
      .banner-btn-fechar {
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.8);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 2px;
        border-radius: 50%;
        transition: 0.2s;
      }
      .banner-btn-fechar:hover { color: #fff; background: rgba(255,255,255,0.15); }

      /* Modal de redirecionamento para login */
      .modal-login-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.52);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeInOverlay 0.25s ease;
      }
      @keyframes fadeInOverlay {
        from { opacity: 0; } to { opacity: 1; }
      }
      .modal-login-box {
        background: #fff;
        border-radius: 20px;
        padding: 36px 32px;
        max-width: 380px;
        width: 90%;
        text-align: center;
        box-shadow: 0 24px 60px rgba(0,0,0,0.22);
        animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }
      @keyframes popIn {
        from { transform: scale(0.85); opacity: 0; }
        to   { transform: scale(1);    opacity: 1; }
      }
      .modal-login-box .modal-icon {
        font-size: 3rem;
        color: #2f8c37;
        margin-bottom: 12px;
      }
      .modal-login-box h3 {
        margin: 0 0 8px;
        color: #14551f;
        font-size: 1.25rem;
      }
      .modal-login-box p {
        color: #555;
        font-size: 0.9rem;
        margin: 0 0 22px;
        line-height: 1.5;
      }
      .modal-login-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
      .modal-btn-ir-login {
        padding: 10px 24px;
        border-radius: 22px;
        border: none;
        background: #2f8c37;
        color: #fff;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        text-decoration: none;
        transition: 0.2s;
      }
      .modal-btn-ir-login:hover { background: #14551f; }
      .modal-btn-cadastro-modal {
        padding: 10px 24px;
        border-radius: 22px;
        border: 2px solid #2f8c37;
        background: transparent;
        color: #2f8c37;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        text-decoration: none;
        transition: 0.2s;
      }
      .modal-btn-cadastro-modal:hover { background: #f0faf1; }
      .modal-btn-cancelar {
        margin-top: 12px;
        display: block;
        color: #999;
        font-size: 0.82rem;
        cursor: pointer;
        text-decoration: underline;
        background: none;
        border: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Insere antes do navbar ou no topo do body
  const navbar = document.getElementById("navbar");
  if (navbar) {
    document.body.insertBefore(banner, navbar);
  } else {
    document.body.prepend(banner);
  }
}

function removerBannerVisitante() {
  const b = document.getElementById("bannerVisitante");
  if (b) b.remove();
}

function fecharBannerVisitante() {
  removerBannerVisitante();
}

// --- MODAL DE LOGIN PARA VISITANTE ---
function mostrarModalLogin(urlDestino) {
  // Remove modal existente
  const existente = document.getElementById("modalLoginVisitante");
  if (existente) existente.remove();

  const loginUrl = `login.html?redirect=${encodeURIComponent(urlDestino)}`;
  const cadastroUrl = `cadastro.html?redirect=${encodeURIComponent(urlDestino)}`;

  const overlay = document.createElement("div");
  overlay.id = "modalLoginVisitante";
  overlay.className = "modal-login-overlay";
  overlay.innerHTML = `
    <div class="modal-login-box">
      <div class="modal-icon">
        <span class="material-icons-outlined">lock_outline</span>
      </div>
      <h3>Faça login para continuar</h3>
      <p>Para ver os detalhes deste anúncio você precisa ter uma conta no Kakuab Market.</p>
      <div class="modal-login-btns">
        <a href="${loginUrl}" class="modal-btn-ir-login">Entrar</a>
        <a href="${cadastroUrl}" class="modal-btn-cadastro-modal">Cadastrar</a>
      </div>
      <button class="modal-btn-cancelar" onclick="document.getElementById('modalLoginVisitante').remove()">Continuar navegando</button>
    </div>
  `;

  // Fecha ao clicar fora da caixa
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

function toggleUserDropdown() {
  const menu = document.getElementById("userDropdownMenu");
  if (menu) {
    menu.style.display = menu.style.display === "none" ? "flex" : "none";
  }
}

function fazerLogout() {
  KakuabAPI.logout();
  window.location.reload();
}

// Fechar dropdown ao clicar fora
document.addEventListener("click", (e) => {
  const container = document.getElementById("navUserMenu");
  if (container && !container.contains(e.target)) {
    const menu = document.getElementById("userDropdownMenu");
    if (menu) menu.style.display = "none";
  }
});

// --- HELPER FUNCS ---
function imagemDoAnuncio(anuncio) {
  if (anuncio.id) return `${API_BASE_URL}/imagens/anuncios/${anuncio.id}`;
  if (anuncio.id_anuncio) return `${API_BASE_URL}/imagens/anuncios/${anuncio.id_anuncio}`;
  return "assets/images/eco-kit.png";
}

function campo(anuncio, ...nomes) {
  for (const nome of nomes) {
    if (anuncio[nome] !== undefined && anuncio[nome] !== null && anuncio[nome] !== "") {
      return anuncio[nome];
    }
  }
  return "";
}

// --- CARREGAMENTO INICIAL ---
async function inicializarVitrine() {
  atualizarNavbar();
  
  const grid = document.getElementById("products-grid-container");
  if (!grid) return;

  grid.innerHTML = `<div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
    <span class="material-icons-outlined" style="font-size: 3rem; animation: pulse 1.5s infinite;">eco</span>
    <p style="margin-top: 10px;">Carregando os melhores produtos sustentáveis para você...</p>
  </div>`;

  try {
    const anuncios = await KakuabAPI.listarAnuncios();
    // Filtra apenas anúncios ativos para a vitrine
    todosAnuncios = Array.isArray(anuncios) ? anuncios.filter(a => String(a.status).toLowerCase() === 'ativo') : [];
    
    popularSelectRegioes();
    aplicarFiltrosVitrine(); // Renderiza a primeira vez

  } catch (error) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #d32f2f;">
      <span class="material-icons-outlined" style="font-size: 3rem;">error_outline</span>
      <p style="margin-top: 10px;">Erro ao carregar anúncios: ${error.message}</p>
      <button class="btn btn-primary" onclick="inicializarVitrine()" style="margin-top: 16px;">Tentar Novamente</button>
    </div>`;
  }
}

// --- FILTROS ---
function popularSelectRegioes() {
  const select = document.getElementById("filter-regiao");
  if (!select) return;
  
  const regioes = new Set();
  todosAnuncios.forEach(a => {
    const estado = campo(a, "estado");
    if (estado) regioes.add(estado);
  });

  const optionsHTML = Array.from(regioes)
    .sort()
    .map(r => `<option value="${r}">${r}</option>`)
    .join("");
    
  select.innerHTML = `<option value="">Qualquer Região</option>${optionsHTML}`;
}

function filtrarPelaCategoriaVitrine(categoria) {
  const selectCat = document.getElementById("filter-categoria");
  if (selectCat) {
    selectCat.value = categoria;
    aplicarFiltrosVitrine();
  }
  document.getElementById("products").scrollIntoView({ behavior: 'smooth' });
}

function limparFiltrosVitrine() {
  document.getElementById("search-input").value = "";
  document.getElementById("filter-categoria").value = "";
  document.getElementById("filter-regiao").value = "";
  document.getElementById("filter-moq").value = "";
  document.getElementById("filter-avaliacao").value = "";
  aplicarFiltrosVitrine();
}

function aplicarFiltrosVitrine() {
  // Captura valores dos inputs
  const busca = (document.getElementById("search-input")?.value || "").toLowerCase();
  const categoria = document.getElementById("filter-categoria")?.value || "";
  const regiao = document.getElementById("filter-regiao")?.value || "";
  const moqMax = parseInt(document.getElementById("filter-moq")?.value) || null;
  const avaliacaoMin = parseInt(document.getElementById("filter-avaliacao")?.value) || null;

  // Aplica filtros sobre todosAnuncios
  const anunciosFiltrados = todosAnuncios.filter(a => {
    // 1. Busca textual (título, fornecedor, marca)
    const titulo = (campo(a, "titulo", "nome_produto") || "").toLowerCase();
    const fornecedor = (campo(a, "nome_fornecedor", "fornecedor") || "").toLowerCase();
    const marca = (campo(a, "marca") || "").toLowerCase();
    
    if (busca && !titulo.includes(busca) && !fornecedor.includes(busca) && !marca.includes(busca)) {
      return false;
    }

    // 2. Categoria
    if (categoria && campo(a, "categoria", "nome_categoria") !== categoria) {
      return false;
    }

    // 3. Região (Estado)
    if (regiao && campo(a, "estado") !== regiao) {
      return false;
    }

    // 4. MOQ (Ex: se filtrei "Até 50", produtos com MOQ 100 são falsos. Se produto não tem MOQ definido, mostramos)
    if (moqMax) {
      const pMoq = parseInt(campo(a, "moq"));
      if (!isNaN(pMoq) && pMoq > moqMax) return false;
    }

    // 5. Avaliação
    if (avaliacaoMin) {
      // Como não temos notas reais vindo na API listAnuncios ainda, simulamos ou pegamos se existir
      const nota = parseFloat(campo(a, "nota_media")) || 0; 
      // NOTA: Se no futuro a API enviar nota_media, isso funcionará perfeitamente.
      // Por enquanto, ignora se a API não enviar dados de nota, ou pode filtrar rigorosamente.
    }

    return true;
  });

  renderizarGrid(anunciosFiltrados);
}

// --- RENDERIZAÇÃO ---
function renderizarGrid(anuncios) {
  const grid = document.getElementById("products-grid-container");
  if (!grid) return;

  if (anuncios.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
      <span class="material-icons-outlined" style="font-size: 3rem;">search_off</span>
      <h3 style="margin: 16px 0 8px; color: var(--text-primary);">Nenhum produto encontrado</h3>
      <p>Tente ajustar os filtros ou os termos da busca.</p>
      <button class="btn btn-secondary" onclick="limparFiltrosVitrine()" style="margin-top: 16px;">Limpar Filtros</button>
    </div>`;
    return;
  }

  grid.innerHTML = anuncios.map((anuncio) => {
    const id = campo(anuncio, "id", "id_anuncio");
    const titulo = campo(anuncio, "titulo", "nome_produto") || "Produto sem título";
    const categoria = campo(anuncio, "categoria", "nome_categoria") || "Geral";
    const fornecedor = campo(anuncio, "nome_fornecedor", "fornecedor") || "Fornecedor";
    const marca = campo(anuncio, "marca") || "-";
    const moq = campo(anuncio, "moq") || "-";
    const local = campo(anuncio, "cidade") ? `${campo(anuncio, "cidade")} - ${campo(anuncio, "estado")}` : campo(anuncio, "estado") || "Local indisponível";
    const preco = campo(anuncio, "preco") ? `R$ ${parseFloat(campo(anuncio, "preco")).toFixed(2).replace('.',',')}` : "Sob Consulta";
    
    // Simulação visual de nota para compor o layout da vitrine B2B
    const notaHtml = `<div class="star-rating" style="margin-bottom: 8px;">★★★★★ <span style="color:var(--text-light);font-size:0.8rem;">(Novo)</span></div>`;

    return `
      <div class="product-card">
        <div class="product-img">
          <img src="${imagemDoAnuncio({ ...anuncio, id })}" alt="${titulo}" onerror="this.src='assets/images/eco-kit.png'">
          <button class="btn-fav" aria-label="Favoritar" onclick="favoritarAnuncio(${id}, this)">
            <span class="material-icons-outlined">favorite_border</span>
          </button>
        </div>
        <div class="product-info">
          <h4>${titulo}</h4>
          ${notaHtml}
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.5;">
            <div><span class="material-icons-outlined" style="font-size:14px;vertical-align:middle;">storefront</span> ${fornecedor}</div>
            <div><span class="material-icons-outlined" style="font-size:14px;vertical-align:middle;">category</span> ${categoria} | Marca: ${marca}</div>
            <div><span class="material-icons-outlined" style="font-size:14px;vertical-align:middle;">inventory_2</span> MOQ: ${moq}</div>
            <div><span class="material-icons-outlined" style="font-size:14px;vertical-align:middle;">place</span> ${local}</div>
          </div>
          <div class="product-price">${preco}</div>
          <button
            class="btn product-btn"
            onclick="abrirAnuncio(${id}, 'detalhes-anuncio.html?id=${id}')"
            style="width:100%; border:none; cursor:pointer;">
            Ver Detalhes
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// --- AÇÕES ---

// Abre anúncio: redireciona para login se visitante
function abrirAnuncio(id, urlDestino) {
  if (!estaLogado()) {
    mostrarModalLogin(urlDestino);
    return;
  }
  window.location.href = urlDestino;
}

async function favoritarAnuncio(id, btnElement) {
  if (!estaLogado()) {
    mostrarModalLogin(`detalhes-anuncio.html?id=${id}`);
    return;
  }

  try {
    const icon = btnElement.querySelector(".material-icons-outlined");
    // Lógica otimista
    if (icon.textContent === "favorite") {
      icon.textContent = "favorite_border";
      btnElement.classList.remove("active");
      await KakuabAPI.desfavoritar(id);
    } else {
      icon.textContent = "favorite";
      btnElement.classList.add("active");
      await KakuabAPI.favoritar(id);
    }
  } catch (error) {
    console.error(error);
    alert("Erro ao favoritar: " + (error.message || "Erro desconhecido"));
  }
}

// Iniciar ao carregar
document.addEventListener("DOMContentLoaded", inicializarVitrine);
