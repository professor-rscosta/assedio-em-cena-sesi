# 🚀 Deploy na nuvem + incorporar no Moodle (iframe)

## Deploy na Hostinger

A Hostinger tem planos diferentes, e isso muda **se** a aplicação roda:

- **Hospedagem compartilhada (Web Hosting / Premium / Business):** é focada em PHP. Você até consegue criar o **banco MySQL** ali, mas normalmente **não roda Node.js** de forma persistente. Use o banco da Hostinger e rode a aplicação Node em outro lugar (Render, Railway), ou contrate uma VPS.
- **VPS Hostinger:** roda Node.js sem problema — é o cenário ideal. Você tem acesso SSH e instala tudo como num servidor próprio.

### Passos (VPS Hostinger)
1. Acesse a VPS por SSH (dados no painel da Hostinger).
2. Instale Node 18+ e o cliente MySQL. Clone o projeto do GitHub.
3. Copie `.env.producao` para `.env` e ajuste (veja abaixo).
4. `npm install` → `npm run db:init` → `npm run seed` → `npm start`.
5. Para manter no ar, use **PM2**: `npm i -g pm2 && pm2 start server.js --name assedio` e `pm2 startup`.
6. Configure um domínio/HTTPS apontando para a porta da aplicação (proxy reverso com Nginx + Certbot).

### Variáveis de ambiente (dados do seu banco Hostinger)
O arquivo `.env.producao` já vem preenchido. No servidor, renomeie para `.env`:

```
DB_HOST=127.0.0.1          # veja observação abaixo
DB_PORT=3306
DB_USER=u429575031_adm_sst_sesi
DB_PASSWORD=ADM@rsc@2027
DB_NAME=u429575031_sst_sesi
```

> **DB_HOST na Hostinger:** se a aplicação roda **na mesma máquina** do banco (VPS), `127.0.0.1` ou `localhost` funciona. Se o banco está na hospedagem compartilhada e a app roda **em outro servidor**, o host **não** é `127.0.0.1` — é o hostname que aparece no painel (em "Bancos de Dados MySQL", algo como `srvXXX.hstgr.io`), e você precisa liberar "Remote MySQL" para o IP da aplicação.

> **Senha com `@`:** sua senha tem `@`. Nas variáveis `DB_*` isso funciona perfeitamente (a aplicação usa `DB_PASSWORD` direto). **Só não** monte uma `DATABASE_URL` no formato `mysql://user:senha@host` com essa senha — os `@` quebram a URL. A aplicação não usa `DATABASE_URL`, então ignore esse formato.

> **Segurança:** troque o `JWT_SECRET` por uma chave longa e aleatória, e troque `ADMIN_SENHA`. Como a senha do banco foi compartilhada, considere trocá-la no painel da Hostinger após configurar.

---

## Visão geral (outros provedores)
A plataforma é uma aplicação full-stack (Node.js + MySQL). Para embutir no Moodle, ela precisa estar **hospedada e acessível por HTTPS**. O fluxo é: (1) subir num serviço de nuvem, (2) liberar o embed para o domínio do seu Moodle, (3) inserir um iframe na atividade.

---

## 1. Deploy na nuvem (exemplo: Render)

O Render é gratuito para começar e simples para Node + MySQL. Os passos são equivalentes em Railway, Heroku, AWS, etc.

1. Suba o projeto para o GitHub (você já fez).
2. Crie um banco MySQL gerenciado (no Render: "New +" → "MySQL"; ou use PlanetScale/Railway). Anote host, usuário, senha e nome do banco.
3. No Render: "New +" → "Web Service" → conecte o repositório.
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Em "Environment", configure as variáveis (copie de `.env.example`):
   ```
   NODE_ENV=production
   DB_HOST=...        DB_PORT=3306
   DB_USER=...        DB_PASSWORD=...
   DB_NAME=assedio_em_cena
   JWT_SECRET=(uma chave longa e aleatória)
   CLIENT_URL=https://SEU-APP.onrender.com
   FRAME_ANCESTORS=https://moodle.suaescola.edu.br
   ```
5. Faça o deploy. Depois, **uma única vez**, rode a criação do banco. No "Shell" do serviço:
   ```bash
   npm run db:init
   npm run seed
   ```
   (Se o banco já existир de uma versão anterior, use `npm run db:migrate` em vez de `db:init`.)
6. Acesse `https://SEU-APP.onrender.com` e confirme que abre e que dá para jogar.

> Observação sobre arquivos: certificados/relatórios PDF são gravados em `uploads/`. Em planos gratuitos o disco é efêmero (some a cada redeploy). Para produção séria, use um disco persistente ou um storage (S3). Para piloto/treinamento, funciona como está.

---

## 2. Liberar o embed para o seu Moodle

No `.env` (ou variáveis de ambiente do serviço), defina o domínio do seu Moodle:

```
FRAME_ANCESTORS=https://moodle.suaescola.edu.br
```

Pode listar mais de um, separados por espaço:
```
FRAME_ANCESTORS=https://moodle.suaescola.edu.br https://ava.suaescola.edu.br
```

Isso envia o cabeçalho `Content-Security-Policy: frame-ancestors` que autoriza só esses domínios a embutir a plataforma. Sem isso, o navegador bloqueia o iframe.

---

## 3. Inserir no Moodle

### Opção A — Rótulo / Página com HTML (mais simples)
1. Ative a edição no curso.
2. Adicione um recurso **"Página"** (ou um **"Rótulo"**).
3. No editor de texto, clique em **\<\>** (ver código HTML) e cole:

```html
<div style="position:relative;width:100%;max-width:1200px;margin:0 auto;">
  <iframe
    src="https://SEU-APP.onrender.com"
    title="Assédio em Cena - SESI"
    style="width:100%;height:820px;border:0;border-radius:12px;"
    allow="fullscreen; autoplay"
    allowfullscreen>
  </iframe>
</div>
```

4. Salve. O jogo aparece embutido na página do curso.

### Opção B — Atividade "URL" (abre em nova aba/janela)
1. Adicione a atividade **"URL"**.
2. Cole `https://SEU-APP.onrender.com`.
3. Em "Aparência", escolha "Incorporar" ou "Nova janela".

---

## Dúvidas comuns

**O iframe aparece em branco / "recusou conexão".**
Quase sempre é o `FRAME_ANCESTORS` faltando ou com o domínio errado. Confira se o valor bate exatamente com o endereço do seu Moodle (com `https://`, sem barra no final). Reinicie o serviço após alterar a variável.

**O login não funciona dentro do iframe.**
A plataforma já tem um fallback: se o navegador bloquear o armazenamento dentro do iframe (proteção contra rastreamento), a sessão passa a viver em memória durante o uso. O aluno consegue jogar normalmente; só não mantém o login se recarregar a página. Para experiência ideal, oriente os alunos a permitir cookies/armazenamento do site, ou use a Opção B (nova janela).

**Quero que a nota volte para o boletim do Moodle.**
Isso exige integração LTI (padrão de notas do Moodle), que não está implementada nesta versão — é um desenvolvimento adicional no backend. O iframe sozinho não devolve nota; o acompanhamento fica no painel administrativo da própria plataforma (analytics, ranking, progresso, certificados).

**HTTPS é obrigatório?**
Sim. O Moodle normalmente roda em HTTPS, e navegadores recusam embutir conteúdo HTTP ("mixed content"). Serviços de nuvem já fornecem HTTPS automático.
