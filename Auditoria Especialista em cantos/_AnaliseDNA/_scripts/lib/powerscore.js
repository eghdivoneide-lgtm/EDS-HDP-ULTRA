// powerscore.js — PowerScore + percentil + categorização ELITE/MÉDIO/AZARÃO
const { formaScore, percentil, r } = require('./normalizadores');

// Calcula o powerRaw bruto a partir do DNA Escoteiro
function calcularPowerRaw(dnaTime) {
  if (!dnaTime) return null;
  const gp = +(dnaTime.gp_jogo ?? 0);
  const gc = +(dnaTime.gc_jogo ?? 0);
  const fs = formaScore(dnaTime.forma);
  const casaV = +(dnaTime.casa_v_pct ?? 0);
  const foraV = +(dnaTime.fora_v_pct ?? 0);
  const vPctGeral = (casaV + foraV) / 2;

  // Fórmula do prompt 5.1.1
  const raw = (gp * 30) + ((2 - gc) * 20) + (fs * 25) + (vPctGeral * 0.25);
  return r(raw, 2);
}

// Normaliza para 0-100 dentro da liga (percentil)
function normalizarParaLiga(rawsPorTime) {
  const valores = Object.values(rawsPorTime).filter(v => v != null);
  const out = {};
  for (const [time, raw] of Object.entries(rawsPorTime)) {
    if (raw == null) {
      out[time] = { powerRaw: null, powerScore: null, powerPercentil: null, categoria: 'SEM_DNA' };
      continue;
    }
    const pct = percentil(raw, valores);
    let categoria;
    if (pct >= 70) categoria = 'ELITE';
    else if (pct >= 30) categoria = 'MÉDIO';
    else categoria = 'AZARÃO';
    out[time] = {
      powerRaw: r(raw, 2),
      powerScore: r(pct, 1),
      powerPercentil: r(pct, 1),
      categoria
    };
  }
  return out;
}

module.exports = { calcularPowerRaw, normalizarParaLiga };
