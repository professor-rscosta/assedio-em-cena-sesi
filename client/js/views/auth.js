/* ============================================================
   views/auth.js — Login e Registro
   ============================================================ */

const AuthView = {
  render(root, { onAuth }) {
    root.innerHTML = `
      <div class="view">
        <div class="wrap wrap--narrow reveal">
          <div class="center" style="margin-bottom:26px">
            <img src="/images/logo-sesi.png" alt="SESI — Serviço Social da Indústria"
                 style="height:54px;width:auto;background:#fff;padding:10px 16px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);margin-bottom:20px">
            <div><span class="tag">Segurança do Trabalho · Treinamento Imersivo</span></div>
            <h2 style="font-size:30px;margin:16px 0 6px;font-weight:800">Assédio em Cena</h2>
            <p class="dim" style="font-size:15px">Decisões que transformam o ambiente de trabalho.</p>
          </div>

          <div class="glass" style="padding:28px">
            <div style="display:flex;gap:8px;margin-bottom:22px">
              <button class="btn btn--ghost btn--block" data-tab="login" style="border-color:var(--roxo)">Entrar</button>
              <button class="btn btn--ghost btn--block" data-tab="registrar">Criar conta</button>
            </div>

            <form id="form-login">
              <div class="field">
                <label>E-mail</label>
                <input type="email" name="email" required placeholder="voce@empresa.com" autocomplete="email">
              </div>
              <div class="field">
                <label>Senha</label>
                <input type="password" name="senha" required placeholder="••••••" autocomplete="current-password">
              </div>
              <button class="btn btn--primary btn--block" type="submit">Entrar na experiência</button>
            </form>

            <form id="form-registrar" class="hidden">
              <div class="field"><label>Nome completo</label><input name="nome" required placeholder="Seu nome"></div>
              <div class="field"><label>E-mail</label><input type="email" name="email" required placeholder="voce@empresa.com"></div>
              <div class="field"><label>Cargo (opcional)</label><input name="cargo" placeholder="Ex: Analista"></div>
              <div class="field"><label>Senha</label><input type="password" name="senha" required placeholder="mínimo 6 caracteres"></div>
              <button class="btn btn--primary btn--block" type="submit">Começar agora</button>
            </form>
          </div>
          <p class="center mute" style="margin-top:18px;font-size:12px">
            Ao entrar você concorda em participar de uma simulação educativa.
          </p>
        </div>
      </div>`;

    const formLogin = UI.$('#form-login', root);
    const formReg = UI.$('#form-registrar', root);
    const tabs = UI.$$('[data-tab]', root);

    tabs.forEach((b) => b.addEventListener('click', () => {
      const isLogin = b.dataset.tab === 'login';
      formLogin.classList.toggle('hidden', !isLogin);
      formReg.classList.toggle('hidden', isLogin);
      tabs.forEach((x) => x.style.borderColor = 'var(--glass-border)');
      b.style.borderColor = 'var(--roxo)';
    }));

    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = formLogin.querySelector('button');
      btn.disabled = true; btn.textContent = 'Entrando...';
      try {
        const fd = Object.fromEntries(new FormData(formLogin));
        const { token, usuario } = await API.login(fd);
        API.setSession(token, usuario);
        onAuth();
      } catch (err) {
        UI.toast(err.message, 'erro');
        btn.disabled = false; btn.textContent = 'Entrar na experiência';
      }
    });

    formReg.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = formReg.querySelector('button');
      btn.disabled = true; btn.textContent = 'Criando...';
      try {
        const fd = Object.fromEntries(new FormData(formReg));
        const { token, usuario } = await API.registrar(fd);
        API.setSession(token, usuario);
        UI.toast(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}!`, 'ok');
        onAuth();
      } catch (err) {
        UI.toast(err.message, 'erro');
        btn.disabled = false; btn.textContent = 'Começar agora';
      }
    });
  },
};
