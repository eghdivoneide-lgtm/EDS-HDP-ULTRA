# 📊 ANÁLISE DE PODER ESTATÍSTICO — 12 Assinaturas Comportamentais

**Versão:** v1.0
**Data:** 2026-05-14
**Motivação:** auditoria externa (Claude Sonnet 4.6) apontou risco de p-hacking
ao "afrouxar threshold" de assinaturas que deram zero. Esta análise responde:
*"Qual N seria preciso pra detectar X% de efeito com poder 80%?"*

## Fórmula

Teste de proporção (aproximação normal):

```
N = ((z_alpha + z_beta)/efeito_minimo)² × p × (1−p)
onde:
  z_alpha = 1.96 (alpha 5% bicaudal)
  z_beta  = 0.84 (poder 80%)
  p       = prevalência esperada da assinatura
  efeito  = diferença mínima detectável (10%, 20%, 30%)
```

## Sumário Executivo

| Assinatura | N atual médio | Prev. obs. | N nec. (10%) | N nec. (20%) | N nec. (30%) | Status |
|---|---|---|---|---|---|---|
| **BLITZ_INICIAL** | 13 | 36.9% | 183 | 46 | 21 | 🔴 IMATURA (insuficiente até p/ 30%) |
| **RETRANCA_AVANCADA** | 13 | 7.3% | 53 | 14 | 6 | 🟡 Limitada (só detecta 30%+) |
| **EFETIVIDADE_CLINICA** | 13 | 19.8% | 125 | 32 | 14 | 🔴 IMATURA (insuficiente até p/ 30%) |
| **ATAQUE_ESTERIL** | 13 | 6.2% | 46 | 12 | 6 | ✅ Madura (poder suficiente p/ 20%) |
| **MURO_DEFENSIVO** | 13 | 1.7% | 14 | 4 | 2 | ⚠️ Extremo (revisar definição) |
| **DEFESA_PRECARIA** | 13 | 2.3% | 18 | 5 | 2 | ⚠️ Extremo (revisar definição) |
| **RUPTURA_HOME** | 13 | 34.6% | 178 | 45 | 20 | 🔴 IMATURA (insuficiente até p/ 30%) |
| **ELITE_KILLER** | 13 | 21.2% | 132 | 33 | 15 | 🔴 IMATURA (insuficiente até p/ 30%) |
| **CARRINHO_FACIL** | 13 | 3.9% | 30 | 8 | 4 | ⚠️ Extremo (revisar definição) |
| **DESEQUILIBRA_FAVORITO** | 13 | 32.1% | 171 | 43 | 19 | 🔴 IMATURA (insuficiente até p/ 30%) |
| **SUCUMBE_AZARAO** | 13 | 30.8% | 168 | 42 | 19 | 🔴 IMATURA (insuficiente até p/ 30%) |
| **TERMOMETRO_FORMA** | 13 | 0.0% | 196 | 49 | 22 | 🔴 IMATURA (N insuficiente p/ detectar 30%) |

## Por liga (detalhamento)

### BLITZ_INICIAL

Total: 66/179 times com presença (0 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 5 | 0 |
| BR_B | 20 | 8 | 0 |
| ARG | 30 | 14 | 0 |
| ARG_B | 36 | 11 | 0 |
| MLS | 30 | 11 | 0 |
| USL | 25 | 13 | 0 |
| BUN | 18 | 4 | 0 |

### RETRANCA_AVANCADA

Total: 13/179 times com presença (0 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 2 | 0 |
| BR_B | 20 | 3 | 0 |
| ARG | 30 | 2 | 0 |
| ARG_B | 36 | 0 | 0 |
| MLS | 30 | 3 | 0 |
| USL | 25 | 3 | 0 |
| BUN | 18 | 0 | 0 |

### EFETIVIDADE_CLINICA

Total: 35/177 times com presença (2 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 5 | 0 |
| BR_B | 18 | 4 | 2 |
| ARG | 30 | 2 | 0 |
| ARG_B | 36 | 3 | 0 |
| MLS | 30 | 9 | 0 |
| USL | 25 | 9 | 0 |
| BUN | 18 | 3 | 0 |

### ATAQUE_ESTERIL

Total: 11/177 times com presença (2 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 0 | 0 |
| BR_B | 18 | 2 | 2 |
| ARG | 30 | 3 | 0 |
| ARG_B | 36 | 3 | 0 |
| MLS | 30 | 2 | 0 |
| USL | 25 | 1 | 0 |
| BUN | 18 | 0 | 0 |

### MURO_DEFENSIVO

Total: 3/177 times com presença (2 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 0 | 0 |
| BR_B | 18 | 0 | 2 |
| ARG | 30 | 1 | 0 |
| ARG_B | 36 | 0 | 0 |
| MLS | 30 | 1 | 0 |
| USL | 25 | 1 | 0 |
| BUN | 18 | 0 | 0 |

### DEFESA_PRECARIA

Total: 4/177 times com presença (2 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 0 | 0 |
| BR_B | 18 | 0 | 2 |
| ARG | 30 | 1 | 0 |
| ARG_B | 36 | 0 | 0 |
| MLS | 30 | 2 | 0 |
| USL | 25 | 1 | 0 |
| BUN | 18 | 0 | 0 |

### RUPTURA_HOME

Total: 62/179 times com presença (0 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 5 | 0 |
| BR_B | 20 | 10 | 0 |
| ARG | 30 | 10 | 0 |
| ARG_B | 36 | 15 | 0 |
| MLS | 30 | 8 | 0 |
| USL | 25 | 8 | 0 |
| BUN | 18 | 6 | 0 |

### ELITE_KILLER

Total: 38/179 times com presença (0 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 7 | 0 |
| BR_B | 20 | 1 | 0 |
| ARG | 30 | 8 | 0 |
| ARG_B | 36 | 11 | 0 |
| MLS | 30 | 5 | 0 |
| USL | 25 | 3 | 0 |
| BUN | 18 | 3 | 0 |

### CARRINHO_FACIL

Total: 7/179 times com presença (0 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 1 | 0 |
| BR_B | 20 | 0 | 0 |
| ARG | 30 | 1 | 0 |
| ARG_B | 36 | 2 | 0 |
| MLS | 30 | 3 | 0 |
| USL | 25 | 0 | 0 |
| BUN | 18 | 0 | 0 |

### DESEQUILIBRA_FAVORITO

Total: 17/53 times com presença (126 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 6 | 3 | 14 |
| BR_B | 6 | 0 | 14 |
| ARG | 9 | 4 | 21 |
| ARG_B | 10 | 1 | 26 |
| MLS | 9 | 4 | 21 |
| USL | 8 | 2 | 17 |
| BUN | 5 | 3 | 13 |

### SUCUMBE_AZARAO

Total: 16/52 times com presença (127 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 6 | 2 | 14 |
| BR_B | 6 | 0 | 14 |
| ARG | 9 | 3 | 21 |
| ARG_B | 10 | 4 | 26 |
| MLS | 9 | 4 | 21 |
| USL | 7 | 2 | 18 |
| BUN | 5 | 1 | 13 |

### TERMOMETRO_FORMA

Total: 0/179 times com presença (0 não-avaliáveis).

| Liga | Avaliados | Presente | Não-avaliável |
|---|---|---|---|
| BR | 20 | 0 | 0 |
| BR_B | 20 | 0 | 0 |
| ARG | 30 | 0 | 0 |
| ARG_B | 36 | 0 | 0 |
| MLS | 30 | 0 | 0 |
| USL | 25 | 0 | 0 |
| BUN | 18 | 0 | 0 |


## Conclusão sobre TERMÔMETRO_FORMA = 0 em todas as ligas

A auditoria externa sugeriu que "afrouxar threshold de 1.5× para 1.3×"
seria p-hacking. Esta análise valida ou refuta com dados:

- **N médio por time:** 13 jogos
- **N necessário p/ detectar 20% de efeito (poder 80%, alpha 5%):** 49 jogos
- **N necessário p/ detectar 30% de efeito:** 22 jogos

**Diagnóstico:**
O N atual é INSUFICIENTE até pra detectar 30% de efeito. Marcar TERMÔMETRO_FORMA como **assinatura imatura** até ter ≥22 jogos/time. **NÃO afrouxar threshold** — seria correlação espúria.

**Recomendação operacional:** documentar TERMÔMETRO_FORMA como assinatura
em observação. Reavaliar após 2-3 temporadas adicionais de coleta de dados.

---

## Reprodutibilidade

Rodar com:
```bash
node _scripts/analise_poder.js
```

A partir do diretório `Auditoria Especialista em cantos/_AnaliseDNA/_scripts/`.

Gerado automaticamente — não editar manualmente.
