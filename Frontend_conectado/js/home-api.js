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
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (userMenu) userMenu.style.display = "none";
  }
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
          <a href="detalhes-anuncio.html?id=${id}" class="btn product-btn" style="text-decoration:none; display:block; text-align:center;">
            Ver Detalhes
          </a>
        </div>
      </div>
    `;
  }).join("");
}

// --- AÇÕES ---
async function favoritarAnuncio(id, btnElement) {
  if (!KakuabAPI.getToken() || !KakuabAPI.getUser()) {
    alert("Você precisa fazer login como comprador para favoritar produtos.");
    window.location.href = "login.html";
    return;
  }

  try {
    const icon = btnElement.querySelector(".material-icons-outlined");
    // Lógica otimista
    if (icon.textContent === "favorite") {
      icon.textContent = "favorite_border";
      btnElement.classList.remove("active");
      await KakuabAPI.desfavoritar(id); // Assume que KakuabAPI.desfavoritar existe
    } else {
      icon.textContent = "favorite";
      btnElement.classList.add("active");
      await KakuabAPI.favoritar(id);
    }
  } catch (error) {
    // Reverte
    console.error(error);
    alert("Erro ao favoritar: " + (error.message || "Erro desconhecido"));
  }
}

// Iniciar ao carregar
document.addEventListener("DOMContentLoaded", inicializarVitrine);
