"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, CheckCircle, Shield, FileCheck, ChevronRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function DashDocumentos() {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("email");
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
    if (title === "Registo de aconselhamentos") {
      router.push("/dashdocumentos/aconselhamento");
    } else {
      alert(`Funcionalidade "${title}" - Em desenvolvimento. Em breve poderá gerar este documento!`);
    }
  };

  return (
    <>
      <Header />

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
