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
        <span style={{ fontFamily:"'Courier New',monospace", color:T.acc, fontWeight:700, fontSize:12 }}>{value}</span>
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
      <a href="https://clicks.pipaffiliates.com/c?c=1222829&l=en&p=0" target="_blank" rel="noopener noreferrer"
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
    try {
      const r = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, system })
      });
      const text = await r.text();
      try {
        const d = JSON.parse(text);
        return d.text || "AI returned empty response.";
      } catch {
        return "Server response: " + text.slice(0, 200);
      }
    } catch(e) {
      return "Connection error: " + e.message;
    }
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
      <div style={{ background:T.bg, color:T.txt, minHeight:"100vh", fontFamily:"Arial,sans-serif", transition:"background 0.25s" }}>
        <style>{`
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${T.bdr};border-radius:2px}
          input[type=range]{accent-color:${T.acc};cursor:pointer;width:100%}
          .inp{background:${T.inp};border:1px solid ${T.bdr};border-radius:8px;padding:9px 12px;color:${T.txt};font-size:13px;font-family:Arial,sans-serif;width:100%;outline:none}
          .inp:focus{border-color:${T.acc}} .inp::placeholder{color:${T.mut}}
          button{font-family:Arial,sans-serif;cursor:pointer}
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
                  <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.adim, border:`1px solid ${T.acc}44`, borderRadius:20, padding:"5px 14px", marginBottom:16, fontSize:11, color:T.acc, fontFamily:"'Courier New',monospace" }}>
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
                    <button onClick={() => go("tools")} style={{ display:"flex", alignItems:"center", gap:7, background:"transparent", color:T.txt, border:`1px solid ${T.bdr}`, borderRadius:8, padding:"11px 22px", fontWeight:600, fontSize:13.5 }}>
                      Open Tools 🔢
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:20 }}><XMBn/></div>
              <div style={{ marginTop:24 }}>
                <h2 style={{ fontSize:17, fontWeight:700, color:T.wht, marginBottom:14 }}>All Features</h2>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:10 }}>
                  {[
                    {e:"💬",t:"GridGPT Coach",d:"AI builds your personalised grid strategy",p:"ai"},
                    {e:"📊",t:"Journal Analyser",d:"AI diagnoses your trade performance",p:"ai"},
                    {e:"🌐",t:"Market Scanner",d:"Daily AI briefing for any pair",p:"ai"},
                    {e:"💰",t:"Profit Calculator",d:"Daily, monthly & annual estimates",p:"tools"},
                    {e:"📉",t:"Drawdown Visualizer",d:"Safety bar with real-time feedback",p:"tools"},
                    {e:"💸",t:"Fee Impact Calc",d:"How spreads eat into your profits",p:"tools"},
                    {e:"🤖",t:"Grid Simulator",d:"Watch orders fire as price moves live",p:"simulator"},
                    {e:"📖",t:"Glossary",d:"30 grid trading terms explained",p:"resources"},
                    {e:"📦",t:"EA Templates",d:"4 downloadable MT4/MT5 config files",p:"resources"},
                    {e:"📜",t:"Terms & Conditions",d:"10-clause legal agreement",p:"legal"},
                    {e:"©️",t:"Copyright",d:"Full IP and content protection notice",p:"legal"},
                    {e:"™️",t:"Trademark",d:"GridAcademy brand usage policy",p:"legal"},
                  ].map(item => (
                    <div key={item.t} className="ch" onClick={() => go(item.p)}
                      style={{ background:T.card, border:`1px solid ${T.bdr}`, borderRadius:11, padding:"14px 13px" }}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{item.e}</div>
                      <div style={{ fontWeight:700, color:T.wht, marginBottom:3, fontSize:12.5 }}>{item.t}</div>
                      <div style={{ fontSize:11.5, color:T.mut, lineHeight:1.5 }}>{item.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── AI COACH ── */}
          {page==="ai" && (
            <div className="fu" style={{ paddingTop:28 }}>
              <div style={{ display:"flex", gap:8, marginBottom:18, overflowX:"auto" }}>
                {[["💬","coach","GridGPT Coach"],["📊","journal","Journal Analyser"],["🌐","scanner","Market Scanner"]].map(([e,t,l]) => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding:"8px 16px", borderRadius:9, border:`1px solid ${tab===t||(!tab&&t==="coach")?T.acc:T.bdr}`,
                      background:tab===t||(!tab&&t==="coach")?T.adim:T.card, color:tab===t||(!tab&&t==="coach")?T.acc:T.mut,
                      fontWeight:600, fontSize:12.5, whiteSpace:"nowrap" }}>
                    {e} {l}
                  </button>
                ))}
              </div>

              {(tab==="coach"||!tab) && (
                <div>
                  <Cd ch={
                    <div>
                      <Ht>🧠 GridGPT — AI Grid Coach</Ht>
                      <p style={{ fontSize:12.5, color:T.mut, marginBottom:14, lineHeight:1.6 }}>Describe your account size, market, experience, and risk tolerance. GridGPT builds your complete personalised grid strategy instantly.</p>
                      <div style={{ height:340, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:12, padding:"4px 0" }}>
                        {msgs.map((m,i) => (
                          <div key={i} style={{ display:"flex", gap:8, flexDirection:m.role==="user"?"row-reverse":"row", alignItems:"flex-start" }}>
                            <div style={{ width:28, height:28, borderRadius:"50%", background:m.role==="user"?T.adim:"#4a9eff30", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>
                              {m.role==="user"?"👤":"🧠"}
                            </div>
                            <div style={{ background:m.role==="user"?T.adim:T.sur, border:`1px solid ${m.role==="user"?T.acc+"44":T.bdr}`,
                              borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",
                              padding:"11px 13px", maxWidth:"80%", fontSize:13, color:T.txt, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                              {m.content}
                            </div>
                          </div>
                        ))}
                        {aiLoad && (
                          <div style={{ display:"flex", gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:"50%", background:"#4a9eff30", display:"flex", alignItems:"center", justifyContent:"center" }}>🧠</div>
                            <div style={{ background:T.sur, border:`1px solid ${T.bdr}`, borderRadius:"12px 12px 12px 4px", padding:"11px 13px", fontSize:13, color:T.mut }}>
                              <span className="bk">Building your grid strategy…</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <input className="inp" placeholder='e.g. "$500 account, EUR/USD, complete beginner, low risk"'
                          value={input} onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key==="Enter" && sendMsg()} disabled={aiLoad} style={{ flex:1 }}/>
                        <button onClick={sendMsg} disabled={aiLoad||!input.trim()}
                          style={{ background:aiLoad||!input.trim()?T.bdr:T.acc, color:aiLoad||!input.trim()?T.mut:"#000",
                            border:"none", borderRadius:8, padding:"0 16px", fontWeight:700, fontSize:13, flexShrink:0 }}>
                          <Send size={13}/>
                        </button>
                      </div>
                      <div style={{ marginTop:10, display:"flex", gap:7, flexWrap:"wrap" }}>
                        {["$200, EUR/USD, beginner","$1000 for Gold, medium risk","Why is my grid losing money?"].map(s => (
                          <button key={s} onClick={() => setInput(s)} style={{ background:T.sur, border:`1px solid ${T.bdr}`, borderRadius:16, padding:"5px 11px", color:T.mut, fontSize:11, fontFamily:"Arial,sans-serif" }}>{s}</button>
                        ))}
                      </div>
                    </div>
                  }/>
                </div>
              )}

              {tab==="journal" && (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <Cd ch={
                      <div>
                        <Ht>📊 Paste Your Trade Data</Ht>
                        <textarea className="inp" rows={10} placeholder={"Date,Pair,Type,P&L\n2024-01-15,EURUSD,BUY,+$1.00\n2024-01-16,EURUSD,SELL,+$1.00\n...\n\nOr describe your trading history in plain text."}
                          value={journal} onChange={e => setJournal(e.target.value)}
                          style={{ resize:"vertical", fontFamily:"'Courier New',monospace", fontSize:12, lineHeight:1.7, marginBottom:12 }}/>
                        <button onClick={doJournal} disabled={jLoad||!journal.trim()}
                          style={{ background:jLoad||!journal.trim()?T.bdr:T.grn, color:jLoad||!journal.trim()?T.mut:"#000",
                            border:"none", borderRadius:8, padding:"10px 18px", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:7 }}>
                          {jLoad ? "Analysing…" : "Analyse My Trades"}
                        </button>
                        <button onClick={() => setJournal("Date,Pair,Type,P&L\n2024-01-15,EURUSD,BUY,+$1.00\n2024-01-15,EURUSD,SELL,+$1.00\n2024-01-16,EURUSD,NFP-event,-$5.00\n2024-01-17,EURUSD,BUY,+$1.00\n2024-01-18,EURUSD,CPI-event,-$7.00\nTotal: 5 trades, Account: $400, Grid spacing: 10 pips")}
                          style={{ marginTop:8, background:"transparent", border:`1px solid ${T.bdr}`, borderRadius:7, padding:"7px 13px", color:T.mut, fontSize:12, fontFamily:"Arial,sans-serif" }}>
                          Load Sample Data
                        </button>
                      </div>
                    }/>
                    <Cd ch={
                      <div>
                        <Ht>AI Analysis Report</Ht>
                        {!jResult && !jLoad && <div style={{ color:T.mut, fontSize:13, padding:"30px 0", textAlign:"center" }}>📋 Paste data on the left and click Analyse.</div>}
                        {jLoad && <div style={{ color:T.mut, fontSize:13, padding:"30px 0", textAlign:"center" }}><span className="bk">Reading your trade history…</span></div>}
                        {jResult && (
                          <div>
                            <div style={{ background:T.sur, border:`1px solid ${T.bdr}`, borderRadius:9, padding:14, fontSize:13, color:T.txt, lineHeight:1.8, whiteSpace:"pre-wrap", maxHeight:280, overflowY:"auto" }}>{jResult}</div>
                            <button onClick={() => navigator.clipboard.writeText(jResult).catch(()=>{})} style={{ marginTop:10, background:"transparent", border:`1px solid ${T.acc}35`, borderRadius:7, padding:"7px 12px", color:T.acc, fontSize:12, display:"flex", alignItems:"center", gap:5, fontFamily:"Arial,sans-serif" }}>
                              <Copy size={12}/> Copy Report
                            </button>
                          </div>
                        )}
                      </div>
                    }/>
                  </div>
                </div>
              )}

              {tab==="scanner" && (
                <div>
                  <Cd ch={
                    <div>
                      <Ht>🌐 AI Market Condition Scanner</Ht>
                      <p style={{ fontSize:12.5, color:T.mut, marginBottom:14 }}>Get an AI daily briefing — is the market grid-friendly today?</p>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                        {["EUR/USD","GBP/USD","XAU/USD","USD/JPY","BTC/USDT"].map(p => (
                          <button key={p} onClick={() => setScanPair(p)}
                            style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${scanPair===p?T.acc:T.bdr}`,
                              background:scanPair===p?T.adim:T.sur, color:scanPair===p?T.acc:T.mut, fontWeight:600, fontSize:12, fontFamily:"Arial,sans-serif" }}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <button onClick={doScan} disabled={scanLoad}
                        style={{ background:scanLoad?T.bdr:T.acc, color:scanLoad?T.mut:"#000", border:"none", borderRadius:9, padding:"10px 20px", fontWeight:700, fontSize:13, marginBottom:14, display:"flex", alignItems:"center", gap:7 }}>
                        {scanLoad ? "Scanning…" : `Run Scan — ${scanPair}`}
                      </button>
                      {scanRes && (
                        <div style={{ background:T.sur, border:`1px solid ${T.acc}28`, borderRadius:10, padding:16, fontSize:13.5, color:T.txt, lineHeight:2, whiteSpace:"pre-wrap" }}>
                          {scanRes}
                          <button onClick={() => navigator.clipboard.writeText(scanRes).catch(()=>{})} style={{ marginTop:10, background:"transparent", border:`1px solid ${T.bdr}`, borderRadius:7, padding:"6px 12px", color:T.mut, fontSize:11.5, display:"flex", alignItems:"center", gap:5, fontFamily:"Arial,sans-serif" }}>
                            <Copy size={11}/> Copy
                          </button>
                        </div>
                      )}
                    </div>
                  }/>
                </div>
              )}
            </div>
          )}

          {/* ── TOOLS ── */}
          {page==="tools" && (
            <div className="fu" style={{ paddingTop:28 }}>
              <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto" }}>
                {[["calc","💰 Profit Calc"],["dd","📉 Drawdown"],["fee","💸 Fee Impact"]].map(([t,l]) => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding:"8px 16px", borderRadius:9, border:`1px solid ${tab===t||(!tab&&t==="calc")?T.acc:T.bdr}`,
                      background:tab===t||(!tab&&t==="calc")?T.adim:T.card, color:tab===t||(!tab&&t==="calc")?T.acc:T.mut, fontWeight:600, fontSize:12.5, whiteSpace:"nowrap" }}>
                    {l}
                  </button>
                ))}
              </div>

              {(tab==="calc"||!tab) && (
                <Cd ch={
                  <div>
                    <Ht>💰 Profit Calculator</Ht>
                    <Sl label="Lot Size" value={cLot} min={0.01} max={0.1} step={0.01} set={setCLot}/>
                    <Sl label="Grid Spacing (pips)" value={cSp} min={5} max={30} step={1} set={setCSp}/>
                    <Sl label="Trades per Day" value={cTrades} min={1} max={20} step={1} set={setCTrades}/>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:10, marginTop:4 }}>
                      {[{l:"Gross/Trade",v:`$${cGross}`,c:T.grn},{l:"Fee/Trade",v:`-$${cFee}`,c:T.red},{l:"Net/Trade",v:`$${cNet}`,c:cNet>0?T.txt:T.red},
                        {l:"Daily",v:`$${+(cNet*cTrades).toFixed(2)}`,c:T.txt},{l:"Monthly",v:`$${+(cNet*cTrades*22).toFixed(2)}`,c:T.acc},{l:"Annual",v:`$${+(cNet*cTrades*264).toFixed(2)}`,c:T.acc}
                      ].map(r => (
                        <div key={r.l} style={{ background:T.sur, border:`1px solid ${T.bdr}`, borderRadius:10, padding:13, textAlign:"center" }}>
                          <div style={{ fontFamily:"'Courier New',monospace", fontSize:16, fontWeight:800, color:r.c }}>{r.v}</div>
                          <div style={{ fontSize:10.5, color:T.mut, marginTop:4 }}>{r.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                }/>
              )}

              {tab==="dd" && (
                <Cd ch={
                  <div>
                    <Ht>📉 Drawdown Visualizer</Ht>
                    <Sl label="Account Size ($)" value={dAcc} min={100} max={5000} step={100} set={setDAcc}/>
                    <Sl label="Adverse Move (pips)" value={dMove} min={10} max={200} step={10} set={setDMove}/>
                    <Sl label="Lot Size" value={dLot} min={0.01} max={0.1} step={0.01} set={setDLot}/>
                    <div style={{ marginTop:4, marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.mut, marginBottom:6 }}>
                        <span>Account Safety</span>
                        <span style={{ color:dClr, fontWeight:700 }}>{dSt} — {dPct}%</span>
                      </div>
                      <div style={{ background:T.bdr, borderRadius:8, height:20, overflow:"hidden" }}>
                        <div style={{ width:`${Math.min(dPct,100)}%`, height:"100%", background:dClr, borderRadius:8, transition:"all 0.3s" }}/>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {[{l:"Drawdown $",v:`$${dDD}`},{l:"Drawdown %",v:`${dPct}%`,c:dClr},{l:"Status",v:dSt,c:dClr},{l:"Remaining",v:`$${+(dAcc-dDD).toFixed(2)}`}].map(r=>(
                        <div key={r.l} style={{ background:T.sur, border:`1px solid ${r.c||T.bdr}`, borderRadius:10, padding:12, textAlign:"center" }}>
                          <div style={{ fontFamily:"'Courier New',monospace", fontSize:16, fontWeight:800, color:r.c||T.txt }}>{r.v}</div>
                          <div style={{ fontSize:10.5, color:T.mut, marginTop:4 }}>{r.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                }/>
              )}

              {tab==="fee" && (
                <Cd ch={
                  <div>
                    <Ht>💸 Fee Impact Calculator</Ht>
                    <Sl label="Lot Size" value={fLot} min={0.01} max={0.1} step={0.01} set={setFLot}/>
                    <Sl label="Spacing (pips)" value={fSp} min={5} max={30} step={1} set={setFSp}/>
                    <Sl label="Spread (pips)" value={fSprd} min={0.5} max={5} step={0.5} set={setFSprd}/>
                    <Sl label="Trades/Day" value={fTrades} min={1} max={20} step={1} set={setFTrades}/>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:10, marginTop:4 }}>
                      {[{l:"Gross/trade",v:`$${fGross}`,c:T.grn},{l:"Fee/trade",v:`-$${fFee}`,c:T.red},{l:"Net/trade",v:`$${fNet}`,c:fNet>0?T.txt:T.red},
                        {l:"Fee %",v:`${fPct}%`,c:fPct>30?T.red:"#f5a623"},{l:"Daily fees",v:`$${+(fFee*fTrades).toFixed(2)}`,c:T.red},{l:"Annual fees",v:`$${+(fFee*fTrades*264).toFixed(2)}`,c:T.red}
                      ].map(r=>(
                        <div key={r.l} style={{ background:T.sur, border:`1px solid ${T.bdr}`, borderRadius:10, padding:12, textAlign:"center" }}>
                          <div style={{ fontFamily:"'Courier New',monospace", fontSize:15, fontWeight:800, color:r.c }}>{r.v}</div>
                          <div style={{ fontSize:10.5, color:T.mut, marginTop:4 }}>{r.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                }/>
              )}
            </div>
          )}

          {/* ── SIMULATOR ── */}
          {page==="simulator" && (
            <div className="fu" style={{ paddingTop:28 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:T.wht, marginBottom:5 }}>🤖 Grid Simulator</h1>
              <p style={{ color:T.mut, marginBottom:18, fontSize:13 }}>Watch a EUR/USD grid bot fire orders live. Press Start and watch price cross grid lines.</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                <Cd ch={
                  <div>
                    <Ht>Configure</Ht>
                    <Sl label="Grid Spacing (pips)" value={simSp} min={5} max={30} step={5} set={v => { setSimSp(v); resetSim(); }}/>
                    <Sl label="Grid Levels" value={simLvl} min={4} max={16} step={2} set={v => { setSimLvl(v); resetSim(); }}/>
                    <div style={{ display:"flex", gap:10, marginTop:6 }}>
                      <button onClick={() => setSimOn(!simOn)} style={{ display:"flex", alignItems:"center", gap:7, background:simOn?T.red:T.grn, color:"#000", border:"none", borderRadius:8, padding:"10px 18px", fontWeight:700, fontSize:13 }}>
                        {simOn ? <><Pause size={13}/>Pause</> : <><Play size={13}/>Start</>}
                      </button>
                      <button onClick={resetSim} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", color:T.mut, border:`1px solid ${T.bdr}`, borderRadius:8, padding:"10px 13px", fontWeight:600, fontSize:13 }}>
                        <RefreshCw size={13}/>Reset
                      </button>
                    </div>
                  </div>
                }/>
                <Cd ch={
                  <div>
                    <Ht>Live Stats</Ht>
                    {[{l:"EUR/USD Price",v:simPx.toFixed(4),c:T.acc},{l:"Trades Fired",v:simN,c:T.txt},{l:"Total P&L",v:`+$${simPnL.toFixed(2)}`,c:T.grn}].map(s=>(
                      <div key={s.l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${T.bdr}` }}>
                        <span style={{ fontSize:12.5, color:T.mut }}>{s.l}</span>
                        <span style={{ fontFamily:"'Courier New',monospace", fontWeight:700, color:s.c, fontSize:14 }}>{s.v}</span>
                      </div>
                    ))}
                    {simOn && <div style={{ marginTop:10, fontSize:11.5, color:T.grn, display:"flex", alignItems:"center", gap:5 }}><span className="bk">●</span> Live</div>}
                  </div>
                }/>
              </div>
              <Cd ch={
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <Ht>Live Grid — EUR/USD</Ht>
                    {simOn && <span className="bk" style={{ fontSize:11, color:T.grn, fontFamily:"'Courier New',monospace" }}>● LIVE</span>}
                  </div>
                  {simLines.map((l,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:i<simLines.length-1?`1px dashed ${T.bdr}`:"none",
                      background:l.hit?"rgba(245,166,35,0.12)":"transparent", transition:"background 0.3s" }}>
                      <span style={{ fontFamily:"'Courier New',monospace", fontSize:11.5, minWidth:65, color:l.cur?T.acc:T.txt, fontWeight:l.cur?700:400 }}>{l.p}</span>
                      <div style={{ flex:1, height:l.cur?2.5:1, background:l.cur?T.acc:l.above?`${T.red}35`:`${T.grn}35`, borderRadius:2, transition:"all 0.3s" }}/>
                      {l.cur
                        ? <span style={{ fontSize:10.5, color:T.acc, fontFamily:"'Courier New',monospace", fontWeight:700, minWidth:90, textAlign:"right" }}>◆ {simPx.toFixed(4)}</span>
                        : <div style={{ display:"flex", alignItems:"center", gap:4, minWidth:90, justifyContent:"flex-end" }}>
                            {l.hit && <span style={{ fontSize:9.5, color:T.acc, fontFamily:"'Courier New',monospace" }}>✓HIT</span>}
                            <span style={{ fontSize:10.5, padding:"2px 7px", borderRadius:4, background:l.above?`${T.red}20`:`${T.grn}20`, color:l.above?T.red:T.grn, fontFamily:"'Courier New',monospace", fontWeight:700 }}>{l.above?"SELL":"BUY"}</span>
                          </div>
                      }
                    </div>
                  ))}
                </div>
              }/>
            </div>
          )}

          {/* ── RESOURCES ── */}
          {page==="resources" && (
            <div className="fu" style={{ paddingTop:28 }}>
              <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                {[["glos","📖 Glossary"],["tpl","📦 Templates"]].map(([t,l]) => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding:"8px 16px", borderRadius:9, border:`1px solid ${tab===t||(!tab&&t==="glos")?T.acc:T.bdr}`,
                      background:tab===t||(!tab&&t==="glos")?T.adim:T.card, color:tab===t||(!tab&&t==="glos")?T.acc:T.mut, fontWeight:600, fontSize:12.5 }}>
                    {l}
                  </button>
                ))}
              </div>

              {(tab==="glos"||!tab) && (
                <Cd ch={
                  <div>
                    <Ht>📖 Glossary of 30 Grid Trading Terms</Ht>
                    <div style={{ position:"relative", marginBottom:14 }}>
                      <Search size={14} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:T.mut }}/>
                      <input className="inp" placeholder="Search terms…" value={gloss} onChange={e=>setGloss(e.target.value)} style={{ paddingLeft:32 }}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:9 }}>
                      {GLOSSARY.filter(g => !gloss || g.t.toLowerCase().includes(gloss.toLowerCase()) || g.d.toLowerCase().includes(gloss.toLowerCase())).map(g => (
                        <div key={g.t} style={{ background:T.sur, borderRadius:9, padding:"11px 13px", border:`1px solid ${T.bdr}` }}>
                          <div style={{ fontSize:11, fontWeight:700, color:T.acc, marginBottom:3, fontFamily:"'Courier New',monospace" }}>{g.t}</div>
                          <div style={{ fontSize:11.5, color:T.mut, lineHeight:1.55 }}>{g.d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                }/>
              )}

              {tab==="tpl" && (
                <Cd ch={
                  <div>
                    <Ht>📦 Downloadable Grid EA Templates</Ht>
                    <p style={{ fontSize:12.5, color:T.mut, marginBottom:16, lineHeight:1.6 }}>Download pre-configured JSON files for MT4/MT5 Grid EAs. Import directly into your EA settings panel and adjust range to current market conditions.</p>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
                      {TEMPLATES.map(t => (
                        <div key={t.n} style={{ background:T.sur, border:`1px solid ${t.c}30`, borderRadius:11, padding:16 }}>
                          <div style={{ fontSize:20, marginBottom:6 }}>📄</div>
                          <div style={{ fontWeight:700, color:T.wht, marginBottom:5, fontSize:13 }}>{t.l}</div>
                          <div style={{ fontSize:11.5, color:T.mut, marginBottom:12, lineHeight:1.5 }}>
                            {t.d.spacingPips||t.d.spacingDollar}{t.d.spacingPips?" pips":"$"} · {t.d.levels} levels · {t.d.lotSize} lot · Min ${t.d.minAccount}
                          </div>
                          <button onClick={() => dlTpl(t.n, t.d)}
                            style={{ display:"flex", alignItems:"center", gap:6, background:t.c, color:"#000", border:"none", borderRadius:8, padding:"9px 14px", fontWeight:700, fontSize:12, width:"100%", justifyContent:"center" }}>
                            <Download size={12}/> Download JSON
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                }/>
              )}
            </div>
          )}

          {/* ── LEGAL ── */}
          {page==="legal" && (
            <div className="fu" style={{ paddingTop:28 }}>
              <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto" }}>
                {[["terms","📜 Terms & Conditions"],["copy","©️ Copyright"],["tm","™️ Trademark"]].map(([t,l]) => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding:"8px 16px", borderRadius:9, border:`1px solid ${tab===t||(!tab&&t==="terms")?T.acc:T.bdr}`,
                      background:tab===t||(!tab&&t==="terms")?T.adim:T.card, color:tab===t||(!tab&&t==="terms")?T.acc:T.mut, fontWeight:600, fontSize:12.5, whiteSpace:"nowrap" }}>
                    {l}
                  </button>
                ))}
              </div>

              {(tab==="terms"||!tab) && (
                <div>
                  <p style={{ fontSize:13, color:T.mut, marginBottom:18, lineHeight:1.7, background:T.adim, border:`1px solid ${T.acc}28`, borderRadius:9, padding:13 }}>
                    By accessing GridAcademy (gridacademy.org) and all its tools, simulators, calculators, AI features, and educational content, you agree to be bound by these Terms and Conditions.
                  </p>
                  {[{n:"1",t:"Acceptance of Terms",c:"#4a9eff",b:"These Terms constitute a legally binding agreement between you and GridAcademy governing your access to and use of the platform, tools, AI coaching, simulators, calculators, and related services. Continued use of the Service constitutes acceptance."},
                    {n:"2",t:"Educational Purpose Only",c:T.acc,b:"All content, tools, AI-generated advice, calculators, backtests, and market analysis on GridAcademy are for educational and informational purposes only. Nothing constitutes financial advice, investment advice, or any form of professional advisory service."},
                    {n:"3",t:"User Responsibilities",c:T.grn,b:"You must be at least 18 years of age to use this Service. You are solely responsible for ensuring use of the Service is lawful in your jurisdiction and for all trading decisions made based on content encountered on GridAcademy."},
                    {n:"4",t:"AI Tools — Limitations",c:"#a855f7",b:"AI tools (GridGPT, Journal Analyser, Market Scanner) are educational only. AI outputs may contain errors and do not account for live market conditions or your complete financial situation. Always verify independently before acting."},
                    {n:"5",t:"Simulations & Backtests",c:"#f7931a",b:"All simulations use simplified mathematical models and do not represent real-world trading. Results do not indicate or guarantee future trading performance. Past simulated performance is not indicative of future results."},
                    {n:"6",t:"Affiliate Relationships",c:T.acc,b:"GridAcademy participates in affiliate marketing programmes. We may receive compensation when users open accounts via broker referral links including XM Trading. All affiliate relationships are disclosed transparently. This does not influence educational content."},
                    {n:"7",t:"Intellectual Property",c:"#4a9eff",b:"All GridAcademy content — website design, source code, educational content, AI system prompts, tools, simulators, templates, and certifications — is the intellectual property of GridAcademy protected by applicable copyright and trademark laws."},
                    {n:"8",t:"Limitation of Liability",c:T.red,b:"To the fullest extent permitted by law, GridAcademy shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of the Service, including any financial losses from trading decisions."},
                    {n:"9",t:"Governing Law",c:T.mut,b:"These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Tamil Nadu, India."},
                    {n:"10",t:"Contact",c:T.grn,b:"For questions about these Terms: contact@gridacademy.org. We aim to respond within 5 business days."},
                  ].map(s => (
                    <Cd key={s.n} sx={{ borderLeft:`4px solid ${s.c}`, marginBottom:12 }} ch={
                      <div>
                        <h3 style={{ fontSize:13.5, fontWeight:700, color:s.c, marginBottom:8 }}>{s.n}. {s.t}</h3>
                        <p style={{ fontSize:13, color:T.mut, lineHeight:1.75 }}>{s.b}</p>
                      </div>
                    }/>
                  ))}
                </div>
              )}

              {tab==="copy" && (
                <div>
                  <Cd sx={{ borderLeft:`4px solid #4a9eff`, textAlign:"center" }} ch={
                    <div>
                      <div style={{ fontSize:40, marginBottom:10 }}>©️</div>
                      <div style={{ fontSize:17, fontWeight:800, color:T.wht, marginBottom:4 }}>Copyright © 2026 GridAcademy</div>
                      <div style={{ fontSize:13, color:T.mut }}>All Rights Reserved · gridacademy.org</div>
                    </div>
                  }/>
                  {[{t:"Ownership",c:"#4a9eff",b:"All content on GridAcademy — website design, layout, source code, educational text, AI system prompts, tools, calculators, simulators, glossary, templates, and all other materials — is the exclusive intellectual property of GridAcademy, protected under the Indian Copyright Act 1957 and international copyright treaties."},
                    {t:"What You May Do",c:T.grn,b:"You are granted a limited, non-exclusive licence to access content for personal, non-commercial, educational purposes. You may view content in a browser, save a single personal copy, share links to GridAcademy pages, and quote brief excerpts (under 50 words) with attribution."},
                    {t:"What You May Not Do",c:T.red,b:"Without written permission, you may not reproduce, republish, sell, license, commercially exploit, scrape, use to train AI models, create derivative works, or remove copyright notices from any GridAcademy content."},
                    {t:"AI-Generated Content",c:"#a855f7",b:"AI outputs generated within GridAcademy are copyright of GridAcademy. They may be used for personal educational reference but may not be redistributed or presented as original financial analysis."},
                    {t:"Report Infringement",c:T.red,b:"If you believe content on GridAcademy infringes your copyright, contact contact@gridacademy.org with identification of the copyrighted work, location of alleged infringement, and your contact details. We investigate and respond promptly."},
                  ].map(s => (
                    <Cd key={s.t} sx={{ borderLeft:`4px solid ${s.c}`, marginBottom:12 }} ch={
                      <div>
                        <h3 style={{ fontSize:13.5, fontWeight:700, color:s.c, marginBottom:8 }}>{s.t}</h3>
                        <p style={{ fontSize:13, color:T.mut, lineHeight:1.75 }}>{s.b}</p>
                      </div>
                    }/>
                  ))}
                </div>
              )}

              {tab==="tm" && (
                <div>
                  <Cd sx={{ borderLeft:`4px solid ${T.acc}`, textAlign:"center" }} ch={
                    <div>
                      <div style={{ fontSize:40, marginBottom:10 }}>™️</div>
                      <div style={{ fontSize:17, fontWeight:800, color:T.wht, marginBottom:4 }}>GridAcademy Trademark Notice</div>
                      <div style={{ fontSize:13, color:T.mut }}>Brand Protection & Usage Policy</div>
                    </div>
                  }/>
                  <Cd ch={
                    <div>
                      <Ht>Our Trademark Marks</Ht>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))", gap:10, marginBottom:14 }}>
                        {[{m:"GridAcademy™",d:"Word mark for grid trading education services"},
                          {m:"GridGPT™",d:"Word mark for AI-powered grid coaching tools"},
                          {m:"⊞ Logo™",d:"Device mark — the grid-square logo"},
                          {m:"Grid Pro™",d:"Certification mark for the Grid Pro programme"},
                        ].map(mk => (
                          <div key={mk.m} style={{ background:T.sur, border:`1px solid ${T.acc}30`, borderRadius:10, padding:13 }}>
                            <div style={{ fontSize:15, fontWeight:800, color:T.acc, marginBottom:5, fontFamily:"'Courier New',monospace" }}>{mk.m}</div>
                            <div style={{ fontSize:11.5, color:T.mut, lineHeight:1.5 }}>{mk.d}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:T.adim, border:`1px solid ${T.acc}25`, borderRadius:9, padding:13, fontSize:12.5, color:T.mut, lineHeight:1.65 }}>
                        <strong style={{ color:T.acc }}>Status:</strong> GridAcademy marks are used as common law trademarks. Formal registration applications are in progress under the Indian Trade Marks Act 1999. The ™ symbol denotes our trademark claim pending registration.
                      </div>
                    </div>
                  }/>
                  {[{t:"Permitted Use",c:T.grn,items:["Referring to GridAcademy by name in editorial or educational contexts","Sharing links to GridAcademy from your own website","Displaying your Grid Pro certification badge on personal profiles","Mentioning GridAcademy in academic or research papers with attribution"]},
                    {t:"Prohibited Use",c:T.red,items:["Using GridAcademy or GridGPT as part of your business or product name","Using the GridAcademy logo in advertising without written permission","Creating merchandise or courses using GridAcademy marks","Registering domain names or social handles incorporating GridAcademy marks"]},
                  ].map(s => (
                    <Cd key={s.t} sx={{ borderLeft:`4px solid ${s.c}`, marginBottom:12 }} ch={
                      <div>
                        <h3 style={{ fontSize:13.5, fontWeight:700, color:s.c, marginBottom:10 }}>{s.t}</h3>
                        {s.items.map((item,i) => (
                          <div key={i} style={{ display:"flex", gap:8, fontSize:13, color:T.mut, lineHeight:1.65, marginBottom:8, alignItems:"flex-start" }}>
                            {s.c===T.grn ? <CheckCircle size={13} color={T.grn} style={{ flexShrink:0, marginTop:2 }}/> : <X size={13} color={T.red} style={{ flexShrink:0, marginTop:2 }}/>}
                            {item}
                          </div>
                        ))}
                      </div>
                    }/>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SUBSCRIBE ── */}
          {page==="subscribe" && (
            <div className="fu" style={{ paddingTop:28 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:T.wht, marginBottom:5 }}>📬 Subscribe</h1>
              <p style={{ color:T.mut, marginBottom:18, fontSize:13 }}>Free weekly grid trading updates — EA tips, market setups, risk guides. No spam.</p>
              <Cd ch={
                <div>
                  {subSt==="ok" ? (
                    <div style={{ textAlign:"center", padding:"28px 0" }}>
                      <div style={{ fontSize:44, marginBottom:12 }}>🎉</div>
                      <div style={{ fontWeight:700, color:T.grn, fontSize:16, marginBottom:6 }}>You are subscribed!</div>
                      <div style={{ fontSize:13, color:T.mut }}>Check your inbox for a welcome email.</div>
                      <button onClick={() => { setSubSt(null); setEmail(""); }} style={{ marginTop:14, background:"transparent", border:`1px solid ${T.bdr}`, borderRadius:7, padding:"7px 14px", color:T.mut, fontSize:12, fontFamily:"Arial,sans-serif" }}>Subscribe another email</button>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize:12, color:T.mut, display:"block", marginBottom:6 }}>Email Address *</label>
                      <input className="inp" type="email" placeholder="your@email.com" value={email}
                        onChange={e => { setEmail(e.target.value); setSubSt(null); }} style={{ marginBottom:12 }}/>
                      {subSt==="err" && <div style={{ color:T.red, fontSize:12.5, marginBottom:10 }}>Please enter a valid email address.</div>}
                      <button onClick={() => email.includes("@") ? setSubSt("ok") : setSubSt("err")}
                        style={{ display:"flex", alignItems:"center", gap:8, background:T.acc, color:"#000", border:"none", borderRadius:9, padding:"11px 22px", fontWeight:700, fontSize:13.5 }}>
                        <Send size={14}/> Subscribe Free
                      </button>
                      <div style={{ fontSize:11, color:T.mut, marginTop:10 }}>🔒 Unsubscribe anytime. We never share your email.</div>
                    </div>
                  )}
                </div>
              }/>
              <Cd sx={{ background:`${T.grn}0d`, border:`1px solid ${T.grn}25` }} ch={
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:T.wht, marginBottom:9 }}>📩 Direct Contact</div>
                  <div style={{ fontFamily:"'Courier New',monospace", fontSize:13, color:T.txt }}>contact@gridacademy.org</div>
                </div>
              }/>
            </div>
          )}

          {/* ── DISCLAIMER ── */}
          {page==="disclaimer" && (
            <div className="fu" style={{ paddingTop:28 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:T.wht, marginBottom:5 }}>⚠️ Disclaimer & Risk Disclosure</h1>
              <p style={{ color:T.mut, marginBottom:18, fontSize:13 }}>Read carefully before using GridAcademy or engaging in any trading activity.</p>
              {[{i:"⚠️",t:"No Financial Advice",c:T.red,b:"All GridAcademy content is for educational purposes only. Nothing constitutes financial advice, investment advice, or trading recommendations. Never treat educational content as a substitute for professional financial counsel."},
                {i:"📉",t:"Trading Involves Significant Risk",c:"#ff8c00",b:"Forex, Gold, cryptocurrency, and CFD trading involve substantial risk of loss. The high degree of leverage can work against you. You could lose your entire investment."},
                {i:"🤖",t:"Simulations Are Not Real Trading",c:"#e5c100",b:"Paper trading, backtests, and simulators use simplified models and do not reflect real-world conditions including slippage, execution delays, or liquidity gaps."},
                {i:"🏦",t:"Affiliate Disclosure",c:T.acc,b:"GridAcademy may earn referral fees when visitors open accounts via broker links such as XM Trading. Educational content remains independent of these relationships."},
                {i:"🌍",t:"Regulatory Compliance",c:T.mut,b:"It is your responsibility to ensure trading is legal in your jurisdiction. GridAcademy does not provide services where they are restricted by law."},
              ].map(s => (
                <Cd key={s.t} sx={{ borderLeft:`4px solid ${s.c}`, marginBottom:12 }} ch={
                  <div>
                    <h3 style={{ fontSize:13.5, fontWeight:700, color:s.c, marginBottom:7, display:"flex", alignItems:"center", gap:7 }}>{s.i} {s.t}</h3>
                    <p style={{ fontSize:13, color:T.mut, lineHeight:1.75 }}>{s.b}</p>
                  </div>
                }/>
              ))}
              <div style={{ background:`${T.red}0d`, border:`1px solid ${T.red}35`, borderRadius:12, padding:20, textAlign:"center" }}>
                <AlertTriangle size={22} color={T.red} style={{ margin:"0 auto 9px" }}/>
                <div style={{ fontSize:14, fontWeight:700, color:T.red, marginBottom:7 }}>High Risk Warning</div>
                <p style={{ fontSize:13, color:T.mut, lineHeight:1.7, maxWidth:460, margin:"0 auto" }}>
                  <strong style={{ color:T.txt }}>74–89% of retail accounts lose money</strong> trading CFDs. Only trade with money you can afford to lose entirely.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ borderTop:`1px solid ${T.bdr}`, padding:"16px 12px", background:T.sur }}>
          <div style={{ maxWidth:1000, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:22, height:22, background:T.acc, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>⊞</div>
                <span style={{ fontWeight:800, color:T.wht, fontSize:13 }}>GridAcademy</span>
              </div>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {[["home","Home"],["legal","T&C"],["legal","Copyright"],["disclaimer","Disclaimer"]].map(([p,l],i) => (
                  <button key={i} onClick={() => go(p, l==="Copyright"?"copy":l==="T&C"?"terms":"")}
                    style={{ background:"none", border:"none", color:T.mut, fontSize:11, cursor:"pointer", fontFamily:"Arial,sans-serif", padding:0, textDecoration:"underline" }}>{l}</button>
                ))}
                <a href="https://clicks.pipaffiliates.com/c?c=1222829&l=en&p=0" target="_blank" rel="noopener noreferrer" style={{ color:T.mut, fontSize:11 }}>XM Affiliate</a>
              </div>
            </div>
            <div style={{ fontSize:10.5, color:T.mut }}>© 2026 GridAcademy · Educational only · Not financial advice · Past performance ≠ future results</div>
          </div>
        </footer>
      </div>
    </TC.Provider>
  );
}
