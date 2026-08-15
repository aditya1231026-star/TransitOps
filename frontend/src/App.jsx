import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import axios from "axios";
import Fuse from "fuse.js";
import {
  LayoutDashboard, Bus, Users, Ticket,
  Plus, X, ArrowRight, AlertTriangle, CheckCircle2,
  LogOut, Menu, Crown, Eye, EyeOff, Edit, Trash2,
  UserPlus, Wrench, BarChart2, ShieldCheck, Zap,
  Truck, Route, Fuel, BarChart3, Sun, Moon, Search
} from "lucide-react";

/* ---------------------------------------------------------------
   API Service
--------------------------------------------------------------- */
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("transit_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(
  (r) => r.data,
  (e) => Promise.reject(new Error(e.response?.data?.message || e.message || "Request failed"))
);

/* ---------------------------------------------------------------
   Design Tokens
--------------------------------------------------------------- */
const C = {
  royal:        "#030a29",
  royalSoft:    "#182757",
  royalLine:    "#2B3A76",
  royalMid:     "#1E3A8A",
  royalMidDark: "#152C68",
  canvas:       "#F0EEE4",
  surface:      "#FFFFFF",
  line:         "#E7E1D2",
  textPrimary:  "#181C2E",
  textMuted:    "#6B7280",
  gold:         "#C6A34D",
  goldSoft:     "#F4E6C1",
  goldDeep:     "#8A6A22",
  green:        "#1F8F5D",
  greenSoft:    "#E4F4EB",
  blue:         "#3E64B1",
  blueSoft:     "#E8EDFA",
  red:          "#D6483F",
  redSoft:      "#FBEAEA",
  neutral:      "#EBE8DE",
};

/* ---------------------------------------------------------------
   Global CSS
--------------------------------------------------------------- */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@600;700&display=swap');
    :root{
      --card-bg:#ffffff;
      --bg:#F0EEE4;
      --text:#181C2E;
      --border:#E7E1D2;
    }
    .dark{
      --card-bg:#1f2937;
      --bg:#0f172a;
      --text:#ffffff;
      --border:#374151;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); }
    .to-root { font-family:'Inter',system-ui,sans-serif; color:var(--text); color-scheme:light; }
    .dark.to-root, .dark.to-root * { color-scheme:dark; }
    .to-root button { font-family:inherit; cursor:pointer; }
    .to-mono { font-family:'IBM Plex Mono',monospace; }
    .to-serif { font-family:'Cormorant Garamond',serif; }

    .to-scroll::-webkit-scrollbar { width:5px; height:5px; }
    .to-scroll::-webkit-scrollbar-thumb { background:#CCC8B8; border-radius:4px; }

    .to-root button:focus-visible,
    .to-root [tabindex]:focus-visible { outline:2px solid ${C.gold}; outline-offset:2px; border-radius:4px; }

    /* KPI tile */
    .to-flip {
      background:linear-gradient(160deg,${C.royal},#0B1330 120%);
      border-radius:8px;
      border:1px solid rgba(198,163,77,0.18);
      box-shadow:inset 0 -2px 0 rgba(255,255,255,0.05),0 4px 12px rgba(16,27,69,0.18);
      position:relative; overflow:hidden;
    }
    .to-flip::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(180deg,rgba(255,255,255,0.05),transparent 40%);
      pointer-events:none;
    }
    .to-flip-val { font-family:'IBM Plex Mono',monospace; color:#fff; letter-spacing:.5px; }
    .to-flip-lbl { color:rgba(255,255,255,0.5); font-size:9px; letter-spacing:.8px; margin-top:4px; }

    /* Buttons */
    .to-btn-primary {
      background:linear-gradient(135deg,${C.royalMid},${C.royalMidDark});
      color:#fff !important; border:1px solid rgba(198,163,77,0.35);
      transition:transform .15s,box-shadow .15s;
    }
    .to-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 16px rgba(30,58,138,.28); }
    .to-btn-primary:active:not(:disabled) { transform:translateY(0); }
    .to-btn-primary:disabled { background:#AEB4C7; border-color:transparent; cursor:not-allowed; opacity:.7; }

    .to-btn-ghost { background:var(--card-bg); border:1px solid var(--border); color:var(--text); transition:all .15s; }
    .to-btn-ghost:hover { border-color:${C.gold}; background:#FBF8EF; transform:translateY(-1px); }

    .to-btn-danger { background:var(--card-bg); border:1px solid var(--border); color:var(--text); transition:all .15s; }
    .to-btn-danger:hover { border-color:${C.red}; color:${C.red}; background:${C.redSoft}; }

    /* Badge */
    .to-badge { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700; letter-spacing:.3px; display:inline-block; }

    /* Table rows */
    .to-row { transition:background .12s; }
    .to-row:hover { background:#FAF8F0; }

    /* Card */
    .to-card { background:var(--card-bg); border:1px solid var(--border); box-shadow:0 1px 2px rgba(16,27,69,.03); }

    /* Dark mode overrides */
    .dark .to-main { background:var(--bg); }
    .dark .to-row:hover { background:rgba(255,255,255,0.05); }
    .dark .to-table th { background:#1a2744; color:rgba(255,255,255,0.5); border-color:var(--border); }
    .dark .to-table td { border-color:var(--border); }
    .dark .to-card { background:var(--card-bg); border-color:var(--border); }
    .dark .to-section-header > div > div:first-child { color:var(--text); }
    .dark .to-btn-ghost { background:var(--card-bg); border-color:var(--border); color:var(--text); }
    .dark .to-btn-ghost:hover { border-color:${C.gold}; background:#1f2937; }
    .dark .to-btn-danger { background:var(--card-bg); border-color:var(--border); color:var(--text); }

    /* Inputs */
    input.to-input, select.to-input, textarea.to-input {
      border:1px solid var(--border); border-radius:7px; padding:9px 11px;
      font-size:14px; font-family:'Inter',sans-serif; width:100%;
      outline:none; background:var(--card-bg); color:var(--text); color-scheme:light;
      transition:border-color .15s,box-shadow .15s;
    }
    input.to-input::placeholder, textarea.to-input::placeholder { color:#9AA3B2; }
    input.to-input:focus, select.to-input:focus, textarea.to-input:focus {
      border-color:${C.royalMid}; box-shadow:0 0 0 3px rgba(30,58,138,.1);
    }

    /* Layout */
    .to-shell { display:flex; min-height:100vh; background:${C.canvas}; overflow:hidden; flex-direction:row; }
    .to-topbar {
      display:none; align-items:center; justify-content:space-between;
      padding:12px 16px; background:${C.royal};
      border-bottom:1px solid ${C.royalLine}; position:sticky; top:0; z-index:40; width:100%;
    }
    .to-hamburger {
      background:rgba(255,255,255,.06); border:1px solid rgba(198,163,77,.35);
      border-radius:7px; width:36px; height:36px;
      display:flex; align-items:center; justify-content:center; color:${C.gold};
    }
    .to-sidebar {
      width:160px; background:${C.royal};
      display:flex; flex-direction:column; flex-shrink:0;
      border-right:1px solid ${C.royalLine}; height:100vh; position:sticky; top:0;
    }
    .to-overlay { display:none; position:fixed; inset:0; background:rgba(8,12,30,.55); z-index:45; }
    .to-main { flex:1; overflow-y:auto; padding:28px 28px 20px; min-width:0; height:100vh; }

    /* Nav */
    .to-nav-item {
      display:flex; align-items:center; gap:9px;
      padding:9px 12px; border-radius:6px; cursor:pointer; margin-bottom:1px;
      transition:background .15s,color .15s;
      color:#8A95B8; font-size:12.5px; font-weight:500; position:relative;
    }
    .to-nav-item:hover:not(.disabled) { background:${C.royalSoft}; color:#fff; }
    .to-nav-item.active { background:${C.royalSoft}; color:#fff; font-weight:700; }
    .to-nav-item.active::before {
      content:''; position:absolute; left:-8px; top:8px; bottom:8px;
      width:3px; background:${C.gold}; border-radius:3px;
    }
    .to-nav-item.disabled { opacity:.4; cursor:default; }

    /* KPI grid */
    .to-kpi-row {
      display:grid;
      grid-template-columns:repeat(7,1fr);
      gap:10px; margin-bottom:20px;
    }

    /* Dashboard two-col */
    .to-dash-grid { display:grid; grid-template-columns:1.25fr 1fr; gap:16px; }

    /* Form grids */
    .to-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

    /* Tables */
    .to-table-wrap { width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
    .to-table { width:100%; border-collapse:collapse; font-size:13px; min-width:580px; }
    .to-table th {
      padding:9px 14px; font-size:10.5px; font-weight:700;
      color:${C.textMuted}; letter-spacing:.3px;
      background:#FAF8F0; text-align:left;
    }
    .to-table td { padding:9px 14px; border-top:1px solid ${C.line}; }

    /* Animations */
    .to-fade-in { animation:toFade .22s ease; }
    @keyframes toFade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    .to-spinner {
      width:24px; height:24px;
      border:3px solid rgba(198,163,77,.18); border-top-color:${C.gold};
      border-radius:50%; animation:spin .75s linear infinite;
      display:inline-block; flex-shrink:0;
    }

    /* Responsive */
    @media(max-width:960px){
      .to-topbar{display:flex;}
      .to-shell{flex-direction:column;}
      .to-sidebar{
        position:fixed;top:0;left:0;bottom:0;z-index:50;
        transform:translateX(-104%);width:min(75vw,220px);
        box-shadow:12px 0 40px rgba(0,0,0,.35);
      }
      .to-overlay.open{display:block;}
      .to-main{padding:16px;height:auto;overflow:visible;}
      .to-kpi-row{grid-template-columns:repeat(4,1fr);}
    }
    @media(max-width:760px){ .to-dash-grid{grid-template-columns:1fr;} }
    @media(max-width:600px){
      .to-grid-2{grid-template-columns:1fr;}
      .to-kpi-row{grid-template-columns:repeat(2,1fr);}
    }
    @media(max-width:480px){
      .to-section-header{flex-direction:column;align-items:flex-start!important;gap:10px;}
    }
  `}</style>
);

/* ---------------------------------------------------------------
   Navigation
--------------------------------------------------------------- */
const NAV = [
  { key: "dashboard",   label: "Dashboard",       icon: LayoutDashboard },
  { key: "vehicles",    label: "Vehicles",        icon: Truck           },
  { key: "drivers",     label: "Drivers",         icon: Users           },
  { key: "routes",      label: "Routes & Dispatch", icon: Route         },
  { key: "maintenance", label: "Maintenance",     icon: Wrench          },
  { key: "fuel",        label: "Expenses",        icon: Fuel            },
  { key: "reports",     label: "Reports",         icon: BarChart2       },
  { key: "settings",    label: "Settings",        icon: ShieldCheck     },
];

/* ---------------------------------------------------------------
   Shared Primitives
--------------------------------------------------------------- */
function StatusBadge({ status }) {
  const map = {
    Active:      { bg: C.greenSoft, fg: C.green },
    Available:   { bg: C.greenSoft, fg: C.green },
    Inactive:    { bg: C.redSoft,   fg: C.red   },
    Maintenance: { bg: C.goldSoft,  fg: C.goldDeep },
    "On Trip":   { bg: C.blueSoft,  fg: C.blue  },
    "Off Duty":  { bg: C.neutral,   fg: C.textMuted },
    Suspended:   { bg: C.redSoft,   fg: C.red   },
    Confirmed:   { bg: C.greenSoft, fg: C.green },
    Booked:      { bg: C.greenSoft, fg: C.green },
    Cancelled:   { bg: C.redSoft,   fg: C.red   },
    Completed:   { bg: C.blueSoft,  fg: C.blue  },
    Pending:     { bg: C.goldSoft,  fg: C.goldDeep },
    Paid:        { bg: C.greenSoft, fg: C.green },
    Unpaid:      { bg: C.redSoft,   fg: C.red   },
    Failed:      { bg: C.redSoft,   fg: C.red   },
    Draft:       { bg: C.neutral,   fg: C.textMuted },
  };
  const col = map[status] || { bg: C.neutral, fg: C.textMuted };
  return (
    <span className="to-badge"
      style={{ background: col.bg, color: col.fg, padding: "3px 8px", borderRadius: 999 }}>
      {(status || "—").toUpperCase()}
    </span>
  );
}

function KPITile({ label, value, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const num = parseFloat(value) || 0;
    const obj = { v: 0 };
    gsap.fromTo(el, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.38, ease: "back.out(1.5)" });
    gsap.to(obj, { v: num, duration: 0.65, ease: "power2.out",
      onUpdate: () => { if (el) el.textContent = `${Number.isInteger(num) ? Math.round(obj.v) : obj.v.toFixed(0)}${suffix}`; },
    });
  }, [value, suffix]);
  return (
    <div className="to-flip" style={{ padding: "14px 14px 12px" }}>
      <div ref={ref} className="to-flip-val" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
        {value}{suffix}
      </div>
      <div className="to-flip-lbl">{label}</div>
    </div>
  );
}

function Modal({ title, onClose, children, width = 500 }) {
  const backdrop = useRef(null);
  const card = useRef(null);
  useLayoutEffect(() => {
    gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.18 });
    gsap.fromTo(card.current, { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "power3.out" });
  }, []);
  const close = () => {
    gsap.to(card.current, { opacity: 0, y: 10, scale: 0.97, duration: 0.14 });
    gsap.to(backdrop.current, { opacity: 0, duration: 0.14, delay: 0.02, onComplete: onClose });
  };
  return (
    <div ref={backdrop} onClick={close}
      style={{ position: "fixed", inset: 0, background: "rgba(9,13,32,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 16 }}>
      <div ref={card} onClick={e => e.stopPropagation()} className="to-card"
        style={{ width, maxWidth: "100%", borderRadius: 12, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.line}`, background: "#FAF8F2", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>{title}</h3>
          <button onClick={close} style={{ border: "none", background: "none", color: C.textMuted, padding: 3, display: "flex", borderRadius: 5 }}><X size={17} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.textMuted, marginBottom: 5 }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ padding: "38px 20px", textAlign: "center", color: C.textMuted, fontSize: 13 }}>
      <AlertTriangle size={22} style={{ marginBottom: 8, opacity: .38 }} />
      <div>{text}</div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="to-section-header"
      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && <div style={{ display: "flex", gap: 8 }}>{action}</div>}
    </div>
  );
}

function ActionButton({ children, onClick, icon: Icon, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="to-btn-primary"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 700 }}>
      {Icon && <Icon size={13} />}{children}
    </button>
  );
}

function Spinner() { return <span className="to-spinner" />; }
function LoadingBlock() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 10 }}>
      <Spinner />
      <div style={{ fontSize: 13, color: C.textMuted }}>Loading…</div>
    </div>
  );
}



function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ---------------------------------------------------------------
   Donut Chart
--------------------------------------------------------------- */
function DonutChart({ segments }) {
  const r = 44, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  const arcs = segments.map(s => {
    const dash = (s.pct / 100) * circ;
    const gap  = circ - dash;
    const off  = -(cum / 100) * circ;
    cum += s.pct;
    return { ...s, dash, gap, off };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.neutral} strokeWidth="20" />
        {arcs.map(a => (
          <circle key={a.label} cx={cx} cy={cy} r={r}
            fill="none" stroke={a.color} strokeWidth="20"
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={a.off}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray .8s ease" }} />
        ))}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center" }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: C.textMuted }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Main App
--------------------------------------------------------------- */
export default function TransitOpsApp() {
  const [token,       setToken]       = useState(() => localStorage.getItem("transit_token") || null);
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(!!localStorage.getItem("transit_token"));
  const [authView,    setAuthView]    = useState("login");

  const [stats,      setStats]      = useState(null);
  const [vehicles,   setVehicles]   = useState([]);
  const [drivers,    setDrivers]    = useState([]);
  const [trips,      setTrips]      = useState([]);
  const [maintenance,setMaintenance]= useState([]);
  const [expenses,   setExpenses]   = useState([]);
  const [reportsData,setReportsData]= useState(null);
  const [sysUsers,   setSysUsers]   = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);


  const [view,    setView]    = useState("dashboard");
  const [toast,   setToast]   = useState(null);
  const [modal,   setModal]   = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  const loginRef   = useRef(null);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const toastRef   = useRef(null);

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!token) { setAuthLoading(false); return; }
    api.get("/auth/profile")
      .then(d => setUser(d.data))
      .catch(() => { localStorage.removeItem("transit_token"); setToken(null); })
      .finally(() => setAuthLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => { if (token && user) fetchAll(); }, [token, user]); // eslint-disable-line

  const fetchAll = async () => {
    setDataLoading(true);
    try {
      const [s, v, d, t, m, e, rep, u] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/vehicles"),
        api.get("/drivers"),
        api.get("/trips"),
        api.get("/maintenance"),
        api.get("/expenses"),
        api.get("/reports"),
        api.get("/auth/users").catch(() => ({ data: [] })), // Admin only route
      ]);
      setStats(s.data);
      setVehicles(v.data);
      setDrivers(d.data);
      setTrips(t.data);
      setMaintenance(m.data);
      setExpenses(e.data);
      setReportsData(rep.data);
      setSysUsers(u.data);
    } catch (err) { showToast(err.message, "err"); }
    finally { setDataLoading(false); }
  };

  useLayoutEffect(() => {
    if (!token && loginRef.current) {
      gsap.fromTo(loginRef.current.querySelectorAll(".anim-in"),
        { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power3.out" });
    }
  }, [token, authView]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(el.querySelectorAll(".to-card,.to-flip"),
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.035, ease: "power2.out", delay: 0.04 });
    }, el);
    return () => ctx.revert();
  }, [view, token]);

  useEffect(() => {
    if (!sidebarRef.current) return;
    if (navOpen) {
      gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.2 });
      gsap.to(sidebarRef.current, { xPercent: 0, duration: 0.3, ease: "power3.out" });
    } else {
      gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.2 });
      gsap.to(sidebarRef.current, { xPercent: -104, duration: 0.26, ease: "power2.in" });
    }
  }, [navOpen]);

  useEffect(() => {
    if (toast && toastRef.current)
      gsap.fromTo(toastRef.current, { opacity: 0, y: -10, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "back.out(1.7)" });
  }, [toast]);

  /* Auth */
  const handleLogin = async (email, password) => {
    const d = await api.post("/auth/login", { email, password });
    localStorage.setItem("transit_token", d.data.token);
    setToken(d.data.token);
    setUser({ _id: d.data._id, name: d.data.name, email: d.data.email, role: d.data.role });
  };
  const handleRegister = async (name, email, password) => {
    const d = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("transit_token", d.data.token);
    setToken(d.data.token);
    setUser({ _id: d.data._id, name: d.data.name, email: d.data.email, role: d.data.role });
  };
  const handleLogout = () => {
    localStorage.removeItem("transit_token");
    setToken(null); setUser(null);
    setStats(null); setVehicles([]); setDrivers([]); setTrips([]);
  };

  /* CRUD */
  const c = {
    createVehicle:async p => { await api.post("/vehicles", p);           await fetchAll(); showToast("Vehicle registered"); },
    updateVehicle:async (id, p) => { await api.put(`/vehicles/${id}`, p); await fetchAll(); showToast("Vehicle updated"); },
    deleteVehicle:async id => { await api.delete(`/vehicles/${id}`);      await fetchAll(); showToast("Vehicle deleted"); },
    createDriver: async p => { await api.post("/drivers", p);           await fetchAll(); showToast("Driver added"); },
    updateDriver: async (id, p) => { await api.put(`/drivers/${id}`, p); await fetchAll(); showToast("Driver updated"); },
    deleteDriver: async id => { await api.delete(`/drivers/${id}`);      await fetchAll(); showToast("Driver deleted"); },
    createTrip:   async p => { await api.post("/trips", p);              await fetchAll(); showToast("Trip dispatched"); },
    updateTrip:   async (id, p) => { await api.put(`/trips/${id}`, p);   await fetchAll(); showToast("Trip updated"); },
    deleteTrip:   async id => { await api.delete(`/trips/${id}`);        await fetchAll(); showToast("Trip deleted"); },
    createMaint:  async p => { await api.post("/maintenance", p);        await fetchAll(); showToast("Log added"); },
    updateMaint:  async (id, p) => { await api.put(`/maintenance/${id}`, p); await fetchAll(); showToast("Log updated"); },
    deleteMaint:  async id => { await api.delete(`/maintenance/${id}`);  await fetchAll(); showToast("Log deleted"); },
    createExp:    async p => { await api.post("/expenses", p);           await fetchAll(); showToast("Expense added"); },
    updateExp:    async (id, p) => { await api.put(`/expenses/${id}`, p); await fetchAll(); showToast("Expense updated"); },
    deleteExp:    async id => { await api.delete(`/expenses/${id}`);     await fetchAll(); showToast("Expense deleted"); },
    updateUser:   async (id, r) => { await api.put(`/auth/users/${id}/role`, { role: r }); await fetchAll(); showToast("Role updated"); },
  };

  const del = (fn, id, msg) => async () => {
    if (!window.confirm(msg)) return;
    try { await fn(id); } catch (e) { showToast(e.message, "err"); }
  };

  /* Loading */
  if (authLoading) return (
    <div className={`to-root ${darkMode ? "dark" : ""}`} style={{ minHeight: "100vh", background: C.royal, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlobalStyle /><Spinner />
    </div>
  );

  if (!token || !user) {
    return authView === "login"
      ? <LoginView loginRef={loginRef} onLogin={handleLogin} onSwitch={() => setAuthView("signup")} />
      : <SignupView loginRef={loginRef} onRegister={handleRegister} onSwitch={() => setAuthView("login")} />;
  }

  return (
    <div className={`to-root to-fade-in to-shell${darkMode ? " dark" : ""}`}>
      <GlobalStyle />

      {/* Mobile topbar */}
      <div className="to-topbar">
        <button className="to-hamburger" onClick={() => setNavOpen(true)} aria-label="Open nav"><Menu size={17} /></button>
        <div className="to-mono" style={{ color: C.gold, fontSize: 11, letterSpacing: "1.5px" }}>TRANSITOPS</div>
        <div style={{ width: 36 }} />
      </div>

      {/* Overlay */}
      <div ref={overlayRef} className={`to-overlay${navOpen ? " open" : ""}`}
        style={{ opacity: 0, visibility: "hidden" }} onClick={() => setNavOpen(false)} />

      {/* Sidebar */}
      <nav ref={sidebarRef} className="to-sidebar">
        {/* Brand */}
        <div style={{ padding: "18px 14px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Crown size={13} color={C.gold} />
            <span className="to-mono" style={{ color: C.gold, fontSize: 11, letterSpacing: "1.5px" }}>TRANSITOPS</span>
          </div>
          <div style={{ color: "#5C6A8F", fontSize: 10, marginTop: 3 }}>Dispatch Console</div>
        </div>

        {/* Nav items */}
        <div className="to-scroll" style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
          {NAV.map(n => {
            const Icon = n.icon;
            const isPlaceholder = n.placeholder;
            return (
              <div key={n.key}
                onClick={() => { if (!n.disabled) { setView(n.key); setNavOpen(false); } }}
                className={`to-nav-item${view === n.key ? " active" : ""}${n.disabled ? " disabled" : ""}`}>
                <Icon size={13} /><span>{n.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dark Mode Toggle */}
        <div style={{ padding: "6px 8px" }}>
          <button
            onClick={() => setDarkMode(dm => !dm)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: darkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.8)", fontSize: 12.5, fontWeight: 600,
              transition: "background 0.2s",
            }}
          >
            {darkMode ? <Sun size={14} color="#F5C842" /> : <Moon size={14} color="#8A95B8" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* User footer */}
        <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${C.royalLine}` }}>
          <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{user.name}</div>
          <div style={{ fontSize: 10, color: "#5C6A8F", marginTop: 1 }}>{user.role || "Fleet Manager"}</div>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, color: "#8A95B8", fontSize: 11, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="to-scroll to-main" ref={contentRef} key={view}>
        {toast && (
          <div ref={toastRef} style={{
            position: "fixed", top: 20, right: 20, zIndex: 80,
            padding: "10px 16px", borderRadius: 9,
            background: toast.kind === "err" ? "#3A1F1D" : C.royal,
            color: "#fff", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,.3)",
            border: `1px solid ${toast.kind === "err" ? "rgba(214,72,63,.4)" : "rgba(198,163,77,.3)"}`,
            maxWidth: "calc(100vw - 40px)",
          }}>
            {toast.kind === "err" ? <AlertTriangle size={13} color={C.red} /> : <CheckCircle2 size={13} color={C.gold} />}
            {toast.msg}
          </div>
        )}

        {view === "dashboard"   && <DashboardView stats={stats} drivers={drivers} vehicles={vehicles} trips={trips} user={user} loading={dataLoading} />}
        {view === "vehicles"    && <VehiclesView vehicles={vehicles} crud={c} setModal={setModal} loading={dataLoading} del={del} />}
        {view === "drivers"     && <DriversView drivers={drivers} crud={c} setModal={setModal} loading={dataLoading} del={del} />}
        {view === "routes"      && <RoutesView trips={trips} vehicles={vehicles} drivers={drivers} crud={c} setModal={setModal} loading={dataLoading} del={del} />}
        {view === "maintenance" && <MaintenanceView logs={maintenance} vehicles={vehicles} crud={c} setModal={setModal} loading={dataLoading} del={del} />}
        {view === "fuel"        && <FuelView expenses={expenses} vehicles={vehicles} crud={c} setModal={setModal} loading={dataLoading} del={del} />}
        {view === "reports"     && <ReportsView data={reportsData} loading={dataLoading} />}
        {view === "settings"    && <SettingsView users={sysUsers} user={user} crud={c} loading={dataLoading} />}
      </div>

      {/* Modals */}
      {modal?.type === "vehicle-form" && (
        <Modal title={modal.data ? "Edit Vehicle" : "Register Vehicle"} onClose={() => setModal(null)} width={520}>
          <VehicleForm initial={modal.data}
            onSubmit={async p => { try { modal.data ? await c.updateVehicle(modal.data._id, p) : await c.createVehicle(p); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
      {modal?.type === "driver-form" && (
        <Modal title={modal.data ? "Edit Driver" : "Add Driver"} onClose={() => setModal(null)}>
          <DriverForm initial={modal.data}
            onSubmit={async p => { try { modal.data ? await c.updateDriver(modal.data._id, p) : await c.createDriver(p); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
      {modal?.type === "trip-form" && (
        <Modal title={modal.data ? "Edit Trip" : "Dispatch Trip"} onClose={() => setModal(null)} width={560}>
          <TripForm initial={modal.data} vehicles={vehicles} drivers={drivers}
            onSubmit={async p => { try { modal.data ? await c.updateTrip(modal.data._id, p) : await c.createTrip(p); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
      {modal?.type === "trip-complete" && (
        <Modal title="Complete Trip" onClose={() => setModal(null)} width={400}>
          <TripCompleteForm initial={modal.data}
            onSubmit={async p => { try { await c.updateTrip(modal.data._id, { ...p, status: "Completed" }); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
      {modal?.type === "maint-form" && (
        <Modal title={modal.data ? "Edit Maintenance Log" : "New Maintenance Log"} onClose={() => setModal(null)}>
          <MaintenanceForm initial={modal.data} vehicles={vehicles}
            onSubmit={async p => { try { modal.data ? await c.updateMaint(modal.data._id, p) : await c.createMaint(p); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
      {modal?.type === "fuel-form" && (
        <Modal title={modal.data ? "Edit Expense" : "Log Expense"} onClose={() => setModal(null)}>
          <FuelForm initial={modal.data} vehicles={vehicles}
            onSubmit={async p => { try { modal.data ? await c.updateExp(modal.data._id, p) : await c.createExp(p); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Auth Screens
--------------------------------------------------------------- */
/* Roles shown on login */
const LOGIN_ROLES = [
  { key: "fleet",     label: "Fleet Manager",   modules: 6 },
  { key: "driver",    label: "Driver",          modules: 2 },
  { key: "safety",    label: "Safety Officer",  modules: 4 },
  { key: "financial", label: "Financial Analyst", modules: 4 },
];

function AuthShell({ loginRef, children }) {
  return (
    <div ref={loginRef} className="to-root"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 120% 80% at 50% 0%, #0D1F6E 0%, #030a29 55%, #02081A 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}>
      <GlobalStyle />
      {children}
    </div>
  );
}

function ErrAlert({ msg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 7, background: C.redSoft, color: C.red, fontSize: 13, marginBottom: 14, border: `1px solid rgba(214,72,63,.2)` }}>
      <AlertTriangle size={13} />{msg}
    </div>
  );
}

function PwInput({ value, onChange, show, toggle, placeholder = "••••••••" }) {
  return (
    <div style={{ position: "relative" }}>
      <input className="to-input" type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ paddingRight: 36 }} autoComplete="off" />
      <button type="button" onClick={toggle}
        style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: C.textMuted, display: "flex", cursor: "pointer", padding: 2 }}>
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function LoginView({ loginRef, onLogin, onSwitch }) {
  const [email,    setEmail]    = useState("ops@transitops.com");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("fleet");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try { await onLogin(email, password); }
    catch (err) { setError(err.message || "Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell loginRef={loginRef}>
      {/* Brand */}
      <div className="anim-in" style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
          <Crown size={13} color={C.gold} />
          <span className="to-mono" style={{ color: C.gold, fontSize: 11.5, letterSpacing: "2px" }}>TRANSITOPS // CONSOLE</span>
        </div>
        <div className="to-serif" style={{ color: "#fff", fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}>Sign in to operations</div>
        <div style={{ color: "rgba(255,255,255,.45)", fontSize: 13, marginTop: 6 }}>Select your role to enter the console.</div>
      </div>

      {/* Card */}
      <div className="anim-in" style={{
        background: "#fff", borderRadius: 16,
        padding: "26px 26px 22px", width: "100%", maxWidth: 400,
        boxShadow: "0 32px 80px rgba(0,0,0,.45)",
      }}>
        {error && <ErrAlert msg={error} />}
        <form onSubmit={submit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: ".5px", marginBottom: 5 }}>Email</label>
            <input className="to-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ops@transitops.com" autoComplete="email" />
          </div>
          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: ".5px", marginBottom: 5 }}>Password</label>
            <input className="to-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          {/* Role selector */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "1px", marginBottom: 9 }}>ROLE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {LOGIN_ROLES.map(r => {
                const active = role === r.key;
                return (
                  <button key={r.key} type="button" onClick={() => setRole(r.key)}
                    style={{
                      padding: "11px 13px", borderRadius: 9, textAlign: "left", cursor: "pointer",
                      border: `1px solid ${active ? C.royalMid : C.line}`,
                      background: active ? C.royal : "#fff",
                      transition: "all .15s",
                    }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: active ? "#fff" : C.textPrimary }}>{r.label}</div>
                    <div style={{ fontSize: 10.5, marginTop: 2, color: active ? "rgba(255,255,255,.5)" : C.textMuted }}>{r.modules} modules</div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Submit */}
          <button type="submit" disabled={loading} className="to-btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 700 }}>
            {loading ? <><Spinner />&nbsp;Signing in…</> : <><ArrowRight size={14} />Sign In</>}
          </button>
        </form>
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12.5, color: C.textMuted }}>
          Don't have an account?{" "}
          <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.royalMid, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Sign up</button>
        </div>
      </div>
    </AuthShell>
  );
}

function SignupView({ loginRef, onRegister, onSwitch }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try { await onRegister(name, email, password); }
    catch (err) { setError(err.message || "Registration failed"); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell loginRef={loginRef}>
      <div className="to-card anim-in" style={{ borderRadius: 14, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
        <div className="to-serif" style={{ fontSize: 24, fontWeight: 700, marginBottom: 3 }}>Create account</div>
        <div style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 18 }}>Register to access the console</div>
        {error && <ErrAlert msg={error} />}
        <form onSubmit={submit}>
          <Field label="Full Name" required>
            <input className="to-input" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" autoComplete="name" />
          </Field>
          <Field label="Email Address" required>
            <input className="to-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@transitops.com" autoComplete="email" />
          </Field>
          <div className="to-grid-2">
            <Field label="Password" required>
              <PwInput value={password} onChange={setPassword} show={showPw} toggle={() => setShowPw(v => !v)} placeholder="Min. 6 chars" />
            </Field>
            <Field label="Confirm Password" required>
              <PwInput value={confirm} onChange={setConfirm} show={showPw} toggle={() => setShowPw(v => !v)} placeholder="Repeat password" />
            </Field>
          </div>
          <button type="submit" disabled={loading} className="to-btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 700, marginTop: 6 }}>
            {loading ? <><Spinner />&nbsp;Creating account…</> : <><UserPlus size={14} />Create Account</>}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 12.5, color: C.textMuted }}>
          Already have an account?{" "}
          <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.royalMid, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Sign in</button>
        </div>
      </div>
    </AuthShell>
  );
}

/* ---------------------------------------------------------------
   Dashboard
--------------------------------------------------------------- */
function DashboardView({ stats, drivers, vehicles, trips, user, loading }) {
  if (loading || !stats) return <LoadingBlock />;

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Fleet Manager";

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle={`Welcome back — viewing as ${roleLabel}`} />

      {/* KPI row */}
      <div className="to-kpi-row">
        <KPITile label="ACTIVE VEHICLES"  value={stats.activeVehicles} />
        <KPITile label="AVAILABLE"        value={stats.availableVehicles} />
        <KPITile label="IN SHOP"          value={stats.inShopVehicles} />
        <KPITile label="ACTIVE TRIPS"     value={stats.activeTrips} />
        <KPITile label="PENDING TRIPS"    value={stats.pendingTrips} />
        <KPITile label="DRIVERS ON DUTY"  value={stats.driversOnDuty} />
        <KPITile label="UTILIZATION"      value={stats.fleetUtilization} suffix="%" />
      </div>

      {/* Two-column grid */}
      <div className="to-dash-grid">
        {/* Recent trips */}
        <div className="to-card" style={{ borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 14 }}>Recent trips</div>
          {recentTrips.length === 0 ? (
            <EmptyState text="No trips found. Dispatch your first cargo trip." />
          ) : (
            <div>
              {recentTrips.map((t, i) => {
                const v = vehicles.find(v => v._id === (t.vehicle?._id || t.vehicle));
                const d = drivers.find(d => d._id === (t.driver?._id || t.driver));
                return (
                  <div key={t._id || i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: i < recentTrips.length - 1 ? `1px solid ${C.line}` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {t.source} <ArrowRight size={11} style={{ display: "inline", verticalAlign: "middle", margin: "0 2px" }} /> {t.destination}
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                        {v?.registrationNumber || "Vehicle"} · {d?.name || "Driver"} · {t.cargoWeight}kg
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fleet Utilization spacer/future chart */}
        <div className="to-card" style={{ borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16 }}>Operational Overview</div>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0", color: C.textMuted, fontSize: 12, textAlign: 'center' }}>
            Cargo Fleet metrics running smoothly.<br/>Check Reports for detailed analytics.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Vehicles View
--------------------------------------------------------------- */
function VehiclesView({ vehicles, crud, setModal, loading, del }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredVehicles = React.useMemo(() => {
    let data = [...vehicles];
    
    // Fuzzy Search
    if (search.trim()) {
      const fuse = new Fuse(data, {
        keys: ["registrationNumber", "model", "type"],
        threshold: 0.3,
      });
      data = fuse.search(search).map(res => res.item);
    }
    
    if (filter !== "All") {
      data = data.filter(v => v.status === filter);
    }
    return data.sort((a, b) => (a.model || "").localeCompare(b.model || ""));
  }, [vehicles, search, filter]);

  const statusColors = {
    Available: { bg: "#D1FAE5", fg: "#065F46" },
    "On Trip": { bg: "#FEF3C7", fg: "#92400E" },
    "In Shop": { bg: "#FEE2E2", fg: "#991B1B" },
    Retired:   { bg: "#F3F4F6", fg: "#374151" }
  };

  if (loading) return <Spinner />;

  return (
    <div className="to-fade-in">
      <SectionHeader
        title="Vehicles"
        subtitle={`${vehicles.length} vehicles registered in fleet`}
        action={<ActionButton icon={Plus} onClick={() => setModal({ type: "vehicle-form", data: null })}>Add Vehicle</ActionButton>}
      />
      
      {/* Search + Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", background: "var(--card-bg)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", background: "var(--card-bg)" }}>
          <Search size={15} style={{ opacity: 0.45, flexShrink: 0, color: "var(--text)" }} />
          <input
            type="text"
            placeholder="Search by registration, model, or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", padding: "9px 8px", width: "100%", color: "var(--text)", fontSize: 13 }}
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)", fontSize: 13 }}>
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {/* Cards */}
      {filteredVehicles.length === 0 ? (
        <EmptyState text="No vehicles match your search or filters." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredVehicles.map(v => {
            const sc = statusColors[v.status] || statusColors.Retired;
            return (
              <div key={v._id} className="to-card" style={{ borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{v.registrationNumber}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{v.model} &bull; {v.type}</div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.fg, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.4px" }}>
                    {(v.status || "UNKNOWN").toUpperCase()}
                  </span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: C.textMuted, marginBottom: 16, padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Capacity:</span><br/>{v.maxLoadCapacity} kg</div>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Odometer:</span><br/>{v.odometer.toLocaleString()} km</div>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Acq. Cost:</span><br/>₹{v.acquisitionCost.toLocaleString()}</div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="to-btn-ghost" onClick={() => setModal({ type: "vehicle-form", data: v })} style={{ padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Edit size={13} /> Edit
                  </button>
                  <button className="to-btn-danger" onClick={del(crud.deleteVehicle, v._id, "Delete this vehicle?")} style={{ padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Drivers View
--------------------------------------------------------------- */
/* ---------------------------------------------------------------
   Drivers View
--------------------------------------------------------------- */
function DriversView({ drivers, crud, setModal, loading, del }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredDrivers = React.useMemo(() => {
    let data = [...drivers];
    
    if (search.trim()) {
      const fuse = new Fuse(data, {
        keys: ["name", "licenseNumber", "contactNumber"],
        threshold: 0.3,
      });
      data = fuse.search(search).map(res => res.item);
    }
    
    if (filter !== "All") {
      data = data.filter(d => d.status === filter);
    }
    return data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [drivers, search, filter]);

  const statusColors = {
    Available: { bg: "#D1FAE5", fg: "#065F46" },
    "On Trip": { bg: "#FEF3C7", fg: "#92400E" },
    Suspended: { bg: "#FEE2E2", fg: "#991B1B" },
    "Off Duty":{ bg: "#F3F4F6", fg: "#374151" }
  };

  if (loading) return <Spinner />;

  return (
    <div className="to-fade-in">
      <SectionHeader
        title="Drivers"
        subtitle={`${drivers.length} drivers on record`}
        action={<ActionButton icon={Plus} onClick={() => setModal({ type: "driver-form", data: null })}>Add Driver</ActionButton>}
      />
      
      {/* Search + Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", background: "var(--card-bg)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", background: "var(--card-bg)" }}>
          <Search size={15} style={{ opacity: 0.45, flexShrink: 0, color: "var(--text)" }} />
          <input
            type="text"
            placeholder="Search by name, license no, or contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", padding: "9px 8px", width: "100%", color: "var(--text)", fontSize: 13 }}
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)", fontSize: 13 }}>
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Suspended">Suspended</option>
          <option value="Off Duty">Off Duty</option>
        </select>
      </div>

      {/* Cards */}
      {filteredDrivers.length === 0 ? (
        <EmptyState text="No drivers match your search or filters." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredDrivers.map(d => {
            const sc = statusColors[d.status] || statusColors["Off Duty"];
            const days = daysUntil(d.licenseExpiry);
            const expColor = days < 0 ? C.red : days <= 30 ? C.goldDeep : C.textPrimary;
            const expText = days < 0 ? " (Expired)" : days <= 30 ? ` (${days}d)` : "";
            
            return (
              <div key={d._id} className="to-card" style={{ borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{d.licenseNumber} &bull; {d.licenseCategory}</div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.fg, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.4px" }}>
                    {(d.status || "UNKNOWN").toUpperCase()}
                  </span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: C.textMuted, marginBottom: 16, padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>License Expiry:</span><br/>
                    <span style={{ color: expColor, fontWeight: days <= 30 ? 700 : 400 }}>{fmtDate(d.licenseExpiry)}{expText}</span>
                  </div>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Contact:</span><br/>{d.contactNumber || "—"}</div>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Safety Score:</span><br/>
                    <span style={{ fontWeight: 700, color: d.safetyScore >= 80 ? C.green : d.safetyScore >= 60 ? C.goldDeep : C.red }}>{d.safetyScore}/100</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="to-btn-ghost" onClick={() => setModal({ type: "driver-form", data: d })} style={{ padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Edit size={13} /> Edit
                  </button>
                  <button className="to-btn-danger" onClick={del(crud.deleteDriver, d._id, "Delete this driver?")} style={{ padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Routes View
--------------------------------------------------------------- */
function RoutesView({ trips, vehicles, drivers, crud, setModal, loading, del }) {
  const [routeSearch, setRouteSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");

  const filteredTrips = React.useMemo(() => {
    let data = [...trips];
    if (routeSearch.trim()) {
      data = data.filter(t =>
        (t.source || "").toLowerCase().includes(routeSearch.toLowerCase()) ||
        (t.destination || "").toLowerCase().includes(routeSearch.toLowerCase()) ||
        (t.tripNo || "").toLowerCase().includes(routeSearch.toLowerCase())
      );
    }
    if (statusFilter !== "All") data = data.filter(t => t.status === statusFilter);
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [trips, routeSearch, statusFilter]);

  const statusColors = {
    Draft:     { bg: "#F3F4F6", fg: "#374151" },
    Dispatched:{ bg: "#FEF3C7", fg: "#92400E" },
    Completed: { bg: "#D1FAE5", fg: "#065F46" },
    Cancelled: { bg: "#FEE2E2", fg: "#991B1B" },
  };

  if (loading) return <Spinner />;

  return (
    <div className="to-fade-in">
      <SectionHeader
        title="Routes & Dispatch"
        subtitle={`${trips.length} total routes dispatched`}
        action={<ActionButton icon={Plus} onClick={() => setModal({ type: "trip-form", data: null })}>Dispatch Route</ActionButton>}
      />

      {/* Search + Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", background: "var(--card-bg)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", background: "var(--card-bg)" }}>
          <Search size={15} style={{ opacity: 0.45, flexShrink: 0, color: "var(--text)" }} />
          <input
            type="text"
            placeholder="Search by origin, destination, or trip no…"
            value={routeSearch}
            onChange={e => setRouteSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", padding: "9px 8px", width: "100%", color: "var(--text)", fontSize: 13 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)", fontSize: 13 }}
        >
          <option value="All">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Route cards */}
      {filteredTrips.length === 0 ? (
        <EmptyState text="No routes match your search or filters." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredTrips.map(t => {
            const sc = statusColors[t.status] || statusColors.Draft;
            const vehicle = typeof t.vehicle === "object" ? t.vehicle : vehicles.find(v => v._id === t.vehicle);
            const driver = typeof t.driver === "object" ? t.driver : drivers.find(d => d._id === t.driver);
            return (
              <div key={t._id} className="to-card" style={{ borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  {/* Route path */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{t.source || "—"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.gold }}>
                      <div style={{ height: 2, width: 24, background: C.gold, borderRadius: 2 }} />
                      <Route size={14} />
                      <div style={{ height: 2, width: 24, background: C.gold, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{t.destination || "—"}</div>
                  </div>

                  {/* Actions & Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ background: sc.bg, color: sc.fg, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.4px" }}>
                      {(t.status || "UNKNOWN").toUpperCase()}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {t.status === "Dispatched" && (
                        <button className="to-btn-primary" onClick={() => setModal({ type: "trip-complete", data: t })} style={{ padding: "5px 10px", borderRadius: 6, display: "flex", fontSize: 11, fontWeight: 700 }}>Complete</button>
                      )}
                      <button className="to-btn-ghost" onClick={() => setModal({ type: "trip-form", data: t })} style={{ padding: "5px 8px", borderRadius: 6, display: "flex" }}><Edit size={13} /></button>
                      <button className="to-btn-danger" onClick={del(crud.deleteTrip, t._id, "Delete this route?")} style={{ padding: "5px 8px", borderRadius: 6, display: "flex" }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap", fontSize: 13, color: C.textMuted }}>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Trip No:</span> {t.tripNo || "—"}</div>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Vehicle:</span> {vehicle?.registrationNumber || "—"}</div>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Driver:</span> {driver?.name || "—"}</div>
                  {t.scheduledDate && <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Scheduled:</span> {fmtDate(t.scheduledDate)}</div>}
                  {t.estimatedDistance && <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Distance:</span> {t.estimatedDistance} km</div>}
                  {t.cargoWeight && <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Cargo:</span> {t.cargoWeight} kg</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Forms
--------------------------------------------------------------- */
function useForm(initial) {
  const [f, setF] = useState(initial);
  const set  = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const setN = k => e => setF(p => ({ ...p, [k]: Number(e.target.value) }));
  return [f, setF, set, setN];
}

function SubmitBtn({ loading, label, icon: Icon }) {
  return (
    <div style={{ marginTop: 18 }}>
      <button type="submit" disabled={loading} className="to-btn-primary"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, fontSize: 13, fontWeight: 700 }}>
        {loading ? <><Spinner />&nbsp;Saving…</> : <>{Icon && <Icon size={13} />} {label}</>}
      </button>
    </div>
  );
}

function VehicleForm({ initial, onSubmit }) {
  const [f, , set, setN] = useForm({
    registrationNumber: initial?.registrationNumber || "",
    model:              initial?.model || "",
    type:               initial?.type || "Box Truck",
    maxLoadCapacity:    initial?.maxLoadCapacity || 0,
    odometer:           initial?.odometer || 0,
    acquisitionCost:    initial?.acquisitionCost || 0,
    status:             initial?.status || "Available",
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <div className="to-grid-2">
        <Field label="Registration Number" required>
          <input className="to-input" value={f.registrationNumber} onChange={set("registrationNumber")} placeholder="e.g. MH-12-AB-1234" pattern="^[A-Z0-9-]{6,15}$" title="Alphanumeric with hyphens (e.g., MH-12-AB-1234)" required />
        </Field>
        <Field label="Vehicle Model" required>
          <input className="to-input" value={f.model} onChange={set("model")} placeholder="e.g. Volvo VNL 860" minLength={2} maxLength={50} required />
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Vehicle Type">
          <select className="to-input" value={f.type} onChange={set("type")}>
            {["Van", "Box Truck", "Flatbed", "Reefer"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Max Load Capacity (kg)" required>
          <input className="to-input" type="number" min={100} max={50000} value={f.maxLoadCapacity} onChange={setN("maxLoadCapacity")} placeholder="e.g. 5000" required />
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Current Odometer (km)" required>
          <input className="to-input" type="number" min={0} value={f.odometer} onChange={setN("odometer")} placeholder="e.g. 15000" required />
        </Field>
        <Field label="Acquisition Cost (₹)" required>
          <input className="to-input" type="number" min={0} value={f.acquisitionCost} onChange={setN("acquisitionCost")} placeholder="e.g. 2500000" required />
        </Field>
      </div>
      <Field label="Status">
        <select className="to-input" value={f.status} onChange={set("status")}>
          {["Available", "In Shop", "Retired"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <SubmitBtn loading={loading} label={initial ? "Save Changes" : "Register Vehicle"} icon={Plus} />
    </form>
  );
}

function DriverForm({ initial, onSubmit }) {
  const [f, , set, setN] = useForm({
    name:            initial?.name            || "",
    licenseNumber:   initial?.licenseNumber   || "",
    licenseCategory: initial?.licenseCategory || "LMV",
    licenseExpiry:   initial?.licenseExpiry?.slice(0, 10) || "",
    contactNumber:   initial?.contactNumber   || "",
    safetyScore:     initial?.safetyScore     ?? 80,
    status:          initial?.status          || "Available",
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <div className="to-grid-2">
        <Field label="Full Name" required>
          <input className="to-input" value={f.name} onChange={set("name")} placeholder="e.g. John Doe" minLength={2} maxLength={50} required />
        </Field>
        <Field label="License Number" required>
          <input className="to-input" value={f.licenseNumber} onChange={set("licenseNumber")} placeholder="e.g. DL-14-2020-0001234" pattern="^[A-Z0-9-]{8,20}$" title="Valid Driving License format" required />
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Category">
          <select className="to-input" value={f.licenseCategory} onChange={set("licenseCategory")}>
            {["LMV", "HMV", "HPMV", "PSV"].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Expiry Date" required>
          <input className="to-input" type="date" value={f.licenseExpiry} onChange={set("licenseExpiry")} required />
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Contact Number" required>
          <input className="to-input" value={f.contactNumber} onChange={set("contactNumber")} placeholder="e.g. +91 9876543210" pattern="^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$" title="Valid phone number" required />
        </Field>
        <Field label="Safety Score (0–100)">
          <input className="to-input" type="number" min={0} max={100} value={f.safetyScore} onChange={setN("safetyScore")} placeholder="80" />
        </Field>
      </div>
      <Field label="Status">
        <select className="to-input" value={f.status} onChange={set("status")}>
          {["Available", "On Trip", "Off Duty", "Suspended"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <SubmitBtn loading={loading} label={initial ? "Save Changes" : "Add Driver"} />
    </form>
  );
}

function TripForm({ initial, vehicles, drivers, onSubmit }) {
  const [f, , set, setN] = useForm({
    vehicle:       initial?.vehicle?._id || initial?.vehicle || "",
    driver:        initial?.driver?._id  || initial?.driver  || "",
    source:        initial?.source       || "",
    destination:   initial?.destination  || "",
    cargoWeight:   initial?.cargoWeight  || 0,
    freightCharge: initial?.freightCharge|| 0,
    status:        initial?.status       || "Draft",
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <div className="to-grid-2">
        <Field label="Vehicle" required>
          <select className="to-input" value={f.vehicle} onChange={set("vehicle")} required>
            <option value="">— Select Vehicle —</option>
            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber} ({v.type})</option>)}
          </select>
        </Field>
        <Field label="Driver" required>
          <select className="to-input" value={f.driver} onChange={set("driver")} required>
            <option value="">— Select Driver —</option>
            {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Origin City" required>
          <input className="to-input" value={f.source} onChange={set("source")} placeholder="e.g. Mumbai Hub" minLength={2} required />
        </Field>
        <Field label="Destination City" required>
          <input className="to-input" value={f.destination} onChange={set("destination")} placeholder="e.g. Delhi Distribution" minLength={2} required />
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Cargo Weight (kg)" required>
          <input className="to-input" type="number" min={1} max={50000} value={f.cargoWeight} onChange={setN("cargoWeight")} placeholder="e.g. 2500" required />
        </Field>
        <Field label="Freight Charge (₹)" required>
          <input className="to-input" type="number" min={0} value={f.freightCharge} onChange={setN("freightCharge")} placeholder="e.g. 15000" required />
        </Field>
      </div>
      <Field label="Status">
        <select className="to-input" value={f.status} onChange={set("status")}>
          {["Draft", "Dispatched", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <SubmitBtn loading={loading} label={initial ? "Update Trip" : "Dispatch Trip"} />
    </form>
  );
}

function TripCompleteForm({ initial, onSubmit }) {
  const [f, , , setN] = useForm({
    finalOdometer: initial?.vehicle?.odometer || 0,
    fuelConsumed:  0,
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <Field label="Final Odometer (km)" required>
        <input className="to-input" type="number" min={initial?.vehicle?.odometer || 0} value={f.finalOdometer} onChange={setN("finalOdometer")} placeholder={`e.g. ${(initial?.vehicle?.odometer || 15000) + 150}`} required />
      </Field>
      <Field label="Fuel Consumed (Liters)" required>
        <input className="to-input" type="number" min={1} value={f.fuelConsumed} onChange={setN("fuelConsumed")} placeholder="e.g. 150" required />
      </Field>
      <SubmitBtn loading={loading} label="Complete Trip" icon={ArrowRight} />
    </form>
  );
}

/* ---------------------------------------------------------------
   New Views (Maintenance, Fuel, Reports, Settings)
--------------------------------------------------------------- */

function MaintenanceView({ logs, vehicles, setModal, crud, loading, del }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredLogs = React.useMemo(() => {
    let data = [...logs];
    
    if (search.trim()) {
      // Need to populate vehicle reg number for searching
      const searchableData = data.map(l => ({
        ...l,
        vehReg: l.vehicle?.registrationNumber || vehicles.find(v => v._id === l.vehicle)?.registrationNumber || ""
      }));
      const fuse = new Fuse(searchableData, {
        keys: ["vehReg", "type", "notes"],
        threshold: 0.3,
      });
      data = fuse.search(search).map(res => res.item);
    }
    
    if (filter !== "All") {
      data = data.filter(l => l.status === filter);
    }
    return data.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
  }, [logs, vehicles, search, filter]);

  const statusColors = {
    Scheduled:   { bg: "#DBEAFE", fg: "#1E40AF" },
    "In Progress": { bg: "#FEF3C7", fg: "#92400E" },
    Completed:   { bg: "#D1FAE5", fg: "#065F46" }
  };

  if (loading) return <Spinner />;

  return (
    <div className="to-fade-in">
      <SectionHeader
        title="Maintenance"
        subtitle={`${logs.length} maintenance logs on record`}
        action={<ActionButton icon={Plus} onClick={() => setModal({ type: "maint-form", data: null })}>New Log</ActionButton>}
      />

      {/* Search + Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", background: "var(--card-bg)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", background: "var(--card-bg)" }}>
          <Search size={15} style={{ opacity: 0.45, flexShrink: 0, color: "var(--text)" }} />
          <input
            type="text"
            placeholder="Search by vehicle, type, or notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", padding: "9px 8px", width: "100%", color: "var(--text)", fontSize: 13 }}
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)", fontSize: 13 }}>
          <option value="All">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Cards */}
      {filteredLogs.length === 0 ? (
        <EmptyState text="No maintenance logs match your search or filters." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredLogs.map(l => {
            const sc = statusColors[l.status] || statusColors.Scheduled;
            const vehicle = typeof l.vehicle === "object" ? l.vehicle : vehicles.find(v => v._id === l.vehicle);
            return (
              <div key={l._id} className="to-card" style={{ borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{vehicle?.registrationNumber || "—"}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{l.type} Service</div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.fg, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.4px" }}>
                    {(l.status || "UNKNOWN").toUpperCase()}
                  </span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: C.textMuted, marginBottom: 16, padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Date:</span><br/>{fmtDate(l.serviceDate)}</div>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Cost:</span><br/>₹{l.cost.toLocaleString()}</div>
                  {l.notes && <div style={{ gridColumn: "span 2" }}><span style={{ fontWeight: 600, color: "var(--text)" }}>Notes:</span><br/>{l.notes}</div>}
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="to-btn-ghost" onClick={() => setModal({ type: "maint-form", data: l })} style={{ padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Edit size={13} /> Edit
                  </button>
                  <button className="to-btn-danger" onClick={del(crud.deleteMaint, l._id, "Delete log?")} style={{ padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MaintenanceForm({ initial, vehicles, onSubmit }) {
  const [f, , set, setN] = useForm({
    vehicle: initial?.vehicle?._id || initial?.vehicle || "",
    serviceDate: initial?.serviceDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    type: initial?.type || "Routine",
    cost: initial?.cost || 0,
    status: initial?.status || "Scheduled",
    notes: initial?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <div className="to-grid-2">
        <Field label="Vehicle" required>
          <select className="to-input" value={f.vehicle} onChange={set("vehicle")} required>
            <option value="">— Select Vehicle —</option>
            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
          </select>
        </Field>
        <Field label="Service Date" required>
          <input className="to-input" type="date" value={f.serviceDate} onChange={set("serviceDate")} required />
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Type">
          <select className="to-input" value={f.type} onChange={set("type")}>
            {["Routine", "Repair", "Inspection"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Cost (₹)" required>
          <input className="to-input" type="number" min={0} value={f.cost} onChange={setN("cost")} placeholder="e.g. 5000" required />
        </Field>
      </div>
      <Field label="Status">
        <select className="to-input" value={f.status} onChange={set("status")}>
          {["Scheduled", "In Progress", "Completed"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Notes">
        <textarea className="to-input" value={f.notes} onChange={set("notes")} rows={2} placeholder="e.g. Oil change and brake pad replacement" maxLength={500} />
      </Field>
      <SubmitBtn loading={loading} label={initial ? "Update Log" : "Add Log"} />
    </form>
  );
}

function FuelView({ expenses, vehicles, setModal, crud, loading, del }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredExpenses = React.useMemo(() => {
    let data = [...expenses];
    
    if (search.trim()) {
      const searchableData = data.map(e => ({
        ...e,
        vehReg: e.vehicle?.registrationNumber || vehicles.find(v => v._id === e.vehicle)?.registrationNumber || ""
      }));
      const fuse = new Fuse(searchableData, {
        keys: ["vehReg", "category"],
        threshold: 0.3,
      });
      data = fuse.search(search).map(res => res.item);
    }
    
    if (filter !== "All") {
      data = data.filter(e => e.status === filter);
    }
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, vehicles, search, filter]);

  const statusColors = {
    Pending:  { bg: "#FEE2E2", fg: "#991B1B" },
    Approved: { bg: "#FEF3C7", fg: "#92400E" },
    Paid:     { bg: "#D1FAE5", fg: "#065F46" }
  };

  if (loading) return <Spinner />;

  return (
    <div className="to-fade-in">
      <SectionHeader
        title="Fuel & Expenses"
        subtitle={`${expenses.length} expense logs on record`}
        action={<ActionButton icon={Plus} onClick={() => setModal({ type: "fuel-form", data: null })}>Log Expense</ActionButton>}
      />

      {/* Search + Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", background: "var(--card-bg)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", background: "var(--card-bg)" }}>
          <Search size={15} style={{ opacity: 0.45, flexShrink: 0, color: "var(--text)" }} />
          <input
            type="text"
            placeholder="Search by vehicle or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", padding: "9px 8px", width: "100%", color: "var(--text)", fontSize: 13 }}
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)", fontSize: 13 }}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Cards */}
      {filteredExpenses.length === 0 ? (
        <EmptyState text="No expenses match your search or filters." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredExpenses.map(e => {
            const sc = statusColors[e.status] || statusColors.Pending;
            const vehicle = typeof e.vehicle === "object" ? e.vehicle : vehicles.find(v => v._id === e.vehicle);
            return (
              <div key={e._id} className="to-card" style={{ borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>₹{e.amount.toLocaleString()}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{e.category}</div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.fg, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.4px" }}>
                    {(e.status || "UNKNOWN").toUpperCase()}
                  </span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: C.textMuted, marginBottom: 16, padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Date:</span><br/>{fmtDate(e.date)}</div>
                  <div><span style={{ fontWeight: 600, color: "var(--text)" }}>Vehicle:</span><br/>{vehicle?.registrationNumber || "—"}</div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="to-btn-ghost" onClick={() => setModal({ type: "fuel-form", data: e })} style={{ padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Edit size={13} /> Edit
                  </button>
                  <button className="to-btn-danger" onClick={del(crud.deleteExp, e._id, "Delete expense?")} style={{ padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FuelForm({ initial, vehicles, onSubmit }) {
  const [f, , set, setN] = useForm({
    vehicle: initial?.vehicle?._id || initial?.vehicle || "",
    date: initial?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    category: initial?.category || "Fuel",
    amount: initial?.amount || 0,
    status: initial?.status || "Pending",
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <div className="to-grid-2">
        <Field label="Category">
          <select className="to-input" value={f.category} onChange={set("category")}>
            {["Fuel", "Toll", "Maintenance", "Other"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Date" required>
          <input className="to-input" type="date" value={f.date} onChange={set("date")} required />
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Amount (₹)" required>
          <input className="to-input" type="number" min={0} value={f.amount} onChange={setN("amount")} placeholder="e.g. 1200" required />
        </Field>
        <Field label="Vehicle (Optional)">
          <select className="to-input" value={f.vehicle} onChange={set("vehicle")}>
            <option value="">— None —</option>
            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Status">
        <select className="to-input" value={f.status} onChange={set("status")}>
          {["Pending", "Approved", "Paid"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <SubmitBtn loading={loading} label={initial ? "Update Expense" : "Log Expense"} />
    </form>
  );
}

function ReportsView({ data, loading }) {
  if (loading) return <Spinner />;
  if (!data) return null;
  return (
    <div className="to-fade-in">
      <div className="to-section-header" style={{ marginBottom: 20 }}>
        <h1 className="to-serif" style={{ fontSize: 28, margin: 0, color: C.royal }}>Reports & Analytics</h1>
        <p style={{ margin: "4px 0 0", color: C.textMuted, fontSize: 13 }}>Vehicle Return on Investment (ROI).</p>
      </div>
      <div className="to-kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <KPITile label="Total Revenue (₹)" value={data.totalRevenue} />
        <KPITile label="Total Expenses (₹)" value={data.totalExpenses} />
        <KPITile label="Net Profit (₹)" value={data.netProfit} />
      </div>
      
      <div className="to-card to-table-wrap" style={{ borderRadius: 10, marginTop: 20 }}>
        <div style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, borderBottom: `1px solid ${C.line}` }}>Vehicle Performance</div>
        <table className="to-table">
          <thead><tr>
            <th>VEHICLE</th>
            <th>REVENUE</th>
            <th>EXPENSES</th>
            <th>ACQUISITION</th>
            <th>ROI (%)</th>
          </tr></thead>
          <tbody>
            {!data.vehicleROI || data.vehicleROI.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 30, color: C.textMuted }}>No performance data.</td></tr>
            ) : (
              data.vehicleROI.map(v => (
                <tr key={v.vehicleId} className="to-row">
                  <td className="to-mono" style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                  <td>₹{v.revenue}</td>
                  <td>₹{v.expenses}</td>
                  <td>₹{v.acquisitionCost}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: v.roiPercentage >= 0 ? C.green : C.red }}>
                      {v.roiPercentage}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsView({ users, user, crud, loading }) {
  if (loading) return <Spinner />;
  return (
    <div className="to-fade-in">
      <div className="to-section-header" style={{ marginBottom: 20 }}>
        <h1 className="to-serif" style={{ fontSize: 28, margin: 0, color: C.royal }}>Settings & RBAC</h1>
        <p style={{ margin: "4px 0 0", color: C.textMuted, fontSize: 13 }}>Manage users, roles, and permissions.</p>
      </div>
      
      {user?.role !== "admin" && user?.role !== "fleet" ? (
        <div className="to-card" style={{ padding: 24, borderRadius: 10, textAlign: "center", color: C.red }}>
          <AlertTriangle size={24} style={{ marginBottom: 10 }} />
          <div>You do not have permission to view or edit system users.</div>
        </div>
      ) : (
        <div className="to-card to-table-wrap" style={{ borderRadius: 10, padding: 2 }}>
          <table className="to-table">
            <thead><tr><th>USER</th><th>EMAIL</th><th>ROLE</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="to-row">
                  <td style={{ fontWeight: 600 }}>{u.name} {user._id === u._id && <span style={{fontSize: 10, color: C.blue}}>(You)</span>}</td>
                  <td>{u.email}</td>
                  <td><StatusBadge status={u.role.toUpperCase()} /></td>
                  <td>
                    {user._id !== u._id && (
                      <select className="to-input" style={{ width: 140, padding: "4px 8px" }} value={u.role} 
                        onChange={e => crud.updateUser(u._id, e.target.value)}>
                        <option value="admin">Admin</option>
                        <option value="fleet">Fleet Manager</option>
                        <option value="driver">Driver</option>
                        <option value="user">User</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}