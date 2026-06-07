// ════════════════════════════════════════════════════════════════
// ANÁLISE DE PODER ESTATÍSTICO — 12 Assinaturas Comportamentais
// v1.0 — 2026-05-14 — pós-auditoria externa
//
// Pergunta: pra cada assinatura, qual N seria necessário pra detectar
// efeito de 10%, 20%, 30% com poder 80% e alpha 5%?
//
// Fórmula (teste de proporção, aproximação normal):
//   N = ((z_alpha + z_beta)/efeito_minimo)² × p × (1-p)
//   z_alpha = 1.96 (alpha 5% bicaudal)
//   z_beta  = 0.84 (poder 80%)
//
// Output: _ANALISE_PODER_ASSINATURAS.md no diretório pai
// ════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const DIR_MASTER = path.join(__dirname, '..');
const MASTER_PATH = path.join(DIR_MASTER, '_MEMORIA_TIMES_MASTER.json');
const OUT_PATH = path.join(DIR_MASTER, '_ANALISE_PODER_ASSINATURAS.md');

const Z_ALPHA = 1.96;
const Z_BETA = 0.84;

function nNecessario(efeito, prevalencia) {
  return Math.ceil(Math.pow((Z_ALPHA + Z_BETA) / efeito, 2) * prevalencia * (1 - prevalencia));
}

// Lê master JSON
if (!fs.existsSync(MASTER_PATH)) {
  console.error('❌ Master JSON não encontrado:', MASTER_PATH);
  process.exit(1);
}
const master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));

// Coleta: pra cada assinatura, em cada liga, calcula:
// - n_times: quantos times tem dado válido (não nao_avaliavel)
// - n_presente: quantos têm presente:true
// - n_jogos_total: soma de n_jogos dos times avaliados
const NOMES_ASSINATURAS = [
  'BLITZ_INICIAL', 'RETRANCA_AVANCADA', 'EFETIVIDADE_CLINICA',
  'ATAQUE_ESTERIL', 'MURO_DEFENSIVO', 'DEFESA_PRECARIA',
  'RUPTURA_HOME', 'ELITE_KILLER', 'CARRINHO_FACIL',
  'DESEQUILIBRA_FAVORITO', 'SUCUMBE_AZARAO', 'TERMOMETRO_FORMA'
];

const LIGAS = ['BR', 'BR_B', 'ARG', 'ARG_B', 'MLS', 'USL', 'BUN', 'J1', 'J2_J3'];

const dados = {};
NOMES_ASSINATURAS.forEach(nome => {
  dados[nome] = {
    total_times_avaliados: 0,
    total_presente: 0,
    total_nao_avaliavel: 0,
    soma_n_jogos: 0,
    por_liga: {}
  };
});

LIGAS.forEach(L => {
  const liga = master[L];
  if (!liga || !liga.times) return;
  const times = liga.times;
  NOMES_ASSINATURAS.forEach(nome => {
    let n_avaliado = 0, n_presente = 0, n_nao_aval = 0, soma_jogos = 0;
    Object.values(times).forEach(t => {
      const a = (t.assinaturas || []).find(x => x.nome === nome);
      if (!a) return;
      if (a.nao_avaliavel) { n_nao_aval++; return; }
      n_avaliado++;
      if (a.presente) n_presente++;
      soma_jogos += (t.baseline && t.baseline.n_jogos) ? t.baseline.n_jogos : 0;
    });
    dados[nome].por_liga[L] = { n_avaliado, n_presente, n_nao_aval };
    dados[nome].total_times_avaliados += n_avaliado;
    dados[nome].total_presente += n_presente;
    dados[nome].total_nao_avaliavel += n_nao_aval;
    dados[nome].soma_n_jogos += soma_jogos;
  });
});

// Gera Markdown
let md = `# 📊 ANÁLISE DE PODER ESTATÍSTICO — 12 Assinaturas Comportamentais

**Versão:** v1.0
**Data:** 2026-05-14
**Motivação:** auditoria externa (Claude Sonnet 4.6) apontou risco de p-hacking
ao "afrouxar threshold" de assinaturas que deram zero. Esta análise responde:
*"Qual N seria preciso pra detectar X% de efeito com poder 80%?"*

## Fórmula

Teste de proporção (aproximação normal):

\`\`\`
N = ((z_alpha + z_beta)/efeito_minimo)² × p × (1−p)
onde:
  z_alpha = 1.96 (alpha 5% bicaudal)
  z_beta  = 0.84 (poder 80%)
  p       = prevalência esperada da assinatura
  efeito  = diferença mínima detectável (10%, 20%, 30%)
\`\`\`

## Sumário Executivo

| Assinatura | N atual médio | Prev. obs. | N nec. (10%) | N nec. (20%) | N nec. (30%) | Status |
|---|---|---|---|---|---|---|
`;

NOMES_ASSINATURAS.forEach(nome => {
  const d = dados[nome];
  if (d.total_times_avaliados === 0) {
    md += `| **${nome}** | — | — | — | — | — | ⏸️ Nenhum time avaliável |\n`;
    return;
  }
  const nMedioJogos = Math.round(d.soma_n_jogos / Math.max(d.total_times_avaliados, 1));
  const prevalencia = d.total_presente / d.total_times_avaliados;
  // Pra prevalência 0 ou 1, usa 0.5 como conservador (worst-case variância)
  const p = (prevalencia === 0 || prevalencia === 1) ? 0.5 : prevalencia;
  const n10 = nNecessario(0.10, p);
  const n20 = nNecessario(0.20, p);
  const n30 = nNecessario(0.30, p);

  let status;
  if (prevalencia === 0) {
    status = nMedioJogos < n30 ? '🔴 IMATURA (N insuficiente p/ detectar 30%)' : '🟡 Inativa (threshold pode estar correto)';
  } else if (prevalencia >= 0.9 || prevalencia <= 0.05) {
    status = '⚠️ Extremo (revisar definição)';
  } else if (nMedioJogos >= n20) {
    status = '✅ Madura (poder suficiente p/ 20%)';
  } else if (nMedioJogos >= n30) {
    status = '🟡 Limitada (só detecta 30%+)';
  } else {
    status = '🔴 IMATURA (insuficiente até p/ 30%)';
  }

  md += `| **${nome}** | ${nMedioJogos} | ${(prevalencia*100).toFixed(1)}% | ${n10} | ${n20} | ${n30} | ${status} |\n`;
});

md += `
## Por liga (detalhamento)

`;
NOMES_ASSINATURAS.forEach(nome => {
  const d = dados[nome];
  md += `### ${nome}\n\n`;
  md += `Total: ${d.total_presente}/${d.total_times_avaliados} times com presença (${d.total_nao_avaliavel} não-avaliáveis).\n\n`;
  md += `| Liga | Avaliados | Presente | Não-avaliável |\n|---|---|---|---|\n`;
  LIGAS.forEach(L => {
    const l = d.por_liga[L] || {};
    md += `| ${L} | ${l.n_avaliado||0} | ${l.n_presente||0} | ${l.n_nao_aval||0} |\n`;
  });
  md += `\n`;
});

md += `
## Conclusão sobre TERMÔMETRO_FORMA = 0 em todas as ligas

A auditoria externa sugeriu que "afrouxar threshold de 1.5× para 1.3×"
seria p-hacking. Esta análise valida ou refuta com dados:

`;
const tf = dados['TERMOMETRO_FORMA'];
if (tf && tf.total_times_avaliados > 0) {
  const nMedio = Math.round(tf.soma_n_jogos / tf.total_times_avaliados);
  const nNec30 = nNecessario(0.30, 0.5);
  const nNec20 = nNecessario(0.20, 0.5);
  md += `- **N médio por time:** ${nMedio} jogos
- **N necessário p/ detectar 20% de efeito (poder 80%, alpha 5%):** ${nNec20} jogos
- **N necessário p/ detectar 30% de efeito:** ${nNec30} jogos

**Diagnóstico:**
${nMedio >= nNec20
  ? `O N atual É SUFICIENTE pra detectar 20% de efeito. Como deu zero, a hipótese mais provável é que **o efeito não existe ou está abaixo do threshold real**. Afrouxar 1.5×→1.3× seria, sim, p-hacking.`
  : nMedio >= nNec30
    ? `O N atual só permite detectar efeito ≥30%. Pode haver efeito real menor não capturado. Recomendação: **não afrouxar threshold sem antes coletar mais dados** (2-3 temporadas).`
    : `O N atual é INSUFICIENTE até pra detectar 30% de efeito. Marcar TERMÔMETRO_FORMA como **assinatura imatura** até ter ≥${nNec30} jogos/time. **NÃO afrouxar threshold** — seria correlação espúria.`}

**Recomendação operacional:** documentar TERMÔMETRO_FORMA como assinatura
em observação. Reavaliar após 2-3 temporadas adicionais de coleta de dados.
`;
} else {
  md += `Sem dados suficientes pra análise.\n`;
}

md += `
---

## Reprodutibilidade

Rodar com:
\`\`\`bash
node _scripts/analise_poder.js
\`\`\`

A partir do diretório \`Auditoria Especialista em cantos/_AnaliseDNA/_scripts/\`.

Gerado automaticamente — não editar manualmente.
`;

fs.writeFileSync(OUT_PATH, md, 'utf8');
console.log('✅ Análise de poder estatística gerada:', OUT_PATH);
console.log('   Tamanho:', (fs.statSync(OUT_PATH).size/1024).toFixed(1), 'KB');
