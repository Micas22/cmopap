"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowLeft, FileText, CheckCircle, FileCheck, ChevronRight, UserCheck, Phone, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

/* ── Tilt card hook ─────────────────────────────────────────── */
function useTilt() {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };

  return { ref, springX, springY, onMouseMove, onMouseLeave };
}

/* ── Document options ───────────────────────────────────────── */
const documentOptions = [
  {
    title: "Registo de Aconselhamentos",
    icon: FileCheck,
    route: "/dashdocumentos/aconselhamento",
    accent: "#f97316",
    accentLight: "#fff7ed",
    tag: "Consultoria",
    description: "Registe e acompanhe todos os aconselhamentos.",
  },
  {
    title: "Registo de Chamadas",
    icon: Phone,
    route: "/dashdocumentos/chamadas",
    accent: "#f97316",
    accentLight: "#fff7ed",
    tag: "Comunicação",
    description: "Histórico completo de chamadas recebidas e efetuadas.",
  },
  {
    title: "Entradas e Saídas",
    icon: CheckCircle,
    route: "/dashdocumentos/registoensai",
    accent: "#f97316",
    accentLight: "#fff7ed",
    tag: "Controlo",
    description: "Monitorize e registe todas as entradas e saídas em tempo real.",
  },
  {
    title: "Ficha de Internamento",
    icon: UserCheck,
    route: "/dashdocumentos/internamento",
    accent: "#f97316",
    accentLight: "#fff7ed",
    tag: "Clínico",
    description: "Crie fichas completas de internamento com plano de medicações.",
  },
];

/* ── Card component ─────────────────────────────────────────── */
function DocCard({ doc, index, onClick }: { doc: typeof documentOptions[0]; index: number; onClick: () => void }) {
  const { ref, springX, springY, onMouseMove, onMouseLeave } = useTilt();
  const Icon = doc.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
        onMouseEnter={() => setHovered(true)}
        style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
        className="group relative w-full text-left overflow-hidden rounded-3xl bg-white border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-orange-100/60 transition-shadow duration-500 cursor-pointer"
      >
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

        {/* Animated radial fill on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: `radial-gradient(ellipse at 20% 50%, ${doc.accentLight} 0%, transparent 70%)` }}
        />

        {/* Top shimmer line */}
        <motion.div
          className="absolute top-0 left-6 right-6 h-px"
          animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: `linear-gradient(90deg, transparent, ${doc.accent}, transparent)`, transformOrigin: "center" }}
        />

        <div className="relative p-8 flex flex-col min-h-[220px]">
          {/* Tag + icon row */}
          <div className="flex items-start justify-between mb-7">
            <motion.span
              className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full"
              animate={{
                backgroundColor: hovered ? doc.accent : "#f3f4f6",
                color: hovered ? "#fff" : "#9ca3af",
              }}
              transition={{ duration: 0.3 }}
            >
              {doc.tag}
            </motion.span>

            <motion.div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              animate={{
                backgroundColor: hovered ? doc.accent : doc.accentLight,
                boxShadow: hovered ? `0 12px 32px -4px ${doc.accent}55` : "0 0 0 0 transparent",
              }}
              transition={{ duration: 0.35 }}
            >
              <motion.div animate={{ rotate: hovered ? 8 : 0, scale: hovered ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Icon className="w-6 h-6" style={{ color: hovered ? "#fff" : doc.accent }} />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.4, rotate: hovered ? 0 : -20 }}
                transition={{ duration: 0.2, delay: hovered ? 0.1 : 0 }}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
              </motion.div>
            </motion.div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-2 tracking-tight">{doc.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{doc.description}</p>
          </div>

          {/* CTA row */}
          <div className="mt-6 flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2 text-sm font-bold"
              animate={{ color: hovered ? doc.accent : "#d1d5db" }}
              transition={{ duration: 0.25 }}
            >
              <span>Abrir registo</span>
              <motion.div animate={{ x: hovered ? 5 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.div>

            {/* Ghost number */}
            <span className="text-5xl font-black tabular-nums leading-none select-none pointer-events-none transition-colors duration-300"
              style={{ color: hovered ? `${doc.accent}1a` : "#f3f4f6" }}>
              0{index + 1}
            </span>
          </div>
        </div>

        {/* Bottom glow line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: `linear-gradient(90deg, transparent, ${doc.accent}88, transparent)` }}
        />
      </motion.button>
    </motion.div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
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

      <div className="min-h-screen bg-[#fafaf9]">
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #f97316, transparent 70%)", transform: "translate(35%, -35%)" }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.035]"
            style={{ background: "radial-gradient(circle, #fb923c, transparent 70%)", transform: "translate(-30%, 30%)" }} />
        </div>

        <main className="relative max-w-5xl mx-auto px-6 py-10">

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            {/* Back + breadcrumb */}
            <div className="flex items-center gap-3 mb-8">
              <Button asChild variant="ghost" size="icon"
                className="w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white hover:shadow-sm transition-all">
                <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <span>Dashboard</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-700 font-bold">Documentos</span>
              </div>
            </div>

            {/* Hero text + user pill */}
            <div className="flex items-end justify-between flex-wrap gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-200"
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-xs font-black uppercase tracking-[0.2em] text-orange-400"
                  >
                    Centro de documentos
                  </motion.span>
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none"
                >
                  O que pretende
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                    registar hoje?
                  </span>
                </motion.h1>
              </div>

              {email && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center">
                    <span className="text-xs font-black text-white">{email[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 max-w-[160px] truncate">{email}</span>
                </motion.div>
              )}
            </div>

            {/* Animated divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 h-px bg-gradient-to-r from-orange-200 via-amber-100 to-transparent origin-left"
            />
          </motion.div>

          {/* ── Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {documentOptions.map((doc, i) => (
              <DocCard key={doc.title} doc={doc} index={i} onClick={() => router.push(doc.route)} />
            ))}
          </div>

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="text-center text-xs text-gray-300 font-medium mt-12 tracking-wide"
          >
            Selecione um módulo para começar · Todos os registos são guardados automaticamente
          </motion.p>
        </main>
      </div>
    </>
  );
}