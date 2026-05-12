/* ============================================================
   KAKUAB MARKET — favoritos.js
   ============================================================ */

let favoritosGlobal = [];

function imagemDoAnuncio(id) {
  if (id) return `${API_BASE_URL}/imagens/anuncios/${id}`;
  return "assets/images/eco-kit.png";
}

async function carregarFavoritos() {
  const token = KakuabAPI.getToken();
  const user = KakuabAPI.getUser();

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  if (user.tipo !== "comprador") {
    alert("Apenas compradores possuem lista de favoritos.");
    window.location.href = "index.html";
    return;
  }

  // Preenche Navbar
  document.getElementById("navUserName").textContent = user.nome.split(" ")[0];

  const grid = document.getElementById("favoritosGrid");

  try {
    const data = await KakuabAPI.listarFavoritos();
    favoritosGlobal = data;
    renderizarGrid(favoritosGlobal);
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <span class="material-icons-outlined" style="font-size: 3rem; color: #d32f2f;">error_outline</span>
        <h2 style="margin-top: 16px;">Erro ao carregar favoritos</h2>
        <p style="color: var(--text-secondary);">${error.message}</p>
      </div>
    `;
  }
}

function renderizarGrid(favoritos) {
  const grid = document.getElementById("favoritosGrid");

  if (!favoritos || favoritos.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <span class="material-icons-outlined" style="font-size: 3rem; color: var(--text-muted);">favorite_border</span>
        <h2 style="margin-top: 16px;">Sua lista está vazia</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">Você ainda não salvou nenhum produto.</p>
        <a href="index.html" class="btn btn-primary">Explorar Produtos</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = favoritos.map(fav => {
    // fav possui campos do anuncio devido ao JOIN na API
    const id = fav.id_anuncio || fav.anuncio_id;
    const titulo = fav.nome_produto || fav.titulo || "Produto sem título";
    const categoria = fav.categoria_nome || "Geral";
    const fornecedor = fav.nome_fornecedor || fav.fornecedor || "Fornecedor Parceiro";
    
    // Tratamento de preço
    let precoStr = "Sob Consulta";
    if (fav.preco && fav.preco > 0) {
      precoStr = `R$ ${parseFloat(fav.preco).toFixed(2).replace('.', ',')}`;
    }

    return `
      <div class="product-card" id="fav-card-${id}">
        <div class="product-img">
          <img src="${imagemDoAnuncio(id)}" alt="${titulo}" onerror="this.src='assets/images/eco-kit.png'">
          <div class="product-badge">${categoria}</div>
          <button class="favorite-btn active" onclick="removerFavorito(event, ${id})" title="Remover dos favoritos">
            <span class="material-icons-outlined" style="color: #e53935;">favorite</span>
          </button>
        </div>
        <div class="product-info">
          <h3 class="product-title">${titulo}</h3>
          <p class="product-vendor"><span class="material-icons-outlined" style="font-size: 14px; vertical-align: middle;">storefront</span> ${fornecedor}</p>
          <div class="product-footer">
            <span class="product-price">${precoStr}</span>
            <a href="detalhes-anuncio.html?id=${id}" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;">Detalhes</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function removerFavorito(event, anuncioId) {
  event.stopPropagation();
  event.preventDefault();

  try {
    await KakuabAPI.desfavoritar(anuncioId);
    
    // Remove localmente e renderiza novamente
    favoritosGlobal = favoritosGlobal.filter(f => f.id_anuncio !== anuncioId && f.anuncio_id !== anuncioId);
    renderizarGrid(favoritosGlobal);
  } catch (error) {
    alert("Erro ao remover favorito: " + error.message);
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
  window.location.href = "login.html";
}

document.addEventListener("click", (e) => {
  const container = document.getElementById("navUserMenu");
  if (container && !container.contains(e.target)) {
    const menu = document.getElementById("userDropdownMenu");
    if (menu) menu.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", carregarFavoritos);
