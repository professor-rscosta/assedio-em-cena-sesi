-- =====================================================================
--  SEED — MÓDULO 1: "Você reconheceria uma situação de assédio?"
--  10 situações interativas, contexto indústria / SESI
--  Formatos: narrativa, vídeo, análise de caso, múltipla escolha,
--            verdadeiro/falso, ordenar, quiz, diálogo, reflexão, final
-- =====================================================================
USE assedio_em_cena;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE respostas;
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
('lideranca',  'Liderança',  'Você responde por uma equipe na indústria. Suas decisões moldam o clima.', 'crown',  '#0A4FA0'),
('colaborador','Colaborador','Operador(a) do chão de fábrica que vive o dia a dia da planta.',           'user',   '#1E6FD0'),
('rh',         'RH / SESI',  'Responsável por acolher, apurar e prevenir na empresa.',                   'shield', '#5BA829'),
('observador', 'Observador', 'Acompanha a cena sem intervir diretamente — por enquanto.',                'eye',    '#9DB2D6'),
('vitima',     'Vítima',     'Quem sofre a conduta. Vive o impacto emocional na pele.',                  'heart',  '#E0453B'),
('testemunha', 'Testemunha', 'Presencia a situação e decide se age ou se cala.',                         'users',  '#F2A900');

-- ---------- PERSONAGENS ----------
INSERT INTO personagens (nome, funcao, personalidade, historico, nivel_estresse, cor_tema) VALUES
('Téo',     'Téc. Segurança do Trabalho', 'Mascote SESI, didático e acolhedor. Guia o participante.', 'Apresenta os casos e conduz a reflexão.', 10, '#0A4FA0'),
('Bia',     'Téc. Segurança do Trabalho', 'Mascote SESI, firme e empática. Conduz as análises.',     'Apresenta casos sob a ótica da prevenção.', 10, '#5BA829'),
('Marcos',  'Supervisor de Produção',     'Carismático em público, ríspido em privado. Usa humor como arma.', 'Bateu metas por anos; acha que pressão funciona.', 60, '#1E6FD0'),
('Júlia',   'Operadora Júnior',           'Dedicada, ansiosa, evita conflito.',                       'Primeiro emprego na indústria; teme retaliação.', 75, '#E0453B'),
('Renata',  'Analista de RH',             'Empática e técnica. Conhece a política interna e a CIPA.', 'Lidera o canal de denúncias da empresa.', 30, '#5BA829'),
('Diego',   'Colega de turno',            'Observador, evita se meter, mas incomodado.',              'Já viu colegas saírem por situações parecidas.', 45, '#F2A900'),
('Narrador','Sistema',                    'Voz neutra que conduz a reflexão.',                        '-', 0, '#9DB2D6');

-- ---------- BADGES ----------
INSERT INTO badges (chave, nome, descricao, icone, raridade, xp_requerido) VALUES
('primeiro_passo', 'Primeiro Passo',       'Concluiu o Módulo 1.',                              'flag',   'comum',     0),
('olhar_atento',   'Olhar Atento',         'Reconheceu corretamente situações de assédio.',     'eye',    'rara',     50),
('mito_quebrado',  'Quebrador de Mitos',   'Desconstruiu mitos sobre assédio no trabalho.',     'hammer', 'rara',     80),
('empatia',        'Empatia em Ação',      'Escolheu acolher em vez de minimizar.',             'heart',  'epica',   120),
('guardiao',       'Guardião do Respeito', 'Atingiu o nível máximo de maturidade.',             'shield', 'lendaria',200);

-- ---------- MÓDULO 1 ----------
INSERT INTO modulos (id, ordem, titulo, subtitulo, descricao, carga_horaria, ativo) VALUES
(1, 1, 'Introdução', 'Você reconheceria uma situação de assédio?',
 '10 situações interativas no contexto da indústria: vídeo, análise de casos, múltipla escolha, verdadeiro ou falso e mais. Treine seu olhar para reconhecer e prevenir o assédio no trabalho.',
 2.0, TRUE);

-- ---------- CENÁRIOS ----------
INSERT INTO cenarios (id, modulo_id, chave, tipo, titulo, texto, personagem_id, cenario_inicial, ordem, video_url) VALUES
(1, 1, 'm1_intro', 'narrativa', 'Início de turno na planta',
 'Bem-vindo(a) à fábrica. Sou o Téo, da equipe de Segurança do Trabalho do SESI. Nas próximas situações você vai tomar decisões reais do cotidiano industrial. Cada escolha muda o clima da equipe. Vamos testar o seu olhar?',
 1, TRUE, 1, NULL),
(2, 1, 'm1_video', 'video', 'Assista: Você sabe o que é assédio?',
 'Antes de decidir, assista ao vídeo abaixo sobre o que caracteriza o assédio no ambiente de trabalho. Depois, responda à pergunta.',
 1, FALSE, 2, 'https://www.youtube.com/embed/uAT3LjrW9cU?si=M_4IEVFnG11-ElTO'),
(3, 1, 'm1_vf', 'vf', 'Verdadeiro ou Falso',
 'Avalie a afirmação: "Assédio moral só existe quando o supervisor grita ou xinga abertamente."',
 7, FALSE, 3, NULL),
(4, 1, 'm1_piada', 'dialogo', 'Reunião de produção',
 'Durante a reunião de turno, Marcos olha para Júlia e solta, rindo: "Relaxa, isso aí até você consegue fazer... eu acho." Alguns riem sem graça. Júlia abaixa os olhos e não responde. O que você faz?',
 3, FALSE, 4, NULL),
(5, 1, 'm1_multipla', 'multipla', 'Como classificar?',
 'A fala de Marcos se repete, sempre dirigida à mesma pessoa e em público. Selecione a melhor classificação para essa conduta.',
 7, FALSE, 5, NULL),
(6, 1, 'm1_caso', 'caso', 'Estudo de caso: a meta impossível',
 'CASO: Marcos passa a definir, só para Júlia, metas 40% acima das do restante do turno. Quando ela não cumpre, ele a expõe no mural: "Quem não dá conta, atrapalha o time." Júlia começa a ter insônia e falta ao trabalho. Analisando o caso, qual é a leitura mais adequada?',
 1, FALSE, 6, NULL),
(7, 1, 'm1_video2', 'video', 'Assista: impactos do assédio na saúde',
 'Assista ao vídeo sobre os impactos do assédio na saúde do trabalhador e na produtividade. Depois, responda.',
 2, FALSE, 7, 'COLOQUE_AQUI_O_EMBED_DO_YOUTUBE'),
(8, 1, 'm1_ordenar', 'ordenar', 'Qual o primeiro passo?',
 'Você testemunhou a situação. Entre as opções abaixo, qual deve ser a PRIMEIRA atitude de uma testemunha responsável?',
 6, FALSE, 8, NULL),
(9, 1, 'm1_corredor', 'dialogo', 'No corredor, depois',
 'Você encontra Júlia perto do vestiário. Ela está abalada: "Não é a primeira vez. Mas se eu falar algo, vai sobrar pra mim." O que você faz?',
 4, FALSE, 9, NULL),
(10, 1, 'm1_reflexao', 'quiz', 'O papel da prevenção',
 'Para encerrar: qual atitude MAIS fortalece uma cultura de respeito na indústria, na visão da prevenção (SESI/CIPA)?',
 2, FALSE, 10, NULL),
(11, 1, 'm1_final', 'final', 'Um olhar que transforma',
 'Você concluiu as 10 situações. Reconhecer condutas, acolher quem sofre e acionar os canais certos é o que muda a cultura da empresa, uma decisão consciente de cada vez. Veja seu resultado e gere seu certificado SESI.',
 1, FALSE, 11, NULL);

-- ---------- ESCOLHAS + CONSEQUÊNCIAS ----------
INSERT INTO escolhas (id, cenario_id, texto, cenario_destino_id, correta, ordem, xp,
  delta_confianca,delta_respeito,delta_seguranca,delta_estresse,delta_engajamento,delta_risco) VALUES
(1, 1, 'Estou pronto(a). Vamos começar.', 2, NULL, 1, 5, 0,0,0,0,3,0),
(2, 2, 'Assédio é conduta que humilha, constrange ou expõe alguém de forma abusiva.', 3, 1, 1, 15, 4,4,4,-2,3,-4),
(3, 2, 'Assédio é qualquer ordem dada por um superior hierárquico.', 3, 0, 2, 0, -2,-2,-2,2,0,4),
(4, 3, 'VERDADEIRO - sem grito não há assédio.', 4, 0, 1, 0, 0,0,-2,3,0,5),
(5, 3, 'FALSO - o assédio também é sutil, repetido e velado.', 4, 1, 2, 20, 5,5,5,-3,3,-5),
(6, 4, 'Rio junto para não criar climão.', 5, NULL, 1, 0, -3,-5,-8,5,-3,8),
(7, 4, 'Fico em silêncio, mas registro mentalmente o que vi.', 5, NULL, 2, 5, 0,0,-2,2,0,2),
(8, 4, 'Falo na hora: "Marcos, esse tipo de comentário não ajuda ninguém."', 5, NULL, 3, 15, 5,8,6,-2,2,-6),
(9,  5, 'Brincadeira sem importância entre colegas.', 6, 0, 1, 0, -2,-4,-4,3,0,6),
(10, 5, 'Assédio moral: humilhação repetida e pública.', 6, 1, 2, 20, 4,6,6,-2,2,-6),
(11, 5, 'Conflito normal de equipe.', 6, 0, 3, 0, -2,-3,-3,2,0,4),
(12, 5, 'Apenas estilo durão de liderar.', 6, 0, 4, 0, -3,-4,-5,3,-1,6),
(13, 6, 'Metas individualizadas e exposição no mural caracterizam assédio moral, com risco à saúde.', 7, 1, 1, 25, 6,6,8,-4,4,-8),
(14, 6, 'É só cobrança por desempenho; cada um cumpre sua meta.', 7, 0, 2, 0, -4,-5,-6,5,-2,8),
(15, 6, 'Problema pessoal da Júlia; a empresa não tem a ver com isso.', 7, 0, 3, 0, -5,-6,-8,6,-3,10),
(16, 7, 'O assédio afeta saúde mental, produtividade e clima - é um risco ocupacional.', 8, 1, 1, 15, 4,4,5,-3,3,-5),
(17, 7, 'O assédio é só uma questão de pele grossa de cada um.', 8, 0, 2, 0, -3,-3,-4,3,-1,5),
(18, 8, 'Acolher a pessoa, ouvir sem julgar e informar os canais (RH/CIPA/SESI).', 9, 1, 1, 20, 6,7,8,-4,4,-7),
(19, 8, 'Confrontar publicamente o agressor na frente de todos.', 9, 0, 2, 0, -2,-1,-3,4,0,4),
(20, 8, 'Não se envolver para não arrumar problema.', 9, 0, 3, 0, -4,-5,-7,5,-3,8),
(21, 8, 'Espalhar o ocorrido para os outros colegas.', 9, 0, 4, 0, -3,-4,-5,4,-2,6),
(22, 9, '"Imagina, deve ter sido sem querer. Deixa pra lá."', 10, NULL, 1, 0, -4,-6,-10,6,-4,10),
(23, 9, '"Eu vi o que aconteceu. Você não está exagerando, e não está sozinha. Quer procurar o RH/SESI comigo?"', 10, NULL, 2, 25, 8,10,12,-6,5,-12),
(24, 9, '"Melhor não falar nada, pode piorar pra você."', 10, NULL, 3, 0, -6,-4,-12,8,-3,12),
(25, 10, 'Criar canais seguros, treinar lideranças e acolher relatos com sigilo.', 11, 1, 1, 25, 8,10,12,-5,6,-12),
(26, 10, 'Esperar a vítima resolver sozinha para não interferir.', 11, 0, 2, 0, -5,-6,-8,5,-3,8),
(27, 10, 'Punir quem denuncia para manter a ordem.', 11, 0, 3, 0, -8,-10,-14,8,-5,15);

INSERT INTO consequencias (escolha_id, impacto_emocional, impacto_org, contexto_legal, reflexao, severidade) VALUES
(2, 'Entender o conceito ajuda a validar quem sofre.', 'A empresa que nomeia bem, previne melhor.',
    'O assédio se define pela conduta abusiva e reiterada que afeta a dignidade - não por dar ordens legítimas.',
    'Dar uma ordem de trabalho não é assédio; humilhar ao dar a ordem, sim.', 'positiva'),
(3, 'Confundir gestão com assédio banaliza o problema real.', 'Gestão legítima é necessária; abuso não.',
    'Exigir tarefas dentro da função é poder diretivo normal do empregador.',
    'O limite está no respeito à dignidade, não na existência da ordem.', 'atencao'),
(4, 'Condutas sutis passam despercebidas e a vítima se sente invalidada.', 'A empresa subestima riscos e o ambiente se deteriora.',
    'O assédio moral se caracteriza pela conduta repetida e abusiva que humilha - não exige gritos.',
    'Gritar é só a forma mais óbvia. Ironias, isolamento e metas impossíveis também configuram assédio.', 'atencao'),
(5, 'Reconhecer a sutileza protege quem sofre em silêncio.', 'A organização passa a tratar riscos antes que virem crises.',
    'A Lei 14.457/2022 e a NR-1 reforçam o dever das empresas de prevenir o assédio em suas várias formas.',
    'Treinar o olhar para o sutil separa o observador do agente consciente.', 'positiva'),
(6, 'Júlia se sente ainda mais isolada - até a plateia riu.', 'A piada vira norma: a equipe aprende que humilhar é aceitável.',
    'A omissão coletiva pode tornar o ambiente hostil e agravar a responsabilidade da empresa.',
    'Rir junto raramente é neutro: muitas vezes é endosso.', 'grave'),
(7, 'Júlia segue sozinha, mas há uma testemunha consciente.', 'O registro ajuda, mas a falta de reação mantém o padrão.',
    'Testemunhas têm papel-chave em apurações; o relato importa.',
    'Perceber é metade do caminho. A outra metade é o que você faz com isso.', 'neutra'),
(8, 'Júlia sente que não está sozinha pela primeira vez.', 'A intervenção respeitosa redefine o limite do aceitável.',
    'Interromper a conduta de forma firme e não agressiva é prática preventiva recomendada.',
    'Não é preciso brigar. Nomear o comportamento já desarma boa parte dele.', 'positiva'),
(9,  'Minimizar faz a vítima duvidar da própria percepção.', 'A cultura do é só brincadeira blinda agressores.',
     'A intenção de brincar não descaracteriza o assédio; o que importa é o efeito sobre a vítima.',
     'A linha entre humor e humilhação está em quem ri - e em quem se cala.', 'atencao'),
(10, 'Nomear corretamente devolve dignidade a quem sofreu.', 'Classificar bem permite acionar os canais certos.',
     'Humilhação reiterada e dirigida, sobretudo em público, é elemento típico do assédio moral.',
     'Reconhecer com precisão habilita uma resposta proporcional.', 'positiva'),
(11, 'Tratar como conflito transfere a culpa para a vítima.', 'Conflito é bilateral; assédio é abuso de poder.',
     'A assimetria de poder e a repetição diferenciam assédio de um desentendimento.',
     'Nem todo conflito é assédio - mas nem todo assédio é só um conflito.', 'atencao'),
(12, 'Romantizar o durão naturaliza o abuso.', 'Estilo de liderança não justifica humilhação.',
     'Poder diretivo não autoriza tratamento degradante.', 'Liderar é exigir com respeito, não humilhando.', 'atencao'),
(13, 'Validar o adoecimento abre caminho para o cuidado.', 'Identificar o nexo evita afastamentos e passivos.',
     'Metas desiguais e exposição vexatória são indícios de assédio moral; o adoecimento reforça o nexo com o trabalho.',
     'Pressão seletiva e humilhação pública são sinais clássicos - não cobrança normal.', 'positiva'),
(14, 'A vítima é responsabilizada pelo próprio sofrimento.', 'Mascarar assédio como meta perpetua o dano.',
     'Cobrança legítima é igualitária e razoável; perseguição individual não.',
     'Meta abusiva e dirigida a uma só pessoa não é gestão, é assédio.', 'grave'),
(15, 'Abandonar a vítima aprofunda o adoecimento.', 'A empresa tem dever legal de cuidar do ambiente.',
     'O empregador responde pelo meio ambiente de trabalho saudável (NR-1, riscos psicossociais).',
     'Saúde mental no trabalho é responsabilidade da organização.', 'grave'),
(16, 'Reconhecer o impacto na saúde legitima a prevenção.', 'Ambientes saudáveis produzem mais e adoecem menos.',
     'Riscos psicossociais integram a gestão de SST (NR-1).', 'Prevenir assédio é também segurança do trabalho.', 'positiva'),
(17, 'Culpar a vítima por não aguentar é revitimização.', 'Ignorar o risco aumenta afastamentos e turnover.',
     'O dever de prevenção é da empresa, não da resiliência individual.', 'Não é sobre pele grossa; é sobre ambiente seguro.', 'atencao'),
(18, 'O acolhimento devolve segurança a quem sofreu.', 'Encaminhar ao canal certo resolve com método.',
     'Acolher e direcionar à ouvidoria/RH/CIPA é o procedimento adequado.',
     'A primeira atitude é cuidar da pessoa e apontar a porta certa.', 'positiva'),
(19, 'Confronto público pode expor ainda mais a vítima.', 'Sem método, vira conflito aberto.',
     'A apuração deve correr por canais formais e sigilosos.', 'Firmeza sim; espetáculo não.', 'atencao'),
(20, 'A omissão confirma o medo da vítima.', 'O silêncio perpetua o ciclo de abuso.',
     'Desencorajar o relato pode caracterizar conivência.', 'Não se envolver é escolher o lado de quem agride.', 'grave'),
(21, 'A fofoca revitimiza e quebra o sigilo.', 'Exposição informal prejudica a apuração.',
     'O sigilo protege a vítima e a lisura do processo.', 'Apoiar não é espalhar; é encaminhar com cuidado.', 'atencao'),
(22, 'Júlia sente que nem você acreditou nela.', 'O recado para a equipe: aqui ninguém apoia.',
     'Desencorajar o relato pode caracterizar conivência institucional.', 'Boa intenção sem validação ainda machuca.', 'grave'),
(23, 'Júlia se sente vista, validada e segura para agir.', 'A empresa ganha um caso bem encaminhado e cultura de apoio.',
     'Acolher e direcionar ao canal oficial protege todos.', 'Você não precisa ser herói - precisa ser presença e apontar a porta certa.', 'positiva'),
(24, 'O medo de Júlia é confirmado e ampliado.', 'O silêncio aumenta o turnover e o adoecimento.',
     'Sugerir omissão pode expor a empresa a passivos.', 'Pode piorar é exatamente o que mantém o assédio funcionando.', 'grave'),
(25, 'Pessoas se sentem seguras para falar.', 'Prevenção estruturada reduz riscos e fortalece o time.',
     'A Lei 14.457/2022 exige canais de denúncia e capacitação; a CIPA passou a atuar na prevenção do assédio.',
     'Cultura de respeito se constrói com canais, formação e acolhimento.', 'positiva'),
(26, 'A vítima permanece desamparada.', 'A inércia institucional perpetua o problema.',
     'A omissão da empresa agrava sua responsabilidade.', 'Prevenção não é esperar; é agir antes.', 'atencao'),
(27, 'Punir quem denuncia é retaliação - e revitimiza.', 'Destrói a confiança e multiplica o dano.',
     'A retaliação contra denunciantes é vedada e gera responsabilização.', 'Proteger o denunciante é condição de qualquer canal sério.', 'grave');
