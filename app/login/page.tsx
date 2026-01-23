"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (mode === "signup" && password !== confirm) {
      setError("As palavras passe não coincidem");
      return;
    }

    const res = await fetch(`/api/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    localStorage.setItem("username", data.username);
    if (data.perms === 0) {
      router.push("/pubmain");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50 flex items-center justify-center">
      {/* Animated background blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 overflow-hidden">
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

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full rounded-3xl border border-white/20 bg-white/90 p-8 md:p-10 backdrop-blur-xl shadow-2xl"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6"
            >
              <User className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo</h1>
            <p className="text-gray-500 text-sm">Por favor insira os seus dados para continuar</p>
          </div>

          {/* Mode switch */}
          <div className="relative mb-8 flex p-1 bg-gray-100 rounded-xl">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setError("");
                  setMode(m as any);
                }}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 z-10 ${
                  mode === m ? "text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Login" : "Criar Conta"}
                {mode === m && (
                  <motion.span
                    layoutId="underline"
                    className="absolute inset-0 bg-white rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-12 pr-4 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Nome de Utilizador"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-12 pr-4 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Palavra Passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <AnimatePresence>
              {mode === "signup" && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  type="password"
                  placeholder="Confirmar Palavra Passe"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Entrar" : "Criar Conta"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
