/* student.js — toda a lógica e UI do aluno */

async function loadStudentPage(student) {
  buildStudentNav();
  await renderInicio(student);
}

// ── Nav ──────────────────────────────────────
function buildStudentNav() {
  document.getElementById('navBar').innerHTML = `
    <button class="nav-tab active" onclick="navTo('inicio',this)">🏠 Início</button>
    <button class="nav-tab" onclick="navTo('jornada',this)">📅 Jornada</button>
    <button class="nav-tab" onclick="navTo('tecnicas',this)">🎯 Técnicas</button>
    <button class="nav-tab" onclick="navTo('escalas',this)">🎼 Escalas</button>
    <button class="nav-tab" onclick="navTo('downloads',this)">📥 Downloads</button>
    <button class="nav-tab" onclick="navTo('timer',this)">⏱️ Timer</button>`;
}

function navTo(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');
  window.scrollTo(0,0);
}

// ── INÍCIO ───────────────────────────────────
async function renderInicio(student) {
  const mIdx   = student.monthIdx ?? 0;
  const m      = MONTHS_DATA[mIdx];
  const streak = await dbGetStreak(student.email);

  document.getElementById('pagesContainer').innerHTML =
    tplInicio(student, m, mIdx, streak) +
    tplJornada()   +
    tplTecnicas()  +
    tplEscalas()   +
    tplDownloads() +
    tplTimer();

  renderTimeline(mIdx);
  renderMonthsGrid(student, mIdx);
  renderScalesGrid('fifths');
  initTimer();
}

function tplInicio(student, m, mIdx, streak) {
  return `
  <div id="page-inicio" class="page active">
    <div class="hero-block">
      <h1>Bem-vindo, ${student.name}! 🎵</h1>
      <p>Teoria · Prática · Constância — os três pilares de Marcel Moyse.</p>
    </div>
    <div class="sec-title">📊 Seu Progresso</div>
    <div class="cards-grid">
      <div class="card">
        <div class="card-ico">📅</div><h3>Módulo Atual</h3>
        <p class="card-stat">${m.emoji} ${m.name} — ${m.tag}</p>
      </div>
      <div class="card">
        <div class="card-ico">🔥</div><h3>Sequência</h3>
        <p class="card-stat card-stat--gold" id="streakDisplay">${streak} dias</p>
      </div>
      <div class="card">
        <div class="card-ico">✅</div><h3>Concluídos</h3>
        <p class="card-stat">${mIdx} / ${MONTHS_DATA.length}</p>
      </div>
    </div>
    <div class="sec-title">🗺️ Trilha do Curso</div>
    <div class="cbox"><div id="timeline"></div></div>
  </div>
  </div>`;
}

// ── TIMELINE ─────────────────────────────────
function renderTimeline(mIdx) {
  const el = document.getElementById('timeline');
  if (!el) return;
  el.innerHTML = MONTHS_DATA.map((m, i) => {
    const cls    = i < mIdx ? 'done' : i === mIdx ? 'current' : '';
    const status = i < mIdx ? '✓ Concluído' : i === mIdx ? '● Em andamento' : '○ Em breve';
    const sCls   = i < mIdx ? 'done'        : i === mIdx ? 'current'        : 'upcoming';
    return `
    <div class="tl-item ${cls}">
      <div class="tl-dot">${m.emoji}</div>
      <div class="tl-body">
        <div class="tl-month">Nível ${i + 1}</div>
        <h3>${m.tag}</h3>
        <p>${m.desc}</p>
        <span class="tl-status ${sCls}">${status}</span>
      </div>
    </div>`;
  }).join('');
}

// ── JORNADA ──────────────────────────────────
function tplJornada() {
  return `
  <div id="page-jornada" class="page">
    <div id="jornadaGrid">
      <div class="sec-title">📅 Minha Jornada Mensal</div>
      <p style="color:var(--muted);font-size:.9rem;margin-bottom:1.75rem">
        Clique no seu mês atual para ver os objetivos. O professor avança seu módulo.
      </p>
      <div class="months-grid" id="monthsGrid"></div>
    </div>
    <div id="monthDetail" style="display:none">
      <button class="back-btn" onclick="closeMonthDetail()">← Voltar</button>
      <div id="monthDetailContent"></div>
    </div>
  </div>`;
}

function renderMonthsGrid(student, mIdx) {
  const grid = document.getElementById('monthsGrid');
  if (!grid) return;
  grid.innerHTML = MONTHS_DATA.map((m, i) => {
    const isDone    = i < mIdx;
    const isCurrent = i === mIdx;
    const isLocked  = i > mIdx;
    const cls   = [isDone?'done':'', isCurrent?'current':'', isLocked?'locked':''].filter(Boolean).join(' ');
    const badge = isCurrent ? `<span class="mc-badge badge badge--gold">Atual</span>`
                : isDone    ? `<span class="mc-badge badge badge--success">✓</span>` : '';
    const click = !isLocked ? `onclick="openMonthDetail(${i})"` : '';
    return `
    <div class="month-card ${cls}" ${click}>
      ${badge}
      <div class="mc-num">${m.num}</div>
      <div class="mc-name">Nível ${i + 1}</div>
      <div class="mc-tag">${m.tag}</div>
    </div>`;
  }).join('');
}

async function openMonthDetail(idx) {
  const m         = MONTHS_DATA[idx];
  const mIdx      = currentUser ? (await dbFindStudent(currentUser.email))?.monthIdx ?? 0 : 0;
  const isCurr    = idx === mIdx;
  const isDone    = idx < mIdx;
  const saved     = await dbGetChecklist(currentUser.email, idx);
  const doneCount = Object.values(saved).filter(v=>v).length;
  const total     = m.objectives.length;
  const pct       = total > 0 ? Math.round(doneCount/total*100) : 0;
  const alreadyReq = isCurr ? await dbHasRequest(currentUser.email) : false;

  const statusBadge = isDone
    ? `<span class="badge badge--success" style="margin-bottom:1rem">✓ Módulo concluído</span>`
    : isCurr
    ? `<span class="badge badge--warn" style="margin-bottom:1rem">● Módulo atual</span>` : '';

  const objHtml = m.objectives.map((o, j) => {
    const checked = saved[j] || false;
    return `<li class="${checked?'done-item':''}">
      <input type="checkbox" ${checked?'checked':''} onchange="toggleCheck(${idx},${j},this)">
      <span>${o}</span></li>`;
  }).join('');

  const canRequest = isCurr && pct === 100 && idx < MONTHS_DATA.length - 1;
  const reqBlock   = canRequest
    ? (alreadyReq
        ? `<div class="request-pending-block">⏳ Solicitação enviada ao professor. Aguarde.</div>`
        : `<button class="request-advance-btn" onclick="sendAdvanceRequest(${idx})">📩 Solicitar avanço ao professor</button>`)
    : '';

  document.getElementById('monthDetailContent').innerHTML = `
    <div class="month-hero" data-num="${m.num}">
      <div class="month-hero-badge">Nível ${idx + 1} · ${m.tag} · ${m.pillar}</div>
      <h2>${m.emoji} ${m.tag}</h2>
      <p>${m.fullDesc}</p>
    </div>
    ${statusBadge}
    <div class="cbox">
      <h4>Objetivos do Módulo</h4>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" id="detailBar" style="width:${pct}%"></div>
      </div>
      <p class="progress-label" id="detailLabel">${doneCount} de ${total} (${pct}%)</p>
      <ul class="month-checklist">${objHtml}</ul>
    </div>
    <div class="cbox">
      <h4>💡 Dica do Mês</h4>
      <div class="tip">${m.tip}</div>
    </div>
    ${reqBlock}`;

  document.getElementById('jornadaGrid').style.display = 'none';
  document.getElementById('monthDetail').style.display = 'block';
}

function closeMonthDetail() {
  document.getElementById('monthDetail').style.display = 'none';
  document.getElementById('jornadaGrid').style.display = 'block';
}

async function toggleCheck(mIdx, objIdx, el) {
  const saved     = await dbSetChecklistItem(currentUser.email, mIdx, objIdx, el.checked);
  el.closest('li').className = el.checked ? 'done-item' : '';
  const total     = MONTHS_DATA[mIdx].objectives.length;
  const doneCount = Object.values(saved).filter(v=>v).length;
  const pct       = Math.round(doneCount/total*100);
  document.getElementById('detailBar').style.width   = pct + '%';
  document.getElementById('detailLabel').textContent = `${doneCount} de ${total} (${pct}%)`;

  const studentMIdx = (await dbFindStudent(currentUser.email))?.monthIdx ?? 0;
  if (pct === 100 && mIdx === studentMIdx && mIdx < MONTHS_DATA.length - 1) {
    const already = await dbHasRequest(currentUser.email);
    if (!already && !document.querySelector('.request-advance-btn,.request-pending-block')) {
      const btn       = document.createElement('button');
      btn.className   = 'request-advance-btn';
      btn.textContent = '📩 Solicitar avanço ao professor';
      btn.onclick     = () => sendAdvanceRequest(mIdx);
      document.getElementById('monthDetailContent').appendChild(btn);
    }
  }
}

async function sendAdvanceRequest(mIdx) {
  await dbAddRequest(currentUser.email, currentUser.name, mIdx);
  const btn = document.querySelector('.request-advance-btn');
  if (btn) {
    const div       = document.createElement('div');
    div.className   = 'request-pending-block';
    div.textContent = '⏳ Solicitação enviada ao professor. Aguarde a aprovação.';
    btn.replaceWith(div);
  }
}

// ── TÉCNICAS ─────────────────────────────────
function tplTecnicas() {
  return `
  <div id="page-tecnicas" class="page">
    <div class="sec-title">🎯 Técnicas Fundamentais</div>
    <div class="cbox"><h4>1. Posicionamento e Postura</h4>
      <p>A postura define 40% da qualidade do som. <strong>Certifique-se que seus dedos encaixam nas chaves circulares</strong> — não soltos.</p>
      <ul>
        <li>Flauta paralela ao chão, apoiada no queixo</li>
        <li>Ombros relaxados, cotovelo levemente afastado</li>
        <li>Evitar: postura corcunda, cabeça baixa, pernas cruzadas — prejudicam o diafragma</li>
      </ul>
      <div class="tip">💡 Quanto mais pressão no diafragma, pior o percurso do ar.</div>
    </div>
    <div class="cbox"><h4>2. Embocadura — Produção de Som</h4>
      <p>Todo o som depende do posicionamento e da variação que você faz com a boca em relação ao instrumento.</p>
      <ul>
        <li>Flauta no meio do lábio inferior — 1/4 dentro da embocadura</li>
        <li>Lábios em "o" natural, sem tensão</li>
        <li>Ar concentrado e constante</li>
      </ul>
      <div class="tip">💡 Teste: faça um "psiu" suave. Esse é o ar que entra na flauta.</div>
    </div>
    <div class="cbox"><h4>3. Respiração Diafragmática</h4>
      <ul>
        <li>Mão na barriga — inspire pelo nariz, abdômen se expande (peito imóvel)</li>
        <li>Expire lentamente em 4 tempos</li>
        <li>Repita 10 vezes antes de tocar</li>
      </ul>
      <div class="tip">💡 5 minutos de respiração antes de tocar — faça isso diariamente.</div>
    </div>
    <div class="cbox"><h4>4. Notas Longas — Moyse</h4>
      <p>Fundamental para controle da respiração, estabilidade do som e sonoridade rica. Trabalha timbre, afinação e projeção.</p>
      <ul>
        <li>Pratique <strong>todos os dias</strong> — 30min de controle de som</li>
        <li>Se tiver dificuldade com partitura: escreva, desenhe, cantarole antes de tocar</li>
        <li>Escale: 1ª → 2ª → 3ª oitava</li>
      </ul>
      <div class="tip">💡 Referência: "De la Sonorite" de Marcel Moyse.</div>
    </div>
    <div class="cbox"><h4>5. Mecânica — Arpejos e Velocidade</h4>
      <p>Compasso 6/8: conte como 2/2 (1,2,3 — 4,5,6). Isole cada frase, treine isoladamente, evolua com metrônomo.</p>
      <ul>
        <li>30min diários de arpejos com variações de BPM</li>
        <li>Atenção à afinação nas notas super agudas: Mi, Fá# e Dó</li>
      </ul>
      <div class="tip">💡 Constância supera intensidade — 1h concentrada todo dia.</div>
    </div>
    <div class="cbox"><h4>6. Afinação, Projeção e Qualidade Sonora</h4>
      <ul>
        <li><strong>Afinação:</strong> SoundCorset ou afinador de referência</li>
        <li><strong>Projeção:</strong> pratique em ambientes maiores</li>
        <li><strong>Gravações:</strong> grave, ouça, compare — seja seu próprio professor</li>
      </ul>
      <div class="tip">💡 Compare "primeira vista" vs "após estudo" — a diferença é enorme.</div>
    </div>
    <div class="cbox"><h4>📱 Ferramentas</h4>
      <ul>
        <li><strong>SoundCorset</strong> — afinação em tempo real</li>
        <li><strong>Gravador de voz</strong> — registre todas as sessões</li>
        <li><strong>App Jogo das Escalas</strong> — Android e iOS</li>
        <li><strong>Metrônomo</strong> — qualquer app</li>
      </ul>
    </div>
  </div>`;
}

// ── ESCALAS ──────────────────────────────────
function tplEscalas() {
  return `
  <div id="page-escalas" class="page">
    <div class="sec-title">🎼 Escalas & Circuitos</div>

    <!-- Link do App — topo da página -->
    <a href="https://drive.google.com/file/d/1_Cvr5WTJZGUr_31BgGKGRzRxkxG-4GkD/view"
       target="_blank" class="app-download-banner">
      <div class="app-download-icon">🎮</div>
      <div class="app-download-text">
        <strong>App Jogo das Escalas</strong>
        <span>Clique para baixar — treine escalas de forma dinâmica e divertida</span>
      </div>
      <div class="app-download-arrow">↗</div>
    </a>

    <div class="cbox">
      <p>Quando o maestro diz <em>"está em Si♭"</em> e vem o <em>"Vai, flauta!!"</em> — você precisa reagir imediatamente.</p>
      <div class="tip">💡 Comece por <strong>Dó Maior</strong>. <strong>Si♭ é a mais importante para o louvor!</strong></div>
    </div>
    <div class="circuit-tabs">
      <button class="circuit-tab active" onclick="switchCircuit('fifths',this)">🔺 Quintas (#)</button>
      <button class="circuit-tab" onclick="switchCircuit('fourths',this)">🔻 Quartas (♭)</button>
    </div>
    <div id="circuitExplainer" class="cbox"></div>
    <div class="scales-grid" id="scalesGrid"></div>
    <div id="scaleDetail"></div>
  </div>`;
}

function switchCircuit(circuit, el) {
  document.querySelectorAll('.circuit-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('scaleDetail').innerHTML = '';
  renderScalesGrid(circuit);
  const exp   = document.getElementById('circuitExplainer');
  const items = SCALES_DATA.filter(s => s.circuit === circuit);
  const arrow = circuit === 'fifths' ? '→ quinta ↗' : '→ quarta ↘';
  exp.innerHTML = `
    <h4>${circuit === 'fifths'
      ? '🔺 Circuito das Quintas — a 5ª nota vira a 1ª da próxima escala (+1# a cada vez)'
      : '🔻 Circuito das Quartas — a 4ª nota vira a 1ª da próxima escala (+1♭ a cada vez)'}</h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:.75rem">
      ${items.map((s,i) => `
        <span style="background:var(--navy);color:var(--gold2);padding:3px 10px;border-radius:20px;font-size:.8rem;font-weight:600">${s.name}</span>
        ${i < items.length-1 ? `<span style="color:var(--muted);font-size:.78rem;align-self:center">${arrow}</span>` : ''}
      `).join('')}
    </div>`;
}

function renderScalesGrid(circuit) {
  const grid = document.getElementById('scalesGrid');
  if (!grid) return;
  const items = SCALES_DATA.filter(s => s.circuit === circuit);
  grid.innerHTML = items.map((s, i) => `
    <div class="scale-box" onclick="showScale('${s.key}',this)">
      <div class="sc-step">${i === 0 ? 'Início' : i+'º passo'}</div>
      <div class="sc-name">${s.name}</div>
      <div class="sc-info">${s.info}</div>
    </div>`).join('');
}

function showScale(key, el) {
  const s = SCALES_DATA.find(x => x.key === key);
  if (!s) return;
  document.querySelectorAll('.scale-box').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const cells = s.cipher.split(' · ').map(n => {
    const acc = n.includes('#') || n.includes('♭');
    return `<span style="display:inline-block;padding:5px 10px;margin:2px;border-radius:8px;
      background:${acc?'var(--gold)':'var(--cream2)'};color:${acc?'var(--navy)':'var(--text)'};
      font-weight:${acc?'700':'500'};font-size:.9rem">${n}</span>`;
  }).join('');
  document.getElementById('scaleDetail').innerHTML = `
    <div class="cbox">
      <h4>${s.name} — ${s.info}</h4>
      <p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem">Acidentes: <strong>${s.acids}</strong></p>
      <div style="margin-bottom:1rem">${cells}</div>
      <p style="font-size:.85rem;color:var(--muted);margin-bottom:.75rem"><strong>Notas reais:</strong> ${s.notes}</p>
      <p>${s.detail}</p>
      <div class="tip">🙏 <strong>No Louvor:</strong> ${s.louvor}</div>
    </div>`;
  document.getElementById('scaleDetail').scrollIntoView({behavior:'smooth',block:'nearest'});
}



// ── DOWNLOADS ────────────────────────────────
function tplDownloads() {
  // Cada item: ico, title, desc, e opcionalmente:
  //   images: [{src, bg}]  → galeria de imagens (bg para transparentes)
  //   pdf: caminho para o PDF (abre no navegador)
  const items = [
    {
      ico: '📄',
      title: 'Guia de Posicionamento',
      desc: 'Posicionamento correto dos dedos nas chaves — correto vs errado.',
      images: [
        { src: 'arquivos/posi1.png', bg: '#1a2a1a', label: 'Mãos' },
        { src: 'arquivos/posi2.png', bg: '#1a1a2a', label: 'Embocadura' },
        { src: 'arquivos/posi3.png', bg: '#2a1a1a', label: 'Posição completa' },
      ],
    },
    {
      ico: '🎼',
      title: 'Partituras de Escalas',
      desc: 'Todas as escalas maiores em 3 oitavas.',
      images: [
        { src: 'arquivos/notasPrtt.png',  bg: '#1a1a2a', label: 'Posicionamento das Notas' },
        { src: 'arquivos/notasPrtt2.png', bg: '#1a1a2a', label: 'Notas Partitura' },
      ],
    },
    {
      ico: '🎵',
      title: 'Notas Longas — Marcel Moyse',
      desc: 'Exercícios de sonoridade, timbre e afinação. Pratique todos os dias.',
      images: [
        { src: 'arquivos/notasLongas.jpeg', bg: '#f5f0e8', label: 'Exercício de Moyse' },
      ],
    },
    {
      ico: '⏸️',
      title: 'Pausas — "Clamo a Ti"',
      desc: 'Partitura de flauta com compasso 4/4, pausas e ritmos marcados.',
      pdf: 'arquivos/Clamo a Ti - Flauta.pdf',
    },
    {
      ico: '⚙️',
      title: 'Mecânica — "Rejubila"',
      desc: 'Partitura de mecânica em 6/8 com arpejos. Isole cada frase e evolua com metrônomo.',
      pdf: 'arquivos/Rejubila (oficial).pdf',
    },

    {
      ico: '🎻',
      title: 'Peças Clássicas — Polka Zinha',
      desc: 'Peça para o 2º semestre — técnica, expressão e leitura avançada.',
      pdf: 'arquivos/zinha.pdf',
    },

  ];

  function buildCard(item) {
    // Botões de abertura em modal
    let btns = '';

    if (item.pdf) {
      // PDF abre em modal com iframe
      const safeId = item.title.replace(/[^a-zA-Z0-9]/g, '_');
      btns = `<button class="dl-btn" onclick="openModal('${safeId}')">📄 Abrir PDF</button>`;
    } else if (item.images) {
      // Cada imagem vira um botão que abre modal
      btns = item.images.map(img => {
        const safeId = img.label.replace(/[^a-zA-Z0-9]/g, '_');
        const ext = img.src.split('.').pop();
        return `<div class="dl-btn-pair">
          <button class="dl-btn dl-btn--img" onclick="openModal('${safeId}')">🖼️ ${img.label}</button>
          <a class="dl-btn dl-btn--download" href="${img.src}" download="${img.label}.${ext}">⬇️ Baixar</a>
        </div>`;
      }).join('');
    } else {
      btns = `<button class="dl-btn dl-btn--soon" disabled>🔒 Em breve</button>`;
    }

    return `
    <div class="dl-card">
      <div class="dl-ico">${item.ico}</div>
      <div class="dl-title">${item.title}</div>
      <div class="dl-desc">${item.desc}</div>
      <div class="dl-btns">${btns}</div>
    </div>`;
  }

  // Gera os modais de todos os itens
  function buildModals() {
    let html = '';
    items.forEach(item => {
      if (item.pdf) {
        const safeId = item.title.replace(/[^a-zA-Z0-9]/g, '_');
        html += `
        <div id="modal_${safeId}" class="dl-modal" onclick="closeModalOutside(event,this)">
          <div class="dl-modal-box dl-modal-box--pdf">
            <div class="dl-modal-header">
              <span>${item.title}</span>
              <button class="dl-modal-close" onclick="closeModal('${safeId}')">✕</button>
            </div>
            <iframe src="${item.pdf}" class="dl-modal-iframe" loading="lazy"></iframe>
          </div>
        </div>`;
      } else if (item.images) {
        item.images.forEach(img => {
          const safeId = img.label.replace(/[^a-zA-Z0-9]/g, '_');
          html += `
          <div id="modal_${safeId}" class="dl-modal" onclick="closeModalOutside(event,this)">
            <div class="dl-modal-box dl-modal-box--img">
              <div class="dl-modal-header">
                <span>${img.label}</span>
                <button class="dl-modal-close" onclick="closeModal('${safeId}')">✕</button>
              </div>
              <div class="dl-modal-img-wrap" style="background:${img.bg || '#1a2a1a'}">
                <img src="${img.src}" alt="${img.label}">
              </div>
            </div>
          </div>`;
        });
      }
    });
    return html;
  }

  return `
  <div id="page-downloads" class="page">
    <div class="sec-title">📥 Materiais</div>
    <p style="color:var(--muted);font-size:.9rem;margin-bottom:1.75rem">
      PDFs, partituras e imagens exclusivos para alunos.
    </p>
    <div class="dl-grid">
      ${items.map(buildCard).join('')}
    </div>
    ${buildModals()}
  </div>`;
}

function openModal(id) {
  const modal = document.getElementById('modal_' + id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById('modal_' + id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeModalOutside(event, modal) {
  if (event.target === modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ── TIMER ────────────────────────────────────
function tplTimer() {
  return `
  <div id="page-timer" class="page">

    <!-- ══ METRÔNOMO ══ -->
    <div class="sec-title">🎵 Metrônomo</div>
    <div class="metro-block">

      <div class="metro-beats" id="metroBeats"></div>

      <div class="metro-bpm-display" id="metroBpmDisplay">80 BPM</div>

      <div class="metro-bpm-control">
        <button class="metro-adj-btn" onclick="Metronome.adjustBpm(-10)">−10</button>
        <button class="metro-adj-btn" onclick="Metronome.adjustBpm(-1)">−1</button>
        <input type="range" id="metroBpmSlider" min="40" max="240" value="80"
               oninput="Metronome.setBpm(+this.value)" class="metro-slider">
        <button class="metro-adj-btn" onclick="Metronome.adjustBpm(+1)">+1</button>
        <button class="metro-adj-btn" onclick="Metronome.adjustBpm(+10)">+10</button>
      </div>

      <div class="metro-compass-row">
        <span class="metro-compass-label">Compasso:</span>
        <button class="metro-sig-btn active" id="metroSig44" onclick="Metronome.setSignature('4/4')">4/4</button>
        <button class="metro-sig-btn" id="metroSig68" onclick="Metronome.setSignature('6/8')">6/8</button>
      </div>

      <div class="metro-presets">
        <button class="preset-btn" onclick="Metronome.setBpmPreset(60)">60</button>
        <button class="preset-btn" onclick="Metronome.setBpmPreset(80)">80</button>
        <button class="preset-btn" onclick="Metronome.setBpmPreset(100)">100</button>
        <button class="preset-btn" onclick="Metronome.setBpmPreset(120)">120</button>
        <button class="preset-btn" onclick="Metronome.setBpmPreset(140)">140</button>
        <button class="preset-btn" onclick="Metronome.setBpmPreset(160)">160</button>
      </div>

      <div class="metro-ctrl-row">
        <button class="ctrl-btn" id="metroToggleBtn" onclick="Metronome.toggle()">▶ Iniciar</button>
        <button class="ctrl-btn ctrl-btn--secondary" onclick="Metronome.stop()">⏹ Parar</button>
      </div>

    </div>

    <!-- ══ TIMER ══ -->
    <div class="sec-title" style="margin-top:2rem">⏱️ Timer de Prática</div>
    <div class="timer-block">
      <div class="timer-display" id="timerDisplay">30:00</div>
      <div class="timer-presets">
        <button class="preset-btn" onclick="timerSet(5)">5 min</button>
        <button class="preset-btn" onclick="timerSet(15)">15 min</button>
        <button class="preset-btn" onclick="timerSet(30)">30 min</button>
        <button class="preset-btn" onclick="timerSet(45)">45 min</button>
        <button class="preset-btn" onclick="timerSet(60)">60 min</button>
      </div>
      <button class="ctrl-btn" id="timerBtn" onclick="timerToggle()">▶ Iniciar</button>
      <button class="ctrl-btn ctrl-btn--secondary" onclick="timerReset()">🔄 Resetar</button>
    </div>
    <div class="cbox"><h4>Rotina Diária (2h)</h4>
      <ul>
        <li><strong>30 min</strong> — Escalas com o app</li>
        <li><strong>30 min</strong> — Notas longas e escalas cromáticas</li>
        <li><strong>30 min</strong> — Mecânica: arpejos com variações de BPM</li>
        <li><strong>30 min</strong> — Peça preferida (Tico-tico, Bach, Ian Clarke…)</li>
      </ul>
      <div class="tip">💡 Treine todos os dias — constância supera intensidade.</div>
    </div>
  </div>`;
}

// ── TIMER LOGIC ──────────────────────────────
let _timerSec = 1800, _timerMax = 1800, _timerRun = false, _timerInt = null;

function initTimer() { _timerSec = _timerMax = 1800; timerDraw(); Metronome.init(); }

function timerSet(min) {
  timerReset();
  _timerSec = _timerMax = min * 60;
  timerDraw();
}

function timerToggle() {
  if (_timerRun) {
    clearInterval(_timerInt); _timerRun = false;
    document.getElementById('timerBtn').textContent = '▶ Retomar';
  } else {
    if (_timerSec <= 0) return;
    _timerRun = true;
    document.getElementById('timerBtn').textContent = '⏸ Pausar';
    _timerInt = setInterval(async () => {
      _timerSec--;
      timerDraw();
      if (_timerSec <= 0) {
        clearInterval(_timerInt); _timerRun = false;
        document.getElementById('timerBtn').textContent = '✓ Concluído!';
        const streak = await dbIncrementStreak(currentUser.email);
        const el = document.getElementById('streakDisplay');
        if (el) el.textContent = streak + ' dias';
        alert('🎉 Sessão concluída! Sequência: ' + streak + ' dias 🔥');
      }
    }, 1000);
  }
}

function timerReset() {
  clearInterval(_timerInt); _timerRun = false;
  _timerSec = _timerMax; timerDraw();
  const btn = document.getElementById('timerBtn');
  if (btn) btn.textContent = '▶ Iniciar';
}

function timerDraw() {
  const el = document.getElementById('timerDisplay');
  if (!el) return;
  const m = Math.floor(_timerSec/60), s = _timerSec%60;
  el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

async function checkDay() {
  const all = ['dc1','dc2','dc3','dc4'].every(id => document.getElementById(id)?.checked);
  if (all) {
    const streak = await dbIncrementStreak(currentUser.email);
    const el = document.getElementById('streakDisplay');
    if (el) el.textContent = streak + ' dias';
    alert('🔥 Sessão completa! Sequência: ' + streak + ' dias.');
  }
}
