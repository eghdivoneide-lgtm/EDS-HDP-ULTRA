# MEMÓRIA — Auditoria Histórica EDS Especialista em Cantos
**Última auditoria: 2026-04-29**

## Contexto do app
- App: EDS Especialista em Cantos (PWA)
- Diretório: especialista-cantos/
- Motor núcleo: projecaoJogo() em index.html linhas 1679-2127
- Cisne Negro: filtro |expHomeFT - expAwayFT| >= 2.0 (linha 8848)
- Enigma SDE: 35% saldo + 30% prod + 20% DNA VED + 15% hist
- Pesos OARF calibrados via 158 apostas Pinnacle (ARG/ARG_B 0.70, BUN/ALM/USL 0.60, J1 0.45, BR 0.30, MLS 0.20)

## Achados-chave (rodada 25-27/04/2026 + walk-forward 2026)
- ROI real (MyBets, 41 apostas): +49% / WR 67%
- ROI walk-forward (707 projeções, threshold 2.0, hdp -0.5, odd 1.85): +26.4%
- ROI elite (threshold 3.0+): +63.7% em 26 apostas
- Cisne acerto direcional global: 70% em sinais ≥2.0; 88.5% em ≥3.0; 94.4% em [3.0, 4.0)

## Calibrações recomendadas
- Threshold Cisne ARG: 2.0 → 1.5 (acerto 73% na faixa)
- Threshold Cisne ARG_B: 2.0 → 1.5 (acerto 74% na faixa)
- Threshold Cisne MLS: 2.0 → 2.5 (motor não discrimina abaixo)
- Threshold Cisne BR/BUN: manter 2.0
- Tier "Cisne Elite" para sinais ≥3.0 (88.5% WR, 64% ROI)
- NÃO apostar em margem cheia (B1: -12% ROI confirmado)

## Times-zebra identificados (haircut sugerido 30%)
Deportivo Maipu, Deportivo Moron, Patronato, Almagro, San Telmo,
Chacarita Juniors, Central Norte, Instituto, Dep. Riestra, San Martin T.

## DNA das ligas
- BR: favorito-amigo, MAE 2.05 (melhor)
- ARG / ARG_B: alta variância placar, alta consistência cantos, ROI 35%+
- MLS: heterogêneo, MAE 3.04 (pior), ROI -7% no threshold 2.0
- BUN: estruturado, calibração monotônica clean
- J1, ALM: dados insuficientes (ainda)

## Arquivos da memória
- todos_jogos.json: 896 jogos normalizados das 7 ligas
- walkforward.json: 707 projeções walk-forward sem leak
- analise_completa.json: threshold curves, viés, calibração, missed ops, team DNA
- backtest_results.json: ROI de 7 estratégias

## Próximas auditorias devem
1. Replicar pipeline em walkforward.py com novos jogos
2. Comparar curva de calibração nova vs antiga (drift detection)
3. Atualizar lista de times-zebra
4. Revisar pesos OARF se houver mudança significativa

---
## ATUALIZAÇÃO 2026-04-29 — Re-inclusão J1 e ALM

**Erro corrigido:** profilar.py original exigia placar (gols) preenchido, o que descartava 100/111 jogos J1 e 83/90 jogos ALM (cantos coletados, gols não). Para auditoria de cantos, gols são irrelevantes.

**Resultado da re-análise:**
- J1: 101 projeções walk-forward, threshold ÓTIMO = 1.5 (62.5% acerto, +15.6% ROI)
- ALM: 78 projeções walk-forward, threshold ÓTIMO = 2.0 (75.0% acerto, +38.8% ROI)

**A-League é o achado da rodada**: 75% de acerto com threshold 2.0, segundo melhor ROI do conjunto.

**Impacto no consolidado:**
- +27 apostas elegíveis (threshold 2.0)
- +R$63 L/P adicional (R$10 stake, odd 1.85)
- ROI total praticamente igual (+25.7% vs +26.4%)

**Nova lista de threshold por liga:**
- BR: 2.0 (manter)
- ARG: 1.5 (reduzir)
- ARG_B: 1.5 (reduzir)
- MLS: 2.5 (aumentar — performance fraca)
- BUN: 2.0 (manter)
- J1: 1.5 (NOVO — não tinha calibração antes)
- ALM: 2.0 (NOVO — performance excepcional)

**Pendência de dados**: J1 e ALM precisam dos PLACARES (gols) coletados pra próximas auditorias incluírem mercados de gol. Cantos estão OK.

---
## ATUALIZAÇÃO 2026-04-30 — REGRA DE OURO MLS

**Descoberta validada com dados reais (286 apostas abril):**

MLS NÃO é liga perdedora. É liga DEPENDENTE de sinal Cisne. Comportamento por dia:
- 04/04 (Cisne silencioso): ROI -44%
- 17/04 (Cisne silencioso): ROI -34%
- 22/04 (Cisne moderado): ROI +3,6%
- 25/04 (Cisne com 10 sinais!): ROI +8,1%, WR 57%

**Regra operacional para MLS:**
APOSTAR APENAS quando Cisne Negro emitir 5+ sinais na rodada da MLS.
Se a varredura Cisne MLS retornar <5 jogos, não operar essa liga naquela semana.

**Subset de mercados que funcionam dentro de MLS quando Cisne está ativo:**
- Handicap moderado (-1 a -1.5): bom
- Handicap pesado (-2.5 a -3): excelente em times dominantes (Inter Miami, Vancouver, Toronto)
- HDP -0.5 sozinho: ruim (FC Cincinnati -0.5 ❌, LAFC -0.5 ❌)
- Over/Under contra dominância: ruim (Columbus Over quando Phila era favorito ❌)

**Lição operacional geral:**
Sinal silencioso do Cisne em uma liga = ficar de fora. Não forçar entrada por FOMO.

---
## ATUALIZAÇÃO 2026-04-29 — REGRA "CISNE ALTO vs TEACHER UNDER"

**Padrão detectado em 2 jogos J1 da rodada 29/04:**
- Urawa × Kawasaki: xCorners 7,72 → real 10 (+2,28)
- Mito × Machida: xCorners 6,64 → real 16 (+9,36)

**Quando há tensão entre motores:**
- Cisne ≥ 3 cantos + Teacher UNDER FT → APOSTAR SÓ HANDICAP CISNE, ignorar UNDER
- Cisne ≥ 3 + Teacher OVER alinhado → dupla aposta confiável
- Cisne 2-2.5 + Teacher UNDER → dupla OK
- Cisne < 2 (não emite sinal) + Teacher UNDER prob ≥85% → UNDER funciona como aposta isolada

**Razão estatística:**
Vantagem alta indica time atacando muito → gera cantos para ambos os lados
(time forte ataca, time fraco se encolhe e cruza fora) → volume total sobe.

**Resultado real Mito × Machida (10×6):**
- Machida -1.5 (recomendação Cisne): GANHARIA +R$25.50
- UNDER 8.5 (recomendação Teacher): PERDEU -R$20
- Líquido: +R$5.50 — ganho marginal, mas teria sido +R$25.50 só com Cisne
