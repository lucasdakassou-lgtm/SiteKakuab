let anunciosPendentes = [];
let anuncioSelecionado = null;

async function apiAdmin(endpoint, options = {}) {
  return apiRequest(`/admin${endpoint}`, options);
}

function exigirAdmin() {
  const user = getUser();
  if (!getToken() || !user) {
    window.location.href = "login.html";
    return false;
  }
  if (!user.tipo || user.tipo.toLowerCase() !== "admin") {
    alert("Acesso permitido apenas para administradores.");
    window.location.href = "index.html";
    return false;
  }
  
  const adminNameDisplay = document.getElementById("adminNameDisplay");
  if(adminNameDisplay) {
    adminNameDisplay.textContent = user.nome || "Administrador";
  }
  return true;
}

function getId(obj) {
  return obj.id || obj.id_anuncio || obj.id_usuario || obj.id_avaliacao || obj.id_log;
}

function formatValue(val) {
  return val ? val : "N/A";
}

function formatarData(dataIso) {
  if (!dataIso) return "N/A";
  return new Date(dataIso).toLocaleDateString("pt-BR") + " " + new Date(dataIso).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'});
}

function navegarPara(secao) {
  // Esconder todas as seções
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active-section'));
  // Remover classe active de todos os links do menu
  document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
  
  // Mostrar a seção selecionada
  const selectedSection = document.getElementById(`section-${secao}`);
  if (selectedSection) selectedSection.classList.add('active-section');
  
  // Destacar o link clicado
  const selectedNav = document.getElementById(`nav-${secao}`);
  if (selectedNav) selectedNav.classList.add('active');
  
  fecharDetalhes();

  // Carregar dados da seção ativa
  if (secao === 'dashboard' || secao === 'pendentes') { carregarPendentes(); carregarEstatisticasCards(); }
  if (secao === 'usuarios') carregarUsuarios();
  if (secao === 'avaliacoes') carregarAvaliacoes();
  if (secao === 'relatorios') carregarRelatorios();
  if (secao === 'auditoria') carregarAuditoria();
  if (secao === 'ranking') carregarRanking();
}

// ================= PENDENTES ==================
async function carregarPendentes() {
  const body = document.getElementById("pendentesBody");
  if(!body) return;
  const countLabel = document.getElementById("countPendentes");
  body.innerHTML = `<tr><td colspan="5">Carregando...</td></tr>`;
  try {
    anunciosPendentes = await apiAdmin("/anuncios/pendentes");
    if (!Array.isArray(anunciosPendentes) || anunciosPendentes.length === 0) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px;">Nenhum anúncio pendente para moderação. 🎉</td></tr>`;
      if(countLabel) countLabel.textContent = "0";
      return;
    }
    
    if(countLabel) countLabel.textContent = anunciosPendentes.length;
    
    body.innerHTML = anunciosPendentes.map(a => {
      const id = getId(a);
      const data = new Date(a.data_criacao || Date.now()).toLocaleDateString("pt-BR");
      return `
      <tr onclick="selecionarAnuncio(${id})" id="row-${id}">
        <td>#${id}</td>
        <td style="font-weight: 500;">${a.titulo || "Sem título"}</td>
        <td>${a.nome_fornecedor || "-"}</td>
        <td>${data}</td>
        <td><span class="status-badge status-pendente">Pendente</span></td>
      </tr>`;
    }).join("");
  } catch (e) {
    body.innerHTML = `<tr><td colspan="5" style="color:var(--danger)">Erro: ${e.message}</td></tr>`;
  }
}

function selecionarAnuncio(id) {
  anuncioSelecionado = anunciosPendentes.find(a => getId(a) === id);
  if (!anuncioSelecionado) return;
  
  document.querySelectorAll("#pendentesBody tr").forEach(tr => tr.classList.remove("selected"));
  document.getElementById(`row-${id}`).classList.add("selected");
  
  document.getElementById("panelPlaceholder").style.display = "none";
  document.getElementById("panelContent").style.display = "flex";
  document.getElementById("rejectBox").style.display = "none";
  document.getElementById("motivoReprovacao").value = "";
  
  document.getElementById("detalheTitulo").textContent = anuncioSelecionado.titulo || "Sem Título";
  document.getElementById("detalheFornecedor").textContent = anuncioSelecionado.nome_fornecedor || "Fornecedor Desconhecido";
  document.getElementById("detalheCategoria").textContent = anuncioSelecionado.categoria_nome || "Sem Categoria";
  document.getElementById("detalheDescricao").textContent = formatValue(anuncioSelecionado.descricao);
  document.getElementById("detalheMarcaMoq").textContent = `${formatValue(anuncioSelecionado.marca)} / ${formatValue(anuncioSelecionado.moq)} MOQ`;
  document.getElementById("detalheData").textContent = new Date(anuncioSelecionado.data_criacao || Date.now()).toLocaleDateString("pt-BR");
  
  const imgContainer = document.getElementById("detalheImgContainer");
  if (anuncioSelecionado.imagem || anuncioSelecionado.imagemUrl) {
    const url = "http://localhost:3000" + (anuncioSelecionado.imagem || anuncioSelecionado.imagemUrl);
    imgContainer.innerHTML = `<img src="${url}" alt="Produto">`;
  } else {
    imgContainer.innerHTML = `<span class="material-icons-outlined">image</span>`;
  }
}

function fecharDetalhes() {
  anuncioSelecionado = null;
  document.querySelectorAll("#pendentesBody tr").forEach(tr => tr.classList.remove("selected"));
  const ph = document.getElementById("panelPlaceholder");
  const pc = document.getElementById("panelContent");
  if(ph) ph.style.display = "flex";
  if(pc) pc.style.display = "none";
}

function mostrarCaixaReprovacao() {
  document.getElementById("rejectBox").style.display = "block";
  document.getElementById("motivoReprovacao").focus();
}

async function aprovarSelecionado() {
  if (!anuncioSelecionado) return;
  const id = getId(anuncioSelecionado);
  const btn = document.getElementById("btnAprovar");
  btn.disabled = true; btn.innerHTML = "Aprovando...";
  try {
    await apiAdmin(`/anuncios/${id}/aprovar`, { method: "PATCH" });
    fecharDetalhes();
    carregarPendentes();
  } catch (e) { alert(e.message); } 
  finally { btn.disabled = false; btn.innerHTML = `<span class="material-icons-outlined">check_circle</span> Aprovar`; }
}

async function reprovarSelecionado() {
  if (!anuncioSelecionado) return;
  const id = getId(anuncioSelecionado);
  const motivo = document.getElementById("motivoReprovacao").value.trim();
  if (!motivo) return alert("Por favor, preencha o motivo da reprovação.");
  
  const btn = document.querySelector(".btn-confirm-reject");
  btn.disabled = true; btn.innerHTML = "Reprovando...";
  try {
    await apiAdmin(`/anuncios/${id}/reprovar`, { method: "PATCH", body: JSON.stringify({ motivo }) });
    fecharDetalhes();
    carregarPendentes();
  } catch (e) { alert(e.message); } 
  finally { btn.disabled = false; btn.innerHTML = `Confirmar Reprovação`; }
}

// ================= USUÁRIOS ==================
async function carregarUsuarios() {
  const body = document.getElementById("usuariosBody");
  body.innerHTML = `<tr><td colspan="6">Carregando...</td></tr>`;
  try {
    const usuarios = await apiRequest("/users", { headers: { Authorization: `Bearer ${getToken()}` }});
    if(!usuarios || usuarios.length === 0) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum usuário encontrado.</td></tr>`;
      return;
    }
    body.innerHTML = usuarios.map(u => {
      const isAtivo = u.status === 1 || String(u.status) === "true";
      const badge = isAtivo ? `<span class="status-badge status-ativo">Ativo</span>` : `<span class="status-badge status-reprovado">Bloqueado</span>`;
      let btn = '';
      if(u.tipo !== 'admin') {
        if(isAtivo) {
          btn = `<button class="btn btn-sm" style="background:#e74c3c;color:#fff;" onclick="toggleBloqueio(${u.id}, 'bloquear')">Bloquear</button>`;
        } else {
          btn = `<button class="btn btn-sm" style="background:#2ecc71;color:#fff;" onclick="toggleBloqueio(${u.id}, 'desbloquear')">Desbloquear</button>`;
        }
      } else {
        btn = `<span style="color:#95a5a6;font-size:0.85rem;">Admin</span>`;
      }
      return `
        <tr>
          <td>${u.nome}</td>
          <td>${u.email}</td>
          <td style="text-transform: capitalize;">${u.tipo}</td>
          <td>${formatValue(u.cnpj)} <br> <small>${formatValue(u.cidade)} - ${formatValue(u.estado)}</small></td>
          <td>${badge}</td>
          <td>${btn}</td>
        </tr>
      `;
    }).join("");
  } catch(e) {
    body.innerHTML = `<tr><td colspan="6" style="color:var(--danger)">Erro: ${e.message}</td></tr>`;
  }
}

async function toggleBloqueio(id, acao) {
  if(!confirm(`Deseja realmente ${acao} este usuário?`)) return;
  try {
    await apiRequest(`/users/${id}/${acao}`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
    carregarUsuarios();
  } catch(e) { alert("Erro: " + e.message); }
}

// ================= AVALIAÇÕES ==================
async function carregarAvaliacoes() {
  const body = document.getElementById("avaliacoesBody");
  body.innerHTML = `<tr><td colspan="6">Carregando...</td></tr>`;
  try {
    const avaliacoes = await apiAdmin("/avaliacoes");
    if(!avaliacoes || avaliacoes.length === 0) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhuma avaliação encontrada.</td></tr>`;
      return;
    }
    body.innerHTML = avaliacoes.map(av => `
      <tr>
        <td>${av.comprador}</td>
        <td>${av.anuncio}</td>
        <td>${av.nota} ⭐</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${av.comentario}">${formatValue(av.comentario)}</td>
        <td>${formatarData(av.data)}</td>
        <td>
          <button class="btn btn-sm" style="background:#e74c3c;color:#fff;" onclick="removerAvaliacao(${av.id})">
            <span class="material-icons-outlined" style="font-size:16px;">delete</span>
          </button>
        </td>
      </tr>
    `).join("");
  } catch(e) {
    body.innerHTML = `<tr><td colspan="6" style="color:var(--danger)">Erro: ${e.message}</td></tr>`;
  }
}

async function removerAvaliacao(id) {
  if(!confirm("Remover esta avaliação definitivamente?")) return;
  try {
    await apiAdmin(`/avaliacoes/${id}`, { method: 'DELETE' });
    carregarAvaliacoes();
  } catch(e) { alert("Erro: " + e.message); }
}

// ================= RELATÓRIOS E DASHBOARD ==================
async function carregarEstatisticasCards() {
  try {
    const stats = await apiAdmin("/estatisticas");
    if(document.getElementById("countUsuarios")) document.getElementById("countUsuarios").textContent = (stats.fornecedores || 0) + (stats.compradores || 0);
    if(document.getElementById("countAvaliacoes")) document.getElementById("countAvaliacoes").textContent = stats.media_avaliacoes || 0;
    if(document.getElementById("countPendentes")) document.getElementById("countPendentes").textContent = stats.anuncios_pendentes || 0;
  } catch(e) { console.error("Erro stats:", e); }
}

async function carregarRelatorios() {
  const cardsContainer = document.getElementById("relatoriosCards");
  cardsContainer.innerHTML = "Carregando métricas...";
  try {
    const stats = await apiAdmin("/estatisticas");
    cardsContainer.innerHTML = `
      <div class="s-card"><div class="s-card-header"><span>Total Fornecedores</span></div><div class="s-card-value">${stats.fornecedores}</div></div>
      <div class="s-card"><div class="s-card-header"><span>Total Compradores</span></div><div class="s-card-value">${stats.compradores}</div></div>
      <div class="s-card"><div class="s-card-header"><span>Total Anúncios</span></div><div class="s-card-value">${stats.anuncios}</div></div>
      <div class="s-card"><div class="s-card-header"><span>Anúncios Pendentes</span></div><div class="s-card-value">${stats.anuncios_pendentes}</div></div>
      <div class="s-card"><div class="s-card-header"><span>Anúncios Ativos</span></div><div class="s-card-value">${stats.anuncios_ativos}</div></div>
      <div class="s-card"><div class="s-card-header"><span>Anúncios Reprovados</span></div><div class="s-card-value">${stats.anuncios_reprovados}</div></div>
      <div class="s-card"><div class="s-card-header"><span>Média Global de Notas</span></div><div class="s-card-value">${stats.media_avaliacoes} ⭐</div></div>
    `;
  } catch(e) {
    cardsContainer.innerHTML = `<p style="color:var(--danger)">Erro: ${e.message}</p>`;
  }
}

// ================= AUDITORIA ==================
async function carregarAuditoria() {
  const body = document.getElementById("auditoriaBody");
  body.innerHTML = `<tr><td colspan="4">Carregando...</td></tr>`;
  try {
    const logs = await apiAdmin("/auditoria");
    if(!logs || logs.length === 0) {
      body.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum log de auditoria encontrado.</td></tr>`;
      return;
    }
    body.innerHTML = logs.map(l => `
      <tr>
        <td>${formatarData(l.data)}</td>
        <td><b>${l.admin}</b></td>
        <td><span class="status-badge" style="background:#f1c40f;color:#000;">${l.tipo_acao}</span></td>
        <td>${l.descricao}</td>
      </tr>
    `).join("");
  } catch(e) {
    body.innerHTML = `<tr><td colspan="4" style="color:var(--danger)">Erro: ${e.message}</td></tr>`;
  }
}

// ================= RANKING ==================
async function carregarRanking() {
  const body = document.getElementById("rankingBody");
  body.innerHTML = `<tr><td colspan="5">Carregando...</td></tr>`;
  try {
    const rank = await apiAdmin("/ranking");
    if(!rank || rank.length === 0) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum dado para o ranking ainda.</td></tr>`;
      return;
    }
    body.innerHTML = rank.map((r, i) => `
      <tr>
        <td><h1>${i+1}º</h1></td>
        <td>#${r.id}</td>
        <td style="font-weight:bold;">${r.titulo}</td>
        <td>${r.fornecedor}</td>
        <td><span class="status-badge" style="background:var(--primary-color);font-size:1.1rem;">${r.qtd_favoritos} ❤️</span></td>
      </tr>
    `).join("");
  } catch(e) {
    body.innerHTML = `<tr><td colspan="5" style="color:var(--danger)">Erro: ${e.message}</td></tr>`;
  }
}

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  if (!exigirAdmin()) return;
  navegarPara('dashboard'); // Carrega a view inicial
});
