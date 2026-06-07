// normalizador_perfis.js — Retorna campos derivados para Object.assign em DNA_ESCOTEIRO
// BR: infere tendencia, volatilidade e fatores a partir dos xFT
// ARG: passa os campos ricos direto (já existem no raw)

window.normalizarPerfil = function(raw, liga) {
  var MEDIA_LIGA = { BR: 9.8, ARG: 8.5, MLS: 9.5, USL: 9.5 };
  var media = MEDIA_LIGA[liga] || 9.8;

  if (liga === 'BR') {
    var xFTm = raw.xFT_mandante || 0;
    var xFTv = raw.xFT_visitante || 0;
    return {
      xHT_mandante: raw.xHT_mandante,
      xFT_mandante: xFTm,
      xHT_visitante: raw.xHT_visitante,
      xFT_visitante: xFTv,
      tendencia_cantos: xFTm > xFTv ? 'crescente' : 'estavel',
      volatilidade: parseFloat(Math.abs(xFTm - xFTv).toFixed(2)),
      fator_ataque: parseFloat((xFTm / media).toFixed(2)),
      fator_defesa: parseFloat((xFTv / media).toFixed(2)),
      perfil_ataque: raw.perfil_ataque,
      perfil_defesa_vis: raw.perfil_defesa_vis,
      alertas: raw.alertas || []
    };
  }

  // ARG e outros — campos já presentes, passa direto
  return {
    xHT_mandante: raw.xHT_mandante,
    xFT_mandante: raw.xFT_mandante,
    xHT_visitante: raw.xHT_visitante,
    xFT_visitante: raw.xFT_visitante,
    tendencia_cantos: raw.tendencia_cantos,
    volatilidade: raw.volatilidade,
    fator_ataque: raw.fator_ataque,
    fator_defesa: raw.fator_defesa,
    posse_media: raw.posse_media != null ? raw.posse_media : null,
    finalizacoes_media: raw.finalizacoes_media != null ? raw.finalizacoes_media : null,
    perfil_ataque: raw.perfil_ataque,
    perfil_defesa_vis: raw.perfil_defesa_vis,
    alertas: raw.alertas || []
  };
};
