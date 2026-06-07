// perfis_br2026.js — Enriquece window.DNA_ESCOTEIRO.BR com dados de cantos
// Fonte: perfis_br2026.json (xHT, xFT, perfil_ataque, perfil_defesa_vis, alertas)
// Não cria variável paralela — mescla direto no objeto existente via Object.assign
(function() {
  var rawBR = {
    "Vitória":             { jogos_mandante:4, jogos_visitante:5, xHT_mandante:1.9,  xFT_mandante:5.19, xHT_visitante:1.77, xFT_visitante:4.26, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Remo":                { jogos_mandante:4, jogos_visitante:6, xHT_mandante:2.23, xFT_mandante:5.53, xHT_visitante:2.07, xFT_visitante:4.05, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Internacional":       { jogos_mandante:5, jogos_visitante:5, xHT_mandante:3.21, xFT_mandante:6.97, xHT_visitante:2.97, xFT_visitante:6.46, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Athletico-PR":        { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.91, xFT_mandante:5.57, xHT_visitante:1.67, xFT_visitante:4.16, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Coritiba":            { jogos_mandante:5, jogos_visitante:5, xHT_mandante:1.61, xFT_mandante:4.17, xHT_visitante:1.77, xFT_visitante:4.26, perfil_ataque:"PASSIVO", perfil_defesa_vis:"VULNERAVEL", alertas:[] },
    "Red Bull Bragantino": { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.61, xFT_mandante:5.97, xHT_visitante:2.27, xFT_visitante:5.06, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Atlético-MG":         { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.31, xFT_mandante:4.67, xHT_visitante:1.77, xFT_visitante:5.36, perfil_ataque:"PASSIVO", perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Palmeiras":           { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.51, xFT_mandante:5.47, xHT_visitante:2.07, xFT_visitante:4.56, perfil_ataque:"PADRAO",  perfil_defesa_vis:"VULNERAVEL", alertas:[] },
    "Fluminense":          { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.41, xFT_mandante:5.27, xHT_visitante:3.37, xFT_visitante:5.76, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Grêmio":              { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.71, xFT_mandante:5.37, xHT_visitante:1.77, xFT_visitante:4.16, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Corinthians":         { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.21, xFT_mandante:5.57, xHT_visitante:1.77, xFT_visitante:4.66, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Bahia":               { jogos_mandante:5, jogos_visitante:4, xHT_mandante:2.91, xFT_mandante:5.77, xHT_visitante:2.75, xFT_visitante:4.84, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Chapecoense":         { jogos_mandante:6, jogos_visitante:3, xHT_mandante:1.74, xFT_mandante:5.52, xHT_visitante:1.84, xFT_visitante:4.19, perfil_ataque:"PADRAO",  perfil_defesa_vis:"VULNERAVEL", alertas:[] },
    "Santos":              { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.51, xFT_mandante:5.37, xHT_visitante:3.07, xFT_visitante:5.36, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "São Paulo":           { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.41, xFT_mandante:5.97, xHT_visitante:2.37, xFT_visitante:5.06, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Flamengo":            { jogos_mandante:4, jogos_visitante:5, xHT_mandante:2.35, xFT_mandante:4.97, xHT_visitante:1.97, xFT_visitante:4.26, perfil_ataque:"PASSIVO", perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Mirassol":            { jogos_mandante:5, jogos_visitante:4, xHT_mandante:2.41, xFT_mandante:6.67, xHT_visitante:1.86, xFT_visitante:4.95, perfil_ataque:"PADRAO",  perfil_defesa_vis:"COMPACTO",   alertas:[] },
    "Vasco":               { jogos_mandante:6, jogos_visitante:4, xHT_mandante:3.1,  xFT_mandante:6.07, xHT_visitante:2.08, xFT_visitante:4.28, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Botafogo":            { jogos_mandante:3, jogos_visitante:6, xHT_mandante:1.89, xFT_mandante:4.34, xHT_visitante:1.43, xFT_visitante:3.87, perfil_ataque:"PASSIVO", perfil_defesa_vis:"PADRAO",     alertas:[] },
    "Cruzeiro":            { jogos_mandante:5, jogos_visitante:5, xHT_mandante:2.31, xFT_mandante:6.07, xHT_visitante:2.27, xFT_visitante:4.76, perfil_ataque:"PADRAO",  perfil_defesa_vis:"PADRAO",     alertas:[] }
  };

  var enriquecer = function() {
    if (!window.DNA_ESCOTEIRO || !window.DNA_ESCOTEIRO.BR) return;
    Object.keys(rawBR).forEach(function(nome) {
      var existente = window.DNA_ESCOTEIRO.BR[nome];
      if (!existente) return;
      Object.assign(existente, window.normalizarPerfil(rawBR[nome], 'BR'));
      if (!existente.alertas || !existente.alertas.length) {
        existente.alertas = existente.notas || [];
      }
    });
    console.log('[EDS] DNA_ESCOTEIRO.BR enriquecido com dados de cantos ✅');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enriquecer);
  } else {
    enriquecer();
  }

  // Tarefa 5 — validação no console
  setTimeout(function() {
    var fla = window.DNA_ESCOTEIRO && window.DNA_ESCOTEIRO.BR && window.DNA_ESCOTEIRO.BR['Flamengo'];
    console.log('[Teste] Flamengo enriquecido:', fla && fla.tendencia_cantos, fla && fla.fator_ataque);
  }, 1000);
})();
