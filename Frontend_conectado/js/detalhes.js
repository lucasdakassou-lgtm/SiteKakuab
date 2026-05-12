/* ============================================================
   KAKUAB MARKET — detalhes.js
   Lógica da Página de Detalhes do Anúncio
   ============================================================ */

let anuncioId = null;
let isFavorito = false;

// --- AUTH & NAVBAR (Reutilizado da Home) ---
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

document.addEventListener("click", (e) => {
  const container = document.getElementById("navUserMenu");
  if (container && !container.contains(e.target)) {
    const menu = document.getElementById("userDropdownMenu");
    if (menu) menu.style.display = "none";
  }
});

// --- HELPER FUNCS ---
function imagemDoAnuncio(id) {
  if (id) return `${API_BASE_URL}/imagens/anuncios/${id}`;
  return "assets/images/eco-kit.png";
}

// --- INICIALIZAÇÃO ---
async function carregarDetalhes() {
  atualizarNavbar();

  const urlParams = new URLSearchParams(window.location.search);
  anuncioId = urlParams.get('id');

  if (!anuncioId) {
    mostrarErro();
    return;
  }

  try {
    const anuncio = await KakuabAPI.buscarAnuncio(anuncioId);
    preencherDados(anuncio);
    
    // Mostra o conteúdo
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('contentState').style.display = 'flex';

    await carregarAvaliacoes();
    configurarFormularioAvaliacao();

  } catch (error) {
    console.error("Erro ao carregar detalhes:", error);
    mostrarErro();
  }
}

function mostrarErro() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('contentState').style.display = 'none';
  document.getElementById('errorState').style.display = 'block';
}

// --- PREENCHIMENTO DE DADOS ---
function preencherDados(a) {
  // Helpers para campos possivelmente nulos
  const getCampo = (c1, c2) => a[c1] || a[c2] || "";
  
  const idReal = getCampo("id_anuncio", "id");
  const titulo = getCampo("titulo", "nome_produto");
  const categoria = getCampo("categoria_nome", "categoria") || "Geral";
  const descricao = getCampo("descricao");
  const preco = getCampo("preco") ? `R$ ${parseFloat(getCampo("preco")).toFixed(2).replace('.',',')}` : "Sob Consulta";
  const fornecedor = getCampo("nome_fornecedor", "fornecedor") || "Fornecedor Parceiro";
  const emailFornecedor = getCampo("email_fornecedor");
  
  const moq = getCampo("moq") || "Não informado";
  const regiao = getCampo("regiao_atendida", "estado") || "Nacional";
  const marca = getCampo("marca") || "Sem marca";
  const prazo = getCampo("prazo_entrega") || "A combinar";

  // Imagem
  const img = document.getElementById('imgProduto');
  img.src = imagemDoAnuncio(idReal);
  img.onerror = () => { img.src = "assets/images/eco-kit.png"; };

  // Textos Base
  document.getElementById('txtTitulo').textContent = titulo;
  document.getElementById('txtDescricao').textContent = descricao || "O fornecedor não incluiu uma descrição detalhada para este produto.";
  document.getElementById('badgeCategoria').textContent = categoria;
  document.getElementById('txtFornecedor').textContent = fornecedor;
  document.getElementById('txtPreco').textContent = preco;

  // Tabela Técnica
  document.getElementById('txtMoq').textContent = moq;
  document.getElementById('txtRegiao').textContent = regiao;
  document.getElementById('txtMarca').textContent = marca;
  document.getElementById('txtPrazo').textContent = prazo;

  // Botão de Contato
  const btnContato = document.getElementById('btnContato');
  if (emailFornecedor) {
    btnContato.href = `mailto:${emailFornecedor}?subject=Interesse no produto: ${titulo} - Kakuab Market`;
  } else {
    btnContato.onclick = () => alert("E-mail do fornecedor não disponível no momento.");
    btnContato.href = "#";
  }

  // Verifica estado do favorito
  checarFavoritoLocal();
}

// --- AVALIAÇÕES ---
async function carregarAvaliacoes() {
  try {
    // 1. Média
    try {
      const respMedia = await KakuabAPI.mediaAvaliacoesAnuncio(anuncioId);
      const media = respMedia.media ? parseFloat(respMedia.media).toFixed(1) : "0.0";
      const total = respMedia.total || 0;
      
      document.getElementById('txtMediaNota').textContent = media;
      document.getElementById('txtTotalAvaliacoes').textContent = `${total} avaliações`;
      document.getElementById('txtAvaliacaoTopo').innerHTML = `<span style="color:#FFC107">★</span> ${media} (${total} avaliações)`;
      
      // Monta as estrelas visuais
      const numMedia = parseFloat(media);
      let estrelasHtml = "";
      for (let i = 1; i <= 5; i++) {
        estrelasHtml += i <= numMedia ? "★" : "☆";
      }
      document.getElementById('txtMediaEstrelas').textContent = estrelasHtml;

    } catch (e) {
      console.warn("Erro ao carregar média (pode não haver avaliações):", e.message);
    }

    // 2. Lista
    const avaliacoes = await KakuabAPI.listarAvaliacoesAnuncio(anuncioId);
    const container = document.getElementById('listaAvaliacoes');

    if (!avaliacoes || avaliacoes.length === 0) {
      container.innerHTML = `<p style="text-align:center; color: var(--text-muted);">Ainda não há avaliações para este produto. Seja o primeiro a avaliar!</p>`;
      return;
    }

    container.innerHTML = avaliacoes.map(av => {
      let estrelas = "";
      for (let i = 1; i <= 5; i++) {
        estrelas += i <= av.nota ? '<span style="color:#FFC107">★</span>' : '<span style="color:#e0e0e0">★</span>';
      }
      
      const data = av.data_criacao ? new Date(av.data_criacao).toLocaleDateString('pt-BR') : "";

      return `
        <div class="avaliacao-card">
          <div class="avaliacao-card-header">
            <div class="avaliacao-autor">${av.nome_comprador || "Comprador Kakuab"}</div>
            <div class="avaliacao-data">${data}</div>
          </div>
          <div style="margin-bottom: 8px;">${estrelas}</div>
          <div class="avaliacao-texto">${av.comentario || ""}</div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error("Erro ao carregar lista de avaliações:", error);
    document.getElementById('listaAvaliacoes').innerHTML = `<p style="text-align:center; color: #d32f2f;">Erro ao carregar avaliações.</p>`;
  }
}

function configurarFormularioAvaliacao() {
  const user = KakuabAPI.getUser();
  const boxMsgLogin = document.getElementById('boxMsgLogin');
  const boxFormAvaliacao = document.getElementById('boxFormAvaliacao');

  if (!user) {
    boxMsgLogin.style.display = 'block';
    boxFormAvaliacao.style.display = 'none';
  } else if (user.tipo === 'comprador') {
    boxMsgLogin.style.display = 'none';
    boxFormAvaliacao.style.display = 'block';
  } else {
    // Fornecedor ou admin não avalia
    boxMsgLogin.style.display = 'none';
    boxFormAvaliacao.style.display = 'none';
  }
}

async function enviarAvaliacao() {
  const notaEl = document.querySelector('input[name="nota"]:checked');
  const comentario = document.getElementById('inputComentario').value;

  if (!notaEl) {
    alert("Selecione uma nota de 1 a 5 estrelas.");
    return;
  }

  const nota = parseInt(notaEl.value);

  try {
    await KakuabAPI.avaliar(anuncioId, nota, comentario);
    alert("Avaliação enviada com sucesso!");
    document.getElementById('inputComentario').value = ""; // Limpa
    await carregarAvaliacoes(); // Recarrega
  } catch (error) {
    alert("Erro ao enviar avaliação: " + error.message);
  }
}

// --- FAVORITOS ---
// NOTA: Idealmente a API teria um endpoint /favoritos/verificar/:id, mas vamos manter local por ora.
function checarFavoritoLocal() {
  // Simples verificação local só para UX, ou assumimos não favoritado inicialmente.
  // Uma API real validaria se este ID já está na lista de favoritos do usuário.
}

async function toggleFavorito() {
  if (!KakuabAPI.getToken() || !KakuabAPI.getUser()) {
    alert("Você precisa fazer login como comprador para favoritar produtos.");
    window.location.href = "login.html";
    return;
  }

  const icone = document.getElementById('iconeFavorito');
  const isCurrentlyFav = icone.textContent === "favorite";

  try {
    if (isCurrentlyFav) {
      icone.textContent = "favorite_border";
      icone.style.color = "inherit";
      await KakuabAPI.desfavoritar(anuncioId);
    } else {
      icone.textContent = "favorite";
      icone.style.color = "#e53935";
      await KakuabAPI.favoritar(anuncioId);
    }
  } catch (error) {
    console.error(error);
    alert("Erro ao alterar favorito: " + error.message);
  }
}

// Iniciar ao carregar
document.addEventListener("DOMContentLoaded", carregarDetalhes);
