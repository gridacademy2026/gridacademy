import { useState, useEffect, useRef, createContext, useContext } from "react";
import { Sun, Moon, X, Send, Download, Search, Play, Pause, RefreshCw,
  ChevronRight, ExternalLink, Copy, AlertTriangle, CheckCircle } from "lucide-react";

// ── THEME ──────────────────────────────────────────────────────────────────
const DK = { bg:"#06080f",sur:"#0c1424",card:"#111d30",bdr:"#1d304e",
  acc:"#f5a623",adim:"rgba(245,166,35,0.11)",grn:"#00d4aa",red:"#ff4456",
  txt:"#d8e8f4",mut:"#56708a",wht:"#ffffff",inp:"#0c1424" };
const LT = { bg:"#f0f4fb",sur:"#ffffff",card:"#ffffff",bdr:"#dde5f0",
  acc:"#d4820a",adim:"rgba(212,130,10,0.10)",grn:"#008f6e",red:"#d63040",
  txt:"#1a2540",mut:"#6a7a94",wht:"#1a2540",inp:"#f0f4fb" };

const TC = createContext(DK);
const useT = () => useContext(TC);

// ── MODULE-LEVEL COMPONENTS (stable references, no redefinition) ───────────
const Cd = ({ ch, sx = {} }) => {
  const T = useT();
  return <div style={{ background:T.card, border:`1px solid ${T.bdr}`, borderRadius:13, padding:20, marginBottom:14, ...sx }}>{ch}</div>;
};
const Ht = ({ children }) => {
  const T = useT();
  return <h2 style={{ fontSize:14, fontWeight:700, color:T.wht, marginBottom:12 }}>{children}</h2>;
};
const Sl = ({ label, value, min, max, step, set }) => {
  const T = useT();
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:12, color:T.mut }}>{label}</span>
        <span style={{ fontFamily:"monospace", color:T.acc, fontWeight:700, fontSize:12 }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => set(Number(e.target.value))}
        style={{ width:"100%", accentColor:T.acc, cursor:"pointer" }} />
    </div>
  );
};
const XMBn = () => {
  const T = useT();
  return (
    <div style={{ background:"linear-gradient(135deg,#1a0f00,#2a1800)", border:`1px solid ${T.acc}40`,
      borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
      <span style={{ fontSize:28 }}>🏦</span>
      <div style={{ flex:1, minWidth:140 }}>
        <div style={{ fontWeight:700, color:"#fff", fontSize:13.5, marginBottom:2 }}>
          Recommended — <span style={{ color:T.acc }}>XM Trading</span>
        </div>
        <div style={{ fontSize:11.5, color:"#7a9ab8" }}>MT4/MT5 · $5 min · Micro lots · 10M+ traders</div>
      </div>
      <a href="https://www.xm.com/?utm_source=gridacademy" target="_blank" rel="noopener noreferrer"
        style={{ background:T.acc, color:"#000", padding:"8px 14px", borderRadius:8, fontWeight:700,
          fontSize:12, textDecoration:"none", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
        Open Free <ExternalLink size={11} />
      </a>
    </div>
  );
};

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const GLOSSARY = [
  {t:"Arithmetic Grid",d:"Equal pip/dollar spacing between every level. Best for tight ranges."},
  {t:"Ask Price",d:"Price at which broker sells to you."},
  {t:"Bid Price",d:"Price at which broker buys from you."},
  {t:"Breakout",d:"Price moves outside defined range — potentially invalidates the grid."},
  {t:"Drawdown",d:"Reduction in account equity from peak to trough. Key risk metric."},
  {t:"Equity",d:"Account balance plus all floating (unrealised) P&L."},
  {t:"Expert Advisor",d:"Automated trading script on MT4/MT5 — your grid bot."},
  {t:"Floating Loss",d:"Unrealised loss from open positions still running at a loss."},
  {t:"Free Margin",d:"Capital available to open new positions."},
  {t:"Geometric Grid",d:"Equal percentage spacing. Better for wide-range investment grids."},
  {t:"Grid Bot",d:"Software placing buy/sell orders at predefined price intervals automatically."},
  {t:"Grid Levels",d:"Total number of pending orders placed in the grid."},
  {t:"Grid Range",d:"Total price zone where all grid orders operate."},
  {t:"Grid Spacing",d:"Distance between consecutive grid levels (pips or dollars)."},
  {t:"Hedged Grid",d:"Grid with both BUY and SELL orders active simultaneously."},
  {t:"Leverage",d:"Borrowed capital multiplier. 1:100 means $100 controls $10,000."},
  {t:"Lot Size",d:"Trade volume. 0.01 = micro lot (1,000 units). Start here."},
  {t:"Margin Call",d:"Broker alert: equity has fallen below minimum required margin."},
  {t:"Micro Lot",d:"0.01 standard lots — always start here as a beginner."},
  {t:"NFP",d:"Non-Farm Payrolls — US jobs report. Pause all grids 30 min before."},
  {t:"Pip",d:"Smallest standard Forex move. EUR/USD: 1 pip = 0.0001."},
  {t:"Ranging Market",d:"Price oscillating between support and resistance — ideal for grids."},
  {t:"Slippage",d:"Difference between expected and actual fill price."},
  {t:"Spread",d:"Bid-ask difference — your immediate trade cost on every trade."},
  {t:"Stop Loss",d:"Automatic close order at a specified loss level."},
  {t:"Swap",d:"Overnight interest charge for holding positions past daily rollover."},
  {t:"Take Profit",d:"Auto-close when target profit is reached — core of grid strategy."},
  {t:"Trailing Grid",d:"Grid that moves up with rising price to stay in range."},
  {t:"Trend",d:"Sustained directional movement — dangerous for standard grid bots."},
  {t:"Volatility",d:"Degree of price variation. Higher = more triggers but more risk."},
];

const TEMPLATES = [
  {n:"EURUSD_Conservative",l:"EUR/USD Conservative",c:"#4a9eff",
   d:{pair:"EURUSD",spacingPips:15,levels:8,lotSize:0.01,upper:1.0900,lower:1.0750,maxDDusd:80,minAccount:300}},
  {n:"EURUSD_Active",l:"EUR/USD Active",c:"#00d4aa",
   d:{pair:"EURUSD",spacingPips:10,levels:14,lotSize:0.01,upper:1.0950,lower:1.0700,maxDDusd:120,minAccount:500}},
  {n:"XAUUSD_Standard",l:"XAU/USD Gold",c:"#f5a623",
   d:{pair:"XAUUSD",spacingDollar:3,levels:20,lotSize:0.01,upper:2390,lower:2280,maxDDusd:200,minAccount:800}},
  {n:"GBPUSD_Standard",l:"GBP/USD Standard",c:"#a855f7",
   d:{pair:"GBPUSD",spacingPips:18,levels:10,lotSize:0.01,upper:1.2900,lower:1.2600,maxDDusd:140,minAccount:600}},
];

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function GridAcademy() {
  const [dark, setDark]   = useState(true);
  const [page, setPage]   = useState("home");
  const [tab,  setTab]    = useState("");
  const [warn, setWarn]   = useState(true);
  const T = dark ? DK : LT;

  // AI state
  const [msgs,     setMsgs]     = useState([{ role:"assistant", content:"👋 Hi! I am your AI Grid Coach — powered by Claude. Tell me your account size, preferred market, experience level, and risk tolerance, and I will build you a complete personalised grid strategy." }]);
  const [input,    setInput]    = useState("");
  const [aiLoad,   setAiLoad]   = useState(false);
  const [journal,  setJournal]  = useState("");
  const [jResult,  setJResult]  = useState("");
  const [jLoad,    setJLoad]    = useState(false);
  const [scanPair, setScanPair] = useState("EUR/USD");
  const [scanRes,  setScanRes]  = useState("");
  const [scanLoad, setScanLoad] = useState(false);

  // Calculator state
  const [cTrades, setCTrades] = useState(5);
  const [cLot,    setCLot]    = useState(0.01);
  const [cSp,     setCSp]     = useState(10);

  // Drawdown state
  const [dAcc,  setDAcc]  = useState(500);
  const [dMove, setDMove] = useState(50);
  const [dLot,  setDLot]  = useState(0.01);

  // Fee state
  const [fLot,   setFLot]   = useState(0.01);
  const [fSp,    setFSp]    = useState(10);
  const [fSprd,  setFSprd]  = useState(1.5);
  const [fTrades,setFTrades]= useState(5);

  // Simulator state
  const [simOn,   setSimOn]   = useState(false);
  const [simPx,   setSimPx]   = useState(1.0820);
  const [simPnL,  setSimPnL]  = useState(0);
  const [simN,    setSimN]    = useState(0);
  const [simLast, setSimLast] = useState(null);
  const [simSp,   setSimSp]   = useState(10);
  const [simLvl,  setSimLvl]  = useState(10);
  const simRef = useRef({ px:1.0820, pnl:0, n:0, on:false, sp:0.001, lvl:10, base:1.0750 });

  // Subscribe state
  const [email,   setEmail]   = useState("");
  const [subSt,   setSubSt]   = useState(null);

  // Glossary
  const [gloss,   setGloss]   = useState("");

  // Derived values (computed, no IIFEs in JSX)
  const cGross = +(cLot * cSp  * 10).toFixed(2);
  const cFee   = +(cLot * 1.5  * 10).toFixed(2);
  const cNet   = +(cGross - cFee).toFixed(2);

  const dDD    = +(dLot * 10 * dMove).toFixed(2);
  const dPct   = +((dDD / dAcc) * 100).toFixed(1);
  const dClr   = dPct < 20 ? T.grn : dPct < 40 ? "#f5a623" : T.red;
  const dSt    = dPct < 20 ? "SAFE" : dPct < 40 ? "CAUTION" : "DANGER";

  const fGross = +(fLot * fSp   * 10).toFixed(2);
  const fFee   = +(fLot * fSprd * 10).toFixed(2);
  const fNet   = +(fGross - fFee).toFixed(2);
  const fPct   = fGross > 0 ? +((fFee / fGross) * 100).toFixed(1) : 0;

  // Simulator effect — single useEffect, ref-based to avoid stale closure
  useEffect(() => {
    simRef.current = { px:simPx, pnl:simPnL, n:simN, on:simOn,
      sp: simSp * 0.0001, lvl: simLvl, base: 1.0750 };
  });

  useEffect(() => {
    if (!simOn) return;
    const iv = setInterval(() => {
      const r = simRef.current;
      const half = Math.floor(r.lvl / 2);
      const lines = Array.from({ length: r.lvl }, (_, i) => r.base + (i - half) * r.sp);
      const prev = r.px;
      const next = Math.max(1.065, Math.min(1.095, prev + (Math.random() - 0.47) * 0.0018));
      lines.forEach(gl => {
        if ((prev < gl && next >= gl) || (prev > gl && next <= gl)) {
          setSimPnL(p => +(p + r.sp * 1000 * 0.01).toFixed(2));
          setSimN(n => n + 1);
          setSimLast(gl.toFixed(4));
        }
      });
      setSimPx(next);
    }, 500);
    return () => clearInterval(iv);
  }, [simOn]);

  const resetSim = () => { setSimOn(false); setSimPx(1.0820); setSimPnL(0); setSimN(0); setSimLast(null); };

  // AI helpers
  const callAI = async (messages, system) => {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages })
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    const d = await r.json();
    return d.content?.find(b => b.type === "text")?.text || "No response.";
  };

  const SYS_COACH = `You are GridCoach inside GridAcademy — a free grid trading education platform. When given a user's trading situation, respond with:
1. Recommended Grid Config (pair, upper, lower, spacing, levels, lot, profit/level estimate, daily estimate)
2. Why these parameters suit their situation (2-3 sentences)
3. One key risk warning
4. Reminder to demo test for 2 weeks. Keep responses concise and beginner-friendly.`;

  const SYS_JOURNAL = `You are a grid trading performance analyst. Analyse the provided trade data and give:
1. PERFORMANCE SUMMARY (trades, P&L, patterns)
2. TOP 3 PROBLEMS hurting performance
3. SPECIFIC FIXES with exact parameter changes
4. RISK ASSESSMENT. Be concise and actionable.`;

  const SYS_SCAN = `You are a grid trading market analyst. Generate a brief daily briefing (under 120 words) in this format:
📊 MARKET PHASE: [Ranging/Trending/Volatile]
🌡️ VOLATILITY: [Low/Medium/High] — one reason
✅ GRID FRIENDLY: [Yes/Caution/No] — one sentence
⚙️ SETUP: Spacing: X | Levels: N | Lot: 0.0X
📅 KEY EVENTS: list or "None"
🚦 VERDICT: one sentence action`;

  const sendMsg = async () => {
    if (!input.trim() || aiLoad) return;
    const nm = { role:"user", content: input.trim() };
    const hist = [...msgs, nm];
    setMsgs(hist); setInput(""); setAiLoad(true);
    try {
      const reply = await callAI(hist.map(m => ({ role:m.role, content:m.content })), SYS_COACH);
      setMsgs(h => [...h, { role:"assistant", content: reply }]);
    } catch(e) { setMsgs(h => [...h, { role:"assistant", content:`⚠️ ${e.message}` }]); }
    setAiLoad(false);
  };

  const doJournal = async () => {
    if (!journal.trim() || jLoad) return;
    setJLoad(true); setJResult("");
    try { setJResult(await callAI([{ role:"user", content:`Analyse this trade data:\n\n${journal}` }], SYS_JOURNAL)); }
    catch(e) { setJResult(`⚠️ ${e.message}`); }
    setJLoad(false);
  };

  const doScan = async () => {
    if (scanLoad) return;
    setScanLoad(true); setScanRes("");
    try { setScanRes(await callAI([{ role:"user", content:`Grid trading market briefing for ${scanPair} — ${new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}.` }], SYS_SCAN)); }
    catch(e) { setScanRes(`⚠️ ${e.message}`); }
    setScanLoad(false);
  };

  const dlTpl = (name, data) => {
    const b = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href=u; a.download=`GridAcademy_${name}.json`; a.click();
    URL.revokeObjectURL(u);
  };

  const go = (p, t="") => { setPage(p); setTab(t); setSimOn(false); window.scrollTo(0,0); };

  // Simulator grid lines for display
  const simHalf  = Math.floor(simLvl / 2);
  const simLines = Array.from({ length: simLvl }, (_, i) => ({
    p: +(1.0750 + (i - simHalf) * simSp * 0.0001).toFixed(4),
    above: 1.0750 + (i - simHalf) * simSp * 0.0001 > simPx,
    cur: Math.abs(1.0750 + (i - simHalf) * simSp * 0.0001 - simPx) < simSp * 0.0001 * 0.5,
    hit: simLast && Math.abs(1.0750 + (i - simHalf) * simSp * 0.0001 - parseFloat(simLast)) < 0.00005,
  })).reverse();

  // ── NAV PAGES ─────────────────────────────────────────────────────────────
  const PAGES = ["home","ai","tools","simulator","resources","legal","subscribe","disclaimer"];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <TC.Provider value={T}>
      <div style={{ background:T.bg, color:T.txt, minHeight:"100vh", fontFamily:"'Syne',sans-serif", transition:"background 0.25s" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${T.bdr};border-radius:2px}
          input[type=range]{accent-color:${T.acc};cursor:pointer;width:100%}
          .inp{background:${T.inp};border:1px solid ${T.bdr};border-radius:8px;padding:9px 12px;color:${T.txt};font-size:13px;font-family:'Syne',sans-serif;width:100%;outline:none}
          .inp:focus{border-color:${T.acc}} .inp::placeholder{color:${T.mut}}
          button{font-family:'Syne',sans-serif;cursor:pointer}
          .nb{background:transparent;border:none;color:${T.mut};padding:10px 8px;font-size:11px;font-weight:600;white-space:nowrap;cursor:pointer;border-bottom:2px solid transparent}
          .nb:hover{color:${T.acc}} .nb.on{color:${T.acc};border-bottom-color:${T.acc}}
          @keyframes FU{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
          .fu{animation:FU 0.28s ease forwards}
          @keyframes BL{0%,100%{opacity:1}50%{opacity:0.2}} .bk{animation:BL 1.4s infinite}
          @keyframes GS{from{background-position:0 0}to{background-position:40px 40px}}
          .hbg{background-image:linear-gradient(${T.bdr}55 1px,transparent 1px),linear-gradient(90deg,${T.bdr}55 1px,transparent 1px);background-size:40px 40px;animation:GS 8s linear infinite}
          .ch{transition:transform 0.15s,box-shadow 0.15s;cursor:pointer} .ch:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,0.18)}
        `}</style>

        {/* RISK BANNER */}
        {warn && (
          <div style={{ background:T.red, padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
            <AlertTriangle size={13} color="#fff" />
            <span style={{ flex:1, fontSize:11.5, color:"#fff" }}><strong>Risk Warning:</strong> CFD trading carries significant risk. 74–89% of retail accounts lose money. Educational content only.</span>
            <button onClick={() => setWarn(false)} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:5, padding:"3px 9px", color:"#fff", fontSize:11 }}>✕</button>
          </div>
        )}

        {/* NAV */}
        <nav style={{ position:"sticky", top:0, zIndex:200, background:dark?"rgba(6,8,16,0.95)":"rgba(240,244,251,0.97)", backdropFilter:"blur(14px)", borderBottom:`1px solid ${T.bdr}` }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", alignItems:"center", padding:"0 12px", overflowX:"auto", gap:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 0", marginRight:8, flexShrink:0 }}>
              <div style={{ width:26, height:26, background:T.acc, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800 }}>⊞</div>
              <span style={{ fontWeight:800, fontSize:13.5, color:T.wht, letterSpacing:"-0.03em" }}>GridAcademy</span>
            </div>
            {[["🏠 Home","home"],["🧠 AI Coach","ai"],["🔢 Tools","tools"],["🤖 Simulator","simulator"],
              ["📚 Resources","resources"],["⚖️ Legal","legal"],["📬 Subscribe","subscribe"],["⚠️ Disclaimer","disclaimer"]].map(([l,p]) => (
              <button key={p} className={`nb${page===p?" on":""}`} onClick={() => go(p)}>{l}</button>
            ))}
            <button onClick={() => setDark(!dark)} style={{ marginLeft:"auto", flexShrink:0, background:T.adim, border:`1px solid ${T.bdr}`, borderRadius:7, padding:"5px 9px", color:T.acc, fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
              {dark ? <Sun size={12}/> : <Moon size={12}/>} {dark?"Light":"Dark"}
            </button>
          </div>
        </nav>

        {/* CONTENT */}
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"0 12px 80px" }}>

          {/* ── HOME ── */}
          {page==="home" && (
            <div className="fu">
              <div className="hbg" style={{ margin:"0 -12px", padding:"60px 12px 48px", textAlign:"center", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 70% 60% at 50% 40%,transparent,${T.bg}bb 65%,${T.bg})` }}/>
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.adim, border:`1px solid ${T.acc}44`, borderRadius:20, padding:"5px 14px", marginBottom:16, fontSize:11, color:T.acc, fontFamily:"monospace" }}>
                    <span className="bk" style={{ width:6, height:6, borderRadius:"50%", background:T.acc, display:"inline-block" }}/>
                    FOREX · GOLD · CRYPTO · STOCKS
                  </div>
                  <h1 style={{ fontSize:"clamp(22px,5vw,44px)", fontWeight:800, lineHeight:1.1, color:T.wht, marginBottom:12, letterSpacing:"-0.03em" }}>
                    Learn Grid Trading<br/><span style={{ color:T.acc }}>From Zero to AI-Powered</span>
                  </h1>
                  <p style={{ fontSize:14, color:T.mut, maxWidth:480, margin:"0 auto 22px", lineHeight:1.65 }}>
                    The world's only dedicated grid trading learning platform — with AI coaching, interactive calculators, live simulator, and full legal coverage.
                  </p>
                  <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                    <button onClick={() => go("ai")} style={{ display:"flex", alignItems:"center", gap:7, background:T.acc, color:"#000", border:"none", borderRadius:8, padding:"11px 22px", fontWeight:700, fontSize:13.5 }}>
                      Try AI Coach 🧠 <ChevronRight size={14}/>
                    </button>
                    <button onClick={() => go("tools")} style={{ display:"flex", alignItems:"cen
