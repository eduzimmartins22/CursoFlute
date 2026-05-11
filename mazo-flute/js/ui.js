/* =============================================
   ui.js — Renderização e controle de páginas.
   Responsável por TODO o DOM dinâmico.
   ============================================= */

'use strict';

const UI = (() => {

  // ── Inicialização por papel ───────────────────

  async function initStudent(user) {
    _setHeader(user);
    _buildStudentNav();
    await _buildAllPages(user);
    goPage('inicio');
    Timer.init();
  }

  async function initProfessor(user) {
    _setHeader(user);
    _buildProfessorNav();
    await _buildProfessorPage();
    goPage('professor');
  }

  // ── Header ───────────────────────────────────

  function _setHeader(user) {
    const initials = user.name.substring(0, 2).toUpperCase();
    document.getElementById('hAvatar').textContent = initials;
    document.getElementById('hName').textContent   = user.name;
    document.getElementById('hRole').textContent   =
      user.role === 'professor' ? '🎓 Professor' : '🎵 Aluno';
  }

  // ── Navs ─────────────────────────────────────

  function _buildStudentNav() {
    const nav = document.getElementById('navBar');
    const tabs = [
      { page: 'inicio',    label: '🏠 Início'       },
      { page: 'jornada',   label: '📅 Jornada'      },
      { page: 'tecnicas',  label: '🎯 Técnicas'     },
      { page: 'escalas',   label: '🎼 Escalas'      },
      { page: 'louvor',    label: '✨ Louvor'        },
      { page: 'downloads', label: '📥 Downloads'    },
      { page: 'timer',     label: '⏱️ Timer'        },
    ];
    nav.innerHTML = tabs.map(t =>
      `<button class="nav-tab" data-page="${t.page}" onclick="UI.goPage('${t.page}')">${t.label}</button>`
    ).join('');
  }

  function _buildProfessorNav() {
    const nav = document.getElementById('navBar');
    nav.innerHTML = `<button class="nav-tab active" data-page="professor" onclick="UI.goPage('professor')">🎓 Painel do Professor</button>`;
  }

  // ── Page switching ────────────────────────────

  function goPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.page === pageName);
    });
    const target = document.getElementById(`page-${pageName}`);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
  }

  // ── Build all student pages ───────────────────

  async function _buildAllPages(user) {
    const container = document.getElementById('pagesContainer');
    container.innerHTML =
      _tplPageInicio(user)   +
      _tplPageJornada(user)  +
      _tplPageTecnicas()     +
      _tplPageEscalas()      +
      _tplPageLouvor()       +
      _tplPageDownloads()    +
      _tplPageTimer();

    // Hidrate componentes dinâmicos
    await _hydrateInicio(user);
    await _hydrateMiniTimeline(user);
    await _hydrateMonthsGrid(user);
    await _hydrateScales();
  }

  // ── Refresh público (chamado por outros módulos) ──

  function refreshStreakDisplay(streak) {
    const el = document.getElementById('cardStreak');
    if (el) el.textContent = streak + ' dias';
  }

  // ══════════════════════════════════════════════
  //   TEMPLATES DE PÁGINA
  // ══════════════════════════════════════════════

  function _tplPageInicio(user) {
    return `
    <div id="page-inicio" class="page">
      <div class="hero-block">
        <h1>Bem-vindo, ${user.name}! 🎵</h1>
        <p>Acompanhe sua evolução mês a mês. Teoria · Prática · Constância — os três pilares de Marcel Moyse.</p>
      </div>
      <div class="sec-title">📊 Seu Progresso</div>
      <div class="cards-grid">
        <div class="card">
          <div class="card-ico">📅</div>
          <h3>Módulo Atual</h3>
          <p id="cardMesAtual" class="card-stat">—</p>
        </div>
        <div class="card">
          <div class="card-ico">🔥</div>
          <h3>Sequência de Prática</h3>
          <p id="cardStreak" class="card-stat card-stat--gold">0 dias</p>
        </div>
        <div class="card">
          <div class="card-ico">✅</div>
          <h3>Módulos Concluídos</h3>
          <p id="cardConcluidos" class="card-stat">0 / ${MONTHS_DATA.length}</p>
        </div>
      </div>
      <div class="sec-title">🗺️ Trilha do Curso</div>
      <div class="cbox">
        <div class="timeline-wrap" id="miniTimeline"></div>
      </div>
      <div class="sec-title">🎯 Comece por Aqui</div>
      <div class="cards-grid">
        <div class="card" onclick="UI.goPage('jornada')">
          <div class="card-ico">📅</div>
          <h3>Minha Jornada</h3>
          <p>Acesse o conteúdo do seu módulo atual e marque seus objetivos.</p>
        </div>
        <div class="card" onclick="UI.goPage('tecnicas')">
          <div class="card-ico">💨</div>
          <h3>Técnicas Essenciais</h3>
          <p>Posicionamento, embocadura, respiração e dedilhado.</p>
        </div>
        <div class="card" onclick="UI.goPage('escalas')">
          <div class="card-ico">🎼</div>
          <h3>Escalas Maiores</h3>
          <p>Escalas reais e cifradas — Si♭ é a mais usada no louvor!</p>
        </div>
      </div>
    </div>`;
  }

  function _tplPageJornada(user) {
    return `
    <div id="page-jornada" class="page">
      <div id="jornadaGrid">
        <div class="sec-title">📅 Minha Jornada Mensal</div>
        <p style="color:var(--muted);font-size:.9rem;margin-bottom:1.75rem">
          Cada mês tem conteúdo específico definido pelo seu professor.
          Clique no seu mês atual para ver os objetivos e marcar o progresso.
        </p>
        <div class="months-grid" id="monthsGrid"></div>
        <div class="cbox">
          <h4>Como funciona?</h4>
          <p>O curso tem <strong>10 meses de conteúdo progressivo</strong> baseado nos três pilares:
          <strong>Teoria</strong> (Marcel Moyse, partitura), <strong>Prática</strong>
          (escalas, mecânica, notas longas) e <strong>Constância</strong> (prática diária, gravações).</p>
          <p>Seu professor avança seu módulo quando identifica que você está pronto para o próximo nível.</p>
          <div class="tip">💡 Revise os meses anteriores quando quiser — mas o foco é sempre no mês atual.</div>
        </div>
      </div>
      <div id="monthDetail" style="display:none">
        <button class="back-btn" onclick="UI.closeMonthDetail()">← Voltar à Jornada</button>
        <div id="monthDetailContent"></div>
      </div>
    </div>`;
  }

  function _tplPageTecnicas() {
    // Baseado no PDF: Posições (p.6-7), Embocadura (p.7), Notas Longas (p.10), Mecânica (p.12)
    return `
    <div id="page-tecnicas" class="page">
      <div class="sec-title">🎯 Técnicas Fundamentais</div>
      <div class="cbox">
        <h4>1. Posicionamento e Postura</h4>
        <p>A postura define 40% da qualidade do som. Uma posição errada gera tensão, fadiga e limita o crescimento técnico. <strong>Certifique-se que seus dedos encaixam nas chaves circulares</strong> — não soltos despojadamente.</p>
        <ul>
          <li>Flauta paralela ao chão, apoiada no queixo (não na boca)</li>
          <li>Ombros relaxados, cotovelo levemente afastado do corpo</li>
          <li>Os dedos repousam firmemente sobre as chaves circulares</li>
          <li>O queixo acompanha suavemente a direção do tubo</li>
          <li><strong>Evitar:</strong> postura corcunda, cabeça baixa, pernas cruzadas — prejudicam o percurso do ar no diafragma</li>
        </ul>
        <div class="tip">💡 A postura também influencia no som: quanto mais pressão no diafragma, pior o percurso do ar no corpo.</div>
      </div>
      <div class="cbox">
        <h4>2. Embocadura — Produção de Som</h4>
        <p>Tirar som na flauta é o primeiro grande desafio. Encaixar a embocadura é complicado e exige atenção — <strong>todo o som depende do posicionamento e da variação que você faz com a boca</strong> em relação ao instrumento.</p>
        <ul>
          <li>Posicione a flauta no meio do lábio inferior</li>
          <li>Aproximadamente 1/4 da embocadura fica dentro da boca</li>
          <li>Os lábios formam um "o" natural, sem tensão</li>
          <li>O ar sai de forma concentrada e constante</li>
        </ul>
        <div class="tip">💡 Teste: faça um som "psiu" muito suave. Esse é exatamente o ar que deve entrar na flauta.</div>
      </div>
      <div class="cbox">
        <h4>3. Respiração Diafragmática</h4>
        <p>Respirar com o diafragma (não com o peito) permite maior controle de ar, frases mais longas e sonoridade melhor. É 50% do seu sucesso.</p>
        <ul>
          <li>Coloque uma mão na barriga, outra no peito</li>
          <li>Inspire pelo nariz, deixando o abdômen se expandir (peito imóvel)</li>
          <li>Expire lentamente em 4 tempos</li>
          <li>Repita 10 vezes antes de tocar, relaxando progressivamente</li>
        </ul>
        <div class="tip">💡 5 minutos de respiração antes de tocar. Faça isso todos os dias.</div>
      </div>
      <div class="cbox">
        <h4>4. Notas Longas — Exercício de Moyse</h4>
        <p>O estudo de notas longas é fundamental para o desenvolvimento técnico e musical. Esse exercício contribui diretamente para o controle da respiração, a estabilidade do som e a construção de uma sonoridade rica e consistente.</p>
        <p>Trabalhar notas longas ajuda a desenvolver: consciência corporal, apoio adequado do ar, percepção da qualidade sonora — timbre, afinação e projeção.</p>
        <ul>
          <li>Pratique notas longas <strong>todos os dias</strong> — 30 min de controle de som</li>
          <li>Se tiver dificuldade com a partitura: escreva, desenhe, cantarole a nota antes de tocar</li>
          <li>Use o app de escalas para memorizar melhor as notas</li>
          <li>Escale o exercício: comece na 1ª oitava, progrida para 2ª e 3ª</li>
        </ul>
        <div class="tip">💡 Referência obrigatória: "De la Sonorite" de Marcel Moyse — o livro de notas longas mais famoso para flauta.</div>
      </div>
      <div class="cbox">
        <h4>5. Mecânica — Arpejos e Velocidade</h4>
        <p>Para mecânica, focamos em arpejos e o sentido de cada frase. Pensando no compasso composto 6/8, conte como 2/2: (1,2,3 — 4,5,6).</p>
        <ul>
          <li>Isole cada frase na partitura e treine isoladamente</li>
          <li>Depois progrida, evolua a velocidade com o metrônomo</li>
          <li>Passe da velocidade normal do louvor só para garantir</li>
          <li><strong>Atenção à afinação</strong> nas notas super agudas: Mi, Fá# e Dó</li>
          <li>30 min diários de mecânica — arpejos com variações de BPM</li>
        </ul>
        <div class="tip">💡 A chave não é ficar 10 horas estudando massivamente — é estudar com concentração e atenção aos detalhes, com constância.</div>
      </div>
      <div class="cbox">
        <h4>6. Afinação, Projeção e Qualidade Sonora</h4>
        <ul>
          <li><strong>Afinação:</strong> Use SoundCorset ou afinador de referência. Compare com gravações.</li>
          <li><strong>Projeção:</strong> Pratique em ambientes maiores — o som deve "chegar" ao fundo da sala.</li>
          <li><strong>Timbre:</strong> Escute referências — Altamiro Carrilho, concertos de flauta clássica.</li>
          <li><strong>Gravações:</strong> Grave, ouça, compare. A gravação te ajuda a ser seu próprio professor.</li>
        </ul>
        <div class="tip">💡 GRAVAR te possibilita fazer uma análise: compare "primeira vista" vs "após estudo" — notará diferenças enormes.</div>
      </div>
      <div class="cbox">
        <h4>📱 Ferramentas Recomendadas</h4>
        <ul>
          <li><strong>SoundCorset</strong> — afinação em tempo real</li>
          <li><strong>Gravador de voz</strong> (nativo do celular) — registre todas as sessões</li>
          <li><strong>App Jogo das Escalas</strong> — disponível no Android e iOS (link na seção Downloads)</li>
          <li><strong>Metrônomo</strong> — qualquer app de metrônomo funciona</li>
          <li><strong>YouTube</strong> — acompanhe os louvores e pratique junto</li>
        </ul>
      </div>
    </div>`;
  }

  function _tplPageEscalas() {
    return `
    <div id="page-escalas" class="page">

      <div class="sec-title">🎼 Escalas & Circuitos</div>

      <div class="cbox">
        <p>As escalas são a base de todo técnico musical. Quando o maestro diz
        <em>"A música é em Si♭"</em> e vem aquele <em>"Vai, flauta!!"</em> — você precisa reagir imediatamente.</p>
        <div class="tip">💡 <strong>Comece por Dó Maior</strong> — sem acidentes. Domine completamente antes de passar à próxima. <strong>Si♭ é a mais importante para o louvor!</strong></div>
      </div>

      <!-- Tabs dos circuitos -->
      <div class="circuit-tabs">
        <button class="circuit-tab active" onclick="UI.switchCircuit('fifths', this)">
          🔺 Circuito das Quintas (#)
        </button>
        <button class="circuit-tab" onclick="UI.switchCircuit('fourths', this)">
          🔻 Circuito das Quartas (♭)
        </button>
      </div>

      <!-- Explicação do circuito ativo -->
      <div id="circuitExplainer" class="cbox"></div>

      <!-- Grade de escalas do circuito ativo -->
      <div class="scales-grid" id="scalesGrid"></div>

      <!-- Detalhe da escala clicada -->
      <div id="scaleDetail"></div>

    </div>`;
  }

  function _tplPageLouvor() {
    return `
    <div id="page-louvor" class="page">
      <div class="sec-title">✨ Repertório de Louvor</div>
      <div class="cbox">
        <h4>Tocando Louvor com Excelência</h4>
        <p>O louvor exige sensibilidade, entendimento harmônico e expressão emocional profunda. A flauta é um instrumento de oração — cada nota deve carregar intenção espiritual.</p>
        <div class="tip">💡 "Toque como se estivesse rezando. A música é conversa com o divino." — Altamiro Carrilho</div>
      </div>
      <div class="cbox">
        <h4>Hinos por Tonalidade</h4>
        <ul>
          <li><strong>Si♭ Maior (mais comum):</strong> "Graça Maravilhosa", "Que Glória"</li>
          <li><strong>Sol Maior:</strong> "Deus é Fiel", "Vou Viver por Jesus"</li>
          <li><strong>Fá Maior:</strong> "Tu és Digno", "Ressurreição"</li>
          <li><strong>Mi♭ Maior:</strong> "Santo, Santo", "Senhor, Vem"</li>
        </ul>
      </div>
      <div class="cbox">
        <h4>Dicas de Expressão no Louvor</h4>
        <p><strong>1. Vibrato:</strong> Use em notas longas para adicionar alma à melodia.</p>
        <p><strong>2. Respiração:</strong> Faça pequenas respirações entre frases para manter o fluxo.</p>
        <p><strong>3. Dinâmica:</strong> Crescendos sutis em momentos climáticos. Reduza em momentos contemplativos.</p>
        <p><strong>4. Pulso interno:</strong> Para tocar é essencial ouvir, processar e compreender o tempo e a base rítmica. Sincronize com a bateria.</p>
        <div class="tip">💡 Acompanhe o louvor no YouTube e pratique junto com o metrônomo para entender as pausas e o quanto tempo cada figura significa.</div>
      </div>
      <div class="cbox">
        <h4>Prova de Março — 1º Semestre</h4>
        <ul>
          <li>Ao menos 2 louvores completos com boa fluidez</li>
          <li>Demonstrar controle das oitavas trabalhadas</li>
          <li>Avaliação de embocadura, postura e sonoridade</li>
        </ul>
        <div class="tip">💡 Escolha louvores que você já conhece musicalmente — isso libera o foco para a técnica.</div>
      </div>
      <div class="cbox">
        <h4>Prova de Agosto — 2º Semestre</h4>
        <ul>
          <li>Prova 1: Louvores com partitura (fluência e expressão)</li>
          <li>Prova 2: Leitura de louvor à primeira vista</li>
          <li>Prova 3: Trecho de peça erudita — Bach, Mozart ou Patápio Silva</li>
        </ul>
      </div>
      <div class="cbox">
        <h4>🎬 Projeto Final — Novembro/Dezembro</h4>
        <p>Gravação de um louvor em dupla com o professor, integrando todos os conteúdos treinados no ano: técnica, partitura, harmonia e expressão.</p>
        <div class="tip">💡 Compare sua gravação final com a do início do curso — você vai se surpreender com o quanto evoluiu.</div>
      </div>
    </div>`;
  }

  function _tplPageDownloads() {
    const items = [
      { ico:'📄', title:'Guia Completo de Posicionamento',    desc:'PDF com fotos e diagramas de postura, mão e dedilhado — dedos nas chaves circulares.',        key:'posicionamento' },
      { ico:'🎼', title:'Partituras de Escalas Maiores',       desc:'Todas as escalas maiores em 3 oitavas. Treino com app Jogo das Escalas.',                       key:'escalas' },
      { ico:'🎵', title:'Notas Longas — Marcel Moyse',         desc:'Exercícios fundamentais de notas longas para controle de sonoridade, timbre e afinação.',       key:'moyse' },
      { ico:'⏸️', title:'Estudo de Pausas — "Clamo a Ti"',     desc:'Partitura de flauta com compasso 4/4, pausas e ritmos marcados. Jorge Corbage Filho.',          key:'pausas' },
      { ico:'⚙️', title:'Mecânica — "Rejubila"',               desc:'Partitura de mecânica em 6/8. Arpejos com variações de BPM. Foco em afinação nos agudos.',      key:'mecanica' },
      { ico:'📖', title:'Introdução à Partitura (Módulo Jun)', desc:'Apostila de leitura: clave de sol, figuras de duração, compasso 4/4 e 3/4.',                     key:'partitura1' },
      { ico:'📚', title:'Partitura II (Módulo Jul)',            desc:'Acidentes, dinâmica, leitura à primeira vista, compasso 6/8.',                                   key:'partitura2' },
      { ico:'🎻', title:'Peças Clássicas — Bach & Mozart',     desc:'Trechos para flauta: Bach, Mozart e Patápio Silva. Para o 2º semestre.',                         key:'classicas' },
      { ico:'🎶', title:'Projeto de Harmonia — Trio',          desc:'Material do projeto de harmonia em 3 flautas — Setembro e Outubro.',                             key:'trio' },
      { ico:'📋', title:'Plano de Prática Semanal',            desc:'Roteiro para 30 min diários: escalas (app) + notas longas + mecânica + peça preferida.',        key:'plano' },
    ];
    const cards = items.map(i => `
      <div class="dl-card">
        <div class="dl-ico">${i.ico}</div>
        <div class="dl-title">${i.title}</div>
        <div class="dl-desc">${i.desc}</div>
        <button class="dl-btn" onclick="UI.alertPDF('${i.key}')">Baixar PDF</button>
      </div>`).join('');

    return `
    <div id="page-downloads" class="page">
      <div class="sec-title">📥 Materiais</div>
      <p style="color:var(--muted);font-size:.9rem;margin-bottom:1.75rem">
        PDFs, partituras e exercícios. Acesso exclusivo para alunos.
      </p>
      <div class="dl-grid">${cards}</div>
      <div style="margin-top:2rem;padding:1.5rem;background:rgba(201,169,110,0.08);border-radius:var(--radius);text-align:center;border:1px solid var(--border)">
        <p style="font-weight:600;color:var(--navy)">📱 App Jogo das Escalas</p>
        <p style="font-size:.85rem;color:var(--muted);margin-top:6px">
          Disponível para Android e iOS. Use para treinar escalas no caminho para a escola, faculdade ou em casa.
        </p>
      </div>
    </div>`;
  }

  function _tplPageTimer() {
    return `
    <div id="page-timer" class="page">
      <div class="sec-title">⏱️ Timer de Prática</div>
      <div class="timer-block">
        <div class="timer-display" id="timerDisplay">30:00</div>
        <div class="timer-presets">
          <button class="preset-btn" onclick="Timer.setPreset(5)">5 min</button>
          <button class="preset-btn" onclick="Timer.setPreset(15)">15 min</button>
          <button class="preset-btn" onclick="Timer.setPreset(30)">30 min</button>
          <button class="preset-btn" onclick="Timer.setPreset(45)">45 min</button>
          <button class="preset-btn" onclick="Timer.setPreset(60)">60 min</button>
        </div>
        <button class="ctrl-btn" id="timerToggleBtn" onclick="Timer.toggle()">▶ Iniciar</button>
        <button class="ctrl-btn ctrl-btn--secondary" onclick="Timer.reset()">🔄 Resetar</button>
      </div>
      <div class="cbox">
        <h4>Rotina Diária Recomendada (2h)</h4>
        <ul>
          <li><strong>30 min</strong> — Escalas com o app Jogo das Escalas</li>
          <li><strong>30 min</strong> — Controle de som: notas longas, escalas cromáticas</li>
          <li><strong>30 min</strong> — Mecânica: arpejos com variações de BPM</li>
          <li><strong>30 min</strong> — Peça de sua preferência (Tico-tico no Fubá, Bach Allemande, Deep Blue — Ian Clarke)</li>
        </ul>
        <div class="tip">💡 Treine todos os dias, mesmo que seja apenas 1 hora. Constância supera intensidade.</div>
      </div>
      <div class="sec-title" style="margin-top:2rem">📝 Checklist de Hoje</div>
      <div class="cbox">
        <ul class="day-checklist" id="dayChecklist">
          <li><input type="checkbox" id="dc1" onchange="UI.checkDay()"><span>Sons longos e aquecimento (5 min)</span></li>
          <li><input type="checkbox" id="dc2" onchange="UI.checkDay()"><span>Exercícios de respiração diafragmática</span></li>
          <li><input type="checkbox" id="dc3" onchange="UI.checkDay()"><span>Escalas do módulo atual (app)</span></li>
          <li><input type="checkbox" id="dc4" onchange="UI.checkDay()"><span>Louvor ou peça da semana</span></li>
        </ul>
      </div>
    </div>`;
  }

  // ══════════════════════════════════════════════
  //   HYDRATION — injeta dados nos templates
  // ══════════════════════════════════════════════

  async function _hydrateInicio(user) {
    const mIdx   = await Storage.getStudentMonth(user.email);
    const m      = MONTHS_DATA[mIdx];
    const streak = await Storage.getStreak(user.email);

    document.getElementById('cardMesAtual').textContent  = `${m.emoji} ${m.name} — ${m.tag}`;
    document.getElementById('cardStreak').textContent    = `${streak} dias`;
    document.getElementById('cardConcluidos').textContent = `${mIdx} / ${MONTHS_DATA.length}`;
  }

  async function _hydrateMiniTimeline(user) {
    const mIdx = await Storage.getStudentMonth(user.email);
    const tl   = document.getElementById('miniTimeline');
    if (!tl) return;
    tl.innerHTML = MONTHS_DATA.map((m, i) => {
      const cls = i < mIdx ? 'done' : i === mIdx ? 'current' : '';
      const statusLabel = i < mIdx ? '✓ Concluído' : i === mIdx ? '● Em andamento' : '○ Em breve';
      const statusCls   = i < mIdx ? 'done' : i === mIdx ? 'current' : 'upcoming';
      return `
      <div class="tl-item ${cls}">
        <div class="tl-dot">${m.emoji}</div>
        <div class="tl-body">
          <div class="tl-month">${m.name}</div>
          <h3>${m.tag}</h3>
          <p>${m.desc}</p>
          <span class="tl-status ${statusCls}">${statusLabel}</span>
        </div>
      </div>`;
    }).join('');
  }

  async function _hydrateMonthsGrid(user) {
    const mIdx = await Storage.getStudentMonth(user.email);
    const grid = document.getElementById('monthsGrid');
    if (!grid) return;
    grid.innerHTML = MONTHS_DATA.map((m, i) => {
      const isDone    = i < mIdx;
      const isCurrent = i === mIdx;
      const isLocked  = i > mIdx;
      const cls = [isDone?'done':'', isCurrent?'current':'', isLocked?'locked':''].filter(Boolean).join(' ');
      const badge = isCurrent
        ? `<span class="badge badge--gold mc-badge">Atual</span>`
        : isDone
        ? `<span class="badge badge--success mc-badge">✓</span>`
        : '';
      const click = !isLocked ? `onclick="UI.openMonthDetail(${i})"` : '';
      return `
      <div class="month-card ${cls}" ${click}>
        ${badge}
        <div class="mc-num">${m.num}</div>
        <div class="mc-name">${m.name}</div>
        <div class="mc-tag">${m.tag}</div>
      </div>`;
    }).join('');
  }

  let _activeCircuit = 'fifths';

  async function _hydrateScales() {
    switchCircuit('fifths', document.querySelector('.circuit-tab'));
  }

  // ── Escalas ───────────────────────────────────

  async function switchCircuit(circuit, tabEl) {
    _activeCircuit = circuit;

    // Atualizar tabs
    document.querySelectorAll('.circuit-tab').forEach(t => t.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');

    // Limpar detalhe
    const detail = document.getElementById('scaleDetail');
    if (detail) detail.innerHTML = '';

    // Explainer do circuito
    const explainer = document.getElementById('circuitExplainer');
    if (circuit === 'fifths') {
      explainer.innerHTML = `
        <h4>🔺 Circuito das Quintas — Sustenidos (#)</h4>
        <p>A <strong>5ª nota</strong> da escala atual se torna a <strong>1ª nota</strong> da próxima.
        A cada nova escala, <strong>a última nota é sustenida</strong> (exceto Dó Maior).</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:.75rem">
          ${CIRCLE_OF_FIFTHS.map((c,i) => `
            <div style="display:flex;align-items:center;gap:4px">
              <span style="background:var(--navy);color:var(--gold2);padding:3px 10px;border-radius:20px;font-size:.8rem;font-weight:600">${c.name}</span>
              ${i < CIRCLE_OF_FIFTHS.length-1 ? '<span style="color:var(--muted);font-size:.8rem">→ quinta ↗</span>' : ''}
            </div>`).join('')}
        </div>`;
    } else {
      explainer.innerHTML = `
        <h4>🔻 Circuito das Quartas — Bemóis (♭)</h4>
        <p>A <strong>4ª nota</strong> da escala atual se torna a <strong>1ª nota</strong> da próxima.
        A cada nova escala, <strong>a 4ª nota é bemolizada</strong>.</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:.75rem">
          ${CIRCLE_OF_FOURTHS.map((c,i) => `
            <div style="display:flex;align-items:center;gap:4px">
              <span style="background:var(--navy3);color:var(--gold2);padding:3px 10px;border-radius:20px;font-size:.8rem;font-weight:600">${c.name}</span>
              ${i < CIRCLE_OF_FOURTHS.length-1 ? '<span style="color:var(--muted);font-size:.8rem">→ quarta ↘</span>' : ''}
            </div>`).join('')}
        </div>`;
    }

    // Renderizar grade do circuito ativo
    const grid = document.getElementById('scalesGrid');
    if (!grid) return;
    const filtered = SCALES_DATA.filter(s => s.circuit === circuit);
    grid.innerHTML = filtered.map((s, i) => {
      const accent = circuit === 'fifths'
        ? `${s.sharps !== '—' ? s.sharps : 'Natural'}`
        : `${s.flats}`;
      const stepLabel = circuit === 'fifths'
        ? (i === 0 ? 'Início' : `${i * 7}ª pos.`)
        : (i === 0 ? 'Início' : `${i * 5}ª pos.`);
      return `
      <div class="scale-box" onclick="UI.showScale('${s.key}', this)" data-circuit="${circuit}">
        <div class="sc-step">${stepLabel}</div>
        <div class="sc-name">${s.name}</div>
        <div class="sc-info">${circuit === 'fifths' ? (s.sharps === '—' ? '0 #' : s.sharps.split(' · ').length + '#') : s.flats.split(' · ').length + '♭'}</div>
      </div>`;
    }).join('');
  }

  function showScale(key, el) {
    const s = SCALES_DATA.find(x => x.key === key);
    if (!s) return;
    document.querySelectorAll('.scale-box').forEach(b => b.classList.remove('active'));
    el.classList.add('active');

    const acidentsLabel = s.circuit === 'fifths'
      ? `Sustenidos: <strong>${s.sharps}</strong>`
      : `Bemóis: <strong>${s.flats}</strong>`;

    // Build note row with highlights
    const notesCells = s.cipher.split(' · ').map((n, i) => {
      const isAccident = (s.circuit === 'fifths' && n.includes('#')) ||
                         (s.circuit === 'fourths' && n.includes('♭'));
      return `<span style="
        display:inline-block;padding:5px 10px;margin:2px;border-radius:8px;
        background:${isAccident ? 'var(--gold)' : 'var(--cream2)'};
        color:${isAccident ? 'var(--navy)' : 'var(--text)'};
        font-weight:${isAccident ? '700' : '500'};font-size:.9rem">${n}</span>`;
    }).join('');

    const detail = document.getElementById('scaleDetail');
    detail.innerHTML = `
      <div class="cbox">
        <h4>${s.name} — ${s.info}</h4>
        <p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem">${acidentsLabel}</p>
        <div style="margin-bottom:1rem">${notesCells}</div>
        <p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem">
          <strong>Notas reais:</strong> ${s.notes}
        </p>
        <p>${s.detail}</p>
        <div class="tip">🙏 <strong>No Louvor:</strong> ${s.louvor}</div>
      </div>`;
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── Month Detail ──────────────────────────────

  async function openMonthDetail(idx) {
    const m       = MONTHS_DATA[idx];
    const user    = Auth.getCurrentUser();
    const mIdx    = await Storage.getStudentMonth(user.email);
    const saved   = await Storage.getChecklist(user.email, idx);
    const isDone  = idx < mIdx;
    const isCurr  = idx === mIdx;

    const doneCount = Object.values(saved).filter(v => v).length;
    const total     = m.objectives.length;
    const pct       = total > 0 ? Math.round(doneCount / total * 100) : 0;

    const statusHtml = isDone
      ? `<span class="badge badge--success" style="margin-bottom:1rem">✓ Módulo concluído</span>`
      : isCurr
      ? `<span class="badge badge--warn" style="margin-bottom:1rem">● Módulo atual</span>`
      : '';

    const objHtml = m.objectives.map((o, j) => {
      const checked = saved[j] || false;
      return `
      <li class="${checked ? 'done-item' : ''}">
        <input type="checkbox" ${checked ? 'checked' : ''}
          onchange="UI.toggleCheck(${idx}, ${j}, this)">
        <span>${o}</span>
      </li>`;
    }).join('');

    // Botão de solicitação — só aparece no módulo atual, 100% completo e ainda sem pedido pendente
    const alreadyRequested = isCurr && await Storage.hasAdvanceRequest(user.email);
    const canRequest       = isCurr && pct === 100 && idx < MONTHS_DATA.length - 1;
    const requestBlock = canRequest
      ? alreadyRequested
        ? `<div class="request-pending-block">
             ⏳ Solicitação de avanço enviada ao professor. Aguarde a aprovação.
           </div>`
        : `<button class="request-advance-btn" onclick="UI.requestAdvance(${idx})">
             📩 Solicitar avanço ao professor
           </button>`
      : '';

    document.getElementById('monthDetailContent').innerHTML = `
      <div class="month-hero" data-num="${m.num}">
        <div class="month-hero-badge">${m.name} · ${m.tag} · ${m.pillar}</div>
        <h2>${m.emoji} ${m.tag}</h2>
        <p>${m.fullDesc}</p>
      </div>
      ${statusHtml}
      <div class="cbox">
        <h4>Objetivos do Módulo</h4>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" id="detailProgress" style="width:${pct}%"></div>
        </div>
        <p class="progress-label" id="detailProgressLabel">${doneCount} de ${total} objetivos (${pct}%)</p>
        <ul class="month-checklist">${objHtml}</ul>
      </div>
      <div class="cbox">
        <h4>💡 Dica do Mês</h4>
        <div class="tip">${m.tip}</div>
      </div>
      <div class="cbox" style="border-left:3px solid var(--gold)">
        <h4>📖 Base Teórica</h4>
        <p style="font-size:.82rem;color:var(--muted)">${m.pdfRef}</p>
      </div>
      ${requestBlock}`;

    document.getElementById('jornadaGrid').style.display  = 'none';
    document.getElementById('monthDetail').style.display  = 'block';
  }

  function closeMonthDetail() {
    document.getElementById('monthDetail').style.display  = 'none';
    document.getElementById('jornadaGrid').style.display  = 'block';
  }

  async function toggleCheck(monthIdx, objIdx, el) {
    const user  = Auth.getCurrentUser();
    const saved = await Storage.setChecklistItem(user.email, monthIdx, objIdx, el.checked);

    // Atualizar classe do item
    el.closest('li').className = el.checked ? 'done-item' : '';

    // Recalcular barra de progresso
    const total     = MONTHS_DATA[monthIdx].objectives.length;
    const doneCount = Object.values(saved).filter(v => v).length;
    const pct       = Math.round(doneCount / total * 100);
    const fill  = document.getElementById('detailProgress');
    const label = document.getElementById('detailProgressLabel');
    if (fill)  fill.style.width  = `${pct}%`;
    if (label) label.textContent = `${doneCount} de ${total} objetivos (${pct}%)`;

    // Quando atingir 100%, exibir o botão de solicitação ao professor
    const currIdx = await Storage.getStudentMonth(user.email);
    if (pct === 100 && monthIdx === currIdx && monthIdx < MONTHS_DATA.length - 1) {
      const existing = document.querySelector('.request-advance-btn, .request-pending-block');
      if (!existing) {
        const alreadyReq = await Storage.hasAdvanceRequest(user.email);
        const block = document.createElement('div');
        block.innerHTML = alreadyReq
          ? `<div class="request-pending-block">⏳ Solicitação de avanço enviada ao professor. Aguarde a aprovação.</div>`
          : `<button class="request-advance-btn" onclick="UI.requestAdvance(${monthIdx})">📩 Solicitar avanço ao professor</button>`;
        document.getElementById('monthDetailContent').appendChild(block.firstElementChild);
      }
    }
  }

  async function requestAdvance(monthIdx) {
    const user = Auth.getCurrentUser();
    await Storage.requestAdvance(user.email, user.name, monthIdx);

    // Trocar botão pelo aviso de pendente
    const btn = document.querySelector('.request-advance-btn');
    if (btn) {
      const pending = document.createElement('div');
      pending.className = 'request-pending-block';
      pending.textContent = '⏳ Solicitação enviada ao professor. Aguarde a aprovação.';
      btn.replaceWith(pending);
    }
  }

  // ── Checklist diário ─────────────────────────

  async function checkDay() {
    const all = ['dc1','dc2','dc3','dc4'].every(id => {
      const el = document.getElementById(id);
      return el && el.checked;
    });
    if (all) {
      const user   = Auth.getCurrentUser();
      const streak = await Storage.incrementStreak(user.email);
      refreshStreakDisplay(streak);
      alert(`🔥 Sessão completa! Parabéns!\nSequência: ${streak} dias.`);
    }
  }

  // ── Downloads ─────────────────────────────────

  function alertPDF(key) {
    const names = {
      posicionamento: 'Guia_Posicionamento_Flauta.pdf',
      escalas:        'Partituras_Escalas_Maiores.pdf',
      moyse:          'Notas_Longas_Marcel_Moyse.pdf',
      pausas:         'Pausas_Clamo_a_Ti.pdf',
      mecanica:       'Mecanica_Rejubila_6-8.pdf',
      partitura1:     'Introducao_Partitura_Junho.pdf',
      partitura2:     'Partitura_II_Julho.pdf',
      classicas:      'Pecas_Classicas_Bach_Mozart.pdf',
      trio:           'Projeto_Harmonia_Trio.pdf',
      plano:          'Plano_Pratica_Diaria.pdf',
    };
    alert(`📥 "${names[key] || key}" seria baixado aqui.\n\nPara ativar os downloads reais, hospede os PDFs no servidor e atualize os links no arquivo ui.js.`);
  }

  // ══════════════════════════════════════════════
  //   PROFESSOR PANEL
  // ══════════════════════════════════════════════

  async function _buildProfessorPage() {
    const container = document.getElementById('pagesContainer');
    container.innerHTML = _tplProfessorPage();
    await _hydrateProfessorPage();
  }

  function _tplProfessorPage() {
    return `
    <div id="page-professor" class="page">
      <div class="prof-header">
        <h2>Painel do Professor</h2>
        <p>Gerencie os alunos e módulos. Só você decide quem avança.</p>
      </div>

      <div class="prof-stats" id="profStats"></div>

      <!-- Solicitações de avanço pendentes -->
      <div id="advanceRequestsSection"></div>

      <!-- Cadastrar novo aluno -->
      <div class="sec-title">➕ Cadastrar Aluno</div>
      <div class="cbox">
        <div class="add-student-form">
          <div class="add-field">
            <label>Nome</label>
            <input type="text" id="newStudentName" placeholder="Nome completo">
          </div>
          <div class="add-field">
            <label>Email</label>
            <input type="email" id="newStudentEmail" placeholder="email@exemplo.com">
          </div>
          <div class="add-field">
            <label>Senha do aluno</label>
            <input type="text" id="newStudentPass" placeholder="ex: flauta2025">
          </div>
          <div class="add-field">
            <label>Módulo inicial</label>
            <select id="newStudentMonth" class="month-select">
              ${MONTHS_DATA.map((mo, i) => `<option value="${i}">${mo.name} — ${mo.tag}</option>`).join('')}
            </select>
          </div>
          <button class="save-row-btn" onclick="UI.addStudent()">Cadastrar</button>
        </div>
        <div class="tip" style="margin-top:1rem">🔑 Defina uma senha para cada aluno e compartilhe com ele após o cadastro.</div>
      </div>

      <!-- Tabela de alunos -->
      <div class="sec-title">👥 Alunos Cadastrados</div>
      <div class="cbox" style="padding:0;overflow:hidden">
        <table class="students-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Senha</th>
              <th>Módulo Atual</th>
              <th>Alterar Módulo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="studentsBody"></tbody>
        </table>
      </div>
    </div>`;
  }

  async function _hydrateProfessorPage() {
    const students = await Storage.getStudents();
    const requests = await Storage.getAdvanceRequests();
    const pendingCount = Object.keys(requests).length;

    // ── Stats ──
    const statsEl  = document.getElementById('profStats');
    const avgMonth = students.length > 0
      ? (students.reduce((s, a) => s + (a.monthIdx || 0), 0) / students.length).toFixed(1)
      : 0;
    const inFinal = students.filter(s => (s.monthIdx || 0) >= 9).length;
    statsEl.innerHTML = `
      <div class="prof-stat"><div class="prof-stat-num">${students.length}</div><div class="prof-stat-label">Alunos</div></div>
      <div class="prof-stat"><div class="prof-stat-num">${avgMonth}</div><div class="prof-stat-label">Módulo Médio</div></div>
      <div class="prof-stat"><div class="prof-stat-num">${inFinal}</div><div class="prof-stat-label">Projeto Final</div></div>
      <div class="prof-stat" style="${pendingCount > 0 ? 'border:2px solid var(--gold)' : ''}">
        <div class="prof-stat-num" style="color:${pendingCount > 0 ? 'var(--warn)' : 'var(--muted)'}">${pendingCount}</div>
        <div class="prof-stat-label">Solicitações</div>
      </div>`;

    // ── Solicitações pendentes ──
    const reqSection = document.getElementById('advanceRequestsSection');
    if (pendingCount > 0) {
      const reqCards = Object.entries(requests).map(([email, req]) => {
        const nextIdx = req.monthIdx + 1;
        const curr    = MONTHS_DATA[req.monthIdx];
        const next    = MONTHS_DATA[nextIdx];
        return `
        <div class="request-card">
          <div class="request-info">
            <div class="request-name">📩 ${req.name}</div>
            <div class="request-detail">
              Quer avançar de <strong>${curr.emoji} ${curr.name}</strong>
              para <strong>${next ? next.emoji + ' ' + next.name : '—'}</strong>
            </div>
          </div>
          <div class="request-actions">
            <button class="req-approve-btn" onclick="UI.approveAdvance('${email}', ${req.monthIdx})">✓ Aprovar</button>
            <button class="req-deny-btn"    onclick="UI.denyAdvance('${email}')">✗ Recusar</button>
          </div>
        </div>`;
      }).join('');
      reqSection.innerHTML = `
        <div class="sec-title" style="color:var(--warn)">⏳ Solicitações Pendentes</div>
        <div class="requests-list">${reqCards}</div>`;
    } else {
      reqSection.innerHTML = '';
    }

    // ── Tabela de alunos ──
    const tbody = document.getElementById('studentsBody');
    if (!students.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="ico">🎵</div><p>Nenhum aluno cadastrado ainda.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = students.map((s, rowIdx) => {
      const mIdx    = s.monthIdx ?? 0;
      const m       = MONTHS_DATA[mIdx];
      const hasPending = !!requests[s.email];
      const opts    = MONTHS_DATA.map((mo, i) =>
        `<option value="${i}" ${i === mIdx ? 'selected' : ''}>${mo.name} — ${mo.tag}</option>`
      ).join('');
      return `
      <tr>
        <td>
          <div class="student-name">
            ${hasPending ? '<span style="color:var(--warn);margin-right:4px">⏳</span>' : ''}
            ${s.name}
          </div>
          <div class="student-email">${s.email}</div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span id="passDisplay-${rowIdx}" style="font-size:.82rem;color:var(--muted);letter-spacing:.05em">${'•'.repeat((s.password||'').length || 6)}</span>
            <button onclick="UI.togglePassView(${rowIdx},'${s.email}')" style="background:none;border:none;cursor:pointer;font-size:.75rem;color:var(--gold3);font-family:var(--ff-body);font-weight:600">ver</button>
          </div>
        </td>
        <td><span class="badge badge--gold">${m.emoji} ${m.name}</span></td>
        <td>
          <select class="month-select" id="sel-${rowIdx}">
            ${opts}
          </select>
        </td>
        <td style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="save-row-btn" id="savebtn-${rowIdx}"
            onclick="UI.saveStudentMonth(${rowIdx}, '${s.email}')">Salvar</button>
          <button class="save-row-btn" style="background:rgba(192,57,43,0.1);color:var(--danger)"
            onclick="UI.removeStudent('${s.email}')">Remover</button>
        </td>
      </tr>`;
    }).join('');
  }

  async function saveStudentMonth(rowIdx, email) {
    const sel = document.getElementById(`sel-${rowIdx}`);
    const btn = document.getElementById(`savebtn-${rowIdx}`);
    if (!sel || !btn) return;
    const newIdx = parseInt(sel.value);
    await Storage.setStudentMonth(email, newIdx);
    // Se professor mudou manualmente, limpa qualquer solicitação pendente
    await Storage.clearAdvanceRequest(email);
    btn.textContent = '✓ Salvo!';
    btn.classList.add('saved');
    setTimeout(async () => {
      btn.textContent = 'Salvar';
      btn.classList.remove('saved');
      await _hydrateProfessorPage();
    }, 1600);
  }

  async function approveAdvance(email, currentMonthIdx) {
    const next = currentMonthIdx + 1;
    if (next >= MONTHS_DATA.length) return;
    await Storage.setStudentMonth(email, next);
    await Storage.clearAdvanceRequest(email);
    await _hydrateProfessorPage();
  }

  async function denyAdvance(email) {
    await Storage.clearAdvanceRequest(email);
    await _hydrateProfessorPage();
  }

  async function addStudent() {
    const nameEl  = document.getElementById('newStudentName');
    const emailEl = document.getElementById('newStudentEmail');
    const passEl  = document.getElementById('newStudentPass');
    const monthEl = document.getElementById('newStudentMonth');
    const name     = nameEl.value.trim();
    const email    = emailEl.value.trim().toLowerCase();
    const password = passEl.value.trim();
    const monthIdx = parseInt(monthEl.value);

    if (!name)                       { alert('Informe o nome do aluno.'); return; }
    if (!email || !email.includes('@')) { alert('Informe um email válido.'); return; }
    if (!password || password.length < 3) { alert('Defina uma senha com pelo menos 3 caracteres.'); return; }
    if (await Storage.findStudent(email))  { alert('Este email já está cadastrado.'); return; }

    await Storage.upsertStudent({ email, name, password, monthIdx });
    await Storage.setStudentMonth(email, monthIdx);

    nameEl.value  = '';
    emailEl.value = '';
    passEl.value  = '';
    monthEl.value = '0';

    await _hydrateProfessorPage();
  }

  async function removeStudent(email) {
    if (!confirm(`Remover o aluno "${email}"?\nO progresso dele será mantido caso seja recadastrado.`)) return;
    await Storage.removeStudent(email);
    await Storage.clearAdvanceRequest(email);
    await _hydrateProfessorPage();
  }

  // ── Toggle senha visível/oculta na tabela ────

  let _passVisible = {};

  function togglePassView(rowIdx, email) {
    const student = await Storage.findStudent(email);
    const el = document.getElementById(`passDisplay-${rowIdx}`);
    if (!el || !student) return;
    _passVisible[rowIdx] = !_passVisible[rowIdx];
    el.textContent = _passVisible[rowIdx]
      ? (student.password || '—')
      : '•'.repeat((student.password || '').length || 6);
  }

  // API pública
  return {
    goPage,
    initStudent,
    initProfessor,
    refreshStreakDisplay,
    showScale,
    switchCircuit,
    openMonthDetail,
    closeMonthDetail,
    toggleCheck,
    requestAdvance,
    checkDay,
    alertPDF,
    saveStudentMonth,
    approveAdvance,
    denyAdvance,
    addStudent,
    removeStudent,
    togglePassView,
  };

