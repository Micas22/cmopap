"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Header from "@/components/Header";

const FOCUS_ITEMS = ["meow", "woof", "quack", "behhh"];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutUs() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <Header />

      <main className="min-h-screen w-full bg-gray-50 text-gray-800 overflow-x-hidden">

        {/* ── HERO ── */}
        <section
          ref={heroRef}
          className="relative h-[70vh] min-h-[520px] flex items-center justify-center overflow-hidden"
        >
          {/* Background gradient + grid */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600">
            <motion.div
              className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:40px_40px]"
              animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-white/10 blur-[100px]"
              animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-orange-300/20 blur-[120px]"
              animate={{ x: [0, -100, 0], y: [0, -80, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Hero text — parallax */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 text-center px-6 max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border border-white/30"
            >
              Sobre nós
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6"
            >
              Quem somos?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/80 text-lg md:text-xl leading-relaxed"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae pretium arcu,
              interdum et malesuada fames ac ante ipsum primis in faucibus.
            </motion.p>
          </motion.div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
            <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 72L60 60C120 48 240 24 360 18C480 12 600 24 720 30C840 36 960 36 1080 30C1200 24 1320 12 1380 6L1440 0V72H0Z" fill="#f9fafb" />
            </svg>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <div className="max-w-5xl mx-auto px-6 py-20 space-y-28">

          {/* Image grid */}
          <FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((item, index) => (
                <motion.div
                  key={index}
                  className="w-full h-72 bg-white rounded-3xl shadow-md flex items-center justify-center overflow-hidden border border-gray-100 relative group cursor-pointer"
                  initial={{ opacity: 0, x: index === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.15 }}
                  whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(0,0,0,0.10)" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <span className="text-gray-400 text-sm font-medium relative z-10">Inserir Imagem {item}</span>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          {/* What we do */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
            <FadeUp delay={0.05}>
              <div className="lg:sticky lg:top-28">
                <div className="w-1 h-14 bg-gradient-to-b from-orange-500 to-amber-400 rounded-full mb-6" />
                <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                  O que<br />fazemos?
                </h2>
                <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                  Conheça a nossa missão e os valores que nos guiam.
                </p>
              </div>
            </FadeUp>

            <div className="space-y-6">
              {[
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id enim suscipit, efficitur diam quis, molestie libero. Vivamus sed varius metus. Maecenas condimentum elit eu tellus aliquam, at condimentum neque imperdiet.",
                "Maecenas finibus lectus et ornare sagittis. Praesent lobortis consequat aliquet. Nullam luctus laoreet nisl et imperdiet. Fusce nec pharetra justo. Mauris tortor ex, consectetur sed tortor sed, tempus sodales felis.",
                "Donec vestibulum laoreet nulla, non imperdiet metus pharetra sit amet. Phasellus et consequat nisi. Sed varius mattis justo, eget tincidunt velit facilisis scelerisque.",
                "Morbi feugiat magna at porta vulputate. Quisque lacinia leo sed ante semper dapibus. Nam in erat luctus, pharetra lectus quis, sodales metus.",
                "Suspendisse sit amet augue nec leo posuere sagittis. Mauris quis suscipit metus. Morbi tristique, massa tincidunt facilisis cursus, sapien massa porttitor massa, ut mattis enim magna quis quam.",
              ].map((text, i) => (
                <motion.p
                  key={i}
                  className="text-gray-600 leading-relaxed text-base"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                >
                  {text}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Focus box */}
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden">
              {/* BG */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-500" />
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff14_1px,transparent_1px),linear-gradient(to_bottom,#ffffff14_1px,transparent_1px)] bg-[size:32px_32px]"
                animate={{ backgroundPosition: ["0px 0px", "32px 32px"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

              <div className="relative z-10 p-10 md:p-14">
                <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-3">Prioridades</p>
                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-10">
                  O nosso foco
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FOCUS_ITEMS.map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-colors duration-200 rounded-2xl px-5 py-4 border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{i + 1}</span>
                      </div>
                      <span className="text-white font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

        </div>
      </main>
    </>
  );
}