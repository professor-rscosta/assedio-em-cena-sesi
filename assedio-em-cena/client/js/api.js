/* ============================================================
   api.js — Cliente da API REST + gestão de sessão (JWT)
   ============================================================ */

const API = (() => {
  // Em produção, defina como string vazia '' para usar o mesmo host do servidor.
  const BASE = window.AEC_API_BASE ?? '';

  const TOKEN_KEY = 'aec_token';
  const USER_KEY = 'aec_user';

  // Armazenamento resiliente: usa sessionStorage quando disponível,
  // mas cai para memória se o navegador bloquear (ex.: dentro de iframe
  // com proteção contra rastreamento). Assim a sessão funciona no Moodle.
  const mem = {};
  let storageOk = true;
  try {
    const k = '__aec_test__';
    sessionStorage.setItem(k, '1'); sessionStorage.removeItem(k);
  } catch { storageOk = false; }

  const store = {
    get(k) { try { return storageOk ? sessionStorage.getItem(k) : (mem[k] ?? null); } catch { return mem[k] ?? null; } },
    set(k, v) { try { if (storageOk) sessionStorage.setItem(k, v); else mem[k] = v; } catch { mem[k] = v; } },
    del(k) { try { if (storageOk) sessionStorage.removeItem(k); else delete mem[k]; } catch { delete mem[k]; } },
  };

  function getToken() {
    return store.get(TOKEN_KEY);
  }
  function setSession(token, usuario) {
    store.set(TOKEN_KEY, token);
    store.set(USER_KEY, JSON.stringify(usuario));
  }
  function getUser() {
    try { return JSON.parse(store.get(USER_KEY)); }
    catch { return null; }
  }
  function clear() {
    store.del(TOKEN_KEY);
    store.del(USER_KEY);
  }

  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(`${BASE}/api${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }

    let data = null;
    const text = await res.text();
    if (text) { try { data = JSON.parse(text); } catch { data = { raw: text }; } }

    if (!res.ok) {
      if (res.status === 401) clear();
      throw new Error((data && data.erro) || `Erro ${res.status}`);
    }
    return data;
  }

  return {
    // sessão
    getToken, getUser, clear, setSession,
    estaLogado: () => !!getToken(),

    // auth
    registrar: (payload) => request('POST', '/auth/registrar', payload),
    login: (payload) => request('POST', '/auth/login', payload),
    eu: () => request('GET', '/auth/eu'),

    // jogo
    modulos: () => request('GET', '/jogo/modulos'),
    perfis: () => request('GET', '/jogo/perfis'),
    iniciarModulo: (id, perfilId) => request('POST', `/jogo/modulos/${id}/iniciar`, { perfilId }),
    cenarioAtual: (id) => request('GET', `/jogo/modulos/${id}/cenario`),
    escolher: (id, escolhaId) => request('POST', `/jogo/modulos/${id}/escolher`, { escolhaId }),

    // gamificação
    badges: () => request('GET', '/badges'),
    ranking: (limit = 20) => request('GET', `/ranking?limit=${limit}`),

    // certificado
    emitirCertificado: (moduloId) => request('POST', `/certificados/modulos/${moduloId}`),
    exportarRespostas: (moduloId) => request('POST', `/respostas/modulos/${moduloId}/exportar`),
  };
})();
