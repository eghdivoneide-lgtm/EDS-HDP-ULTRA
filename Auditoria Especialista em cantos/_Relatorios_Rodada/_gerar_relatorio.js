// ════════════════════════════════════════════════════════════════
// GERADOR DO RELATÓRIO DE ENTRADAS — Rodada 10/05/2026
// Lê todos os HTMLs da pasta, cruza motores, gera Word (.doc HTML)
// ════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

// ───────────────────────── Helpers ─────────────────────────
const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
const aliases = {
  // unifica variações de nomes
  'atltucuman': 'atleticotucuman', 'atltucumana': 'atleticotucuman',
  'depriestra': 'deportivoriestra',
  'estudianteslp': 'estudianteslaplata',
  'gimnasialp': 'gimnasialaplata',
  'rbbragantino': 'redbullbragantino', 'bragantino': 'redbullbragantino',
  '1fckoln': 'fckoln', 'koln': 'fckoln',
  'mainz05': 'mainz',
  'argentinosjrs': 'argentinosjuniors'
};
const canon = s => { const k = norm(s); return aliases[k] || k; };
const keyJogo = (liga, m, v) => `${liga}|${canon(m)}|${canon(v)}`;
const sinais = {};

function add(jogo, info) {
  const k = keyJogo(jogo.liga, jogo.m, jogo.v);
  if (!sinais[k]) sinais[k] = { liga:jogo.liga, m:jogo.m.trim(), v:jogo.v.trim(), motores:{} };
  sinais[k].motores[info.motor] = info;
}

function detectLiga(fname) {
  const m = fname.match(/_(ARG_B|ARG|BR_B|BR|MLS|USL|BUN)_/);
  return m ? m[1] : null;
}

function stripTags(s) { return (s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

// ───────────────────────── CISNE NEGRO ─────────────────────────
files.filter(f => f.startsWith('CisneNegro_')).forEach(f => {
  const liga = detectLiga(f);
  if (!liga) return;
  const html = fs.readFileSync(path.join(DIR, f), 'utf8');
  const cards = html.split('🦢 SELO CISNE NEGRO').slice(1);
  cards.forEach(c => {
    const card = c.slice(0, 2500);
    const mTimes = card.match(/>([^<>]+?)\s*<br>\s*<span[^>]*>vs<\/span>\s*<br>\s*([^<>]+?)</);
    const mFav = card.match(/Favorito Absoluto:\s*<span[^>]*>([^<]+)<\/span>/);
    const mVant = card.match(/Vantagem Projetada:\s*<span[^>]*>\+?([\d.]+)\s*cantos/);
    if (mTimes && mFav && mVant) {
      add({liga, m: mTimes[1], v: mTimes[2]},
          { motor:'cisne', favorito: mFav[1].trim(), diff: parseFloat(mVant[1]) });
    }
  });
});

// ───────────────────────── BALA DE PRATA ─────────────────────────
files.filter(f => f.startsWith('BalaDePrata_')).forEach(f => {
  const liga = detectLiga(f);
  if (!liga) return;
  const html = fs.readFileSync(path.join(DIR, f), 'utf8');
  // Tenta achar cada card BP individualmente
  const cards = html.split(/<div[^>]*class="stat-card"[^>]*>/).slice(1);
  cards.forEach(c => {
    const card = c.slice(0, 4000);
    // jogo
    const mTimes = card.match(/<div class="label"[^>]*>([^<]+?)\s*<span[^>]*>vs<\/span>\s*([^<]+?)<\/div>/);
    if (!mTimes) return;
    const mFav = card.match(/🏆[\s\S]*?Favorito[\s\S]*?<strong[^>]*>([^<]+)<\/strong>/);
    const mOdd = card.match(/🛡️[\s\S]*?Odd Justa[\s\S]*?@\s*([\d.]+)/);
    const mSelo = card.match(/🏷️[\s\S]*?Selo[\s\S]*?>(NUCLEAR|FORTE|MODERADA)</);
    if (mFav && mOdd && mSelo) {
      add({liga, m: mTimes[1], v: mTimes[2]},
          { motor:'bala', favorito: mFav[1].trim(), odd: parseFloat(mOdd[1]), faixa: mSelo[1] });
    }
  });
});

// ───────────────────────── ENIGMA ─────────────────────────
files.filter(f => f.startsWith('Enigma_')).forEach(f => {
  const liga = detectLiga(f);
  if (!liga) return;
  const html = fs.readFileSync(path.join(DIR, f), 'utf8');
  const re = /setJogoEmFoco\('([^']+)',\s*'([^']+)',\s*'enigma'\)/g;
  // Pega blocos entre setJogoEmFoco
  let parts = html.split(/setJogoEmFoco\('([^']+)',\s*'([^']+)',\s*'enigma'\)/);
  // parts: [pre, t1, t2, between, t1, t2, between, ...]
  for (let i = 1; i+2 < parts.length; i += 3) {
    const t1 = parts[i], t2 = parts[i+1], ctx = parts[i+2].slice(0, 4000);
    const mFav = ctx.match(/[Ff]avorito[^<]*?<[^>]+>([^<]+?)<|FAVORITO[^<]*?<[^>]+>([^<]+?)</);
    const fav = mFav ? (mFav[1] || mFav[2] || '').trim() : null;
    add({liga, m:t1, v:t2}, { motor:'enigma', favorito: fav || '?' });
  }
});

// ───────────────────────── VENCEDOR CANTOS ─────────────────────────
files.filter(f => f.startsWith('VencedorCantos_')).forEach(f => {
  const liga = detectLiga(f);
  if (!liga) return;
  const html = fs.readFileSync(path.join(DIR, f), 'utf8');
  // Lê linhas de tabela
  const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  trs.forEach(tr => {
    const tds = (tr.match(/<td[^>]*>[\s\S]*?<\/td>/g) || []).map(stripTags);
    if (tds.length < 4) return;
    // Procura par "Time1 ... Time2" e odd justa
    // Estrutura típica do app: [#, Jogo, Favorito, OddJusta, Faixa, ...]
    const oddIdx = tds.findIndex(t => /^@?\s*\d+\.\d+\s*$/.test(t.replace('@','')));
    if (oddIdx === -1) return;
    const odd = parseFloat(tds[oddIdx].replace(/[^\d.]/g,''));
    if (isNaN(odd) || odd > 5) return;
    // Jogo geralmente é td anterior à odd ou alguma com "vs/x/×"
    const jogoTd = tds.find(t => /\s[×x]\s|\svs\s|\s-\s/i.test(t)) || tds[1] || tds[0];
    const partes = jogoTd.split(/\s+[×x]\s+|\s+vs\s+|\s+-\s+/i);
    if (partes.length < 2) return;
    const fav = tds[oddIdx-1] && tds[oddIdx-1].length < 35 ? tds[oddIdx-1] : '?';
    add({liga, m:partes[0], v:partes[1]},
        { motor:'vencedor', favorito: fav, odd });
  });
});

// ───────────────────────── FILTRO OURO ─────────────────────────
files.filter(f => f.startsWith('FiltroOURO_')).forEach(f => {
  const liga = detectLiga(f);
  if (!liga) return;
  const html = fs.readFileSync(path.join(DIR, f), 'utf8');
  // Mais simples: extrai todos os jogos mostrados (em qualquer aba do OURO)
  const re = /([A-ZÁ][\w\.\-\sÁÉÍÓÚÀÂÊÔÃÕÇ]{1,30}?)\s*[×x]\s*([A-ZÁ][\w\.\-\sÁÉÍÓÚÀÂÊÔÃÕÇ]{1,30}?)(?:<|\s\s)/g;
  let m, ja = new Set();
  while ((m = re.exec(html)) !== null) {
    const t1 = m[1].trim(), t2 = m[2].trim();
    if (t1.length < 3 || t2.length < 3 || t1.length > 30 || t2.length > 30) continue;
    const k = canon(t1)+'|'+canon(t2);
    if (ja.has(k)) continue;
    ja.add(k);
    add({liga, m:t1, v:t2}, { motor:'ouro' });
  }
});

// ───────────────────────── DUMP & ANÁLISE ─────────────────────────
const DNA_LIGA = {
  BR:    { arquetipo:'ofensiva',    cisneThr: 2.0, mediaFT: 10.01 },
  BR_B:  { arquetipo:'ofensiva',    cisneThr: 2.0, mediaFT: 10.44 },
  MLS:   { arquetipo:'ofensiva',    cisneThr: 2.5, mediaFT: 10.05 },
  BUN:   { arquetipo:'equilibrada', cisneThr: 2.0, mediaFT: 9.73  },
  USL:   { arquetipo:'equilibrada', cisneThr: 2.0, mediaFT: 9.19  },
  ARG:   { arquetipo:'trucada',     cisneThr: 1.5, mediaFT: 8.51  },
  ARG_B: { arquetipo:'trucada',     cisneThr: 1.5, mediaFT: 8.60  }
};
const LIGA_NOME = {
  BR:'🇧🇷 Brasileirão Série A', BR_B:'🇧🇷 Brasileirão Série B',
  ARG:'🇦🇷 Liga Profesional', ARG_B:'🇦🇷 Primera Nacional',
  MLS:'🇺🇸 Major League Soccer', USL:'🇺🇸 USL Championship',
  BUN:'🇩🇪 Bundesliga'
};

// ── Análise de cada jogo ──
const analisados = Object.values(sinais).map(j => {
  const dna = DNA_LIGA[j.liga];
  const m = j.motores;
  let scoreBP = 0, scoreVencedor = 0, scoreUnder = 0, alertas = [], strengths = [];
  let favoritoConsenso = null;
  // Coleta favoritos
  const favs = {};
  ['cisne','bala','vencedor','enigma'].forEach(mot => {
    if (m[mot] && m[mot].favorito && m[mot].favorito !== '?') {
      const f = canon(m[mot].favorito);
      favs[f] = (favs[f]||0) + 1;
    }
  });
  const favSorted = Object.entries(favs).sort((a,b)=>b[1]-a[1]);
  const favVotos = favSorted[0] ? favSorted[0][1] : 0;
  if (favSorted.length) {
    // pega nome legível (primeiro motor que apontou esse fav)
    for (const mot of ['bala','cisne','vencedor','enigma']) {
      if (m[mot] && m[mot].favorito && canon(m[mot].favorito) === favSorted[0][0]) {
        favoritoConsenso = m[mot].favorito;
        break;
      }
    }
  }

  // Score Vencedor (entrada HDP -0.5 favorito)
  if (m.bala) {
    if (m.bala.faixa === 'NUCLEAR') scoreVencedor += dna.arquetipo==='trucada' ? 22 : 20;
    else if (m.bala.faixa === 'FORTE') scoreVencedor += dna.arquetipo==='trucada' ? 6.6 : (dna.arquetipo==='equilibrada' ? 10.2 : 12);
    else if (m.bala.faixa === 'MODERADA') scoreVencedor += dna.arquetipo==='trucada' ? 0 : (dna.arquetipo==='equilibrada' ? 3.5 : 5);
  }
  if (m.cisne) {
    const d = m.cisne.diff;
    if (d >= 4) scoreVencedor += 25;
    else if (d >= 3) scoreVencedor += 18;
    else if (d >= 2) scoreVencedor += 12;
    else if (d >= 1.5) scoreVencedor += 6;
  }
  if (m.enigma && favoritoConsenso && canon(m.enigma.favorito) === canon(favoritoConsenso)) scoreVencedor += 8;
  if (favVotos >= 3) scoreVencedor += 10;
  if (m.ouro) scoreVencedor += 5;

  // Bonus liga premium / ruim Vencedor (já calibrado v3)
  if (['ARG','ARG_B','MLS'].includes(j.liga)) scoreVencedor += 10;
  if (j.liga === 'BR') scoreVencedor -= 5; // BR HDP histórico ruim

  // Score Under (sinal inverso)
  // Trucadas (ARG/ARG_B) favorecem Under
  if (dna.arquetipo === 'trucada') scoreUnder += 15;
  if (m.cisne && m.cisne.diff < 1.5) scoreUnder += 10;
  if (!m.bala) scoreUnder += 5; // sem favorito claro

  // Strengths/alertas
  if (m.bala && m.bala.faixa === 'NUCLEAR') strengths.push('🐺 BP NUCLEAR @' + m.bala.odd.toFixed(2));
  if (m.cisne && m.cisne.diff >= 3) strengths.push('🦢 Cisne ELITE Δ' + m.cisne.diff.toFixed(2));
  else if (m.cisne && m.cisne.diff >= 2) strengths.push('🦢 Cisne Δ' + m.cisne.diff.toFixed(2));
  if (favVotos >= 3) strengths.push('🎯 Convergência ' + favVotos + ' motores');
  if (m.ouro) strengths.push('🥇 Filtro OURO');

  if (j.liga === 'BUN' && m.bala && m.bala.odd <= 1.15) alertas.push('⚠️ BUN BP @1.0x quase quebrou na rodada anterior (Freiburg-Wolfsburg, Mönchengladbach)');
  if (j.liga === 'BR' && m.bala && m.bala.faixa === 'NUCLEAR' && m.bala.odd <= 1.10) alertas.push('⚠️ BR NUCLEAR @1.0x — risco "Mirassol" (1-5 cantos rodada anterior)');
  if (dna.arquetipo === 'trucada' && m.bala && m.bala.faixa === 'MODERADA') alertas.push('🔴 BP MODERADA em liga trucada — armadilha histórica (40% WR)');

  return {
    ...j, dna, scoreVencedor, scoreUnder, strengths, alertas,
    favoritoConsenso, favVotos
  };
});

// ── TOP PICKS (filtros + ranking) ──
const TOP_VENCEDOR_POR_LIGA = 5;
const porLiga = {};
analisados.forEach(a => {
  if (!porLiga[a.liga]) porLiga[a.liga] = [];
  porLiga[a.liga].push(a);
});
Object.keys(porLiga).forEach(L => {
  porLiga[L].sort((a,b) => b.scoreVencedor - a.scoreVencedor);
});

// === GERAR DOC HTML (compatível Word) ===
const today = new Date().toISOString().slice(0,10);

function classeRecomendacao(score) {
  if (score >= 50) return { tag: '🟢 ENTRADA RECOMENDADA', cor: '#16a34a' };
  if (score >= 35) return { tag: '🟡 ENTRADA MODERADA', cor: '#ca8a04' };
  if (score >= 20) return { tag: '🟠 ATENÇÃO (sinal médio)', cor: '#ea580c' };
  return { tag: '⚪ SEM CONVICÇÃO', cor: '#6b7280' };
}

function rendaJogo(a, idx) {
  const r = classeRecomendacao(a.scoreVencedor);
  const motoresList = Object.keys(a.motores).map(k => k.toUpperCase()).join(' + ');
  const m = a.motores;
  const odds = m.bala ? `BP @${m.bala.odd.toFixed(2)} (${m.bala.faixa})` : '—';
  const cisne = m.cisne ? `Δ${m.cisne.diff.toFixed(2)}` : '—';
  return `
    <div style="border-left:4px solid ${r.cor};padding:10px 16px;margin:12px 0;background:#f8fafc;border-radius:4px">
      <div style="font-size:14pt;font-weight:bold;margin-bottom:4px">${idx}. ${a.m} × ${a.v}</div>
      <div style="font-size:10pt;color:#475569;margin-bottom:8px">
        <b>${r.tag}</b> · Score Vencedor: <b>${a.scoreVencedor.toFixed(0)}</b>
        ${a.dna.arquetipo === 'trucada' ? ' · Score Under: <b>'+a.scoreUnder+'</b>' : ''}
      </div>
      <table style="font-size:10pt;width:100%;border-collapse:collapse">
        <tr><td style="padding:3px;width:140px;color:#64748b">Motores ativos</td><td><b>${motoresList || 'nenhum'}</b></td></tr>
        <tr><td style="padding:3px;color:#64748b">Favorito (consenso)</td><td>${a.favoritoConsenso || '—'} <span style="color:#94a3b8">(${a.favVotos} de 4 motores)</span></td></tr>
        <tr><td style="padding:3px;color:#64748b">🐺 Bala de Prata</td><td>${odds}</td></tr>
        <tr><td style="padding:3px;color:#64748b">🦢 Cisne Negro</td><td>${cisne}${m.cisne ? ' (favorito: '+m.cisne.favorito+')' : ''}</td></tr>
        ${m.vencedor ? `<tr><td style="padding:3px;color:#64748b">🏆 Vencedor Cantos</td><td>@${m.vencedor.odd.toFixed(2)} (favorito: ${m.vencedor.favorito})</td></tr>` : ''}
        ${m.enigma ? `<tr><td style="padding:3px;color:#64748b">🔮 Enigma</td><td>favorito: ${m.enigma.favorito}</td></tr>` : ''}
        ${m.ouro ? `<tr><td style="padding:3px;color:#64748b">🥇 Filtro OURO</td><td>★ Selecionado</td></tr>` : ''}
      </table>
      ${a.strengths.length ? '<div style="margin-top:8px;font-size:9pt"><b>Pontos fortes:</b> ' + a.strengths.join(' · ') + '</div>' : ''}
      ${a.alertas.length ? '<div style="margin-top:6px;font-size:9pt;color:#dc2626"><b>Alertas:</b> ' + a.alertas.join(' · ') + '</div>' : ''}
      ${recomendarMercados(a)}
    </div>
  `;
}

function recomendarMercados(a) {
  const ms = [];
  const m = a.motores;
  // Mercado #1 — HDP -0.5 favorito (Vencedor cantos)
  if (a.scoreVencedor >= 35 && a.favoritoConsenso) {
    if (m.bala && m.bala.faixa === 'NUCLEAR') {
      ms.push(`<li><b>HDP -0.5 ${a.favoritoConsenso}</b> (entrada principal — BP NUCLEAR + ${a.favVotos} motores)</li>`);
      if (m.cisne && m.cisne.diff >= 3) {
        ms.push(`<li><b>HDP -1.5 ${a.favoritoConsenso}</b> (Cisne ELITE Δ${m.cisne.diff.toFixed(1)} — favorito domina)</li>`);
      }
    } else if (m.cisne && m.cisne.diff >= 2.5) {
      ms.push(`<li><b>HDP -1.0 ${a.favoritoConsenso}</b> (Cisne forte Δ${m.cisne.diff.toFixed(1)})</li>`);
    } else {
      ms.push(`<li><b>HDP -0.5 ${a.favoritoConsenso}</b></li>`);
    }
  }
  // Mercado Under em ligas trucadas
  if (a.dna.arquetipo === 'trucada' && a.scoreUnder >= 15 && (!m.cisne || m.cisne.diff < 2)) {
    const linha = a.dna.mediaFT < 9 ? '9.5' : '10.5';
    ms.push(`<li><b>Under ${linha} cantos FT</b> (liga trucada · jogo equilibrado · média ${a.dna.mediaFT})</li>`);
  }
  // Mercado Under quando expFT muito baixa
  if (m.cisne && m.cisne.diff < 1.0 && a.dna.mediaFT < 9.5) {
    ms.push(`<li><b>Under 9.5 cantos FT</b> (jogo amarrado projetado em liga conservadora)</li>`);
  }
  if (ms.length === 0) return '';
  return '<div style="margin-top:8px;padding:8px;background:#ecfdf5;border-radius:4px"><b style="color:#15803d">📋 Entradas sugeridas:</b><ul style="margin:6px 0 0 18px">' + ms.join('') + '</ul></div>';
}

let body = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Análise Rodada 10/05/2026</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body{font-family:Calibri,Arial,sans-serif;color:#1f2937;line-height:1.5}
h1{color:#0f172a;font-size:22pt;border-bottom:3px solid #0ea5e9;padding-bottom:8px}
h2{color:#0c4a6e;font-size:16pt;margin-top:28px;border-bottom:1px solid #cbd5e1;padding-bottom:4px}
h3{color:#1e40af;font-size:13pt}
table{font-size:10pt}
.dna-tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:9pt;font-weight:bold}
.tag-ofensiva{background:#dbeafe;color:#1e40af}
.tag-equilibrada{background:#fef3c7;color:#92400e}
.tag-trucada{background:#fee2e2;color:#991b1b}
</style></head>
<body>
<h1>📊 Relatório de Entradas — Rodada 10/05/2026</h1>
<p style="font-size:11pt;color:#475569">
  <b>Gerado em:</b> ${today}<br>
  <b>Motor:</b> Especialista em Cantos v3.0 (DNA por liga)<br>
  <b>Total de jogos analisados:</b> ${analisados.length} em 7 ligas
</p>

<h2>🧬 Resumo executivo — DNA das ligas operadas</h2>
<table style="width:100%;border-collapse:collapse;margin-top:12px">
  <tr style="background:#1e40af;color:white">
    <th style="padding:8px;text-align:left">Liga</th>
    <th style="padding:8px;text-align:left">DNA</th>
    <th style="padding:8px;text-align:left">Média FT cantos</th>
    <th style="padding:8px;text-align:left">Mercado preferencial</th>
    <th style="padding:8px;text-align:left">Cuidado com</th>
  </tr>
`;
[
  ['BR','HDP NUCLEAR + Vencedor (60-71% WR histórico)', 'Teacher Over/Under desligado'],
  ['BR_B','Teacher Over/Under (80% WR rodada anterior)', 'Vencedor solo (29% WR)'],
  ['ARG','HDP -0.5 + Cisne (84% WR histórico)', 'Under quando Vencedor forte (jogos explodem)'],
  ['ARG_B','HDP NUCLEAR + Under FT (80% e 75% WR)', 'BP MODERADA (era armadilha — peso zerado v3)'],
  ['MLS','BP NUCLEAR (86%) só com Cisne ativo (≥5 sinais)', 'Operar sem Cisne ativo'],
  ['USL','Vencedor + Enigma alinhados', 'Under (volátil — Sacramento +9 estouro)'],
  ['BUN','Cisne Δ ≥ 3.0 + confirmação Enigma', 'BP solo (gerou 3 das 5 piores furadas)']
].forEach(([cod, mercado, cuidado]) => {
  const dna = DNA_LIGA[cod];
  const tag = `<span class="dna-tag tag-${dna.arquetipo}">${dna.arquetipo.toUpperCase()}</span>`;
  body += `<tr style="border-bottom:1px solid #e2e8f0">
    <td style="padding:8px"><b>${LIGA_NOME[cod]}</b></td>
    <td style="padding:8px">${tag}</td>
    <td style="padding:8px">${dna.mediaFT.toFixed(2)}</td>
    <td style="padding:8px;color:#15803d">${mercado}</td>
    <td style="padding:8px;color:#dc2626">${cuidado}</td>
  </tr>`;
});
body += '</table>';

// Por liga, top picks
const ordemLigas = ['ARG','ARG_B','MLS','BR_B','BR','BUN','USL'];
ordemLigas.forEach(L => {
  const picks = porLiga[L] || [];
  if (picks.length === 0) return;
  const dna = DNA_LIGA[L];
  body += `<h2>${LIGA_NOME[L]} <span class="dna-tag tag-${dna.arquetipo}">${dna.arquetipo.toUpperCase()}</span></h2>`;
  body += `<p style="color:#475569"><b>${picks.length} jogos analisados</b> · Cisne threshold ${dna.cisneThr} · média histórica FT ${dna.mediaFT.toFixed(2)} cantos</p>`;
  picks.slice(0, 6).forEach((a, i) => { body += rendaJogo(a, i+1); });
  if (picks.length > 6) {
    body += `<p style="font-style:italic;color:#94a3b8;margin-top:12px">+ ${picks.length - 6} jogos com score Vencedor < ${picks[5].scoreVencedor.toFixed(0)} (sinais marginais — não recomendados pra entrada)</p>`;
  }
});

// Top global
const topGlobal = analisados.filter(a => a.scoreVencedor >= 50).sort((a,b)=>b.scoreVencedor - a.scoreVencedor).slice(0,10);
body += `<h2>🏆 Top 10 ENTRADAS RECOMENDADAS (score ≥ 50, todas as ligas)</h2>`;
if (topGlobal.length === 0) {
  body += '<p style="color:#dc2626"><b>Nenhuma entrada com convicção ENTRADA RECOMENDADA nesta rodada.</b> Considere stake reduzido ou ficar fora.</p>';
} else {
  body += '<table style="width:100%;border-collapse:collapse;margin-top:12px">';
  body += '<tr style="background:#15803d;color:white"><th style="padding:8px">#</th><th style="padding:8px;text-align:left">Liga</th><th style="padding:8px;text-align:left">Jogo</th><th style="padding:8px">Score</th><th style="padding:8px;text-align:left">Mercado</th></tr>';
  topGlobal.forEach((a,i) => {
    const m = a.motores;
    let mercado = 'HDP -0.5 ' + (a.favoritoConsenso || '?');
    if (m.bala && m.bala.faixa === 'NUCLEAR' && m.cisne && m.cisne.diff >= 3) {
      mercado = 'HDP -1.5 ' + a.favoritoConsenso + ' (BP NUCLEAR + Cisne ELITE)';
    }
    body += `<tr style="border-bottom:1px solid #e2e8f0">
      <td style="padding:8px;text-align:center"><b>${i+1}</b></td>
      <td style="padding:8px">${LIGA_NOME[a.liga]}</td>
      <td style="padding:8px"><b>${a.m} × ${a.v}</b></td>
      <td style="padding:8px;text-align:center;font-weight:bold;color:#15803d">${a.scoreVencedor.toFixed(0)}</td>
      <td style="padding:8px">${mercado}</td>
    </tr>`;
  });
  body += '</table>';
}

body += `
<h2>⚠️ Disclaimer técnico</h2>
<p style="font-size:10pt;color:#475569">
Este relatório foi gerado pelo motor v3.0 do Especialista em Cantos com calibração por DNA de liga (arquétipos: ofensiva, equilibrada, trucada). Os scores refletem convergência de sinais (BP, Cisne, Vencedor, Enigma, Filtro OURO) ponderados pelo perfil cultural da liga, validado em auditoria sobre 132 jogos reais da rodada 01-04/05/2026.<br><br>
<b>Princípios operacionais:</b> dobrar stake em entradas com 3+ motores convergindo + sinal NUCLEAR + Cisne ≥ 2.5; reduzir/abster em ligas trucadas (ARG/ARG_B) quando o sinal for apenas BP MODERADA solo; nunca operar BR Teacher Over/Under até recalibração; em MLS, exigir Cisne ativo na rodada (≥ 5 sinais) antes de qualquer entrada.<br><br>
<b>Gerado automaticamente</b> por <code>_gerar_relatorio.js</code> em ${today}.
</p>
</body></html>
`;

const outFile = path.join(DIR, `Relatorio_Entradas_Rodada_10-05-2026.doc`);
fs.writeFileSync(outFile, body, 'utf8');

console.log('═══ RELATÓRIO GERADO ═══');
console.log('  Arquivo:', outFile);
console.log('  Jogos extraídos:', analisados.length);
console.log('  Por liga:');
Object.entries(porLiga).forEach(([L,arr]) => console.log('    '+L.padEnd(7)+': '+arr.length+' jogos'));
console.log('  Entradas recomendadas (score ≥ 50):', analisados.filter(a => a.scoreVencedor >= 50).length);
console.log('  Entradas moderadas (35-49):', analisados.filter(a => a.scoreVencedor >= 35 && a.scoreVencedor < 50).length);
console.log('  Atenção (20-34):', analisados.filter(a => a.scoreVencedor >= 20 && a.scoreVencedor < 35).length);
