"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, MapPin, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const ReportMap = dynamic(() => import("@/components/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-3xl text-gray-400 font-medium">
      Loading Map...
    </div>
  ),
});

export default function ReportPage() {
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

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    address: "",
    type: "type1",
  });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setFormData((prev) => ({ ...prev, address: data.display_name }));
      } else {
        alert("Não foi possível obter o endereço automaticamente. Por favor, insira o endereço manualmente.");
      }
    } catch (error) {
      console.error("Failed to fetch address", error);
      alert("Erro ao obter endereço. Por favor, insira o endereço manualmente.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const estadoMap: { [key: string]: number } = {
      type1: 0,
      type2: 1,
      type3: 2,
      type4: 3,
    };

    const estado = estadoMap[formData.type] || 0;

    try {
      const response = await fetch("/api/admin/ocorrencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: formData.title,
          descricao: formData.body,
          morada: formData.address,
          data_criacao: new Date().toISOString(),
          data_resolucao: null,
          estado,
        }),
      });

      if (response.ok) {
        alert("Report submitted successfully!");
        setFormData({ title: "", body: "", address: "", type: "type1" });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header */}

        <main className="max-w-5xl mx-auto p-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-white">
                <CardHeader className="bg-white border-b border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Detalhes do Relatório</CardTitle>
                  </div>
                  <p className="text-gray-500 text-sm">Preencha as informações abaixo para reportar uma ocorrência.</p>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Título</label>
                      <Input
                        placeholder="Resumo da ocorrência"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="rounded-xl border-gray-200 focus:ring-orange-500 h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Tipo de Ocorrência</label>
                      <div className="relative">
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none text-gray-700"
                        >
                          <option value="type1">Animal Perdido</option>
                          <option value="type2">Animal Ferido</option>
                          <option value="type3">Abandono</option>
                          <option value="type4">Outro</option>
                        </select>
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Descrição</label>
                      <textarea
                        placeholder="Descreva a situação em detalhe..."
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        className="w-full min-h-[120px] p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-y text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Morada</label>
                      <div className="relative">
                        <Input
                          placeholder="Clique no mapa para selecionar a localização"
                          value={formData.address}
                          readOnly
                          className="rounded-xl border-gray-200 focus:ring-orange-500 h-12 pr-10 bg-gray-50"
                          required
                        />
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
                      </div>
                      <p className="text-xs text-gray-400 ml-1">Clique no mapa para definir a localização exata. O endereço será preenchido automaticamente.</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-12 shadow-lg shadow-orange-200 font-medium text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSubmitting ? "A enviar..." : (
                        <span className="flex items-center gap-2">
                          Enviar Relatório <Send className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Map Section */}
              <div className="h-[400px] lg:h-auto min-h-[400px] rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative bg-white">
                <ReportMap onLocationSelect={handleLocationSelect} />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 px-4 rounded-full shadow-sm z-[1000] text-xs font-medium text-gray-600 border border-gray-100">
                  📍 Olhão, Portugal
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}