// normalizadores.js — Funções de normalização de nomes e datas

function norm(s) {
  if (!s) return '';
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function normalizarData(d) {
  if (!d) return null;
  const s = String(d).trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return s.slice(0, 10);
  if ((m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/))) return m[3] + '-' + m[2] + '-' + m[1];
  if ((m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/))) return m[3] + '-' + m[2] + '-' + m[1];
  return null;
}

// Encontra time no DNA Escoteiro com match exato → match parcial via norm()
function acharTimeNoDna(nome, ligaDna) {
  if (!ligaDna) return null;
  if (ligaDna[nome]) return { dna: ligaDna[nome], nomeKey: nome };
  const nNome = norm(nome);
  const chaves = Object.keys(ligaDna);
  // Match por norm exato
  const exato = chaves.find(k => norm(k) === nNome);
  if (exato) return { dna: ligaDna[exato], nomeKey: exato };
  // Match parcial (substring)
  const parcial = chaves.find(k => {
    const nk = norm(k);
    return nk.includes(nNome) || nNome.includes(nk);
  });
  if (parcial) return { dna: ligaDna[parcial], nomeKey: parcial };
  return null;
}

// Forma score: V=1, E=0.5, D=0 — média dos 5 chars
function formaScore(forma) {
  const f = String(forma || 'EEEEE').split('').slice(0, 5);
  if (!f.length) return 0.5;
  const valores = f.map(c => c === 'V' ? 1 : c === 'E' ? 0.5 : 0);
  return valores.reduce((s, n) => s + n, 0) / valores.length;
}

// Desvio padrão
function desvio(arr) {
  if (!arr || arr.length === 0) return 0;
  const m = arr.reduce((s, n) => s + n, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, n) => s + (n - m) ** 2, 0) / arr.length);
}

// Média
function media(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

// Arredondamento bonito
function r(n, casas = 2) {
  if (n == null || isNaN(n)) return null;
  const p = Math.pow(10, casas);
  return Math.round(n * p) / p;
}

// Percentil dentro da liga (0-100). valor=mediana → ~50
function percentil(valor, todosValores) {
  if (!todosValores || todosValores.length === 0) return 50;
  const sorted = [...todosValores].sort((a, b) => a - b);
  let menores = 0;
  for (const v of sorted) {
    if (v < valor) menores++;
    else if (v === valor) menores += 0.5;
    else break;
  }
  return (menores / sorted.length) * 100;
}

module.exports = { norm, normalizarData, acharTimeNoDna, formaScore, desvio, media, r, percentil };
