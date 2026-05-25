"use client";
import { Phone, Mail, MapPin, Facebook, Instagram, X, PawPrint, Heart, ArrowUp, ArrowRight, Stethoscope, CalendarDays } from "lucide-react";
import { motion, useMotionValue, useTransform, animate, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Link from "next/link";

const ShelterMap = dynamic(() => import("@/components/ShelterMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-orange-50 flex flex-col items-center justify-center gap-3 rounded-3xl">
      <div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-orange-400 text-sm font-medium">A carregar mapa...</p>
    </div>
  ),
});

// ─── Grain texture ────────────────────────────────────────────────────────────
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  img, title, target, index,
}: {
  img: string; title: string; target: number; index: number;
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) animate(count, target, { duration: 2.2, ease: "easeOut", delay: index * 0.1 });
  }, [isInView, count, target, index]);

  return (
    <motion.div
      ref={ref}
      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col items-center justify-center py-8 px-4 group cursor-default"
      initial={{ y: 40, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(234,88,12,0.12)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-orange-100 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
      </div>
      <div className="bg-orange-50 group-hover:bg-orange-100 transition-colors duration-300 p-4 rounded-2xl mb-5">
        <motion.img
          src={`/${img}`} alt={title}
          className="w-12 h-12 object-contain"
          animate={isInView ? { rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.6, delay: index * 0.12 + 0.4 }}
        />
      </div>
      <motion.span className="text-5xl font-extrabold text-gray-800 mb-2 leading-none tabular-nums">
        {rounded}
      </motion.span>
      <span className="uppercase text-xs font-bold tracking-widest text-orange-500 text-center leading-tight mt-1">
        {title}
      </span>
    </motion.div>
  );
};

// ─── Animal card skeleton ─────────────────────────────────────────────────────
const AnimalSkeleton = ({ i }: { i: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: i * 0.06 }}
    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
  >
    <div className="h-48 bg-gray-100 animate-pulse" />
    <div className="px-4 pb-4 pt-3 space-y-2">
      <div className="h-4 bg-gray-100 rounded-full animate-pulse w-2/3" />
      <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/2" />
    </div>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const [recentAnimals, setRecentAnimals] = useState<any[]>([]);
  const [animalsLoading, setAnimalsLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [stats, setStats] = useState({ residentes: 0, colonias: 0, esterilizados: 0, errantes: 0, acolhimento: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch animals
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/animals?limit=8");
        if (res.ok) setRecentAnimals(await res.json());
      } catch (e) { console.error(e); }
      finally { setAnimalsLoading(false); }
    })();
  }, []);

  // Fetch stats
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch { /* fall back to 0s */ }
    })();
  }, []);

  // Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const statItems: [string, string, number][] = [
    ["Ativo1.png", "Residentes", stats.residentes],
    ["Ativo4.png", "Em Colónias", stats.colonias],
    ["Ativo5.png", "Esterilizados", stats.esterilizados],
    ["Ativo6.png", "Errantes", stats.errantes],
    ["Ativo7.png", "Acolhimento", stats.acolhimento],
  ];

  return (
    <>
      <Header />

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-[88vh] flex items-center bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 overflow-hidden">
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: "128px" }} />

        {/* Decorative rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-[600px] h-[600px] border-[60px] border-white/[0.06] rounded-full" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-48 -left-24 w-[500px] h-[500px] border-[45px] border-white/[0.06] rounded-full" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/3 w-[300px] h-[300px] border-[25px] border-white/[0.04] rounded-full" />
        </div>

        {/* Scattered paw prints */}
        {[
          { top: "12%", left: "8%", size: 28, rot: -15, op: 0.12 },
          { top: "70%", left: "14%", size: 20, rot: 20, op: 0.09 },
          { top: "25%", right: "6%", size: 24, rot: 10, op: 0.10 },
          { top: "60%", right: "9%", size: 32, rot: -8, op: 0.08 },
          { top: "45%", left: "48%", size: 18, rot: 30, op: 0.07 },
        ].map((p, i) => (
          <motion.div
            key={i}
            style={{ position: "absolute", top: p.top, left: (p as any).left, right: (p as any).right, rotate: p.rot, opacity: p.op }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
          >
            <PawPrint size={p.size} color="white" />
          </motion.div>
        ))}

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left: copy */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/25"
            >
              <PawPrint size={11} /> Centro de Recolha Oficial de Animais
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            >
              Um lar para<br />
              <span className="text-amber-200">cada animal</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="text-white/80 text-lg leading-relaxed max-w-md mb-10"
            >
              O CROA de Olhão dedica-se ao bem-estar, esterilização e adoção responsável de animais errantes e abandonados no concelho.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="#animals"
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-black/10 hover:bg-orange-50 active:scale-[.98] transition-all duration-200 text-sm"
              >
                <Heart size={15} /> Conhecer os Animais
              </Link>
              <Link
                href="#map"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-6 py-3.5 rounded-2xl border border-white/30 hover:bg-white/25 active:scale-[.98] transition-all duration-200 text-sm"
              >
                <MapPin size={15} /> Ver Colónias
              </Link>
            </motion.div>
          </div>

          {/* Right: floating stat pills */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex flex-col gap-4 items-start pl-8"
          >
            {statItems.map(([img, label, val], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-3.5 w-64"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <img src={`/${img}`} alt={label} className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-2xl leading-none tabular-nums">{val}</p>
                  <p className="text-white/65 text-xs font-semibold uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 80V40C240 0 480 0 720 30C960 60 1200 70 1440 50V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="w-full bg-gradient-to-b from-white to-orange-50/40 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[5%] w-[350px] h-[350px] bg-orange-200/15 rounded-full blur-3xl" />
          <div className="absolute top-[30%] -right-[5%] w-[400px] h-[400px] bg-amber-300/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              Em Números
            </span>
            <h2 className="text-3xl font-extrabold text-gray-800">O nosso CROA em Estatísticas</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {statItems.map(([img, title, target], i) => (
              <StatCard key={i} img={img} title={title} target={target} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ MAP ══════════════ */}
      <section id="map" className="py-24 bg-white relative">
        {/* Subtle section divider top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-100 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
                Rede de Apoio
              </span>
              <h2 className="text-3xl font-extrabold text-gray-800 leading-tight">
                Rede de Colónias
              </h2>
            </motion.div>
            <motion.p
              className="text-gray-500 max-w-sm lg:text-right text-sm leading-relaxed"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Explore a nossa rede de colónias felinas em Olhão. Clique nos marcadores para mais detalhes.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-3 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-[32px] blur-xl" />
            <div className="relative h-[580px] w-full rounded-3xl shadow-2xl border-4 border-white overflow-hidden z-0">
              <ShelterMap />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ RECENT ANIMALS ══════════════ */}
      <section id="animals" className="py-24 bg-gray-50 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
            initial={{ y: -16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
                Novos Amigos
              </span>
              <h2 className="text-3xl font-extrabold text-gray-800">Recém Chegados</h2>
            </div>
            <p className="text-gray-400 text-sm">Clique num animal para ver mais detalhes</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {animalsLoading
              ? Array.from({ length: 8 }).map((_, i) => <AnimalSkeleton key={i} i={i} />)
              : recentAnimals.length === 0
                ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                    <PawPrint size={36} className="text-orange-200" />
                    <p className="text-sm font-medium">Nenhum animal registado ainda</p>
                  </div>
                )
                : recentAnimals.map((pet: any, i: number) => (
                  <motion.div
                    key={pet.id}
                    onClick={() => setSelectedAnimal(pet)}
                    initial={{ y: 24, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300 cursor-pointer overflow-hidden group"
                  >
                    <div className="relative h-48 overflow-hidden bg-orange-50">
                      <img
                        src={pet.image || "/placeholder.png"}
                        alt={pet.nome}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                        <img src={pet.sex === 1 ? "/male.png" : "/female.png"} alt="sex" className="w-4 h-4 object-contain" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                    </div>
                    <div className="px-4 pb-4 pt-2">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-500 transition-colors duration-200">
                        {pet.nome}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors px-2.5 py-1 rounded-full">
                          {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString("pt-PT") : "Recente"}
                        </span>
                        <span className="text-xs font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide uppercase flex items-center gap-1">
                          Ver mais <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* ══════════════ ADOPTION CTA ══════════════ */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-0 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-6">
              <Heart size={28} className="text-orange-500" />
            </div>
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4 leading-tight">
              Pronto para dar um lar<br />a um novo amigo?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              A adoção transforma duas vidas. Contacte-nos e descubra o companheiro perfeito à sua espera no CROA Olhão.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a
                href="tel:+351912289880"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/25 transition-all duration-200 text-sm"
              >
                <Phone size={15} /> Ligar Agora
              </motion.a>
              <motion.a
                href="mailto:servicosveterinarios@cm-olhao.pt"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 bg-white text-gray-700 font-semibold px-8 py-4 rounded-2xl shadow-lg border border-gray-200 hover:border-orange-200 hover:text-orange-600 transition-all duration-200 text-sm"
              >
                <Mail size={15} /> Enviar Email
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <motion.section
        className="relative bg-gradient-to-br from-orange-600 to-amber-500 text-white py-20 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } }}
      >
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: "128px" }} />
        {/* Rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] border-[40px] border-white/10 rounded-full blur-sm" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[15%] -left-[8%] w-[400px] h-[400px] border-[25px] border-white/10 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div className="space-y-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <h2 className="text-2xl font-bold uppercase tracking-wider border-b-2 border-white/30 pb-2 inline-block">
              Contactos Úteis
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Estamos aqui para ajudar. Entre em contacto connosco para qualquer dúvida ou questão sobre os nossos amigos de quatro patas.
            </p>
          </motion.div>

          {/* Phones */}
          <motion.div className="space-y-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-white/20 pb-2">
              <Phone className="w-5 h-5" /> Telefones
            </h3>
            <div className="space-y-4 text-white/90">
              {[
                { label: "Câmara Municipal", number: "+351 289 700 100" },
                { label: "Contacto CROA", number: "+351 912 289 880" },
              ].map(({ label, number }) => (
                <motion.a key={label} href={`tel:${number.replace(/\s/g, "")}`}
                  className="block group" whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
                  <p className="text-xs uppercase opacity-60 tracking-wider mb-0.5">{label}</p>
                  <p className="font-mono text-lg font-semibold group-hover:text-white transition-colors">{number}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Location & Email */}
          <motion.div className="space-y-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-white/20 pb-2">
              <MapPin className="w-5 h-5" /> Localização
            </h3>
            <div className="text-white/85 text-sm space-y-0.5 leading-relaxed">
              <p>Sítio da Alecrineira EMS16</p>
              <p>Quelfes, Olhão</p>
            </div>
            <h3 className="font-bold text-lg flex items-center gap-2 pt-2 border-b border-white/20 pb-2">
              <Mail className="w-5 h-5" /> Email
            </h3>
            <a href="mailto:servicosveterinarios@cm-olhao.pt"
              className="block text-white/85 hover:text-white transition-colors text-sm break-words underline decoration-white/30 hover:decoration-white">
              servicosveterinarios@cm-olhao.pt
            </a>
          </motion.div>

          {/* Socials */}
          <motion.div className="space-y-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <h3 className="font-bold text-lg border-b border-white/20 pb-2">Redes Sociais</h3>
            <p className="text-white/70 text-sm">Siga-nos para as últimas novidades dos nossos animais.</p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
              ].map(({ icon: Icon, label }) => (
                <motion.a key={label} href="#"
                  whileHover={{ y: -4, scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm p-3 rounded-xl flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:block">{label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative z-10 mt-16 pt-8 border-t border-white/20 text-center text-xs text-white/55"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          <p>&copy; {new Date().getFullYear()} CROA Olhão · Todos os direitos reservados</p>
        </motion.div>
      </motion.section>

      {/* ══════════════ SCROLL TO TOP ══════════════ */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center hover:shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all duration-200"
            aria-label="Voltar ao topo"
          >
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ══════════════ ANIMAL MODAL ══════════════ */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedAnimal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 32 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 32 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative"
            >
              <button
                onClick={() => setSelectedAnimal(null)}
                className="absolute top-4 right-4 p-2 bg-black/25 hover:bg-black/50 text-white rounded-full transition-colors z-20 backdrop-blur-md"
              >
                <X size={18} />
              </button>

              {/* Image */}
              <div className="h-72 relative overflow-hidden">
                <motion.img
                  src={selectedAnimal.image || "/placeholder.png"}
                  alt={selectedAnimal.nome}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full px-6 pb-6">
                  <h3 className="text-4xl font-bold text-white mb-2 leading-tight">{selectedAnimal.nome}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-orange-500/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                      {selectedAnimal.sex === 1 ? "Macho" : "Fêmea"}
                    </span>
                    {selectedAnimal.esterilizado && (
                      <span className="bg-green-500/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        Esterilizado
                      </span>
                    )}
                    <span className="text-white/60 text-sm">#{selectedAnimal.id}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                {selectedAnimal.chip && (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                    <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Stethoscope size={10} /> Número do Chip
                    </p>
                    <p className="font-mono text-gray-800 font-bold text-xl tracking-wide">{selectedAnimal.chip}</p>
                  </div>
                )}
                {selectedAnimal.createdAt && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <CalendarDays size={10} /> Data de Entrada
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {new Date(selectedAnimal.createdAt).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                )}
                {selectedAnimal.notas && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Notas</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedAnimal.notas}</p>
                  </div>
                )}
                <motion.a
                  href="tel:+351912289880"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 text-sm mt-2"
                >
                  <Heart size={14} /> Interessado em Adotar?
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}