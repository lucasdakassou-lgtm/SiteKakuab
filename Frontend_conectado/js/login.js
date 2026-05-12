/* ============================================================
   KAKUAB MARKET — login.js
   ============================================================ */

// ── Tab switching ─────────────────────────────────────────
function switchTab(tab) {
  const panelLogin  = document.getElementById('panel-login');
  const panelSignup = document.getElementById('panel-signup');
  const tabLogin    = document.getElementById('tab-login');
  const tabSignup   = document.getElementById('tab-signup');

  if (tab === 'login') {
    panelLogin.classList.add('active');
    panelSignup.classList.remove('active');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    panelSignup.classList.add('active');
    panelLogin.classList.remove('active');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

// ── Password toggle ───────────────────────────────────────
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.textContent = isPassword ? '🙈' : '👁';
}

// ── Password strength ──────────────────────────────────────
function checkPasswordStrength(value) {
  const strengthEl = document.getElementById('password-strength');
  const bar = document.getElementById('strength-bar');
  const label = document.getElementById('strength-label');

  if (!value) {
    strengthEl.style.display = 'none';
    return;
  }

  strengthEl.style.display = 'block';

  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    { width: '20%', color: '#ef4444', text: 'Muito fraca' },
    { width: '40%', color: '#f97316', text: 'Fraca' },
    { width: '60%', color: '#eab308', text: 'Média' },
    { width: '80%', color: '#84cc16', text: 'Forte' },
    { width: '100%', color: '#22c55e', text: 'Muito forte' },
  ];

  const lvl = levels[Math.min(score - 1, 4)] || levels[0];
  bar.style.width = lvl.width;
  bar.style.background = lvl.color;
  label.textContent = lvl.text;
  label.style.color = lvl.color;
}

// ── Toast ─────────────────────────────────────────────────
let toastTimer;
function showToast(msg, icon = '✓') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 2800);
}

// ── Handle Login ──────────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-auth');
  const original = btn.innerHTML;

  // Loading state
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Entrando…';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
    showToast('Login realizado com sucesso!', '✓');
    // Redirect after short delay
    setTimeout(() => { window.location.href = '../index.html'; }, 1000);
  }, 1600);
}

// ── Handle Signup ─────────────────────────────────────────
function handleSignup(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-auth');
  const original = btn.innerHTML;

  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Criando conta…';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
    showToast('Conta criada com sucesso! 🎉', '✓');
    setTimeout(() => { window.location.href = '../index.html'; }, 1200);
  }, 2000);
}

// ── Spinner keyframe ──────────────────────────────────────
const style = document.createElement('style');
style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

// ── Auto-switch tab from URL param ────────────────────────
const params = new URLSearchParams(window.location.search);
if (params.get('tab') === 'signup') switchTab('signup');
