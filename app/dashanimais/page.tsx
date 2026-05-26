"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint, Pencil, Trash2, Plus, ChevronDown, Check,
  Image as ImageIcon, Filter, X, ArrowLeft, Search,
  AlertTriangle, Calendar, Weight, Ruler, Shield, FileText,
  Clock, UploadCloud, Eye, ChevronUp, SortAsc, SortDesc,
  Users, Activity, Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

/* ─── tiny reusable select ────────────────────────────────────────────── */
function SelectField({
  label, value, placeholder, options, open, setOpen, onChange, required,
}: {
  label?: string; value: number | null; placeholder: string;
  options: { label: string; value: number }[];
  open: boolean; setOpen: (v: boolean) => void;
  onChange: (v: number) => void; required?: boolean;
}) {
  const selected = options.find(o => o.value === value);
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-wide uppercase text-gray-500">
          {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white hover:border-orange-200 transition-colors focus:outline-none focus:border-orange-400"
        >
          <span className={selected ? "text-gray-900 font-medium" : "text-gray-400"}>{selected?.label ?? placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl shadow-gray-200/80 overflow-hidden"
            >
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors"
                >
                  <span className={value === opt.value ? "font-semibold text-orange-600" : "text-gray-700"}>{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4 text-orange-500" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── field display chip ────────────────────────────────────────────────── */
function InfoChip({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${accent ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100"}`}>
      <div className={`mt-0.5 ${accent ? "text-orange-500" : "text-gray-400"}`}><Icon className="w-4 h-4" /></div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/* ─── modal section wrapper ─────────────────────────────────────────────── */
function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">{title}</p>
      {children}
    </div>
  );
}

/* ─── stat card ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm`}
    >
      <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sexFilter, setSexFilter] = useState<number | null>(null);
  const [raceFilter, setRaceFilter] = useState("");
  const [showRaceSuggestions, setShowRaceSuggestions] = useState(false);
  const [animals, setAnimals] = useState<{
    id: number; nome: string; chip: string; sex: number; image?: string;
    raca?: string; porte?: number; altura?: number; peso?: number;
    esterelizacao?: number; observações?: string; arquivos?: string;
    colonia?: number | null; data_ultima_vacina?: string; data_proxima_vacina?: string;
  }[]>([]);
  const [colonias, setColonias] = useState<{ id: number; nome: string }[]>([]);
  const [createColoniaOpen, setCreateColoniaOpen] = useState(false);
  const [editColoniaOpen, setEditColoniaOpen] = useState(false);
  const [newAnimalColonia, setNewAnimalColonia] = useState<number | null>(null);

  /* delete confirm modal */
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const fetchAnimals = async () => {
    try { const res = await fetch("/api/admin/animals"); const data = await res.json(); setAnimals(Array.isArray(data) ? data : []); }
    catch (error) { console.error("Failed to fetch animals:", error); }
  };
  const fetchColonias = async () => {
    try { const res = await fetch("/api/admin/colonias"); const data = await res.json(); setColonias(Array.isArray(data) ? data : []); }
    catch (error) { console.error("Failed to fetch colonias:", error); }
  };
  useEffect(() => { fetchAnimals(); fetchColonias(); }, []);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getRaceSuggestions = () => {
    const raceCount: { [key: string]: number } = {};
    animals.forEach(a => { if (a.raca?.trim()) { const r = a.raca.trim(); raceCount[r] = (raceCount[r] || 0) + 1; } });
    return Object.entries(raceCount).sort(([, a], [, b]) => b - a).slice(0, 5).map(([race]) => race);
  };

  const filterAndSearchData = (data: typeof animals) => {
    let filtered = [...data];
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase().trim(); filtered = filtered.filter(a => a.nome.toLowerCase().includes(q) || a.chip.toLowerCase().includes(q)); }
    if (sexFilter !== null) filtered = filtered.filter(a => a.sex === sexFilter);
    if (raceFilter.trim()) { const rq = raceFilter.toLowerCase().trim(); filtered = filtered.filter(a => a.raca && a.raca.toLowerCase().includes(rq)); }
    return filtered;
  };

  const sortData = (data: typeof animals) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const va = a[sortConfig.key as keyof typeof a]; const vb = b[sortConfig.key as keyof typeof b];
      if (va === vb) return 0; if (va == null) return 1; if (vb == null) return -1;
      if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
      if (va > vb) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const getArquivosArray = (arquivos: string | null | undefined): string[] => {
    if (!arquivos) return [];
    return arquivos.split(",").filter(f => f.trim());
  };

  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [animalHistory, setAnimalHistory] = useState<{ id: string; titulo: string; ficheiro?: string; created_at: string }[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [viewTab, setViewTab] = useState<"details" | "history">("details");
  const [createHistoryDialogOpen, setCreateHistoryDialogOpen] = useState(false);
  const [editHistoryItem, setEditHistoryItem] = useState<{ id: string; titulo: string; ficheiro?: string } | null>(null);
  const [newHistoryTitulo, setNewHistoryTitulo] = useState("");
  const [newHistoryFicheiro, setNewHistoryFicheiro] = useState<File | null>(null);
  const [editHistoryFicheiro, setEditHistoryFicheiro] = useState<File | null>(null);
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null);
  const [copiedChip, setCopiedChip] = useState(false);

  const fetchAnimalHistory = async (animalId: number) => {
    setIsLoadingHistory(true);
    try { const res = await fetch(`/api/admin/animals/history?animalId=${animalId}`); if (res.ok) { const data = await res.json(); setAnimalHistory(Array.isArray(data) ? data : []); } }
    catch (error) { console.error("Failed to fetch animal history:", error); }
    finally { setIsLoadingHistory(false); }
  };

  const handleViewAnimal = async (animal: any) => { setViewItem({ ...animal }); setViewTab("details"); await fetchAnimalHistory(animal.id); };

  const handleCreateHistory = async () => {
    if (!newHistoryTitulo || !viewItem) return;
    try {
      const formData = new FormData();
      formData.append("titulo", newHistoryTitulo);
      formData.append("animalid", String(viewItem.id));
      if (newHistoryFicheiro) formData.append("ficheiro", newHistoryFicheiro);
      const res = await fetch("/api/admin/animals/history", { method: "POST", body: formData });
      if (!res.ok) { const error = await res.json(); alert(`Failed to create history: ${error.error}`); return; }
      const newHistory = await res.json();
      setAnimalHistory(prev => [newHistory, ...prev]);
      setNewHistoryTitulo(""); setNewHistoryFicheiro(null); setCreateHistoryDialogOpen(false);
    } catch (err) { console.error(err); alert("Error creating history event"); }
  };

  const handleUpdateHistory = async () => {
    if (!editHistoryItem?.titulo) return;
    try {
      const formData = new FormData();
      formData.append("id", editHistoryItem.id);
      formData.append("titulo", editHistoryItem.titulo);
      if (editHistoryFicheiro) formData.append("ficheiro", editHistoryFicheiro);
      if (!editHistoryItem.ficheiro) formData.append("deleteFile", "true");
      const res = await fetch("/api/admin/animals/history", { method: "PUT", body: formData });
      if (!res.ok) { const error = await res.json(); alert(`Failed to update history: ${error.error}`); return; }
      const updated = await res.json();
      setAnimalHistory(prev => prev.map(h => h.id === updated.id ? updated : h));
      setEditHistoryItem(null); setEditHistoryFicheiro(null);
    } catch (err) { console.error(err); alert("Error updating history event"); }
  };

  const handleDeleteHistory = async () => {
    if (!historyToDelete) return;
    try {
      const res = await fetch("/api/admin/animals/history", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: historyToDelete }) });
      if (!res.ok) { const error = await res.json(); alert(`Failed to delete history: ${error.error}`); return; }
      setAnimalHistory(prev => prev.filter(h => h.id !== historyToDelete));
      setHistoryToDelete(null);
    } catch (err) { console.error(err); alert("Error deleting history event"); }
  };

  const handleSave = async () => {
    if (!editItem) return;
    try {
      const formData = new FormData();
      Object.keys(editItem).forEach(key => {
        if (key !== "image" && key !== "deleteImage" && key !== "arquivos" && key !== "clearArquivos") {
          const v = editItem[key];
          if (v !== null && v !== undefined && v !== "") formData.append(key, String(v));
          else if (["raca", "observações", "porte", "altura", "peso", "esterelizacao", "colonia"].includes(key)) formData.append(key, "");
          else if (v !== null && v !== undefined) formData.append(key, String(v));
        }
      });
      if (editImageFile) formData.append("image", editImageFile);
      if (editItem.deleteImage) formData.append("deleteImage", "true");
      if (editArquivosFile?.length) editArquivosFile.forEach((f: File) => formData.append("arquivos", f));
      if (filesToRemove.length) formData.append("filesToRemove", filesToRemove.join(","));
      if (editItem.clearArquivos) formData.append("clearArquivos", "true");

      const res = await fetch("/api/admin/animals", { method: "PUT", body: formData });
      if (!res.ok) { const error = await res.json(); alert(`Failed to update animal: ${error.error}`); return; }
      const updated = await res.json();
      setAnimals(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditItem(null); setEditImageFile(null); setEditArquivosFile(null); setFilesToRemove([]);
    } catch (err) { console.error(err); alert("An unexpected error occurred while saving."); }
  };

  const handleRemoveImage = async () => {
    if (!editItem) return;
    try {
      const formData = new FormData();
      Object.keys(editItem).forEach(key => { if (key !== "image" && key !== "deleteImage" && editItem[key] != null) formData.append(key, String(editItem[key])); });
      formData.append("deleteImage", "true");
      const res = await fetch("/api/admin/animals", { method: "PUT", body: formData });
      if (!res.ok) { const error = await res.json(); alert(`Failed to remove image: ${error.error}`); return; }
      const updated = await res.json();
      setAnimals(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditItem(updated); setEditImageFile(null);
    } catch (err) { console.error(err); alert("Error removing image"); }
  };

  const handleRemoveArquivo = (path: string) => {
    if (!editItem) return;
    setFilesToRemove([...filesToRemove, path]);
    const arr = editItem.arquivos ? editItem.arquivos.split(",") : [];
    const updated = arr.filter((f: string) => f !== path);
    setEditItem({ ...editItem, arquivos: updated.length ? updated.join(",") : null, clearArquivos: updated.length === 0 });
  };

  const handleDeleteAnimal = async (id: number) => {
    await fetch("/api/admin/animals", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setAnimals(prev => prev.filter(a => a.id !== id));
    setDeleteConfirmId(null);
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
  const [editColoniaSelectOpen, setEditColoniaSelectOpen] = useState(false);
  const [newAnimalImage, setNewAnimalImage] = useState<File | null>(null);
  const [newAnimalImagePreview, setNewAnimalImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [newAnimalArquivos, setNewAnimalArquivos] = useState<File[] | null>(null);
  const [editArquivosFile, setEditArquivosFile] = useState<File[] | null>(null);

  const handleCreateAnimal = async () => {
    if (!newAnimalNome || !newAnimalChip) return alert("Fill all fields");
    try {
      const formData = new FormData();
      formData.append("nome", newAnimalNome); formData.append("chip", newAnimalChip); formData.append("sex", newAnimalSex.toString());
      if (newAnimalImage) formData.append("image", newAnimalImage);
      if (newAnimalRaca) formData.append("raca", newAnimalRaca);
      if (newAnimalPorte !== null) formData.append("porte", newAnimalPorte.toString());
      if (newAnimalAltura) formData.append("altura", newAnimalAltura);
      if (newAnimalPeso) formData.append("peso", newAnimalPeso);
      if (newAnimalEsterelizacao !== null) formData.append("esterelizacao", newAnimalEsterelizacao.toString());
      if (newAnimalObservações) formData.append("observações", newAnimalObservações);
      if (newAnimalColonia !== null) formData.append("colonia", newAnimalColonia.toString());
      if (newAnimalDataUltimaVacina) formData.append("data_ultima_vacina", newAnimalDataUltimaVacina);
      if (newAnimalDataProximaVacina) formData.append("data_proxima_vacina", newAnimalDataProximaVacina);
      if (newAnimalArquivos?.length) newAnimalArquivos.forEach(f => formData.append("arquivos", f));
      const res = await fetch("/api/admin/animals", { method: "POST", body: formData });
      if (!res.ok) { const error = await res.json(); alert(`Failed to create animal: ${error.error}`); return; }
      const newAnimal = await res.json();
      setAnimals(prev => [...prev, newAnimal]);
      setNewAnimalNome(""); setNewAnimalChip(""); setNewAnimalSex(1); setNewAnimalRaca("");
      setNewAnimalPorte(null); setNewAnimalAltura(""); setNewAnimalPeso("");
      setNewAnimalEsterelizacao(null); setNewAnimalObservações("");
      setNewAnimalDataUltimaVacina(""); setNewAnimalDataProximaVacina("");
      setNewAnimalImage(null); setNewAnimalArquivos(null); setNewAnimalColonia(null);
      setNewAnimalImagePreview(null);
      setCreateAnimalDialogOpen(false);
    } catch (err) { console.error(err); alert("Error creating animal"); }
  };

  const [email, setEmail] = useState("");
  const router = useRouter();
  useEffect(() => {
    const stored = localStorage.getItem("email");
    if (stored) setEmail(stored); else router.push("/login");
  }, [router]);

  const handleLogout = async () => { localStorage.removeItem("email"); await fetch("/api/logout", { method: "POST" }); router.push("/login"); };

  const SortIcon = ({ col }: { col: string }) => {
    if (!sortConfig || sortConfig.key !== col) return <SortAsc className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === "asc" ? <SortAsc className="w-3 h-3 text-orange-500" /> : <SortDesc className="w-3 h-3 text-orange-500" />;
  };

  const filtered = sortData(filterAndSearchData(animals));
  const totalMacho = animals.filter(a => a.sex === 1).length;
  const totalFemea = animals.filter(a => a.sex === 0).length;

  const porteLabel = (p?: number | null) => p === 1 ? "Pequeno" : p === 2 ? "Médio" : p === 3 ? "Grande" : "—";
  const sterilLabel = (e?: number | null) => e === 1 ? "Esterilizado" : e === 2 ? "Não Esterilizado" : "—";

  /* ── shared field styling ── */
  const inputCls = "rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 transition-colors";

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[#fafaf9]">
        <main className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto space-y-6">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-gray-700">
                <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Animais</h1>
                <p className="text-sm text-gray-400">{animals.length} animais registados</p>
              </div>
            </div>
            <Dialog open={createAnimalDialogOpen} onOpenChange={setCreateAnimalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 gap-2">
                  <Plus className="h-4 w-4" /> Novo Animal
                </Button>
              </DialogTrigger>

              {/* ══ CREATE MODAL ══════════════════════════════════════════════════ */}
              <DialogContent className="rounded-3xl max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
                {/* Header strip */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl"><PawPrint className="w-5 h-5 text-white" /></div>
                    <div>
                      <DialogTitle className="text-white text-xl font-bold">Novo Animal</DialogTitle>
                      <p className="text-white/70 text-xs mt-0.5">Preencha os dados do animal</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-5">
                  <ModalSection title="Identificação">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Nome <span className="text-orange-500">*</span></label>
                        <Input placeholder="Ex: Luna" value={newAnimalNome} onChange={e => setNewAnimalNome(e.target.value)} className={inputCls} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Chip <span className="text-orange-500">*</span></label>
                        <Input placeholder="Nº do microchip" value={newAnimalChip} onChange={e => setNewAnimalChip(e.target.value)} className={`${inputCls} font-mono`} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Raça</label>
                        <Input placeholder="Opcional" value={newAnimalRaca} onChange={e => setNewAnimalRaca(e.target.value)} className={inputCls} />
                      </div>
                      <SelectField label="Sexo" value={newAnimalSex} placeholder="Selecionar" options={[{ label: "Macho", value: 1 }, { label: "Fêmea", value: 0 }]} open={createSexOpen} setOpen={setCreateSexOpen} onChange={v => setNewAnimalSex(v)} required />
                    </div>
                  </ModalSection>

                  <ModalSection title="Detalhes Físicos">
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField label="Porte" value={newAnimalPorte} placeholder="Opcional" options={[{ label: "Pequeno", value: 1 }, { label: "Médio", value: 2 }, { label: "Grande", value: 3 }]} open={createPorteOpen} setOpen={setCreatePorteOpen} onChange={v => setNewAnimalPorte(v)} />
                      <SelectField label="Esterilização" value={newAnimalEsterelizacao} placeholder="Opcional" options={[{ label: "Esterilizado", value: 1 }, { label: "Não Esterilizado", value: 2 }]} open={createEsterelizacaoOpen} setOpen={setCreateEsterelizacaoOpen} onChange={v => setNewAnimalEsterelizacao(v)} />
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Altura (cm)</label>
                        <Input type="number" placeholder="—" value={newAnimalAltura} onChange={e => setNewAnimalAltura(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Peso (kg)</label>
                        <Input type="number" step="0.1" placeholder="—" value={newAnimalPeso} onChange={e => setNewAnimalPeso(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  </ModalSection>

                  <ModalSection title="Colónia & Saúde">
                    <div className="space-y-3">
                      {/* Colónia dropdown */}
                      <div className="relative">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Colónia</label>
                        <button type="button" onClick={() => setCreateColoniaOpen(!createColoniaOpen)} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white hover:border-orange-200 transition-colors`}>
                          <span className={newAnimalColonia === null ? "text-gray-400" : "text-gray-900 font-medium"}>{newAnimalColonia === null ? "Nenhuma colónia" : colonias.find(c => c.id === newAnimalColonia)?.nome ?? "Colónia"}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${createColoniaOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {createColoniaOpen && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden max-h-40 overflow-y-auto">
                              <button type="button" onClick={() => { setNewAnimalColonia(null); setCreateColoniaOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 text-gray-400">Nenhuma{newAnimalColonia === null && <Check className="w-4 h-4 text-orange-500" />}</button>
                              {colonias.map(c => (
                                <button key={c.id} type="button" onClick={() => { setNewAnimalColonia(c.id); setCreateColoniaOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50">
                                  {c.nome}{newAnimalColonia === c.id && <Check className="w-4 h-4 text-orange-500" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Última Vacina</label>
                          <Input type="date" value={newAnimalDataUltimaVacina} onChange={e => setNewAnimalDataUltimaVacina(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Próxima Vacina</label>
                          <Input type="date" value={newAnimalDataProximaVacina} onChange={e => setNewAnimalDataProximaVacina(e.target.value)} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  </ModalSection>

                  <ModalSection title="Observações & Ficheiros">
                    <div className="space-y-3">
                      <textarea
                        placeholder="Observações sobre o animal..."
                        value={newAnimalObservações}
                        onChange={e => setNewAnimalObservações(e.target.value)}
                        className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-orange-300 outline-none resize-none transition-colors"
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        {/* Photo upload with preview */}
                        <div>
                          {newAnimalImagePreview ? (
                            <div className="relative h-20 rounded-xl overflow-hidden border-2 border-orange-200">
                              <img src={newAnimalImagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <label className="cursor-pointer text-white text-xs font-semibold flex flex-col items-center gap-1">
                                  <UploadCloud className="w-4 h-4" /> Alterar
                                  <input type="file" accept="image/*" className="sr-only" onChange={e => {
                                    const f = e.target.files?.[0] || null;
                                    setNewAnimalImage(f);
                                    setNewAnimalImagePreview(f ? URL.createObjectURL(f) : null);
                                  }} />
                                </label>
                              </div>
                              <button type="button" onClick={() => { setNewAnimalImage(null); setNewAnimalImagePreview(null); }} className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center gap-2 h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors text-gray-400 hover:text-orange-400">
                              <ImageIcon className="w-5 h-5" />
                              <span className="text-xs font-medium">Foto</span>
                              <input type="file" accept="image/*" className="sr-only" onChange={e => {
                                const f = e.target.files?.[0] || null;
                                setNewAnimalImage(f);
                                setNewAnimalImagePreview(f ? URL.createObjectURL(f) : null);
                              }} />
                            </label>
                          )}
                        </div>
                        <label className="flex flex-col items-center justify-center gap-2 h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors text-gray-400 hover:text-orange-400">
                          <UploadCloud className="w-5 h-5" />
                          <span className="text-xs font-medium">{newAnimalArquivos?.length ? `${newAnimalArquivos.length} ficheiro(s)` : "Arquivos"}</span>
                          <input type="file" accept="*" multiple className="sr-only" onChange={e => setNewAnimalArquivos(e.target.files ? Array.from(e.target.files) : null)} />
                        </label>
                      </div>
                    </div>
                  </ModalSection>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <Button onClick={handleCreateAnimal} disabled={!newAnimalNome || !newAnimalChip} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-semibold shadow-md shadow-orange-200 disabled:opacity-50">
                    Criar Animal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={PawPrint} label="Total de animais" value={animals.length} color="bg-orange-50 text-orange-500" />
            <StatCard icon={Shield} label="Machos" value={totalMacho} color="bg-blue-50 text-blue-500" />
            <StatCard icon={Heart} label="Fêmeas" value={totalFemea} color="bg-pink-50 text-pink-500" />
          </div>

          {/* ── Main table card ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white">

              {/* Search & filters */}
              <CardHeader className="px-6 py-5 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <Input type="text" placeholder="Pesquisar por nome ou chip…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-9 rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 h-10" />
                    {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"><X size={14} /></button>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {([{ label: "Todos", v: null }, { label: "Macho", v: 1 }, { label: "Fêmea", v: 0 }] as const).map(({ label, v }) => (
                      <button
                        key={label}
                        onClick={() => setSexFilter(v as any)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${sexFilter === v
                            ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <Input type="text" placeholder="Raça…" value={raceFilter}
                      onChange={e => { setRaceFilter(e.target.value); setShowRaceSuggestions(true); }}
                      onFocus={() => setShowRaceSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowRaceSuggestions(false), 200)}
                      className="pl-9 pr-8 w-36 rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 h-10 text-sm"
                    />
                    {raceFilter && <button onClick={() => setRaceFilter("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={14} /></button>}
                    <AnimatePresence>
                      {showRaceSuggestions && getRaceSuggestions().length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden">
                          {getRaceSuggestions().filter(r => r.toLowerCase().includes(raceFilter.toLowerCase()) || !raceFilter).map(race => (
                            <button key={race} type="button" onClick={() => { setRaceFilter(race); setShowRaceSuggestions(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50">
                              {race}{raceFilter === race && <Check className="w-4 h-4 text-orange-500" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <PawPrint className="w-12 h-12 mb-3" />
                    <p className="font-semibold text-gray-400">Nenhum animal encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros de pesquisa</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-gray-50/70 border-b border-gray-100">
                        {[
                          { key: "id", label: "ID" },
                          { key: "foto", label: "Foto", noSort: true },
                          { key: "nome", label: "Nome" },
                          { key: "chip", label: "Chip" },
                          { key: "sex", label: "Sexo" },
                          { key: "colonia", label: "Colónia" },
                        ].map(col => (
                          <TableHead
                            key={col.key}
                            onClick={!col.noSort ? () => handleSort(col.key) : undefined}
                            className={`h-11 text-xs font-bold uppercase tracking-wider text-gray-400 ${!col.noSort ? "cursor-pointer select-none hover:text-gray-600" : ""} first:pl-6 last:pr-6`}
                          >
                            <span className="flex items-center gap-1.5">
                              {col.label}
                              {!col.noSort && <SortIcon col={col.key} />}
                            </span>
                          </TableHead>
                        ))}
                        <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider text-gray-400">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((a, i) => (
                        <motion.tr
                          key={a.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="group border-b border-gray-50 hover:bg-orange-50/40 cursor-pointer transition-colors"
                          onClick={() => handleViewAnimal(a)}
                        >
                          <TableCell className="pl-6 font-mono text-xs text-gray-400">#{a.id}</TableCell>
                          <TableCell>
                            {a.image
                              ? <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white shadow-sm"><img src={a.image} alt={a.nome} className="w-full h-full object-cover" /></div>
                              : <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300"><PawPrint className="w-4 h-4" /></div>
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{a.nome}</span>
                              {a.esterelizacao === 1 && (
                                <span title="Esterilizado" className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-400">{a.chip}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${a.sex === 1 ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}>
                              {a.sex === 1 ? "♂ Macho" : "♀ Fêmea"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {a.colonia ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                                <Users className="w-3 h-3" />{colonias.find(c => c.id === a.colonia)?.nome ?? `#${a.colonia}`}
                              </span>
                            ) : <span className="text-gray-200">—</span>}
                          </TableCell>
                          <TableCell className="text-right pr-6" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                onClick={() => { setEditItem({ ...a }); setFilesToRemove([]); }}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                onClick={() => { setDeleteConfirmId(a.id); setDeleteConfirmName(a.nome); }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>

              {filtered.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <p className="text-xs text-gray-400">{filtered.length} de {animals.length} animais</p>
                  {(searchQuery || sexFilter !== null || raceFilter) && (
                    <button onClick={() => { setSearchQuery(""); setSexFilter(null); setRaceFilter(""); }} className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </main>

        {/* ══════════════════════════════════════════════════════════════════
            VIEW MODAL
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog open={!!viewItem} onOpenChange={open => { if (!open) setViewItem(null); }}>
          <DialogContent className="rounded-3xl max-w-2xl p-0 overflow-hidden border-0 shadow-2xl gap-0">
            {viewItem && (
              <>
                {/* Hero header */}
                <div className="relative">
                  {viewItem.image ? (
                    <div className="h-36 w-full overflow-hidden">
                      <img src={viewItem.image} alt={viewItem.nome} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-28 bg-gradient-to-r from-orange-500 to-amber-400" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 flex items-end justify-between">
                    <div>
                      <DialogTitle className="text-white text-2xl font-bold drop-shadow-sm">{viewItem.nome}</DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${viewItem.sex === 1 ? "bg-blue-500/80 text-white" : "bg-pink-500/80 text-white"}`}>
                          {viewItem.sex === 1 ? "♂ Macho" : "♀ Fêmea"}
                        </span>
                        {viewItem.raca && <span className="text-xs text-white/70 font-medium">{viewItem.raca}</span>}
                      </div>
                    </div>
                    <span className="text-white/60 font-mono text-sm">#{viewItem.id}</span>
                  </div>
                  {/* close button */}
                  <button onClick={() => setViewItem(null)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-white">
                  {[{ key: "details", label: "Detalhes" }, { key: "history", label: "Histórico" }].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setViewTab(tab.key as any)}
                      className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors relative ${viewTab === tab.key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {tab.label}
                      {tab.key === "history" && animalHistory.length > 0 && (
                        <span className="ml-1.5 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{animalHistory.length}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab body */}
                <div className="max-h-[50vh] overflow-y-auto bg-white">
                  <AnimatePresence mode="wait">
                    {viewTab === "details" && (
                      <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {/* Copyable chip */}
                          <button
                            type="button"
                            onClick={() => { navigator.clipboard.writeText(viewItem.chip); setCopiedChip(true); setTimeout(() => setCopiedChip(false), 2000); }}
                            className="flex items-start gap-3 p-3 rounded-xl border bg-orange-50 border-orange-100 hover:bg-orange-100 transition-colors text-left group col-span-1"
                          >
                            <Shield className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Chip</p>
                              <p className="text-sm font-semibold text-gray-800 font-mono truncate">{viewItem.chip}</p>
                            </div>
                            <span className="ml-auto text-[10px] text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity self-center flex-shrink-0">{copiedChip ? "✓" : "copiar"}</span>
                          </button>
                          {viewItem.colonia != null && <InfoChip icon={Users} label="Colónia" value={colonias.find(c => c.id === viewItem.colonia)?.nome ?? `#${viewItem.colonia}`} />}
                          {viewItem.porte != null && <InfoChip icon={Activity} label="Porte" value={porteLabel(viewItem.porte)} />}
                          {viewItem.altura != null && <InfoChip icon={Ruler} label="Altura" value={`${viewItem.altura} cm`} />}
                          {viewItem.peso != null && <InfoChip icon={Weight} label="Peso" value={`${viewItem.peso} kg`} />}
                          {viewItem.esterelizacao != null && <InfoChip icon={Heart} label="Esterilização" value={sterilLabel(viewItem.esterelizacao)} />}
                          {viewItem.data_ultima_vacina && <InfoChip icon={Calendar} label="Última Vacina" value={new Date(viewItem.data_ultima_vacina).toLocaleDateString("pt-PT")} />}
                          {viewItem.data_proxima_vacina && (() => {
                            const next = new Date(viewItem.data_proxima_vacina);
                            const today = new Date();
                            const daysLeft = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const isUrgent = daysLeft <= 30;
                            return (
                              <div className={`flex items-start gap-3 p-3 rounded-xl border ${isUrgent ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"}`}>
                                <Calendar className={`w-4 h-4 mt-0.5 ${isUrgent ? "text-red-500" : "text-orange-500"}`} />
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Próxima Vacina</p>
                                  <p className={`text-sm font-semibold ${isUrgent ? "text-red-700" : "text-gray-800"}`}>{next.toLocaleDateString("pt-PT")}</p>
                                  {isUrgent && <p className="text-[10px] text-red-400 mt-0.5 font-medium">{daysLeft <= 0 ? "Em atraso!" : `${daysLeft} dias`}</p>}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {viewItem.observações && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Observações</p>
                            <p className="text-sm text-gray-600 bg-orange-50/50 border border-orange-100 p-3.5 rounded-xl whitespace-pre-wrap">{viewItem.observações}</p>
                          </div>
                        )}

                        {viewItem.arquivos && getArquivosArray(viewItem.arquivos).length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Arquivos ({getArquivosArray(viewItem.arquivos).length})</p>
                            <div className="space-y-2">
                              {getArquivosArray(viewItem.arquivos).map((arq: string, i: number) => (
                                <a key={i} href={arq} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-xl text-sm text-gray-600 hover:text-orange-600 transition-colors group">
                                  <FileText className="w-4 h-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0" />
                                  <span className="truncate">{arq.split('/').pop()}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {viewTab === "history" && (
                      <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4">
                        <div className="flex justify-end">
                          <Button onClick={() => setCreateHistoryDialogOpen(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Novo Evento
                          </Button>
                        </div>
                        {isLoadingHistory ? (
                          <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : animalHistory.length === 0 ? (
                          <div className="text-center py-12">
                            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-gray-400">Sem histórico registado</p>
                            <p className="text-xs text-gray-300 mt-1">Adicione o primeiro evento médico</p>
                          </div>
                        ) : (
                          <div className="relative pl-6">
                            <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-orange-300 to-transparent" />
                            <div className="space-y-3">
                              {animalHistory.map(h => (
                                <div key={h.id} className="relative">
                                  <div className="absolute -left-4 top-3.5 w-2 h-2 rounded-full bg-orange-400 ring-2 ring-white" />
                                  <div className="bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-xl p-4 transition-colors group">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm">{h.titulo}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {new Date(h.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
                                        </p>
                                        {h.ficheiro && (
                                          <a href={h.ficheiro} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-orange-500 hover:text-orange-600 font-medium">
                                            <FileText className="w-3 h-3" /> Ver ficheiro
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditHistoryItem({ id: h.id, titulo: h.titulo, ficheiro: h.ficheiro })} className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => setHistoryToDelete(h.id)} className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer actions */}
                {viewTab === "details" && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <Button onClick={() => { setViewItem(null); setEditItem({ ...viewItem }); setFilesToRemove([]); }} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2">
                      <Pencil className="w-4 h-4" /> Editar
                    </Button>
                    <Button variant="outline" onClick={() => setViewItem(null)} className="flex-1 rounded-xl">Fechar</Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════════════════════════════════
            EDIT MODAL
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog open={!!editItem} onOpenChange={open => {
          if (!open) { setEditItem(null); setFilesToRemove([]); }
          setEditSexOpen(false); setEditPorteOpen(false); setEditEsterelizacaoOpen(false);
          setEditImageFile(null); setEditArquivosFile(null);
        }}>
          <DialogContent className="rounded-3xl max-w-lg p-0 overflow-hidden border-0 shadow-2xl gap-0">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><Pencil className="w-4 h-4 text-white" /></div>
                <div>
                  <DialogTitle className="text-white text-lg font-bold">Editar Animal</DialogTitle>
                  <p className="text-white/70 text-xs mt-0.5">{editItem?.nome}</p>
                </div>
              </div>
            </div>

            {editItem && (
              <>
                <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-5">
                  <ModalSection title="Identificação">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nome <span className="text-orange-500">*</span></label>
                        <Input value={editItem.nome || ""} onChange={e => setEditItem({ ...editItem, nome: e.target.value })} className={inputCls} />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Chip <span className="text-orange-500">*</span></label>
                        <Input value={editItem.chip || ""} onChange={e => setEditItem({ ...editItem, chip: e.target.value })} className={`${inputCls} font-mono`} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Raça</label>
                        <Input value={editItem.raca || ""} onChange={e => setEditItem({ ...editItem, raca: e.target.value })} className={inputCls} />
                      </div>
                      <SelectField label="Sexo" value={editItem.sex} placeholder="Sexo" options={[{ label: "Macho", value: 1 }, { label: "Fêmea", value: 0 }]} open={editSexOpen} setOpen={setEditSexOpen} onChange={v => setEditItem({ ...editItem, sex: v })} required />
                    </div>
                  </ModalSection>

                  <ModalSection title="Detalhes Físicos">
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField label="Porte" value={editItem.porte ?? null} placeholder="Selecionar" options={[{ label: "Pequeno", value: 1 }, { label: "Médio", value: 2 }, { label: "Grande", value: 3 }]} open={editPorteOpen} setOpen={setEditPorteOpen} onChange={v => setEditItem({ ...editItem, porte: v })} />
                      <SelectField label="Esterilização" value={editItem.esterelizacao ?? null} placeholder="Selecionar" options={[{ label: "Esterilizado", value: 1 }, { label: "Não Esterilizado", value: 2 }]} open={editEsterelizacaoOpen} setOpen={setEditEsterelizacaoOpen} onChange={v => setEditItem({ ...editItem, esterelizacao: v })} />
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Altura (cm)</label>
                        <Input type="number" value={editItem.altura || ""} onChange={e => setEditItem({ ...editItem, altura: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Peso (kg)</label>
                        <Input type="number" step="0.1" value={editItem.peso || ""} onChange={e => setEditItem({ ...editItem, peso: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
                      </div>
                    </div>
                  </ModalSection>

                  <ModalSection title="Colónia & Saúde">
                    <div className="space-y-3">
                      {/* Colónia dropdown */}
                      <div className="relative">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">Colónia</label>
                        <button type="button" onClick={() => setEditColoniaSelectOpen(!editColoniaSelectOpen)} className="w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white hover:border-orange-200 transition-colors">
                          <span className={editItem.colonia == null ? "text-gray-400" : "text-gray-900 font-medium"}>{editItem.colonia == null ? "Nenhuma colónia" : colonias.find(c => c.id === editItem.colonia)?.nome ?? `#${editItem.colonia}`}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editColoniaSelectOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {editColoniaSelectOpen && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden max-h-40 overflow-y-auto">
                              <button type="button" onClick={() => { setEditItem({ ...editItem, colonia: null }); setEditColoniaSelectOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 text-gray-400">Nenhuma{editItem.colonia == null && <Check className="w-4 h-4 text-orange-500" />}</button>
                              {colonias.map(c => (
                                <button key={c.id} type="button" onClick={() => { setEditItem({ ...editItem, colonia: c.id }); setEditColoniaSelectOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50">
                                  {c.nome}{editItem.colonia === c.id && <Check className="w-4 h-4 text-orange-500" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Última Vacina</label>
                          <Input type="date" value={editItem.data_ultima_vacina ? new Date(editItem.data_ultima_vacina).toISOString().split('T')[0] : ""} onChange={e => setEditItem({ ...editItem, data_ultima_vacina: e.target.value })} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Próxima Vacina</label>
                          <Input type="date" value={editItem.data_proxima_vacina ? new Date(editItem.data_proxima_vacina).toISOString().split('T')[0] : ""} onChange={e => setEditItem({ ...editItem, data_proxima_vacina: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  </ModalSection>

                  <ModalSection title="Observações">
                    <textarea value={editItem.observações || ""} onChange={e => setEditItem({ ...editItem, observações: e.target.value })} className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-orange-300 outline-none resize-none transition-colors" rows={3} />
                  </ModalSection>

                  <ModalSection title="Foto">
                    {editItem.image ? (
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-gray-100 flex-shrink-0">
                          <img src={editItem.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <label className="flex items-center justify-center gap-2 h-10 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors text-xs text-gray-400 hover:text-orange-400">
                            <UploadCloud className="w-4 h-4" /> {editImageFile ? editImageFile.name.slice(0, 16) + "…" : "Substituir foto"}
                            <input type="file" accept="image/*" className="sr-only" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                          </label>
                          <button type="button" onClick={handleRemoveImage} className="flex items-center justify-center gap-1.5 h-10 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-xl transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Remover foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors text-gray-400 hover:text-orange-400">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-xs font-medium">{editImageFile ? editImageFile.name.slice(0, 20) + "…" : "Adicionar foto"}</span>
                        <input type="file" accept="image/*" className="sr-only" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </ModalSection>

                  <ModalSection title="Arquivos">
                    {editItem.arquivos && getArquivosArray(editItem.arquivos).length > 0 && (
                      <div className="space-y-2 mb-3">
                        {getArquivosArray(editItem.arquivos).map((arq: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                            <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            <a href={arq} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-500 hover:underline flex-1 truncate">{arq.split('/').pop()}</a>
                            <button type="button" onClick={() => handleRemoveArquivo(arq)} className="text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors text-xs text-gray-400 hover:text-orange-400">
                      <UploadCloud className="w-4 h-4" /> {editArquivosFile?.length ? `${editArquivosFile.length} ficheiro(s) selecionado(s)` : "Adicionar arquivos"}
                      <input type="file" accept="*" multiple className="sr-only" onChange={e => setEditArquivosFile(e.target.files ? Array.from(e.target.files) : null)} />
                    </label>
                  </ModalSection>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                  <Button onClick={handleSave} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-md shadow-orange-100">Guardar Alterações</Button>
                  <Button variant="outline" onClick={() => { setEditItem(null); setFilesToRemove([]); }} className="flex-1 rounded-xl">Cancelar</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════════════════════════════════
            CREATE HISTORY MODAL
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog open={createHistoryDialogOpen} onOpenChange={setCreateHistoryDialogOpen}>
          <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-0 shadow-2xl gap-0">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><Clock className="w-4 h-4 text-white" /></div>
                <div>
                  <DialogTitle className="text-white text-lg font-bold">Novo Evento</DialogTitle>
                  <p className="text-white/70 text-xs mt-0.5">Registo médico para {viewItem?.nome}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Título <span className="text-orange-500">*</span></label>
                <Input placeholder="Ex: Vacinação, Consulta, Desparasitação…" value={newHistoryTitulo} onChange={e => setNewHistoryTitulo(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ficheiro <span className="text-gray-300 normal-case font-normal">(opcional)</span></label>
                <label className="flex items-center justify-center gap-2 h-14 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors text-sm text-gray-400 hover:text-orange-400">
                  <UploadCloud className="w-4 h-4" />
                  <span>{newHistoryFicheiro ? newHistoryFicheiro.name : "Clique para selecionar ficheiro"}</span>
                  <input type="file" accept="*" className="sr-only" onChange={e => setNewHistoryFicheiro(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <Button onClick={handleCreateHistory} disabled={!newHistoryTitulo.trim()} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl disabled:opacity-50">Criar Evento</Button>
              <Button variant="outline" onClick={() => { setCreateHistoryDialogOpen(false); setNewHistoryTitulo(""); setNewHistoryFicheiro(null); }} className="flex-1 rounded-xl">Cancelar</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════════════════════════════════
            EDIT HISTORY MODAL
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog open={!!editHistoryItem} onOpenChange={open => { if (!open) { setEditHistoryItem(null); setEditHistoryFicheiro(null); } }}>
          <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-0 shadow-2xl gap-0">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-5 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl"><Pencil className="w-4 h-4 text-white" /></div>
              <div>
                <DialogTitle className="text-white text-lg font-bold">Editar Evento</DialogTitle>
                <p className="text-white/70 text-xs mt-0.5">{editHistoryItem?.titulo}</p>
              </div>
            </div>
            {editHistoryItem && (
              <>
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Título <span className="text-orange-500">*</span></label>
                    <Input placeholder="Título do evento" value={editHistoryItem.titulo} onChange={e => setEditHistoryItem({ ...editHistoryItem, titulo: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ficheiro</label>
                    {editHistoryItem.ficheiro && (
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-50 border border-orange-100 rounded-xl mb-2">
                        <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <a href={editHistoryItem.ficheiro} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline flex-1 truncate">{editHistoryItem.ficheiro.split('/').pop()}</a>
                        <button type="button" onClick={() => setEditHistoryItem({ ...editHistoryItem, ficheiro: "" })} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors text-sm text-gray-400 hover:text-orange-400">
                      <UploadCloud className="w-4 h-4" />
                      <span>{editHistoryFicheiro ? editHistoryFicheiro.name : "Substituir ficheiro"}</span>
                      <input type="file" accept="*" className="sr-only" onChange={e => setEditHistoryFicheiro(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                  <Button onClick={handleUpdateHistory} disabled={!editHistoryItem.titulo.trim()} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl">Guardar</Button>
                  <Button variant="outline" onClick={() => { setEditHistoryItem(null); setEditHistoryFicheiro(null); }} className="flex-1 rounded-xl">Cancelar</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════════════════════════════════
            DELETE HISTORY CONFIRMATION
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog open={!!historyToDelete} onOpenChange={open => { if (!open) setHistoryToDelete(null); }}>
          <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-0 shadow-2xl gap-0">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <DialogTitle className="text-gray-900 text-lg font-bold mb-2">Eliminar evento?</DialogTitle>
              <p className="text-sm text-gray-500">Este evento será eliminado permanentemente. Não é possível desfazer esta ação.</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <Button onClick={handleDeleteHistory} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm shadow-red-200">Eliminar</Button>
              <Button variant="outline" onClick={() => setHistoryToDelete(null)} className="flex-1 rounded-xl">Cancelar</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════════════════════════════════
            DELETE ANIMAL CONFIRMATION
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog open={!!deleteConfirmId} onOpenChange={open => { if (!open) setDeleteConfirmId(null); }}>
          <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-0 shadow-2xl gap-0">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-7 h-7 text-red-400" />
              </div>
              <DialogTitle className="text-gray-900 text-lg font-bold mb-1">Eliminar {deleteConfirmName}?</DialogTitle>
              <p className="text-sm text-gray-500">Todos os dados deste animal serão eliminados permanentemente.</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <Button onClick={() => deleteConfirmId && handleDeleteAnimal(deleteConfirmId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm shadow-red-200">Sim, eliminar</Button>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-xl">Cancelar</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}