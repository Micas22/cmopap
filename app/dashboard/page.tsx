"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import {
  Users, PawPrint, ChevronLeft, ChevronRight, Package,
  X, FileText, Bell, AlertTriangle, CheckCircle2, Clock,
  Syringe, ShieldAlert, TrendingUp, ArrowRight, Settings,
  Activity, Zap, LayoutGrid,
} from "lucide-react";
import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════
   ANIMATED NUMBER
══════════════════════════════════════════════════ */
function AnimNum({ to, delay = 0 }: { to: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const ctrl = animate(0, to, {
      duration: 1.6, delay, ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = String(Math.round(v)); }
    });
    return ctrl.stop;
  }, [to, delay]);
  return <span ref={ref}>0</span>;
}

/* ══════════════════════════════════════════════════
   AURORA CANVAS — animates in hero bg
══════════════════════════════════════════════════ */
function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number; let t = 0;
    const blobs = [
      { x: 0.75, y: 0.3, r: 420, c1: "rgba(255,200,100,0.22)", c2: "transparent", sx: 0.00025, sy: 0.00018 },
      { x: 0.2, y: 0.8, r: 360, c1: "rgba(255,140,60,0.18)", c2: "transparent", sx: -0.0002, sy: 0.00014 },
      { x: 0.5, y: -0.1, r: 300, c1: "rgba(255,255,255,0.12)", c2: "transparent", sx: 0.00015, sy: 0.00022 },
      { x: 0.9, y: 0.9, r: 280, c1: "rgba(255,160,50,0.15)", c2: "transparent", sx: -0.00018, sy: -0.0002 },
    ];
    const draw = () => {
      t++;
      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      blobs.forEach(b => {
        const cx = (b.x + Math.sin(t * b.sx) * 0.18) * W;
        const cy = (b.y + Math.cos(t * b.sy) * 0.15) * H;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        g.addColorStop(0, b.c1); g.addColorStop(1, b.c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ══════════════════════════════════════════════════
   MAGNETIC CARD HOOK
══════════════════════════════════════════════════ */
function useTilt(deg = 7) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const rx = useTransform(my, [-0.5, 0.5], [deg, -deg]);
  const ry = useTransform(mx, [-0.5, 0.5], [-deg, deg]);
  const cfg = { stiffness: 260, damping: 26 };
  const srx = useSpring(rx, cfg); const sry = useSpring(ry, cfg);
  const shine = useMotionValue("50% 50%");
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    mx.set(nx); my.set(ny);
    shine.set(`${(nx + 0.5) * 100}% ${(ny + 0.5) * 100}%`);
  };
  const onLeave = () => { mx.set(0); my.set(0); shine.set("50% 50%"); };
  return { ref, srx, sry, shine, onMove, onLeave };
}

/* ══════════════════════════════════════════════════
   TOGGLE
══════════════════════════════════════════════════ */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => onChange(!checked)} aria-pressed={checked}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-orange-500" : "bg-gray-200"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

/* ══════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════ */
function Modal({ open, onClose, icon: Icon, title, subtitle, count, children }: {
  open: boolean; onClose: () => void; icon: React.ElementType;
  title: string; subtitle: string; count: number; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            onClick={e => e.stopPropagation()}
            className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            {/* Modal header */}
            <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 p-6 flex items-center justify-between flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-black text-lg leading-tight">{title}</h2>
                  <p className="text-white/65 text-xs mt-0.5 font-medium">{subtitle}</p>
                </div>
              </div>
              <div className="relative flex items-center gap-2">
                {count > 0 && <span className="bg-white/30 text-white text-xs font-black px-3 py-1.5 rounded-full backdrop-blur-sm">{count}</span>}
                <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/35 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/60">{children}</div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
              <button onClick={onClose}
                className="w-full py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 transition-opacity shadow-md shadow-orange-200">
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════
   VACCINE ITEM
══════════════════════════════════════════════════ */
function VaccineItem({ animal }: { animal: any }) {
  const days = diffDaysFromNow(animal.data_proxima_vacina);
  const { pill, dot } = urgency(days);
  const date = new Date(animal.data_proxima_vacina).toLocaleDateString("pt-PT");
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-md hover:shadow-orange-50 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-orange-50 border border-orange-100">
            <img src={animal.image || "/placeholder.png"} alt={animal.nome} className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = "/placeholder.png"; }} />
          </div>
          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <p className="font-bold text-gray-800 text-sm truncate">{animal.nome}</p>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${pill}`}>{urgency(days).label}</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
            <Syringe className="w-3 h-3" /> {date}
          </p>
          <p className="text-xs text-gray-300 truncate font-mono mt-0.5">#{animal.chip}</p>
        </div>
      </div>
      <Link href="/dashanimais">
        <button className="mt-3 w-full text-xs font-bold text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-orange-100/50">
          Ver animal <ArrowRight className="w-3 h-3" />
        </button>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   OCORRENCIA ITEM
══════════════════════════════════════════════════ */
function OcorrenciaItem({ o }: { o: any }) {
  const idx = Math.min(o.estado, 3);
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-md hover:shadow-red-50 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <p className="font-bold text-gray-800 text-sm leading-tight">{o.titulo}</p>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${ESTADOS_PILL[idx]}`}>{ESTADOS_TEXT[idx]}</span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 mb-1">{o.descricao}</p>
          <p className="text-xs text-gray-300 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" /> {new Date(o.data_criacao).toLocaleDateString("pt-PT")}
          </p>
        </div>
      </div>
      <Link href="/dashocorrencias">
        <button className="mt-3 w-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-red-100/50">
          Ver ocorrência <ArrowRight className="w-3 h-3" />
        </button>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   NAV CARD
══════════════════════════════════════════════════ */
const MODULE_META: Record<string, { color: string; glow: string; bg: string; desc2: string }> = {
  "/dashanimais": { color: "#f97316", glow: "rgba(249,115,22,0.25)", bg: "from-orange-500 to-amber-500", desc2: "residentes" },
  "/dashstocks": { color: "#ea7c2b", glow: "rgba(234,124,43,0.22)", bg: "from-amber-500 to-orange-400", desc2: "artigos" },
  "/dashcolonias": { color: "#fb923c", glow: "rgba(251,146,60,0.22)", bg: "from-orange-400 to-yellow-500", desc2: "colónias" },
  "/dashutilizadores": { color: "#f59e0b", glow: "rgba(245,158,11,0.22)", bg: "from-yellow-500 to-amber-400", desc2: "utilizadores" },
  "/dashocorrencias": { color: "#ef4444", glow: "rgba(239,68,68,0.22)", bg: "from-red-500 to-orange-500", desc2: "por resolver" },
  "/dashdocumentos": { color: "#f97316", glow: "rgba(249,115,22,0.22)", bg: "from-orange-500 to-amber-400", desc2: "documentos" },
};

function NavCard({ card, index, badge }: { card: any; index: number; badge: number | null }) {
  const { ref, srx, sry, shine, onMove, onLeave } = useTilt(6);
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;
  const meta = MODULE_META[card.href] ?? { color: "#f97316", glow: "rgba(249,115,22,0.2)", bg: "from-orange-500 to-amber-500", desc2: "" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: 0.08 + index * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
    >
      <Link href={card.href}>
        <motion.div
          ref={ref}
          onMouseMove={onMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { onLeave(); setHovered(false); }}
          style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
          whileTap={{ scale: 0.97 }}
          className="group relative bg-white border border-gray-100/80 rounded-3xl p-6 cursor-pointer overflow-hidden"
        >
          {/* Spotlight */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: `radial-gradient(circle at ${shine.get()}, ${meta.glow} 0%, transparent 55%)`,
            }}
          />

          {/* Top edge glow */}
          <motion.div
            className="absolute top-0 left-6 right-6 h-px"
            animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`, transformOrigin: "center" }}
          />

          {/* Drop shadow */}
          <motion.div
            className="absolute inset-0 rounded-3xl -z-10"
            animate={{ boxShadow: hovered ? `0 24px 64px -8px ${meta.glow}` : "0 1px 12px 0 rgba(0,0,0,0.04)" }}
            transition={{ duration: 0.4 }}
          />

          <div className="relative z-10 flex items-center gap-4">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <motion.div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.bg} flex items-center justify-center`}
                animate={{
                  boxShadow: hovered ? `0 12px 32px -4px ${meta.glow}` : "0 4px 12px 0 rgba(249,115,22,0.15)",
                  scale: hovered ? 1.06 : 1,
                }}
                transition={{ duration: 0.35 }}
              >
                <motion.div
                  animate={{ rotate: hovered ? 8 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>

              {badge && (
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                >
                  {badge}
                </motion.span>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <motion.h3
                className="font-black text-gray-900 text-base leading-tight"
                animate={{ x: hovered ? 2 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {card.title}
              </motion.h3>
              <p className="text-gray-400 text-xs mt-1 font-medium">{card.desc}</p>
            </div>

            {/* Arrow */}
            <motion.div
              animate={{ x: hovered ? 4 : 0, color: hovered ? meta.color : "#e5e7eb" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   STAT PILL — hero banner
══════════════════════════════════════════════════ */
function StatPill({ label, value, icon: Icon, urgent, delay, onClick }: any) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick ?? undefined}
      disabled={!onClick}
      className={`group relative flex items-center gap-3 pl-4 pr-5 py-3.5 rounded-2xl border backdrop-blur-md transition-all duration-200 disabled:cursor-default text-left overflow-hidden ${urgent ? "bg-white/25 border-white/40 shadow-lg shadow-black/10" : "bg-white/12 border-white/25"
        }`}
    >
      {urgent && (
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-2xl"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${urgent ? "bg-white/35" : "bg-white/18"}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-white font-black text-2xl leading-none tabular-nums">
          <AnimNum to={value} delay={delay} />
        </p>
        <p className="text-white/65 text-[11px] mt-0.5 font-semibold">{label}</p>
      </div>
      {urgent && value > 0 && (
        <motion.span
          className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-400"
          animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════
   SECTION HEADER
══════════════════════════════════════════════════ */
function SectionHeader({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3 mb-6"
    >
      <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-orange-500" />
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-[0.22em]">{label}</p>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-100 to-transparent ml-1" />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [email, setEmail] = useState("");
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
    const s = localStorage.getItem("email");
    if (s) setEmail(s);
    else router.push("/login");
  }, [router]);

  useEffect(() => {
    if (!email) return;
    fetch("/api/admin/users").then(r => r.ok ? r.json() : []).then((users: any[]) => {
      const u = users.find((u: any) => u.email === email);
      if (u) { setUserId(u.id); setVaccineToggle(u.vaccine_notifications); setReportToggle(u.report_notifications); }
    }).catch(console.error);
  }, [email]);

  useEffect(() => {
    fetch("/api/admin/animals").then(r => r.ok ? r.json() : []).then((data: any[]) => {
      setAnimals(data);
      setVaccineNotifs(data.filter((a: any) => {
        if (!a.data_proxima_vacina) return false;
        const days = diffDaysFromNow(a.data_proxima_vacina);
        return days >= 0 && days <= 3;
      }));
    }).catch(console.error);
    fetch("/api/admin/ocorrencias").then(r => r.ok ? r.json() : []).then((data: any[]) => {
      setOcorrenciaNotifs(data.filter((o: any) => !o.data_resolucao));
    }).catch(console.error);
    fetch("/api/admin/check-vaccines").catch(console.error);
  }, []);

  useEffect(() => { if (vaccineNotifs.length > 0 && vaccineToggle) setShowVaccinePopup(true); }, [vaccineNotifs, vaccineToggle]);
  useEffect(() => { if (ocorrenciaNotifs.length > 0 && reportToggle) setShowOcorrenciaPopup(true); }, [ocorrenciaNotifs, reportToggle]);

  const handleToggle = async (type: "vaccine" | "report", value: boolean) => {
    if (!userId) return;
    const setLocal = type === "vaccine" ? setVaccineToggle : setReportToggle;
    const setLoading = type === "vaccine" ? setTogglingVaccine : setTogglingReport;
    setLocal(value);
    setLoading(true);
    try {
      const key = type === "vaccine" ? "vaccine_notifications" : "report_notifications";
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, [key]: value }),
      });
      if (!res.ok) setLocal(!value);
    } catch { setLocal(!value); }
    finally { setLoading(false); }
  };

  const totalNotifs = vaccineNotifs.length + ocorrenciaNotifs.length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";
  const firstName = email ? email.split("@")[0] : "Utilizador";

  const NAV_CARDS = [
    { title: "Animais", icon: PawPrint, href: "/dashanimais", desc: "Gerir animais registados" },
    { title: "Stocks", icon: Package, href: "/dashstocks", desc: "Controlo de inventário" },
    { title: "Colónias", icon: Users, href: "/dashcolonias", desc: "Gestão de colónias" },
    { title: "Utilizadores", icon: Users, href: "/dashutilizadores", desc: "Gerir contas de utilizador" },
    { title: "Ocorrências", icon: FileText, href: "/dashocorrencias", desc: "Incidentes por resolver" },
    { title: "Documentos", icon: FileText, href: "/dashdocumentos", desc: "Gerar e exportar documentos" },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8f7f5]">

        {/* ════════════════════════════════
            HERO BANNER
        ════════════════════════════════ */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 overflow-hidden">
          {/* Aurora */}
          <AuroraCanvas />

          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Diagonal stripe accent */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
              backgroundSize: "12px 12px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20">
            {/* Greeting row */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start justify-between flex-wrap gap-4 mb-10"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-emerald-300"
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-white/60 text-sm font-semibold tracking-wide">{greeting}</span>
                </div>

                {/* Large name */}
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: 60 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none capitalize"
                  >
                    {firstName}
                  </motion.h1>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/50 text-sm mt-3 font-medium"
                >
                  {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </motion.p>
              </div>

              {/* System status badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/25"
              >
                <Activity className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm font-bold">Sistema ativo</span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-emerald-300"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3">
              <StatPill label="Animais" value={animals.length} icon={PawPrint} urgent={false} delay={0.12} onClick={null} />
              <StatPill label="Vacinas pendentes" value={vaccineNotifs.length} icon={Syringe} urgent={vaccineNotifs.length > 0} delay={0.2}
                onClick={() => { setIsSidebarOpen(true); setSidebarTab("vaccines"); }} />
              <StatPill label="Ocorrências abertas" value={ocorrenciaNotifs.length} icon={ShieldAlert} urgent={ocorrenciaNotifs.length > 0} delay={0.28}
                onClick={() => { setIsSidebarOpen(true); setSidebarTab("ocorrencias"); }} />
            </div>
          </div>

          {/* Organic wave bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
              <path d="M0 64L80 56C160 48 320 32 480 26.7C640 21.3 800 26.7 960 32C1120 37.3 1280 42.7 1360 45.3L1440 48V64H0Z" fill="#f8f7f5" />
            </svg>
          </div>
        </div>

        {/* ════════════════════════════════
            CONTENT
        ════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-14">

          {/* ── Modules grid ── */}
          <div>
            <SectionHeader label="Módulos" icon={LayoutGrid} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {NAV_CARDS.map((card, i) => (
                <NavCard key={card.href} card={card} index={i}
                  badge={card.href === "/dashocorrencias" ? (ocorrenciaNotifs.length || null) : null} />
              ))}
            </div>
          </div>

          {/* ── Notification preferences ── */}
          <div>
            <SectionHeader label="Preferências de notificação" icon={Bell} />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm"
            >
              {/* Card header */}
              <div className="relative px-6 py-5 border-b border-gray-100 flex items-center gap-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-60" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center shadow-sm shadow-orange-200">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="relative">
                  <h3 className="font-black text-gray-800 text-sm">Alertas automáticos</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Receba notificações quando ocorrerem eventos importantes</p>
                </div>
              </div>

              {/* Toggle rows */}
              {[
                { type: "vaccine" as const, icon: Syringe, label: "Vacinas próximas", sub: "Alerta quando um animal tem vacina nos próximos 3 dias", checked: vaccineToggle, loading: togglingVaccine, count: vaccineNotifs.length },
                { type: "report" as const, icon: AlertTriangle, label: "Ocorrências por resolver", sub: "Alerta quando existem ocorrências abertas sem resolução", checked: reportToggle, loading: togglingReport, count: ocorrenciaNotifs.length },
              ].map((n, idx) => (
                <motion.div key={n.type}
                  whileHover={{ backgroundColor: "#fafafa" }}
                  className={`px-6 py-5 flex items-center gap-4 transition-colors ${idx > 0 ? "border-t border-gray-50" : ""}`}
                >
                  <motion.div
                    animate={{ backgroundColor: n.checked ? "#fff7ed" : "#f3f4f6" }}
                    transition={{ duration: 0.3 }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <n.icon className={`w-4 h-4 transition-colors duration-300 ${n.checked ? "text-orange-500" : "text-gray-400"}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800 text-sm">{n.label}</p>
                      <AnimatePresence>
                        {n.count > 0 && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200"
                          >
                            {n.count} pendentes
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 font-medium">{n.sub}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Toggle checked={n.checked} onChange={(v) => handleToggle(n.type, v)} disabled={n.loading} />
                  </div>
                </motion.div>
              ))}

              {/* Footer */}
              <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  As alterações são guardadas automaticamente e sincronizadas com a sua conta
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ════════════════════════════════
            SIDEBAR TOGGLE BUTTON
        ════════════════════════════════ */}
        <motion.button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
          animate={{ x: isSidebarOpen ? -360 : 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <motion.div
            whileHover={{ paddingLeft: "14px", paddingRight: "14px" }}
            className="relative bg-gradient-to-b from-orange-500 to-amber-500 text-white py-7 px-3 rounded-l-2xl shadow-xl shadow-orange-200/50 transition-[padding] duration-150"
          >
            {totalNotifs > 0 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute -top-2 -left-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md"
              >
                {totalNotifs}
              </motion.span>
            )}
            <AnimatePresence mode="wait">
              {isSidebarOpen
                ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
                : <motion.div key="bell" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Bell className="w-4 h-4" />
                </motion.div>
              }
            </AnimatePresence>
          </motion.div>
        </motion.button>

        {/* ════════════════════════════════
            SIDEBAR PANEL
        ════════════════════════════════ */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-30"
              />
              <motion.div
                initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 h-full w-[360px] bg-white/95 backdrop-blur-xl border-l border-gray-200/60 shadow-2xl z-[200] flex flex-col"
              >
                {/* Panel header */}
                <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 px-5 pt-6 pb-0 flex-shrink-0 overflow-hidden">
                  <div className="absolute inset-0 opacity-15"
                    style={{ backgroundImage: "radial-gradient(circle at 80% 30%, white 0%, transparent 55%)" }} />
                  <div className="relative flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="font-black text-white text-lg">Alertas</h2>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)}
                      className="w-8 h-8 bg-white/20 hover:bg-white/35 rounded-xl flex items-center justify-center transition-colors">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1">
                    {([
                      { key: "vaccines", label: "Vacinas", count: vaccineNotifs.length },
                      { key: "ocorrencias", label: "Ocorrências", count: ocorrenciaNotifs.length },
                      { key: "settings", label: "Definições", count: 0 },
                    ] as const).map(tab => (
                      <button key={tab.key} onClick={() => setSidebarTab(tab.key)}
                        className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-colors duration-150 ${sidebarTab === tab.key ? "text-orange-600 bg-white" : "text-white/70 hover:text-white hover:bg-white/15"
                          }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${sidebarTab === tab.key ? "bg-orange-100 text-orange-600" : "bg-white/25 text-white"
                            }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/60">
                  <AnimatePresence mode="wait">

                    {sidebarTab === "vaccines" && (
                      <motion.div key="vaccines" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} className="space-y-3">
                        {vaccineNotifs.length === 0
                          ? <div className="text-center py-16">
                            <motion.div
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4"
                            >
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </motion.div>
                            <p className="font-black text-gray-700 text-sm">Tudo em dia!</p>
                            <p className="text-gray-400 text-xs mt-1.5 font-medium">Sem vacinas pendentes nos próximos 3 dias</p>
                          </div>
                          : <>
                            <p className="text-xs text-gray-400 px-1 mb-3 font-semibold">{vaccineNotifs.length} animal(is) com vacinas próximas</p>
                            {vaccineNotifs.map(a => <VaccineItem key={a.id} animal={a} />)}
                          </>
                        }
                      </motion.div>
                    )}

                    {sidebarTab === "ocorrencias" && (
                      <motion.div key="ocorrencias" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} className="space-y-3">
                        {ocorrenciaNotifs.length === 0
                          ? <div className="text-center py-16">
                            <motion.div
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4"
                            >
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </motion.div>
                            <p className="font-black text-gray-700 text-sm">Sem ocorrências abertas</p>
                            <p className="text-gray-400 text-xs mt-1.5 font-medium">Todos os incidentes foram resolvidos</p>
                          </div>
                          : <>
                            <p className="text-xs text-gray-400 px-1 mb-3 font-semibold">{ocorrenciaNotifs.length} ocorrência(s) sem resolução</p>
                            {ocorrenciaNotifs.map(o => <OcorrenciaItem key={o.id} o={o} />)}
                          </>
                        }
                      </motion.div>
                    )}

                    {sidebarTab === "settings" && (
                      <motion.div key="settings" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} className="space-y-3">
                        <p className="text-xs text-gray-400 px-1 mb-4 font-semibold">Escolha os alertas que pretende receber</p>
                        {[
                          { type: "vaccine" as const, icon: Syringe, label: "Vacinas próximas", sub: "Alertas 3 dias antes da vacina", checked: vaccineToggle, loading: togglingVaccine, count: vaccineNotifs.length },
                          { type: "report" as const, icon: AlertTriangle, label: "Ocorrências abertas", sub: "Alertas de incidentes por resolver", checked: reportToggle, loading: togglingReport, count: ocorrenciaNotifs.length },
                        ].map(n => (
                          <div key={n.type} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                              <motion.div
                                animate={{ backgroundColor: n.checked ? "#fff7ed" : "#f3f4f6" }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              >
                                <n.icon className={`w-4 h-4 transition-colors duration-300 ${n.checked ? "text-orange-500" : "text-gray-400"}`} />
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-bold text-gray-800 text-sm">{n.label}</p>
                                  <Toggle checked={n.checked} onChange={v => handleToggle(n.type, v)} disabled={n.loading} />
                                </div>
                                <p className="text-gray-400 text-xs mt-1 font-medium">{n.sub}</p>
                                {n.count > 0 && (
                                  <span className="inline-block mt-2 bg-red-50 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100">
                                    {n.count} pendente(s) agora
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-orange-700 font-medium leading-relaxed">As preferências são guardadas automaticamente e sincronizadas com a sua conta.</p>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════
            MODALS
        ════════════════════════════════ */}
        <Modal open={showVaccinePopup} onClose={() => setShowVaccinePopup(false)}
          icon={Syringe} title="Vacinas Pendentes" subtitle="Animais com vacinas nos próximos 3 dias" count={vaccineNotifs.length}
        >
          {vaccineNotifs.length === 0
            ? <div className="text-center py-10 text-gray-400"><PawPrint className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm font-medium">Nenhuma vacina pendente</p></div>
            : vaccineNotifs.map(a => <VaccineItem key={a.id} animal={a} />)
          }
        </Modal>

        <Modal open={showOcorrenciaPopup} onClose={() => setShowOcorrenciaPopup(false)}
          icon={ShieldAlert} title="Ocorrências Não Resolvidas" subtitle="Incidentes pendentes de resolução" count={ocorrenciaNotifs.length}
        >
          {ocorrenciaNotifs.length === 0
            ? <div className="text-center py-10 text-gray-400"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm font-medium">Sem ocorrências por resolver</p></div>
            : ocorrenciaNotifs.map(o => <OcorrenciaItem key={o.id} o={o} />)
          }
        </Modal>

      </main>
    </>
  );
}