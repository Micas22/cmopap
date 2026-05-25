"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [greeting, setGreeting] = useState("Bem-vindo");
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) setGreeting("Bom dia");
    else if (h >= 12 && h < 19) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (mode === "forgot") {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setIsLoading(false);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setForgotSent(true);
      return;
    }

    if (mode === "signup" && password !== confirm) {
      setError("As palavras-passe não coincidem");
      setIsLoading(false);
      return;
    }

    const res = await fetch(`/api/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) { setError(data.error); return; }
    localStorage.setItem("email", data.email);
    router.push(data.perms === 0 ? "/pubmain" : "/");
  }

  function switchMode(next: Mode) {
    setError("");
    setForgotSent(false);
    setEmail("");
    setPassword("");
    setConfirm("");
    setMode(next);
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden flex">
      {/* Background */}
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

      {/* Left branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="hidden lg:flex relative z-10 w-1/2 flex-col justify-between p-16"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-lg tracking-tight">CROACONNECT</span>
        </div>
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white text-5xl font-bold leading-tight mb-4"
          >
            {greeting},<br />
            <span className="text-white/60">como podemos</span><br />
            ajudar hoje?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white/60 text-base leading-relaxed max-w-xs"
          >
            Aceda à nova plataforma do CROA Olhão de forma simples, rápida e segura.
          </motion.p>
        </div>
        <p className="text-white/30 text-sm">Powered by MCR - José Rijo</p>
      </motion.div>

      {/* Right: form */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800">Portal</span>
          </div>

          {/* ── Forgot password view ── */}
          <AnimatePresence mode="wait">
            {mode === "forgot" ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => switchMode("login")}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar ao login
                </button>

                {forgotSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Email enviado!</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Se este email estiver registado, receberá um link para redefinir a sua palavra-passe.
                    </p>
                    <button
                      onClick={() => switchMode("login")}
                      className="mt-6 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      Voltar ao login
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold text-gray-900">Recuperar palavra-passe</h1>
                      <p className="text-gray-500 text-sm mt-1">
                        Insira o seu email e enviaremos um link de recuperação.
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-4 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                          placeholder="Endereço de email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-red-500 font-medium text-center bg-red-50 border border-red-100 py-2.5 rounded-xl"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enviar link <ArrowRight className="w-4 h-4" /></>}
                      </motion.button>
                    </form>
                  </>
                )}
              </motion.div>
            ) : (
              /* ── Login / Signup view ── */
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mode === "login" ? "Entrar na conta" : "Criar conta"}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {mode === "login" ? "Insira os seus dados para continuar" : "Preencha os campos para se registar"}
                  </p>
                </div>

                {/* Mode toggle */}
                <div className="flex mb-7 bg-gray-100 rounded-2xl p-1 gap-1">
                  {(["login", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => switchMode(m)}
                      className={`relative flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 z-10 ${
                        mode === m ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {m === "login" ? "Login" : "Criar Conta"}
                      {mode === m && (
                        <motion.span
                          layoutId="pill"
                          className="absolute inset-0 rounded-xl bg-white shadow-sm -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-4 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                      placeholder="Endereço de email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPass ? "text" : "password"}
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-11 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                      placeholder="Palavra-passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength meter — signup only */}
                  <AnimatePresence>
                    {mode === "signup" && password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 pt-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                password.length >= level * 3
                                  ? password.length >= 12
                                    ? "bg-green-400"
                                    : password.length >= 8
                                    ? "bg-amber-400"
                                    : "bg-red-400"
                                  : "bg-gray-100"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-400 min-w-max">
                            {password.length < 6
                              ? "Muito curta"
                              : password.length < 8
                              ? "Fraca"
                              : password.length < 12
                              ? "Boa"
                              : "Forte"}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden relative"
                      >
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type={showConfirm ? "text" : "password"}
                          className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-11 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                          placeholder="Confirmar Palavra-passe"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-red-500 font-medium text-center bg-red-50 border border-red-100 py-2.5 rounded-xl"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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

                  {mode === "login" && (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        Esqueceu-se da palavra-passe?
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}