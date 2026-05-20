"use client";
import Link from "next/link";
import { Search, Phone, Mail, MapPin, Facebook, Instagram, X } from "lucide-react";
import { motion, useMotionValue, useTransform, animate, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";

const ShelterMap = dynamic(() => import("@/components/ShelterMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 rounded-3xl">
      <p>A carregar mapa...</p>
    </div>
  ),
});

const StatCard = ({ img, title, index }: { img: string; title: string; index: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (value) => Math.floor(value));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      animate(count, 100, {
        duration: 2.5,
        ease: "easeOut",
        delay: index * 0.1,
      });
    }
  }, [isInView, count, index]);

  return (
    <motion.div
      ref={ref}
      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center border border-gray-100 group"
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className="bg-orange-50 p-4 rounded-full mb-4 group-hover:bg-orange-100 transition-colors duration-300">
        <motion.img
          src={`/${img}`}
          alt={title}
          className="w-12 h-12 object-contain"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <motion.span className="text-4xl font-extrabold text-gray-800 mb-2">{rounded}</motion.span>
      <span className="uppercase text-xs font-bold tracking-wider text-orange-500 text-center">{title}</span>
    </motion.div>
  );
};

export default function Header() {

  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [recentAnimals, setRecentAnimals] = useState<any[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await fetch("/api/admin/animals?limit=8");
        if (response.ok) {
          const data = await response.json();
          setRecentAnimals(data);
        }
      } catch (error) {
        console.error("Failed to fetch animals:", error);
      }
    };

    fetchAnimals();
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <>
      <Header />



      <motion.section
        className="w-full bg-gradient-to-b from-gray-50 to-orange-50/30 py-24 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[5%] w-[300px] h-[300px] bg-orange-200/20 rounded-full blur-3xl" />
          <div className="absolute top-[20%] -right-[5%] w-[400px] h-[400px] bg-orange-300/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
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
      </motion.section>

      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-orange-500 uppercase tracking-widest mb-4">
              Rede de Abrigos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore a nossa rede de abrigos e colónias em Olhão.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[500px] w-full rounded-3xl shadow-xl border-4 border-white overflow-hidden relative z-0"
          >
            <ShelterMap />
          </motion.div>
        </div>
      </section>

      <motion.section
        className="py-24 bg-white relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.h2
          variants={{ hidden: { y: -20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          className="text-3xl font-bold text-orange-500 uppercase tracking-widest mb-12 text-center"
        >
          Recém Chegados
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-6">
          {recentAnimals.map((pet: any) => (
            <motion.div
              key={pet.id}
              onClick={() => setSelectedAnimal(pet)}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 cursor-pointer flex items-center space-x-4 group"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-orange-100 group-hover:border-orange-300 transition-colors shrink-0">
                <img
                  src={pet.image || "/placeholder.png"}
                  alt={pet.nome}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="flex flex-col items-start">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-500 transition-colors">
                  {pet.nome}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors">
                    {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('pt-PT') : 'Recente'}
                  </span>
                  <img
                    src={pet.sex === 1 ? "/male.png" : "/female.png"}
                    alt="sex"
                    className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="relative bg-gradient-to-br from-orange-600 to-amber-500 text-white py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] border-[40px] border-white/10 rounded-full blur-sm"
          />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Header / Brand area */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold uppercase tracking-wider border-b-2 border-white/30 pb-2 inline-block">
              Contactos Úteis
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Estamos aqui para ajudar. Entre em contacto connosco para qualquer dúvida ou questão sobre os nossos amigos de quatro patas.
            </p>
          </div>

          {/* Phones */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Phone className="w-5 h-5" /> Telefones
            </h3>
            <div className="space-y-2 text-white/90">
              <div>
                <p className="text-xs uppercase opacity-70">Câmara Municipal</p>
                <p className="font-mono text-lg">+351 289 700 100</p>
              </div>
              <div>
                <p className="text-xs uppercase opacity-70">Contacto CROA</p>
                <p className="font-mono text-lg">+351 912 289 880</p>
              </div>
            </div>
          </div>

          {/* Location & Email */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Localização
            </h3>
            <div className="text-white/90 text-sm space-y-1">
              <p>Sítio da Alecrineira EMS16</p>
              <p>Quelfes, Olhão</p>
            </div>

            <h3 className="font-bold text-lg flex items-center gap-2 mt-6">
              <Mail className="w-5 h-5" /> Email
            </h3>
            <a
              href="mailto:servicosveterinarios@cm-olhao.pt"
              className="block text-white/90 hover:text-white underline decoration-white/50 hover:decoration-white transition-all text-sm break-words"
            >
              servicosveterinarios@cm-olhao.pt
            </a>
          </div>

          {/* Socials */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              Redes Sociais
            </h3>
            <div className="flex gap-4">
              <motion.a
                href="#"
                whileHover={{ y: -5, scale: 1.1 }}
                className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <Facebook className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -5, scale: 1.1 }}
                className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <Instagram className="w-6 h-6" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Copyright / Footer bottom */}
        <div className="relative z-10 mt-16 pt-8 border-t border-white/20 text-center text-xs text-white/60">
          <p>&copy; {new Date().getFullYear()} CROA Olhão. Todos os direitos reservados.</p>
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAnimal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
            >
              <button
                onClick={() => setSelectedAnimal(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10 backdrop-blur-md"
              >
                <X size={20} />
              </button>

              <div className="h-80 relative">
                <img
                  src={selectedAnimal.image || "/placeholder.png"}
                  alt={selectedAnimal.nome}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                  <h3 className="text-4xl font-bold mb-2">{selectedAnimal.nome}</h3>
                  <div className="flex items-center gap-3 text-white/90 text-base font-medium">
                    <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{selectedAnimal.sex === 1 ? "Macho" : "Fêmea"}</span>
                    <span>#{selectedAnimal.id}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Número do Chip</p>
                  <p className="font-mono text-gray-800 font-bold text-xl tracking-wide">{selectedAnimal.chip}</p>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
