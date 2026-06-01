/* ============================================================
   app.js — Controlador principal: roteamento de telas + topbar
   ============================================================ */

const App = {
  root: null,

  init() {
    this.root = UI.$('#app');
    UI.initParticles();

    // rota pública: validação de certificado via /validar/CODIGO
    const m = location.pathname.match(/\/validar\/([A-Za-z0-9-]+)/);
    if (m) return this.telaValidacao(m[1]);

    if (API.estaLogado()) this.irParaHub();
    else this.telaAuth();
  },

  topbar() {
    const u = API.getUser() || {};
    return `
      <header class="topbar">
        <div class="brand">
          <img src="/images/logo-sesi.png" alt="SESI" class="brand-logo">
          <div class="brand-sep"></div>
          <div><h1>Assédio em Cena</h1><span>Decisões que Transformam</span></div>
        </div>
        <div class="topbar-user">
          <span class="chip chip--lvl">${UI.esc(u.nivel_maturidade || 'observador')}</span>
          <span class="chip chip--xp">${u.xp_total ?? 0} XP</span>
          <span class="chip">${UI.esc((u.nome || '').split(' ')[0] || 'Você')}</span>
          <button class="btn btn--ghost" id="sair" style="padding:8px 14px;font-size:13px">Sair</button>
        </div>
      </header>`;
  },

  mount(innerHtml) {
    this.root.innerHTML = this.topbar() + `<div id="screen">${innerHtml}</div>` + this.footer();
    const sair = UI.$('#sair', this.root);
    if (sair) sair.addEventListener('click', () => { API.clear(); this.telaAuth(); });
  },

  footer() {
    return `
      <footer class="footer">
        <img src="/images/logo-sesi.png" alt="SESI" class="footer-logo">
        <span>Serviço Social da Indústria · Segurança e Saúde no Trabalho</span>
        <span class="mute">© ${new Date().getFullYear()} · Plataforma educativa de prevenção ao assédio</span>
      </footer>`;
  },

  // ---------- Telas ----------
  telaAuth() {
    this.root.innerHTML = '<div id="screen"></div>';
    AuthView.render(UI.$('#screen', this.root), { onAuth: () => this.irParaHub() });
  },

  async irParaHub() {
    // sincroniza usuário (xp/maturidade podem ter mudado)
    try { const { usuario } = await API.eu(); API.setSession(API.getToken(), usuario); } catch {}
    this.mount('');
    HubView.render(UI.$('#screen', this.root), {
      onJogar: (moduloId, perfilId) => this.irParaJogo(moduloId, perfilId),
    });
  },

  irParaJogo(moduloId, perfilId) {
    this.mount('');
    GameView.render(UI.$('#screen', this.root), {
      moduloId, perfilId,
      onFim: (ctx) => this.irParaResultado(ctx),
    });
  },

  async irParaResultado({ moduloId, indicadores }) {
    try { const { usuario } = await API.eu(); API.setSession(API.getToken(), usuario); } catch {}
    this.mount('');
    ResultView.render(UI.$('#screen', this.root), {
      moduloId, indicadores,
      onVoltar: () => this.irParaHub(),
    });
  },

  async telaValidacao(codigo) {
    this.root.innerHTML = `<div id="screen"><div class="view"><div class="wrap wrap--narrow">
      <div class="loader"><div class="spinner"></div></div></div></div></div>`;
    const screen = UI.$('#screen', this.root);
    try {
      const base = window.AEC_API_BASE ?? '';
      const res = await fetch(`${base}/api/certificados/validar/${codigo}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Certificado inválido');
      screen.innerHTML = `<div class="view"><div class="wrap wrap--narrow reveal">
        <div class="glass result" style="padding:34px">
          <div class="badge-pop" style="background:linear-gradient(135deg,var(--verde),#15803D)">✅</div>
          <h2>Certificado válido</h2>
          <p class="sub">Este certificado foi emitido pela plataforma Assédio em Cena.</p>
          <div class="result-stats">
            <div class="stat glass"><div class="num" style="font-size:16px">${UI.esc(data.nome)}</div><div class="lab">Participante</div></div>
            <div class="stat glass"><div class="num" style="font-size:16px;text-transform:capitalize">${UI.esc(data.nivel)}</div><div class="lab">Maturidade</div></div>
            <div class="stat glass"><div class="num">${data.cargaHoraria}h</div><div class="lab">Carga horária</div></div>
          </div>
          <p class="mono mute" style="font-size:12px">Emitido em ${new Date(data.emitidoEm).toLocaleDateString('pt-BR')}</p>
        </div></div></div>`;
    } catch (err) {
      screen.innerHTML = `<div class="view"><div class="wrap wrap--narrow reveal">
        <div class="glass result" style="padding:34px">
          <div class="badge-pop" style="background:linear-gradient(135deg,var(--vermelho),#991B1B)">✕</div>
          <h2>Certificado não encontrado</h2>
          <p class="sub">${UI.esc(err.message)}</p>
        </div></div></div>`;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
