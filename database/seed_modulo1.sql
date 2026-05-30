-- =====================================================================
--  SEED — Dados base + MÓDULO 1: "Você reconheceria uma situação de assédio?"
-- =====================================================================
USE assedio_em_cena;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE consequencias;
TRUNCATE TABLE escolhas;
TRUNCATE TABLE cenarios;
TRUNCATE TABLE modulos;
TRUNCATE TABLE personagens;
TRUNCATE TABLE perfis;
TRUNCATE TABLE badges;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------- PERFIS RPG ----------
INSERT INTO perfis (chave, nome, descricao, icone, cor_tema) VALUES
('lideranca',  'Liderança',  'Você responde por uma equipe. Suas decisões moldam o clima.', 'crown',  '#7C5CFF'),
('colaborador','Colaborador','Membro da equipe que vive o dia a dia do escritório.',         'user',   '#3B82F6'),
('rh',         'RH',         'Responsável por acolher, apurar e prevenir.',                  'shield', '#22C55E'),
('observador', 'Observador', 'Acompanha a cena sem intervir diretamente — por enquanto.',    'eye',    '#94A3B8'),
('vitima',     'Vítima',     'Quem sofre a conduta. Vive o impacto emocional na pele.',       'heart',  '#EF4444'),
('testemunha', 'Testemunha', 'Presencia a situação e decide se age ou se cala.',              'users',  '#F59E0B');

-- ---------- PERSONAGENS ----------
INSERT INTO personagens (nome, funcao, personalidade, historico, nivel_estresse, cor_tema) VALUES
('Marcos',  'Gerente de Vendas',  'Carismático em público, ríspido em privado. Usa humor como arma.', 'Bateu metas por anos; aprendeu que pressão "funciona".', 60, '#7C5CFF'),
('Júlia',   'Analista Júnior',    'Dedicada, ansiosa, evita conflito.',                               'Primeiro emprego formal; teme retaliação.',              75, '#EF4444'),
('Renata',  'Analista de RH',     'Empática e técnica. Conhece a política interna.',                  'Lidera o canal de denúncias da empresa.',                30, '#22C55E'),
('Diego',   'Colega de equipe',   'Observador, evita "se meter", mas incomodado.',                    'Já viu colegas saírem por situações parecidas.',         45, '#F59E0B'),
('Narrador','Sistema',            'Voz neutra que conduz a reflexão.',                                '—',                                                       0,  '#94A3B8');

-- ---------- BADGES ----------
INSERT INTO badges (chave, nome, descricao, icone, raridade, xp_requerido) VALUES
('primeiro_passo', 'Primeiro Passo',        'Concluiu o Módulo 1.',                         'flag',    'comum',    0),
('olhar_atento',   'Olhar Atento',          'Reconheceu corretamente uma situação de assédio.','eye',   'rara',     50),
('mito_quebrado',  'Quebrador de Mitos',    'Desconstruiu mitos sobre assédio no trabalho.','hammer',  'rara',     80),
('empatia',        'Empatia em Ação',       'Escolheu acolher em vez de minimizar.',        'heart',   'epica',   120),
('guardiao',       'Guardião do Respeito',  'Atingiu o nível máximo de maturidade.',        'shield',  'lendaria',500);

-- ---------- MÓDULO 1 ----------
INSERT INTO modulos (id, ordem, titulo, subtitulo, descricao, carga_horaria, ativo) VALUES
(1, 1, 'Introdução', 'Você reconheceria uma situação de assédio?',
 'Quiz interativo, desconstrução de mitos e narrativa inicial para treinar o olhar sobre condutas abusivas.',
 1.5, TRUE);

-- ---------- CENÁRIOS (nós) ----------
-- ids fixos para podermos ligar as arestas
INSERT INTO cenarios (id, modulo_id, chave, tipo, titulo, texto, personagem_id, cenario_inicial, ordem) VALUES
(1, 1, 'm1_intro', 'narrativa', 'Segunda-feira, 9h',
 'O escritório acorda devagar. Cafés na mão, monitores ligando. Você está prestes a viver uma semana comum — ou quase. Vamos começar testando uma coisa: o seu olhar.',
 5, TRUE, 1),

(2, 1, 'm1_mito', 'quiz', 'Mito ou verdade?',
 '"Assédio moral só existe quando o chefe grita ou xinga abertamente." Como você classifica essa afirmação?',
 5, FALSE, 2),

(3, 1, 'm1_cena_piada', 'dialogo', 'Na reunião de equipe',
 'Durante a reunião, Marcos olha para Júlia e solta, rindo: "Relaxa, isso aí até você consegue fazer... eu acho." Alguns riem sem graça. Júlia abaixa os olhos e não responde.',
 1, FALSE, 3),

(4, 1, 'm1_quiz_reconhecer', 'quiz', 'O que aconteceu ali?',
 'Pense na cena. A fala de Marcos, repetida e dirigida sempre à mesma pessoa em público, configura o quê?',
 5, FALSE, 4),

(5, 1, 'm1_corredor', 'dialogo', 'No corredor, depois',
 'Você encontra Júlia perto da copa. Ela está visivelmente abalada. "Não é a primeira vez", ela diz baixinho. "Mas se eu falar algo, vai sobrar pra mim." O que você faz?',
 2, FALSE, 5),

(6, 1, 'm1_final_bom', 'final', 'Um olhar que transforma',
 'Você não resolveu tudo sozinho — e está tudo bem. Mas reconheceu a conduta, validou o que Júlia sentiu e apontou um caminho seguro. É assim que culturas mudam: uma escolha consciente de cada vez.',
 5, FALSE, 6),

(7, 1, 'm1_final_neutro', 'final', 'A semana segue',
 'Nada explodiu hoje. Mas o silêncio também é uma resposta — e ele ensina à equipe o que é tolerado. Reconhecer é o primeiro passo; agir é o próximo. Vamos revisar o que ficou pelo caminho.',
 5, FALSE, 7);

-- ---------- ESCOLHAS (arestas) + CONSEQUÊNCIAS ----------

-- Cenário 1 -> 2
INSERT INTO escolhas (id, cenario_id, texto, cenario_destino_id, correta, ordem, xp,
  delta_confianca, delta_respeito, delta_seguranca, delta_estresse, delta_engajamento, delta_risco) VALUES
(1, 1, 'Estou pronto. Vamos testar meu olhar.', 2, NULL, 1, 5, 0,0,0,0,2,0);

-- Cenário 2 (quiz mito) -> 3
INSERT INTO escolhas (id, cenario_id, texto, cenario_destino_id, correta, ordem, xp,
  delta_confianca, delta_respeito, delta_seguranca, delta_estresse, delta_engajamento, delta_risco) VALUES
(2, 2, 'Verdade — sem grito não há assédio.', 3, 0, 1, 0,  0,0,-2,3,0,5),
(3, 2, 'Mito — assédio também é sutil, repetido e velado.', 3, 1, 2, 20, 5,5,5,-3,3,-5);

INSERT INTO consequencias (escolha_id, impacto_emocional, impacto_org, contexto_legal, reflexao, severidade) VALUES
(2, 'Condutas sutis passam despercebidas e a vítima se sente invalidada.',
    'A empresa subestima riscos e deixa o ambiente se deteriorar.',
    'O assédio moral se caracteriza pela conduta REPETIDA e abusiva que humilha ou constrange — não exige gritos ou agressão explícita.',
    'Gritar é apenas a forma mais óbvia. Ironias, isolamento e metas impossíveis também podem configurar assédio.',
    'atencao'),
(3, 'Reconhecer a sutileza protege quem sofre em silêncio.',
    'A organização passa a enxergar e tratar riscos antes que virem crises.',
    'A Lei 14.457/2022 e a NR-1 reforçam o dever das empresas de prevenir o assédio em suas várias formas.',
    'Treinar o olhar para o sutil é o que separa um observador de um agente consciente.',
    'positiva');

-- Cenário 3 (diálogo piada) -> 4
INSERT INTO escolhas (id, cenario_id, texto, cenario_destino_id, correta, ordem, xp,
  delta_confianca, delta_respeito, delta_seguranca, delta_estresse, delta_engajamento, delta_risco) VALUES
(4, 3, 'Rio junto para não criar climão.', 4, NULL, 1, 0, -3,-5,-8,5,-3,8),
(5, 3, 'Fico em silêncio, mas registro mentalmente o que vi.', 4, NULL, 2, 5, 0,0,-2,2,0,2),
(6, 3, 'Falo na hora: "Marcos, esse tipo de comentário não ajuda ninguém."', 4, NULL, 3, 15, 5,8,6,-2,2,-6);

INSERT INTO consequencias (escolha_id, impacto_emocional, impacto_org, contexto_legal, reflexao, severidade) VALUES
(4, 'Júlia se sente ainda mais isolada — até a plateia "riu".',
    'A piada vira norma social: a equipe aprende que humilhar é aceitável.',
    'A omissão coletiva pode tornar o ambiente hostil, agravando a responsabilidade da empresa.',
    'Rir junto raramente é neutro: muitas vezes é endosso.',
    'grave'),
(5, 'Júlia segue sozinha, mas há uma testemunha consciente.',
    'O registro mental é útil, porém a falta de reação imediata mantém o padrão.',
    'Testemunhas têm papel-chave em eventuais apurações; o relato importa.',
    'Perceber é metade do caminho. A outra metade é o que você faz com isso.',
    'neutra'),
(6, 'Júlia sente que não está sozinha pela primeira vez.',
    'A intervenção respeitosa redefine o limite do aceitável para todo o time.',
    'Interromper a conduta de forma firme e não agressiva é uma prática preventiva recomendada.',
    'Não é preciso brigar. Nomear o comportamento já desarma boa parte dele.',
    'positiva');

-- Cenário 4 (quiz reconhecer) -> 5
INSERT INTO escolhas (id, cenario_id, texto, cenario_destino_id, correta, ordem, xp,
  delta_confianca, delta_respeito, delta_seguranca, delta_estresse, delta_engajamento, delta_risco) VALUES
(7, 4, 'Só uma brincadeira sem importância.', 5, 0, 1, 0, -2,-4,-4,3,0,6),
(8, 4, 'Possível assédio moral: humilhação repetida e pública.', 5, 1, 2, 20, 4,6,6,-2,2,-6),
(9, 4, 'Conflito normal de equipe, nada a ver com assédio.', 5, 0, 3, 0, -2,-3,-3,2,0,4);

INSERT INTO consequencias (escolha_id, impacto_emocional, impacto_org, contexto_legal, reflexao, severidade) VALUES
(7, 'Minimizar faz a vítima duvidar da própria percepção.',
    'A cultura do "é só brincadeira" blinda agressores.',
    'A intenção de "brincar" não descaracteriza o assédio; o que importa é o efeito sobre a vítima.',
    'A linha entre humor e humilhação está em quem ri — e em quem se cala.',
    'atencao'),
(8, 'Nomear corretamente devolve dignidade a quem sofreu.',
    'Classificar bem permite acionar os canais certos e prevenir reincidência.',
    'Humilhação reiterada e dirigida, especialmente em público, é elemento típico do assédio moral.',
    'Reconhecer com precisão é o que habilita uma resposta proporcional.',
    'positiva'),
(9, 'Tratar como "conflito" transfere a culpa para a vítima.',
    'Conflitos são bilaterais; assédio é uma relação de abuso de poder.',
    'A assimetria de poder e a repetição diferenciam assédio de um simples desentendimento.',
    'Nem todo conflito é assédio — mas nem todo assédio é "só um conflito".',
    'atencao');

-- Cenário 5 (corredor) -> finais
INSERT INTO escolhas (id, cenario_id, texto, cenario_destino_id, correta, ordem, xp,
  delta_confianca, delta_respeito, delta_seguranca, delta_estresse, delta_engajamento, delta_risco) VALUES
(10, 5, '"Imagina, deve ter sido sem querer. Deixa pra lá."', 7, NULL, 1, 0, -4,-6,-10,6,-4,10),
(11, 5, '"Eu vi o que aconteceu. Você não está exagerando, e não está sozinha. Quer que a gente procure o RH junto?"', 6, NULL, 2, 25, 8,10,12,-6,5,-12),
(12, 5, '"Acho melhor você não falar nada, pode piorar pra você."', 7, NULL, 3, 0, -6,-4,-12,8,-3,12);

INSERT INTO consequencias (escolha_id, impacto_emocional, impacto_org, contexto_legal, reflexao, severidade) VALUES
(10, 'Júlia sente que nem você acreditou nela.',
     'O recado para a equipe é: aqui, ninguém te apoia.',
     'Desencorajar o relato pode caracterizar conivência institucional.',
     'Boa intenção sem validação ainda machuca.',
     'grave'),
(11, 'Júlia se sente vista, validada e segura para agir.',
     'A empresa ganha um caso bem encaminhado e uma cultura de apoio.',
     'Acolher e direcionar ao canal oficial (RH/ouvidoria) é o procedimento adequado e protege todos.',
     'Você não precisa ser herói — precisa ser presença e apontar a porta certa.',
     'positiva'),
(12, 'O medo de Júlia é confirmado e ampliado.',
     'O silêncio organizacional perpetua o ciclo de abuso e aumenta o turnover.',
     'Sugerir omissão pode expor a empresa a passivos trabalhistas e morais.',
     '"Pode piorar" é exatamente o que mantém o assédio funcionando.',
     'grave');

-- Finais não têm escolhas de saída (NULL) — encerram o módulo.

-- ---------- ADMIN PADRÃO (senha definida pelo script de seed em JS) ----------
-- Ver server/services/seed.js para criação do admin com hash bcrypt.
