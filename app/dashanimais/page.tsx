"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Pencil, Trash2, Plus, ChevronDown, Check, Image as ImageIcon, Filter, X, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";



export default function AdminDashboard() {
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sexFilter, setSexFilter] = useState<number | null>(null); // null = all, 1 = macho, 0 = fêmea
  const [animals, setAnimals] = useState<{ id: number; nome: string; chip: string; sex: number; image?: string; raca?: string; porte?: number; altura?: number; peso?: number; esterelizacao?: number; observações?: string }[]>([]);

const fetchAnimals = async () => {
  try {
    const res = await fetch("/api/admin/animals");
    const data = await res.json();
    setAnimals(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch animals:", error);
  }
};

useEffect(() => {
  fetchAnimals();
}, []);

const handleSort = (key: string) => {
  let direction: "asc" | "desc" = "asc";
  if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
    direction = "desc";
  }
  setSortConfig({ key, direction });
};

const filterAndSearchData = (data: typeof animals) => {
  let filtered = [...data];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((animal) => 
      animal.nome.toLowerCase().includes(query) ||
      animal.chip.toLowerCase().includes(query)
    );
  }

  // Apply sex filter
  if (sexFilter !== null) {
    filtered = filtered.filter((animal) => animal.sex === sexFilter);
  }

  return filtered;
};

const sortData = <T extends Record<string, any>>(data: T[]) => {
  if (!sortConfig) return data;
  
  return [...data].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
};


const handleSave = async () => {
  if (!editItem) return;

  try {
    const formData = new FormData();
    Object.keys(editItem).forEach((key) => {
      if (key !== "image" && key !== "deleteImage") {
        const value = editItem[key];
        // Handle optional fields - send empty string for text fields, null for numeric fields
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, String(value));
        } else if (key === "raca" || key === "observações") {
          // For text fields, send empty string to clear them
          formData.append(key, "");
        } else if (key === "porte" || key === "altura" || key === "peso" || key === "esterelizacao") {
          // For numeric fields, explicitly send empty string to clear them
          formData.append(key, "");
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
    });
    if (editImageFile) {
      formData.append("image", editImageFile);
    }
    if (editItem.deleteImage) {
      formData.append("deleteImage", "true");
    }

    const res = await fetch("/api/admin/animals", {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Failed to update animal: ${error.error}`);
      return;
    }

    const updatedAnimal = await res.json();

    setAnimals((prev) =>
      prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a))
    );

    setEditItem(null);
    setEditImageFile(null);
  } catch (err) {
    console.error(err);
    alert("An unexpected error occurred while saving.");
  }
};

const handleRemoveImage = async () => {
  if (!editItem) return;

  try {
    const formData = new FormData();
    Object.keys(editItem).forEach((key) => {
      if (key !== "image" && key !== "deleteImage" && editItem[key] !== null && editItem[key] !== undefined) {
        formData.append(key, String(editItem[key]));
      }
    });
    formData.append("deleteImage", "true");

    const res = await fetch("/api/admin/animals", {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Failed to remove image: ${error.error}`);
      return;
    }

    const updatedAnimal = await res.json();

    setAnimals((prev) => prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a)));
    setEditItem(updatedAnimal);
    setEditImageFile(null);
  } catch (err) {
    console.error(err);
    alert("Error removing image");
  }
};

const [createAnimalDialogOpen, setCreateAnimalDialogOpen] = useState(false);
const [newAnimalNome, setNewAnimalNome] = useState("");
const [newAnimalChip, setNewAnimalChip] = useState("");
const [newAnimalSex, setNewAnimalSex] = useState(1);
const [newAnimalRaca, setNewAnimalRaca] = useState("");
const [newAnimalPorte, setNewAnimalPorte] = useState<number | null>(null);
const [newAnimalAltura, setNewAnimalAltura] = useState("");
const [newAnimalPeso, setNewAnimalPeso] = useState("");
const [newAnimalEsterelizacao, setNewAnimalEsterelizacao] = useState<number | null>(null);
const [newAnimalObservações, setNewAnimalObservações] = useState("");
const [newAnimalDataUltimaVacina, setNewAnimalDataUltimaVacina] = useState("");
const [newAnimalDataProximaVacina, setNewAnimalDataProximaVacina] = useState("");
const [createSexOpen, setCreateSexOpen] = useState(false);
const [createPorteOpen, setCreatePorteOpen] = useState(false);
const [createEsterelizacaoOpen, setCreateEsterelizacaoOpen] = useState(false);
const [editSexOpen, setEditSexOpen] = useState(false);
const [editPorteOpen, setEditPorteOpen] = useState(false);
const [editEsterelizacaoOpen, setEditEsterelizacaoOpen] = useState(false);
const [newAnimalImage, setNewAnimalImage] = useState<File | null>(null);
const [editImageFile, setEditImageFile] = useState<File | null>(null);

const handleCreateAnimal = async () => {
  if (!newAnimalNome || !newAnimalChip) return alert("Fill all fields");

  try {
    const formData = new FormData();
    formData.append("nome", newAnimalNome);
    formData.append("chip", newAnimalChip);
    formData.append("sex", newAnimalSex.toString());
    if (newAnimalImage) {
      formData.append("image", newAnimalImage);
    }
    if (newAnimalRaca) {
      formData.append("raca", newAnimalRaca);
    }
    if (newAnimalPorte !== null) {
      formData.append("porte", newAnimalPorte.toString());
    }
    if (newAnimalAltura) {
      formData.append("altura", newAnimalAltura);
    }
    if (newAnimalPeso) {
      formData.append("peso", newAnimalPeso);
    }
    if (newAnimalEsterelizacao !== null) {
      formData.append("esterelizacao", newAnimalEsterelizacao.toString());
    }
    if (newAnimalObservações) {
      formData.append("observações", newAnimalObservações);
    }

    const res = await fetch("/api/admin/animals", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Failed to create animal: ${error.error}`);
      return;
    }

    const newAnimal = await res.json();
    setAnimals((prev) => [...prev, newAnimal]);
    setNewAnimalNome("");
    setNewAnimalChip("");
    setNewAnimalSex(1);
    setNewAnimalRaca("");
    setNewAnimalPorte(null);
    setNewAnimalAltura("");
    setNewAnimalPeso("");
    setNewAnimalEsterelizacao(null);
    setNewAnimalObservações("");
    setNewAnimalDataUltimaVacina("");
    setNewAnimalDataProximaVacina("");
    setNewAnimalImage(null);
    setCreateSexOpen(false);
    setCreatePorteOpen(false);
    setCreateEsterelizacaoOpen(false);
    setCreateAnimalDialogOpen(false);
  } catch (err) {
    console.error(err);
    alert("Error creating animal");
  }
};

  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username"); // remove stored username
    router.push("/login"); // redirect to login page
  };
  
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
      {/* MAIN */}
      <main className="p-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-gray-100">
                <CardHeader className="px-8 py-6 border-b border-gray-50 space-y-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      >
                        <Link href="/dashboard" aria-label="Voltar ao dashboard" title="Voltar ao dashboard">
                          <ArrowLeft className="h-5 w-5" />
                        </Link>
                      </Button>
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <PawPrint className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800">Animais</CardTitle>
                    </div>
                    <Dialog open={createAnimalDialogOpen} onOpenChange={setCreateAnimalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95">
                        <Plus className="mr-2 h-4 w-4" /> Novo Animal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl space-y-4 p-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800">Criar novo animal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-2">
                      <Input
                        placeholder="Nome"
                        value={newAnimalNome}
                        onChange={(e) => setNewAnimalNome(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-orange-500"
                      />
                      <Input
                        placeholder="Chip"
                        value={newAnimalChip}
                        onChange={(e) => setNewAnimalChip(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-orange-500"
                      />
                      <Input
                        placeholder="Raça (Opcional)"
                        value={newAnimalRaca}
                        onChange={(e) => setNewAnimalRaca(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-orange-500"
                      />
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCreateSexOpen(!createSexOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all h-10"
                        >
                          <span className="text-gray-900">
                            {newAnimalSex === 1 ? "Macho" : "Fêmea"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${createSexOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {createSexOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                            >
                              {[
                                { label: "Macho", value: 1 },
                                { label: "Fêmea", value: 0 }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setNewAnimalSex(option.value);
                                    setCreateSexOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                  {option.label}
                                  {newAnimalSex === option.value && <Check className="w-4 h-4 text-orange-500" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCreatePorteOpen(!createPorteOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all h-10"
                        >
                          <span className="text-gray-900">
                            {newAnimalPorte === null ? "Porte (Opcional)" : newAnimalPorte === 1 ? "Pequeno" : newAnimalPorte === 2 ? "Médio" : "Grande"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${createPorteOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {createPorteOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                            >
                              {[
                                { label: "Pequeno", value: 1 },
                                { label: "Médio", value: 2 },
                                { label: "Grande", value: 3 }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setNewAnimalPorte(option.value);
                                    setCreatePorteOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                  {option.label}
                                  {newAnimalPorte === option.value && <Check className="w-4 h-4 text-orange-500" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Input
                        type="number"
                        placeholder="Altura (cm) - Opcional"
                        value={newAnimalAltura}
                        onChange={(e) => setNewAnimalAltura(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-orange-500"
                      />
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Peso (kg) - Opcional"
                        value={newAnimalPeso}
                        onChange={(e) => setNewAnimalPeso(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-orange-500"
                      />
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCreateEsterelizacaoOpen(!createEsterelizacaoOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all h-10"
                        >
                          <span className="text-gray-900">
                            {newAnimalEsterelizacao === null ? "Esterilização (Opcional)" : newAnimalEsterelizacao === 1 ? "Esterilizado" : "Não Esterilizado"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${createEsterelizacaoOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {createEsterelizacaoOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                            >
                              {[
                                { label: "Esterilizado", value: 1 },
                                { label: "Não Esterilizado", value: 2 }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setNewAnimalEsterelizacao(option.value);
                                    setCreateEsterelizacaoOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                  {option.label}
                                  {newAnimalEsterelizacao === option.value && <Check className="w-4 h-4 text-orange-500" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 ml-1">Data da Última Vacina (Opcional)</label>
                        <Input
                          type="date"
                          placeholder="Data da Última Vacina (Opcional)"
                          value={newAnimalDataUltimaVacina}
                          onChange={(e) => setNewAnimalDataUltimaVacina(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 ml-1">Data da Próxima Vacina (Opcional)</label>
                        <Input
                          type="date"
                          placeholder="Data da Próxima Vacina (Opcional)"
                          value={newAnimalDataProximaVacina}
                          onChange={(e) => setNewAnimalDataProximaVacina(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 ml-1">Observações (Opcional)</label>
                        <textarea
                          placeholder="Digite observações sobre o animal..."
                          value={newAnimalObservações}
                          onChange={(e) => setNewAnimalObservações(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 ml-1">Foto (Opcional)</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewAnimalImage(e.target.files?.[0] || null)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500 file:text-orange-600 file:font-medium file:bg-orange-50 file:rounded-lg file:border-0 file:mr-4 file:px-4 file:py-1 hover:file:bg-orange-100 transition-all"
                        />
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md"
                        onClick={handleCreateAnimal}
                      >
                        Criar
                      </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        type="text"
                        placeholder="Pesquisar por nome ou chip..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 rounded-xl border-gray-200 focus:ring-orange-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    
                    {/* Sex Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="text-gray-400" size={18} />
                      <div className="flex gap-2">
                        <Button
                          variant={sexFilter === null ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSexFilter(null)}
                          className={`rounded-xl ${sexFilter === null ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                        >
                          Todos
                        </Button>
                        <Button
                          variant={sexFilter === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSexFilter(1)}
                          className={`rounded-xl ${sexFilter === 1 ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                        >
                          Macho
                        </Button>
                        <Button
                          variant={sexFilter === 0 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSexFilter(0)}
                          className={`rounded-xl ${sexFilter === 0 ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                        >
                          Fêmea
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="hover:bg-transparent border-gray-100">
                       <TableHead className="pl-8 h-12 font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("id")}>
                          <div className="flex items-center gap-1">
                            ID
                            {sortConfig?.key === "id" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("image")}>
                          <div className="flex items-center gap-1">
                            Foto
                            {sortConfig?.key === "image" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("nome")}>
                          <div className="flex items-center gap-1">
                            Nome
                            {sortConfig?.key === "nome" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("chip")}>
                          <div className="flex items-center gap-1">
                            Chip
                            {sortConfig?.key === "chip" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("sex")}>
                          <div className="flex items-center gap-1">
                            Sexo
                            {sortConfig?.key === "sex" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                       </TableHead>
                        <TableHead className="text-right pr-8 font-semibold text-gray-500">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortData(filterAndSearchData(animals)).map((a) => (
                        <TableRow 
                          key={a.id} 
                          className="group hover:bg-orange-50/30 transition-colors border-gray-50 cursor-pointer"
                          onClick={() => setViewItem({ ...a })}
                        >
                          <TableCell className="pl-8 font-medium text-gray-600">#{a.id}</TableCell>
                          <TableCell>
                            {a.image ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                                <img src={a.image} alt={a.nome} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{a.nome}</TableCell>
                          <TableCell className="text-gray-500 font-mono">{a.chip}</TableCell>
                          <TableCell className="text-gray-500">{a.sex === 1 ? "Macho" : "Fêmea"}</TableCell>
                          <TableCell className="text-right pr-8 space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditItem({ ...a })}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm("Are you sure you want to delete this animal?")) return;

                                try {
                                  const res = await fetch("/api/admin/animals", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: a.id }),
                                  });

                                  if (!res.ok) {
                                    const error = await res.json();
                                    alert(`Failed to delete animal: ${error.error}`);
                                    return;
                                  }

                                  setAnimals((prev) => prev.filter((animal) => animal.id !== a.id));
                                } catch (err) {
                                  console.error(err);
                                  alert("Error deleting animal");
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {sortData(filterAndSearchData(animals)).length === 0 && (
                    <div className="py-12 text-center">
                      <PawPrint className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum animal encontrado</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchQuery || sexFilter !== null 
                          ? "Tente ajustar os filtros de pesquisa" 
                          : "Adicione um novo animal para começar"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
        </motion.div>
      </main>

      {/* VIEW MODAL */}
      <Dialog open={!!viewItem} onOpenChange={(open) => { if (!open) setViewItem(null); }}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-orange-500 text-2xl">Detalhes do Animal</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-6 py-4">
              {/* Image */}
              {viewItem.image && (
                <div className="flex justify-center">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                    <img src={viewItem.image} alt={viewItem.nome} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              
              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</label>
                  <div className="text-lg font-medium text-gray-900">#{viewItem.id}</div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</label>
                  <div className="text-lg font-medium text-gray-900">{viewItem.nome}</div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chip</label>
                  <div className="text-lg font-mono text-gray-900">{viewItem.chip}</div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sexo</label>
                  <div className="text-lg font-medium text-gray-900">
                    {viewItem.sex === 1 ? "Macho" : "Fêmea"}
                  </div>
                </div>

                {viewItem.raca && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Raça</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.raca}</div>
                  </div>
                )}

                {viewItem.porte !== null && viewItem.porte !== undefined && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Porte</label>
                    <div className="text-lg font-medium text-gray-900">
                      {viewItem.porte === 1 ? "Pequeno" : viewItem.porte === 2 ? "Médio" : "Grande"}
                    </div>
                  </div>
                )}

                {viewItem.altura !== null && viewItem.altura !== undefined && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Altura</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.altura} cm</div>
                  </div>
                )}

                {viewItem.peso !== null && viewItem.peso !== undefined && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Peso</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.peso} kg</div>
                  </div>
                )}

                {viewItem.esterelizacao !== null && viewItem.esterelizacao !== undefined && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Esterilização</label>
                    <div className="text-lg font-medium text-gray-900">
                      {viewItem.esterelizacao === 1 ? "Esterilizado" : "Não Esterilizado"}
                    </div>
                  </div>
                )}

                {viewItem.data_ultima_vacina && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data da Última Vacina</label>
                    <div className="text-lg font-medium text-gray-900">
                      {new Date(viewItem.data_ultima_vacina).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                )}

                {viewItem.data_proxima_vacina && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data da Próxima Vacina</label>
                    <div className="text-lg font-medium text-gray-900">
                      {new Date(viewItem.data_proxima_vacina).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                )}
              </div>

              {viewItem.observações && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Observações</label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 whitespace-pre-wrap">{viewItem.observações}</div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setViewItem(null);
                    setEditItem({ ...viewItem });
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewItem(null)}
                  className="flex-1 rounded-xl"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); setEditSexOpen(false); setEditPorteOpen(false); setEditEsterelizacaoOpen(false); setEditImageFile(null); }}>
        <DialogContent className="rounded-2xl max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle className="text-orange-500 text-2xl font-bold">Editar Animal</DialogTitle>
            </DialogHeader>

            {editItem && (
              <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Nome Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>Nome</span>
                    <span className="text-orange-500">*</span>
                  </label>
                  <Input
                    value={editItem.nome || ""}
                    onChange={(e) => setEditItem({ ...editItem, nome: e.target.value })}
                    placeholder="Digite o nome do animal"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Chip Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>Chip</span>
                    <span className="text-orange-500">*</span>
                  </label>
                  <Input
                    value={editItem.chip || ""}
                    onChange={(e) => setEditItem({ ...editItem, chip: e.target.value })}
                    placeholder="Digite o número do chip"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-mono"
                  />
                </motion.div>

                {/* Raça Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.16 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Raça</label>
                  <Input
                    value={editItem.raca || ""}
                    onChange={(e) => setEditItem({ ...editItem, raca: e.target.value })}
                    placeholder="Digite a raça do animal"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Sex Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>Sexo</span>
                    <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={() => setEditSexOpen(!editSexOpen)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-orange-500 transition-all hover:border-orange-300"
                    >
                      <span className="text-gray-900 font-medium">
                        {editItem.sex === 1 ? "Macho" : editItem.sex === 0 ? "Fêmea" : "Selecione o sexo"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${editSexOpen ? "rotate-180" : ""}`} />
                    </motion.button>
                    <AnimatePresence>
                      {editSexOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl overflow-hidden"
                        >
                          {[
                            { label: "Macho", value: 1 },
                            { label: "Fêmea", value: 0 }
                          ].map((option, index) => (
                            <motion.button
                              key={option.value}
                              type="button"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => {
                                setEditItem({ ...editItem, sex: option.value });
                                setEditSexOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                              {option.label}
                              {editItem.sex === option.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <Check className="w-4 h-4 text-orange-500" />
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Porte Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.21 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Porte</label>
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={() => setEditPorteOpen(!editPorteOpen)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-orange-500 transition-all hover:border-orange-300"
                    >
                      <span className="text-gray-900 font-medium">
                        {editItem.porte === null || editItem.porte === undefined ? "Selecione o porte" : editItem.porte === 1 ? "Pequeno" : editItem.porte === 2 ? "Médio" : "Grande"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${editPorteOpen ? "rotate-180" : ""}`} />
                    </motion.button>
                    <AnimatePresence>
                      {editPorteOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl overflow-hidden"
                        >
                          {[
                            { label: "Pequeno", value: 1 },
                            { label: "Médio", value: 2 },
                            { label: "Grande", value: 3 }
                          ].map((option, index) => (
                            <motion.button
                              key={option.value}
                              type="button"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => {
                                setEditItem({ ...editItem, porte: option.value });
                                setEditPorteOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                              {option.label}
                              {editItem.porte === option.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <Check className="w-4 h-4 text-orange-500" />
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Altura Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.22 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Altura (cm)</label>
                  <Input
                    type="number"
                    value={editItem.altura || ""}
                    onChange={(e) => setEditItem({ ...editItem, altura: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Digite a altura em cm"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Peso Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.23 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Peso (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editItem.peso || ""}
                    onChange={(e) => setEditItem({ ...editItem, peso: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Digite o peso em kg"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Esterelizacao Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.24 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Esterilização</label>
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={() => setEditEsterelizacaoOpen(!editEsterelizacaoOpen)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-orange-500 transition-all hover:border-orange-300"
                    >
                      <span className="text-gray-900 font-medium">
                        {editItem.esterelizacao === null || editItem.esterelizacao === undefined ? "Selecione a esterilização" : editItem.esterelizacao === 1 ? "Esterilizado" : "Não Esterilizado"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${editEsterelizacaoOpen ? "rotate-180" : ""}`} />
                    </motion.button>
                    <AnimatePresence>
                      {editEsterelizacaoOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl overflow-hidden"
                        >
                          {[
                            { label: "Esterilizado", value: 1 },
                            { label: "Não Esterilizado", value: 2 }
                          ].map((option, index) => (
                            <motion.button
                              key={option.value}
                              type="button"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => {
                                setEditItem({ ...editItem, esterelizacao: option.value });
                                setEditEsterelizacaoOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                              {option.label}
                              {editItem.esterelizacao === option.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <Check className="w-4 h-4 text-orange-500" />
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Data Última Vacina Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.24 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Data da Última Vacina</label>
                  <Input
                    type="date"
                    value={editItem.data_ultima_vacina ? new Date(editItem.data_ultima_vacina).toISOString().split('T')[0] : ""}
                    onChange={(e) => setEditItem({ ...editItem, data_ultima_vacina: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Data Próxima Vacina Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Data da Próxima Vacina</label>
                  <Input
                    type="date"
                    value={editItem.data_proxima_vacina ? new Date(editItem.data_proxima_vacina).toISOString().split('T')[0] : ""}
                    onChange={(e) => setEditItem({ ...editItem, data_proxima_vacina: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Observações Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.26 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Observações</label>
                  <textarea
                    value={editItem.observações || ""}
                    onChange={(e) => setEditItem({ ...editItem, observações: e.target.value })}
                    placeholder="Digite observações sobre o animal..."
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                    rows={3}
                  />
                </motion.div>

                {/* Image Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.26 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700">Foto</label>
                  {editItem.image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-4 mb-2"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                        <img src={editItem.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <motion.button
                        type="button"
                        onClick={handleRemoveImage}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-sm transition-all h-10 px-4 rounded-xl font-medium flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </motion.button>
                    </motion.div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all file:text-orange-600 file:font-medium file:bg-orange-50 file:rounded-lg file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-orange-100"
                  />
                  {editImageFile && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-600 font-medium"
                    >
                      Nova imagem selecionada: {editImageFile.name}
                    </motion.p>
                  )}
                </motion.div>

                {/* Save Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="pt-2"
                >
                  <motion.button
                    type="button"
                    onClick={handleSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md font-semibold transition-all"
                  >
                    Salvar Alterações
                  </motion.button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
