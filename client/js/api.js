/* ============================================================
   api.js — Cliente da API REST + gestão de sessão (JWT)
   ============================================================ */

const API = (() => {
  // Em produção, defina como string vazia '' para usar o mesmo host do servidor.
  const BASE = window.AEC_API_BASE ?? '';

  const TOKEN_KEY = 'aec_token';
  const USER_KEY = 'aec_user';

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  function setSession(token, usuario) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }
  function getUser() {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY)); }
    catch { return null; }
  }
  function clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
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
