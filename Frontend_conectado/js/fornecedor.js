/* ============================================================
   KAKUAB MARKET — fornecedor.js
   SPA Logic e CRUD para Fornecedores
   ============================================================ */

let todosAnuncios = []; // Cache local

// Exibe Notificação Toast
function mostrarMsg(texto, tipo = "sucesso") {
  const msgBox = document.getElementById("globalMsg");
  const msgText = document.getElementById("globalMsgText");
  const icon = msgBox.querySelector(".icon");

  msgBox.className = tipo;
  msgText.textContent = texto;
  icon.textContent = tipo === "erro" ? "error" : "check_circle";

  msgBox.classList.add("show");
  setTimeout(() => {
    msgBox.classList.remove("show");
  }, 4000);
}

// Troca de Telas (Tabs)
function switchView(viewId, navElement) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
  
  document.getElementById(`view-${viewId}`).classList.add('active');
  if(navElement) navElement.classList.add('active');

  if (viewId === 'novo') {
    limparFormulario();
  }
}

// Atualiza nome do arquivo no drag&drop form
function updateFileName(input) {
  const label = document.getElementById('fileName');
  if(input.files.length > 0) {
    label.textContent = "Arquivo selecionado: " + input.files[0].name;
  } else {
    label.textContent = "";
  }
}

// Validação de Sessão
function exigirFornecedor() {
  const user = getUser();
  const token = getToken();

  if (!token || !user) {
    window.location.href = "login.html";
    return false;
  }

  if (user.tipo !== "fornecedor") {
    alert("Acesso restrito para fornecedores.");
    window.location.href = "index.html";
    return false;
  }

  // Preenche dados da sidebar
  document.getElementById("userName").textContent = user.nome || "Empresa Fornecedora";
  document.getElementById("userEmail").textContent = user.email || "";
  document.getElementById("welcomeText").textContent = `Bem-vindo, ${user.nome.split(" ")[0]}`;
  document.getElementById("userInitial").textContent = user.nome ? user.nome.charAt(0).toUpperCase() : "F";

  return true;
}

// Buscar todos os anúncios da API
async function carregarMeusAnuncios() {
  const bodyList = document.getElementById("anunciosBody");
  const bodyDash = document.getElementById("dashLatestBody");
  
  bodyList.innerHTML = `<tr><td colspan="6" style="text-align: center;">Carregando...</td></tr>`;
  
  try {
    const anuncios = await KakuabAPI.meusAnuncios();
    todosAnuncios = Array.isArray(anuncios) ? anuncios : [];

    atualizarDashboardCards(todosAnuncios);
    renderTabela(todosAnuncios);
    
    // Renderiza ultimos no Dashboard
    const ultimos = todosAnuncios.slice(0, 4);
    if(ultimos.length === 0) {
      bodyDash.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nenhum anúncio ainda.</td></tr>`;
    } else {
      bodyDash.innerHTML = ultimos.map(a => `
        <tr>
          <td><strong style="color: var(--text-main)">${a.titulo}</strong></td>
          <td><span style="color: var(--text-muted); font-size: 0.85rem;">${a.categoria_nome || '-'}</span></td>
          <td><span class="status-badge status-${(a.status || 'pendente').toLowerCase()}">${a.status || 'pendente'}</span></td>
          <td><button class="action-btn" onclick="verDetalhes(${a.id_anuncio || a.id})" title="Ver Detalhes"><span class="material-icons-outlined" style="font-size: 1rem;">visibility</span></button></td>
        </tr>
      `).join("");
    }

  } catch (error) {
    bodyList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Erro: ${error.message}</td></tr>`;
  }
}

function atualizarDashboardCards(lista) {
  document.getElementById("statTotal").textContent = lista.length;
  document.getElementById("statAtivos").textContent = lista.filter(a => a.status === 'ativo').length;
  document.getElementById("statPendentes").textContent = lista.filter(a => a.status === 'pendente' || a.status === 'rascunho').length;
  document.getElementById("statPausados").textContent = lista.filter(a => a.status === 'pausado').length;
}

// Filtro na Tabela
function filtrarTabela(status, tabElement) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  tabElement.classList.add('active');

  if (status === 'todos') {
    renderTabela(todosAnuncios);
  } else {
    renderTabela(todosAnuncios.filter(a => a.status === status));
  }
}

// Renderiza Tabela Principal
function renderTabela(lista) {
  const body = document.getElementById("anunciosBody");
  
  if (lista.length === 0) {
    body.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">Nenhum anúncio encontrado.</td></tr>`;
    return;
  }

  body.innerHTML = lista.map((a) => {
    const id = a.id_anuncio || a.id;
    const thumb = a.imagem ? `<img src="http://localhost:3000${a.imagem}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">` : `<div style="width: 40px; height: 40px; border-radius: 8px; background: #eee; display: flex; align-items:center; justify-content:center;"><span class="material-icons-outlined" style="color:#aaa; font-size:1.2rem;">image</span></div>`;
    
    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-muted);">#${id}</td>
        <td>${thumb}</td>
        <td><strong style="color: var(--text-main)">${a.titulo}</strong></td>
        <td><span style="color: var(--text-muted); font-size: 0.85rem; text-transform: capitalize;">${a.categoria_nome || '-'}</span></td>
        <td><span class="status-badge status-${(a.status || 'pendente').toLowerCase()}">${a.status || 'pendente'}</span></td>
        <td>
          <button class="action-btn" onclick="verDetalhes(${id})" title="Detalhes"><span class="material-icons-outlined">visibility</span></button>
          <button class="action-btn" onclick='prepararEdicao(${JSON.stringify(a).replace(/'/g, "&apos;")})' title="Editar"><span class="material-icons-outlined">edit</span></button>
          <button class="action-btn pause" onclick="pausarAnuncio(${id}, '${a.status}')" title="${a.status==='pausado' ? 'Reativar' : 'Pausar'}"><span class="material-icons-outlined">${a.status==='pausado' ? 'play_arrow' : 'pause'}</span></button>
          <button class="action-btn delete" onclick="removerAnuncio(${id})" title="Excluir"><span class="material-icons-outlined">delete</span></button>
        </td>
      </tr>
    `;
  }).join("");
}

// Submissão do Formulário
async function salvarAnuncio(e) {
  e.preventDefault();
  const id = document.getElementById("anuncioId").value;
  
  const formData = new FormData();
  const campos = ["titulo", "descricao", "categoria", "unidade_embalagem", "marca", "moq", "regiao_atendida", "prazo_entrega", "formas_contato", "status"];
  
  campos.forEach(c => {
    const el = document.getElementById(c);
    if(el && el.value) formData.append(c, el.value);
  });

  const imagem = document.getElementById("imagem").files[0];
  if (imagem) formData.append("imagem", imagem);

  const btn = document.querySelector(".btn-submit");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    if (id) {
      await KakuabAPI.atualizarAnuncio(id, formData);
      mostrarMsg("Anúncio atualizado com sucesso!");
    } else {
      await KakuabAPI.criarAnuncio(formData);
      mostrarMsg("Novo anúncio criado e enviado para revisão!");
    }

    switchView('anuncios', document.querySelectorAll('.nav-item')[1]);
    carregarMeusAnuncios();
  } catch (error) {
    mostrarMsg(error.message, "erro");
  } finally {
    btn.disabled = false;
    btn.textContent = "Salvar Anúncio";
  }
}

// Edição
function prepararEdicao(anuncio) {
  document.getElementById("formPageTitle").textContent = "Editar Anúncio";
  document.getElementById("anuncioId").value = anuncio.id_anuncio || anuncio.id;
  document.getElementById("titulo").value = anuncio.titulo || "";
  document.getElementById("descricao").value = anuncio.descricao || "";
  document.getElementById("categoria").value = anuncio.categoria_nome || anuncio.categoria || "outros";
  document.getElementById("unidade_embalagem").value = anuncio.unidade_embalagem || "";
  document.getElementById("marca").value = anuncio.marca || "";
  document.getElementById("moq").value = anuncio.moq || "";
  document.getElementById("regiao_atendida").value = anuncio.regiao_atendida || "";
  document.getElementById("prazo_entrega").value = anuncio.prazo_entrega || "";
  document.getElementById("formas_contato").value = anuncio.formas_contato || "";
  
  document.getElementById("divStatus").style.display = "flex";
  document.getElementById("status").value = anuncio.status || "pendente";
  
  document.getElementById("fileName").textContent = anuncio.imagem ? "Imagem atual mantida. Selecione outra para trocar." : "";

  switchView('novo');
}

function limparFormulario() {
  document.getElementById("formPageTitle").textContent = "Cadastrar Novo Anúncio";
  document.getElementById("anuncioForm").reset();
  document.getElementById("anuncioId").value = "";
  document.getElementById("divStatus").style.display = "none";
  document.getElementById("status").value = "pendente";
  document.getElementById("fileName").textContent = "";
}

// Pausar
async function pausarAnuncio(id, statusAtual) {
  const novoStatus = statusAtual === 'pausado' ? 'pendente' : 'pausado'; // Volta para pendente para aprovar dnv ou rascunho
  
  // Como a API usa atualizarAnuncio para mudar status quando feito pelo fornecedor:
  const formData = new FormData();
  formData.append("status", novoStatus);
  // O backend exige titulo, descricao e categoria obrigatorios na edição? 
  // No anuncioController original sim! Entao vamos pegar o anuncio original do cache:
  const ad = todosAnuncios.find(a => (a.id_anuncio || a.id) === id);
  if(!ad) return;

  formData.append("titulo", ad.titulo);
  formData.append("descricao", ad.descricao);
  formData.append("categoria", ad.categoria_nome || ad.categoria || "outros");

  try {
    await KakuabAPI.atualizarAnuncio(id, formData);
    mostrarMsg(`Anúncio ${novoStatus === 'pausado' ? 'pausado' : 'reativado'}!`);
    carregarMeusAnuncios();
  } catch (e) {
    mostrarMsg(e.message, "erro");
  }
}

// Excluir
async function removerAnuncio(id) {
  if (!confirm("Tem certeza que deseja apagar este anúncio permanentemente?")) return;
  try {
    await KakuabAPI.removerAnuncio(id);
    mostrarMsg("Anúncio removido.");
    carregarMeusAnuncios();
  } catch (error) {
    mostrarMsg(error.message, "erro");
  }
}

// Modal de Detalhes
function verDetalhes(id) {
  const ad = todosAnuncios.find(a => (a.id_anuncio || a.id) === id);
  if(!ad) return;

  const imgBg = ad.imagem ? `url(http://localhost:3000${ad.imagem})` : 'none';

  document.getElementById("modalBody").innerHTML = `
    <div class="detail-image" style="background-image: ${imgBg};">
      ${!ad.imagem ? '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#aaa;">Sem Imagem</div>' : ''}
    </div>
    <div class="detail-item full" style="grid-column: 1 / -1;">
      <small>Título</small>
      <p style="font-size: 1.2rem; color: var(--primary);">${ad.titulo}</p>
    </div>
    <div class="detail-item">
      <small>Categoria</small>
      <p style="text-transform: capitalize;">${ad.categoria_nome || '-'}</p>
    </div>
    <div class="detail-item">
      <small>Status Atual</small>
      <p><span class="status-badge status-${(ad.status || 'pendente').toLowerCase()}">${ad.status}</span></p>
    </div>
    <div class="detail-item">
      <small>Marca</small>
      <p>${ad.marca || 'N/A'}</p>
    </div>
    <div class="detail-item">
      <small>Embalagem / Unidade</small>
      <p>${ad.unidade_embalagem || 'N/A'}</p>
    </div>
    <div class="detail-item">
      <small>Quantidade Mínima (MOQ)</small>
      <p>${ad.moq || 'N/A'}</p>
    </div>
    <div class="detail-item">
      <small>Região Atendida</small>
      <p>${ad.regiao_atendida || 'N/A'}</p>
    </div>
    <div class="detail-item full" style="grid-column: 1 / -1;">
      <small>Descrição</small>
      <p style="font-weight: 400; line-height: 1.6;">${ad.descricao}</p>
    </div>
  `;

  document.getElementById("modalDetalhes").classList.add('active');
}

function closeModal() {
  document.getElementById("modalDetalhes").classList.remove('active');
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  if (!exigirFornecedor()) return;
  document.getElementById("anuncioForm").addEventListener("submit", salvarAnuncio);
  carregarMeusAnuncios();
});
