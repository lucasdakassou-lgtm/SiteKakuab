/* ============================================================
   KAKUAB MARKET — auth-page.js
   Conecta login.html e cadastro.html com o backend.
   ============================================================ */

function mostrarMensagem(texto, tipo = "erro") {
  let box = document.getElementById("authMessage");

  if (!box) {
    box = document.createElement("div");
    box.id = "authMessage";
    box.style.margin = "12px 0";
    box.style.padding = "12px";
    box.style.borderRadius = "12px";
    box.style.fontWeight = "600";
    const form = document.querySelector("form");
    form.prepend(box);
  }

  box.textContent = texto;
  box.style.background = tipo === "sucesso" ? "#dff7e6" : "#ffe0e0";
  box.style.color = tipo === "sucesso" ? "#136b2f" : "#9b1c1c";
}

function setButtonLoading(btn, loading, textoLoading = "Carregando...") {
  if (!btn) return;

  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = textoLoading;
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.disabled = false;
  }
}

// Mostrar/ocultar senha
function configurarToggleSenha() {
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = btn.querySelector(".material-icons-outlined");

      if (!input) return;

      input.type = input.type === "password" ? "text" : "password";
      if (icon) icon.textContent = input.type === "password" ? "visibility_off" : "visibility";
    });
  });
}

async function configurarLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  // Captura URL de destino (vindo de anúncio como visitante)
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirect") || null;

  // Mostra dica se veio de um anúncio
  if (redirectUrl) {
    mostrarMensagem(
      "🔒 Faça login para ver os detalhes do anúncio.",
      "sucesso"
    );
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginUser").value.trim();
    const senha = document.getElementById("loginPassword").value;
    const btn = form.querySelector("button[type='submit']");

    try {
      setButtonLoading(btn, true, "Entrando...");
      console.log(`[auth-page] Iniciando chamada API de login para: ${email}`);
      const resposta = await KakuabAPI.login(email, senha);
      console.log(`[auth-page] Resposta do login:`, resposta);

      salvarSessao(resposta);
      mostrarMensagem("Login realizado com sucesso!", "sucesso");

      const tipoUserOriginal = resposta?.user?.tipo || "indefinido";
      const tipo = tipoUserOriginal.toLowerCase();
      console.log(`[auth-page] Tipo original do banco: '${tipoUserOriginal}' | Tipo normalizado: '${tipo}'`);

      setTimeout(() => {
        // Se veio de uma página de destino (ex: anúncio), vai pra lá
        if (redirectUrl) {
          console.log(`[auth-page] -> Redirecionando de volta para: ${redirectUrl}`);
          window.location.href = redirectUrl;
          return;
        }

        console.log(`[auth-page] Iniciando redirecionamento para tipo: '${tipo}'`);
        if (tipo === "fornecedor") {
          console.log("[auth-page] -> Indo para fornecedor.html");
          window.location.href = "fornecedor.html";
        } else if (tipo === "admin") {
          console.log("[auth-page] -> Indo para admin.html");
          window.location.href = "admin.html";
        } else {
          console.log("[auth-page] -> Caindo no else, indo para index.html");
          window.location.href = "index.html";
        }
      }, 700);
    } catch (error) {
      console.error("[auth-page] Erro no catch do login:", error);
      mostrarMensagem(error.message);
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

async function configurarCadastro() {
  const form = document.getElementById("cadastroForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const senha = document.getElementById("registerPassword").value;
    const confirmar = document.getElementById("confirmPassword").value;
    const tipo = document.getElementById("registerTipo")?.value || "comprador";
    const razao_social = document.getElementById("registerRazaoSocial")?.value.trim() || nome;
    const nome_fantasia = document.getElementById("registerNomeFantasia")?.value.trim() || nome;
    const cnpj = document.getElementById("registerCnpj")?.value.trim() || null;
    const telefone = document.getElementById("registerTelefone")?.value.trim() || null;
    const cidade = document.getElementById("registerCidade")?.value.trim() || null;
    const estado = document.getElementById("registerEstado")?.value.trim() || null;
    const btn = form.querySelector("button[type='submit']");

    if (senha !== confirmar) {
      mostrarMensagem("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      mostrarMensagem("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setButtonLoading(btn, true, "Criando conta...");
      await KakuabAPI.register({ nome, email, senha, tipo, razao_social, nome_fantasia, cnpj, telefone, cidade, estado });

      mostrarMensagem("Conta criada com sucesso! Faça login para continuar.", "sucesso");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (error) {
      mostrarMensagem(error.message);
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  configurarToggleSenha();
  configurarLogin();
  configurarCadastro();
});
