# 🎭 Assédio em Cena — Plataforma completa (frontend + backend)

Plataforma gamificada de prevenção ao assédio moral e sexual no trabalho. Backend Node.js/Express/MySQL + frontend Vanilla JS cinematográfico (visual-novel, HUD do termômetro emocional, glassmorphism/neon). Inclui o **Módulo 1 — "Você reconheceria uma situação de assédio?"** jogável de ponta a ponta.

## Stack
**Backend:** Node.js · Express · MySQL (mysql2) · JWT · bcryptjs · Socket.io · Multer · PDFKit · Nodemailer · QRCode
**Frontend:** HTML5 · CSS3 · JavaScript Vanilla · GSAP · Chart.js (via CDN)

## Pré-requisitos
- Node.js 18+
- MySQL 8+

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
#   edite .env com a senha do seu MySQL e um JWT_SECRET forte

# 3. Criar banco e tabelas
npm run db:init

# 4. Popular Módulo 1 + criar admin
npm run seed

# 5. Subir o servidor
npm run dev      # com nodemon
# ou
npm start
```

Servidor: `http://localhost:3000` · Health check: `GET /api/health`

Abra **`http://localhost:3000`** no navegador — o servidor Express serve o frontend (`client/`) automaticamente. Crie uma conta, escolha um perfil RPG e jogue o Módulo 1.

Admin padrão: e-mail e senha definidos no `.env` (`ADMIN_EMAIL` / `ADMIN_SENHA`).

## Frontend (`client/`)
Vanilla JS, sem build. Estrutura:
- `index.html` — entry point (carrega GSAP e Chart.js por CDN)
- `css/main.css` — design system (glassmorphism, neon, tokens)
- `css/game.css` — HUD do termômetro, engine visual-novel, telas
- `js/api.js` — cliente REST + sessão JWT (sessionStorage)
- `js/ui.js` — toasts, partículas, typewriter, animação das barras (GSAP)
- `js/views/` — `auth`, `hub`, `game`, `result`
- `js/app.js` — roteador de telas + topbar + validação pública de certificado

**Fluxo jogável:** login/registro → hub (escolha de perfil) → engine visual-novel (diálogo com typewriter, escolhas, consequências educativas, HUD animada em tempo real) → resultado (radar Chart.js + emissão de certificado PDF).

Se rodar o frontend em host separado do backend, ajuste no `index.html`:
```js
window.AEC_API_BASE = 'http://localhost:3000';
```
e garanta que `CLIENT_URL` no `.env` aponte para a origem do frontend (CORS).

## Mapa da API

### Autenticação `/api/auth`
| Método | Rota | Descrição |
|---|---|---|
| POST | `/registrar` | Cria conta `{ nome, email, senha, cargo?, departamento? }` |
| POST | `/login` | Retorna `{ token, usuario }` |
| GET  | `/eu` | Dados do usuário logado (Bearer token) |

### Jogo `/api/jogo` (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET  | `/modulos` | Lista módulos + progresso do usuário |
| GET  | `/perfis` | Perfis RPG jogáveis |
| POST | `/modulos/:id/iniciar` | Inicia o módulo `{ perfilId? }` → cenário inicial |
| GET  | `/modulos/:id/cenario` | Cenário atual + indicadores |
| POST | `/modulos/:id/escolher` | `{ escolhaId }` → consequência, próximo cenário, deltas, badges |

### Gamificação / Certificados / Admin `/api`
| Método | Rota | Acesso |
|---|---|---|
| GET  | `/badges` | logado |
| GET  | `/ranking` | logado |
| POST | `/certificados/modulos/:id` | logado (módulo concluído) → gera PDF |
| GET  | `/certificados/validar/:codigo` | **público** (QR Code) |
| GET  | `/admin/usuarios` | admin, rh |
| PUT/DELETE | `/admin/usuarios/:id` | admin |
| GET  | `/admin/analytics` | admin, rh |
| GET  | `/admin/logs` | admin |

## Termômetro emocional
Cada escolha carrega deltas (`delta_confianca`, `delta_respeito`, `delta_seguranca`, `delta_estresse`, `delta_engajamento`, `delta_risco`). O backend aplica os deltas ao progresso (clamp 0–100) e devolve os indicadores atualizados a cada decisão — o front anima as barras (Anime.js/GSAP/Chart.js).

## Progressão de maturidade
Derivada do XP total: `observador` (<80) → `agente` (80–199) → `guardiao` (≥200). Subir para `guardiao` concede a insígnia lendária automaticamente.

## Modo cooperativo (Socket.io)
Eventos: `sala:entrar`, `sala:votar`, `sala:avancar`, com broadcast de `sala:atualizada` e `sala:votos` para decisões em grupo em tempo real.

## Imagens e personagens (SESI)
A plataforma usa a logo oficial do SESI e dois mascotes de segurança do trabalho (Téo e Bia) nas cenas. Os arquivos ficam em `client/images/` e `client/avatars/`. Detalhes completos de onde salvar e como trocar personagens estão em **[`docs/ASSETS.md`](docs/ASSETS.md)**.

## Publicar no GitHub

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/professor-rscosta/assedio-em-cena-sesi.git
git push -u origin main
```

No Windows/PowerShell os comandos são idênticos (o git é o mesmo). Se o push pedir autenticação, use um **Personal Access Token** do GitHub como senha. O `.gitignore` já exclui `node_modules/`, `.env` e uploads — então rode `npm install` após clonar em outra máquina.

## Próximos módulos
A estrutura (`modulos`, `cenarios`, `escolhas`, `consequencias`) é genérica: para adicionar os Módulos 2–5, basta inserir novos registros seguindo o padrão de `database/seed_modulo1.sql`.
