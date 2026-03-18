import { useState } from “react”;

const STORAGE_KEY = “wantsv2”;
function load() {
try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : { wants: [], totalSaved: 0, history: [] }; }
catch { return { wants: [], totalSaved: 0, history: [] }; }
}
function persist(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

const URGE = [””,“Barely”,“Low”,“Mild”,“Warm”,“Want”,“Really want”,“Craving”,“Strong”,“Very strong”,“Must have”];
const EMOJIS = [“✦”,“◆”,“▲”,“●”,“★”,“♦”,“◉”,“⬟”,“⬡”,“▼”,“◈”,“⊕”,“✿”,“⬢”,“◐”,“◑”,“◒”,“◓”,“⊞”,“⊗”];

function score(w) { return w.price / Math.pow(w.urge, 1.5); }
function fmt(n) { return new Intl.NumberFormat(“en-IN”,{style:“currency”,currency:“INR”,maximumFractionDigits:0}).format(n); }

function allocate(wants, totalSaved) {
const sorted = […wants].sort((a,b) => score(a) - score(b));
let rem = totalSaved;
return sorted.map(w => {
const funded = Math.min(w.savedAmount || 0, w.price);
const add = Math.min(rem, w.price - funded);
rem = Math.max(0, rem - add);
const total = funded + add;
return { …w, allocated: total, pct: Math.round((total / w.price) * 100) };
});
}

const BLANK = { name:””, price:””, urge:5, emoji:“✦”, notes:”” };

export default function App() {
const [data, setData] = useState(load);
const { wants, totalSaved, history } = data;
const [tab, setTab] = useState(“list”);
const [modal, setModal] = useState(null);
const [editId, setEditId] = useState(null);
const [form, setForm] = useState(BLANK);
const [deposit, setDeposit] = useState({ amt:””, note:”” });

const items = allocate(wants, totalSaved);
const done = items.filter(i => i.pct >= 100).length;

function save(next) { setData(next); persist(next); }

function submitWant() {
if (!form.name.trim() || !form.price || +form.price <= 0) return;
const w = {
id: editId || String(Date.now()),
name: form.name.trim(),
price: +form.price,
urge: +form.urge,
emoji: form.emoji,
notes: form.notes.trim(),
savedAmount: editId ? (wants.find(x=>x.id===editId)?.savedAmount||0) : 0,
};
save({ …data, wants: editId ? wants.map(x=>x.id===editId?w:x) : […wants, w] });
setModal(null); setEditId(null); setForm(BLANK);
}

function submitDeposit() {
const a = +deposit.amt;
if (!a || a <= 0) return;
save({
…data,
totalSaved: totalSaved + a,
history: […history, { date: new Date().toLocaleDateString(“en-IN”), amount: a, note: deposit.note||“Monthly savings” }]
});
setDeposit({ amt:””, note:”” }); setModal(null);
}

function del(id) { save({ …data, wants: wants.filter(w=>w.id!==id) }); }

function startEdit(w) {
setForm({ name:w.name, price:w.price, urge:w.urge, emoji:w.emoji, notes:w.notes||”” });
setEditId(w.id); setModal(“add”);
}

const fieldStyle = {
width:“100%”, boxSizing:“border-box”,
background:“transparent”, border:“none”, borderBottom:“1.5px solid #1a1a1a”,
padding:“8px 0”, fontSize:“1rem”,
fontFamily:”‘DM Serif Display’,Georgia,serif”,
color:”#1a1a1a”, outline:“none”,
};

return (
<div style={{ minHeight:“100vh”, background:”#f5f0e8”, fontFamily:”‘DM Serif Display’,Georgia,serif”, color:”#1a1a1a” }}>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
<style>{`* { -webkit-font-smoothing: antialiased; } @keyframes up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } @keyframes in { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } } .card { animation: up 0.3s ease both; } .modal-box { animation: in 0.2s ease; } button { cursor:pointer; font-family:'DM Serif Display',Georgia,serif; } input, textarea { font-family:'DM Serif Display',Georgia,serif; } input[type=range] { accent-color:#1a1a1a; width:100%; } input::placeholder, textarea::placeholder { color:#bbb; } ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#ccc; border-radius:2px; } .row-acts { opacity:0; transition:opacity 0.15s; } .want-row:hover .row-acts { opacity:1; } .pill-btn { transition: background 0.15s, color 0.15s; } .pill-btn:hover { background:#1a1a1a !important; color:#f5f0e8 !important; } .main-btn:hover { opacity:0.85; } .tab-pill:hover { color:#1a1a1a !important; }`}</style>

```
  <div style={{ maxWidth:580, margin:"0 auto", padding:"52px 24px 80px" }}>

    {/* Header */}
    <div style={{ marginBottom:52 }}>
      <div style={{ fontSize:"3rem", lineHeight:1, marginBottom:10, letterSpacing:"-0.02em" }}>◈</div>
      <h1 style={{ margin:0, fontSize:"clamp(2.2rem,7vw,3.2rem)", fontWeight:400, letterSpacing:"-0.03em", lineHeight:1.05 }}>
        Dream<br/><em>Ledger</em>
      </h1>
      <p style={{ margin:"14px 0 0", color:"#aaa", fontSize:"0.72rem", letterSpacing:"0.16em", textTransform:"uppercase" }}>
        Wants · Ranked by Priority
      </p>
    </div>

    {/* Stats */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderTop:"1.5px solid #1a1a1a", borderBottom:"1.5px solid #1a1a1a", marginBottom:40 }}>
      {[["Saved", fmt(totalSaved)], ["Wants", String(wants.length)], ["Done", `${done}/${wants.length}`]].map(([label, val], i) => (
        <div key={i} style={{
          padding:"20px 0", textAlign:"center",
          borderRight: i < 2 ? "1px solid #d4cdc2" : "none",
        }}>
          <div style={{ fontSize:"clamp(1.1rem,3.5vw,1.6rem)", letterSpacing:"-0.02em", lineHeight:1 }}>{val}</div>
          <div style={{ fontSize:"0.65rem", color:"#aaa", textTransform:"uppercase", letterSpacing:"0.12em", marginTop:5 }}>{label}</div>
        </div>
      ))}
    </div>

    {/* Action buttons */}
    <div style={{ display:"flex", gap:10, marginBottom:44 }}>
      <button className="main-btn" onClick={() => { setModal("add"); setEditId(null); setForm(BLANK); }} style={{
        flex:1, padding:"13px 0", background:"#1a1a1a", color:"#f5f0e8",
        border:"none", fontSize:"0.78rem", letterSpacing:"0.12em", transition:"opacity 0.15s",
      }}>+ ADD WANT</button>
      <button className="main-btn" onClick={() => setModal("deposit")} style={{
        flex:1, padding:"13px 0", background:"transparent", color:"#1a1a1a",
        border:"1.5px solid #1a1a1a", fontSize:"0.78rem", letterSpacing:"0.12em", transition:"opacity 0.15s",
      }}>↑ SAVINGS</button>
    </div>

    {/* Tabs */}
    <div style={{ display:"flex", gap:0, borderBottom:"1.5px solid #1a1a1a", marginBottom:36 }}>
      {[["list","List"],["history","History"]].map(([t,l]) => (
        <button key={t} className="tab-pill" onClick={() => setTab(t)} style={{
          padding:"9px 18px 9px 0", background:"none", border:"none",
          fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase",
          color: tab===t ? "#1a1a1a" : "#bbb",
          borderBottom: tab===t ? "1.5px solid #1a1a1a" : "1.5px solid transparent",
          marginBottom:-2,
        }}>{l}</button>
      ))}
    </div>

    {/* LIST */}
    {tab === "list" && (<>
      {items.length === 0 && (
        <div style={{ textAlign:"center", padding:"64px 0", color:"#ccc" }}>
          <div style={{ fontSize:"3.5rem", marginBottom:14 }}>◌</div>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase", margin:0 }}>No wants yet</p>
        </div>
      )}
      {items.map((w, idx) => (
        <div key={w.id} className="card want-row" style={{
          borderBottom:"1px solid #d4cdc2", paddingBottom:28, marginBottom:28,
          animationDelay:`${idx*0.05}s`,
        }}>
          <div style={{ display:"flex", gap:18, alignItems:"flex-start" }}>
            {/* Icon + rank */}
            <div style={{ minWidth:48, paddingTop:2 }}>
              <div style={{ fontSize:"2.6rem", lineHeight:1, textAlign:"center" }}>{w.emoji}</div>
              <div style={{ fontSize:"0.6rem", color:"#ccc", textAlign:"center", marginTop:5, letterSpacing:"0.06em" }}>#{idx+1}</div>
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              {/* Title row */}
              <div style={{ display:"flex", alignItems:"baseline", gap:10, flexWrap:"wrap", marginBottom:3 }}>
                <span style={{ fontSize:"1.2rem", letterSpacing:"-0.01em" }}>{w.name}</span>
                {w.pct >= 100 &&
                  <span style={{ fontSize:"0.62rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#5a8a5a", border:"1px solid #5a8a5a", padding:"2px 7px" }}>Saved ✓</span>}
              </div>

              {/* Price + urge */}
              <div style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"baseline" }}>
                <span style={{ fontSize:"1.05rem" }}>{fmt(w.price)}</span>
                <span style={{ fontSize:"0.72rem", color:"#aaa", letterSpacing:"0.04em" }}>Urge {w.urge}/10 · {URGE[w.urge]}</span>
              </div>

              {w.notes && <p style={{ margin:"5px 0 0", fontSize:"0.78rem", color:"#aaa", fontStyle:"italic" }}>{w.notes}</p>}

              {/* Progress */}
              <div style={{ marginTop:16 }}>
                <div style={{ height:2, background:"#e0d9d0", marginBottom:7, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", width:`${Math.min(w.pct,100)}%`,
                    background: w.pct >= 100 ? "#5a8a5a" : "#1a1a1a",
                    transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)",
                  }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:"0.68rem", color:"#bbb", letterSpacing:"0.04em" }}>
                    {fmt(Math.min(w.allocated, w.price))} · {fmt(w.price - Math.min(w.allocated,w.price))} to go
                  </span>
                  <span style={{ fontSize:"0.68rem", color: w.pct >= 100 ? "#5a8a5a" : "#1a1a1a", letterSpacing:"0.04em" }}>
                    {Math.min(w.pct,100)}%
                  </span>
                </div>
              </div>

              {/* Actions (show on hover) */}
              <div className="row-acts" style={{ display:"flex", gap:8, marginTop:12 }}>
                <button className="pill-btn" onClick={() => startEdit(w)} style={{
                  padding:"4px 12px", background:"transparent",
                  border:"1px solid #d4cdc2", fontSize:"0.68rem", letterSpacing:"0.08em",
                }}>EDIT</button>
                <button className="pill-btn" onClick={() => del(w.id)} style={{
                  padding:"4px 12px", background:"transparent",
                  border:"1px solid #d4cdc2", fontSize:"0.68rem", letterSpacing:"0.08em", color:"#c0392b",
                }}>DELETE</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>)}

    {/* HISTORY */}
    {tab === "history" && (
      history.length === 0
        ? <div style={{ textAlign:"center", padding:"64px 0", color:"#ccc" }}>
            <div style={{ fontSize:"3.5rem", marginBottom:14 }}>◌</div>
            <p style={{ fontSize:"0.72rem", letterSpacing:"0.14em", textTransform:"uppercase", margin:0 }}>No history yet</p>
          </div>
        : <>
            {[...history].reverse().map((h,i) => (
              <div key={i} className="card" style={{
                display:"flex", justifyContent:"space-between", alignItems:"baseline",
                borderBottom:"1px solid #d4cdc2", padding:"16px 0",
                animationDelay:`${i*0.04}s`,
              }}>
                <div>
                  <div style={{ fontSize:"1.2rem" }}>+{fmt(h.amount)}</div>
                  <div style={{ fontSize:"0.75rem", color:"#aaa", marginTop:3, fontStyle:"italic" }}>{h.note}</div>
                </div>
                <div style={{ fontSize:"0.68rem", color:"#ccc", letterSpacing:"0.06em" }}>{h.date}</div>
              </div>
            ))}
            <div style={{ marginTop:28, paddingTop:16, borderTop:"1.5px solid #1a1a1a", display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <span style={{ fontSize:"0.68rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#aaa" }}>Total</span>
              <span style={{ fontSize:"1.2rem" }}>{fmt(history.reduce((s,h)=>s+h.amount,0))}</span>
            </div>
          </>
    )}
  </div>

  {/* ── ADD/EDIT MODAL ── */}
  {modal === "add" && (
    <div onClick={() => { setModal(null); setEditId(null); setForm(BLANK); }} style={{
      position:"fixed", inset:0, background:"rgba(245,240,232,0.88)",
      zIndex:50, display:"flex", alignItems:"center", justifyContent:"center",
      padding:16, backdropFilter:"blur(3px)",
    }}>
      <div className="modal-box" onClick={e=>e.stopPropagation()} style={{
        background:"#f5f0e8", border:"1.5px solid #1a1a1a",
        width:"100%", maxWidth:420, padding:"36px 30px",
      }}>
        <h2 style={{ margin:"0 0 32px", fontSize:"1.6rem", fontWeight:400, fontStyle:"italic", letterSpacing:"-0.02em" }}>
          {editId ? "Edit want" : "New want"}
        </h2>

        {/* Icon */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:"0.65rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#aaa", marginBottom:10 }}>Icon</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {EMOJIS.map(em => (
              <button key={em} onClick={() => setForm(f=>({...f,emoji:em}))} style={{
                width:36, height:36, fontSize:"1.1rem",
                background: form.emoji===em ? "#1a1a1a" : "transparent",
                color: form.emoji===em ? "#f5f0e8" : "#1a1a1a",
                border:"1px solid #d4cdc2", transition:"all 0.12s",
              }}>{em}</button>
            ))}
          </div>
        </div>

        {[
          { label:"Name", key:"name", type:"text", placeholder:"What do you want?" },
          { label:"Price (₹)", key:"price", type:"number", placeholder:"0" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:22 }}>
            <div style={{ fontSize:"0.65rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#aaa", marginBottom:7 }}>{f.label}</div>
            <input type={f.type} style={fieldStyle} value={form[f.key]}
              onChange={e => setForm(ff=>({...ff,[f.key]:e.target.value}))}
              placeholder={f.placeholder} />
          </div>
        ))}

        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:"0.65rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#aaa", marginBottom:7 }}>
            Urge — <em style={{ textTransform:"none", letterSpacing:0 }}>{URGE[form.urge]} ({form.urge}/10)</em>
          </div>
          <input type="range" min={1} max={10} value={form.urge}
            onChange={e => setForm(f=>({...f,urge:+e.target.value}))} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.62rem", color:"#ccc", marginTop:3 }}>
            <span>Barely</span><span>Must have</span>
          </div>
        </div>

        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:"0.65rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#aaa", marginBottom:7 }}>Note</div>
          <textarea rows={2} style={{ ...fieldStyle, resize:"none" }}
            value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
            placeholder="Why do you want this?" />
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => { setModal(null); setEditId(null); setForm(BLANK); }} style={{
            flex:1, padding:"13px", background:"transparent",
            border:"1px solid #d4cdc2", fontSize:"0.75rem", letterSpacing:"0.1em",
          }}>CANCEL</button>
          <button onClick={submitWant} style={{
            flex:2, padding:"13px", background:"#1a1a1a", color:"#f5f0e8",
            border:"none", fontSize:"0.75rem", letterSpacing:"0.1em",
          }}>{editId ? "SAVE CHANGES" : "ADD WANT"}</button>
        </div>
      </div>
    </div>
  )}

  {/* ── DEPOSIT MODAL ── */}
  {modal === "deposit" && (
    <div onClick={() => setModal(null)} style={{
      position:"fixed", inset:0, background:"rgba(245,240,232,0.88)",
      zIndex:50, display:"flex", alignItems:"center", justifyContent:"center",
      padding:16, backdropFilter:"blur(3px)",
    }}>
      <div className="modal-box" onClick={e=>e.stopPropagation()} style={{
        background:"#f5f0e8", border:"1.5px solid #1a1a1a",
        width:"100%", maxWidth:380, padding:"36px 30px",
      }}>
        <h2 style={{ margin:"0 0 8px", fontSize:"1.6rem", fontWeight:400, fontStyle:"italic", letterSpacing:"-0.02em" }}>Add savings</h2>
        <p style={{ margin:"0 0 32px", fontSize:"0.75rem", color:"#aaa", letterSpacing:"0.04em" }}>
          Funds auto-allocate to your top priorities first.
        </p>

        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:"0.65rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#aaa", marginBottom:7 }}>Amount (₹)</div>
          <input type="number" autoFocus
            style={{ ...fieldStyle, fontSize:"1.6rem", letterSpacing:"-0.02em" }}
            value={deposit.amt} onChange={e => setDeposit(d=>({...d,amt:e.target.value}))} placeholder="0" />
        </div>

        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:"0.65rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#aaa", marginBottom:7 }}>Note</div>
          <input style={fieldStyle} value={deposit.note}
            onChange={e => setDeposit(d=>({...d,note:e.target.value}))} placeholder="e.g. March savings" />
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setModal(null)} style={{
            flex:1, padding:"13px", background:"transparent",
            border:"1px solid #d4cdc2", fontSize:"0.75rem", letterSpacing:"0.1em",
          }}>CANCEL</button>
          <button onClick={submitDeposit} style={{
            flex:2, padding:"13px", background:"#1a1a1a", color:"#f5f0e8",
            border:"none", fontSize:"0.75rem", letterSpacing:"0.1em",
          }}>ADD {deposit.amt ? fmt(+deposit.amt) : "SAVINGS"}</button>
        </div>
      </div>
    </div>
  )}
</div>
```

);
}
