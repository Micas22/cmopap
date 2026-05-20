"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, PawPrint, ChevronLeft, ChevronRight, Package,
  X, FileText, Bell, AlertTriangle, CheckCircle2, Clock,
  Syringe, ShieldAlert, TrendingUp, ArrowRight, Settings,
} from "lucide-react";
import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ────────────────────────────────────────────────────────── helpers */
function diffDaysFromNow(dateStr: string) {
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - t.getTime()) / 86400000);
}
function urgency(days: number) {
  if (days === 0) return { pill: "bg-red-100 text-red-600 border border-red-200", dot: "bg-red-500", label: "Hoje" };
  if (days === 1) return { pill: "bg-orange-100 text-orange-600 border border-orange-200", dot: "bg-orange-500", label: "Amanhã" };
  return { pill: "bg-yellow-100 text-yellow-700 border border-yellow-200", dot: "bg-yellow-400", label: `${days}d` };
}
const ESTADOS_TEXT = ["Animal Perdido", "Animal Ferido", "Abandono", "Outro"];
const ESTADOS_PILL = [
  "bg-blue-100 text-blue-700 border border-blue-200",
  "bg-red-100 text-red-700 border border-red-200",
  "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "bg-gray-100 text-gray-600 border border-gray-200",
];

/* ────────────────────────────────────────────────────────── Toggle */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-orange-500" : "bg-gray-200"
        }`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

/* ────────────────────────────────────────────────────────── Modal */
function Modal({ open, onClose, icon: Icon, accent, title, subtitle, count, children }: {
  open: boolean; onClose: () => void; icon: React.ElementType;
  accent: string; title: string; subtitle: string; count: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className={`${accent} p-5 flex items-center justify-between flex-shrink-0`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">{title}</h2>
                  <p className="text-white/65 text-xs mt-0.5">{subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {count > 0 && <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-1 rounded-full">{count}</span>}
                <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">{children}</div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={onClose} className={`w-full py-3 rounded-2xl text-sm font-bold text-white ${accent} hover:opacity-90 transition-opacity`}>
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────── Sidebar notification item */
function VaccineItem({ animal }: { animal: any }) {
  const days = diffDaysFromNow(animal.data_proxima_vacina);
  const { pill, dot } = urgency(days);
  const date = new Date(animal.data_proxima_vacina).toLocaleDateString("pt-PT");
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="group relative bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 border border-orange-100">
            <img src={animal.image || "/placeholder.png"} alt={animal.nome} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/placeholder.png"; }} />
          </div>
          <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p className="font-semibold text-gray-800 text-sm truncate">{animal.nome}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${pill}`}>{urgency(days).label}</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Syringe className="w-3 h-3" /> {date}
          </p>
          <p className="text-xs text-gray-400 truncate">#{animal.chip}</p>
        </div>
      </div>
      <Link href="/dashanimais">
        <button className="mt-3 w-full text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
          Ver animal <ArrowRight className="w-3 h-3" />
        </button>
      </Link>
    </motion.div>
  );
}

function OcorrenciaItem({ o }: { o: any }) {
  const idx = Math.min(o.estado, 3);
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <p className="font-semibold text-gray-800 text-sm leading-tight">{o.titulo}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ESTADOS_PILL[idx]}`}>{ESTADOS_TEXT[idx]}</span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 mb-1">{o.descricao}</p>
          <p className="text-xs text-gray-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {new Date(o.data_criacao).toLocaleDateString("pt-PT")}
          </p>
        </div>
      </div>
      <Link href="/dashocorrencias">
        <button className="mt-3 w-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
          Ver ocorrência <ArrowRight className="w-3 h-3" />
        </button>
      </Link>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────── Main */
export default function AdminDashboard() {
  const [username, setUsername] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"vaccines" | "ocorrencias" | "settings">("vaccines");
  const [animals, setAnimals] = useState<any[]>([]);
  const [vaccineNotifs, setVaccineNotifs] = useState<any[]>([]);
  const [ocorrenciaNotifs, setOcorrenciaNotifs] = useState<any[]>([]);
  const [showVaccinePopup, setShowVaccinePopup] = useState(false);
  const [showOcorrenciaPopup, setShowOcorrenciaPopup] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [vaccineToggle, setVaccineToggle] = useState(false);
  const [reportToggle, setReportToggle] = useState(false);
  const [togglingVaccine, setTogglingVaccine] = useState(false);
  const [togglingReport, setTogglingReport] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const s = localStorage.getItem("username");
    if (s) setUsername(s);
  }, []);

  useEffect(() => {
    if (!username) return;
    fetch("/api/admin/users").then(r => r.ok ? r.json() : []).then((users: any[]) => {
      const u = users.find((u: any) => u.username === username);
      if (u) { setUserId(u.id); setVaccineToggle(u.vaccine_notifications); setReportToggle(u.report_notifications); }
    }).catch(console.error);
  }, [username]);

  useEffect(() => {
    fetch("/api/admin/animals").then(r => r.ok ? r.json() : []).then((data: any[]) => {
      setAnimals(data);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      setVaccineNotifs(data.filter((a: any) => {
        if (!a.data_proxima_vacina) return false;
        const days = diffDaysFromNow(a.data_proxima_vacina);
        return days >= 0 && days <= 3;
      }));
    }).catch(console.error);
    fetch("/api/admin/ocorrencias").then(r => r.ok ? r.json() : []).then((data: any[]) => {
      setOcorrenciaNotifs(data.filter((o: any) => !o.data_resolucao));
    }).catch(console.error);
  }, []);

  useEffect(() => { if (vaccineNotifs.length > 0 && vaccineToggle) setShowVaccinePopup(true); }, [vaccineNotifs, vaccineToggle]);
  useEffect(() => { if (ocorrenciaNotifs.length > 0 && reportToggle) setShowOcorrenciaPopup(true); }, [ocorrenciaNotifs, reportToggle]);

  /* Optimistic toggle — update UI immediately, revert on failure */
  const handleToggle = async (type: "vaccine" | "report", value: boolean) => {
    if (!userId) return;
    const setLocal = type === "vaccine" ? setVaccineToggle : setReportToggle;
    const setLoading = type === "vaccine" ? setTogglingVaccine : setTogglingReport;
    setLocal(value);          // optimistic
    setLoading(true);
    try {
      const key = type === "vaccine" ? "vaccine_notifications" : "report_notifications";
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, [key]: value }),
      });
      if (!res.ok) setLocal(!value); // revert
    } catch { setLocal(!value); }
    finally { setLoading(false); }
  };

  const totalNotifs = vaccineNotifs.length + ocorrenciaNotifs.length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

  const NAV_CARDS = [
    { title: "Animais", icon: PawPrint, href: "/dashanimais", desc: "Gerir animais registados", badge: null },
    { title: "Stocks", icon: Package, href: "/dashstocks", desc: "Controlo de inventário", badge: null },
    { title: "Colónias", icon: Users, href: "/dashcolonias", desc: "Gestão de colónias", badge: null },
    { title: "Utilizadores", icon: Users, href: "/dashutilizadores", desc: "Gerir contas de utilizador", badge: null },
    { title: "Ocorrências", icon: FileText, href: "/dashocorrencias", desc: "Incidentes por resolver", badge: ocorrenciaNotifs.length || null },
    { title: "Documentos", icon: FileText, href: "/dashdocumentos", desc: "Gerar e exportar documentos", badge: null },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">

        {/* ── HERO BANNER ───────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff18_1px,transparent_1px),linear-gradient(to_bottom,#ffffff18_1px,transparent_1px)] bg-[size:36px_36px]"
            animate={{ backgroundPosition: ["0px 0px", "36px 36px"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl" animate={{ x: [0, -40, 0], y: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-16">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-white/60 text-sm font-medium">{greeting},</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-1">
                {username || "Utilizador"}
              </h1>
              <p className="text-white/50 text-sm mt-2">Painel de administração · {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}</p>
            </motion.div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { label: "Animais", value: animals.length, icon: PawPrint, onClick: null },
                { label: "Vacinas pendentes", value: vaccineNotifs.length, icon: Syringe, onClick: () => { setIsSidebarOpen(true); setSidebarTab("vaccines"); }, urgent: vaccineNotifs.length > 0 },
                { label: "Ocorrências abertas", value: ocorrenciaNotifs.length, icon: ShieldAlert, onClick: () => { setIsSidebarOpen(true); setSidebarTab("ocorrencias"); }, urgent: ocorrenciaNotifs.length > 0 },
              ].map((s, i) => (
                <motion.button
                  key={i}
                  type="button"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                  onClick={s.onClick ?? undefined}
                  disabled={!s.onClick}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-150 ${s.urgent
                      ? "bg-white/20 border-white/30 hover:bg-white/30"
                      : "bg-white/10 border-white/20 hover:bg-white/20"
                    } disabled:cursor-default`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.urgent ? "bg-white/30" : "bg-white/15"}`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-extrabold text-xl leading-none">{s.value}</p>
                    <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                  </div>
                  {s.urgent && s.value > 0 && <span className="ml-1 w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 48L60 40C120 32 240 16 360 12C480 8 600 16 720 20C840 24 960 24 1080 20C1200 16 1320 8 1380 4L1440 0V48H0Z" fill="#f9fafb" />
            </svg>
          </div>
        </div>

        {/* ── CONTENT ───────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

          {/* Nav cards */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Módulos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {NAV_CARDS.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div key={card.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={card.href}>
                      <motion.div
                        whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.09)" }}
                        whileTap={{ scale: 0.98 }}
                        className="group bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex items-center gap-4"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200/60 group-hover:scale-105 transition-transform duration-200">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {card.badge && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow">
                              {card.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800">{card.title}</h3>
                          <p className="text-gray-400 text-xs mt-0.5 truncate">{card.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Notification prefs */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Preferências de notificação</p>
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              {/* Header row */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Alertas automáticos</h3>
                  <p className="text-gray-400 text-xs">Receba notificações quando ocorrerem eventos importantes</p>
                </div>
              </div>

              {/* Toggle rows */}
              {[
                {
                  type: "vaccine" as const,
                  icon: Syringe,
                  label: "Vacinas próximas",
                  sub: "Alerta quando um animal tem vacina nos próximos 3 dias",
                  checked: vaccineToggle,
                  loading: togglingVaccine,
                  count: vaccineNotifs.length,
                },
                {
                  type: "report" as const,
                  icon: AlertTriangle,
                  label: "Ocorrências por resolver",
                  sub: "Alerta quando existem ocorrências abertas sem resolução",
                  checked: reportToggle,
                  loading: togglingReport,
                  count: ocorrenciaNotifs.length,
                },
              ].map((n, idx) => (
                <div key={n.type} className={`px-6 py-5 flex items-center gap-4 ${idx === 0 ? "" : "border-t border-gray-50"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${n.checked ? "bg-orange-100" : "bg-gray-100"}`}>
                    <n.icon className={`w-4 h-4 transition-colors ${n.checked ? "text-orange-500" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{n.label}</p>
                      {n.count > 0 && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{n.count} pendentes</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{n.sub}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Toggle checked={n.checked} onChange={(v) => handleToggle(n.type, v)} disabled={n.loading} />
                  </div>
                </div>
              ))}

              {/* Footer hint */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  As alterações são guardadas automaticamente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR TOGGLE BUTTON ─────────────────────────── */}
        <motion.button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
          animate={{ x: isSidebarOpen ? -352 : 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <div className="relative bg-gradient-to-b from-orange-500 to-amber-500 text-white py-6 px-2.5 rounded-l-2xl shadow-xl hover:px-4 transition-all duration-150">
            {totalNotifs > 0 && (
              <span className="absolute -top-2 -left-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {totalNotifs}
              </span>
            )}
            {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </div>
        </motion.button>

        {/* ── SIDEBAR PANEL ─────────────────────────────────── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/20 z-30"
              />
              <motion.div
                initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 h-full w-88 w-[352px] bg-gray-50 border-l border-gray-200 shadow-2xl z-[200] flex flex-col"
              >
                {/* Panel header */}
                <div className="bg-white border-b border-gray-100 px-5 pt-5 pb-0 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-extrabold text-gray-800 text-lg">Alertas</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-1">
                    {([
                      { key: "vaccines", label: "Vacinas", count: vaccineNotifs.length },
                      { key: "ocorrencias", label: "Ocorrências", count: ocorrenciaNotifs.length },
                      { key: "settings", label: "Definições", count: 0 },
                    ] as const).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setSidebarTab(tab.key)}
                        className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors duration-150 ${sidebarTab === tab.key
                            ? "text-orange-600 bg-gray-50"
                            : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sidebarTab === tab.key ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                            {tab.count}
                          </span>
                        )}
                        {sidebarTab === tab.key && (
                          <motion.div layoutId="sidebar-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <AnimatePresence mode="wait">

                    {sidebarTab === "vaccines" && (
                      <motion.div key="vaccines" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
                        {vaccineNotifs.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <CheckCircle2 className="w-7 h-7 text-green-500" />
                            </div>
                            <p className="font-semibold text-gray-600 text-sm">Tudo em dia!</p>
                            <p className="text-gray-400 text-xs mt-1">Sem vacinas pendentes nos próximos 3 dias</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-gray-400 px-1 mb-2">{vaccineNotifs.length} animal(is) com vacinas próximas</p>
                            {vaccineNotifs.map(a => <VaccineItem key={a.id} animal={a} />)}
                          </>
                        )}
                      </motion.div>
                    )}

                    {sidebarTab === "ocorrencias" && (
                      <motion.div key="ocorrencias" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
                        {ocorrenciaNotifs.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <CheckCircle2 className="w-7 h-7 text-green-500" />
                            </div>
                            <p className="font-semibold text-gray-600 text-sm">Sem ocorrências abertas</p>
                            <p className="text-gray-400 text-xs mt-1">Todos os incidentes foram resolvidos</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-gray-400 px-1 mb-2">{ocorrenciaNotifs.length} ocorrência(s) sem resolução</p>
                            {ocorrenciaNotifs.map(o => <OcorrenciaItem key={o.id} o={o} />)}
                          </>
                        )}
                      </motion.div>
                    )}

                    {sidebarTab === "settings" && (
                      <motion.div key="settings" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
                        <p className="text-xs text-gray-400 px-1 mb-4">Escolha os alertas que pretende receber</p>
                        {[
                          { type: "vaccine" as const, icon: Syringe, label: "Vacinas próximas", sub: "Alertas 3 dias antes da vacina", checked: vaccineToggle, loading: togglingVaccine, count: vaccineNotifs.length },
                          { type: "report" as const, icon: AlertTriangle, label: "Ocorrências abertas", sub: "Alertas de incidentes por resolver", checked: reportToggle, loading: togglingReport, count: ocorrenciaNotifs.length },
                        ].map(n => (
                          <div key={n.type} className="bg-white border border-gray-100 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.checked ? "bg-orange-100" : "bg-gray-100"}`}>
                                <n.icon className={`w-4 h-4 ${n.checked ? "text-orange-500" : "text-gray-400"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-gray-800 text-sm">{n.label}</p>
                                  <Toggle checked={n.checked} onChange={v => handleToggle(n.type, v)} disabled={n.loading} />
                                </div>
                                <p className="text-gray-400 text-xs mt-1">{n.sub}</p>
                                {n.count > 0 && (
                                  <span className="inline-block mt-2 bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                                    {n.count} pendente(s) agora
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-orange-700">As preferências são guardadas automaticamente e sincronizadas com a sua conta.</p>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── MODALS ────────────────────────────────────────── */}
        <Modal open={showVaccinePopup} onClose={() => setShowVaccinePopup(false)}
          icon={Syringe} accent="bg-gradient-to-r from-orange-500 to-amber-500"
          title="Vacinas Pendentes" subtitle="Animais com vacinas nos próximos 3 dias"
          count={vaccineNotifs.length}
        >
          {vaccineNotifs.length === 0
            ? <div className="text-center py-10 text-gray-400"><PawPrint className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Nenhuma vacina pendente</p></div>
            : vaccineNotifs.map(a => <VaccineItem key={a.id} animal={a} />)
          }
        </Modal>

        <Modal open={showOcorrenciaPopup} onClose={() => setShowOcorrenciaPopup(false)}
          icon={ShieldAlert} accent="bg-gradient-to-r from-red-500 to-orange-500"
          title="Ocorrências Não Resolvidas" subtitle="Incidentes pendentes de resolução"
          count={ocorrenciaNotifs.length}
        >
          {ocorrenciaNotifs.length === 0
            ? <div className="text-center py-10 text-gray-400"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Sem ocorrências por resolver</p></div>
            : ocorrenciaNotifs.map(o => <OcorrenciaItem key={o.id} o={o} />)
          }
        </Modal>

      </main>
    </>
  );
}