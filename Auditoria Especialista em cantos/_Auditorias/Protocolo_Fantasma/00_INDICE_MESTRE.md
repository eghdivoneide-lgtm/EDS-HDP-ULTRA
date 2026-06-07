# 🔮 PROTOCOLO FANTASMA — ÍNDICE MESTRE

> **Memória permanente do EDS Especialista em Cantos**
> Versão FINAL — 20/05/2026
> 8 ligas ATIVAS + 1 excluída (J1)

---

## 📂 LIGAS ATIVAS NO APP (operáveis)

| # | Código | Liga | Status | Mercado-Rei | ROI |
|---|--------|------|--------|-------------|-----|
| 🥇 | **ARG_B** | Primera B Nacional | 🟢 MIRA-OURO | Sniper FT (73%) | **+35%** |
| 🥈 | **J2_J3** | J2/J3 Japão | 🟢 TIER-1 | UNDER 9,5 margem ≥1,5 | **+75%** |
| 🥉 | **BR_B** | Brasileirão B | 🟢 TIER-1 | Cisne ≥+2 cantos (75%) | **+50%** |
| 4 | **USL** | USL Championship | 🟢 TIER-1 | HDP DOMIN/ABSOL mandante (100%) | **+85%** |
| 5 | **ARG** | Liga Profesional ARG | 🟠 FIM 1ª FASE (jogo único 24/05) | HDP Reis ABSOLUTO (86%) | **+50%** |
| 6 | **MLS** | Major League Soccer | 🟢 TIER-1 | Bala NUCLEAR (75%) | **+31%** |
| 7 | **BUN** | Bundesliga | ⛔ TEMPORADA ENCERRADA (2025/26) | Bala + HDP (73%/64%) | **+27%/+22%** |
| 8 | **BR** | Brasileirão A | 🟡 TIER-2 | Cisne ≥+4 + HDP (80%) | **+44%** |

> **Atualização 22/05/2026**:
> - **BUN**: temporada 2025/26 encerrada → não há mais rodadas a operar. Retomar análise quando começar 2026/27.
> - **ARG**: fechamento da 1ª fase do Apertura — só 1 jogo no fim de semana (River Plate × Belgrano, 24/05 15:30). Próxima leva real volta com playoffs / fase de mata-mata.

---

## 🔬 LIGAS EM OBSERVAÇÃO (paper-trade)

> Ver `LIGAS_OBSERVACAO.md` para detalhes completos.

| Código | Liga | Pasta | Status |
|--------|------|-------|--------|
| **CHI** | Primera Divisão Chile | `08_Primera Div. (CHI)/` | 🟠 Paper-trade R1 |
| **ECU** | LigaPro Equador | `09_LigaPro (ECU)/` | 🟠 Paper-trade R1 |
| **CHN_SUP** | Super Liga China | `11_Super Liga China/` | 🟠 Paper-trade R1 |
| **CHN_1** | Liga One China | `12_Liga One China/` | 🟠 Paper-trade R1 |

**Critério de promoção**: 3 rodadas + n≥20 jogos + mercado-rei ≥65% + Wilson IC inf ≥50%.

---

## ⛔ LIGAS EXCLUÍDAS

| Código | Liga | Motivo |
|--------|------|--------|
| **J1** | J1 League | EXCLUÍDA — falta de padrões determinantes (4 rodadas paper-trade) |

---

## 🌐 PRINCÍPIOS UNIVERSAIS (válidos em TODAS as ligas ativas)

### Filtros que SEMPRE funcionam
1. **Convergência tripla** (Cisne + Bala + Vencedor mesmo time) = sinal mais forte
2. **Bala NUCLEAR + HDP -1 ou -1,5** do mesmo time = ROI positivo
3. **Cisne Negro com vantagem ≥+3 cantos** = filtro de ouro
4. **Linha alternativa** (UNDER 9,5 / OVER 10,5) elimina PUSH
5. **Vencedor Cantos COERENTE HT=FT + faixa DOMÍNIO TOTAL** = pico de confiança

### Filtros que NUNCA funcionam
1. **Bala isolada (sem HDP combinado)** → odd baixa anula edge
2. **Cisne com vantagem 2,0–3,0 cantos** = armadilha em ARG_B (40%)
3. **Confiança Teacher entre 60–80%** = vale-da-morte
4. **Sniper FT puro em ligas táticas (BR, BUN)** = invertido
5. **HDP FT em faixas baixas (MEDIANO/EQUILIBRADO/LEVE)** = paridade

### ⚠️ PADRÃO ESPECIAL USL (descoberto em 20/05)
**Na USL**: time favorito ABSOLUTO/DOMINANTE em casa = cantos ESTOURAM (oposto de ARG/J2J3). NÃO operar UNDER 9,5 com favorito forte.

### ⚠️ CISNE NEGRO — padrão de MANDADO (descoberto na USL)
- **Cisne MANDANTE favorito** = funciona bem (100% USL, 80% ARG_B, 80% BR_B)
- **Cisne VISITANTE favorito** = armadilha em várias ligas (50% USL, 33% J1)
- **Regra universal**: priorizar mandante apontado pelo Cisne, descartar visitante

### Regras universais de stake
- **Stake fixo** R$5–R$10 por múltipla (nunca dobrar)
- **Múltiplas pequenas** (3–6 seleções) > grandes (10+)
- **NÃO misturar** sinais contra o app
- **Verificar grade da casa** antes de fechar múltipla

### Ranking universal das faixas do Reis FT
| Faixa | Status |
|-------|--------|
| ABSOLUTO | ✅ Operar (60-100%) |
| DOMINANTE | ✅ Operar (55-75%) |
| MODERADO | ⚠️ Borderline |
| MEDIANO / EQUILIBRADO | ❌ Descartar |
| LEVE | ❌ Descartar |

### Conversão odd justa × odd real
- App: "odd justa" (probabilidade matemática)
- Casa: "odd real" (30-40% maior)
- **Sempre calcular ROI com odd real**

---

## 🔧 COMANDOS

| Comando | Ação |
|---------|------|
| `ativar protocolo fantasma para [LIGA]` | Leio MD da liga + aplico filtros |
| `atualizar protocolo fantasma [LIGA]` | Incorporo nova rodada à memória |

---

## 🔐 PERSISTÊNCIA

Pasta: `_Auditorias/Protocolo_Fantasma/`
Arquivos sobrevivem a qualquer reset de conversa.

---

## 📊 HISTÓRICO DE PERFORMANCE (TOP 2 indicações por liga)

| Liga | TOP 2 acerto |
|------|--------------|
| BR | 50% (1 ganhou, 1 perdeu) |
| ARG_B | 100% (2/2) |
| BR_B | 100% (2/2) |
| J2/J3 | 100% (5/5 todas indicações) |
| ARG | 100% (2/2) |
| **USL** | **100% (2/2)** |
| J1 (paper-trade) | 50% — confirmou exclusão |

**Acumulado TOP 2 ligas TIER-1: ~95% de acerto.**
