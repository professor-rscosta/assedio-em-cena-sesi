/* ============================================================
   views/result.js — Resultado final: stats, radar, certificado
   ============================================================ */

const ResultView = {
  async render(root, { moduloId, indicadores, onVoltar }) {
    const user = API.getUser();
    const ind = indicadores || {};

    root.innerHTML = `
      <div class="view"><div class="wrap wrap--narrow reveal">
        <div class="glass result" style="padding:34px">
          <div class="badge-pop">🎯</div>
          <h2>Módulo concluído!</h2>
          <p class="sub">Você treinou seu olhar para reconhecer situações de assédio. Cada escolha moldou o clima da organização — veja o retrato emocional que você deixou.</p>

          <canvas id="resultChart" height="280"></canvas>

          <div class="result-stats">
            <div class="stat glass"><div class="num">${ind.xpModulo ?? 0}</div><div class="lab">XP no módulo</div></div>
            <div class="stat glass"><div class="num" style="text-transform:capitalize;font-size:18px">${UI.esc(user?.nivel_maturidade || 'observador')}</div><div class="lab">Maturidade</div></div>
            <div class="stat glass"><div class="num">${ind.risco ?? 0}</div><div class="lab">Risco final</div></div>
          </div>

          <div id="cert-area">
            <button class="btn btn--primary btn--block" id="btn-cert">📜 Emitir meu certificado</button>
          </div>
          <button class="btn btn--ghost btn--block" id="btn-voltar" style="margin-top:10px">Voltar ao início</button>
        </div>
      </div></div>`;

    this.renderRadar(ind);

    UI.$('#btn-voltar', root).addEventListener('click', onVoltar);

    UI.$('#btn-cert', root).addEventListener('click', async () => {
      const btn = UI.$('#btn-cert', root);
      btn.disabled = true; btn.textContent = 'Gerando certificado...';
      try {
        const { codigo, arquivoUrl } = await API.emitirCertificado(moduloId);
        const base = window.AEC_API_BASE ?? '';
        UI.$('#cert-area', root).innerHTML = `
          <div class="glass" style="padding:18px;text-align:center;border-color:rgba(34,197,94,.4)">
            <p style="margin-bottom:6px">✅ Certificado emitido!</p>
            <p class="mono dim" style="font-size:13px;margin-bottom:14px">Código: ${UI.esc(codigo)}</p>
            <a class="btn btn--primary btn--block" href="${base}${arquivoUrl}" target="_blank" rel="noopener">Baixar PDF</a>
          </div>`;
        UI.toast('Certificado gerado com sucesso!', 'ok');
      } catch (err) {
        UI.toast(err.message, 'erro');
        btn.disabled = false; btn.textContent = '📜 Emitir meu certificado';
      }
    });
  },

  renderRadar(ind) {
    const canvas = UI.$('#resultChart');
    if (!canvas || !window.Chart) return;
    const labels = UI.METERS.map((m) => m.nome.replace(' Psicológica', '').replace(' Organizacional', ''));
    const data = UI.METERS.map((m) => ind[m.key] ?? 0);

    new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Clima ao final',
          data,
          fill: true,
          backgroundColor: 'rgba(124,92,255,0.2)',
          borderColor: '#7C5CFF',
          pointBackgroundColor: '#22C55E',
          pointBorderColor: '#fff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#9FB0D0', font: { family: 'Sora' } } } },
        scales: {
          r: {
            min: 0, max: 100,
            angleLines: { color: 'rgba(124,92,255,0.15)' },
            grid: { color: 'rgba(124,92,255,0.15)' },
            pointLabels: { color: '#EAF0FF', font: { size: 11, family: 'Sora' } },
            ticks: { color: '#5C6B8E', backdropColor: 'transparent', stepSize: 25 },
          },
        },
      },
    });
  },
};
