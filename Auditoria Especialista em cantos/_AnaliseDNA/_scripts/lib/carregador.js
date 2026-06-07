// carregador.js — Lê data/*.js via eval em sandbox, retorna objetos das ligas
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

const LIGAS = [
  { id: 'BR',    nome: 'Brasileirão Série A',          arq: 'brasileirao2026.js',  varDados: 'DADOS_BR',    varDna: 'BR'    },
  { id: 'BR_B',  nome: 'Brasileirão Série B',          arq: 'brasileiraoB2026.js', varDados: 'DADOS_BR_B',  varDna: 'BR_B'  },
  { id: 'ARG',   nome: 'Argentina — Liga Profesional', arq: 'argentina2026.js',    varDados: 'DADOS_ARG',   varDna: 'ARG'   },
  { id: 'ARG_B', nome: 'Argentina — Primera Nacional', arq: 'argentina_b2026.js',  varDados: 'DADOS_ARG_B', varDna: 'ARG_B' },
  { id: 'MLS',   nome: 'Major League Soccer',           arq: 'mls2026.js',          varDados: 'DADOS_MLS',   varDna: 'MLS'   },
  { id: 'USL',   nome: 'USL Championship',              arq: 'usl2026.js',          varDados: 'DADOS_USL',   varDna: 'USL'   },
  { id: 'BUN',   nome: 'Bundesliga',                    arq: 'bundesliga2026.js',   varDados: 'DADOS_BUN',   varDna: 'BUN'   },
  // v3.1 (2026-05-15) — Japão reativado
  { id: 'J1',    nome: 'J1 League',                     arq: 'j1league2026.js',     varDados: 'DADOS_J1',    varDna: 'J1'    },
  { id: 'J2_J3', nome: 'J2 + J3 League',                arq: 'j2j3league2026.js',   varDados: 'DADOS_J2_J3', varDna: 'J2_J3' }
];

function carregarDataset(arquivo, varName) {
  const filePath = path.join(DATA_DIR, arquivo);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset não encontrado: ${filePath}`);
  }
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { window: {} };
  // eval no contexto do sandbox via Function (mais seguro que eval direto)
  const fn = new Function('window', code);
  fn(sandbox.window);
  if (!sandbox.window[varName]) {
    throw new Error(`Variável ${varName} não encontrada em ${arquivo}`);
  }
  return sandbox.window[varName];
}

function carregarDnaEscoteiro() {
  const filePath = path.join(DATA_DIR, 'dna_escoteiro.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`dna_escoteiro.js não encontrado: ${filePath}`);
  }
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { window: {} };
  const fn = new Function('window', code);
  fn(sandbox.window);
  if (!sandbox.window.DNA_ESCOTEIRO) {
    throw new Error('window.DNA_ESCOTEIRO não encontrado em dna_escoteiro.js');
  }
  return sandbox.window.DNA_ESCOTEIRO;
}

function carregarLiga(ligaId) {
  const meta = LIGAS.find(l => l.id === ligaId);
  if (!meta) throw new Error(`Liga ${ligaId} não está no escopo (BR, BR_B, ARG, ARG_B, MLS, USL, BUN, J1, J2_J3)`);
  const dados = carregarDataset(meta.arq, meta.varDados);
  const dna = carregarDnaEscoteiro();
  return {
    meta,
    dados,
    dna_liga: dna[meta.varDna] || null,
    dna_global: dna
  };
}

module.exports = { LIGAS, carregarDataset, carregarDnaEscoteiro, carregarLiga, DATA_DIR, PROJECT_ROOT };
