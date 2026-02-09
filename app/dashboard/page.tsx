"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, PawPrint, Pencil, Trash2, Plus, ChevronDown, Check, Image as ImageIcon, ChevronLeft, ChevronRight, Package, Users as UsersIcon, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";



export default function AdminDashboard() {

  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [animals, setAnimals] = useState<any[]>([]);
  const [vaccineNotifications, setVaccineNotifications] = useState<any[]>([]);
  const [showVaccinePopup, setShowVaccinePopup] = useState(false);
  const [ocorrenciaNotifications, setOcorrenciaNotifications] = useState<any[]>([]);
  const [showOcorrenciaPopup, setShowOcorrenciaPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const fetchAnimalsAndCheckVaccines = async () => {
      try {
        const response = await fetch("/api/admin/animals");
        if (response.ok) {
          const data = await response.json();
          setAnimals(data);

          // Check for upcoming vaccines (today or within 3 days)
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcomingVaccines = data.filter((animal: any) => {
            if (!animal.data_proxima_vacina) return false;
            const vaccineDate = new Date(animal.data_proxima_vacina);
            vaccineDate.setHours(0, 0, 0, 0);

            const diffTime = vaccineDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays >= 0 && diffDays <= 3;
          });

          if (upcomingVaccines.length > 0) {
            setVaccineNotifications(upcomingVaccines);
            setShowVaccinePopup(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch animals:", error);
      }
    };

    const fetchOcorrenciasAndCheckUnresolved = async () => {
      try {
        const response = await fetch("/api/admin/ocorrencias");
        if (response.ok) {
          const data = await response.json();

          // Check for unresolved ocorrencias
          const unresolvedOcorrencias = data.filter((ocorrencia: any) => ocorrencia.data_resolucao == null);

          if (unresolvedOcorrencias.length > 0) {
            setOcorrenciaNotifications(unresolvedOcorrencias);
            setShowOcorrenciaPopup(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch ocorrencias:", error);
      }
    };

    fetchAnimalsAndCheckVaccines();
    fetchOcorrenciasAndCheckUnresolved();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username"); // remove stored username
    router.push("/login"); // redirect to login page
  };

  const dashboardCards = [
    {
      title: "Animais",
      icon: PawPrint,
      href: "/dashanimais",
      color: "from-orange-500 to-amber-500",
      description: "Gerir animais"
    },
    {
      title: "Stocks",
      icon: Package,
      href: "/dashstocks",
      color: "from-orange-400 to-amber-400",
      description: "Gerir stocks"
    },
    {
      title: "Colónias",
      icon: Users,
      href: "/dashcolonias",
      color: "from-amber-500 to-orange-500",
      description: "Gerir colónias"
    },
    {
      title: "Utilizadores",
      icon: UsersIcon,
      href: "/dashutilizadores",
      color: "from-amber-600 to-orange-600",
      description: "Gerir utilizadores"
    },
    {
      title: "Ocorrências",
      icon: FileText,
      href: "/dashocorrencias",
      color: "from-amber-400 to-orange-400",
      description: "Gerir ocorrências",
      span: true
    }
  ];
  
  return (
    <>
    <header className="w-full shadow-xl z-50 relative font-sans">
      {/* Main Header - Consolidated */}
      <motion.div
        className="bg-gradient-to-r from-orange-600 to-amber-500 shadow-lg relative z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 bg-white/10 p-2 rounded-xl backdrop-blur-sm"
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src="/croa.png" alt="CROA Olhão" className="w-auto h-[60px] md:h-[80px] object-contain drop-shadow-md" />
          </motion.div>

          <div className="flex items-center gap-6">
            {/* Search Bar - Integrated */}
            <motion.div
              className="relative group hidden md:block"
              whileHover={{ scale: 1.02 }}
            >
              <motion.input
                type="text"
                placeholder="Pesquisar..."
                className="bg-white/20 border border-white/30 rounded-full pl-4 pr-10 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:bg-white focus:text-gray-800 focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm"
                initial={{ width: "180px" }}
                whileFocus={{ width: "240px" }}
                transition={{ duration: 0.3 }}
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 group-hover:text-white group-focus-within:text-orange-500 transition-colors"
                size={16}
              />
            </motion.div>

            {/* Navigation */}
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

              {/* User Profile */}
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

                {/* Popup */}
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
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center gtext-orange-600 font-bold text-lg">
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

    {/* Main Content */}
    <main className="min-h-screen bg-white p-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">{username || "Utilizador"}</span>! 👋
          </h1>
          <p className="text-gray-600 text-lg">Bem-vindo ao painel de administração</p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative h-64 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-150 overflow-hidden group cursor-pointer ${card.span ? "md:col-span-2" : ""}`}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-150`} />
                  
                  {/* Content */}
                  <div className="relative h-full p-8 flex flex-col justify-between">
                    <div>
                      <motion.div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h3>
                      <p className="text-gray-600 text-sm">{card.description}</p>
                    </div>
                    <div className="flex items-center text-orange-600 font-medium group-hover:translate-x-2 transition-transform duration-150">
                      <span className="text-sm font-semibold">Abrir tabela</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sidebar Toggle Arrow */}
      <motion.button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white p-5 rounded-l-3xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-150 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/30 rounded-full blur-xl group-hover:bg-white/50 transition-all duration-150"></div>
          {/* Icon container */}
          <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/30 transition-all duration-150">
            {isSidebarOpen ? (
              <ChevronRight className="w-7 h-7 relative z-10" />
            ) : (
              <ChevronLeft className="w-7 h-7 relative z-10" />
            )}
          </div>
        </div>
      </motion.button>

      {/* Side Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 z-30"
            />
            
            {/* Side Panel */}
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-white to-orange-50/30 shadow-2xl z-40 border-l-2 border-orange-200"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-orange-100">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Painel Lateral</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-orange-100 rounded-lg transition-colors group"
                  >
                    <ChevronRight className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                  </button>
                </div>
                {/* Side panel content - blank for now */}
                <div className="text-gray-500 text-sm flex-1">
                  {/* Content will be added later */}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Vaccine Notification Popup */}
      <AnimatePresence>
        {showVaccinePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowVaccinePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <PawPrint className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Vacinas Pendentes</h2>
                      <p className="text-orange-100 text-sm">Animais com vacinas próximas</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVaccinePopup(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {vaccineNotifications.map((animal: any) => {
                    const vaccineDate = new Date(animal.data_proxima_vacina);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const diffTime = vaccineDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    let urgencyColor = "bg-green-100 text-green-800";
                    let urgencyText = "Próxima";

                    if (diffDays === 0) {
                      urgencyColor = "bg-red-100 text-red-800";
                      urgencyText = "Hoje";
                    } else if (diffDays === 1) {
                      urgencyColor = "bg-orange-100 text-orange-800";
                      urgencyText = "Amanhã";
                    } else if (diffDays <= 3) {
                      urgencyColor = "bg-yellow-100 text-yellow-800";
                      urgencyText = `Em ${diffDays} dias`;
                    }

                    return (
                      <motion.div
                        key={animal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img
                            src={animal.image || "/placeholder.png"}
                            alt={animal.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{animal.nome}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColor}`}>
                              {urgencyText}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Chip: {animal.chip}</p>
                          <p className="text-sm text-gray-500">
                            Data da vacina: {vaccineDate.toLocaleDateString('pt-PT')}
                          </p>
                        </div>

                        <Link href="/dashanimais">
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                          >
                            Ver Detalhes
                          </Button>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {vaccineNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma vacina pendente</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <Button
                  onClick={() => setShowVaccinePopup(false)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ocorrencia Notification Popup */}
      <AnimatePresence>
        {showOcorrenciaPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowOcorrenciaPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Ocorrências Não Resolvidas</h2>
                      <p className="text-red-100 text-sm">Ocorrências pendentes de resolução</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOcorrenciaPopup(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {ocorrenciaNotifications.map((ocorrencia: any) => {
                    const getEstadoText = (estado: number) => {
                      const estados = ["Animal Perdido", "Animal Ferido", "Abandono", "Outro"];
                      return estados[estado] || "Desconhecido";
                    };

                    const getEstadoColor = (estado: number) => {
                      const colors = ["bg-blue-100 text-blue-800", "bg-red-100 text-red-800", "bg-yellow-100 text-yellow-800", "bg-gray-100 text-gray-800"];
                      return colors[estado] || "bg-gray-100 text-gray-800";
                    };

                    return (
                      <motion.div
                        key={ocorrencia.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{ocorrencia.titulo}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(ocorrencia.estado)}`}>
                              {getEstadoText(ocorrencia.estado)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ocorrencia.descricao}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Morada: {ocorrencia.morada}</span>
                            <span>Data: {new Date(ocorrencia.data_criacao).toLocaleDateString('pt-PT')}</span>
                          </div>
                        </div>

                        <Link href="/dashocorrencias">
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                          >
                            Ver Detalhes
                          </Button>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {ocorrenciaNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma ocorrência não resolvida</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <Button
                  onClick={() => setShowOcorrenciaPopup(false)}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>

    </>
  );
}
