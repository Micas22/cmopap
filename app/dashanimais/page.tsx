"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint, Pencil, Trash2, Plus, ChevronDown, Check,
  Image as ImageIcon, X, ArrowLeft, Search,
  AlertTriangle, Calendar, Weight, Ruler, Shield, FileText,
  Clock, UploadCloud, SortAsc, SortDesc,
  Users, Activity, Heart, Syringe, MapPin, Copy, CheckCheck,
  ChevronRight, ChevronLeft, Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const PT_MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const PT_DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
      {children}{required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
  );
}

function ModalSection({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-orange-400" />}
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">{title}</p>
      </div>
      {children}
    </div>
  );
}

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
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white hover:border-orange-200 transition-colors focus:outline-none"
        >
          <span className={selected ? "text-gray-800 font-medium" : "text-gray-400"}>{selected?.label ?? placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl shadow-black/10 overflow-hidden"
            >
              {options.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 transition-colors"
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

function InfoChip({ icon: Icon, label, value, accent, wide }: { icon: any; label: string; value: string; accent?: boolean; wide?: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${accent ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100"} ${wide ? "col-span-2" : ""}`}>
      <div className={`mt-0.5 flex-shrink-0 ${accent ? "text-orange-500" : "text-gray-400"}`}><Icon className="w-4 h-4" /></div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg }: { icon: any; label: string; value: number | string; sub?: string; color: string; bg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
      <div className={`p-2.5 rounded-xl ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none tabular-nums">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function AdminAnimais() {
  type Animal = {
    id: number; nome: string; chip: string; sex: number; image?: string;
    raca?: string; porte?: number; altura?: number; peso?: number;
    esterelizacao?: number; observacoes?: string; arquivos?: string;
    colonia?: number | null; data_ultima_vacina?: string; data_proxima_vacina?: string;
  };
  type Colonia = { id: number; nome: string; animalCount?: number };

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sexFilter, setSexFilter] = useState<number | null>(null);
  const [coloniaFilter, setColoniaFilter] = useState<number | "none" | null>(null);
  const [raceFilter, setRaceFilter] = useState("");
  const [showRaceSuggestions, setShowRaceSuggestions] = useState(false);
  const [createColoniaOpen, setCreateColoniaOpen] = useState(false);
  const [editColoniaSelectOpen, setEditColoniaSelectOpen] = useState(false);
  const [newAnimalColonia, setNewAnimalColonia] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [copiedChip, setCopiedChip] = useState(false);

  // history
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [animalHistory, setAnimalHistory] = useState<{ id: string; titulo: string; ficheiro?: string; created_at: string }[]>([]);
  const [fichasInternamento, setFichasInternamento] = useState<any[]>([]);
  const [tratamentos, setTratamentos] = useState<any[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(new Date().toISOString().slice(0, 10));
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [viewTab, setViewTab] = useState<"details" | "history">("details");
  const [createHistoryDialogOpen, setCreateHistoryDialogOpen] = useState(false);
  const [editHistoryItem, setEditHistoryItem] = useState<{ id: string; titulo: string; ficheiro?: string } | null>(null);
  const [newHistoryTitulo, setNewHistoryTitulo] = useState("");
  const [newHistoryFicheiro, setNewHistoryFicheiro] = useState<File | null>(null);
  const [editHistoryFicheiro, setEditHistoryFicheiro] = useState<File | null>(null);
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null);

  // create/edit animal form
  const [createAnimalDialogOpen, setCreateAnimalDialogOpen] = useState(false);
  const [newAnimalNome, setNewAnimalNome] = useState("");
  const [newAnimalChip, setNewAnimalChip] = useState("");
  const [newAnimalSex, setNewAnimalSex] = useState(1);
  const [newAnimalRaca, setNewAnimalRaca] = useState("");
  const [newAnimalPorte, setNewAnimalPorte] = useState<number | null>(null);
  const [newAnimalAltura, setNewAnimalAltura] = useState("");
  const [newAnimalPeso, setNewAnimalPeso] = useState("");
  const [newAnimalEsterelizacao, setNewAnimalEsterelizacao] = useState<number | null>(null);
  const [newAnimalObservacoes, setNewAnimalObservacoes] = useState("");
  const [newAnimalDataNascimento, setNewAnimalDataNascimento] = useState("");
  const [newAnimalDataUltimaVacina, setNewAnimalDataUltimaVacina] = useState("");
  const [newAnimalDataProximaVacina, setNewAnimalDataProximaVacina] = useState("");
  const [createSexOpen, setCreateSexOpen] = useState(false);
  const [createPorteOpen, setCreatePorteOpen] = useState(false);
  const [createEsterelizacaoOpen, setCreateEsterelizacaoOpen] = useState(false);
  const [editSexOpen, setEditSexOpen] = useState(false);
  const [editPorteOpen, setEditPorteOpen] = useState(false);
  const [editEsterelizacaoOpen, setEditEsterelizacaoOpen] = useState(false);
  const [newAnimalImage, setNewAnimalImage] = useState<File | null>(null);
  const [newAnimalImagePreview, setNewAnimalImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [newAnimalArquivos, setNewAnimalArquivos] = useState<File[] | null>(null);
  const [editArquivosFile, setEditArquivosFile] = useState<File[] | null>(null);

  const router = useRouter();

  /* ── fetchers ── */
  const fetchAnimals = async () => {
    try { const r = await fetch("/api/admin/animals"); const d = await r.json(); setAnimals(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  };
  const fetchColonias = async () => {
    try { const r = await fetch("/api/admin/colonias"); const d = await r.json(); setColonias(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAnimals(); fetchColonias(); }, []);
  useEffect(() => {
    const e = localStorage.getItem("email");
    if (!e) router.push("/login");
  }, [router]);

  // Open modal automatically if ?view=id is in the URL
  useEffect(() => {
    if (animals.length > 0 && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewId = params.get("view");
      if (viewId) {
        const idNum = parseInt(viewId, 10);
        const animal = animals.find(a => a.id === idNum);
        if (animal && !viewItem) {
          handleViewAnimal(animal);
          // Optional: clear the url param so refreshing doesn't keep opening it
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [animals, viewItem]);

  /* ── derived counts ── */
  const coloniasWithCount = colonias.map(c => ({
    ...c,
    animalCount: animals.filter(a => a.colonia === c.id).length,
  }));

  /* ── helpers ── */
  const getArquivosArray = (s?: string | null) => s ? s.split(",").filter(f => f.trim()) : [];
  const porteLabel = (p?: number | null) => ({ 1: "Pequeno", 2: "Médio", 3: "Grande" }[p ?? 0] ?? "—");
  const sterilLabel = (e?: number | null) => e === 1 ? "Esterilizado" : e === 2 ? "Não esterilizado" : "—";
  const inputCls = "rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 transition-colors text-sm";

  /* ── sort / filter ── */
  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc" }));
  };
  const getRaceSuggestions = () => {
    const map: Record<string, number> = {};
    animals.forEach(a => { if (a.raca?.trim()) { const r = a.raca.trim(); map[r] = (map[r] || 0) + 1; } });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 6).map(([r]) => r);
  };
  const filtered = (() => {
    let d = [...animals];
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); d = d.filter(a => a.nome.toLowerCase().includes(q) || a.chip.toLowerCase().includes(q)); }
    if (sexFilter !== null) d = d.filter(a => a.sex === sexFilter);
    if (coloniaFilter === "none") d = d.filter(a => !a.colonia);
    else if (coloniaFilter !== null) d = d.filter(a => a.colonia === coloniaFilter);
    if (raceFilter.trim()) { const q = raceFilter.toLowerCase(); d = d.filter(a => a.raca?.toLowerCase().includes(q)); }
    if (sortConfig) d.sort((a, b) => {
      const va = a[sortConfig.key as keyof Animal], vb = b[sortConfig.key as keyof Animal];
      if (va === vb) return 0; if (va == null) return 1; if (vb == null) return -1;
      return (va < vb ? -1 : 1) * (sortConfig.direction === "asc" ? 1 : -1);
    });
    return d;
  })();

  const SortIcon = ({ col }: { col: string }) => {
    if (!sortConfig || sortConfig.key !== col) return <SortAsc className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === "asc" ? <SortAsc className="w-3 h-3 text-orange-500" /> : <SortDesc className="w-3 h-3 text-orange-500" />;
  };

  const totalSteril = animals.filter(a => a.esterelizacao === 1).length;
  const totalMacho = animals.filter(a => a.sex === 1).length;
  const totalFemea = animals.filter(a => a.sex === 0).length;
  const hasFilters = searchQuery || sexFilter !== null || coloniaFilter !== null || raceFilter;

  /* ── history ── */
  const fetchAnimalHistory = async (a: Animal) => {
    setIsLoadingHistory(true);
    try {
      const p1 = fetch(`/api/admin/animals/history?animalId=${a.id}`).then(r => r.ok ? r.json() : []);
      const p2 = a.chip ? fetch(`/api/admin/internamentos?chip=${encodeURIComponent(a.chip)}`).then(r => r.ok ? r.json() : []) : Promise.resolve([]);
      const p3 = fetch(`/api/admin/tratamentos`).then(r => r.ok ? r.json() : []);
      const [history, fichas, trats] = await Promise.all([p1, p2, p3]);
      setAnimalHistory(Array.isArray(history) ? history : []);
      setFichasInternamento(Array.isArray(fichas) ? fichas : []);
      const fichaIds = new Set((fichas as any[]).map(f => f.id));
      setTratamentos((Array.isArray(trats) ? trats : []).filter(t => fichaIds.has(t.internamento)));
      const d = new Date();
      setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); setSelectedDay(d.toISOString().slice(0, 10));
    } catch (e) { console.error(e); } finally { setIsLoadingHistory(false); }
  };
  const handleViewAnimal = async (a: Animal) => { setViewItem({ ...a }); setViewTab("details"); await fetchAnimalHistory(a); };

  const handleCreateHistory = async () => {
    if (!newHistoryTitulo || !viewItem) return;
    try {
      const fd = new FormData(); fd.append("titulo", newHistoryTitulo); fd.append("animalid", String(viewItem.id));
      if (selectedDay) fd.append("created_at", selectedDay);
      if (newHistoryFicheiro) fd.append("ficheiro", newHistoryFicheiro);
      const r = await fetch("/api/admin/animals/history", { method: "POST", body: fd });
      if (!r.ok) { alert(`Error: ${(await r.json()).error}`); return; }
      const newHistory = await r.clone().json();
      setAnimalHistory(p => [newHistory, ...p]);
      setNewHistoryTitulo(""); setNewHistoryFicheiro(null); setCreateHistoryDialogOpen(false);
    } catch (e) { console.error(e); }
  };
  const handleUpdateHistory = async () => {
    if (!editHistoryItem?.titulo) return;
    try {
      const fd = new FormData(); fd.append("id", editHistoryItem.id); fd.append("titulo", editHistoryItem.titulo);
      if (editHistoryFicheiro) fd.append("ficheiro", editHistoryFicheiro);
      if (!editHistoryItem.ficheiro) fd.append("deleteFile", "true");
      const r = await fetch("/api/admin/animals/history", { method: "PUT", body: fd });
      if (!r.ok) { alert(`Error: ${(await r.json()).error}`); return; }
      const u = await r.json(); setAnimalHistory(p => p.map(h => h.id === u.id ? u : h));
      setEditHistoryItem(null); setEditHistoryFicheiro(null);
    } catch (e) { console.error(e); }
  };
  const handleDeleteHistory = async () => {
    if (!historyToDelete) return;
    try {
      const r = await fetch("/api/admin/animals/history", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: historyToDelete }) });
      if (!r.ok) { alert(`Error: ${(await r.json()).error}`); return; }
      setAnimalHistory(p => p.filter(h => h.id !== historyToDelete)); setHistoryToDelete(null);
    } catch (e) { console.error(e); }
  };

  /* ── save animal ── */
  const handleSave = async () => {
    if (!editItem) return;
    try {
      const fd = new FormData();
      Object.keys(editItem).forEach(k => {
        if (!["image", "deleteImage", "arquivos", "clearArquivos"].includes(k)) {
          const v = editItem[k];
          if (v !== null && v !== undefined && v !== "") fd.append(k, String(v));
          else if (["raca", "observacoes", "porte", "altura", "peso", "esterelizacao", "colonia"].includes(k)) fd.append(k, "");
          else if (v != null) fd.append(k, String(v));
        }
      });
      if (editImageFile) fd.append("image", editImageFile);
      if (editItem.deleteImage) fd.append("deleteImage", "true");
      if (editArquivosFile?.length) editArquivosFile.forEach((f: File) => fd.append("arquivos", f));
      if (filesToRemove.length) fd.append("filesToRemove", filesToRemove.join(","));
      if (editItem.clearArquivos) fd.append("clearArquivos", "true");
      const r = await fetch("/api/admin/animals", { method: "PUT", body: fd });
      if (!r.ok) { alert(`Error: ${(await r.json()).error}`); return; }
      const u = await r.json(); setAnimals(p => p.map(a => a.id === u.id ? u : a));
      setEditItem(null); setEditImageFile(null); setEditArquivosFile(null); setFilesToRemove([]);
    } catch (e) { console.error(e); alert("Erro ao guardar."); }
  };
  const handleRemoveImage = async () => {
    if (!editItem) return;
    try {
      const fd = new FormData();
      Object.keys(editItem).forEach(k => { if (k !== "image" && k !== "deleteImage" && editItem[k] != null) fd.append(k, String(editItem[k])); });
      fd.append("deleteImage", "true");
      const r = await fetch("/api/admin/animals", { method: "PUT", body: fd });
      if (!r.ok) { alert(`Error: ${(await r.json()).error}`); return; }
      const u = await r.json(); setAnimals(p => p.map(a => a.id === u.id ? u : a)); setEditItem(u); setEditImageFile(null);
    } catch (e) { console.error(e); }
  };
  const handleRemoveArquivo = (path: string) => {
    if (!editItem) return;
    setFilesToRemove(p => [...p, path]);
    const arr = editItem.arquivos?.split(",") ?? [];
    const upd = arr.filter((f: string) => f !== path);
    setEditItem({ ...editItem, arquivos: upd.length ? upd.join(",") : null, clearArquivos: upd.length === 0 });
  };
  const handleDeleteAnimal = async (id: number) => {
    await fetch("/api/admin/animals", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setAnimals(p => p.filter(a => a.id !== id)); setDeleteConfirmId(null);
  };

  /* ── create animal ── */
  const handleCreateAnimal = async () => {
    if (!newAnimalNome || !newAnimalChip) return alert("Preencha os campos obrigatórios.");
    try {
      const fd = new FormData();
      fd.append("nome", newAnimalNome); fd.append("chip", newAnimalChip); fd.append("sex", String(newAnimalSex));
      if (newAnimalImage) fd.append("image", newAnimalImage);
      if (newAnimalRaca) fd.append("raca", newAnimalRaca);
      if (newAnimalPorte !== null) fd.append("porte", String(newAnimalPorte));
      if (newAnimalAltura) fd.append("altura", newAnimalAltura);
      if (newAnimalPeso) fd.append("peso", newAnimalPeso);
      if (newAnimalEsterelizacao !== null) fd.append("esterelizacao", String(newAnimalEsterelizacao));
      if (newAnimalObservacoes) fd.append("observacoes", newAnimalObservacoes);
      if (newAnimalColonia !== null) fd.append("colonia", String(newAnimalColonia));
      if (newAnimalDataUltimaVacina) fd.append("data_ultima_vacina", newAnimalDataUltimaVacina);
      if (newAnimalDataProximaVacina) fd.append("data_proxima_vacina", newAnimalDataProximaVacina);
      if (newAnimalDataNascimento) fd.append("data_nascimento", newAnimalDataNascimento);
      if (newAnimalArquivos?.length) newAnimalArquivos.forEach(f => fd.append("arquivos", f));
      const r = await fetch("/api/admin/animals", { method: "POST", body: fd });
      if (!r.ok) { alert(`Error: ${(await r.json()).error}`); return; }
      const n = await r.json(); setAnimals(p => [...p, n]);
      setNewAnimalNome(""); setNewAnimalChip(""); setNewAnimalSex(1); setNewAnimalRaca("");
      setNewAnimalPorte(null); setNewAnimalAltura(""); setNewAnimalPeso(""); setNewAnimalEsterelizacao(null);
      setNewAnimalObservacoes(""); setNewAnimalDataUltimaVacina(""); setNewAnimalDataProximaVacina("");
      setNewAnimalDataNascimento("");
      setNewAnimalImage(null); setNewAnimalImagePreview(null); setNewAnimalArquivos(null); setNewAnimalColonia(null);
      setCreateAnimalDialogOpen(false);
    } catch (e) { console.error(e); alert("Erro ao criar animal."); }
  };

  const byDate = useMemo(() => {
    const m: Record<string, { histories: any[], trats: any[] }> = {};
    for (const h of animalHistory) {
      const d = new Date(h.created_at).toISOString().slice(0, 10);
      if (!m[d]) m[d] = { histories: [], trats: [] };
      m[d].histories.push(h);
    }
    for (const t of tratamentos) {
      const d = new Date(t.dia).toISOString().slice(0, 10);
      if (!m[d]) m[d] = { histories: [], trats: [] };
      m[d].trats.push(t);
    }
    return m;
  }, [animalHistory, tratamentos]);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const todayStr = new Date().toISOString().slice(0, 10);

  const selectedItems = selectedDay ? (byDate[selectedDay] || { histories: [], trats: [] }) : { histories: [], trats: [] };

  const navMonth = (dir: 1 | -1) => {
    let m = calMonth + dir;
    let y = calYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalMonth(m); setCalYear(y);
  };

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#fafaf9]">
        <main className="px-6 md:px-10 py-8 max-w-[1440px] mx-auto space-y-6">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-gray-700">
                <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Animais</h1>
                <p className="text-sm text-gray-400 mt-0.5">{animals.length} registos · {coloniasWithCount.length} colónias</p>
              </div>
            </div>

            <Dialog open={createAnimalDialogOpen} onOpenChange={setCreateAnimalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200/60 gap-2 h-10">
                  <Plus className="h-4 w-4" /> Novo Animal
                </Button>
              </DialogTrigger>

              {/* ════════════════════════════════════════ CREATE MODAL ══ */}
              <DialogContent className="rounded-3xl max-w-lg p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
                <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <PawPrint className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-white text-xl font-extrabold leading-tight">Novo Animal</DialogTitle>
                      <p className="text-white/60 text-xs mt-0.5">Preencha os dados do animal</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 max-h-[62vh] overflow-y-auto space-y-6">

                  <ModalSection title="Identificação" icon={Shield}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <FieldLabel required>Nome</FieldLabel>
                        <Input placeholder="Ex: Luna" value={newAnimalNome} onChange={e => setNewAnimalNome(e.target.value)} className={inputCls} />
                      </div>
                      <div className="col-span-2">
                        <FieldLabel required>Chip</FieldLabel>
                        <Input placeholder="Nº do microchip" value={newAnimalChip} onChange={e => setNewAnimalChip(e.target.value)} className={`${inputCls} font-mono tracking-wider`} />
                      </div>
                      <div>
                        <FieldLabel>Raça</FieldLabel>
                        <Input placeholder="Opcional" value={newAnimalRaca} onChange={e => setNewAnimalRaca(e.target.value)} className={inputCls} />
                      </div>
                      <SelectField label="Sexo" value={newAnimalSex} placeholder="Selecionar" required
                        options={[{ label: "♂ Macho", value: 1 }, { label: "♀ Fêmea", value: 0 }]}
                        open={createSexOpen} setOpen={setCreateSexOpen} onChange={v => setNewAnimalSex(v)} />
                    </div>
                  </ModalSection>

                  <div className="border-t border-dashed border-gray-100" />

                  <ModalSection title="Física & Saúde" icon={Activity}>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField label="Porte" value={newAnimalPorte} placeholder="Opcional"
                        options={[{ label: "Pequeno", value: 1 }, { label: "Médio", value: 2 }, { label: "Grande", value: 3 }]}
                        open={createPorteOpen} setOpen={setCreatePorteOpen} onChange={v => setNewAnimalPorte(v)} />
                      <SelectField label="Esterilização" value={newAnimalEsterelizacao} placeholder="Opcional"
                        options={[{ label: "✓ Esterilizado", value: 1 }, { label: "✗ Não esterilizado", value: 2 }]}
                        open={createEsterelizacaoOpen} setOpen={setCreateEsterelizacaoOpen} onChange={v => setNewAnimalEsterelizacao(v)} />
                      <div className="col-span-2">
                        <FieldLabel>Data de Nascimento</FieldLabel>
                        <Input type="date" value={newAnimalDataNascimento} onChange={e => setNewAnimalDataNascimento(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <FieldLabel>Altura (cm)</FieldLabel>
                        <Input type="number" placeholder="—" value={newAnimalAltura} onChange={e => setNewAnimalAltura(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <FieldLabel>Peso (kg)</FieldLabel>
                        <Input type="number" step="0.1" placeholder="—" value={newAnimalPeso} onChange={e => setNewAnimalPeso(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  </ModalSection>

                  <div className="border-t border-dashed border-gray-100" />

                  <ModalSection title="Colónia & Vacinas" icon={MapPin}>
                    <div className="space-y-3">
                      {/* Colónia dropdown */}
                      <div>
                        <FieldLabel>Colónia</FieldLabel>
                        <div className="relative">
                          <button type="button" onClick={() => setCreateColoniaOpen(!createColoniaOpen)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white hover:border-orange-200 transition-colors">
                            <span className={newAnimalColonia === null ? "text-gray-400" : "text-gray-800 font-medium"}>
                              {newAnimalColonia === null ? "Sem colónia" : colonias.find(c => c.id === newAnimalColonia)?.nome ?? "Colónia"}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${createColoniaOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {createColoniaOpen && (
                              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden max-h-44 overflow-y-auto">
                                <button type="button" onClick={() => { setNewAnimalColonia(null); setCreateColoniaOpen(false); }}
                                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 text-gray-400">
                                  Sem colónia{newAnimalColonia === null && <Check className="w-4 h-4 text-orange-500" />}
                                </button>
                                {coloniasWithCount.map(c => (
                                  <button key={c.id} type="button" onClick={() => { setNewAnimalColonia(c.id); setCreateColoniaOpen(false); }}
                                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50">
                                    <span className={newAnimalColonia === c.id ? "font-semibold text-orange-600" : "text-gray-700"}>{c.nome}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">{c.animalCount} animais</span>
                                      {newAnimalColonia === c.id && <Check className="w-4 h-4 text-orange-500" />}
                                    </div>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel>Última Vacina</FieldLabel>
                          <Input type="date" value={newAnimalDataUltimaVacina} onChange={e => setNewAnimalDataUltimaVacina(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <FieldLabel>Próxima Vacina</FieldLabel>
                          <Input type="date" value={newAnimalDataProximaVacina} onChange={e => setNewAnimalDataProximaVacina(e.target.value)} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  </ModalSection>

                  <div className="border-t border-dashed border-gray-100" />

                  <ModalSection title="Notas & Média" icon={FileText}>
                    <textarea placeholder="Observações sobre o animal…"
                      value={newAnimalObservacoes} onChange={e => setNewAnimalObservacoes(e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-orange-300 outline-none resize-none transition-colors"
                      rows={3} />

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {/* Photo with preview */}
                      <div>
                        {newAnimalImagePreview ? (
                          <div className="relative h-24 rounded-xl overflow-hidden border-2 border-orange-200 group">
                            <img src={newAnimalImagePreview} alt="preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                              <label className="cursor-pointer p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors">
                                <UploadCloud className="w-4 h-4" />
                                <input type="file" accept="image/*" className="sr-only" onChange={e => {
                                  const f = e.target.files?.[0] || null;
                                  setNewAnimalImage(f); setNewAnimalImagePreview(f ? URL.createObjectURL(f) : null);
                                }} />
                              </label>
                              <button type="button" onClick={() => { setNewAnimalImage(null); setNewAnimalImagePreview(null); }}
                                className="p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-colors text-gray-300 hover:text-orange-400">
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-xs font-semibold">Foto</span>
                            <input type="file" accept="image/*" className="sr-only" onChange={e => {
                              const f = e.target.files?.[0] || null;
                              setNewAnimalImage(f); setNewAnimalImagePreview(f ? URL.createObjectURL(f) : null);
                            }} />
                          </label>
                        )}
                      </div>
                      <label className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-colors text-gray-300 hover:text-orange-400">
                        <UploadCloud className="w-5 h-5" />
                        <span className="text-xs font-semibold text-center">
                          {newAnimalArquivos?.length ? `${newAnimalArquivos.length} ficheiro(s)` : "Arquivos"}
                        </span>
                        <input type="file" accept="*" multiple className="sr-only" onChange={e => setNewAnimalArquivos(e.target.files ? Array.from(e.target.files) : null)} />
                      </label>
                    </div>
                  </ModalSection>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                  <Button onClick={handleCreateAnimal} disabled={!newAnimalNome || !newAnimalChip}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold shadow-md shadow-orange-200 disabled:opacity-40">
                    Criar Animal
                  </Button>
                  <Button variant="outline" onClick={() => setCreateAnimalDialogOpen(false)} className="rounded-xl h-11 px-5">
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={PawPrint} label="Total" value={animals.length} color="text-orange-500" bg="bg-orange-50" />
            <StatCard icon={Shield} label="Machos" value={totalMacho} color="text-blue-500" bg="bg-blue-50" />
            <StatCard icon={Heart} label="Fêmeas" value={totalFemea} color="text-pink-500" bg="bg-pink-50" />
            <StatCard icon={Syringe} label="Esterilizados" value={totalSteril}
              sub={`${animals.length ? Math.round(totalSteril / animals.length * 100) : 0}% do total`}
              color="text-green-500" bg="bg-green-50" />
          </div>

          {/* ── Colónia quick-filter row ── */}
          {coloniasWithCount.length > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300 mr-1">Colónia</span>
              <button
                onClick={() => setColoniaFilter(null)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${coloniaFilter === null ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200" : "bg-white text-gray-500 border-gray-200 hover:border-orange-200"}`}>
                Todas
              </button>
              <button
                onClick={() => setColoniaFilter("none")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${coloniaFilter === "none" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
                Sem colónia
                <span className="ml-1.5 opacity-60">{animals.filter(a => !a.colonia).length}</span>
              </button>
              {coloniasWithCount.map(c => (
                <button key={c.id}
                  onClick={() => setColoniaFilter(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${coloniaFilter === c.id ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200" : "bg-white text-gray-500 border-gray-200 hover:border-orange-200"}`}>
                  <MapPin className="w-3 h-3" />
                  {c.nome}
                  <span className={`font-bold ${coloniaFilter === c.id ? "text-white/80" : "text-gray-400"}`}>{c.animalCount}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Table card ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card className="rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white">

              {/* Search bar */}
              <CardHeader className="px-6 py-4 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                    <Input placeholder="Pesquisar por nome ou chip…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 pr-9 rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 h-10 text-sm" />
                    {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={14} /></button>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {([{ label: "Todos", v: null }, { label: "♂ Macho", v: 1 }, { label: "♀ Fêmea", v: 0 }] as const).map(({ label, v }) => (
                      <button key={label} onClick={() => setSexFilter(v as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${sexFilter === v ? "bg-orange-500 text-white shadow-sm shadow-orange-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                    <Input placeholder="Raça…" value={raceFilter}
                      onChange={e => { setRaceFilter(e.target.value); setShowRaceSuggestions(true); }}
                      onFocus={() => setShowRaceSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowRaceSuggestions(false), 180)}
                      className="pl-9 pr-8 w-36 rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 h-10 text-sm" />
                    {raceFilter && <button onClick={() => setRaceFilter("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={13} /></button>}
                    <AnimatePresence>
                      {showRaceSuggestions && getRaceSuggestions().length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute z-50 w-48 mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden">
                          {getRaceSuggestions().filter(r => r.toLowerCase().includes(raceFilter.toLowerCase()) || !raceFilter).map(race => (
                            <button key={race} type="button" onClick={() => { setRaceFilter(race); setShowRaceSuggestions(false); }}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50">
                              <span className={raceFilter === race ? "font-semibold text-orange-600" : "text-gray-700"}>{race}</span>
                              {raceFilter === race && <Check className="w-4 h-4 text-orange-500" />}
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
                  <div className="flex flex-col items-center justify-center py-24 text-gray-200">
                    <PawPrint className="w-14 h-14 mb-4" />
                    <p className="font-bold text-gray-400 text-base">Nenhum animal encontrado</p>
                    <p className="text-sm text-gray-300 mt-1">Tente ajustar os filtros</p>
                    {hasFilters && (
                      <button onClick={() => { setSearchQuery(""); setSexFilter(null); setColoniaFilter(null); setRaceFilter(""); }}
                        className="mt-4 text-xs text-orange-500 hover:text-orange-600 font-semibold underline underline-offset-2">
                        Limpar todos os filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-gray-50/60 border-b border-gray-100">
                        {[
                          { key: "id", label: "ID" },
                          { key: "foto", label: "Foto", noSort: true },
                          { key: "nome", label: "Nome" },
                          { key: "chip", label: "Chip" },
                          { key: "sex", label: "Sexo" },
                          { key: "colonia", label: "Colónia" },
                          { key: "vacina", label: "Vacina", noSort: true },
                        ].map(col => (
                          <TableHead key={col.key}
                            onClick={!col.noSort ? () => handleSort(col.key) : undefined}
                            className={`h-10 text-[11px] font-black uppercase tracking-wider text-gray-400 first:pl-6 ${!col.noSort ? "cursor-pointer hover:text-gray-600 select-none" : ""}`}>
                            <span className="flex items-center gap-1.5">{col.label}{!col.noSort && <SortIcon col={col.key} />}</span>
                          </TableHead>
                        ))}
                        <TableHead className="text-right pr-6 text-[11px] font-black uppercase tracking-wider text-gray-400">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((a, i) => {
                        const daysLeft = a.data_proxima_vacina
                          ? Math.ceil((new Date(a.data_proxima_vacina).getTime() - Date.now()) / 86400000)
                          : null;
                        const vaccineUrgent = daysLeft !== null && daysLeft <= 30;
                        return (
                          <motion.tr key={a.id}
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.015, 0.3) }}
                            className="group border-b border-gray-50/80 hover:bg-orange-50/30 cursor-pointer transition-colors"
                            onClick={() => handleViewAnimal(a)}>
                            <TableCell className="pl-6 font-mono text-[11px] text-gray-300">#{a.id}</TableCell>
                            <TableCell>
                              {a.image
                                ? <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white shadow-sm"><img src={a.image} alt={a.nome} className="w-full h-full object-cover" /></div>
                                : <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300"><PawPrint className="w-4 h-4" /></div>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800 text-sm">{a.nome}</span>
                                {a.esterelizacao === 1 && <span title="Esterilizado" className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
                              </div>
                              {a.raca && <p className="text-[11px] text-gray-400 mt-0.5">{a.raca}</p>}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-gray-400">{a.chip}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${a.sex === 1 ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}>
                                {a.sex === 1 ? "♂ Macho" : "♀ Fêmea"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {a.colonia
                                ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
                                  <MapPin className="w-3 h-3" />{colonias.find(c => c.id === a.colonia)?.nome ?? `#${a.colonia}`}
                                </span>
                                : <span className="text-gray-200 text-xs">—</span>}
                            </TableCell>
                            <TableCell>
                              {daysLeft !== null ? (
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${vaccineUrgent ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                                  <Syringe className="w-3 h-3" />
                                  {daysLeft <= 0 ? "Atrasada" : `${daysLeft}d`}
                                </span>
                              ) : <span className="text-gray-200 text-xs">—</span>}
                            </TableCell>
                            <TableCell className="text-right pr-6" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                  onClick={() => { setEditItem({ ...a }); setFilesToRemove([]); }}>
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  onClick={() => { setDeleteConfirmId(a.id); setDeleteConfirmName(a.nome); }}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>

              {filtered.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <p className="text-xs text-gray-400 tabular-nums">{filtered.length} de {animals.length} animais</p>
                  {hasFilters && (
                    <button onClick={() => { setSearchQuery(""); setSexFilter(null); setColoniaFilter(null); setRaceFilter(""); }}
                      className="text-xs text-orange-500 hover:text-orange-600 font-semibold">
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </main>

        {/* ════════════════════════════════════════════════ VIEW MODAL ══ */}
        <Dialog open={!!viewItem} onOpenChange={open => { if (!open) setViewItem(null); }}>
          <DialogContent className="rounded-3xl max-w-2xl p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
            {viewItem && (() => {
              const daysLeft = viewItem.data_proxima_vacina
                ? Math.ceil((new Date(viewItem.data_proxima_vacina).getTime() - Date.now()) / 86400000) : null;
              const vaccineUrgent = daysLeft !== null && daysLeft <= 30;
              return (
                <>
                  {/* Hero */}
                  <div className="relative overflow-hidden">
                    {viewItem.image ? (
                      <div className="h-40 w-full">
                        <img src={viewItem.image} alt={viewItem.nome} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 flex items-end justify-between">
                      <div>
                        <DialogTitle className="text-white text-2xl font-extrabold leading-tight drop-shadow">{viewItem.nome}</DialogTitle>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${viewItem.sex === 1 ? "bg-blue-500/70 text-white" : "bg-pink-500/70 text-white"}`}>
                            {viewItem.sex === 1 ? "♂ Macho" : "♀ Fêmea"}
                          </span>
                          {viewItem.raca && <span className="text-xs text-white/70 font-medium">{viewItem.raca}</span>}
                          {viewItem.esterelizacao === 1 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/70 text-white">Esterilizado</span>}
                          {vaccineUrgent && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/80 text-white flex items-center gap-1">
                              <Syringe className="w-3 h-3" />{daysLeft! <= 0 ? "Vacina atrasada" : `Vacina em ${daysLeft}d`}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-white/40 font-mono text-sm mb-0.5">#{viewItem.id}</span>
                    </div>
                    <button onClick={() => setViewItem(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-100 bg-white px-2">
                    {[{ key: "details", label: "Detalhes" }, { key: "history", label: "Histórico" }].map(tab => (
                      <button key={tab.key} onClick={() => setViewTab(tab.key as any)}
                        className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-all ${viewTab === tab.key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                        {tab.label}
                        {tab.key === "history" && animalHistory.length > 0 && (
                          <span className="ml-2 bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{animalHistory.length}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Body */}
                  <div className="max-h-[48vh] overflow-y-auto bg-white">
                    <AnimatePresence mode="wait">
                      {viewTab === "details" && (
                        <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {/* Copyable chip */}
                            <button type="button"
                              onClick={() => { navigator.clipboard.writeText(viewItem.chip); setCopiedChip(true); setTimeout(() => setCopiedChip(false), 2000); }}
                              className="flex items-start gap-3 p-3.5 rounded-2xl border bg-orange-50 border-orange-100 hover:bg-orange-100 transition-colors text-left group">
                              <Shield className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Chip</p>
                                <p className="text-sm font-bold text-gray-800 font-mono truncate">{viewItem.chip}</p>
                              </div>
                              <span className="text-orange-400 flex-shrink-0 self-center transition-opacity opacity-0 group-hover:opacity-100">
                                {copiedChip ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </span>
                            </button>

                            {viewItem.colonia != null && (
                              <InfoChip icon={MapPin} label="Colónia" value={colonias.find(c => c.id === viewItem.colonia)?.nome ?? `#${viewItem.colonia}`} />
                            )}
                            {viewItem.data_nascimento && (() => {
                              const bd = new Date(viewItem.data_nascimento);
                              const now = new Date();
                              let age = now.getFullYear() - bd.getFullYear();
                              const m = now.getMonth() - bd.getMonth();
                              if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
                              return <InfoChip icon={Calendar} label="Idade" value={`${age} ${age === 1 ? 'ano' : 'anos'} (${bd.toLocaleDateString("pt-PT")})`} />;
                            })()}
                            {viewItem.porte != null && <InfoChip icon={Layers} label="Porte" value={porteLabel(viewItem.porte)} />}
                            {viewItem.altura != null && <InfoChip icon={Ruler} label="Altura" value={`${viewItem.altura} cm`} />}
                            {viewItem.peso != null && <InfoChip icon={Weight} label="Peso" value={`${viewItem.peso} kg`} />}
                            {viewItem.esterelizacao != null && <InfoChip icon={Heart} label="Esterilização" value={sterilLabel(viewItem.esterelizacao)} accent={viewItem.esterelizacao === 1} />}
                            {viewItem.data_ultima_vacina && <InfoChip icon={Syringe} label="Última Vacina" value={new Date(viewItem.data_ultima_vacina).toLocaleDateString("pt-PT")} />}

                            {/* Vaccine urgency chip */}
                            {viewItem.data_proxima_vacina && (
                              <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${vaccineUrgent ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"}`}>
                                <Calendar className={`w-4 h-4 mt-0.5 flex-shrink-0 ${vaccineUrgent ? "text-red-500" : "text-orange-500"}`} />
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Próxima Vacina</p>
                                  <p className={`text-sm font-bold ${vaccineUrgent ? "text-red-700" : "text-gray-800"}`}>
                                    {new Date(viewItem.data_proxima_vacina).toLocaleDateString("pt-PT")}
                                  </p>
                                  {vaccineUrgent && (
                                    <p className="text-[10px] font-bold text-red-400 mt-0.5">
                                      {daysLeft! <= 0 ? "⚠ Em atraso!" : `⚠ Em ${daysLeft} dias`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {viewItem.observacoes && (
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Observações</p>
                              <p className="text-sm text-gray-600 bg-orange-50/60 border border-orange-100 px-4 py-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed">{viewItem.observacoes}</p>
                            </div>
                          )}

                          {viewItem.arquivos && getArquivosArray(viewItem.arquivos).length > 0 && (
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Arquivos ({getArquivosArray(viewItem.arquivos).length})</p>
                              <div className="space-y-2">
                                {getArquivosArray(viewItem.arquivos).map((arq: string, i: number) => (
                                  <a key={i} href={arq} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-xl text-sm text-gray-600 hover:text-orange-600 transition-colors group">
                                    <FileText className="w-4 h-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0" />
                                    <span className="truncate font-medium">{arq.split('/').pop()}</span>
                                    <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-orange-400" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {viewTab === "history" && (
                        <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                          {isLoadingHistory ? (
                            <div className="flex justify-center py-14">
                              <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <div className="flex flex-col md:flex-row gap-5">
                              {/* Calendar */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                  <button onClick={() => navMonth(-1)} className="p-2 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <h3 className="text-sm font-extrabold text-gray-700 capitalize">
                                    {PT_MONTHS[calMonth]} {calYear}
                                  </h3>
                                  <button onClick={() => navMonth(1)} className="p-2 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-7 mb-1">
                                  {PT_DAYS_SHORT.map(d => <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-gray-300 py-1">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                                  {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                    const hasItems = !!(byDate[dateStr]?.histories.length || byDate[dateStr]?.trats.length);
                                    const isToday = dateStr === todayStr;
                                    const isSelected = dateStr === selectedDay;
                                    return (
                                      <button key={day} onClick={() => setSelectedDay(dateStr)}
                                        className={`relative aspect-square rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5
                                          ${isSelected ? "bg-orange-500 text-white shadow-md shadow-orange-200" :
                                            isToday ? "bg-orange-50 text-orange-600 border-2 border-orange-200" :
                                              "hover:bg-gray-50 text-gray-600"}`}>
                                        {day}
                                        {hasItems && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-orange-400"}`} />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {/* Day Panel */}
                              <div className="md:w-64 flex flex-col">
                                {selectedDay ? (
                                  <>
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">
                                          {new Date(selectedDay + "T00:00:00").toLocaleDateString("pt-PT", { weekday: "long" })}
                                        </p>
                                        <p className="text-sm font-extrabold text-gray-800">{new Date(selectedDay).toLocaleDateString("pt-PT")}</p>
                                      </div>
                                      <button onClick={() => setCreateHistoryDialogOpen(true)}
                                        className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200 transition-colors">
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    
                                    <div className="flex-1 space-y-2 overflow-y-auto max-h-60 pr-0.5">
                                      {selectedItems.histories.length === 0 && selectedItems.trats.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                          <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-gray-300" />
                                          </div>
                                          <p className="text-xs text-gray-400 font-medium">Sem eventos neste dia</p>
                                        </div>
                                      ) : (
                                        <>
                                          {selectedItems.trats.map((t: any) => (
                                            <motion.div key={`t-${t.id}`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                                              className="group flex items-start gap-2.5 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm transition-all">
                                              <div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Syringe className="w-3.5 h-3.5 text-blue-500" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Tratamento</p>
                                                <p className="text-sm font-bold text-gray-800 truncate">{t.medicacao}</p>
                                                {t.dose && <p className="text-xs text-gray-500">{t.dose}</p>}
                                              </div>
                                            </motion.div>
                                          ))}
                                          {selectedItems.histories.map((h: any) => (
                                            <motion.div key={`h-${h.id}`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                                              className="group flex items-start gap-2.5 p-3 bg-white rounded-2xl border border-gray-100 hover:border-orange-100 shadow-sm transition-all">
                                              <div className="w-7 h-7 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Clock className="w-3.5 h-3.5 text-orange-400" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 leading-snug">{h.titulo}</p>
                                                {h.ficheiro && (
                                                  <a href={h.ficheiro} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-orange-500 hover:text-orange-600 font-semibold">
                                                    <FileText className="w-3 h-3" /> Ver ficheiro
                                                  </a>
                                                )}
                                              </div>
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button onClick={() => setEditHistoryItem({ id: h.id, titulo: h.titulo, ficheiro: h.ficheiro })}
                                                  className="p-1.5 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => setHistoryToDelete(h.id)}
                                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                              </div>
                                            </motion.div>
                                          ))}
                                        </>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center flex-1 py-12 gap-3 text-center">
                                    <div className="w-14 h-14 bg-orange-50 rounded-3xl flex items-center justify-center">
                                      <Calendar className="w-7 h-7 text-orange-300" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500">Selecione um dia</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {viewTab === "details" && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                      <Button onClick={() => { setViewItem(null); setEditItem({ ...viewItem }); setFilesToRemove([]); }}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2 font-bold">
                        <Pencil className="w-4 h-4" /> Editar
                      </Button>
                      <Button variant="outline" onClick={() => setViewItem(null)} className="rounded-xl px-6">Fechar</Button>
                    </div>
                  )}
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════════════════ EDIT MODAL ══ */}
        <Dialog open={!!editItem} onOpenChange={open => {
          if (!open) { setEditItem(null); setFilesToRemove([]); setEditImageFile(null); setEditArquivosFile(null); }
          setEditSexOpen(false); setEditPorteOpen(false); setEditEsterelizacaoOpen(false); setEditColoniaSelectOpen(false);
        }}>
          <DialogContent className="rounded-3xl max-w-lg p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
            <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-xl font-extrabold leading-tight">Editar Animal</DialogTitle>
                  <p className="text-white/60 text-xs mt-0.5">{editItem?.nome}</p>
                </div>
              </div>
            </div>

            {editItem && (
              <>
                <div className="px-6 py-5 max-h-[62vh] overflow-y-auto space-y-6">
                  <ModalSection title="Identificação" icon={Shield}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <FieldLabel required>Nome</FieldLabel>
                        <Input value={editItem.nome || ""} onChange={e => setEditItem({ ...editItem, nome: e.target.value })} className={inputCls} />
                      </div>
                      <div className="col-span-2">
                        <FieldLabel required>Chip</FieldLabel>
                        <Input value={editItem.chip || ""} onChange={e => setEditItem({ ...editItem, chip: e.target.value })} className={`${inputCls} font-mono tracking-wider`} />
                      </div>
                      <div>
                        <FieldLabel>Raça</FieldLabel>
                        <Input value={editItem.raca || ""} onChange={e => setEditItem({ ...editItem, raca: e.target.value })} className={inputCls} />
                      </div>
                      <SelectField label="Sexo" value={editItem.sex} placeholder="Sexo" required
                        options={[{ label: "♂ Macho", value: 1 }, { label: "♀ Fêmea", value: 0 }]}
                        open={editSexOpen} setOpen={setEditSexOpen} onChange={v => setEditItem({ ...editItem, sex: v })} />
                    </div>
                  </ModalSection>

                  <div className="border-t border-dashed border-gray-100" />

                  <ModalSection title="Física & Saúde" icon={Activity}>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField label="Porte" value={editItem.porte ?? null} placeholder="Selecionar"
                        options={[{ label: "Pequeno", value: 1 }, { label: "Médio", value: 2 }, { label: "Grande", value: 3 }]}
                        open={editPorteOpen} setOpen={setEditPorteOpen} onChange={v => setEditItem({ ...editItem, porte: v })} />
                      <SelectField label="Esterilização" value={editItem.esterelizacao ?? null} placeholder="Selecionar"
                        options={[{ label: "✓ Esterilizado", value: 1 }, { label: "✗ Não esterilizado", value: 2 }]}
                        open={editEsterelizacaoOpen} setOpen={setEditEsterelizacaoOpen} onChange={v => setEditItem({ ...editItem, esterelizacao: v })} />
                      <div className="col-span-2">
                        <FieldLabel>Data de Nascimento</FieldLabel>
                        <Input type="date" value={editItem.data_nascimento ? new Date(editItem.data_nascimento).toISOString().split('T')[0] : ""}
                          onChange={e => setEditItem({ ...editItem, data_nascimento: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <FieldLabel>Altura (cm)</FieldLabel>
                        <Input type="number" value={editItem.altura || ""} onChange={e => setEditItem({ ...editItem, altura: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
                      </div>
                      <div>
                        <FieldLabel>Peso (kg)</FieldLabel>
                        <Input type="number" step="0.1" value={editItem.peso || ""} onChange={e => setEditItem({ ...editItem, peso: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
                      </div>
                    </div>
                  </ModalSection>

                  <div className="border-t border-dashed border-gray-100" />

                  <ModalSection title="Colónia & Vacinas" icon={MapPin}>
                    <div className="space-y-3">
                      <div>
                        <FieldLabel>Colónia</FieldLabel>
                        <div className="relative">
                          <button type="button" onClick={() => setEditColoniaSelectOpen(!editColoniaSelectOpen)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white hover:border-orange-200 transition-colors">
                            <span className={editItem.colonia == null ? "text-gray-400" : "text-gray-800 font-medium"}>
                              {editItem.colonia == null ? "Sem colónia" : colonias.find(c => c.id === editItem.colonia)?.nome ?? `#${editItem.colonia}`}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editColoniaSelectOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {editColoniaSelectOpen && (
                              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden max-h-44 overflow-y-auto">
                                <button type="button" onClick={() => { setEditItem({ ...editItem, colonia: null }); setEditColoniaSelectOpen(false); }}
                                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 text-gray-400">
                                  Sem colónia{editItem.colonia == null && <Check className="w-4 h-4 text-orange-500" />}
                                </button>
                                {coloniasWithCount.map(c => (
                                  <button key={c.id} type="button" onClick={() => { setEditItem({ ...editItem, colonia: c.id }); setEditColoniaSelectOpen(false); }}
                                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50">
                                    <span className={editItem.colonia === c.id ? "font-semibold text-orange-600" : "text-gray-700"}>{c.nome}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">{c.animalCount} animais</span>
                                      {editItem.colonia === c.id && <Check className="w-4 h-4 text-orange-500" />}
                                    </div>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel>Última Vacina</FieldLabel>
                          <Input type="date" value={editItem.data_ultima_vacina ? new Date(editItem.data_ultima_vacina).toISOString().split('T')[0] : ""}
                            onChange={e => setEditItem({ ...editItem, data_ultima_vacina: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <FieldLabel>Próxima Vacina</FieldLabel>
                          <Input type="date" value={editItem.data_proxima_vacina ? new Date(editItem.data_proxima_vacina).toISOString().split('T')[0] : ""}
                            onChange={e => setEditItem({ ...editItem, data_proxima_vacina: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  </ModalSection>

                  <div className="border-t border-dashed border-gray-100" />

                  <ModalSection title="Notas" icon={FileText}>
                    <textarea value={editItem.observacoes || ""} onChange={e => setEditItem({ ...editItem, observacoes: e.target.value })}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl focus:border-orange-300 outline-none resize-none transition-colors leading-relaxed"
                      rows={3} placeholder="Observações sobre o animal…" />
                  </ModalSection>

                  <div className="border-t border-dashed border-gray-100" />

                  <ModalSection title="Foto" icon={ImageIcon}>
                    {editItem.image ? (
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-orange-100 flex-shrink-0">
                          <img src={editItem.image} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <label className="flex items-center justify-center gap-2 h-10 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-colors text-xs font-semibold text-gray-400 hover:text-orange-400">
                            <UploadCloud className="w-4 h-4" /> {editImageFile ? editImageFile.name.slice(0, 18) + "…" : "Substituir foto"}
                            <input type="file" accept="image/*" className="sr-only" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                          </label>
                          <button type="button" onClick={handleRemoveImage}
                            className="flex items-center justify-center gap-1.5 h-10 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-xl transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Remover foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-colors text-gray-300 hover:text-orange-400">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-xs font-semibold">{editImageFile ? editImageFile.name.slice(0, 22) + "…" : "Adicionar foto"}</span>
                        <input type="file" accept="image/*" className="sr-only" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </ModalSection>

                  <ModalSection title="Arquivos" icon={FileText}>
                    {editItem.arquivos && getArquivosArray(editItem.arquivos).length > 0 && (
                      <div className="space-y-2 mb-3">
                        {getArquivosArray(editItem.arquivos).map((arq: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                            <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            <a href={arq} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-500 hover:underline flex-1 truncate font-medium">{arq.split('/').pop()}</a>
                            <button type="button" onClick={() => handleRemoveArquivo(arq)} className="text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-colors text-xs font-semibold text-gray-400 hover:text-orange-400">
                      <UploadCloud className="w-4 h-4" /> {editArquivosFile?.length ? `${editArquivosFile.length} ficheiro(s)` : "Adicionar arquivos"}
                      <input type="file" accept="*" multiple className="sr-only" onChange={e => setEditArquivosFile(e.target.files ? Array.from(e.target.files) : null)} />
                    </label>
                  </ModalSection>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                  <Button onClick={handleSave} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold shadow-md shadow-orange-200">
                    Guardar Alterações
                  </Button>
                  <Button variant="outline" onClick={() => { setEditItem(null); setFilesToRemove([]); }} className="rounded-xl h-11 px-5">
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════════ CREATE HISTORY MODAL ══ */}
        <Dialog open={createHistoryDialogOpen} onOpenChange={setCreateHistoryDialogOpen}>
          <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
            <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Clock className="w-5 h-5 text-white" /></div>
                <div>
                  <DialogTitle className="text-white text-lg font-extrabold">Novo Evento</DialogTitle>
                  <p className="text-white/60 text-xs mt-0.5">Registo médico · {viewItem?.nome}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <FieldLabel required>Título</FieldLabel>
                <Input placeholder="Ex: Vacinação, Consulta, Desparasitação…" value={newHistoryTitulo}
                  onChange={e => setNewHistoryTitulo(e.target.value)} className={inputCls} />
              </div>
              <div>
                <FieldLabel>Ficheiro <span className="text-gray-300 font-normal normal-case">(opcional)</span></FieldLabel>
                <label className="flex items-center justify-center gap-2 h-14 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-colors text-sm font-medium text-gray-400 hover:text-orange-400">
                  <UploadCloud className="w-4 h-4" />
                  <span>{newHistoryFicheiro ? newHistoryFicheiro.name : "Clique para selecionar"}</span>
                  <input type="file" accept="*" className="sr-only" onChange={e => setNewHistoryFicheiro(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
              <Button onClick={handleCreateHistory} disabled={!newHistoryTitulo.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold disabled:opacity-40">
                Criar Evento
              </Button>
              <Button variant="outline" onClick={() => { setCreateHistoryDialogOpen(false); setNewHistoryTitulo(""); setNewHistoryFicheiro(null); }}
                className="rounded-xl h-11 px-5">Cancelar</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════════ EDIT HISTORY MODAL ══ */}
        <Dialog open={!!editHistoryItem} onOpenChange={open => { if (!open) { setEditHistoryItem(null); setEditHistoryFicheiro(null); } }}>
          <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
            <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Pencil className="w-4 h-4 text-white" /></div>
                <div>
                  <DialogTitle className="text-white text-lg font-extrabold">Editar Evento</DialogTitle>
                  <p className="text-white/60 text-xs mt-0.5 truncate max-w-[240px]">{editHistoryItem?.titulo}</p>
                </div>
              </div>
            </div>
            {editHistoryItem && (
              <>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <FieldLabel required>Título</FieldLabel>
                    <Input value={editHistoryItem.titulo}
                      onChange={e => setEditHistoryItem({ ...editHistoryItem, titulo: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Ficheiro</FieldLabel>
                    {editHistoryItem.ficheiro && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl mb-2">
                        <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <a href={editHistoryItem.ficheiro} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-orange-600 hover:underline flex-1 truncate font-medium">{editHistoryItem.ficheiro.split('/').pop()}</a>
                        <button type="button" onClick={() => setEditHistoryItem({ ...editHistoryItem, ficheiro: "" })}
                          className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-colors text-sm font-medium text-gray-400 hover:text-orange-400">
                      <UploadCloud className="w-4 h-4" />
                      <span>{editHistoryFicheiro ? editHistoryFicheiro.name : "Substituir ficheiro"}</span>
                      <input type="file" accept="*" className="sr-only" onChange={e => setEditHistoryFicheiro(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                  <Button onClick={handleUpdateHistory} disabled={!editHistoryItem.titulo.trim()}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold disabled:opacity-40">Guardar</Button>
                  <Button variant="outline" onClick={() => { setEditHistoryItem(null); setEditHistoryFicheiro(null); }} className="rounded-xl h-11 px-5">Cancelar</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════ DELETE HISTORY CONFIRM ══ */}
        <Dialog open={!!historyToDelete} onOpenChange={open => { if (!open) setHistoryToDelete(null); }}>
          <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <DialogTitle className="text-gray-900 text-lg font-extrabold mb-2">Eliminar evento?</DialogTitle>
              <p className="text-sm text-gray-500 leading-relaxed">Este evento será eliminado permanentemente e não poderá ser recuperado.</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <Button onClick={handleDeleteHistory} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-bold shadow-sm shadow-red-200">Eliminar</Button>
              <Button variant="outline" onClick={() => setHistoryToDelete(null)} className="flex-1 rounded-xl h-11">Cancelar</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════ DELETE ANIMAL CONFIRM ══ */}
        <Dialog open={!!deleteConfirmId} onOpenChange={open => { if (!open) setDeleteConfirmId(null); }}>
          <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <PawPrint className="w-8 h-8 text-red-400" />
              </div>
              <DialogTitle className="text-gray-900 text-lg font-extrabold mb-1">Eliminar {deleteConfirmName}?</DialogTitle>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">Todos os dados deste animal, incluindo histórico e ficheiros, serão eliminados permanentemente.</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <Button onClick={() => deleteConfirmId && handleDeleteAnimal(deleteConfirmId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-bold shadow-sm shadow-red-200">
                Sim, eliminar
              </Button>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-xl h-11">Cancelar</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}