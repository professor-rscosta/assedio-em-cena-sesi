/* ============================================================
   views/hub.js — Hub: escolher módulo + perfil RPG, badges, ranking
   ============================================================ */

const PERFIL_ICONES = {
  lideranca: '👑', colaborador: '🧑‍💼', rh: '🛡️',
  observador: '👁️', vitima: '💔', testemunha: '👥',
};
const BADGE_ICONES = {
  primeiro_passo: '🚩', olhar_atento: '👁️', mito_quebrado: '🔨',
  empatia: '💜', guardiao: '🛡️',
};

const HubView = {
  selPerfil: null,

  async render(root, { onJogar }) {
    root.innerHTML = `<div class="view"><div class="wrap"><div class="loader"><div class="spinner"></div></div></div></div>`;
    const wrap = UI.$('.wrap', root);

    let modulos, perfis, badgesData, rankingData;
    try {
      [modulos, perfis, badgesData, rankingData] = await Promise.all([
        API.modulos(), API.perfis(), API.badges(), API.ranking(10),
      ]);
    } catch (err) {
      wrap.innerHTML = `<div class="glass" style="padding:30px" class="center">
        <p>Não foi possível carregar o conteúdo. ${UI.esc(err.message)}</p></div>`;
      return;
    }

    const modulo = modulos.modulos[0];
    const concluido = modulo?.progresso?.concluido;

    wrap.innerHTML = `
      <div class="hero reveal">
        <span class="tag">Módulo ${modulo.ordem} · ${modulo.carga_horaria}h</span>
        <h2>${UI.esc(modulo.subtitulo || modulo.titulo)}</h2>
        <p>${UI.esc(modulo.descricao)}</p>
      </div>

      <div class="glass reveal" style="padding:26px;margin-bottom:22px">
        <h3 style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--txt-dim);margin-bottom:6px">Escolha seu papel</h3>
        <p class="mute" style="font-size:13px;margin-bottom:4px">O perfil molda diálogos, missões e consequências.</p>
        <div class="perfis-grid" id="perfis"></div>
        <button class="btn btn--primary btn--block" id="btn-jogar" disabled>
          ${concluido ? 'Rejogar módulo' : 'Iniciar experiência'}
        </button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px" class="reveal" id="grid-extra">
        <div class="glass" style="padding:24px">
          <h3 style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--txt-dim);margin-bottom:16px">Insígnias</h3>
          <div class="badges-grid" id="badges"></div>
        </div>
        <div class="glass" style="padding:24px">
          <h3 style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--txt-dim);margin-bottom:16px">Ranking corporativo</h3>
          <div class="rank-list" id="ranking"></div>
        </div>
      </div>`;

    // perfis
    const perfisBox = UI.$('#perfis', root);
    perfis.perfis.forEach((p) => {
      const card = UI.el('div', 'perfil-card', `
        <div class="ico">${PERFIL_ICONES[p.chave] || '•'}</div>
        <h4>${UI.esc(p.nome)}</h4>
        <p>${UI.esc(p.descricao)}</p>`);
      card.addEventListener('click', () => {
        UI.$$('.perfil-card', perfisBox).forEach((c) => c.classList.remove('sel'));
        card.classList.add('sel');
        this.selPerfil = p.id;
        UI.$('#btn-jogar', root).disabled = false;
      });
      perfisBox.appendChild(card);
    });

    UI.$('#btn-jogar', root).addEventListener('click', () => onJogar(modulo.id, this.selPerfil));

    // badges
    const badgesBox = UI.$('#badges', root);
    badgesData.badges.forEach((b) => {
      badgesBox.appendChild(UI.el('div', `badge-card ${b.conquistado ? '' : 'locked'}`, `
        <div class="em">${BADGE_ICONES[b.chave] || '🏅'}</div>
        <h5>${UI.esc(b.nome)}</h5>
        <p>${UI.esc(b.descricao)}</p>
        <div class="rar ${b.raridade}">${b.raridade}</div>`));
    });

    // ranking
    const rankBox = UI.$('#ranking', root);
    if (!rankingData.ranking.length) {
      rankBox.innerHTML = `<p class="mute" style="font-size:13px">Ninguém no ranking ainda. Seja o primeiro!</p>`;
    } else {
      rankingData.ranking.forEach((r, i) => {
        rankBox.appendChild(UI.el('div', `rank-row ${i < 3 ? 'top' + (i + 1) : ''}`, `
          <span class="pos">${i + 1}</span>
          <span class="av">${UI.iniciais(r.nome)}</span>
          <div class="who"><div class="nm">${UI.esc(r.nome)}</div><div class="lv">${UI.esc(r.nivel_maturidade)}</div></div>
          <span class="pts">${r.pontuacao} XP</span>`));
      });
    }
  },
};
