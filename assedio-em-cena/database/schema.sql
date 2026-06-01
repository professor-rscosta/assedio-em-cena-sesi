-- =====================================================================
--  ASSÉDIO EM CENA — Schema do Banco de Dados (MySQL 8+)
--  Plataforma gamificada de prevenção ao assédio no trabalho
-- =====================================================================

DROP DATABASE IF EXISTS assedio_em_cena;
CREATE DATABASE assedio_em_cena
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE assedio_em_cena;

-- ---------------------------------------------------------------------
--  USUÁRIOS
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(120)        NOT NULL,
  email           VARCHAR(160)        NOT NULL UNIQUE,
  senha_hash      VARCHAR(255)        NOT NULL,
  cargo           VARCHAR(120)        DEFAULT NULL,
  departamento    VARCHAR(120)        DEFAULT NULL,
  papel_sistema   ENUM('admin','rh','gestor','colaborador') NOT NULL DEFAULT 'colaborador',
  avatar_url      VARCHAR(255)        DEFAULT NULL,
  nivel_maturidade ENUM('observador','agente','guardiao') NOT NULL DEFAULT 'observador',
  xp_total        INT                 NOT NULL DEFAULT 0,
  ativo           BOOLEAN             NOT NULL DEFAULT TRUE,
  ultimo_acesso   DATETIME            DEFAULT NULL,
  criado_em       DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_papel (papel_sistema),
  INDEX idx_usuarios_maturidade (nivel_maturidade)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  PERFIS RPG (papéis jogáveis dentro da narrativa)
-- ---------------------------------------------------------------------
CREATE TABLE perfis (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  chave         VARCHAR(40)  NOT NULL UNIQUE,   -- lideranca, colaborador, rh, observador, vitima, testemunha
  nome          VARCHAR(80)  NOT NULL,
  descricao     TEXT,
  icone         VARCHAR(80),
  cor_tema      VARCHAR(20),
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  PERSONAGENS (NPCs corporativos)
-- ---------------------------------------------------------------------
CREATE TABLE personagens (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(120) NOT NULL,
  funcao          VARCHAR(120),
  personalidade   TEXT,
  historico       TEXT,
  nivel_estresse  TINYINT      NOT NULL DEFAULT 0,   -- 0..100
  sprite_url      VARCHAR(255),
  cor_tema        VARCHAR(20),
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  MÓDULOS
-- ---------------------------------------------------------------------
CREATE TABLE modulos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ordem         INT          NOT NULL,
  titulo        VARCHAR(160) NOT NULL,
  subtitulo     VARCHAR(255),
  descricao     TEXT,
  carga_horaria DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  CENÁRIOS (nós da narrativa ramificada)
-- ---------------------------------------------------------------------
CREATE TABLE cenarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  modulo_id       INT          NOT NULL,
  chave           VARCHAR(60)  NOT NULL UNIQUE,   -- ex: m1_intro, m1_quiz_1
  tipo            ENUM('narrativa','quiz','dialogo','reflexao','final','video','caso','multipla','vf','ordenar') NOT NULL DEFAULT 'narrativa',
  titulo          VARCHAR(160),
  texto           TEXT,                            -- fala/contexto exibido
  personagem_id   INT          DEFAULT NULL,       -- quem fala (opcional)
  cenario_inicial BOOLEAN      NOT NULL DEFAULT FALSE,
  ordem           INT          NOT NULL DEFAULT 0,
  midia_url       VARCHAR(255) DEFAULT NULL,
  video_url       VARCHAR(255) DEFAULT NULL,        -- embed do YouTube (cenas tipo 'video')
  audio_url       VARCHAR(255) DEFAULT NULL,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id)     REFERENCES modulos(id)     ON DELETE CASCADE,
  FOREIGN KEY (personagem_id) REFERENCES personagens(id) ON DELETE SET NULL,
  INDEX idx_cenarios_modulo (modulo_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  ESCOLHAS (arestas da narrativa ramificada)
-- ---------------------------------------------------------------------
CREATE TABLE escolhas (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  cenario_id          INT          NOT NULL,   -- cenário de origem
  texto               VARCHAR(400) NOT NULL,   -- texto do botão de decisão
  cenario_destino_id  INT          DEFAULT NULL, -- próximo nó (NULL = fim de ramo)
  correta             BOOLEAN      DEFAULT NULL,  -- p/ quizzes (NULL = sem certo/errado)
  ordem               INT          NOT NULL DEFAULT 0,
  -- deltas nos indicadores do termômetro emocional (-100..+100)
  delta_confianca     INT NOT NULL DEFAULT 0,
  delta_respeito      INT NOT NULL DEFAULT 0,
  delta_seguranca     INT NOT NULL DEFAULT 0,
  delta_estresse      INT NOT NULL DEFAULT 0,
  delta_engajamento   INT NOT NULL DEFAULT 0,
  delta_risco         INT NOT NULL DEFAULT 0,
  xp                  INT NOT NULL DEFAULT 0,
  FOREIGN KEY (cenario_id)         REFERENCES cenarios(id) ON DELETE CASCADE,
  FOREIGN KEY (cenario_destino_id) REFERENCES cenarios(id) ON DELETE SET NULL,
  INDEX idx_escolhas_cenario (cenario_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  CONSEQUÊNCIAS (feedback educativo exibido após uma escolha)
-- ---------------------------------------------------------------------
CREATE TABLE consequencias (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  escolha_id      INT NOT NULL,
  impacto_emocional TEXT,    -- o que acontece com as pessoas
  impacto_org      TEXT,     -- impacto organizacional
  contexto_legal   TEXT,     -- enquadramento legal / normativo
  reflexao         TEXT,     -- reflexão educativa
  severidade       ENUM('positiva','neutra','atencao','grave') NOT NULL DEFAULT 'neutra',
  FOREIGN KEY (escolha_id) REFERENCES escolhas(id) ON DELETE CASCADE,
  INDEX idx_consequencias_escolha (escolha_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  BADGES / INSÍGNIAS
-- ---------------------------------------------------------------------
CREATE TABLE badges (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  chave         VARCHAR(60)  NOT NULL UNIQUE,
  nome          VARCHAR(120) NOT NULL,
  descricao     TEXT,
  icone         VARCHAR(80),
  raridade      ENUM('comum','rara','epica','lendaria') NOT NULL DEFAULT 'comum',
  xp_requerido  INT NOT NULL DEFAULT 0,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE usuario_badges (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT NOT NULL,
  badge_id     INT NOT NULL,
  conquistado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_badge (usuario_id, badge_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id)   REFERENCES badges(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  PROGRESSO (estado de jogo por usuário/módulo)
-- ---------------------------------------------------------------------
CREATE TABLE progresso (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id        INT NOT NULL,
  modulo_id         INT NOT NULL,
  perfil_id         INT DEFAULT NULL,
  cenario_atual_id  INT DEFAULT NULL,
  -- snapshot dos indicadores emocionais (0..100)
  ind_confianca     INT NOT NULL DEFAULT 50,
  ind_respeito      INT NOT NULL DEFAULT 50,
  ind_seguranca     INT NOT NULL DEFAULT 50,
  ind_estresse      INT NOT NULL DEFAULT 30,
  ind_engajamento   INT NOT NULL DEFAULT 50,
  ind_risco         INT NOT NULL DEFAULT 30,
  xp_modulo         INT NOT NULL DEFAULT 0,
  concluido         BOOLEAN NOT NULL DEFAULT FALSE,
  iniciado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  concluido_em      DATETIME DEFAULT NULL,
  UNIQUE KEY uq_progresso (usuario_id, modulo_id),
  FOREIGN KEY (usuario_id)       REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (modulo_id)        REFERENCES modulos(id)   ON DELETE CASCADE,
  FOREIGN KEY (perfil_id)        REFERENCES perfis(id)    ON DELETE SET NULL,
  FOREIGN KEY (cenario_atual_id) REFERENCES cenarios(id)  ON DELETE SET NULL,
  INDEX idx_progresso_usuario (usuario_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  RESPOSTAS (registro de cada decisão do jogador — base do relatório PDF)
-- ---------------------------------------------------------------------
CREATE TABLE respostas (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT NOT NULL,
  modulo_id     INT NOT NULL,
  cenario_id    INT NOT NULL,
  escolha_id    INT DEFAULT NULL,
  cenario_titulo  VARCHAR(160),
  cenario_tipo    VARCHAR(20),
  pergunta        TEXT,        -- texto do cenário no momento
  resposta_texto  VARCHAR(400),-- texto da escolha feita
  correta         BOOLEAN DEFAULT NULL,
  xp              INT NOT NULL DEFAULT 0,
  respondido_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (modulo_id)  REFERENCES modulos(id)  ON DELETE CASCADE,
  INDEX idx_respostas_usuario (usuario_id, modulo_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  RANKINGS (agregado para leaderboard)
-- ---------------------------------------------------------------------
CREATE TABLE rankings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT NOT NULL UNIQUE,
  pontuacao     INT NOT NULL DEFAULT 0,
  modulos_concluidos INT NOT NULL DEFAULT 0,
  badges_total  INT NOT NULL DEFAULT 0,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_rankings_pontuacao (pontuacao DESC)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  CERTIFICADOS
-- ---------------------------------------------------------------------
CREATE TABLE certificados (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  codigo          VARCHAR(40)  NOT NULL UNIQUE,  -- usado no QR / validação
  nivel_maturidade VARCHAR(40),
  carga_horaria   DECIMAL(4,1) NOT NULL DEFAULT 0,
  badge_destaque  VARCHAR(120),
  arquivo_url     VARCHAR(255),
  emitido_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_certificados_codigo (codigo)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  LOGS (auditoria / modo auditoria)
-- ---------------------------------------------------------------------
CREATE TABLE logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT DEFAULT NULL,
  acao        VARCHAR(120) NOT NULL,
  detalhe     JSON DEFAULT NULL,
  ip          VARCHAR(45),
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_logs_usuario (usuario_id),
  INDEX idx_logs_acao (acao)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  ANALYTICS (eventos para dashboards comportamentais)
-- ---------------------------------------------------------------------
CREATE TABLE analytics (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT DEFAULT NULL,
  evento      VARCHAR(80) NOT NULL,   -- ex: escolha_feita, modulo_concluido
  cenario_id  INT DEFAULT NULL,
  escolha_id  INT DEFAULT NULL,
  valor       INT DEFAULT NULL,
  metadata    JSON DEFAULT NULL,
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_analytics_evento (evento),
  INDEX idx_analytics_data (criado_em)
) ENGINE=InnoDB;

-- =====================================================================
--  Para popular os dados base + Módulo 1, rode em seguida:
--     mysql -u root -p assedio_em_cena < seed_modulo1.sql
--  ou:  npm run seed
-- =====================================================================
