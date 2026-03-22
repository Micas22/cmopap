"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, CheckCircle, Shield, FileCheck, ChevronRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DashDocumentos() {
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/login");
  };

  const documentOptions = [
    {
      title: "Registo de aconselhamentos",
      icon: FileCheck,
      color: "from-orange-500 to-amber-500",
      description: "Registar aconselhamento prestado"
    },
    {
      title: "Certificado de esterilização",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
      description: "Emitir certificado de esterilização"
    },
    {
      title: "Relatório de vacinas",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      description: "Gerar relatório de vacinas"
    },
    {
      title: "Ficha de animal",
      icon: UserCheck,
      color: "from-purple-500 to-violet-500",
      description: "Criar ficha completa do animal"
    }
  ];

  const handleDocumentClick = (title: string) => {
    // Static for now - show alert as placeholder
    alert(`Funcionalidade "${title}" - Em desenvolvimento. Em breve poderá gerar este documento!`);
    // Later: open modal/form for document generation
  };

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
              </motion.div>

              <motion.nav
                className="flex space-x-6 text-white text-lg font-medium items-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {[{ name: "Inicio", href: "/" }, { name: "Quem somos?", href: "/aboutus" }, { name: "Dashboard", href: "/dashboard" }].map((link) => (
                  <Link key={link.name} href={link.href} className="relative group px-2 py-1">
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
                      <button onClick={handleLogout} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <span>Sair</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.nav>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="min-h-screen bg-gray-50">
        <main className="p-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-gray-100 mb-8">
              <CardHeader className="px-8 py-6 border-b border-gray-50 space-y-4">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon" className="rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                      </Link>
                    </Button>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Documentos</CardTitle>
                  </div>
                </div>
                <p className="text-gray-600 text-lg">Selecione o tipo de documento para gerar</p>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentOptions.map((doc, index) => {
                const Icon = doc.icon;
                return (
                  <motion.div
                    key={doc.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleDocumentClick(doc.title)}
                      className="group relative h-80 w-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border-0"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${doc.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        <motion.div
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${doc.color} flex items-center justify-center shadow-xl`}
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <Icon className="w-10 h-10 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900">{doc.title}</h3>
                          <p className="text-gray-600 mb-6">{doc.description}</p>
                        </div>
                        <div className="flex items-center text-gray-700 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                          <span className="text-lg">Gerar documento</span>
                          <ChevronRight className="w-6 h-6 ml-2" />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
