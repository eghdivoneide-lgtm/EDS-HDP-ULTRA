# 🧬 DNA ESCOTEIRO — Gerar perfis qualitativos das 5 ligas faltantes

> **Tarefa para a IA externa:** preencher a memória qualitativa (DNA Escoteiro / YAAKEN) para as 5 ligas que estão sem cobertura, usando os dados já disponíveis neste kit.
>
> **Resultado:** JSON colável no `data/memoria_qualitativa.js` do app principal, fechando 100% da cobertura DNA ESCOTEIRO em todas as 9 ligas.

---

## 🎯 Contexto: o que é DNA ESCOTEIRO

O **DNA ESCOTEIRO** (ou **Memória Qualitativa YAAKEN**) é uma camada de inteligência **qualitativa** que complementa o `MEMORIA_DNA` (quantitativo). Enquanto o `MEMORIA_DNA` traz PowerScore + buckets + assinaturas (números crus), o DNA ESCOTEIRO traz **interpretação**: multiplicadores de ataque/defesa por contexto, alertas operacionais nomeados, tendências, volatilidade.

O SmartCoach do app usa o DNA ESCOTEIRO para **ajustar a projeção Poisson** de cada jogo. Sem ele, o SmartCoach trabalha com modelo "cego" para nuances de estilo do time.

### Cobertura atual no app (atualizado 2026-05-16)

| Liga | `memoria_qualitativa.js` (Calibração Teacher) | `dna_escoteiro.js` (Notas DNA + DNA PROFUNDO) |
|---|---|---|
| ARG | ✅ existente | ✅ existente |
| MLS | ✅ existente | ✅ existente |
| BR | ✅ existente | ✅ existente |
| USL | ✅ existente | ✅ existente |
| BR_B | ✅ gerado 2026-05-16 | ✅ existente |
| ARG_B | ✅ gerado 2026-05-16 | ✅ existente |
| BUN | ✅ gerado 2026-05-16 | ✅ existente |
| J2_J3 | ✅ gerado 2026-05-16 | ✅ existente |
| J1 | ✅ gerado 2026-05-16 | ✅ gerado 2026-05-16 (⚠️ amostra pequena, multiplicadores neutros) |

**Resultado:** 9/9 ligas operáveis com ambas as camadas qualitativas. SmartCoach do app injeta automaticamente CALIBRAÇÃO TEACHER + Notas DNA + DNA PROFUNDO.

### O kit traz duas referências reais

- `_REFERENCIA_memoria_qualitativa_atual.js` — formato com `perfis_times[NOME].xFT_mandante / perfil_ataque / fator_ataque / alertas`.
- `_REFERENCIA_dna_escoteiro_atual.js` — formato com `[NOME].perfil / forma / casa_v_pct / gp_jogo / notas` (camada qualitativa narrativa do YAAKEN).

Se for regenerar para uma rodada nova, a IA externa pode espelhar os dois formatos.

---

## 📐 Estrutura JSON esperada (esquema completo)

```json
{
  "<LIGA>": {
    "liga": "<Nome formal da liga> 2026",
    "gerado_em": "2026-05-16",
    "jogos_analisados": <int — total de jogos no histórico da liga>,

    "baseline": {
      "media_cantos_HT": <float, 2 casas>,
      "media_cantos_FT": <float, 2 casas>,
      "l_htH": <float — lambda Poisson HT mandante = média cantos HT casa>,
      "l_htA": <float — lambda Poisson HT visitante>,
      "l_ftH": <float — lambda Poisson FT mandante>,
      "l_ftA": <float — lambda Poisson FT visitante>
    },

    "calibracao_teacher": {
      "versao": "Volvo Test v2 (Zona Neutra Poisson)",
      "rodada_validada": <int — última rodada com dados completos>,
      "data_referencia": "<YYYY-MM-DD da rodada validada>",
      "jogos_validados": <int — jogos daquela rodada>,
      "media_cantos_ht_real": <float>,
      "media_cantos_ft_real": <float>,
      "taxa_over_3_5_ht": <float — % de jogos com >3.5 cantos HT>,
      "taxa_over_4_5_ht": <float>,
      "taxa_over_5_5_ht": <float>,
      "taxa_over_8_5_ft": <float — % de jogos com >8.5 cantos FT>,
      "taxa_over_9_5_ft": <float>,
      "taxa_over_10_5_ft": <float>,
      "taxa_over_11_5_ft": <float>,
      "min_cantos_ft": <int>,
      "max_cantos_ft": <int>,
      "min_cantos_ht": <int>,
      "max_cantos_ht": <int>,
      "insights": [
        "<frase em pt-BR descrevendo padrão observado>",
        "<até 4 insights, máx>"
      ],
      "jogos_destaque": [
        { "mandante": "<nome>", "visitante": "<nome>", "cantos_ht": <int>, "cantos_ft": <int> }
        // 3-5 jogos de alta produção
      ]
    },

    "perfis_times": {
      "<NOME_DO_TIME>": {
        "n_jogos": <int>,
        "xHT_mandante": <float — média cantos HT em casa>,
        "xFT_mandante": <float — média cantos FT em casa>,
        "xHT_visitante": <float — média cantos HT fora>,
        "xFT_visitante": <float — média cantos FT fora>,
        "xContra_mandante": <float — cantos sofridos em casa>,
        "xContra_visitante": <float — cantos sofridos fora>,
        "posse_media": <float — % posse média>,
        "finalizacoes_media": <float — chutes por jogo>,
        "tendencia_cantos": "<crescente | estavel | decrescente>",
        "volatilidade": <float — desvio padrão dos cantos FT>,
        "perfil_ataque": "<DOMINANTE | PADRAO | PASSIVO>",
        "perfil_defesa_vis": "<FORTALEZA | PADRAO | VULNERAVEL>",
        "fator_ataque": <float entre 0.5 e 1.5 — multiplicador vs baseline da liga>,
        "fator_defesa": <float entre 0.5 e 1.5 — quanto sofre vs baseline>,
        "alertas": [
          "<nome do alerta>: <descrição>"
          // 0 a 3 alertas — só se houver evidência objetiva
        ]
      }
    }
  }
}
```

---

## 🔍 Como derivar cada campo (regras precisas)

### Baseline da liga

| Campo | Fórmula |
|---|---|
| `media_cantos_HT` | Soma de `cantos.ht.m + cantos.ht.v` de todos os jogos ÷ total de jogos |
| `media_cantos_FT` | Soma de `cantos.ft.m + cantos.ft.v` ÷ total de jogos |
| `l_htH` | Soma de `cantos.ht.m` ÷ total de jogos (lambda mandante HT) |
| `l_htA` | Soma de `cantos.ht.v` ÷ total de jogos |
| `l_ftH` | Soma de `cantos.ft.m` ÷ total de jogos |
| `l_ftA` | Soma de `cantos.ft.v` ÷ total de jogos |

### Calibracao Teacher

Use a **última rodada completa** do histórico (ex.: rodada 16 do BR, rodada 11 do BUN, etc.):

1. Filtre os jogos daquela rodada.
2. Calcule médias HT/FT reais.
3. Calcule taxas Over (Over 3.5 HT = % de jogos com total HT > 3.5).
4. Identifique min/max de cantos.
5. **`insights`**: gere 2-4 frases em pt-BR descrevendo padrões observados. Exemplos:
   - "Liga ofensiva no HT: média 4.6 cantos — Over 4.5 HT acertou 58% dos jogos"
   - "Alta variância (min=3, max=15) — overdispersion severo, Poisson pode subestimar extremos"
   - "Times mandantes dominam: 62% dos cantos no FT são do time da casa"
6. **`jogos_destaque`**: liste 3-5 jogos da rodada com produção atípica (cantos FT > média + 1.5×desvio, OU min/max extremos).

### Perfil de cada time

Para cada time da liga (`MEMORIA_DNA[LIGA].times[NOME].baseline`):

| Campo | Como derivar |
|---|---|
| `n_jogos` | `MEMORIA_DNA[LIGA].times[NOME].baseline.n_jogos` |
| `xHT_mandante` | Calcule do histórico: média cantos.ht.m dos jogos onde o time é mandante |
| `xFT_mandante` | Idem, mas `cantos.ft.m` |
| `xHT_visitante` | Média de `cantos.ht.v` dos jogos onde o time é visitante |
| `xFT_visitante` | Idem, `cantos.ft.v` |
| `xContra_mandante` | Média de `cantos.ft.v` quando o time é mandante (cantos do adversário fora) |
| `xContra_visitante` | Média de `cantos.ft.m` quando o time é visitante |
| `posse_media` | Média do `stats_taticas.posse.m` (mandante) ou `.v` (visitante) — agregue por contexto |
| `finalizacoes_media` | Idem para `stats_taticas.finalizacoes` |
| `tendencia_cantos` | Compare os últimos 3 jogos vs os 3 anteriores: **crescente** se >1 canto a mais, **decrescente** se <1 a menos, **estavel** caso contrário |
| `volatilidade` | Desvio padrão amostral (n-1) dos `cantos.ft.m + cantos.ft.v` dos jogos do time |
| `perfil_ataque` | **DOMINANTE** se `xFT_mandante` > `baseline.l_ftH` × 1.15. **PASSIVO** se < `l_ftH` × 0.85. **PADRAO** caso contrário |
| `perfil_defesa_vis` | **FORTALEZA** se `xContra_mandante` < `baseline.l_ftA` × 0.85. **VULNERAVEL** se > `l_ftA` × 1.15. **PADRAO** caso contrário |
| `fator_ataque` | `xFT_mandante` ÷ `baseline.l_ftH` (com clamp 0.5-1.5) |
| `fator_defesa` | `xContra_mandante` ÷ `baseline.l_ftA` (com clamp 0.5-1.5) |
| `alertas` | Veja seção "Alertas nomeados" abaixo |

### Alertas nomeados (use só com evidência objetiva)

| Alerta | Critério de ativação |
|---|---|
| `OVER_HT_FAVORAVEL: pressão no 1T acima da média da liga` | `xHT_mandante` > `baseline.l_htH` × 1.25 |
| `OVER_FT_FAVORAVEL: ritmo ofensivo elevado no FT` | `xFT_mandante` > `baseline.l_ftH` × 1.20 |
| `UNDER_FAVORAVEL: jogos apáticos vs média da liga` | `xFT_mandante + xContra_mandante` < `baseline.media_cantos_FT` × 0.80 |
| `RUPTURA_HOME_AWAY: comportamento radicalmente diferente casa/fora` | `|xFT_mandante - xFT_visitante|` > 2.5 |
| `DEFESA_PRECARIA: sofre cantos acima da liga` | `xContra_mandante > baseline.l_ftA × 1.35` |
| `FORTALEZA_DEFENSIVA: defesa em casa abaixo da liga` | `xContra_mandante < baseline.l_ftA × 0.65` |
| `MOMENTUM_CRESCENTE: produção subindo nos últimos 3 jogos` | tendencia_cantos = "crescente" + últimos 3 ≥ baseline × 1.15 |
| `VOLATIL: alta variância de cantos por jogo` | `volatilidade > 3.5` |

---

## 📝 Prompt-template para a IA externa

Cole o texto abaixo na conversa com a outra IA, **depois** de ter colado o `05_BUNDLE_COMPLETO.md`:

---

> **Tarefa:** gere o DNA ESCOTEIRO (memória qualitativa YAAKEN) para as 5 ligas que estão sem cobertura: **BR_B, ARG_B, BUN, J1, J2_J3**.
>
> **Dados disponíveis para você nesta sessão:**
> - `03_MEMORIA_DNA.json` — PowerScore, baselines, buckets, assinaturas, narrativas (já consolidado).
> - `04_HISTORICO_JOGO_A_JOGO/<LIGA>.json` — histórico jogo-a-jogo cronológico de cada liga (1.717 jogos totais).
> - `01_METODOLOGIA.md`, `02_CALIBRACOES_LIGAS.md`, `06_DNA_ESCOTEIRO.md` — instruções e fórmulas.
> - `_REFERENCIA_memoria_qualitativa_atual.js` — exemplo real do que o app já tem para BR/ARG/MLS/USL.
>
> **O que produzir:**
>
> 1. Para CADA uma das 5 ligas (BR_B, ARG_B, BUN, J1, J2_J3), gere o objeto JSON completo seguindo o esquema do `06_DNA_ESCOTEIRO.md`.
> 2. Use as fórmulas precisas da seção "Como derivar cada campo" — NÃO chute, calcule dos dados.
> 3. Para cada time da liga, inclua perfil completo (n_jogos, x*, perfil_ataque, perfil_defesa_vis, fator_ataque, fator_defesa, alertas).
> 4. Gere a seção `calibracao_teacher` usando a última rodada completa do histórico.
> 5. Gere 2-4 `insights` em pt-BR para cada liga, descrevendo padrões observáveis (não genéricos).
>
> **Formato de output:**
>
> Devolva 5 blocos JSON separados, um por liga, no formato:
>
> ```json
> "BR_B": { ... },
> "ARG_B": { ... },
> "BUN": { ... },
> "J1": { ... },
> "J2_J3": { ... }
> ```
>
> Cada bloco DEVE conter `liga`, `gerado_em`, `jogos_analisados`, `baseline`, `calibracao_teacher`, `perfis_times` (com TODOS os times da liga).
>
> **Restrições:**
>
> - Use apenas dados disponíveis nos JSONs anexos. Nada de "achismo elegante" baseado no seu treinamento pré-2026.
> - Floats com 2 casas decimais.
> - Strings em pt-BR.
> - Mantenha consistência com a estrutura do `_REFERENCIA_memoria_qualitativa_atual.js`.
> - Se um time tem n_jogos < 4, marque o perfil como `"perfil_ataque": "PADRAO"` e `"perfil_defesa_vis": "PADRAO"` (amostra insuficiente).
> - Validação final: cada `perfil_ataque` e `perfil_defesa_vis` DEVE ser uma das 3 categorias permitidas (DOMINANTE/PADRAO/PASSIVO ou FORTALEZA/PADRAO/VULNERAVEL).
>
> **Confirme antes:** repita em uma frase o que vai produzir, então execute.

---

## 🔌 Como mesclar o output de volta no app

Quando a IA externa devolver os 5 blocos JSON:

1. **Abra** `data/memoria_qualitativa.js`.
2. Localize o final do bloco `"USL": { ... }` (linha ~1470, antes do fechamento `}`).
3. **Insira após o `}` do USL** (com vírgula separadora) os 5 novos blocos:

```javascript
window.MEMORIA_QUALITATIVA = {
  "ARG": { ... },
  "MLS": { ... },
  "BR":  { ... },
  "USL": { ... },
  "BR_B":  { ... },   // ← NOVO
  "ARG_B": { ... },   // ← NOVO
  "BUN":   { ... },   // ← NOVO
  "J1":    { ... },   // ← NOVO
  "J2_J3": { ... }    // ← NOVO
};
```

4. **Atualize o cabeçalho** do arquivo:
   ```
   // Todas as ligas: 9 (BR, BR_B, ARG, ARG_B, MLS, USL, BUN, J1, J2_J3)
   // Atualizado: <data>
   ```
5. **Cache-buster:** se o `index.html` carrega `<script src="data/memoria_qualitativa.js?v=...">`, bumpe a versão.
6. **Teste:** abra o app no http://localhost:8765, vá para o Smartcoach, faça pergunta sobre um jogo de BR_B/ARG_B/BUN/J1/J2_J3. Verifique que o contexto agora inclui "🧬 DNA ESCOTEIRO".

---

## ✅ Resultado esperado

Após mesclar, o SmartCoach do app passa a ter **DNA ESCOTEIRO em 100% das 9 ligas operáveis** — algo que estava pendente desde a reativação do Japão. A pasta `memoria Fotografica` também ganha esses 5 perfis na próxima regeração, completando o clone do cérebro.

---

## 📎 Referência inline (exemplo real)

Um perfil de time real do BR (Vitória, do `_REFERENCIA_memoria_qualitativa_atual.js`):

```json
"Vitória": {
  "jogos_mandante": 4,
  "jogos_visitante": 5,
  "xFT_mandante": 5.19,
  "xFT_visitante": 4.26,
  "xHT_mandante": 1.9,
  "xHT_visitante": 1.77,
  "xContra_mandante": 4.62,
  "xContra_visitante": 5.87,
  "perfil_ataque": "PADRAO",
  "perfil_defesa_vis": "PADRAO",
  "alertas": []
}
```

Um perfil com alerta (Union de Santa Fe, ARG):

```json
"Union de Santa Fe": {
  "n_jogos": 6,
  "xHT_mandante": 3.99,
  "xFT_mandante": 6.8,
  "xHT_visitante": 0.83,
  "xFT_visitante": 4.62,
  "posse_media": 53.7,
  "finalizacoes_media": 14.2,
  "tendencia_cantos": "crescente",
  "volatilidade": 2.36,
  "perfil_ataque": "DOMINANTE",
  "perfil_defesa_vis": "VULNERAVEL",
  "fator_ataque": 1.37,
  "fator_defesa": 1.31,
  "alertas": [
    "OVER_HT_FAVORAVEL: pressão no 1T acima da média da liga"
  ]
}
```

---

**Fim do documento.** A IA externa tem tudo que precisa para gerar os 5 blocos JSON colável.
