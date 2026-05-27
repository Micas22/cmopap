"use client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Header from "@/components/Header";
import {
  PawPrint, Heart, ShieldCheck, Stethoscope, BookOpen,
  MapPin, Phone, Mail, Clock, Users, Syringe, Search,
  Dog, Cat, ArrowRight, CheckCircle2, ChevronRight,
  Home
} from "lucide-react";

const SERVICES = [
  {
    icon: PawPrint,
    title: "Controlo de Animais",
    desc: "Captura, alojamento e tratamento de animais errantes ou abandonados na via pública do concelho de Olhão.",
    color: "from-orange-400 to-amber-500",
  },
  {
    icon: Heart,
    title: "Adoção Responsável",
    desc: "Promoção ativa da adoção de cães e gatos recolhidos nas nossas instalações, garantindo que cada animal encontra a família certa.",
    color: "from-rose-400 to-pink-500",
  },
  {
    icon: Syringe,
    title: "Cuidados Clínicos",
    desc: "Vacinação antirrábica municipal, identificação eletrónica (microchipagem) e acompanhamento clínico de todos os animais.",
    color: "from-teal-400 to-emerald-500",
  },
  {
    icon: ShieldCheck,
    title: "Fiscalização e Licenças",
    desc: "Inspeção higiossanitária de mercados, vistoria a viaturas alimentares e licenciamento de clínicas veterinárias, hotéis e lojas de animais.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: BookOpen,
    title: "Educação Comunitária",
    desc: "Campanhas educativas junto da comunidade escolar e da população local para promover o respeito, a proteção animal e a posse responsável.",
    color: "from-purple-400 to-fuchsia-500",
  },
  {
    icon: Search,
    title: "Gestão SICAFE",
    desc: "Atualização e gestão do Sistema de Identificação de Canídeos e Felinos, assegurando o rastreamento de todos os animais registados no município.",
    color: "from-amber-400 to-yellow-500",
  },
];

const STATS = [
  { value: "182+", label: "Adoções Responsáveis" },
  { value: "1 675", label: "Esterilizações" },
  { value: "275", label: "Animais Acolhidos" },
  { value: "1 194", label: "Consultas Realizadas" },
];

const CAPACITY = [
  { icon: Dog, label: "Cães (canídeos)", value: "150" },
  { icon: Cat, label: "Gatos (felinos)", value: "60" },
  { icon: PawPrint, label: "Equídeos", value: "3" },
];

const HOURS = [
  { period: "Funcionamento Geral", schedule: "Segunda a Sexta-feira, 09:00 – 17:00" },
  { period: "Visitas e Adoções", schedule: "Segunda a Sexta-feira, 09:00 – 12:00" },
  {
    period: "Aconselhamento Veterinário",
    schedule: "Segunda, Quarta e Sexta, 11:00 – 12:30 (máx. 7 animais/dia)",
  },
];

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutUs() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <Header />

      <main className="min-h-screen w-full bg-[#FAFAFA] text-gray-800 overflow-hidden font-sans">

        {/* ── HERO ── */}
        <section
          ref={heroRef}
          className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-orange-500"
        >
          {/* Dynamic Background */}
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0">
            {/* Base Image/Color */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500" />

            {/* Animated Orbs */}
            <motion.div
              className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-orange-500/20 blur-[120px] mix-blend-screen"
              animate={{ x: [0, 100, 0], y: [0, 80, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-[20%] right-[-10%] h-[700px] w-[700px] rounded-full bg-amber-500/20 blur-[120px] mix-blend-screen"
              animate={{ x: [0, -120, 0], y: [0, -100, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
          </motion.div>

          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-orange-300 text-xs font-bold tracking-[0.2em] uppercase px-5 py-2 rounded-full mb-8 border border-white/10 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
            >
              <PawPrint size={14} className="animate-pulse" />
              O Nosso Propósito
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 leading-[1.1] tracking-tight mb-8"
            >
              Uma Segunda Vida<br />Para Cada Animal
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/70 text-lg md:text-2xl leading-relaxed max-w-2xl font-light"
            >
              O Centro de Recolha Oficial de Animais de Olhão é dedicado ao bem-estar animal,
              saúde pública e adoção responsável no nosso concelho.
            </motion.p>
          </motion.div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAFAFA] to-transparent z-10" />
        </section>

        <div className="max-w-7xl mx-auto px-6 py-24 space-y-40 relative z-20 -mt-10">

          {/* ── STATS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {STATS.map((stat, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="bg-white rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center group hover:-translate-y-2 transition-all duration-500 ease-out hover:shadow-[0_20px_40px_rgb(234,88,12,0.08)]">
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 + i * 0.1 }}
                    className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 tracking-tighter mb-2"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* ── WHO WE ARE ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24 items-center">
            <FadeUp>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-orange-100 to-amber-50 rounded-[3rem] -z-10 blur-2xl opacity-50" />
                <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <PawPrint size={200} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] mb-6 relative z-10">
                    A Nossa Missão em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Olhão</span>
                  </h2>
                  <div className="w-20 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-8 relative z-10" />
                  <p className="text-gray-500 text-lg leading-relaxed relative z-10 font-medium">
                    Integrado nos Serviços Veterinários do Município, o CROA atua na linha da frente para promover a adoção responsável, combater o abandono e garantir que todos os animais recebem os cuidados de que necessitam.
                  </p>
                </div>
              </div>
            </FadeUp>

            <div className="space-y-8">
              {[
                {
                  title: "Bem-estar Animal & Saúde Pública",
                  desc: "Somos o organismo municipal responsável pela salvaguarda da saúde pública e controlo da população animal errante no concelho de Olhão.",
                },
                {
                  title: "Instalações de Excelência",
                  desc: "As nossas instalações em Quelfes representam um investimento municipal de cerca de 1,1 milhões de euros, concebidas para maximizar o conforto, segurança e bem-estar dos animais.",
                },
                {
                  title: "Uma Segunda Oportunidade",
                  desc: "Trabalhamos diariamente para encontrar famílias responsáveis. Além disso, a nossa equipa desenvolve ações de educação nas escolas, promovendo uma cultura de respeito.",
                },
              ].map((item, i) => (
                <FadeUp key={i} delay={i * 0.15} className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-500 shadow-sm border border-orange-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors duration-300">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* ── CAPACITY + FOCUS (Glassmorphism) ── */}
          <FadeUp>
            <div className="relative rounded-[3rem] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

              {/* Decorative blurs */}
              <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-orange-500/30 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />

              <div className="relative z-10 p-12 md:p-20 lg:p-24 flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/3">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-orange-300 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6 border border-white/10">
                    <Home size={14} /> Instalações
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                    Capacidade de Acolhimento
                  </h3>
                  <p className="text-white/60 text-lg mb-8 leading-relaxed">
                    Com um espaço amplo e moderno no Sítio da Alecrineira, estamos preparados para cuidar e albergar dezenas de animais com todo o conforto necessário.
                  </p>
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white/80">
                    <MapPin size={24} className="text-orange-400 shrink-0" />
                    <span className="font-medium text-sm">Sítio da Alecrineira, EM516, Quelfes, 8700 Olhão</span>
                  </div>
                </div>

                <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                  {CAPACITY.map((cap, i) => {
                    const Icon = cap.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                        className="bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all duration-300 rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center group/card"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover/card:scale-110 transition-transform duration-500 border border-white/20">
                          <Icon size={32} className="text-white" />
                        </div>
                        <span className="text-5xl font-black text-white tabular-nums mb-3">{cap.value}</span>
                        <span className="text-white/60 text-sm font-bold uppercase tracking-widest">{cap.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* ── SERVICES GRID ── */}
          <div className="space-y-16">
            <FadeUp className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                O Que Fazemos
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                A nossa atuação vai muito além do acolhimento. Trabalhamos ativamente em diversas frentes para garantir a segurança pública e a saúde animal no concelho.
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {SERVICES.map((svc, i) => {
                const Icon = svc.icon;
                return (
                  <FadeUp key={i} delay={i * 0.1}>
                    <div className="bg-white rounded-[2rem] border border-gray-100/60 p-8 h-full hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-2xl" />
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${svc.color} flex items-center justify-center mb-6 text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 mb-4">{svc.title}</h3>
                      <p className="text-gray-500 leading-relaxed font-medium">{svc.desc}</p>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>

          {/* ── ADOPTION PROCESS (Tabs/Timeline) ── */}
          <FadeUp>
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6 border border-white/30">
                    Passo a Passo
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
                    Como adotar um novo amigo?
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed mb-10">
                    O nosso processo de adoção é simples, transparente e focado no bem-estar do animal a longo prazo. Garantimos que todos os animais saem prontos para uma nova vida.
                  </p>

                  <div className="space-y-4">
                    {[
                      "Período legal de salvaguarda de 15 dias",
                      "Avaliação clínica e comportamental rigorosa",
                      "Entrega com microchip e vacinas em dia",
                      "Processo 100% gratuito e acompanhado"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white font-medium">
                        <CheckCircle2 size={20} className="text-white" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-white/30 rounded-full" />

                  <div className="space-y-8 relative">
                    {[
                      { step: "01", title: "Recolha e Salvaguarda", desc: "Aguardamos 15 dias legais para que o proprietário original possa reclamar o animal." },
                      { step: "02", title: "Avaliação Clínica", desc: "A nossa equipa veterinária assegura que o animal se encontra em perfeitas condições de saúde." },
                      { step: "03", title: "Visita e Afinidade", desc: "Visite-nos de segunda a sexta, conheça os animais e encontre o seu companheiro ideal." },
                      { step: "04", title: "Nova Família", desc: "O animal sai com chip, vacina antirrábica e boletim de saúde, pronto para ser feliz." },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 relative group">
                        <div className="w-14 h-14 rounded-full bg-white/20 border-4 border-orange-400 flex items-center justify-center flex-shrink-0 relative z-10 group-hover:bg-white group-hover:border-white transition-all duration-300">
                          <span className="text-white font-black text-sm group-hover:text-orange-500">{item.step}</span>
                        </div>
                        <div className="pt-3">
                          <h4 className="text-xl font-bold text-white mb-2 group-hover:text-white/80 transition-colors">{item.title}</h4>
                          <p className="text-white/80 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* ── HOURS & CONTACTS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeUp>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 md:p-14 h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <Clock size={200} />
                </div>

                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-8">
                  <Clock size={32} className="text-orange-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-8">Horários</h3>

                <div className="space-y-6 relative z-10">
                  {HOURS.map((h, i) => (
                    <div key={i} className="group/item">
                      <p className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ChevronRight size={14} className="opacity-0 -ml-4 group-hover/item:opacity-100 group-hover/item:ml-0 transition-all text-orange-400" />
                        {h.period}
                      </p>
                      <p className="text-gray-600 text-lg font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">{h.schedule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2.5rem] p-10 md:p-14 h-full relative overflow-hidden text-white shadow-xl shadow-orange-500/20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:30px_30px]" />

                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 relative z-10 border border-white/20">
                  <Users size={32} className="text-white" />
                </div>
                <h3 className="text-3xl font-black text-white mb-8 relative z-10">Contactos</h3>

                <div className="space-y-6 relative z-10">
                  <a href="tel:+351912289880" className="flex items-center gap-5 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-sm group">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Telemóvel CROA</p>
                      <p className="font-mono text-xl font-bold">+351 912 289 880</p>
                    </div>
                  </a>

                  <a href="tel:+351289700100" className="flex items-center gap-5 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-sm group">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Câmara Municipal de Olhão</p>
                      <p className="font-mono text-xl font-bold">+351 289 700 100</p>
                    </div>
                  </a>

                  <a href="mailto:servicosveterinarios@cm-olhao.pt" className="flex items-center gap-5 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-sm group">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Email</p>
                      <p className="font-bold text-lg truncate">servicosveterinarios@cm-olhao.pt</p>
                    </div>
                  </a>
                </div>
              </div>
            </FadeUp>
          </div>

        </div>
      </main>
    </>
  );
}