"use client";
import { Phone, Mail, MapPin, Facebook, Instagram, X } from "lucide-react";
import { motion, useMotionValue, useTransform, animate, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";

const ShelterMap = dynamic(() => import("@/components/ShelterMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-orange-50 flex flex-col items-center justify-center gap-3 rounded-3xl">
      <div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-orange-400 text-sm font-medium">A carregar mapa...</p>
    </div>
  ),
});

/* ─────────────────── STAT CARD ─────────────────── */
const StatCard = ({ img, title, index }: { img: string; title: string; index: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) animate(count, 100, { duration: 2.5, ease: "easeOut", delay: index * 0.12 });
  }, [isInView, count, index]);

  return (
    <motion.div
      ref={ref}
      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col items-center justify-center py-8 px-4 group cursor-default"
      initial={{ y: 40, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(234,88,12,0.12)" }}
    >
      {/* Top accent bar that fills on hover */}
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
          src={`/${img}`}
          alt={title}
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

/* ─────────────────── PAGE ─────────────────── */
export default function Page() {
  const [recentAnimals, setRecentAnimals] = useState<any[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/animals?limit=8");
        if (res.ok) setRecentAnimals(await res.json());
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <>
      {/* ══════════════ HEADER ══════════════ */}
      <Header />

      {/* ══════════════ STATS ══════════════ */}
      <section className="w-full bg-gradient-to-b from-gray-50 to-orange-50/40 py-20 relative overflow-hidden">
        {/* Blobs */}
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
            {[
              ["ativo1.png", "Residentes"],
              ["ativo4.png", "Em Colónias"],
              ["ativo5.png", "Esterilizados"],
              ["ativo6.png", "Errantes"],
              ["ativo7.png", "Acolhimento"],
            ].map(([img, title], i) => (
              <StatCard key={i} img={img} title={title} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ MAP ══════════════ */}
      <section className="py-24 bg-white relative">
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
                Rede de Abrigos
              </h2>
            </motion.div>
            <motion.p
              className="text-gray-500 max-w-sm lg:text-right"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Explore a nossa rede de abrigos e colónias em Olhão.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Orange glow behind map */}
            <div className="absolute -inset-3 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-[32px] blur-xl" />
            <div className="relative h-[520px] w-full rounded-3xl shadow-2xl border-4 border-white overflow-hidden z-0">
              <ShelterMap />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ RECENT ANIMALS ══════════════ */}
      <section className="py-24 bg-gray-50 relative">
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
            {recentAnimals.map((pet: any, i: number) => (
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
                {/* Full image top */}
                <div className="relative h-48 overflow-hidden bg-orange-50">
                  <img
                    src={pet.image || "/placeholder.png"}
                    alt={pet.nome}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    style={{ transform: "scale(1)", transitionProperty: "transform" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  {/* Gender badge */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                    <img src={pet.sex === 1 ? "/male.png" : "/female.png"} alt="sex" className="w-4 h-4 object-contain" />
                  </div>
                  {/* Orange bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                </div>

                {/* Card body */}
                <div className="px-4 pb-4 pt-2">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-500 transition-colors duration-200">
                    {pet.nome}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors px-2.5 py-1 rounded-full">
                      {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString("pt-PT") : "Recente"}
                    </span>
                    <span className="text-xs font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide uppercase">
                      Ver mais →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
        {/* Decorative rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] border-[40px] border-white/10 rounded-full blur-sm"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[15%] -left-[8%] w-[400px] h-[400px] border-[25px] border-white/10 rounded-full"
          />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <h2 className="text-2xl font-bold uppercase tracking-wider border-b-2 border-white/30 pb-2 inline-block">
              Contactos Úteis
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Estamos aqui para ajudar. Entre em contacto connosco para qualquer dúvida ou questão sobre os nossos amigos de quatro patas.
            </p>
          </motion.div>

          {/* Phones */}
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-white/20 pb-2">
              <Phone className="w-5 h-5" /> Telefones
            </h3>
            <div className="space-y-4 text-white/90">
              {[
                { label: "Câmara Municipal", number: "+351 289 700 100" },
                { label: "Contacto CROA", number: "+351 912 289 880" },
              ].map(({ label, number }) => (
                <motion.div
                  key={label}
                  className="group"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <p className="text-xs uppercase opacity-60 tracking-wider mb-0.5">{label}</p>
                  <p className="font-mono text-lg font-semibold group-hover:text-white transition-colors">{number}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Location & Email */}
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
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
            <a
              href="mailto:servicosveterinarios@cm-olhao.pt"
              className="block text-white/85 hover:text-white transition-colors text-sm break-words underline decoration-white/30 hover:decoration-white"
            >
              servicosveterinarios@cm-olhao.pt
            </a>
          </motion.div>

          {/* Socials */}
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <h3 className="font-bold text-lg border-b border-white/20 pb-2">Redes Sociais</h3>
            <p className="text-white/70 text-sm">Siga-nos para as últimas novidades dos nossos animais.</p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
              ].map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm p-3 rounded-xl flex items-center gap-2"
                >
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

      {/* ══════════════ MODAL ══════════════ */}
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
              {/* Close button */}
              <button
                onClick={() => setSelectedAnimal(null)}
                className="absolute top-4 right-4 p-2 bg-black/25 hover:bg-black/50 text-white rounded-full transition-colors z-20 backdrop-blur-md"
              >
                <X size={18} />
              </button>

              {/* Image with gradient overlay */}
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
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-500/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                      {selectedAnimal.sex === 1 ? "Macho" : "Fêmea"}
                    </span>
                    <span className="text-white/60 text-sm">#{selectedAnimal.id}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-1">Número do Chip</p>
                  <p className="font-mono text-gray-800 font-bold text-xl tracking-wide">{selectedAnimal.chip}</p>
                </div>
                {selectedAnimal.createdAt && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Data de Entrada</p>
                    <p className="text-gray-800 font-semibold">
                      {new Date(selectedAnimal.createdAt).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}