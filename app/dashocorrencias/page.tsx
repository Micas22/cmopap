"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Check, Trash2, MapPin, Calendar,
  AlertCircle, FileText, Activity, Clock, CheckCircle2,
  ArrowLeft, Filter, RefreshCw, MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReportMap = dynamic(() => import("@/components/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-orange-50 text-orange-300 font-medium text-sm tracking-wide">
      A carregar mapa…
    </div>
  ),
});

/* ─── helpers ──────────────────────────────────────────────────────────── */
const TIPO_LABELS = ["Animal Perdido", "Animal Ferido", "Abandono", "Outro"];
const TIPO_COLORS: Record<number, { pill: string; dot: string }> = {
  0: { pill: "bg-sky-100 text-sky-700 ring-sky-200", dot: "bg-sky-400" },
  1: { pill: "bg-rose-100 text-rose-700 ring-rose-200", dot: "bg-rose-400" },
  2: { pill: "bg-amber-100 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  3: { pill: "bg-gray-100 text-gray-600 ring-gray-200", dot: "bg-gray-400" },
};
const getTipo = (e: number) => TIPO_LABELS[e] ?? "Desconhecido";
const getColors = (e: number) => TIPO_COLORS[e] ?? TIPO_COLORS[3];

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });

/* ─── component ─────────────────────────────────────────────────────────── */
export default function DashOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const router = useRouter();

  useEffect(() => {
    const u = localStorage.getItem("email");
    if (u) setUsername(u);
  }, []);

  useEffect(() => { fetchOcorrencias(); }, []);

  const fetchOcorrencias = async () => {
    setIsLoading(true);
    try {
      const r = await fetch("/api/admin/ocorrencias");
      if (r.ok) { setOcorrencias(await r.json()); setError(null); }
      else setError("Erro ao carregar ocorrências. Tente novamente mais tarde.");
    } catch {
      setError("Erro de conexão. Verifique a internet e tente novamente.");
    } finally { setIsLoading(false); }
  };

  const handleResolve = async (id: number) => {
    await fetch("/api/admin/ocorrencias", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data_resolucao: new Date().toISOString(), estado: 1 }),
    });
    fetchOcorrencias();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem a certeza que deseja eliminar esta ocorrência?")) return;
    await fetch("/api/admin/ocorrencias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCurrentIndex(i => Math.max(0, i - 1));
    fetchOcorrencias();
  };

  const handleLogout = () => { localStorage.removeItem("email"); router.push("/login"); };

  /* derived */
  const filtered = ocorrencias.filter(o =>
    filter === "all" ? true : filter === "resolved" ? !!o.data_resolucao : !o.data_resolucao
  );
  const safeIndex = Math.min(currentIndex, Math.max(0, filtered.length - 1));
  const current = filtered[safeIndex];
  const totalOpen = ocorrencias.filter(o => !o.data_resolucao).length;
  const totalResolved = ocorrencias.filter(o => !!o.data_resolucao).length;

  /* ── loading ── */
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin" />
        </div>
        <p className="text-gray-500 text-sm tracking-wide">A carregar ocorrências…</p>
      </div>
    </div>
  );

  /* ── error ── */
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Algo correu mal</h2>
        <p className="text-gray-500 text-sm leading-relaxed">{error}</p>
        <button onClick={fetchOcorrencias} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Tentar Novamente
        </button>
      </div>
    </div>
  );

  /* ── empty ── */
  if (ocorrencias.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-orange-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Sem ocorrências</h2>
        <p className="text-gray-500 text-sm">As ocorrências reportadas aparecerão aqui.</p>
        <button onClick={() => router.push("/report")} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors text-sm">
          Reportar Ocorrência
        </button>
      </div>
    </div>
  );

  /* ─────────── MAIN RENDER ─────────── */
  return (
    <div className="min-h-screen bg-[#f5f4f0] flex flex-col">

      {/* ── TOP NAV ── */}
      <motion.header
        className="bg-gradient-to-r from-orange-600 to-amber-500 shadow-lg z-50"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* logo */}
          <motion.div
            whileHover={{ scale: 1.04, rotate: -1 }}
            transition={{ type: "spring", stiffness: 320 }}
            className="flex-shrink-0 bg-white/10 p-1.5 rounded-xl backdrop-blur-sm"
          >
            <img src="/croa.png" alt="CROA Olhão" className="h-[52px] w-auto object-contain drop-shadow" />
          </motion.div>

          {/* nav links */}
          <nav className="hidden md:flex items-center gap-1 text-white text-sm font-medium">
            {[{ name: "Início", href: "/" }, { name: "Quem somos?", href: "/aboutus" }, { name: "Dashboard", href: "/dashboard" }].map(l => (
              <Link key={l.name} href={l.href}
                className="relative px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors group">
                {l.name}
                <span className="absolute bottom-1 left-3 right-3 h-px bg-white/0 group-hover:bg-white/60 transition-all duration-200" />
              </Link>
            ))}
          </nav>

          {/* user pill */}
          <div className="relative">
            <button
              onClick={() => setShowPopup(!showPopup)}
              className={`flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border transition-all text-sm font-medium
                ${showPopup ? "bg-white text-orange-600 border-white shadow-lg" : "bg-white/15 text-white border-white/20 hover:bg-white/25"}`}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 ring-2 ring-white/30">
                <img src="/user.png" alt="User" className="w-full h-full object-cover" />
              </div>
              <span className="max-w-[100px] truncate">{email || "Admin"}</span>
            </button>

            <AnimatePresence>
              {showPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl p-4 z-50 border border-gray-100"
                >
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Sessão iniciada</p>
                  <p className="text-gray-800 font-semibold text-sm mb-4 truncate">{email || "Guest"}</p>
                  <button onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-xl transition-colors">
                    Terminar sessão
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* ── STAT STRIP ── */}
      <div className="bg-white border-b border-gray-200/80 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-6 overflow-x-auto">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-orange-600 text-sm font-medium transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

          <div className="h-4 w-px bg-gray-200 flex-shrink-0" />

          {/* stat chips */}
          {[
            { icon: <Activity className="w-3.5 h-3.5" />, label: "Total", value: ocorrencias.length, color: "text-gray-700 bg-gray-100" },
            { icon: <Clock className="w-3.5 h-3.5" />, label: "Em aberto", value: totalOpen, color: "text-orange-700 bg-orange-100" },
            { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Resolvidas", value: totalResolved, color: "text-green-700 bg-green-100" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 flex-shrink-0">
              <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
                {s.icon} {s.value}
              </span>
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
          ))}

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            {(["all", "open", "resolved"] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); setCurrentIndex(0); }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors border
                  ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600"}`}>
                {f === "all" ? "Todas" : f === "open" ? "Abertas" : "Resolvidas"}
              </button>
            ))}
            <button onClick={fetchOcorrencias}
              className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Nenhuma ocorrência neste filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">

            {/* ── SIDEBAR LIST ── */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
                {filtered.length} ocorrência{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                {filtered.map((o, i) => {
                  const colors = getColors(o.estado);
                  const active = i === safeIndex;
                  return (
                    <motion.button
                      key={o.id}
                      onClick={() => setCurrentIndex(i)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200
                        ${active
                          ? "bg-white shadow-lg border-orange-200 ring-1 ring-orange-300"
                          : "bg-white/60 border-transparent hover:bg-white hover:shadow-md hover:border-gray-200"}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                          <span className="font-semibold text-gray-800 text-sm truncate">{o.titulo}</span>
                        </div>
                        {o.data_resolucao
                          ? <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Resolvido</span>
                          : <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">Aberto</span>
                        }
                      </div>
                      <p className="text-xs text-gray-400 truncate mb-2">{o.morada}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ${colors.pill}`}>
                          {getTipo(o.estado)}
                        </span>
                        <span className="text-[11px] text-gray-400">{fmt(o.data_criacao)}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ── DETAIL PANEL ── */}
            <div className="flex flex-col gap-5">

              {/* navigation row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={safeIndex === 0}
                    className="p-2 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCurrentIndex(i => Math.min(filtered.length - 1, i + 1))} disabled={safeIndex === filtered.length - 1}
                    className="p-2 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-400 font-medium">{safeIndex + 1} / {filtered.length}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                  #{current?.id}
                </span>
              </div>

              {current && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col gap-5"
                  >
                    {/* title card */}
                    <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 rounded-3xl p-6 text-white shadow-xl shadow-orange-200/60 relative overflow-hidden">
                      {/* decorative rings */}
                      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
                      <div className="absolute -bottom-8 -left-6 w-32 h-32 rounded-full bg-black/5 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2 ring-1
                              ${current.data_resolucao ? "bg-green-100 text-green-700 ring-green-200" : "bg-white/20 text-white ring-white/30"}`}>
                              {current.data_resolucao ? "✓ Resolvido" : "Em Aberto"}
                            </span>
                            <h2 className="text-2xl font-bold leading-tight">{current.titulo}</h2>
                          </div>
                          <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl ring-1 ${getColors(current.estado).pill} bg-white/90`}>
                            {getTipo(current.estado)}
                          </span>
                        </div>

                        <p className="text-white/80 text-sm leading-relaxed">{current.descricao}</p>
                      </div>
                    </div>

                    {/* meta + map grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* meta card */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Detalhes</p>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Morada</p>
                            <p className="text-sm text-gray-800 font-medium mt-0.5">{current.morada}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Data de Criação</p>
                            <p className="text-sm text-gray-800 font-medium mt-0.5">{fmt(current.data_criacao)}</p>
                          </div>
                        </div>

                        {current.data_resolucao && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Data de Resolução</p>
                              <p className="text-sm text-gray-800 font-medium mt-0.5">{fmt(current.data_resolucao)}</p>
                            </div>
                          </div>
                        )}

                        {/* actions */}
                        <div className="pt-3 border-t border-gray-100 flex gap-2.5">
                          {!current.data_resolucao && (
                            <button onClick={() => handleResolve(current.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors shadow-sm shadow-green-200">
                              <Check className="w-3.5 h-3.5" />
                              Marcar Resolvido
                            </button>
                          )}
                          <button onClick={() => handleDelete(current.id)}
                            className={`flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors border border-red-100 ${current.data_resolucao ? "flex-1" : ""}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {/* map card */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative min-h-[240px]">
                        <ReportMap onLocationSelect={() => { }} />
                        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm text-xs text-gray-600 font-medium px-3 py-2 rounded-xl shadow-sm border border-gray-100 z-[1000] truncate flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                          {current.morada}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}