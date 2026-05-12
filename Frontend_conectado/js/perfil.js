/* ============================================================
   KAKUAB MARKET — perfil.js
   ============================================================ */

function carregarPerfil() {
  const token = KakuabAPI.getToken();
  const user = KakuabAPI.getUser();

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  // Preenche Navbar
  document.getElementById("navUserName").textContent = user.nome.split(" ")[0];

  // Preenche Card Estático
  document.getElementById("txtEmail").textContent = user.email;
  
  const badgeTipo = document.getElementById("txtTipoConta");
  badgeTipo.textContent = user.tipo;
  badgeTipo.className = `badge-tipo ${user.tipo}`; // Adiciona classe admin, comprador ou fornecedor

  // Preenche Formulário
  document.getElementById("inputNome").value = user.nome;
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

async function atualizarPerfil(event) {
  event.preventDefault();

  const msgError = document.getElementById("perfilMsgError");
  const msgSuccess = document.getElementById("perfilMsgSuccess");
  const btnSalvar = document.getElementById("btnSalvar");

  msgError.style.display = "none";
  msgSuccess.style.display = "none";
  
  const nome = document.getElementById("inputNome").value.trim();
  const senha = document.getElementById("inputSenha").value.trim();

  const dados = {};
  if (nome) dados.nome = nome;
  if (senha) dados.senha = senha;

  if (Object.keys(dados).length === 0) {
    msgError.textContent = "Altere algum campo para salvar.";
    msgError.style.display = "block";
    return;
  }

  btnSalvar.textContent = "Salvando...";
  btnSalvar.disabled = true;

  try {
    await KakuabAPI.atualizarPerfil(dados);
    
    // Sucesso
    msgSuccess.textContent = "Perfil atualizado com sucesso!";
    msgSuccess.style.display = "block";
    document.getElementById("inputSenha").value = "";

    // Atualiza o localStorage com o novo nome
    const user = KakuabAPI.getUser();
    if (dados.nome) {
      user.nome = dados.nome;
      localStorage.setItem('kakuab_user', JSON.stringify(user));
      document.getElementById("navUserName").textContent = user.nome.split(" ")[0];
    }

  } catch (error) {
    msgError.textContent = error.message;
    msgError.style.display = "block";
  } finally {
    btnSalvar.textContent = "Salvar Alterações";
    btnSalvar.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", carregarPerfil);
