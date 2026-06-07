"""Teste hipótese: time favorito em cantos perde em cantos quando vence o jogo (joga contra-ataque),
e vence em cantos quando perde o jogo (mantém ofensividade)."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from collections import defaultdict
from statistics import mean

games = json.load(open("Auditoria Especialista em cantos/_Auditorias/_dataset_mls_consolidado.json", encoding='utf-8'))

def ct(g, key, lado):
    try: return int(g[key]["cantos"][lado])
    except: return 0

def parse_placar(s):
    try:
        a, b = s.split(" - ")
        return int(a), int(b)
    except:
        return None, None

for g in games:
    p_ft = g.get("placar", {}).get("ft", "")
    p_ht = g.get("placar", {}).get("ht", "")
    gm_ft, gv_ft = parse_placar(p_ft)
    gm_ht, gv_ht = parse_placar(p_ht)
    g["g_m_ft"], g["g_v_ft"] = gm_ft, gv_ft
    g["g_m_ht"], g["g_v_ht"] = gm_ht, gv_ht
    g["c_ft_m"]=ct(g,"estatisticas_ft","m"); g["c_ft_v"]=ct(g,"estatisticas_ft","v")
    g["c_ht_m"]=ct(g,"estatisticas_ht","m"); g["c_ht_v"]=ct(g,"estatisticas_ht","v")
    g["c_2t_m"] = g["c_ft_m"] - g["c_ht_m"]
    g["c_2t_v"] = g["c_ft_v"] - g["c_ht_v"]

todos = [g for g in games if g["g_m_ft"] is not None]
print(f"Jogos analisados: {len(todos)}")

print("\n" + "="*100)
print("ABORDAGEM 1 - Tabela cruzada: vencedor gols x vencedor cantos")
print("="*100)

quadrante = defaultdict(int)
for g in todos:
    if g["g_m_ft"] > g["g_v_ft"]: rg = "M-vence-gols"
    elif g["g_m_ft"] < g["g_v_ft"]: rg = "V-vence-gols"
    else: rg = "Empate-gols"
    if g["c_ft_m"] > g["c_ft_v"]: rc = "M-vence-cantos"
    elif g["c_ft_m"] < g["c_ft_v"]: rc = "V-vence-cantos"
    else: rc = "Empate-cantos"
    quadrante[(rg, rc)] += 1

print(f"\n  Gols\\Cantos          | M-cant | Emp | V-cant | Total")
print(f"  " + "-"*60)
for rg in ["M-vence-gols","Empate-gols","V-vence-gols"]:
    row = [quadrante[(rg,"M-vence-cantos")], quadrante[(rg,"Empate-cantos")], quadrante[(rg,"V-vence-cantos")]]
    total = sum(row)
    print(f"  {rg:20s} | {row[0]:6d} | {row[1]:3d} | {row[2]:6d} | {total}")

# Métricas
mvg_all = sum(quadrante[("M-vence-gols", x)] for x in ["M-vence-cantos","Empate-cantos","V-vence-cantos"])
mvg_perdeu_c = quadrante[("M-vence-gols","V-vence-cantos")]
mvg_venceu_c = quadrante[("M-vence-gols","M-vence-cantos")]

vvg_all = sum(quadrante[("V-vence-gols", x)] for x in ["M-vence-cantos","Empate-cantos","V-vence-cantos"])
vvg_perdeu_c = quadrante[("V-vence-gols","M-vence-cantos")]
vvg_venceu_c = quadrante[("V-vence-gols","V-vence-cantos")]

print(f"\n  >> MANDANTE venceu gols mas PERDEU cantos: {mvg_perdeu_c}/{mvg_all} = {mvg_perdeu_c/mvg_all*100:.0f}%")
print(f"  >> MANDANTE venceu gols E venceu cantos:  {mvg_venceu_c}/{mvg_all} = {mvg_venceu_c/mvg_all*100:.0f}%")
print(f"\n  >> VISITANTE venceu gols mas PERDEU cantos: {vvg_perdeu_c}/{vvg_all} = {vvg_perdeu_c/vvg_all*100:.0f}%")
print(f"  >> VISITANTE venceu gols E venceu cantos:  {vvg_venceu_c}/{vvg_all} = {vvg_venceu_c/vvg_all*100:.0f}%")

print("\n" + "="*100)
print("ABORDAGEM 2 - Pos-gol HT: mudanca de padrao no 2T")
print("="*100)

casos = {
    "MAND vencendo HT (com vantagem)": [],
    "VIS vencendo HT (com vantagem)":  [],
    "Empate HT (sem vantagem)":        []
}
for g in todos:
    if g["g_m_ht"] is None: continue
    d = g["g_m_ht"] - g["g_v_ht"]
    if d > 0: casos["MAND vencendo HT (com vantagem)"].append(g)
    elif d < 0: casos["VIS vencendo HT (com vantagem)"].append(g)
    else: casos["Empate HT (sem vantagem)"].append(g)

for label, gs in casos.items():
    if not gs: continue
    n = len(gs)
    print(f"\n  {label} (n={n})")
    m_2t_pro = mean(g["c_2t_m"] for g in gs)
    v_2t_pro = mean(g["c_2t_v"] for g in gs)
    print(f"    Cantos 2T - MAND: {m_2t_pro:.2f} | VIS: {v_2t_pro:.2f} | Diff = {m_2t_pro-v_2t_pro:+.2f}")
    m_w = sum(1 for g in gs if g["c_2t_m"] > g["c_2t_v"])
    v_w = sum(1 for g in gs if g["c_2t_v"] > g["c_2t_m"])
    print(f"    Quem dominou cantos no 2T: MAND {m_w}/{n} ({m_w/n*100:.0f}%) | VIS {v_w}/{n} ({v_w/n*100:.0f}%)")

print("\n" + "="*100)
print("ABORDAGEM 3 - Mand dominou cantos HT - como evoluiu no 2T?")
print("="*100)
cantos_dom_ht_m = [g for g in todos if g["c_ht_m"] > g["c_ht_v"] and g["g_m_ht"] is not None]
print(f"  Total: MAND dominou cantos HT em {len(cantos_dom_ht_m)} jogos")

sub_a = [g for g in cantos_dom_ht_m if g["g_m_ht"] > g["g_v_ht"]]  # E vencia placar
sub_b = [g for g in cantos_dom_ht_m if g["g_m_ht"] < g["g_v_ht"]]  # MAS perdia placar
sub_c = [g for g in cantos_dom_ht_m if g["g_m_ht"] == g["g_v_ht"]]  # Empate placar

for label, sub in [("a) Dominava cantos HT + VENCENDO no HT (favorito real)", sub_a),
                   ("b) Dominava cantos HT + PERDENDO no HT (pressao reativa)", sub_b),
                   ("c) Dominava cantos HT + Empate no HT", sub_c)]:
    if not sub: continue
    n = len(sub)
    print(f"\n  {label} (n={n}):")
    pro_2t = mean(g["c_2t_m"] for g in sub)
    sof_2t = mean(g["c_2t_v"] for g in sub)
    print(f"    Cantos 2T do MAND: pro {pro_2t:.2f} | sof {sof_2t:.2f} | Diff = {pro_2t-sof_2t:+.2f}")
    cont_dom = sum(1 for g in sub if g["c_2t_m"] > g["c_2t_v"])
    print(f"    Continuou dominando cantos no 2T: {cont_dom}/{n} ({cont_dom/n*100:.0f}%)")
    venc_ft = sum(1 for g in sub if g["c_ft_m"] > g["c_ft_v"])
    print(f"    Venceu cantos FT total: {venc_ft}/{n} ({venc_ft/n*100:.0f}%)")
    venc_gol = sum(1 for g in sub if g["g_m_ft"] > g["g_v_ft"])
    perd_gol = sum(1 for g in sub if g["g_m_ft"] < g["g_v_ft"])
    print(f"    Resultado FINAL gols: venceu {venc_gol}/{n} ({venc_gol/n*100:.0f}%) | perdeu {perd_gol}/{n}")

print("\n" + "="*100)
print("ABORDAGEM 4 - Mandante FAVORITO ranking - quando perde gols, vence cantos?")
print("="*100)

top_mand = ["Philadelphia Union","Inter Miami","Colorado Rapids","San Jose Earthquakes",
            "Chicago Fire","Charlotte","Vancouver Whitecaps","Los Angeles FC","Seattle Sounders",
            "Nashville SC","St. Louis City","Toronto FC","CF Montreal","New York Red Bulls"]

favm = [g for g in todos if g["mandante"] in top_mand]
print(f"  Jogos com MAND favorito: {len(favm)}")

venceu = [g for g in favm if g["g_m_ft"] > g["g_v_ft"]]
perdeu = [g for g in favm if g["g_m_ft"] < g["g_v_ft"]]
emp    = [g for g in favm if g["g_m_ft"] == g["g_v_ft"]]

print(f"\n  Favorito MAND VENCEU gols (n={len(venceu)}):")
if venceu:
    vc = sum(1 for g in venceu if g["c_ft_m"] > g["c_ft_v"])
    pc = sum(1 for g in venceu if g["c_ft_m"] < g["c_ft_v"])
    print(f"    Tambem venceu cantos: {vc}/{len(venceu)} ({vc/len(venceu)*100:.0f}%)")
    print(f"    PERDEU cantos: {pc}/{len(venceu)} ({pc/len(venceu)*100:.0f}%) [HIPOTESE A]")
    print(f"    Diff medio cantos: {mean(g['c_ft_m']-g['c_ft_v'] for g in venceu):+.2f}")

print(f"\n  Favorito MAND PERDEU gols (n={len(perdeu)}):")
if perdeu:
    vc = sum(1 for g in perdeu if g["c_ft_m"] > g["c_ft_v"])
    pc = sum(1 for g in perdeu if g["c_ft_m"] < g["c_ft_v"])
    print(f"    Mas venceu cantos: {vc}/{len(perdeu)} ({vc/len(perdeu)*100:.0f}%) [HIPOTESE B]")
    print(f"    Perdeu cantos: {pc}/{len(perdeu)} ({pc/len(perdeu)*100:.0f}%)")
    print(f"    Diff medio cantos: {mean(g['c_ft_m']-g['c_ft_v'] for g in perdeu):+.2f}")
    print(f"\n    Jogos detalhados (favorito MAND perdendo gols):")
    for g in perdeu:
        sinal_c = "+" if g['c_ft_m']>g['c_ft_v'] else ""
        print(f"      [{g['_rodada_primeira']}] {g['mandante']:22s} gols {g['g_m_ft']}x{g['g_v_ft']} | cantos {g['c_ft_m']:2d}x{g['c_ft_v']:2d} (diff cantos: {sinal_c}{g['c_ft_m']-g['c_ft_v']})  vs {g['visitante']}")

print(f"\n  Favorito MAND EMPATOU gols (n={len(emp)}):")
if emp:
    vc = sum(1 for g in emp if g["c_ft_m"] > g["c_ft_v"])
    pc = sum(1 for g in emp if g["c_ft_m"] < g["c_ft_v"])
    print(f"    Venceu cantos: {vc}/{len(emp)} ({vc/len(emp)*100:.0f}%)")
    print(f"    Diff medio cantos: {mean(g['c_ft_m']-g['c_ft_v'] for g in emp):+.2f}")

print("\n" + "="*100)
print("ABORDAGEM 5 - Cantos 2T quando jogo VIRA no 2T (gol mudou o cenario)")
print("="*100)

# Jogos onde HT estava 0x0 ou empate, mas alguem venceu no FT
viraram = [g for g in todos if g["g_m_ht"]==g["g_v_ht"] and g["g_m_ft"] != g["g_v_ft"]]
print(f"  Jogos que VIRARAM no 2T (empate HT, definido FT): {len(viraram)}")

mand_v = [g for g in viraram if g["g_m_ft"] > g["g_v_ft"]]
vis_v  = [g for g in viraram if g["g_m_ft"] < g["g_v_ft"]]

if mand_v:
    print(f"\n  Mandante VIROU para si no 2T (n={len(mand_v)}):")
    pro = mean(g["c_2t_m"] for g in mand_v); sof = mean(g["c_2t_v"] for g in mand_v)
    venc_c = sum(1 for g in mand_v if g["c_2t_m"] > g["c_2t_v"])
    print(f"    Cantos 2T MAND: {pro:.2f} pro vs {sof:.2f} sof | venceu cantos 2T: {venc_c}/{len(mand_v)} ({venc_c/len(mand_v)*100:.0f}%)")

if vis_v:
    print(f"\n  Visitante VIROU para si no 2T (n={len(vis_v)}):")
    pro = mean(g["c_2t_v"] for g in vis_v); sof = mean(g["c_2t_m"] for g in vis_v)
    venc_c = sum(1 for g in vis_v if g["c_2t_v"] > g["c_2t_m"])
    print(f"    Cantos 2T VIS: {pro:.2f} pro vs {sof:.2f} sof | venceu cantos 2T: {venc_c}/{len(vis_v)} ({venc_c/len(vis_v)*100:.0f}%)")
