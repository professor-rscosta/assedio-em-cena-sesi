/* ============================================================
   views/game.js — Engine visual-novel + HUD + fluxo de escolhas
   ============================================================ */

const TIPO_LABEL = {
  narrativa: 'Narrativa', quiz: 'Decisão · Quiz',
  dialogo: 'Diálogo', reflexao: 'Reflexão', final: 'Desfecho',
};

// Mapa de personagens → mascotes SESI (avatar circular + corpo inteiro).
// Personagens sem imagem própria usam um dos mascotes como apresentador.
const PERSONAGEM_IMG = {
  'Narrador': { av: '/avatars/teo.png', full: '/images/personagem-teo.png' },
  'Téo':      { av: '/avatars/teo.png', full: '/images/personagem-teo.png' },
  'Diego':    { av: '/avatars/teo.png', full: '/images/personagem-teo.png' },
  'Marcos':   { av: '/avatars/teo.png', full: '/images/personagem-teo.png' },
  'Bia':      { av: '/avatars/bia.png', full: '/images/personagem-bia.png' },
  'Júlia':    { av: '/avatars/bia.png', full: '/images/personagem-bia.png' },
  'Renata':   { av: '/avatars/bia.png', full: '/images/personagem-bia.png' },
};
// alterna o mascote apresentador para personagens sem imagem fixa
function imgPersonagem(nome) {
  if (PERSONAGEM_IMG[nome]) return PERSONAGEM_IMG[nome];
  // heurística simples por inicial / fallback ao Téo
  return PERSONAGEM_IMG['Bia'] && /a$/i.test(nome || '') ? PERSONAGEM_IMG['Bia'] : PERSONAGEM_IMG['Téo'];
}

const GameView = {
  moduloId: null,
  hudBox: null,
  sceneBox: null,
  indicadores: null,

  async render(root, { moduloId, perfilId, onFim }) {
    this.moduloId = moduloId;
    this.onFim = onFim;

    root.innerHTML = `
      <div class="view"><div class="wrap">
        <div class="game-layout reveal">
          <aside class="glass hud" id="hud"></aside>
          <section class="glass stage neon-edge" id="stage">
            <div class="loader"><div class="spinner"></div></div>
          </section>
        </div>
      </div></div>`;

    this.hudBox = UI.$('#hud', root);
    this.sceneBox = UI.$('#stage', root);

    try {
      const data = await API.iniciarModulo(moduloId, perfilId);
      this.indicadores = data.indicadores;
      UI.renderHud(this.hudBox, this.indicadores);
      await this.mostrarCenario(data.cenario);
    } catch (err) {
      this.sceneBox.innerHTML = `<div class="scene"><div class="dialog"><p>${UI.esc(err.message)}</p></div></div>`;
    }
  },

  async mostrarCenario(cenario) {
    if (!cenario) { return this.finalizar(); }

    const speaker = cenario.personagem_nome || 'Narrador';
    const cor = cenario.personagem_cor || 'var(--sesi-azul)';
    const img = imgPersonagem(speaker);

    this.sceneBox.innerHTML = `
      <div class="scene">
        <div class="scene-bar">
          <span class="scene-type">${TIPO_LABEL[cenario.tipo] || cenario.tipo}</span>
          <span class="scene-title">${UI.esc(cenario.titulo || '')}</span>
        </div>
        <div class="scene-body">
          <div class="scene-main">
            <div class="dialog" id="dialog">
              <div class="dialog-head">
                <div class="av-img"><img src="${img.av}" alt="${UI.esc(speaker)}"></div>
                <div class="meta"><div class="nome" style="color:${cor}">${UI.esc(speaker)}</div><div class="fn">em cena</div></div>
              </div>
              <div class="text" id="dlg-text"></div>
              <div class="choices hidden" id="choices"></div>
            </div>
          </div>
          <div class="scene-char">
            <img class="char-full" id="char-full" src="${img.full}" alt="${UI.esc(speaker)}">
          </div>
        </div>
      </div>`;

    UI.entrarPersonagemFull(UI.$('#char-full', this.sceneBox));

    const textNode = UI.$('#dlg-text', this.sceneBox);
    const dialog = UI.$('#dialog', this.sceneBox);
    // clique pula o typewriter
    const skip = () => { if (textNode.__skip) textNode.__skip(); };
    dialog.addEventListener('click', skip, { once: false });

    await UI.typewriter(textNode, cenario.texto || '', 16);
    this.renderEscolhas(cenario);
  },

  renderEscolhas(cenario) {
    const box = UI.$('#choices', this.sceneBox);
    box.innerHTML = '';
    box.classList.remove('hidden');

    if (cenario.tipo === 'final' || !cenario.escolhas?.length) {
      const btn = UI.el('button', 'btn btn--primary', 'Ver meu resultado →');
      btn.addEventListener('click', () => this.finalizar());
      box.appendChild(btn);
      return;
    }

    cenario.escolhas.forEach((esc, i) => {
      const btn = UI.el('button', 'choice', `
        <span class="idx">${i + 1}</span><span>${UI.esc(esc.texto)}</span>`);
      btn.addEventListener('click', () => this.escolher(esc.id, box));
      box.appendChild(btn);
      if (window.gsap) gsap.from(btn, { opacity: 0, x: -12, delay: 0.06 * i, duration: 0.4 });
    });
  },

  async escolher(escolhaId, box) {
    UI.$$('.choice', box).forEach((b) => (b.disabled = true));
    let resp;
    try {
      resp = await API.escolher(this.moduloId, escolhaId);
    } catch (err) { UI.toast(err.message, 'erro'); return; }

    // atualiza HUD com animação
    this.indicadores = resp.indicadores;
    UI.updateHud(this.hudBox, resp.indicadores);
    if (resp.xpGanho > 0) UI.toast(`+${resp.xpGanho} XP`, 'ok', 2200);
    (resp.badgesNovos || []).forEach((b) => UI.toastBadge(b));

    if (resp.consequencia) {
      await this.mostrarConsequencia(resp.consequencia, resp);
    } else {
      this.avancar(resp);
    }
  },

  async mostrarConsequencia(c, resp) {
    const sev = c.severidade || 'neutra';
    const painel = UI.el('div', `consequencia glass sev-${sev}`, `
      <h4>Impacto da sua decisão</h4>
      ${c.impacto_emocional ? `<div class="cons-block"><span class="lab">Impacto emocional</span><span class="txt">${UI.esc(c.impacto_emocional)}</span></div>` : ''}
      ${c.impacto_org ? `<div class="cons-block"><span class="lab">Impacto organizacional</span><span class="txt">${UI.esc(c.impacto_org)}</span></div>` : ''}
      ${c.contexto_legal ? `<div class="cons-block legal"><span class="lab">Contexto legal</span><span class="txt">${UI.esc(c.contexto_legal)}</span></div>` : ''}
      ${c.reflexao ? `<div class="cons-block reflexao"><span class="lab">Reflexão</span><span class="txt">${UI.esc(c.reflexao)}</span></div>` : ''}
      <button class="btn btn--primary btn--block" style="margin-top:8px" id="cont">Continuar →</button>`);

    const main = UI.$('.scene-main', this.sceneBox) || UI.$('.scene', this.sceneBox);
    main.appendChild(painel);
    if (window.gsap) gsap.from(painel, { opacity: 0, y: 18, duration: 0.5 });
    painel.scrollIntoView({ behavior: 'smooth', block: 'end' });

    UI.$('#cont', painel).addEventListener('click', () => this.avancar(resp), { once: true });
  },

  avancar(resp) {
    if (resp.fim || !resp.proximo) return this.finalizar();
    this.mostrarCenario(resp.proximo);
  },

  finalizar() {
    this.onFim({ moduloId: this.moduloId, indicadores: this.indicadores });
  },
};
