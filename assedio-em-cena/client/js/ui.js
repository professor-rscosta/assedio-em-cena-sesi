/* ============================================================
   ui.js — Helpers visuais: toast, partículas, typewriter, HUD
   ============================================================ */

const UI = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Toast ----------
  function toast(msg, tipo = 'ok', ms = 3800) {
    let area = $('#toast-area');
    if (!area) { area = el('div'); area.id = 'toast-area'; document.body.appendChild(area); }
    const t = el('div', `toast toast--${tipo}`, esc(msg));
    area.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0'; t.style.transform = 'translateX(20px)';
      setTimeout(() => t.remove(), 300);
    }, ms);
  }

  function toastBadge(badge) {
    toast(`🏅 Insígnia desbloqueada: ${badge.nome}`, 'badge', 5200);
  }

  // ---------- Partículas (canvas leve) ----------
  function initParticles() {
    const canvas = $('#particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, parts = [];
    const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
    resize(); addEventListener('resize', resize);
    const N = Math.min(60, Math.floor(innerWidth / 26));
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.5 + 0.1,
      });
    }
    (function loop() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30,111,208,${p.a})`; ctx.fill();
      }
      requestAnimationFrame(loop);
    })();
  }

  // ---------- Typewriter (com GSAP-free fallback) ----------
  function typewriter(node, text, speed = 18) {
    return new Promise((resolve) => {
      node.textContent = '';
      const caret = el('span', 'caret', '▍');
      node.appendChild(caret);
      let i = 0;
      const timer = setInterval(() => {
        if (i >= text.length) {
          clearInterval(timer); caret.remove(); resolve();
          return;
        }
        caret.insertAdjacentText('beforebegin', text[i]);
        i++;
      }, speed);
      node.__skip = () => { // permite pular
        clearInterval(timer);
        node.textContent = text;
        resolve();
      };
    });
  }

  // ---------- HUD: termômetro emocional ----------
  const METERS = [
    { key: 'confianca', nome: 'Confiança' },
    { key: 'respeito', nome: 'Respeito' },
    { key: 'seguranca', nome: 'Segurança Psicológica' },
    { key: 'estresse', nome: 'Estresse' },
    { key: 'engajamento', nome: 'Engajamento' },
    { key: 'risco', nome: 'Risco Organizacional' },
  ];

  function renderHud(container, indicadores) {
    container.innerHTML = `
      <h3>Termômetro Emocional</h3>
      ${METERS.map((m) => `
        <div class="meter meter--${m.key}" data-meter="${m.key}">
          <div class="meter-top">
            <span class="name">${m.nome}</span>
            <span class="val mono" data-val="${m.key}">0</span>
          </div>
          <div class="meter-bar"><div class="meter-fill" data-fill="${m.key}" style="width:0%"></div></div>
        </div>`).join('')}
      <div class="hud-xp">
        <span class="label">XP do módulo</span>
        <span class="num mono" data-xp>0</span>
      </div>`;
    updateHud(container, indicadores, true);
  }

  // Anima barras com GSAP se disponível; senão usa transição CSS
  function updateHud(container, ind, instant = false) {
    METERS.forEach((m) => {
      const fill = container.querySelector(`[data-fill="${m.key}"]`);
      const val = container.querySelector(`[data-val="${m.key}"]`);
      const target = Math.max(0, Math.min(100, ind[m.key] ?? 0));
      if (window.gsap && !instant) {
        gsap.to(fill, { width: `${target}%`, duration: 0.7, ease: 'power2.out' });
        const obj = { v: parseInt(val.textContent) || 0 };
        gsap.to(obj, { v: target, duration: 0.7, ease: 'power2.out',
          onUpdate: () => { val.textContent = Math.round(obj.v); } });
      } else {
        fill.style.transition = instant ? 'none' : 'width .6s ease';
        fill.style.width = `${target}%`;
        val.textContent = target;
      }
    });
    const xp = container.querySelector('[data-xp]');
    if (xp) {
      if (window.gsap && !instant) {
        const obj = { v: parseInt(xp.textContent) || 0 };
        gsap.to(obj, { v: ind.xpModulo ?? 0, duration: 0.7,
          onUpdate: () => { xp.textContent = Math.round(obj.v); } });
      } else xp.textContent = ind.xpModulo ?? 0;
    }
  }

  // entrada de personagem (badge de fala)
  function entrarPersonagem(node) {
    if (!node) return;
    if (window.gsap) gsap.to(node, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    else { node.style.opacity = '1'; node.style.transform = 'none'; }
  }

  // entrada do personagem corpo-inteiro (sobe suavemente)
  function entrarPersonagemFull(node) {
    if (!node) return;
    if (window.gsap) {
      gsap.fromTo(node, { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
    } else { node.style.opacity = '1'; node.style.transform = 'none'; }
  }

  function iniciais(nome) {
    return (nome || '?').split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase();
  }

  return { $, $$, el, esc, toast, toastBadge, initParticles, typewriter,
           renderHud, updateHud, entrarPersonagem, entrarPersonagemFull, iniciais, METERS };
})();
