"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Link inválido. Solicite um novo link de recuperação.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("As palavras-passe não coincidem");
      return;
    }

    setIsLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao redefinir a palavra-passe");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
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

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-800">CROACONNECT</span>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Success state ── */}
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Palavra-passe alterada!</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                A sua palavra-passe foi atualizada com sucesso.<br />
                Será redirecionado para o login em breve…
              </p>
              <motion.div
                className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          ) : error && !token ? (
            /* ── Invalid token state ── */
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Este link de recuperação é inválido ou já foi utilizado.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Solicitar novo link
              </button>
            </motion.div>
          ) : (
            /* ── Form ── */
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Nova palavra-passe</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Escolha uma nova palavra-passe para a sua conta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-11 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                    placeholder="Nova palavra-passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
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

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-11 py-3.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                    placeholder="Confirmar palavra-passe"
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
                </div>

                {/* Password strength hint */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
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
                    <span className="text-xs text-gray-400 ml-1 min-w-max">
                      {password.length < 6 ? "Muito curta" : password.length < 8 ? "Fraca" : password.length < 12 ? "Boa" : "Forte"}
                    </span>
                  </motion.div>
                )}

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
                    <>Guardar palavra-passe <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
