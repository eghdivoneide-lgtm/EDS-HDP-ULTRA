const fs=require("fs");
const D = JSON.parse(fs.readFileSync("/tmp/backtest_neutro.json","utf8"));
const NEU = D.neutro;
const num = s => s.split("-").map(Number);
const decided = e => { const[m,v]=num(e.cantosFT); return m!==v; };
const mandWon = e => { const[m,v]=num(e.cantosFT); return m>v; };
const G  = p => p==="G"||p==="G_STRONG";
const S  = p => p==="S"||p==="S_STRONG";

// piso por liga (base rate observada no NEUTRO)
const PISO = { ARG_B:"MAND", BR_B:"MAND", USL:"VIS", CHI:"VIS" };

// RESOLVEDOR: todo jogo NEUTRO recebe um lado + confiança, nunca SKIP
function resolve(e){
  const [h,v] = e.perf.split("×");
  const hc = e.histCasa;

  // A — N×N → MANDANTE (backtest 90%)
  if(h==="N" && v==="N")
    return {lado:"MAND", conf:72, regra:"A · N×N resgata mandante", forca:"FORTE"};

  // B — mandante fraco × visitante forte → VISITANTE (backtest 83%)
  if(S(h) && G(v))
    return {lado:"VIS", conf:70, regra:"B · inversão S×G", forca:"FORTE"};

  // C — visitante G_STRONG (qualquer mandante) → VISITANTE (backtest 80%)
  if(v==="G_STRONG")
    return {lado:"VIS", conf:65, regra:"C · visitante G_STRONG", forca:"MÉDIO"};

  // D — mandante forte × visitante fraco → MANDANTE (raro cair em neutro, mas resolve)
  if(G(h) && S(v))
    return {lado:"MAND", conf:64, regra:"D · mandante G vs S", forca:"MÉDIO"};

  // E — residual: piso de liga PURO (sem flip por histCasa — provou-se invertido)
  const piso = PISO[e.liga] || "MAND";
  return {lado:piso, conf: piso==="MAND"?58:57, regra:`E · piso de liga (${e.liga})`, forca:"FRACO"};
}

// avaliar
let acertos=0, total=0;
const porForca = {}, porRegra={};
const linhas=[];
for(const e of NEU){
  if(!decided(e)) continue;             // empate de cantos não conta acerto/erro
  const r = resolve(e);
  const realLado = mandWon(e)?"MAND":"VIS";
  const ok = r.lado===realLado;
  acertos += ok?1:0; total++;
  (porForca[r.forca]=porForca[r.forca]||[0,0]); porForca[r.forca][0]+=ok?1:0; porForca[r.forca][1]++;
  (porRegra[r.regra]=porRegra[r.regra]||[0,0]); porRegra[r.regra][0]+=ok?1:0; porRegra[r.regra][1]++;
  linhas.push({...e, ...r, realLado, ok});
}

console.log("=================================================================");
console.log(" RESOLVEDOR NEUTRO — nenhum SKIP, todo jogo se manifesta");
console.log("=================================================================\n");
console.log(`ACERTO GLOBAL (lado emitido vs real): ${acertos}/${total} = ${(100*acertos/total).toFixed(1)}%`);
console.log(`(antes: apostando cego no mandante = 47.7%)\n`);

console.log("--- por FORÇA do sinal ---");
for(const [f,[a,n]] of Object.entries(porForca).sort((x,y)=>y[1][1]-x[1][1]))
  console.log(` ${f.padEnd(6)}: ${a}/${n} = ${(100*a/n).toFixed(1)}%`);

console.log("\n--- por REGRA aplicada ---");
for(const [k,[a,n]] of Object.entries(porRegra).sort((x,y)=>y[1][1]-x[1][1]))
  console.log(` ${k.padEnd(38)}: ${a}/${n} = ${(100*a/n).toFixed(1)}%`);

console.log("\n--- jogo a jogo ---");
for(const l of linhas.sort((a,b)=> b.conf-a.conf || (a.liga<b.liga?-1:1))){
  console.log(` ${(l.ok?"✓":"✗")} ${l.lado.padEnd(4)} ${String(l.conf)}% ${l.forca.padEnd(6)} | ${l.liga.padEnd(5)} ${l.perf.padEnd(13)} ${l.cantosFT.padStart(5)} | ${l.regra.padEnd(34)} | ${l.jogo}`);
}
