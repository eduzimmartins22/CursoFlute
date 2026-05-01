/* =============================================
   data.js — Fonte única de verdade do curso.
   Contém: credenciais, meses, escalas.
   ============================================= */

'use strict';

// ─── Credenciais ────────────────────────────────
const CREDENTIALS = {
  professor: { login: 'Prof', password: 'Edu321', role: 'professor', name: 'Eduardo' },
};

// Alunos cadastrados pelo professor via painel.
// Lista começa vazia — adicione os alunos pelo painel do professor.
const DEMO_STUDENTS = [];

// ─── Meses do Curso ──────────────────────────────
// Baseado no plano curricular + conteúdo do PDF "Seu Curso de Flauta Transversal"
const MONTHS_DATA = [
  {
    num: 1, name: 'Janeiro',
    emoji: '🎵', tag: 'Fundamentos',
    desc: 'Embocadura 1ª e 2ª, posicionamento correto e Notas da 1ª, 2ª e 3ª Oitava.',
    fullDesc: 'O ponto de partida. Você vai construir a base de tudo: a relação correta com a embocadura, a postura com o instrumento e as primeiras notas da flauta — o alicerce de toda a técnica futura.',
    pillar: 'Teoria',
    objectives: [
  'Estudar a sonoridade: produzir timbre centrado, cheio e sem ruído de ar',
  'Controlar a embocadura com precisão: ajustar abertura e direção do ar para estabilidade em diferentes dinâmicas (piano a forte)',
  'Sustentar notas longas por 5–10 segundos com afinação estável e sem oscilações',
  'Manter postura corporal consistente durante toda a prática (sem colapsos ao longo do tempo)',
  'Executar transições suaves entre notas (Si–Lá–Sol–Fá–Mi) sem “quebras” no som',
  'Iniciar controle básico de afinação — ajustar micro variações com embocadura e ar',
  'Explorar 1ª, 2ª e início da 3ª oitava com consciência de apoio de ar (sem tensão)',
  'Desenvolver controle de ataque (início da nota) sem golpes de ar excessivos',
  'Manter relaxamento total das mãos mesmo em mudanças de posição',
  'Gravar e analisar o próprio som identificando: ruído de ar e instabilidade ',
  'Utilizar o app Jogo das Escalas com foco em precisão e tempo de resposta',
],
    tip: 'Não se apresse — um som belo e limpo vale mais do que muitas notas feias. Use o gravador de voz para ouvir seu próprio som e se corrigir.',
    pdfRef: 'Conteúdo do Módulo 1 • Pilares do Aprendizado (p.4) • Posições (p.6–7) • Notas (p.8)',
  },
  {
    num: 2, name: 'Fevereiro',
    emoji: '🎶', tag: '1ª, 2ª e 3ª Oitava',
    desc: 'Expansão do registro — domínio das três oitavas.',
    fullDesc: 'Com a base de janeiro consolidada, você expande o alcance da flauta passando pelas oitavas. A passagem entre oitavas exige controle de ar e lábio — o maior desafio do flautista iniciante.',
    pillar: 'Prática',
    objectives: [
      'Dominar completamente a 1ª oitava com afinação e sonoridade uniforme',
      'Escalas cromaticas e notas longas — exercício de Marcel Moyse (p.10 do PDF)',
      'Passagem para a 2ª oitava com controle de ar',
      'Início das notas da 3ª oitava',
      'Exercícios de ligadura entre oitavas',
      'Escalas de Dó Maior e Sol Maior cobrindo as oitavas trabalhadas',
      'Prática diária com metrônomo e gravação de sessões',
    ],
    tip: 'A passagem de oitava se vence com paciência. Não force a nota alta — aumente a velocidade do ar, não a pressão dos lábios.',
    pdfRef: 'Notas Longas de Moyse (p.10) • Constância: treine todos os dias, mesmo 1h (p.4)',
  },
  {
    num: 3, name: 'Março',
    emoji: '🎤', tag: 'Prova 1º Semestre',
    desc: 'Louvores aplicados + avaliação do 1º semestre.',
    fullDesc: 'Chegou o momento de integrar o que foi aprendido no contexto musical do louvor. O mês fecha com a prova do primeiro semestre: uma avaliação de postura, embocadura, oitavas e fluidez musical.',
    pillar: 'Constância',
    objectives: [
      'Tocar ao menos 3 louvores com boa fluidez e expressão',
      'Demonstrar controle das 3 oitavas trabalhadas',
      'Prova: avaliação de embocadura, postura e sonoridade',
      'Prova: louvores à escolha — mínimo 2 músicas completas',
      'Gravar as sessões de prova para análise e autocrítica',
    ],
    tip: 'Escolha louvores que você já conhece musicalmente — isso libera o foco para a técnica. Gravar antes da prova é essencial para identificar erros.',
    pdfRef: 'Gravações como ferramenta de autocrítica (p.14) • Constância aplicada (p.13)',
  },
  {
    num: 4, name: 'Maio',
    emoji: '🔊', tag: 'Qualidade Sonora',
    desc: 'Afinação, projeção, mecânica e repertório clássico.',
    fullDesc: 'O segundo semestre começa com um salto de qualidade. Você vai trabalhar afinação com afinador de referência, projeção sonora, exercícios de mecânica avançada e introduzir os grandes compositores da flauta.',
    pillar: 'Prática',
    objectives: [
      'Treinos de afinação diária com SoundCorset ou afinador de referência',
      'Projeção sonora: praticar em ambientes maiores — o som deve "chegar" ao fundo da sala',
      'Exercícios de mecânica: arpejos com variações de BPM (metrônomo)',
      'Notas longas de Moyse: controle de timbre, afinação e projeção',
      'Introdução a Bach, Mozart e Patápio Silva',
      'Escutar referências: Altamiro Carrilho, concertos de flauta',
      '30 min diários de mecânica (arpejos) + 30 min de peça preferida',
    ],
    tip: 'A chave não é estudar 10 horas massivamente — é estudar com concentração e atenção aos detalhes, com constância.',
    pdfRef: 'Mecânica — partitura "Rejubila" em 6/8 (p.12) • Constância: rotina diária (p.13) • Gravações (p.14)',
  },
  {
    num: 5, name: 'Junho',
    emoji: '📜', tag: 'Partitura I',
    desc: 'Introdução à leitura de partitura.',
    fullDesc: 'Neste mês você começa a ler música escrita. A partitura é a linguagem universal da música e abre portas para um repertório ilimitado. Vamos dos fundamentos (clave de sol, figuras) até leitura de hinos simples.',
    pillar: 'Teoria',
    objectives: [
      'Notas reais (Dó–Si) e notas cifradas (C–B) na pauta — clave de sol',
      'Figuras de duração: semibreve, mínima, semínima, colcheia',
      'Pausas: compasso 4/4 — treinar pulso interno com metrônomo',
      'Leitura de melodias simples na 1ª oitava com partitura',
      'Praticar "Clamo a Ti" de Jorge Corbage — compasso 4/4 (p.11 do PDF)',
      'Anotar, desenhar e cantarolar as notas antes de tocar',
      'Usar o app de escalas para memorizar notas na partitura',
    ],
    tip: 'Use o método de solfejo: cante a nota antes de tocar. Isso acelera o aprendizado da partitura. Se tiver dificuldade, escreva o nome da nota em cima.',
    pdfRef: 'Notas na Partitura (p.8) • Pausas — "Clamo a Ti" (p.11) • Prática inteligente (p.9)',
  },
  {
    num: 6, name: 'Julho',
    emoji: '📖', tag: 'Partitura II',
    desc: 'Leitura fluida e introdução à primeira vista.',
    fullDesc: 'Continuação do módulo de partitura, com leitura mais fluida em 2 oitavas, acidentes (sustenidos e bemóis), dinâmica na partitura e introdução à leitura à primeira vista.',
    pillar: 'Teoria',
    objectives: [
      'Notas com acidentes na partitura (# e ♭)',
      'Leitura em 2 oitavas completas com partitura',
      'Dinâmica na partitura: forte (f), piano (p), crescendo (<), decrescendo (>)',
      'Compasso 6/8: contagem 1,2,3–4,5,6 (base do "Rejubila" — p.12)',
      'Exercícios de leitura à primeira vista — isolar e treinar cada frase isoladamente',
      'Tocar louvores completos com partitura',
    ],
    tip: 'Leitura à primeira vista: olhe 1 compasso à frente enquanto toca o atual. Isole cada frase, treine isoladamente, depois progride com o metrônomo.',
    pdfRef: 'Mecânica "Rejubila" 6/8 (p.12) • Escalas musicais no app (p.9)',
  },
  {
    num: 7, name: 'Agosto',
    emoji: '🏆', tag: 'Prova 2º Semestre',
    desc: 'Prova tripla: louvor com partitura, primeira vista e peça erudita.',
    fullDesc: 'A maior avaliação do ano. Três provas integradas que mostram a evolução completa do aluno — da leitura de partitura à expressão em peças eruditas.',
    pillar: 'Constância',
    objectives: [
      'Prova 1: Louvores com partitura (fluência, expressão e afinação)',
      'Prova 2: Leitura de louvor à primeira vista',
      'Prova 3: Trecho de peça erudita — Bach, Mozart ou Patápio Silva',
      'Demonstrar afinação, projeção e qualidade sonora (conteúdo de Maio)',
      'Apresentação com postura correta e confiança',
      'Gravar a prova para análise comparativa com o início do curso',
    ],
    tip: 'Grave-se praticando nas 3 semanas anteriores à prova. Compare a gravação atual com a do início — você vai se surpreender com o quanto evoluiu.',
    pdfRef: 'Gravações — comparar "primeira vista" vs "após estudo" (p.14)',
  },
  {
    num: 8, name: 'Setembro',
    emoji: '🎼', tag: 'Harmonia em Trio',
    desc: 'Projeto de harmonia com 3 alunos — música coletiva.',
    fullDesc: 'Música é coletiva. Neste mês você começa a tocar em conjunto com outros dois alunos, desenvolvendo escuta harmônica, sincronia musical e sensibilidade para o ensemble.',
    pillar: 'Prática',
    objectives: [
      'Introdução à harmonia a 3 vozes para flauta',
      'Leitura e execução de arranjo a 3 flautas',
      'Afinação coletiva e sincronia de tempo',
      'Escuta ativa: ouvir as vozes dos colegas enquanto toca',
      'Ensaios de conjunto semanais',
      'Gravar os ensaios para identificar pontos de melhoria coletiva',
    ],
    tip: 'No ensemble, ouvir é tão importante quanto tocar. Dedique metade da atenção à sua voz e metade às vozes dos colegas.',
    pdfRef: 'Constância + Gravações aplicadas ao grupo (p.13–14)',
  },
  {
    num: 9, name: 'Outubro',
    emoji: '🎵', tag: 'Projeto de Harmonia',
    desc: 'Conclusão e polimento do projeto de harmonia em trio.',
    fullDesc: 'Aprofundamento do projeto de harmonia em trio, com polimento do repertório, dinâmica coletiva refinada e preparação para a apresentação final do grupo.',
    pillar: 'Prática',
    objectives: [
      'Polimento completo do repertório do trio',
      'Dinâmica coletiva: crescendos e decrescendos em conjunto',
      'Afinação refinada entre as 3 vozes',
      'Preparação e ensaio geral para apresentação do trio',
      'Gravação de ensaio para autocrítica coletiva',
    ],
    tip: 'Gravar os ensaios é fundamental. Ouça depois e identifique onde o trio pode melhorar — seja sincero com você e com os colegas.',
    pdfRef: 'Gravações como ferramenta de evolução (p.14)',
  },
  {
    num: 10, name: 'Nov/Dez',
    emoji: '🎬', tag: 'Projeto Final',
    desc: 'Gravação profissional em dupla com o professor.',
    fullDesc: 'O encerramento glorioso do ano. Você vai gravar um louvor em parceria com o professor, integrando TODOS os conteúdos aprendidos: técnica, partitura, harmonia, expressão e qualidade sonora.',
    pillar: 'Constância',
    objectives: [
      'Escolha colaborativa do louvor para gravação (aluno + professor)',
      'Preparação técnica e expressiva completa da peça final',
      'Gravação profissional — estúdio ou ambiente controlado',
      'Integração de todos os pilares: teoria, prática e constância',
      'Entrega do produto final — sua música, sua evolução documentada',
    ],
    tip: 'O projeto final é a prova de que você cresceu. Toque com emoção — é sua história musical. Compare com a gravação do primeiro mês.',
    pdfRef: 'Pilares do Aprendizado — Teoria · Prática · Constância (p.4) • Gravações (p.14)',
  },
];

// ─── Escalas ────────────────────────────────────
// ─── Circuito das Quintas e das Quartas ──────────
// Quintas: a 5ª nota da escala anterior vira a 1ª da próxima. Cada nova escala ganha +1 sustenido.
// Quartas: a 4ª nota da escala anterior vira a 1ª da próxima. Cada nova escala ganha +1 bemol.

const CIRCLE_OF_FIFTHS = [
  { key: 'C',  name: 'Dó',   sharps: 0, label: 'C  (natural)' },
  { key: 'G',  name: 'Sol',  sharps: 1, label: 'G  (1#)' },
  { key: 'D',  name: 'Ré',   sharps: 2, label: 'D  (2#)' },
  { key: 'A',  name: 'Lá',   sharps: 3, label: 'A  (3#)' },
  { key: 'E',  name: 'Mi',   sharps: 4, label: 'E  (4#)' },
  { key: 'B',  name: 'Si',   sharps: 5, label: 'B  (5#)' },
  { key: 'F#', name: 'Fá#',  sharps: 6, label: 'F# (6#)' },
];

const CIRCLE_OF_FOURTHS = [
  { key: 'F',  name: 'Fá',   flats: 1, label: 'F  (1♭)' },
  { key: 'Bb', name: 'Si♭',  flats: 2, label: 'B♭ (2♭)' },
  { key: 'Eb', name: 'Mi♭',  flats: 3, label: 'E♭ (3♭)' },
  { key: 'Ab', name: 'Lá♭',  flats: 4, label: 'A♭ (4♭)' },
  { key: 'Db', name: 'Ré♭',  flats: 5, label: 'D♭ (5♭)' },
  { key: 'Gb', name: 'Sol♭', flats: 6, label: 'G♭ (6♭)' },
  { key: 'Cb', name: 'Dó♭',  flats: 7, label: 'C♭ (7♭)' },
];

const SCALES_DATA = [

  // ════════════════════════════════
  //   CIRCUITO DAS QUINTAS (#)
  // ════════════════════════════════

  {
    key: 'C', name: 'Dó', circuit: 'fifths', info: 'C Maior — Natural (0 acidentes)',
    notes:  'Dó · Ré · Mi · Fá · Sol · Lá · Si · Dó',
    cipher: 'C  · D  · E  · F  · G   · A  · B  · C',
    sharps: '—',
    detail: 'Ponto de partida do Circuito das Quintas. Sem acidentes — todos os dedos em posição natural. Domine esta escala antes de qualquer outra. A 5ª nota (Sol) será a raiz da próxima escala.',
    louvor: 'Base do estudo — ponto de partida',
  },
  {
    key: 'G', name: 'Sol', circuit: 'fifths', info: 'G Maior — 1 sustenido',
    notes:  'Sol · Lá · Si  · Dó · Ré · Mi  · Fá# · Sol',
    cipher: 'G   · A  · B   · C  · D  · E   · F#  · G',
    sharps: 'Fá#',
    detail: 'Primeira escala do circuito. A última nota é sempre sustenida: Fá#. A 5ª nota (Ré) será a raiz da próxima. Muito comum em louvor — domine o Fá# isoladamente antes de tocar a escala completa.',
    louvor: '⭐ Muito usada em louvor',
  },
  {
    key: 'D', name: 'Ré', circuit: 'fifths', info: 'D Maior — 2 sustenidos',
    notes:  'Ré · Mi  · Fá# · Sol · Lá · Si  · Dó# · Ré',
    cipher: 'D  · E   · F#  · G   · A  · B   · C#  · D',
    sharps: 'Fá# · Dó#',
    detail: 'A nova nota sustenida é Dó#. A 5ª nota (Lá) será a raiz da próxima escala. O Dó# aparece na 3ª oitava — treine-o especialmente. Frequente em louvor contemporâneo.',
    louvor: '⭐ Usada em louvor',
  },
  {
    key: 'A', name: 'Lá', circuit: 'fifths', info: 'A Maior — 3 sustenidos',
    notes:  'Lá · Si  · Dó# · Ré · Mi  · Fá# · Sol# · Lá',
    cipher: 'A  · B   · C#  · D  · E   · F#  · G#   · A',
    sharps: 'Fá# · Dó# · Sol#',
    detail: 'Nova nota: Sol#. A 5ª nota (Mi) será a raiz da próxima. Exige atenção na 3ª oitava — os sustenidos agudos tendem a desafinar. Use afinador de referência.',
    louvor: 'Moderadamente usada',
  },
  {
    key: 'E', name: 'Mi', circuit: 'fifths', info: 'E Maior — 4 sustenidos',
    notes:  'Mi  · Fá# · Sol# · Lá · Si  · Dó# · Ré# · Mi',
    cipher: 'E   · F#  · G#   · A  · B   · C#  · D#  · E',
    sharps: 'Fá# · Dó# · Sol# · Ré#',
    detail: 'Nova nota: Ré#. A 5ª nota (Si) será a raiz da próxima. Quatro sustenidos exigem memória muscular sólida. Pratique lentamente e grave para verificar afinação.',
    louvor: 'Pouco usada em louvor',
  },
  {
    key: 'B', name: 'Si', circuit: 'fifths', info: 'B Maior — 5 sustenidos',
    notes:  'Si  · Dó# · Ré# · Mi  · Fá# · Sol# · Lá# · Si',
    cipher: 'B   · C#  · D#  · E   · F#  · G#   · A#  · B',
    sharps: 'Fá# · Dó# · Sol# · Ré# · Lá#',
    detail: 'Nova nota: Lá#. A 5ª nota (Fá#) será a raiz da próxima. Cinco sustenidos — escala avançada. Enarmônica de Dó♭ (7 bemóis). Pratique cada sustenido isoladamente.',
    louvor: 'Avançada — raramente em louvor',
  },
  {
    key: 'Fs', name: 'Fá#', circuit: 'fifths', info: 'F# Maior — 6 sustenidos',
    notes:  'Fá# · Sol# · Lá# · Si  · Dó# · Ré# · Mi# · Fá#',
    cipher: 'F#  · G#   · A#  · B   · C#  · D#  · E#  · F#',
    sharps: 'Fá# · Dó# · Sol# · Ré# · Lá# · Mi#',
    detail: 'Nova nota: Mi# (enarmônico de Fá). Seis sustenidos — a escala mais densa do circuito. Enarmônica de Sol♭ (6 bemóis). Use para treino avançado de memória e afinação.',
    louvor: 'Avançada — estudo técnico',
  },

  // ════════════════════════════════
  //   CIRCUITO DAS QUARTAS (♭)
  // ════════════════════════════════

  {
    key: 'F', name: 'Fá', circuit: 'fourths', info: 'F Maior — 1 bemol',
    notes:  'Fá · Sol · Lá · Si♭ · Dó · Ré · Mi · Fá',
    cipher: 'F  · G   · A  · B♭  · C  · D  · E  · F',
    flats: 'Si♭',
    detail: 'Ponto de partida do Circuito das Quartas. A 4ª nota (Si♭) é sempre bemolizada. A 4ª nota (Si♭) será a raiz da próxima escala. Muito presente na música sacra clássica.',
    louvor: '⭐ Usada em hinos tradicionais',
  },
  {
    key: 'Bb', name: 'Si♭', circuit: 'fourths', info: 'B♭ Maior — 2 bemóis',
    notes:  'Si♭ · Dó · Ré · Mi♭ · Fá · Sol · Lá · Si♭',
    cipher: 'B♭  · C  · D  · E♭  · F  · G   · A  · B♭',
    flats: 'Si♭ · Mi♭',
    detail: '🎯 A TONALIDADE MAIS COMUM NO LOUVOR! Quando o maestro diz "está em Si♭", é essa escala. A 4ª nota (Mi♭) será a raiz da próxima. Memorize prioritariamente.',
    louvor: '🎯 A mais importante do louvor!',
  },
  {
    key: 'Eb', name: 'Mi♭', circuit: 'fourths', info: 'E♭ Maior — 3 bemóis',
    notes:  'Mi♭ · Fá · Sol · Lá♭ · Si♭ · Dó · Ré · Mi♭',
    cipher: 'E♭  · F  · G   · A♭  · B♭  · C  · D  · E♭',
    flats: 'Si♭ · Mi♭ · Lá♭',
    detail: 'Nova nota: Lá♭. A 4ª nota (Lá♭) será a raiz da próxima. Segunda tonalidade mais usada no louvor. Controle a afinação nos bemóis agudos — eles tendem a cair.',
    louvor: '⭐⭐ Segunda mais usada no louvor',
  },
  {
    key: 'Ab', name: 'Lá♭', circuit: 'fourths', info: 'A♭ Maior — 4 bemóis',
    notes:  'Lá♭ · Si♭ · Dó · Ré♭ · Mi♭ · Fá · Sol · Lá♭',
    cipher: 'A♭  · B♭  · C  · D♭  · E♭  · F  · G   · A♭',
    flats: 'Si♭ · Mi♭ · Lá♭ · Ré♭',
    detail: 'Nova nota: Ré♭. A 4ª nota (Ré♭) será a raiz da próxima. Aparece em arranjos mais elaborados. Com 4 bemóis, exige boa memória muscular — pratique devagar e com metrônomo.',
    louvor: 'Arranjos elaborados',
  },
  {
    key: 'Db', name: 'Ré♭', circuit: 'fourths', info: 'D♭ Maior — 5 bemóis',
    notes:  'Ré♭ · Mi♭ · Fá · Sol♭ · Lá♭ · Si♭ · Dó · Ré♭',
    cipher: 'D♭  · E♭  · F  · G♭   · A♭  · B♭  · C  · D♭',
    flats: 'Si♭ · Mi♭ · Lá♭ · Ré♭ · Sol♭',
    detail: 'Nova nota: Sol♭. A 4ª nota (Sol♭) será a raiz da próxima. Enarmônica de Dó# (7 sustenidos). Cinco bemóis — escala avançada. Grave-se para verificar cada nota.',
    louvor: 'Avançada — estudo técnico',
  },
  {
    key: 'Gb', name: 'Sol♭', circuit: 'fourths', info: 'G♭ Maior — 6 bemóis',
    notes:  'Sol♭ · Lá♭ · Si♭ · Dó♭ · Ré♭ · Mi♭ · Fá · Sol♭',
    cipher: 'G♭   · A♭  · B♭  · C♭  · D♭  · E♭  · F  · G♭',
    flats: 'Si♭ · Mi♭ · Lá♭ · Ré♭ · Sol♭ · Dó♭',
    detail: 'Nova nota: Dó♭ (enarmônico de Si). Seis bemóis — enarmônica de Fá# (6 sustenidos). A 4ª nota (Dó♭) será a raiz da próxima. Escala de alto nível técnico.',
    louvor: 'Avançada — estudo técnico',
  },
  {
    key: 'Cb', name: 'Dó♭', circuit: 'fourths', info: 'C♭ Maior — 7 bemóis',
    notes:  'Dó♭ · Ré♭ · Mi♭ · Fá♭ · Sol♭ · Lá♭ · Si♭♭ · Dó♭',
    cipher: 'C♭  · D♭  · E♭  · F♭  · G♭   · A♭  · B♭♭  · C♭',
    flats: 'Si♭ · Mi♭ · Lá♭ · Ré♭ · Sol♭ · Dó♭ · Fá♭',
    detail: 'Sete bemóis — a escala mais densa do circuito. Enarmônica de Si Maior (5 sustenidos). Fá♭ é enarmônico de Mi. Escala de estudo avançado — raramente usada na prática.',
    louvor: 'Avançada — raramente usada',
  },
];
