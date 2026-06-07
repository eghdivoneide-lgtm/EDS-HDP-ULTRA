# 📜 Protocolo de Stake — EDS Especialista em Cantos

**Versão 1.0** — instituído em **2026-04-22** após 2 lotes de backtest real
(21 apostas MLS na Pinnacle).

## Motivação — o que os dados mostraram

Dois lotes consecutivos revelaram padrões não-aleatórios:

| Categoria | N | ROI | Observação |
|---|:-:|:-:|---|
| Under FT com TMI dupla < 1.0 | 5 | **+60%+** | 4V 1R, apenas 1 outlier (Atlanta, cauda do Poisson) |
| HDP HT com **cruzamento rigoroso** (top 5 atk × top 10 def) | 3 | **+80%+** | Columbus, San Jose × 2, todos verdes |
| HDP HT "favorito bonito" sem cruzamento | 6 | **−50%+** | Philadelphia, LAFC, NYRB, Toronto, Inter Miami e outros |

**Conclusão operacional**: o motor faz boas projeções, mas **o operador precisa
filtrar onde entrar**. As regras abaixo codificam esse filtro.

## As 4 regras

### 🎯 Regra 1 — Under FT reforçado (stake R$ 10)

```
SE  tmiHome < 1.0  E  tmiAway < 1.0  E  Sniper FT = UNDER
ENTÃO entrar com stake cheio R$ 10.
```

TMI dupla < 1.0 indica **jogo apático dos dois lados** (ambos produzindo menos
chutes do que a média da liga). Quando o Sniper corrobora, o sinal é duplo-
validado e historicamente o mais lucrativo.

**Implementação**: [index.html](../index.html) — campo `protocolo.under_ft_reforcado`
em `projecaoJogo()`. Mercado aparece como `"UNDER X (Sniper FT) 🎯 REFORÇADO"`
com 5★ forçadas e badge verde de stake.

### 🔒 Regra 2 — HDP HT liberado (stake R$ 5)

```
SE  mandante está no TOP 5 de HT Pró Casa da liga
E   visitante está no TOP 10 de HT Concede Fora da liga
E   probabilidade calculada pelo motor ≥ 60%
ENTÃO entrar com stake reduzido R$ 5.
```

O cruzamento estático (rankings) funciona como **filtro duplo**. Só passa se
os dois extremos convergem: atacante forte × defensor competente.

**Implementação**: função `getRankingHT()` calcula o ranking a cada troca de
liga; `projecaoJogo` expõe `protocolo.cruzamento_hdp_ht_liberado` e posições
exatas (`rank_m_atk_ht_casa.pos`, `rank_v_def_ht_fora.pos`). Se `false`, o
mercado **não aparece** nas recomendações.

### 🚫 Regra 3 — "Time bonito favorito" (stake R$ 0)

Corolário da regra 2: **se o cruzamento não passa, HDP HT não é recomendado.**
Entrar em HDP HT só porque "o time é favorito claro" drenou ROI
consistentemente nos dois lotes (Philadelphia, LAFC, NYRB).

**Implementação**: `gerarRecomendacoes()` só faz `recs.push` de HDP −1.5 Casa
se `prot.cruzamento_hdp_ht_liberado === true`.

### 🧘 Regra 4 — Outliers acontecem, não revanche

```
Com modelo 90% de acerto:
  ~8 apostas em 100 viram red por puro acaso (cauda pesada do Poisson).

Stop loss = stake cheio perdido.
Nunca dobrar stake após red para "recuperar" na próxima.
```

**Implementação**: banner fixo no rodapé de cada card do relatório Teacher
("Outliers acontecem em ~8% das apostas 90%+. Aceite o red, não dobre stake.").
Constante `PROTOCOLO_STAKE.LEMBRETE_ANTI_REVANCHE` acessível via console do
browser para auditoria.

## Como o app aplica o protocolo

1. **Ao trocar de liga**, `_rankingHTCache` é invalidado junto com
   `_forcaCantosCache`. Rankings são recalculados.
2. **Em `projecaoJogo(m, v)`**, depois do cálculo do Sniper, são populados os
   campos `protocolo.*`:
   - `rank_m_atk_ht_casa`, `rank_v_def_ht_fora`
   - `under_ft_reforcado`, `cruzamento_hdp_ht_liberado`
   - `tmi_ambos_baixos`
   - `stake_sugerido.under_ft`, `stake_sugerido.hdp_ht`
3. **Em `gerarRecomendacoes(p)`**, as regras filtram/turbinam:
   - Under FT reforçado → 5★ + badge + stake R$ 10
   - HDP HT liberado → badge `✅ cruzamento #X × #Y` + stake R$ 5
   - HDP HT sem cruzamento → não entra na lista
4. **Ordenação** prioriza apostas com `protocolo_stake` maior que zero, a
   seguir por estrelas, a seguir por probabilidade.
5. **Rodapé** de cada card mostra o lembrete anti-revanche.

## Ajustando o protocolo

Se após 3 lotes consecutivos uma regra mostrar-se calibrada errada, mexer em
`PROTOCOLO_STAKE` no [index.html](../index.html) (topo do script principal) e
registrar no histórico abaixo.

## Histórico de versões

- **v1.0 — 2026-04-22**: versão inicial. Fundada em 21 apostas MLS reais
  (lote 1 + lote 2). Limiares: TMI < 1.0, top 5 × top 10, stake R$ 10 / R$ 5.
