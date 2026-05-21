/* data.js — constantes do curso */

const PROF_LOGIN    = 'Prof';
const PROF_PASSWORD = 'Edu321';
const PROF_NAME     = 'Eduardo';

const MONTHS_DATA = [
 {
    num: 1, name: 'Janeiro',
    emoji: '🎵', tag: 'Fundamentos',
    desc: 'Embocadura 1ª e 2ª, posicionamento correto e Notas da 1ª, 2ª e 3ª Oitava.',
    fullDesc: 'O ponto de partida. Você vai construir a base de tudo: a relação correta com a embocadura, a postura com o instrumento e as primeiras notas da flauta — o alicerce de toda a técnica futura.',
    pillar: 'Teoria',
    objectives: [
  'Gravar-se tocando e autoavaliar: identifique se o timbre tem "cheiro de ar" ou é puro. Ouça 3 vezes antes de corrigir.',
  'Sustentar a nota Sol por 15 segundos com embocadura estável (sem variar para fora do centro). Teste com gravação.',
  'Passar da 1ª para a 2ª oitava (notas Dó-Sol) sem "saltos" audíveis — o som deve ser contínuo e suave.',
  'Executar o padrão Si–Lá–Sol–Fá–Mi 5 vezes sem engasgar — cada nota clara e separada.',
  'Manter a postura sentado por 20 minutos de prática sem colapso (ombros, costas retas). Grave para verificar.',
  'Tocar a escala de Dó Maior com as 3 oitavas usando apenas controle de ar (sem apertar os lábios).',
  'Auto-avaliar 3 gravações diferentes e descrever: qual teve melhor qualidade e por quê?',
  'Realizar 10 minutos de "notas longas" (cada nota com 5–8 segundos) e contar quantas ficaram afinadas.',
  'Usar o app Jogo das Escalas e atingir 80% de acerto (vel. 80 BPM) nas escalas de Dó e Sol.',
  'Criar um diário de áudio: grave 1 minuto da sua prática a cada 3 dias e compare a evolução.']
,
    tip: 'Não se apresse — um som belo e limpo vale mais do que muitas notas feias. Use o gravador de voz para ouvir seu próprio som e se corrigir.',
    pdfRef: 'Conteúdo do Módulo 1 • Pilares do Aprendizado (p.4) • Posições (p.6–7) • Notas (p.8)',
  },
  {
    num: 2,
    name: 'Fevereiro',
    emoji: '🎶',
    tag: '1ª, 2ª e 3ª Oitava',
    desc: 'Expansão do registro — domínio das três oitavas.',
    pillar: 'Prática',
    fullDesc: 'Com a base de janeiro, você expande o alcance passando pelas oitavas. A passagem exige controle de ar e lábio.',
    objectives: ['Tocar a escala de Dó Maior (1ª oitava) 10 vezes consecutivas com metrônomo a 60 BPM sem erros.', 'Sustentar 5 notas longas de Moyse (Dó, Ré, Mi, Fá, Sol) por 10 segundos cada com vibrato natural (sem tremor).', 'Passar entre oitavas na sequência Dó-Dó (oitava acima) 8 vezes — nenhuma "falha" de registro.', 'Tocar os primeiros 5 tons da 3ª oitava (Dó–Mi) e gravar: avalie se o timbre é brilhante e projetado.', 'Executar uma ligadura entre oitavas (Lá 1ª oitava → Lá 2ª oitava) 5 vezes sem "pops" audíveis.', 'Executar a escala de Sol Maior (com Fá#) nas 3 oitavas em 1 só fôlego, com afinação constante.', 'Gravar-se tocando Sol Maior a cada 2 dias. Conte quantos dias você conseguiu manter consistência.'],

    tip: 'A passagem de oitava se vence com paciência. Aumente a velocidade do ar, não a pressão dos lábios.',
  },
  {
    num: 3,
    name: 'Março',
    emoji: '🎤',
    tag: 'Prova 1º Semestre',
    desc: 'Louvores aplicados + avaliação do 1º semestre.',
    pillar: 'Constância',
    fullDesc: 'Integre o aprendizado no contexto do louvor. O mês fecha com a prova do primeiro semestre.',
    objectives: ['Escolha 3 louvores que você conhece e toque cada um 5 vezes até fluir naturalmente (sem pausas entre frases).', 'Em cada louvor, use intencionalmente as 3 oitavas. Grave e verifique: transições suaves entre registro?', 'Grave uma "auto-entrevista" de 2 min descrevendo: embocadura está relaxada? Postura está ereta? Som é puro?', 'Prepare 2 louvores completos para apresentar. Toque 3 vezes em pé (simulando apresentação) e avalie confiança.', 'Compare gravações dos louvores no início de janeiro × fim de março. Anote as 3 maiores mudanças que ouvu.'],

    tip: 'Escolha louvores que você já conhece — isso libera o foco para a técnica.',
  },
  {
    num: 4,
    name: 'Maio',
    emoji: '🔊',
    tag: 'Qualidade Sonora',
    desc: 'Afinação, projeção, mecânica e repertório clássico.',
    pillar: 'Prática',
    fullDesc: 'Salto de qualidade: afinação com afinador, projeção sonora, mecânica avançada e grandes compositores.',
    objectives: ['Usar SoundCorset 15 min/dia: pratique até conseguir manter a agulha no centro em 90% das notas.', 'Toque em 3 ambientes diferentes (sala, cozinha, exterior) e grave: qual ambiente amplifica mais seu som?', 'Dominar arpejos em Dó Maior a 60, 80 e 100 BPM. Grave cada um e compare: qual velocidade soa mais "fluida"?', 'Executar 8–10 notas longas de Moyse de 10 segundos cada. Auto-avalie: tom é brilhante e projetado?', 'Ouvir 1 peça de Bach, 1 de Mozart, 1 de Patápio Silva. Anote: o que é mais fácil para seu nível agora?', 'Escutar Altamiro Carrilho tocando um louvor. Procure replicar 2 características do estilo dele em sua prática.', 'Cumpra a rotina 20 dias do mês: cada dia complete 2h em blocos de 30min. Registre em um checklist.'],

    tip: 'Estudar com concentração e atenção aos detalhes, com constância, vale mais que 10h massivas.',
  },
  {
    num: 5,
    name: 'Junho',
    emoji: '📜',
    tag: 'Partitura I',
    desc: 'Introdução à leitura de partitura.',
    pillar: 'Teoria',
    fullDesc: 'Você começa a ler música escrita. A partitura é a linguagem universal da música.',
    objectives: ['Memorizar a sequência Dó–Ré–Mi–Fá–Sol–Lá–Si em apenas 3 dias. Teste: feche os olhos e cante a série.', 'Reconhecer todas as 7 notas na pauta em menos de 5 segundos cada. Use flashcards diariamente.', 'Identificar 4 figuras musicais (semibreve, mínima, semínima, colcheia) visualmente e saber suas durações.', 'Ler uma melodia simples de 8 compassos em Dó Maior na 1ª oitava sem erros 2 vezes seguidas.', 'Tocar "Clamo a Ti" completo (em compasso 4/4) olhando apenas para a partitura — sem memorização.', 'Antes de tocar qualquer nota, cantarole-a 1 vez. Faça isso em 100% das novas peças que aprender.', 'Completar 30 lições no app de escalas em 30 dias. Acompanhe seu progresso no gráfico do app.'],

    tip: 'Solfeje antes de tocar: cante a nota primeiro. Isso acelera o aprendizado.',
  },
  {
    num: 6,
    name: 'Julho',
    emoji: '📖',
    tag: 'Partitura II',
    desc: 'Leitura fluida e introdução à primeira vista.',
    pillar: 'Teoria',
    fullDesc: 'Leitura fluida em 2 oitavas, acidentes, dinâmica e leitura à primeira vista.',
    objectives: ['Reconhecer sustenidos (#) e bemóis (♭) na partitura e saber como afetam cada nota. Teste: 10 notas aleatórias.', 'Ler uma partitura com notas na 1ª e 2ª oitava sem pausas — fluidez é mais importante que velocidade.', 'Interpretar e executar: forte (toque projetado), piano (toque suave), crescendo e decrescendo em uma peça.', 'Contar compasso 6/8 enquanto toca: 1-2-3 / 4-5-6. Grave-se: mantém o pulso constante?', 'Pegar uma partitura desconhecida, isolar 1 frase, estudar 5 minutos e tocar com 80% de acuridade.', 'Dominar 2 louvores completos lendo partitura do início ao fim sem interrupções.'],

    tip: 'Primeira vista: olhe 1 compasso à frente enquanto toca o atual.',
  },
  {
    num: 7,
    name: 'Agosto',
    emoji: '🏆',
    tag: 'Prova 2º Semestre',
    desc: 'Prova tripla: partitura, primeira vista e peça erudita.',
    pillar: 'Constância',
    fullDesc: 'A maior avaliação do ano. Três provas que mostram a evolução completa.',
    objectives: ['Prova 1: Tocar 2 louvores com partitura — leia fluentemente, com expressão (dinâmica e andamento variáveis).', 'Prova 2: Receber uma peça desconhecida, estudar 10 min e tocar 80% com correção musical.', 'Prova 3: Tocar uma peça clássica (Bach, Mozart ou Patápio) que você memorizou — tecnicamente limpa.', 'Em cada prova: afinação dentro de ±20 cents (use afinador ao gravar), som projetado e cheio.', 'Apresentar em pé, postura reta, contato visual com espectador, transições relaxadas entre peças.', 'Grave-se tocando as 3 provas. Depois, assista e auto-avalie com uma checklist (afinação, técnica, expressão).'],

    tip: 'Grave-se nas 3 semanas anteriores. Compare com o início do curso — a evolução vai te surpreender.',
  },
  {
    num: 8,
    name: 'Setembro',
    emoji: '🎼',
    tag: 'Harmonia em Trio',
    desc: 'Projeto de harmonia com 3 alunos.',
    pillar: 'Prática',
    fullDesc: 'Música é coletiva. Você toca em conjunto, desenvolvendo escuta harmônica e sincronia.',
    objectives: ['Compreender seu papel nas 3 vozes (soprano, meio, baixo): seu padrão e como se relaciona com as outras.', 'Ler sua linha de flauta em um arranjo a 3 vozes sem erros 3 vezes consecutivas.', 'Ensaiar com 2 colegas 1x/semana. Grave e verifique: as 3 flautas começam juntas? Terminam juntas?', 'Escutar ativamente: consiga detectar quando uma colega desafina ou atrasa 1 beat.', 'Cumpra 100% dos ensaios semanais. A falta de 1 aluno prejudica TODOS os 3 — compromisso de grupo.', 'Após cada ensaio, todos assistem a gravação (5 min). Anote 1 melhoria e 1 ponto forte que observou.'],

    tip: 'No ensemble, ouvir é tão importante quanto tocar.',
  },
  {
    num: 9,
    name: 'Outubro',
    emoji: '🎵',
    tag: 'Projeto de Harmonia',
    desc: 'Polimento e conclusão do projeto em trio.',
    pillar: 'Prática',
    fullDesc: 'Aprofundamento do trio: polimento, dinâmica coletiva e preparação para apresentação.',
    objectives: ['Memorizar completamente a peça do trio: toque-a de cor 3 vezes seguidas sem livro.', 'Executar crescendos e decrescendos em sincronia: todas as 3 flautas ampliam/reduzem volume no mesmo instante.', 'Afinar as 3 vozes até conseguir 0 cents de diferença entre as notas simultâneas (use um afinador visual).', 'Gravar uma apresentação completa da peça (simulando concerto): postura, expressão e técnica profissionais.', 'Após gravação, reúna-se com o trio e façam uma auto-crítica construtiva (anote 3 pontos positivos).'],

    tip: 'Grave os ensaios — seja honesto com os colegas sobre o que pode melhorar.',
  },
  {
    num: 10,
    name: 'Nov/Dez',
    emoji: '🎬',
    tag: 'Projeto Final',
    desc: 'Gravação profissional em dupla com o professor.',
    pillar: 'Constância',
    fullDesc: 'O encerramento do ano. Gravação de um louvor integrando TODOS os conteúdos aprendidos.',
    objectives: ['Escolher com o professor um louvor que te representa: combina seus pontos fortes técnicos + emoção genuína.', 'Dominar 100% das notas (memorizado), com afinação perfeita, dinâmica intencional e expressão genuína.', 'Gravar a peça final 3 vezes em estúdio amador (casa). Escolha a melhor tomada — essa é seu "lançamento".', 'Nesta gravação, integre TUDO aprendido: embocadura, escalas, partitura, afinação, primeira vista, harmonia.', 'Ouça sua gravação do Nov/Dez 2025 → Nov/Dez 2026. Compare: quão longe você chegou? Documente essa evolução.'],

    tip: 'Toque com emoção — é sua história musical. Compare com a gravação do primeiro mês.',
  },
];

const SCALES_DATA = [
  // Quintas
  { key:'C',  name:'Dó',   circuit:'fifths', info:'C Maior (0#)', notes:'Dó · Ré · Mi · Fá · Sol · Lá · Si · Dó',          cipher:'C · D · E · F · G · A · B · C',             acids:'—',                              louvor:'Base do estudo', detail:'Sem acidentes. Ponto de partida absoluto. A 5ª nota (Sol) é a raiz da próxima escala.' },
  { key:'G',  name:'Sol',  circuit:'fifths', info:'G Maior (1#)', notes:'Sol · Lá · Si · Dó · Ré · Mi · Fá# · Sol',         cipher:'G · A · B · C · D · E · F# · G',            acids:'Fá#',                            louvor:'⭐ Muito usada',  detail:'Nova nota: Fá#. A 5ª nota (Ré) é a raiz da próxima. Domine o Fá# isoladamente.' },
  { key:'D',  name:'Ré',   circuit:'fifths', info:'D Maior (2#)', notes:'Ré · Mi · Fá# · Sol · Lá · Si · Dó# · Ré',         cipher:'D · E · F# · G · A · B · C# · D',           acids:'Fá# · Dó#',                      louvor:'⭐ Usada',        detail:'Nova nota: Dó#. A 5ª nota (Lá) é a raiz da próxima. O Dó# aparece na 3ª oitava.' },
  { key:'A',  name:'Lá',   circuit:'fifths', info:'A Maior (3#)', notes:'Lá · Si · Dó# · Ré · Mi · Fá# · Sol# · Lá',        cipher:'A · B · C# · D · E · F# · G# · A',          acids:'Fá# · Dó# · Sol#',               louvor:'Moderada',       detail:'Nova nota: Sol#. A 5ª nota (Mi) é a raiz da próxima. Use afinador nos agudos.' },
  { key:'E',  name:'Mi',   circuit:'fifths', info:'E Maior (4#)', notes:'Mi · Fá# · Sol# · Lá · Si · Dó# · Ré# · Mi',       cipher:'E · F# · G# · A · B · C# · D# · E',         acids:'Fá# · Dó# · Sol# · Ré#',         louvor:'Pouco usada',    detail:'Nova nota: Ré#. A 5ª nota (Si) é a raiz da próxima. Memória muscular sólida.' },
  { key:'B',  name:'Si',   circuit:'fifths', info:'B Maior (5#)', notes:'Si · Dó# · Ré# · Mi · Fá# · Sol# · Lá# · Si',      cipher:'B · C# · D# · E · F# · G# · A# · B',        acids:'Fá# · Dó# · Sol# · Ré# · Lá#',  louvor:'Avançada',       detail:'Nova nota: Lá#. A 5ª nota (Fá#) é a raiz da próxima. Enarmônica de Dó♭.' },
  { key:'Fs', name:'Fá#',  circuit:'fifths', info:'F# Maior (6#)',notes:'Fá# · Sol# · Lá# · Si · Dó# · Ré# · Mi# · Fá#',   cipher:'F# · G# · A# · B · C# · D# · E# · F#',     acids:'Fá# · Dó# · Sol# · Ré# · Lá# · Mi#', louvor:'Avançada', detail:'Nova nota: Mi# (=Fá). Seis sustenidos — enarmônica de Sol♭.' },
  // Quartas
  { key:'F',  name:'Fá',   circuit:'fourths',info:'F Maior (1♭)', notes:'Fá · Sol · Lá · Si♭ · Dó · Ré · Mi · Fá',          cipher:'F · G · A · B♭ · C · D · E · F',           acids:'Si♭',                            louvor:'⭐ Hinos',        detail:'Nova nota: Si♭. A 4ª nota é sempre bemolizada. A 4ª nota (Si♭) é raiz da próxima.' },
  { key:'Bb', name:'Si♭',  circuit:'fourths',info:'B♭ Maior (2♭)',notes:'Si♭ · Dó · Ré · Mi♭ · Fá · Sol · Lá · Si♭',        cipher:'B♭ · C · D · E♭ · F · G · A · B♭',         acids:'Si♭ · Mi♭',                      louvor:'🎯 A MAIS USADA!',detail:'🎯 TONALIDADE MAIS COMUM NO LOUVOR! Memorize prioritariamente. A 4ª nota (Mi♭) é raiz da próxima.' },
  { key:'Eb', name:'Mi♭',  circuit:'fourths',info:'E♭ Maior (3♭)',notes:'Mi♭ · Fá · Sol · Lá♭ · Si♭ · Dó · Ré · Mi♭',       cipher:'E♭ · F · G · A♭ · B♭ · C · D · E♭',        acids:'Si♭ · Mi♭ · Lá♭',                louvor:'⭐⭐ 2ª mais usada',detail:'Nova nota: Lá♭. Segunda tonalidade mais usada no louvor. Controle os bemóis agudos.' },
  { key:'Ab', name:'Lá♭',  circuit:'fourths',info:'A♭ Maior (4♭)',notes:'Lá♭ · Si♭ · Dó · Ré♭ · Mi♭ · Fá · Sol · Lá♭',     cipher:'A♭ · B♭ · C · D♭ · E♭ · F · G · A♭',      acids:'Si♭ · Mi♭ · Lá♭ · Ré♭',          louvor:'Arranjos elaborados',detail:'Nova nota: Ré♭. Com 4 bemóis, exige memória muscular — pratique devagar.' },
  { key:'Db', name:'Ré♭',  circuit:'fourths',info:'D♭ Maior (5♭)',notes:'Ré♭ · Mi♭ · Fá · Sol♭ · Lá♭ · Si♭ · Dó · Ré♭',    cipher:'D♭ · E♭ · F · G♭ · A♭ · B♭ · C · D♭',     acids:'Si♭ · Mi♭ · Lá♭ · Ré♭ · Sol♭',  louvor:'Avançada',       detail:'Nova nota: Sol♭. Enarmônica de Dó# (7#). Grave-se para verificar cada nota.' },
  { key:'Gb', name:'Sol♭', circuit:'fourths',info:'G♭ Maior (6♭)',notes:'Sol♭ · Lá♭ · Si♭ · Dó♭ · Ré♭ · Mi♭ · Fá · Sol♭',  cipher:'G♭ · A♭ · B♭ · C♭ · D♭ · E♭ · F · G♭',   acids:'Si♭ · Mi♭ · Lá♭ · Ré♭ · Sol♭ · Dó♭', louvor:'Avançada', detail:'Nova nota: Dó♭ (=Si). Seis bemóis — enarmônica de Fá#.' },
  { key:'Cb', name:'Dó♭',  circuit:'fourths',info:'C♭ Maior (7♭)',notes:'Dó♭ · Ré♭ · Mi♭ · Fá♭ · Sol♭ · Lá♭ · Si♭♭ · Dó♭', cipher:'C♭ · D♭ · E♭ · F♭ · G♭ · A♭ · B♭♭ · C♭', acids:'Si♭ · Mi♭ · Lá♭ · Ré♭ · Sol♭ · Dó♭ · Fá♭', louvor:'Raramente usada', detail:'Sete bemóis — enarmônica de Si Maior. Estudo avançado.' },
];
