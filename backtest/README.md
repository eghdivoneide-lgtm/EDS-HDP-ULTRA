# 📊 Backtest — Apostas Reais vs Motor EDS

Este diretório guarda apostas **reais** feitas na Pinnacle com base nas
projeções do app. Cada lote virgem serve para duas coisas:

1. **Medir** o desempenho real do motor (ROI, win rate, edge vs mercado) em vez
   de confiar em número de confiança calculado.
2. **Recalibrar** os pesos OARF e outros parâmetros do `MOTOR_CONFIG` quando
   uma liga desviar consistentemente.

## Estrutura

- `bets_YYYY-MM-DD_to_DD.json` — um arquivo por lote de apostas. Schema:
  - `meta` — período, fonte, observações
  - `resumos_por_liga` — agregados manuais (para checar contra o script)
  - `agregado` — totais gerais
  - `apostas[]` — cada aposta com `data`, `liga`, `mandante`, `visitante`,
    `mercado`, `selecao`, `odd`, `stake`, `resultado` (`V`/`D`/`R`)
- `analisar.js` — script que lê o JSON e imprime:
  - Performance por liga (win rate, ROI, edge sobre implied)
  - Performance por tipo de mercado
  - Sugestão automática de ajuste do `OARF_PESO_POR_LIGA`
  - Concentração de erros (onde o dinheiro está vazando)

## Como rodar

```bash
node backtest/analisar.js                              # último lote (default)
node backtest/analisar.js backtest/bets_2026-05-01.json # lote específico
```

## Convenção de `resultado`

- `V` = aposta ganha. Lucro = `stake * (odd - 1)`.
- `D` = aposta perdida. Perda = `stake`.
- `R` = reembolso (push). Lucro = 0, stake devolvido.

## Como interpretar o relatório

### `WIN%`
Win rate real (V / (V + D)). Comparar com `IMPL%` (= 1/odd médio) para saber
se o app supera o mercado.

### `EDGE%`
`WIN% - IMPL%`. Se positivo, o app está identificando apostas que o mercado
subestima. **É o indicador mais importante** — ROI depende muito de odd, edge
é a medida pura da qualidade do sinal.

### `ROI%`
(Lucro / total apostado) × 100. Foi o que entrou no bolso.

### Amostra mínima
Não confiar em n < 15 por liga. Com n pequeno, variância natural engana.
Aguardar 2–3 lotes antes de mexer no OARF de uma liga.

## Loop de calibração

1. Coletar 1 semana de apostas reais (objetivo: 30+ por liga ativa).
2. Rodar `analisar.js`.
3. Para ligas com `n ≥ 15` e `ROI < 0%` por 2+ lotes consecutivos:
   baixar `OARF_PESO_POR_LIGA[liga]` em 0.10 no [index.html](../index.html).
4. Para ligas com `ROI ≥ +20%` e `EDGE% ≥ +10%`:
   considerar subir o peso em 0.10 (limite teto = 0.70).
5. Registrar cada mudança em commit separado com link pro lote que justificou.

## Histórico de ajustes

- **2026-04-22** — primeiro lote (`bets_2026-04-17_to_20.json`).
  Agregado: 86 apostas, ROI +15.2%, edge +8.6% — motor confirmadamente
  lucrativo em 5 dias de dados. MLS e ECU identificadas como outliers
  negativos; USL/J1/CHI com amostra pequena demais para agir.
