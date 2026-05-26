"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareHeart, Plus, Search, Pencil, Trash2, ChevronDown,
  Check, ArrowLeft, X, AlertTriangle, Calendar, Clock, MapPin,
  User, Activity, Filter, PawPrint, FileDown, Download,
  ClipboardList, ChevronRight, Eye, MessageCircle, SortDesc, SortAsc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import Header from "@/components/Header";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
type Animal = { id: number; nome: string; chip: string };

type Aconselhamento = {
  id: number;
  data: string;
  hora: string;
  animal_id: number | null;
  animal_exterior: string;
  motivo: string;
  administracao: string;
  feedback: string;
  local: string;
};

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────────────────── */
const MOCK_ANIMALS: Animal[] = [
  { id: 1, nome: "Bolinha", chip: "941000024680001" },
  { id: 2, nome: "Mel", chip: "941000024680002" },
  { id: 3, nome: "Thor", chip: "941000024680003" },
  { id: 4, nome: "Luna", chip: "941000024680004" },
  { id: 5, nome: "Simba", chip: "941000024680005" },
];

const MOCK_RECORDS: Aconselhamento[] = [
  { id: 1, data: "2025-05-10", hora: "09:30", animal_id: 1, animal_exterior: "", motivo: "Comportamento agressivo com outros animais durante passeio", administracao: "Dr. Carvalho", feedback: "Animal apresentou melhoria após sessão. Recomendada continuação do treino de socialização por mais 3 semanas.", local: "Clínica Central" },
  { id: 2, data: "2025-05-12", hora: "14:00", animal_id: null, animal_exterior: "Gato ruivo (colónia rua das Flores)", motivo: "Avaliação pós-cirurgia de esterilização", administracao: "Dra. Santos", feedback: "Recuperação dentro do esperado. Sem complicações visíveis.", local: "Posto Móvel Norte" },
  { id: 3, data: "2025-05-15", hora: "11:15", animal_id: 3, animal_exterior: "", motivo: "Desparasitação + check-up geral", administracao: "Dr. Ferreira", feedback: "Sem observações relevantes. Animal em boa condição.", local: "Clínica Central" },
  { id: 4, data: "2025-05-18", hora: "16:45", animal_id: 4, animal_exterior: "", motivo: "Controlo de peso e avaliação nutricional", administracao: "Dra. Costa", feedback: "Dieta prescrita para 30 dias. Reavaliação agendada.", local: "Sede" },
  { id: 5, data: "2025-05-20", hora: "10:00", animal_id: 2, animal_exterior: "", motivo: "Vacinação anual", administracao: "Dr. Carvalho", feedback: "Todas as vacinas administradas com sucesso. Próxima dose em 12 meses.", local: "Clínica Central" },
];

const LOCAIS = ["Clínica Central", "Posto Móvel Norte", "Posto Móvel Sul", "Sede", "Casa do Tutor", "Outro"];

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */
const inputCls =
  "rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 transition-colors text-sm";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
      {children}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
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

function DropdownField<T extends string | number>({
  label, value, placeholder, options, onChange, required,
}: {
  label?: string;
  value: T | null;
  placeholder: string;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div className="relative">
        <button type="button" onClick={() => setOpen(p => !p)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white hover:border-orange-200 transition-colors focus:outline-none">
          <span className={selected ? "text-gray-800 font-medium" : "text-gray-400"}>{selected?.label ?? placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.12 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl shadow-black/10 overflow-hidden max-h-52 overflow-y-auto">
              {options.map(opt => (
                <button key={String(opt.value)} type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 transition-colors">
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

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const emptyForm = (): Omit<Aconselhamento, "id"> => ({
  data: new Date().toISOString().slice(0, 10),
  hora: new Date().toTimeString().slice(0, 5),
  animal_id: null,
  animal_exterior: "",
  motivo: "",
  administracao: "",
  feedback: "",
  local: "",
});

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const localAccent = (local: string): string => {
  const map: Record<string, string> = {
    "Clínica Central": "bg-blue-50 text-blue-600",
    "Posto Móvel Norte": "bg-emerald-50 text-emerald-600",
    "Posto Móvel Sul": "bg-teal-50 text-teal-600",
    "Sede": "bg-violet-50 text-violet-600",
    "Casa do Tutor": "bg-amber-50 text-amber-600",
  };
  return map[local] ?? "bg-gray-100 text-gray-500";
};

/* ─────────────────────────────────────────────────────────────────────────────
   ENTRY CARD
───────────────────────────────────────────────────────────────────────────── */
function EntryCard({
  record, animals, onEdit, onDelete, onView,
}: {
  record: Aconselhamento;
  animals: Animal[];
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const animalName = record.animal_id !== null
    ? (animals.find(a => a.id === record.animal_id)?.nome ?? "—")
    : (record.animal_exterior || "Animal Exterior");
  const isDB = record.animal_id !== null;

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-300 overflow-hidden"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-amber-300 rounded-l-3xl" />

      <div className="pl-5 pr-5 pt-5 pb-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Date block */}
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex-shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 leading-none">
                {new Date(record.data + "T00:00:00").toLocaleDateString("pt-PT", { month: "short" })}
              </span>
              <span className="text-xl font-extrabold text-orange-500 leading-tight tabular-nums">
                {record.data.split("-")[2]}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium capitalize">
                {new Date(record.data + "T00:00:00").toLocaleDateString("pt-PT", { weekday: "long", year: "numeric" })}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-sm font-bold text-gray-700">
                  <Clock className="w-3.5 h-3.5 text-gray-300" />{record.hora}
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-300 font-mono">#{record.id}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={onView} className="p-2 rounded-xl hover:bg-orange-50 text-gray-300 hover:text-orange-500 transition-colors" title="Ver detalhes">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={onEdit} className="p-2 rounded-xl hover:bg-orange-50 text-gray-300 hover:text-orange-500 transition-colors" title="Editar">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors" title="Eliminar">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pill row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${isDB ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
            <PawPrint className="w-3.5 h-3.5" />{animalName}
            {!isDB && <span className="text-[10px] font-medium opacity-60 ml-0.5">exterior</span>}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${localAccent(record.local)}`}>
            <MapPin className="w-3 h-3" />{record.local || "—"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-50 text-gray-500">
            <User className="w-3 h-3" />{record.administracao || "—"}
          </span>
        </div>

        {/* Motivo */}
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-300 mb-1">Motivo</p>
          <p className="text-sm font-semibold text-gray-800 leading-relaxed">{record.motivo || "—"}</p>
        </div>

        {/* Feedback */}
        {record.feedback && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <div className="flex gap-2.5">
              <MessageCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-400 mb-1">Feedback</p>
                <p className="text-sm text-gray-600 leading-relaxed">{record.feedback}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom strip */}
      <button onClick={onView}
        className="w-full flex items-center justify-end gap-1.5 px-5 py-2.5 bg-gray-50/60 hover:bg-orange-50/60 border-t border-gray-50 transition-colors text-xs font-semibold text-gray-300 hover:text-orange-400">
        Ver detalhes completos <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FORM BODY
───────────────────────────────────────────────────────────────────────────── */
function FormBody({
  data, setData, mode, setMode, animals,
}: {
  data: Omit<Aconselhamento, "id"> & { id?: number };
  setData: (v: any) => void;
  mode: "db" | "exterior";
  setMode: (v: "db" | "exterior") => void;
  animals: Animal[];
}) {
  const animalOptions = animals.map(a => ({ label: `${a.nome} · ${a.chip}`, value: a.id }));
  const localOptions = LOCAIS.map(l => ({ label: l, value: l }));

  return (
    <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[68vh]">
      <ModalSection title="Identificação" icon={Calendar}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>Data</FieldLabel>
            <Input type="date" value={data.data} onChange={e => setData({ ...data, data: e.target.value })} className={inputCls} />
          </div>
          <div>
            <FieldLabel required>Hora</FieldLabel>
            <Input type="time" value={data.hora} onChange={e => setData({ ...data, hora: e.target.value })} className={inputCls} />
          </div>
        </div>
      </ModalSection>

      <ModalSection title="Animal" icon={PawPrint}>
        <div className="flex rounded-xl border-2 border-gray-100 overflow-hidden text-xs font-bold">
          <button type="button" onClick={() => setMode("db")}
            className={`flex-1 py-2.5 transition-colors ${mode === "db" ? "bg-orange-500 text-white" : "bg-white text-gray-400 hover:bg-orange-50"}`}>
            Base de dados
          </button>
          <button type="button" onClick={() => setMode("exterior")}
            className={`flex-1 py-2.5 transition-colors ${mode === "exterior" ? "bg-orange-500 text-white" : "bg-white text-gray-400 hover:bg-orange-50"}`}>
            Animal exterior
          </button>
        </div>
        <AnimatePresence mode="wait">
          {mode === "db" ? (
            <motion.div key="db" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}>
              <DropdownField label="Selecionar animal" value={data.animal_id} placeholder="Escolha um animal…"
                options={animalOptions} onChange={v => setData({ ...data, animal_id: v })} required />
            </motion.div>
          ) : (
            <motion.div key="ext" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}>
              <FieldLabel required>Descrição do animal</FieldLabel>
              <Input placeholder="Ex: Gato ruivo, colónia rua das Flores…"
                value={data.animal_exterior} onChange={e => setData({ ...data, animal_exterior: e.target.value })} className={inputCls} />
            </motion.div>
          )}
        </AnimatePresence>
      </ModalSection>

      <ModalSection title="Detalhes" icon={ClipboardList}>
        <div>
          <FieldLabel required>Motivo</FieldLabel>
          <Input placeholder="Motivo do aconselhamento…" value={data.motivo}
            onChange={e => setData({ ...data, motivo: e.target.value })} className={inputCls} />
        </div>
        <DropdownField label="Local" value={data.local || null} placeholder="Escolha o local…"
          options={localOptions} onChange={v => setData({ ...data, local: v })} required />
      </ModalSection>

      <ModalSection title="Administração" icon={User}>
        <FieldLabel required>Responsável</FieldLabel>
        <Input placeholder="Nome do responsável…" value={data.administracao}
          onChange={e => setData({ ...data, administracao: e.target.value })} className={inputCls} />
      </ModalSection>

      <ModalSection title="Feedback" icon={Activity}>
        <FieldLabel>Feedback / Observações</FieldLabel>
        <textarea rows={3} placeholder="Resultado, notas clínicas, recomendações…"
          value={data.feedback} onChange={e => setData({ ...data, feedback: e.target.value })}
          className={`w-full ${inputCls} px-4 py-2.5 resize-none border-2`} />
      </ModalSection>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function Aconselhamentos() {
  const [records, setRecords] = useState<Aconselhamento[]>(MOCK_RECORDS);
  const [animals] = useState<Animal[]>(MOCK_ANIMALS);

  const [searchQuery, setSearchQuery] = useState("");
  const [localFilter, setLocalFilter] = useState<string | null>(null);
  const [localFilterOpen, setLocalFilterOpen] = useState(false);
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const [createOpen, setCreateOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Aconselhamento | null>(null);
  const [editItem, setEditItem] = useState<Aconselhamento | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm());
  const [animalMode, setAnimalMode] = useState<"db" | "exterior">("db");

  const animalName = (r: Aconselhamento) =>
    r.animal_id !== null
      ? (animals.find(a => a.id === r.animal_id)?.nome ?? "—")
      : (r.animal_exterior || "Animal Exterior");

  const uniqueLocais = [...new Set(records.map(r => r.local).filter(Boolean))];
  const thisMonth = records.filter(r => r.data.slice(0, 7) === new Date().toISOString().slice(0, 7)).length;

  const filtered = useMemo(() => {
    let d = [...records];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r =>
        animalName(r).toLowerCase().includes(q) ||
        r.motivo.toLowerCase().includes(q) ||
        r.administracao.toLowerCase().includes(q) ||
        r.local.toLowerCase().includes(q) ||
        r.feedback.toLowerCase().includes(q)
      );
    }
    if (localFilter) d = d.filter(r => r.local === localFilter);
    d.sort((a, b) => {
      const cmp = (a.data + a.hora).localeCompare(b.data + b.hora);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return d;
  }, [records, searchQuery, localFilter, sortDir]);

  const grouped = useMemo(() => {
    const map = new Map<string, Aconselhamento[]>();
    for (const r of filtered) {
      const key = r.data.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return [...map.entries()];
  }, [filtered]);

  const handleCreate = () => {
    const newId = Math.max(0, ...records.map(r => r.id)) + 1;
    setRecords(p => [{ id: newId, ...form, animal_id: animalMode === "db" ? form.animal_id : null, animal_exterior: animalMode === "exterior" ? form.animal_exterior : "" }, ...p]);
    setCreateOpen(false);
    setForm(emptyForm());
    setAnimalMode("db");
  };

  const handleUpdate = () => {
    if (!editItem) return;
    setRecords(p => p.map(r => r.id === editItem.id ? { ...editItem } : r));
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteConfirmId == null) return;
    setRecords(p => p.filter(r => r.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const exportCSV = () => {
    const headers = ["ID", "Data", "Hora", "Animal", "Motivo", "Administração", "Feedback", "Local"];
    const rows = filtered.map(r => [r.id, formatDate(r.data), r.hora, animalName(r), r.motivo, r.administracao, r.feedback, r.local]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `aconselhamentos_${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
  };

  const isCreateValid =
    form.data && form.hora && form.motivo.trim() && form.local && form.administracao.trim() &&
    (animalMode === "db" ? form.animal_id !== null : form.animal_exterior.trim());

  const isEditValid = editItem &&
    editItem.motivo.trim() && editItem.local && editItem.administracao.trim();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#fafaf9]">
        <main className="px-6 md:px-10 py-8 max-w-3xl mx-auto space-y-6">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-gray-700">
                <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Aconselhamentos</h1>
                <p className="text-sm text-gray-400 mt-0.5">{records.length} registos · {thisMonth} este mês</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={exportCSV}
                className="rounded-xl h-10 px-4 text-sm font-semibold text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600 gap-2">
                <FileDown className="w-4 h-4" /> CSV
              </Button>
              <Button variant="outline" onClick={() => window.print()}
                className="rounded-xl h-10 px-4 text-sm font-semibold text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600 gap-2">
                <Download className="w-4 h-4" /> PDF
              </Button>
              <Button onClick={() => { setForm(emptyForm()); setAnimalMode("db"); setCreateOpen(true); }}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-5 font-bold shadow-sm shadow-orange-200 gap-2">
                <Plus className="w-4 h-4" /> Novo registo
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ClipboardList, label: "Total", value: records.length, color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Calendar, label: "Este mês", value: thisMonth, color: "text-amber-500", bg: "bg-amber-50" },
              { icon: PawPrint, label: "Da BD", value: records.filter(r => r.animal_id !== null).length, color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: MapPin, label: "Locais", value: uniqueLocais.length, color: "text-blue-500", bg: "bg-blue-50" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className={`p-2 rounded-xl ${s.bg}`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
                <div>
                  <p className="text-xl font-extrabold text-gray-900 leading-none tabular-nums">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input placeholder="Pesquisar…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 text-sm h-10" />
            </div>
            <div className="relative w-full sm:w-48">
              <button type="button" onClick={() => setLocalFilterOpen(p => !p)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 rounded-xl bg-white transition-colors focus:outline-none h-10 ${localFilter ? "border-orange-300 text-orange-600 font-semibold" : "border-gray-100 text-gray-400 hover:border-orange-200"}`}>
                <span className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" />{localFilter ?? "Local"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${localFilterOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {localFilterOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.12 }}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl shadow-black/10 overflow-hidden">
                    <button type="button" onClick={() => { setLocalFilter(null); setLocalFilterOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-orange-50 transition-colors">
                      <span className={!localFilter ? "font-semibold text-orange-600" : "text-gray-500"}>Todos</span>
                      {!localFilter && <Check className="w-4 h-4 text-orange-500" />}
                    </button>
                    {uniqueLocais.map(l => (
                      <button key={l} type="button" onClick={() => { setLocalFilter(l); setLocalFilterOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-orange-50 transition-colors">
                        <span className={localFilter === l ? "font-semibold text-orange-600" : "text-gray-700"}>{l}</span>
                        {localFilter === l && <Check className="w-4 h-4 text-orange-500" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
              className="flex items-center gap-2 px-4 h-10 rounded-xl border-2 border-gray-100 bg-white text-sm font-semibold text-gray-500 hover:border-orange-200 hover:text-orange-500 transition-colors flex-shrink-0">
              {sortDir === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              {sortDir === "desc" ? "Mais recentes" : "Mais antigos"}
            </button>
            {(searchQuery || localFilter) && (
              <button onClick={() => { setSearchQuery(""); setLocalFilter(null); }}
                className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" /> Limpar
              </button>
            )}
          </div>

          {/* Card feed */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-24 text-gray-300">
              <ClipboardList className="w-12 h-12" />
              <p className="text-sm font-medium">Nenhum registo encontrado</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {grouped.map(([monthKey, items]) => {
                const [y, m] = monthKey.split("-");
                const monthLabel = new Date(`${y}-${m}-01`).toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
                return (
                  <div key={monthKey}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-gray-100" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-300 capitalize">{monthLabel}</span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {items.map(r => (
                          <EntryCard key={r.id} record={r} animals={animals}
                            onEdit={() => { setEditItem({ ...r }); setAnimalMode(r.animal_id !== null ? "db" : "exterior"); }}
                            onDelete={() => setDeleteConfirmId(r.id)}
                            onView={() => setViewItem(r)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-3xl max-w-lg p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
          <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <MessageSquareHeart className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-extrabold">Novo Aconselhamento</DialogTitle>
                <p className="text-white/60 text-xs mt-0.5">Preencha os dados do registo</p>
              </div>
            </div>
          </div>
          <FormBody data={form} setData={setForm} mode={animalMode} setMode={setAnimalMode} animals={animals} />
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
            <Button onClick={handleCreate} disabled={!isCreateValid}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold disabled:opacity-40">
              Criar registo
            </Button>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl h-11 px-5">Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={!!editItem} onOpenChange={open => { if (!open) setEditItem(null); }}>
        <DialogContent className="rounded-3xl max-w-lg p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
          <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-extrabold">Editar Aconselhamento</DialogTitle>
                <p className="text-white/60 text-xs mt-0.5">#{editItem?.id} · {editItem ? formatDate(editItem.data) : ""}</p>
              </div>
            </div>
          </div>
          {editItem && (
            <>
              <FormBody data={editItem} setData={setEditItem} mode={animalMode} setMode={setAnimalMode} animals={animals} />
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                <Button onClick={handleUpdate} disabled={!isEditValid}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold disabled:opacity-40">
                  Guardar alterações
                </Button>
                <Button variant="outline" onClick={() => setEditItem(null)} className="rounded-xl h-11 px-5">Cancelar</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={!!viewItem} onOpenChange={open => { if (!open) setViewItem(null); }}>
        <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
          {viewItem && (
            <>
              <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70 leading-none">
                      {new Date(viewItem.data + "T00:00:00").toLocaleDateString("pt-PT", { month: "short" })}
                    </span>
                    <span className="text-2xl font-extrabold text-white leading-tight tabular-nums">
                      {viewItem.data.split("-")[2]}
                    </span>
                  </div>
                  <div>
                    <DialogTitle className="text-white text-lg font-extrabold capitalize">
                      {new Date(viewItem.data + "T00:00:00").toLocaleDateString("pt-PT", { weekday: "long" })}
                    </DialogTitle>
                    <p className="text-white/70 text-sm mt-0.5">
                      {new Date(viewItem.data + "T00:00:00").toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <span className="flex items-center gap-1 text-white/90 text-sm font-bold mt-1">
                      <Clock className="w-3.5 h-3.5" />{viewItem.hora}
                      <span className="text-white/40 ml-1">· #{viewItem.id}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${viewItem.animal_id !== null ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                    <PawPrint className="w-3.5 h-3.5" />{animalName(viewItem)}
                    {viewItem.animal_id === null && <span className="opacity-60 ml-0.5">exterior</span>}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${localAccent(viewItem.local)}`}>
                    <MapPin className="w-3 h-3" />{viewItem.local || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600">
                    <User className="w-3 h-3" />{viewItem.administracao || "—"}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Motivo</p>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">{viewItem.motivo || "—"}</p>
                </div>
                {viewItem.feedback ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Feedback</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{viewItem.feedback}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                    <p className="text-xs text-gray-300 font-medium">Sem feedback registado</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                <Button onClick={() => { setEditItem({ ...viewItem }); setAnimalMode(viewItem.animal_id !== null ? "db" : "exterior"); setViewItem(null); }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold">
                  <Pencil className="w-4 h-4 mr-1.5" /> Editar
                </Button>
                <Button variant="outline" onClick={() => setViewItem(null)} className="rounded-xl h-11 px-5">Fechar</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={open => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-gray-900 text-lg font-extrabold mb-2">Eliminar registo?</DialogTitle>
            <p className="text-sm text-gray-500 leading-relaxed">Este aconselhamento será eliminado permanentemente.</p>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <Button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-bold shadow-sm shadow-red-200">
              Sim, eliminar
            </Button>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-xl h-11">Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          header, nav, button, .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; }
        }
      `}</style>
    </>
  );
}