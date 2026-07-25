import React, { useState, useEffect, useCallback } from "react";
import { Briefcase, User, Building2, Plus, Search, ArrowRight, CheckCircle2, XCircle, Clock, Send, MapPin, Sparkles, LogOut, Inbox, Lock, Mail } from "lucide-react";

// ---------- Supabase config ----------
const SUPABASE_URL = "https://ektvaujdsouwuxfjinis.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cay6-KzjyaaHd28MQVGU8A_OYkEBTtV";

async function authSignUp(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "Erro ao cadastrar");
  return data;
}

async function authSignIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "E-mail ou senha incorretos");
  return data;
}

async function supaGet(path, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token || SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function supaInsert(table, body, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro ao salvar dados");
  return data[0];
}

async function supaPatch(table, match, body, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------- Design tokens ----------
const C = {
  ink: "#182A26", paper: "#F4F5F0", paperAlt: "#ECEEE6",
  forest: "#1F4D3D", forestDeep: "#153A2D", amber: "#E8A33D",
  amberDeep: "#C97F1E", clay: "#C1502E", line: "#DBD6C8", white: "#FFFFFF",
};

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
    .f-display { font-family: 'Space Grotesk', sans-serif; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }
    .match-dot { position: relative; }
    .match-dot::before { content: ""; position: absolute; left: -14px; top: 50%; width: 8px; height: 8px; border-radius: 50%; background: ${C.amber}; transform: translateY(-50%); }
    .dash-line { background-image: repeating-linear-gradient(to right, ${C.line} 0, ${C.line} 4px, transparent 4px, transparent 9px); height: 1px; }
    input:focus, textarea:focus, select:focus, button:focus-visible { outline: 2px solid ${C.amber}; outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
  `}</style>
);

const AREAS = ["Tecnologia", "Vendas", "Marketing", "Administrativo", "Financeiro", "RH", "Design", "Operações", "Atendimento", "Outra"];
const TIPOS = ["CLT", "PJ", "Estágio", "Freelance", "Temporário"];

// ---------- UI atoms ----------
function Button({ children, onClick, variant = "primary", type = "button", disabled, full }) {
  const base = "f-body text-sm font-semibold px-4 py-2.5 rounded-md inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: { background: C.forest, color: C.white },
    amber: { background: C.amber, color: C.ink },
    ghost: { background: "transparent", color: C.forest, border: `1px solid ${C.line}` },
    danger: { background: "transparent", color: C.clay, border: `1px solid ${C.line}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${full ? "w-full" : ""}`} style={styles[variant]}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="f-mono text-[11px] uppercase tracking-wide" style={{ color: C.forest }}>{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputStyle = { width: "100%", background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, color: C.ink };

function StatusPill({ status }) {
  const map = {
    "Em análise": { color: C.amberDeep, bg: "#FBF0DC", icon: Clock },
    "Aprovado": { color: C.forest, bg: "#E3EDE7", icon: CheckCircle2 },
    "Rejeitado": { color: C.clay, bg: "#F5E4DD", icon: XCircle },
  };
  const s = map[status] || map["Em análise"];
  const Icon = s.icon;
  return (
    <span className="f-mono text-[11px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>
      <Icon size={12} /> {status}
    </span>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="f-mono text-[11px] uppercase px-3 py-2 rounded-md"
      style={{ background: active ? C.forest : "transparent", color: active ? C.white : C.forest, border: `1px solid ${active ? C.forest : C.line}` }}>
      {children}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="p-6 rounded-xl text-center" style={{ background: C.paperAlt, border: `1px dashed ${C.line}` }}>
      <Briefcase size={18} color="#8A8570" style={{ margin: "0 auto" }} />
      <p className="text-sm mt-2" style={{ color: "#6B7268" }}>{text}</p>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null); // { token, userId }
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const refreshShared = useCallback(async (token) => {
    try {
      const [co, ca, j, a] = await Promise.all([
        supaGet("companies?select=*", token),
        supaGet("candidates?select=*", token),
        supaGet("jobs?select=*&order=created_at.desc", token),
        supaGet("applications?select=*", token),
      ]);
      setCompanies(co); setCandidates(ca); setJobs(j); setApplications(a);
    } catch (e) {
      setError("Não consegui carregar os dados. Verifique a conexão e tente de novo.");
    }
  }, []);

  useEffect(() => { refreshShared(null); }, [refreshShared]);

  function logout() {
    setRole(null); setSession(null); setProfile(null); setError("");
  }

  const companyName = (id) => companies.find((c) => c.id === id)?.nome || "Empresa";
  const candidateById = (id) => candidates.find((c) => c.id === id);

  return (
    <div className="min-h-screen f-body" style={{ background: C.paper, color: C.ink }}>
      {FONTS}
      <Header role={role} profile={profile} onLogout={logout} />
      <main className="max-w-3xl mx-auto px-4 pb-16">
        {error && <div className="mt-4 text-sm px-4 py-3 rounded-md" style={{ background: "#F5E4DD", color: C.clay }}>{error}</div>}
        {!role && <RoleSelector onSelect={setRole} />}

        {role === "candidate" && !profile && (
          <AuthForm
            kind="candidate"
            setError={setError}
            onSuccess={async ({ token, userId, isNew, form }) => {
              setLoading(true);
              try {
                let prof;
                if (isNew) {
                  prof = await supaInsert("candidates", { id: userId, nome: form.nome, email: form.email, area: form.area, bio: form.bio }, token);
                } else {
                  const rows = await supaGet(`candidates?id=eq.${userId}&select=*`, token);
                  prof = rows[0];
                }
                setSession({ token, userId });
                setProfile(prof);
                await refreshShared(token);
              } catch (e) {
                setError(e.message);
              }
              setLoading(false);
            }}
          />
        )}

        {role === "candidate" && profile && (
          <CandidateDashboard
            profile={profile}
            jobs={jobs}
            companyName={companyName}
            applications={applications.filter((a) => a.candidate_id === profile.id)}
            appliedJobIds={new Set(applications.filter((a) => a.candidate_id === profile.id).map((a) => a.job_id))}
            onApply={async (job) => {
              try {
                await supaInsert("applications", { job_id: job.id, candidate_id: profile.id, status: "Em análise" }, session.token);
                await refreshShared(session.token);
              } catch (e) { setError(e.message); }
            }}
          />
        )}

        {role === "company" && !profile && (
          <AuthForm
            kind="company"
            setError={setError}
            onSuccess={async ({ token, userId, isNew, form }) => {
              setLoading(true);
              try {
                let prof;
                if (isNew) {
                  prof = await supaInsert("companies", { id: userId, nome: form.nome, email: form.email, setor: form.setor }, token);
                } else {
                  const rows = await supaGet(`companies?id=eq.${userId}&select=*`, token);
                  prof = rows[0];
                }
                setSession({ token, userId });
                setProfile(prof);
                await refreshShared(token);
              } catch (e) {
                setError(e.message);
              }
              setLoading(false);
            }}
          />
        )}

        {role === "company" && profile && (
          <CompanyDashboard
            profile={profile}
            jobs={jobs.filter((j) => j.company_id === profile.id)}
            applications={applications}
            candidateById={candidateById}
            onPost={async (job) => {
              try {
                await supaInsert("jobs", { ...job, company_id: profile.id }, session.token);
                await refreshShared(session.token);
              } catch (e) { setError(e.message); }
            }}
            onStatusChange={async (app, status) => {
              try {
                await supaPatch("applications", `id=eq.${app.id}`, { status }, session.token);
                await refreshShared(session.token);
              } catch (e) { setError(e.message); }
            }}
          />
        )}

        {loading && <p className="f-mono text-xs mt-6" style={{ color: C.forest }}>carregando…</p>}
      </main>
      <footer className="max-w-3xl mx-auto px-4 pb-10">
        <div className="dash-line mb-4" />
        <p className="f-mono text-[11px]" style={{ color: "#8A8570" }}>vagas.conecta · conectado ao banco de dados real</p>
      </footer>
    </div>
  );
}

function Header({ role, profile, onLogout }) {
  return (
    <header className="max-w-3xl mx-auto px-4 pt-8 pb-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: C.forest }}>
          <Sparkles size={16} color={C.amber} />
        </div>
        <span className="f-display text-lg font-bold" style={{ color: C.ink }}>vagas.conecta</span>
      </div>
      {role && profile && (
        <button onClick={onLogout} className="f-mono text-[11px] inline-flex items-center gap-1.5" style={{ color: C.forest }}>
          <LogOut size={13} /> sair
        </button>
      )}
    </header>
  );
}

function RoleSelector({ onSelect }) {
  return (
    <div className="mt-6">
      <h1 className="f-display text-3xl font-bold leading-tight" style={{ color: C.ink }}>Currículo de um lado.<br />Vaga do outro.</h1>
      <p className="mt-3 text-[15px]" style={{ color: "#4B5A52" }}>Candidatos enviam currículo, empresas publicam vagas. O ponto de encontro é aqui.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <button onClick={() => onSelect("candidate")} className="text-left p-5 rounded-xl" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <User size={20} color={C.forest} />
          <p className="f-display font-semibold text-base mt-3" style={{ color: C.ink }}>Sou candidato</p>
          <p className="text-sm mt-1" style={{ color: "#6B7268" }}>Cadastre seu perfil e candidate-se a vagas.</p>
          <span className="f-mono text-[11px] inline-flex items-center gap-1 mt-4" style={{ color: C.amberDeep }}>começar <ArrowRight size={12} /></span>
        </button>
        <button onClick={() => onSelect("company")} className="text-left p-5 rounded-xl" style={{ background: C.forest, border: `1px solid ${C.forestDeep}` }}>
          <Building2 size={20} color={C.amber} />
          <p className="f-display font-semibold text-base mt-3" style={{ color: C.white }}>Sou empresa</p>
          <p className="text-sm mt-1" style={{ color: "#C9D6CE" }}>Publique vagas e veja quem se candidatou.</p>
          <span className="f-mono text-[11px] inline-flex items-center gap-1 mt-4" style={{ color: C.amber }}>começar <ArrowRight size={12} /></span>
        </button>
      </div>
    </div>
  );
}

// ---------- Auth (candidate or company) ----------
function AuthForm({ kind, onSuccess, setError }) {
  const [mode, setMode] = useState("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleEntrar(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await authSignIn(email.trim(), password);
      await onSuccess({ token: data.access_token, userId: data.user.id, isNew: false });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  async function handleCadastrar(e) {
    e.preventDefault();
    setError("");
    if (!nome.trim() || !email.trim() || password.length < 6) {
      setError("Preencha nome, e-mail, e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    try {
      const data = await authSignUp(email.trim(), password);
      const form = kind === "candidate" ? { nome: nome.trim(), email: email.trim(), area, bio: bio.trim() } : { nome: nome.trim(), email: email.trim(), setor: area };
      await onSuccess({ token: data.access_token, userId: data.user.id, isNew: true, form });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  return (
    <div className="mt-6 max-w-md">
      <div className="flex gap-2 mb-6">
        <TabButton active={mode === "entrar"} onClick={() => setMode("entrar")}>Entrar</TabButton>
        <TabButton active={mode === "cadastrar"} onClick={() => setMode("cadastrar")}>{kind === "candidate" ? "Criar perfil" : "Cadastrar empresa"}</TabButton>
      </div>

      {mode === "entrar" ? (
        <form onSubmit={handleEntrar}>
          <Field label="E-mail">
            <div className="relative">
              <Mail size={15} style={{ position: "absolute", left: 12, top: 12 }} color="#8A8570" />
              <input style={{ ...inputStyle, paddingLeft: 34 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required />
            </div>
          </Field>
          <Field label="Senha">
            <div className="relative">
              <Lock size={15} style={{ position: "absolute", left: 12, top: 12 }} color="#8A8570" />
              <input style={{ ...inputStyle, paddingLeft: 34 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="sua senha" required />
            </div>
          </Field>
          <Button type="submit" full disabled={busy}>{busy ? "Entrando…" : "Entrar"} <ArrowRight size={15} /></Button>
        </form>
      ) : (
        <form onSubmit={handleCadastrar}>
          <Field label={kind === "candidate" ? "Nome completo" : "Nome da empresa"}>
            <input style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} placeholder={kind === "candidate" ? "Seu nome" : "Nome da empresa"} required />
          </Field>
          <Field label="E-mail">
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required />
          </Field>
          <Field label="Senha (mínimo 6 caracteres)">
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="crie uma senha" required />
          </Field>
          <Field label={kind === "candidate" ? "Área de interesse" : "Setor principal"}>
            <select style={inputStyle} value={area} onChange={(e) => setArea(e.target.value)}>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          {kind === "candidate" && (
            <Field label="Currículo resumido (experiência, habilidades)">
              <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ex: 3 anos como analista de marketing..." />
            </Field>
          )}
          <Button type="submit" full disabled={busy}>{busy ? "Criando…" : (kind === "candidate" ? "Criar meu perfil" : "Cadastrar empresa")} <ArrowRight size={15} /></Button>
        </form>
      )}
    </div>
  );
}

// ---------- Candidate ----------
function CandidateDashboard({ profile, jobs, companyName, applications, onApply, appliedJobIds }) {
  const [tab, setTab] = useState("vagas");
  const [q, setQ] = useState("");
  const filtered = jobs.filter((j) => `${j.titulo} ${j.area} ${j.local}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mt-6">
      <h2 className="f-display text-2xl font-bold" style={{ color: C.ink }}>Olá, {profile.nome.split(" ")[0]}</h2>
      <p className="text-sm" style={{ color: "#6B7268" }}>Área: {profile.area}</p>

      <div className="flex gap-2 mt-6 mb-5">
        <TabButton active={tab === "vagas"} onClick={() => setTab("vagas")}>Vagas disponíveis</TabButton>
        <TabButton active={tab === "candidaturas"} onClick={() => setTab("candidaturas")}>Minhas candidaturas ({applications.length})</TabButton>
      </div>

      {tab === "vagas" && (
        <>
          <div className="relative mb-4">
            <Search size={15} style={{ position: "absolute", left: 12, top: 12 }} color="#8A8570" />
            <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Buscar por cargo, área ou cidade" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {filtered.length === 0 && <EmptyState text="Nenhuma vaga encontrada ainda. Volte mais tarde." />}
          <div className="space-y-3">
            {filtered.map((j) => (
              <JobCard key={j.id} job={j} companyName={companyName(j.company_id)} match={j.area === profile.area} applied={appliedJobIds.has(j.id)} onApply={() => onApply(j)} />
            ))}
          </div>
        </>
      )}

      {tab === "candidaturas" && (
        <>
          {applications.length === 0 && <EmptyState text="Você ainda não se candidatou a nenhuma vaga." />}
          <div className="space-y-3">
            {applications.map((a) => {
              const job = jobs.find((j) => j.id === a.job_id);
              return (
                <div key={a.id} className="p-4 rounded-xl flex items-center justify-between" style={{ background: C.white, border: `1px solid ${C.line}` }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: C.ink }}>{job ? job.titulo : "Vaga"}</p>
                    <p className="f-mono text-[11px] mt-0.5" style={{ color: "#8A8570" }}>{job ? companyName(job.company_id) : ""}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function JobCard({ job, companyName, match, applied, onApply }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: C.white, border: `1px solid ${C.line}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className={match ? "match-dot pl-3.5" : ""}>
          <p className="f-display font-semibold text-[15px]" style={{ color: C.ink }}>{job.titulo}</p>
          <p className="f-mono text-[11px] mt-1" style={{ color: "#8A8570" }}>{companyName}</p>
        </div>
        {match && <span className="f-mono text-[10px] px-2 py-1 rounded-full shrink-0" style={{ background: "#FBF0DC", color: C.amberDeep }}>compatível</span>}
      </div>
      <p className="text-sm mt-3" style={{ color: "#4B5A52" }}>{job.descricao}</p>
      <div className="flex items-center gap-3 mt-3 f-mono text-[11px]" style={{ color: "#8A8570" }}>
        <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.local || "Remoto"}</span>
        <span>·</span><span>{job.tipo}</span><span>·</span><span>{job.area}</span>
      </div>
      <div className="mt-4">
        {applied ? (
          <span className="f-mono text-[11px] inline-flex items-center gap-1.5" style={{ color: C.forest }}><CheckCircle2 size={13} /> candidatura enviada</span>
        ) : (
          <Button variant="amber" onClick={onApply}><Send size={14} /> Candidatar-se</Button>
        )}
      </div>
    </div>
  );
}

// ---------- Company ----------
function CompanyDashboard({ profile, jobs, applications, candidateById, onPost, onStatusChange }) {
  const [tab, setTab] = useState("vagas");
  const myAppsByJob = (jobId) => applications.filter((a) => a.job_id === jobId);

  return (
    <div className="mt-6">
      <h2 className="f-display text-2xl font-bold" style={{ color: C.ink }}>{profile.nome}</h2>
      <p className="text-sm" style={{ color: "#6B7268" }}>{jobs.length} vaga(s) publicada(s)</p>

      <div className="flex gap-2 mt-6 mb-5">
        <TabButton active={tab === "vagas"} onClick={() => setTab("vagas")}>Minhas vagas</TabButton>
        <TabButton active={tab === "nova"} onClick={() => setTab("nova")}>Publicar vaga</TabButton>
      </div>

      {tab === "vagas" && (
        <>
          {jobs.length === 0 && <EmptyState text="Você ainda não publicou nenhuma vaga." />}
          <div className="space-y-4">
            {jobs.map((j) => (
              <div key={j.id} className="p-4 rounded-xl" style={{ background: C.white, border: `1px solid ${C.line}` }}>
                <p className="f-display font-semibold text-[15px]" style={{ color: C.ink }}>{j.titulo}</p>
                <p className="f-mono text-[11px] mt-1" style={{ color: "#8A8570" }}>{j.area} · {j.tipo} · {j.local || "Remoto"}</p>
                <div className="dash-line my-3" />
                <p className="f-mono text-[11px] uppercase mb-2 inline-flex items-center gap-1.5" style={{ color: C.forest }}><Inbox size={12} /> candidatos ({myAppsByJob(j.id).length})</p>
                {myAppsByJob(j.id).length === 0 && <p className="text-sm" style={{ color: "#8A8570" }}>Ninguém se candidatou ainda.</p>}
                <div className="space-y-2 mt-2">
                  {myAppsByJob(j.id).map((a) => {
                    const cand = candidateById(a.candidate_id);
                    if (!cand) return null;
                    return (
                      <div key={a.id} className="p-3 rounded-lg" style={{ background: C.paperAlt }}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm" style={{ color: C.ink }}>{cand.nome}</p>
                            <p className="f-mono text-[11px]" style={{ color: "#8A8570" }}>{cand.area}</p>
                          </div>
                          <StatusPill status={a.status} />
                        </div>
                        {cand.bio && <p className="text-sm mt-2" style={{ color: "#4B5A52" }}>{cand.bio}</p>}
                        <div className="flex gap-2 mt-3">
                          <Button variant="primary" onClick={() => onStatusChange(a, "Aprovado")}><CheckCircle2 size={13} /> Aprovar</Button>
                          <Button variant="danger" onClick={() => onStatusChange(a, "Rejeitado")}><XCircle size={13} /> Rejeitar</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "nova" && <JobForm onPost={async (job) => { await onPost(job); setTab("vagas"); }} />}
    </div>
  );
}

function JobForm({ onPost }) {
  const [titulo, setTitulo] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [descricao, setDescricao] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setBusy(true);
    await onPost({ titulo: titulo.trim(), area, local: local.trim(), tipo, descricao: descricao.trim() });
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <Field label="Título da vaga">
        <input style={inputStyle} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Analista de Marketing Pleno" required />
      </Field>
      <Field label="Área">
        <select style={inputStyle} value={area} onChange={(e) => setArea(e.target.value)}>{AREAS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
      </Field>
      <Field label="Tipo de contrato">
        <select style={inputStyle} value={tipo} onChange={(e) => setTipo(e.target.value)}>{TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
      </Field>
      <Field label="Local (cidade ou 'Remoto')">
        <input style={inputStyle} value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Remoto / São Paulo, SP" />
      </Field>
      <Field label="Descrição da vaga">
        <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Responsabilidades, requisitos, benefícios..." />
      </Field>
      <Button type="submit" full disabled={busy}><Plus size={15} /> {busy ? "Publicando…" : "Publicar vaga"}</Button>
    </form>
  );
}
