const { chromium } = require('playwright');
const fs = require('fs');

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function delayRandom(min, max) {
  const time = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(resolve => setTimeout(resolve, time));
}

// Função para parear pacote exótico Flashscore (~SD÷...¬SG÷Corner kicks¬SH÷7¬SI÷8)
function parseFlashscoreStats(textoCru) {
  const statsResult = {
    m_posse: null, v_posse: null,
    m_chutes: null, v_chutes: null,
    m_cantos: null, v_cantos: null
  };

  const blocos = textoCru.split('~');
  blocos.forEach(bloco => {
    // Um bloco típico: SD÷14¬SG÷Corner kicks¬SH÷7¬SI÷8
    if (bloco.includes('SG÷')) {
      const parts = bloco.split('¬');
      let nome = ''; let m = 0; let v = 0;
      parts.forEach(p => {
        if (p.startsWith('SG÷')) nome = p.replace('SG÷', '').toLowerCase();
        if (p.startsWith('SH÷')) m = parseInt(p.replace('SH÷', '').replace('%', ''));
        if (p.startsWith('SI÷')) v = parseInt(p.replace('SI÷', '').replace('%', ''));
      });

      if (nome.includes('possession') || nome.includes('posse')) {
        if (statsResult.m_posse === null) { statsResult.m_posse = m || 0; statsResult.v_posse = v || 0; }
      } else if (nome.includes('corner') || nome.includes('escanteio') || nome.includes('cantos')) {
        if (statsResult.m_cantos === null) { statsResult.m_cantos = m || 0; statsResult.v_cantos = v || 0; }
      } else if (nome.includes('total shots') || nome.includes('goal attempts') || nome.includes('tentativas')) {
        if (statsResult.m_chutes === null || nome.includes('total shots')) {
           statsResult.m_chutes = m || 0;
           statsResult.v_chutes = v || 0;
        }
      }
    }
  });

  return statsResult;
}

(async () => {
  console.log('📡 Iniciando o Interceptador de Rede (Network Scraper) da USL...');

  if (!fs.existsSync('match_ids_usl.json')) {
    console.log('Erro: match_ids_usl.json não encontrado. Rode o caca_ids_usl.js primeiro.');
    return;
  }

  const matchIds = JSON.parse(fs.readFileSync('match_ids_usl.json', 'utf-8'));
  console.log(`Carregou ${matchIds.length} jogos da USL para minerar em MODO 100% ASSUSTADOR.`);

  // O Flashscore rastreia menos robôs quando headless é false, mas vamos acelerar a execução
  const browser = await chromium.launch({ headless: true }); 
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const resultadosDaLiga = [];

  for (let i = 0; i < matchIds.length; i++) {
    const id = matchIds[i];
    console.log(`[${i+1}/${matchIds.length}] Interceptando pacotes de: ${id}`);
    
    let res = { 
        id: id,
        mandante: '',
        visitante: '',
        gols: { ht: { m: 0, v: 0 }, ft: { m: 0, v: 0 } },
        cantos: { ht: { m: 0, v: 0 }, ft: { m: 0, v: 0 } },
        stats_taticas: { posse: { m: 0, v: 0 }, finalizacoes: { m: 0, v: 0 } }
    };

    let foundFTStats = false;
    let foundHTStats = false;

    // Escutamos ativamente QUALQUER pacote de estatísticas que cruzar a rede para este ID
    const interceptor = async (response) => {
        if (response.url().includes('feed/df_st_1_') && response.url().includes(id)) {
            try {
                const txt = await response.text();
                const parsed = parseFlashscoreStats(txt);
                res.cantos.ft.m = parsed.m_cantos; res.cantos.ft.v = parsed.v_cantos;
                res.stats_taticas.posse.m = parsed.m_posse; res.stats_taticas.posse.v = parsed.v_posse;
                res.stats_taticas.finalizacoes.m = parsed.m_chutes; res.stats_taticas.finalizacoes.v = parsed.v_chutes;
                foundFTStats = true;
            } catch(e) {}
        }
        if (response.url().includes('feed/df_st_2_') && response.url().includes(id)) {
            try {
                const txt = await response.text();
                const parsed = parseFlashscoreStats(txt);
                res.cantos.ht.m = parsed.m_cantos; res.cantos.ht.v = parsed.v_cantos;
                foundHTStats = true;
            } catch(e) {}
        }
    };
    
    page.on('response', interceptor);

    try {
      // Navegamos diretamente para a página de estatísticas FT
      await page.goto(`https://www.flashscore.com/match/${id}/#/match-summary/match-statistics/0`, { waitUntil: 'load', timeout: 25000 });
      
      // MÁGICA: O clicar na aba Stats dispara o fetch do payload na rede
      try {
         const abaStats = await page.getByRole('link', { name: /Estatísticas|Stats/i }).first();
         if (abaStats) await abaStats.click({timeout: 2000});
      } catch(e){}

      // Tentamos puxar Nomes dos times e Gols via DOM super rápido, se possível
      try {
          const dadosBasicos = await page.evaluate(() => {
              let h='', a='', hG=0, aG=0;
              const hEl = document.querySelector('.duelParticipant__home .participant__participantName');
              const aEl = document.querySelector('.duelParticipant__away .participant__participantName');
              if(hEl) h = hEl.textContent.trim();
              if(aEl) a = aEl.textContent.trim();
              
              const pHome = document.querySelector('.duelParticipant__home');
              const pAway = document.querySelector('.duelParticipant__away');
              if(pHome){
                  const score = pHome.closest('.duelParticipant').querySelector('.detailScore__wrapper');
                  if(score){
                      const spans = score.querySelectorAll('span');
                      if(spans.length >= 3){
                         hG = parseInt(spans[0].textContent) || 0;
                         aG = parseInt(spans[2].textContent) || 0;
                      }
                  }
              }
              return { mandante: h, visitante: a, gol_m: hG, gol_v: aG };
          });
          res.mandante = dadosBasicos.mandante;
          res.visitante = dadosBasicos.visitante;
          res.gols.ft.m = dadosBasicos.gol_m;
          res.gols.ft.v = dadosBasicos.gol_v;
      } catch(e){}

      // Aguarda o pacote FT descer e ser salvo antes de mudar de página
      let waitFT = 0;
      while(!foundFTStats && waitFT < 10) {
          await delay(500); waitFT++;
      }

      // Clicamos na aba HT para disparar a renderização do React
      try {
         const abaHT = await page.getByRole('link', { name: /1st Half|1º Tempo/i }).first();
         if (abaHT) await abaHT.click({timeout: 2000});
      } catch(e){}

      // Aguarda o pacote HT via rede descer com Retry
      let waitHT = 0;
      while(!foundHTStats && waitHT < 10) {
          await delay(500); waitHT++;
      }

      await delay(1000); // Aguarda renderizar as estatísticas na tela DOM caso não tenha achado na rede

      // ROTA HÍBRIDA: Lê as estatísticas ativas na tela do HTML para pegar os Cantos HT
      try {
          const htCantos = await page.evaluate(() => {
              let hm = 0, hv = 0;
              const divs = document.querySelectorAll('div');
              for (const c of divs) {
                  const txt = c.textContent.trim().toLowerCase();
                  // Procura a div exata que contém a palavra da estatística
                  if ((txt.includes('corner') || txt.includes('escanteio') || txt.includes('cantos')) && c.parentElement) {
                      const parentText = c.parentElement.innerText; 
                      // Geralmente o texto interno renderiza como: "2\nCorner kicks\n3"
                      if (parentText) {
                          const lines = parentText.split('\n').map(x => x.trim()).filter(x => x);
                          if (lines.length >= 3 && lines[1].toLowerCase().includes('corner')) {
                              hm = parseInt(lines[0]) || 0;
                              hv = parseInt(lines[2]) || 0;
                              break;
                          }
                      }
                  }
              }
              return { m: hm, v: hv };
          });
          
          res.cantos.ht.m = htCantos.m;
          res.cantos.ht.v = htCantos.v;
          if (htCantos.m > 0 || htCantos.v > 0) foundHTStats = true;
      } catch(e) {}

    } catch(err) {
      console.log(`Erro Crítico no ID ${id}: ${err.message}`);
    } finally {
      page.off('response', interceptor); // Limpa o ouvinte para a próxima iteração
    }

    console.log(`> Concluído [${res.mandante} x ${res.visitante}] | Cantos FT: ${res.cantos.ft.m}-${res.cantos.ft.v} | HT: ${res.cantos.ht.m}-${res.cantos.ht.v}`);
    resultadosDaLiga.push(res);
    
    // Escudo Anti-Bot (Rate Limit)
    const delayMs = await delayRandom(1500, 3800);
    console.log(`⏱️ (Atraso Humanizado de ${delayMs}ms)`);
  }

  const arquivoSaida = JSON.stringify(resultadosDaLiga, null, 2);
  fs.writeFileSync('raw_usl.json', arquivoSaida, 'utf-8');

  await browser.close();
  console.log('✅ Interceptação 100% Concluída! Arquivo raw_usl.json salvo com sucesso! Em seguida o formatador gerará o USL 2026 oficial.');
})();
