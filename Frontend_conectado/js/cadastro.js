const cadastroPage = document.getElementById("cadastroPage");
const cadastroForm = document.getElementById("cadastroForm");
const tipoSelect = document.getElementById("registerTipo");

const visualTitle = document.getElementById("visualTitle");
const visualText = document.getElementById("visualText");
const cadastroSubtitle = document.getElementById("cadastroSubtitle");

const cnpjInput = document.getElementById("registerCnpj");
const telefoneInput = document.getElementById("registerTelefone");

// Muda o layout quando trocar comprador/fornecedor
function atualizarLayoutPorTipo() {
  const tipo = tipoSelect.value;

  cadastroPage.classList.add("animating");

  setTimeout(() => {
    if (tipo === "fornecedor") {
      cadastroPage.classList.add("fornecedor-mode");

      cadastroSubtitle.textContent = "Cadastre sua empresa e anuncie seus produtos 🌱";

      visualTitle.textContent = "Venda seus produtos para empresas.";
      visualText.textContent =
        "Anuncie alimentos, gerencie seus produtos e conecte sua empresa com compradores B2B.";
    } else {
      cadastroPage.classList.remove("fornecedor-mode");

      cadastroSubtitle.textContent = "Junte-se à comunidade sustentável 🌱";

      visualTitle.textContent = "Compre melhor, negocie com confiança.";
      visualText.textContent =
        "Encontre fornecedores de alimentos, compare anúncios e salve suas melhores oportunidades.";
    }

    setTimeout(() => {
      cadastroPage.classList.remove("animating");
    }, 250);
  }, 180);
}

// Máscara de CNPJ
function aplicarMascaraCNPJ(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

// Máscara simples de telefone
function aplicarMascaraTelefone(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

cnpjInput.addEventListener("input", () => {
  cnpjInput.value = aplicarMascaraCNPJ(cnpjInput.value);
});

telefoneInput.addEventListener("input", () => {
  telefoneInput.value = aplicarMascaraTelefone(telefoneInput.value);
});

// Mostrar/ocultar senha
document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const inputId = button.getAttribute("data-target");
    const input = document.getElementById(inputId);
    const icon = button.querySelector(".material-icons-outlined");

    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "visibility";
    } else {
      input.type = "password";
      icon.textContent = "visibility_off";
    }
  });
});


// ── Submit do formulário de cadastro ─────────────────────────────────────────
cadastroForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("[Cadastro] Botão 'Criar Conta' clicado!");

  const nome         = document.getElementById("registerName").value.trim();
  const email        = document.getElementById("registerEmail").value.trim();
  const tipo         = document.getElementById("registerTipo").value;
  const cnpj         = document.getElementById("registerCnpj").value.trim();
  const razao_social = document.getElementById("registerRazaoSocial").value.trim();
  const nome_fantasia= document.getElementById("registerNomeFantasia").value.trim();
  const telefone     = document.getElementById("registerTelefone").value.trim();
  const cidade       = document.getElementById("registerCidade").value.trim();
  const estado       = document.getElementById("registerEstado").value;
  const senha        = document.getElementById("registerPassword").value;
  const confirma     = document.getElementById("confirmPassword").value;

  console.log("[Cadastro] Dados lidos do formulário:", {
    nome, email, tipo, cnpj, razao_social, nome_fantasia, telefone, cidade, estado, senha
  });

  // Validações básicas
  if (!nome || !email || !senha || !tipo) {
    console.warn("[Cadastro] Validação falhou: Campos obrigatórios em branco.");
    return mostrarFeedback("Preencha todos os campos obrigatórios.", "erro");
  }

  if (senha !== confirma) {
    console.warn("[Cadastro] Validação falhou: Senhas não coincidem.");
    return mostrarFeedback("As senhas não coincidem.", "erro");
  }

  if (senha.length < 6) {
    console.warn("[Cadastro] Validação falhou: Senha menor que 6 caracteres.");
    return mostrarFeedback("A senha deve ter no mínimo 6 caracteres.", "erro");
  }

  const btn = cadastroForm.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Criando conta...";

  const payload = {
    nome, email, senha, tipo,
    razao_social: razao_social || nome,
    nome_fantasia: nome_fantasia || razao_social || nome,
    cnpj, telefone, cidade, estado
  };

  console.log("[Cadastro] Preparando para enviar via KakuabAPI.register...", payload);

  try {
    const response = await KakuabAPI.register(payload);
    console.log("[Cadastro] Sucesso! Resposta do servidor:", response);

    mostrarFeedback("Conta criada com sucesso! Redirecionando...", "sucesso");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1800);

  } catch (err) {
    console.error("[Cadastro] Erro ao cadastrar capturado no catch:", err);
    mostrarFeedback(err.message || "Erro ao criar conta.", "erro");
    btn.disabled = false;
    btn.textContent = "Criar Conta";
  }
});

// ── Exibe mensagem de feedback na tela ───────────────────────────────────────
function mostrarFeedback(mensagem, tipo) {
  let el = document.getElementById("cadastroFeedback");
  if (!el) {
    el = document.createElement("p");
    el.id = "cadastroFeedback";
    el.style.cssText = `
      margin-top: 12px;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
    `;
    cadastroForm.after(el);
  }

  el.textContent = mensagem;

  if (tipo === "erro") {
    el.style.background = "#fde8e8";
    el.style.color = "#c0392b";
    el.style.border = "1px solid #e74c3c";
  } else {
    el.style.background = "#e8f8ee";
    el.style.color = "#1a7a40";
    el.style.border = "1px solid #2ecc71";
  }
}

tipoSelect.addEventListener("change", atualizarLayoutPorTipo);
atualizarLayoutPorTipo();

