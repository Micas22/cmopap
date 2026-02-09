"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Trash2, MapPin, Calendar, AlertCircle, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import for the map to avoid SSR issues
const ReportMap = dynamic(() => import("@/components/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-3xl text-gray-400 font-medium">
      Loading Map...
    </div>
  ),
});

export default function DashOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const fetchOcorrencias = async () => {
    try {
      const response = await fetch("/api/admin/ocorrencias");
      if (response.ok) {
        const data = await response.json();
        setOcorrencias(data);
        setError(null);
      } else {
        setError("Erro ao carregar ocorrências. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Failed to fetch ocorrencias:", error);
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await fetch("/api/admin/ocorrencias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          data_resolucao: new Date().toISOString(),
          estado: 1, // Resolved
        }),
      });
      fetchOcorrencias();
    } catch (error) {
      console.error("Failed to resolve ocorrencia:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta ocorrência?")) {
      try {
        await fetch("/api/admin/ocorrencias", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        fetchOcorrencias();
        if (currentIndex >= ocorrencias.length - 1) {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      } catch (error) {
        console.error("Failed to delete ocorrencia:", error);
      }
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % ocorrencias.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + ocorrencias.length) % ocorrencias.length);
  };

  const getEstadoText = (estado: number) => {
    const estados = ["Animal Perdido", "Animal Ferido", "Abandono", "Outro"];
    return estados[estado] || "Desconhecido";
  };

  const getEstadoColor = (estado: number) => {
    const colors = ["bg-blue-100 text-blue-800", "bg-red-100 text-red-800", "bg-yellow-100 text-yellow-800", "bg-gray-100 text-gray-800"];
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const handleLogout = () => {
    localStorage.removeItem("username"); // remove stored username
    router.push("/login"); // redirect to login page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ocorrências...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar ocorrências</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchOcorrencias} className="bg-orange-500 hover:bg-orange-600">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (ocorrencias.length === 0) {
    return (
      <>
        <header className="w-full shadow-xl z-50 relative font-sans">
          <motion.div
            className="bg-gradient-to-r from-orange-600 to-amber-500 shadow-lg relative z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full px-6 py-4 flex items-center justify-between">
              <motion.div
                className="flex-shrink-0 bg-white/10 p-2 rounded-xl backdrop-blur-sm"
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img src="/croa.png" alt="CROA Olhão" className="w-auto h-[60px] md:h-[80px] object-contain drop-shadow-md" />
              </motion.div>

              <div className="flex items-center gap-6">
                <motion.nav
                  className="flex space-x-6 text-white text-lg font-medium items-center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {[{ name: "Inicio", href: "/" }, { name: "Quem somos?", href: "/aboutus" }, { name: "Dashboard", href: "/dashboard" }].map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="relative group px-2 py-1"
                    >
                      <span className="relative z-10">{link.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                      <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0" />
                    </Link>
                  ))}

                  <div className="relative ml-2">
                    <motion.button
                      onClick={() => setShowPopup(!showPopup)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-1.5 rounded-full transition-all duration-300 ${showPopup ? 'bg-white text-orange-500 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20">
                         <img src="/user.png" alt="User" className="w-full h-full object-cover" />
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {showPopup && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl p-5 z-50 border border-gray-100 origin-top-right"
                        >
                          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                              {username ? username.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Logged in as</p>
                              <p className="text-gray-800 font-semibold truncate max-w-[140px]">{username || "Guest"}</p>
                            </div>
                          </div>

                          <button
                            onClick={handleLogout}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <span>Sair</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.nav>
              </div>
            </div>
          </motion.div>
        </header>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhuma ocorrência encontrada</h2>
            <p className="text-gray-600 mb-4">As ocorrências reportadas aparecerão aqui.</p>
            <Button onClick={() => router.push("/report")} className="bg-orange-500 hover:bg-orange-600">
              Reportar Ocorrência
            </Button>
          </div>
        </div>
      </>
    );
  }

  const currentOcorrencia = ocorrencias[currentIndex];

  return (
    <>
      <header className="w-full shadow-xl z-50 relative font-sans">
        <motion.div
          className="bg-gradient-to-r from-orange-600 to-amber-500 shadow-lg relative z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full px-6 py-4 flex items-center justify-between">
            <motion.div
              className="flex-shrink-0 bg-white/10 p-2 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src="/croa.png" alt="CROA Olhão" className="w-auto h-[60px] md:h-[80px] object-contain drop-shadow-md" />
            </motion.div>

            <div className="flex items-center gap-6">
              <motion.nav
                className="flex space-x-6 text-white text-lg font-medium items-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {[{ name: "Inicio", href: "/" }, { name: "Quem somos?", href: "/aboutus" }, { name: "Dashboard", href: "/dashboard" }].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative group px-2 py-1"
                  >
                    <span className="relative z-10">{link.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                    <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0" />
                  </Link>
                ))}

                <div className="relative ml-2">
                  <motion.button
                    onClick={() => setShowPopup(!showPopup)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-1.5 rounded-full transition-all duration-300 ${showPopup ? 'bg-white text-orange-500 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20">
                       <img src="/user.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {showPopup && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl p-5 z-50 border border-gray-100 origin-top-right"
                      >
                        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                            {username ? username.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Logged in as</p>
                            <p className="text-gray-800 font-semibold truncate max-w-[140px]">{username || "Guest"}</p>
                          </div>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <span>Sair</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.nav>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar ao Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Ocorrências</h1>
            </div>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} de {ocorrencias.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card Section */}
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <Button
                  variant="outline"
                  onClick={prevCard}
                  disabled={ocorrencias.length <= 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex gap-2">
                  {ocorrencias.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentIndex ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={nextCard}
                  disabled={ocorrencias.length <= 1}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center"
                >
                  <Card className="w-full max-w-2xl shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{currentOcorrencia.titulo}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(currentOcorrencia.estado)}`}>
                                {getEstadoText(currentOcorrencia.estado)}
                              </span>
                              {currentOcorrencia.data_resolucao && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Resolvido
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-90">
                            ID: {currentOcorrencia.id}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                        <p className="text-gray-600 leading-relaxed">{currentOcorrencia.descricao}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Morada</p>
                            <p className="text-sm text-gray-600">{currentOcorrencia.morada}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Data de Criação</p>
                            <p className="text-sm text-gray-600">
                              {new Date(currentOcorrencia.data_criacao).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {currentOcorrencia.data_resolucao && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Data de Resolução</p>
                            <p className="text-sm text-gray-600">
                              {new Date(currentOcorrencia.data_resolucao).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t">
                        {!currentOcorrencia.data_resolucao && (
                          <Button
                            onClick={() => handleResolve(currentOcorrencia.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Marcar como Resolvido
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDelete(currentOcorrencia.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Map Section */}
            <div className="h-[400px] lg:h-auto min-h-[400px] rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative bg-white">
              <ReportMap onLocationSelect={() => {}} />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 px-4 rounded-full shadow-sm z-[1000] text-xs font-medium text-gray-600 border border-gray-100">
                📍 {currentOcorrencia.morada}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
