/* ============================================================
   KAKUAB MARKET — api.js
   Arquivo central para conexão do front-end com o back-end.
   O PDF da entrega pede base URL configurável e consumo real da API.
   ============================================================ */

// Troque essa URL se o backend estiver em outra porta ou hospedagem.
const API_BASE_URL = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("kakuab_token");
}

function getUser() {
  const raw = localStorage.getItem("kakuab_user");
  return raw ? JSON.parse(raw) : null;
}

function salvarSessao({ token, user }) {
  localStorage.setItem("kakuab_token", token);
  localStorage.setItem("kakuab_user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("kakuab_token");
  localStorage.removeItem("kakuab_user");
  window.location.href = "login.html";
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  console.log(`[API Request] Enviando para ${API_BASE_URL}${endpoint}`);
  if (!isFormData && options.body) {
    console.log(`[API Request] Payload:`, JSON.parse(options.body));
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...(options.headers || {})
    }
  });

  console.log(`[API Request] Status da resposta: ${response.status}`);

  let data = null;
  try {
    data = await response.json();
    console.log(`[API Request] Dados recebidos:`, data);
  } catch (_) {
    console.warn(`[API Request] A resposta não pôde ser convertida para JSON.`);
    data = null;
  }

  if (!response.ok) {
    const erroMsg = data?.error || data?.message || "Erro na comunicação com a API";
    console.error(`[API Request] Erro capturado:`, erroMsg);
    throw new Error(erroMsg);
  }

  return data;
}

const KakuabAPI = {
  login(email, senha) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha })
    });
  },

  register(payload) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  listarAnuncios() {
    return apiRequest("/anuncios");
  },

  buscarAnuncio(id) {
    return apiRequest(`/anuncios/${id}`);
  },

  criarAnuncio(formData) {
    return apiRequest("/anuncios", {
      method: "POST",
      body: formData
    });
  },

  atualizarAnuncio(id, formData) {
    return apiRequest(`/anuncios/${id}`, {
      method: "PUT",
      body: formData
    });
  },

  removerAnuncio(id) {
    return apiRequest(`/anuncios/${id}`, {
      method: "DELETE"
    });
  },

  meusAnuncios() {
    return apiRequest("/anuncios/fornecedor/meus-anuncios");
  },

  favoritar(anuncioId) {
    return apiRequest(`/favoritos/${anuncioId}`, { method: "POST" });
  },

  desfavoritar(anuncioId) {
    return apiRequest(`/favoritos/${anuncioId}`, { method: "DELETE" });
  },

  avaliar(anuncioId, nota, comentario) {
    return apiRequest(`/avaliacoes/anuncios/${anuncioId}`, {
      method: "POST",
      body: JSON.stringify({ nota, comentario })
    });
  },

  listarAvaliacoesAnuncio(anuncioId) {
    return apiRequest(`/avaliacoes/anuncios/${anuncioId}`);
  },

  mediaAvaliacoesAnuncio(anuncioId) {
    return apiRequest(`/avaliacoes/anuncios/${anuncioId}/media`);
  },

  listarFavoritos() {
    return apiRequest("/favoritos");
  },

  atualizarPerfil(dados) {
    return apiRequest("/users/me", {
      method: "PUT",
      body: JSON.stringify(dados)
    });
  },

  getToken: getToken,
  getUser: getUser,
  logout: logout
};
