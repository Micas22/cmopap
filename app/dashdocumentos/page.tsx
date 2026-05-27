"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, useSpring, animate, useAnimationFrame } from "framer-motion";
import { ArrowLeft, FileText, CheckCircle, FileCheck, ChevronRight, UserCheck, Phone, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

/* ══════════════════════════════════════════════════
   MAGNETIC TILT HOOK — tracks cursor precisely
══════════════════════════════════════════════════ */
function useMagneticTilt(strength = 12) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [strength, -strength]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-strength, strength]);
  const springCfg = { stiffness: 250, damping: 28, mass: 0.8 };
  const sx = useSpring(rotateX, springCfg);
  const sy = useSpring(rotateY, springCfg);

  const shine = useMotionValue("0% 0%");

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    x.set(nx); y.set(ny);
    shine.set(`${(nx + 0.5) * 100}% ${(ny + 0.5) * 100}%`);
  }, [x, y, shine]);

  const onLeave = useCallback(() => {
    x.set(0); y.set(0);
    shine.set("50% 50%");
  }, [x, y, shine]);

  return { ref, sx, sy, shine, onMove, onLeave };
}

/* ══════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════ */
function Counter({ to, delay = 0 }: { to: number; delay?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = nodeRef.current!;
    const ctrl = animate(0, to, {
      duration: 1.4, delay, ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { node.textContent = String(Math.round(v)).padStart(2, "0"); }
    });
    return ctrl.stop;
  }, [to, delay]);
  return <span ref={nodeRef}>00</span>;
}

/* ══════════════════════════════════════════════════
   MESH GRADIENT BACKGROUND — animates on rAF
══════════════════════════════════════════════════ */
function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    const orbs = [
      { x: 0.82, y: 0.1, r: 480, c: "rgba(249,115,22,0.07)", sx: 0.00018, sy: 0.00012 },
      { x: 0.15, y: 0.75, r: 380, c: "rgba(251,146,60,0.05)", sx: -0.00014, sy: 0.00009 },
      { x: 0.5, y: 0.45, r: 300, c: "rgba(253,186,116,0.04)", sx: 0.0001, sy: -0.0001 },
    ];

    const draw = () => {
      t++;
      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      orbs.forEach(o => {
        const cx = (o.x + Math.sin(t * o.sx) * 0.15) * W;
        const cy = (o.y + Math.cos(t * o.sy) * 0.12) * H;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
        g.addColorStop(0, o.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "normal" }} />
  );
}

/* ══════════════════════════════════════════════════
   NOISE GRAIN OVERLAY
══════════════════════════════════════════════════ */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/* ══════════════════════════════════════════════════
   DOCUMENT OPTIONS
══════════════════════════════════════════════════ */
const documentOptions = [
  {
    title: "Registo de Aconselhamentos",
    icon: FileCheck,
    route: "/dashdocumentos/aconselhamento",
    accent: "#f97316",
    tag: "Consultoria",
    description: "Registe e acompanhe todos os aconselhamentos com histórico completo.",
    stat: "247",
    statLabel: "registos",
  },
  {
    title: "Registo de Chamadas",
    icon: Phone,
    route: "/dashdocumentos/chamadas",
    accent: "#ea7c2b",
    tag: "Comunicação",
    description: "Histórico completo de chamadas recebidas e efetuadas.",
    stat: "89",
    statLabel: "chamadas",
  },
  {
    title: "Entradas e Saídas",
    icon: CheckCircle,
    route: "/dashdocumentos/registoensai",
    accent: "#fb923c",
    tag: "Controlo",
    description: "Monitorize e registe todas as entradas e saídas em tempo real.",
    stat: "512",
    statLabel: "movimentos",
  },
  {
    title: "Ficha de Internamento",
    icon: UserCheck,
    route: "/dashdocumentos/internamento",
    accent: "#f97316",
    tag: "Clínico",
    description: "Crie fichas completas de internamento com plano de medicações.",
    stat: "34",
    statLabel: "fichas ativas",
  },
];

/* ══════════════════════════════════════════════════
   SPARKLE TRAIL — follows cursor inside card
══════════════════════════════════════════════════ */
type Particle = { id: number; x: number; y: number; life: number };

function SparkleTrail({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  const spawn = useCallback((x: number, y: number) => {
    if (!active) return;
    const id = ++idRef.current;
    setParticles(p => [...p.slice(-12), { id, x, y, life: 1 }]);
    setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 700);
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        spawn(e.clientX - r.left, e.clientY - r.top);
      }}>
      {particles.map(p => (
        <motion.div key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-orange-400 pointer-events-none"
          style={{ left: p.x - 3, top: p.y - 3 }}
          initial={{ scale: 1, opacity: 0.8, y: 0 }}
          animate={{ scale: 0, opacity: 0, y: -24 + Math.random() * -16, x: (Math.random() - 0.5) * 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   DOC CARD
══════════════════════════════════════════════════ */
function DocCard({ doc, index, onClick }: {
  doc: typeof documentOptions[0];
  index: number;
  onClick: () => void;
}) {
  const { ref, sx, sy, shine, onMove, onLeave } = useMagneticTilt(8);
  const [hovered, setHovered] = useState(false);
  const Icon = doc.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: 0.08 + index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={ref}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { onLeave(); setHovered(false); }}
        style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
        className="relative w-full text-left overflow-hidden rounded-3xl cursor-pointer select-none"
        whileTap={{ scale: 0.975 }}
      >
        {/* ── Glass base ── */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-3xl" />

        {/* ── Animated border via conic gradient ── */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: `conic-gradient(from 0deg, transparent 60%, ${doc.accent}44 80%, transparent 100%)`,
            padding: 1,
          }}
        >
          <div className="w-full h-full rounded-3xl bg-white/90" />
        </motion.div>

        {/* Static border */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-gray-100/80" />

        {/* ── Holographic shine ── */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle at ${shine.get()}, rgba(249,115,22,0.06) 0%, transparent 60%)`,
          }}
        />

        {/* ── Noise grain ── */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: NOISE_SVG, backgroundSize: "160px" }} />

        {/* ── Sparkle trail layer ── */}
        <SparkleTrail active={hovered} />

        {/* ── Top accent strip ── */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: `linear-gradient(90deg, transparent, ${doc.accent}, ${doc.accent}cc, transparent)`,
            transformOrigin: "center",
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 p-8 flex flex-col min-h-[240px]">

          {/* Top row: tag + icon */}
          <div className="flex items-start justify-between mb-7">
            <div className="flex flex-col gap-2">
              <motion.span
                className="inline-flex items-center text-[9px] font-black uppercase tracking-[0.22em] px-3 py-1.5 rounded-full w-fit"
                animate={{
                  backgroundColor: hovered ? doc.accent : "#f3f4f6",
                  color: hovered ? "#fff" : "#9ca3af",
                }}
                transition={{ duration: 0.3 }}
              >
                {doc.tag}
              </motion.span>

              {/* Live stat counter */}
              <motion.div
                className="flex items-baseline gap-1"
                animate={{ opacity: hovered ? 1 : 0.35 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-2xl font-black tabular-nums" style={{ color: doc.accent }}>
                  <Counter to={parseInt(doc.stat)} delay={0.08 + index * 0.1} />
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{doc.statLabel}</span>
              </motion.div>
            </div>

            {/* Icon orb */}
            <motion.div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
              animate={{
                backgroundColor: hovered ? doc.accent : "#fff7ed",
                boxShadow: hovered
                  ? `0 20px 60px -8px ${doc.accent}55, 0 0 0 1px ${doc.accent}22`
                  : "0 2px 12px 0 rgba(249,115,22,0.06)",
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                animate={{ rotate: hovered ? 10 : 0, scale: hovered ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <Icon className="w-7 h-7 transition-colors duration-300"
                  style={{ color: hovered ? "#fff" : doc.accent }} />
              </motion.div>

              {/* Orbiting sparkle */}
              <motion.div
                className="absolute"
                animate={hovered
                  ? { rotate: [0, 360], opacity: 1 }
                  : { opacity: 0 }}
                transition={{ rotate: { duration: 2.5, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.2 } }}
                style={{ top: -8, right: -8, originX: "32px", originY: "32px" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </motion.div>
            </motion.div>
          </div>

          {/* Text block */}
          <div className="flex-1 space-y-2">
            <motion.h3
              className="text-[1.35rem] font-black text-gray-900 leading-tight tracking-tight"
              animate={{ x: hovered ? 3 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {doc.title}
            </motion.h3>
            <p className="text-sm text-gray-400 leading-relaxed">{doc.description}</p>
          </div>

          {/* CTA */}
          <div className="mt-7 flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2.5 text-[13px] font-black uppercase tracking-[0.12em]"
              animate={{ color: hovered ? doc.accent : "#d1d5db" }}
              transition={{ duration: 0.25 }}
            >
              <span>Abrir registo</span>
              <motion.div
                animate={{ x: hovered ? 6 : 0, scale: hovered ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.div>

            {/* Ghost index */}
            <motion.span
              className="text-[4.5rem] font-black tabular-nums leading-none select-none pointer-events-none"
              animate={{ color: hovered ? `${doc.accent}20` : "#f3f4f6", x: hovered ? -4 : 0 }}
              transition={{ duration: 0.35 }}
            >
              0{index + 1}
            </motion.span>
          </div>
        </div>

        {/* ── Bottom glow bar ── */}
        <motion.div
          className="absolute bottom-0 left-8 right-8 h-px"
          animate={{ opacity: hovered ? 1 : 0, scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: `linear-gradient(90deg, transparent, ${doc.accent}99, transparent)` }}
        />

        {/* ── Drop shadow expansion ── */}
        <motion.div
          className="absolute inset-0 rounded-3xl -z-10"
          animate={{
            boxShadow: hovered
              ? `0 32px 80px -12px ${doc.accent}30, 0 8px 32px -4px ${doc.accent}15`
              : "0 2px 16px 0 rgba(0,0,0,0.04)",
          }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   ANIMATED WORD REVEAL — splits text into chars
══════════════════════════════════════════════════ */
function RevealText({ text, className, delay = 0, gradient = false }: {
  text: string; className?: string; delay?: number; gradient?: boolean;
}) {
  const words = text.split(" ");
  return (
    <span className={`${className} inline-flex flex-wrap gap-x-[0.3em]`} aria-label={text}>
      {words.map((word, wi) => (
        <motion.span
          key={wi}
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + wi * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={gradient
            ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400"
            : ""
          }
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════════
   TICKER STRIP
══════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  "· Aconselhamentos",
  "· Chamadas",
  "· Entradas & Saídas",
  "· Internamentos",
  "· Registos Automáticos",
  "· Histórico Completo",
];

function Ticker() {
  return (
    <div className="overflow-hidden h-8 flex items-center mb-10 -mx-6">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{item}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function DashDocumentos() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) setEmail(storedEmail);
    else router.push("/login");
  }, [router]);

  return (
    <>
      <Header />

      {/* ── Layered background ── */}
      <div className="fixed inset-0 bg-[#fafaf8]" />
      <MeshBackground />

      {/* Fine grid */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      <div className="relative min-h-screen">
        <main className="max-w-5xl mx-auto px-6 py-10">

          {/* ── Page header ── */}
          <div className="mb-10">

            {/* Back + breadcrumb */}
            <motion.div
              className="flex items-center gap-3 mb-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Button asChild variant="ghost" size="icon"
                className="w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white hover:shadow-sm transition-all">
                <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                <span>Dashboard</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
                <span className="text-gray-700 font-bold">Documentos</span>
              </div>
            </motion.div>

            {/* Eyebrow + icon */}
            <div className="flex items-center gap-3.5 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 18 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-200/60"
              >
                <FileText className="w-5 h-5 text-white" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400"
              >
                Centro de documentos
              </motion.span>
            </div>

            {/* Hero heading */}
            <div className="flex items-end justify-between flex-wrap gap-6 mb-8">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-gray-900">
                <RevealText text="O que pretende" delay={0.1} />
                <br />
                <RevealText text="registar hoje?" delay={0.25} gradient />
              </h1>

              {email && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 24 }}
                  className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-black text-white">{email[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Sessão ativa</span>
                    <span className="text-sm font-bold text-gray-700 max-w-[150px] truncate">{email}</span>
                  </div>
                  <motion.div
                    className="w-2 h-2 rounded-full bg-emerald-400 ml-1"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              )}
            </div>

            {/* Animated divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="h-px bg-gradient-to-r from-orange-300 via-amber-200 to-transparent origin-left"
            />
          </div>

          {/* ── Ticker ── */}
          <Ticker />

          {/* ── Cards grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {documentOptions.map((doc, i) => (
              <DocCard key={doc.title} doc={doc} index={i} onClick={() => router.push(doc.route)} />
            ))}
          </div>

          {/* ── Footer ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex items-center justify-center gap-3 mt-14"
          >
            <motion.div
              className="h-px w-12 bg-gradient-to-r from-transparent to-orange-200"
            />
            <p className="text-xs text-gray-300 font-medium tracking-wide">
              Todos os registos são guardados automaticamente
            </p>
            <motion.div
              className="h-px w-12 bg-gradient-to-l from-transparent to-orange-200"
            />
          </motion.div>

        </main>
      </div>
    </>
  );
}