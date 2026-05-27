"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRightLeft, Plus, Search, Pencil, Trash2,
    Check, AlertTriangle, Calendar,
    User, Filter, FileDown,
    ChevronRight, Eye, SortDesc, SortAsc, ClipboardList,
    Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Header";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
type Registo = {
    id: number;
    data: string; // ISO date string (YYYY-MM-DD)
    telefone: string;
    nome: string;
    motivo: string;
};

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

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const emptyForm = (): Omit<Registo, "id"> => ({
    data: new Date().toISOString().slice(0, 10),
    telefone: "",
    nome: "",
    motivo: "",
});

const formatDate = (iso: string) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

/* ─────────────────────────────────────────────────────────────────────────────
   ENTRY CARD
───────────────────────────────────────────────────────────────────────────── */
function EntryCard({
    record, onEdit, onDelete, onView,
}: {
    record: Registo;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
}) {
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

                {/* Pills row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700">
                        <User className="w-3.5 h-3.5" />{record.nome || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-50 text-gray-600 font-mono tracking-wide">
                        <Phone className="w-3.5 h-3.5" />{record.telefone || "—"}
                    </span>
                </div>

                {/* Motivo */}
                <div className="mb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-300 mb-1">Motivo</p>
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed line-clamp-3">{record.motivo || "—"}</p>
                </div>
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
    data, setData,
}: {
    data: Omit<Registo, "id"> & { id?: number };
    setData: (v: any) => void;
}) {
    return (
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[68vh]">
            <ModalSection title="Identificação" icon={Calendar}>
                <div>
                    <FieldLabel required>Data</FieldLabel>
                    <Input type="date" value={data.data} onChange={e => setData({ ...data, data: e.target.value })} className={inputCls} />
                </div>
            </ModalSection>

            <ModalSection title="Contacto" icon={User}>
                <div>
                    <FieldLabel required>Nome</FieldLabel>
                    <Input placeholder="Nome da pessoa…" value={data.nome}
                        onChange={e => setData({ ...data, nome: e.target.value })} className={inputCls} />
                </div>
                <div>
                    <FieldLabel required>Telefone</FieldLabel>
                    <Input type="tel" placeholder="Ex: 912 345 678…" value={data.telefone}
                        onChange={e => setData({ ...data, telefone: e.target.value })} className={inputCls} />
                </div>
            </ModalSection>

            <ModalSection title="Detalhes" icon={ClipboardList}>
                <div>
                    <FieldLabel required>Motivo</FieldLabel>
                    <textarea rows={3} placeholder="Motivo de entrada ou saída…"
                        value={data.motivo} onChange={e => setData({ ...data, motivo: e.target.value })}
                        className={`w-full ${inputCls} px-4 py-2.5 resize-none border-2`} />
                </div>
            </ModalSection>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function RegistoEntradaSaidaPage() {
    const [records, setRecords] = useState<Registo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/admin/registoensai");
                if (res.ok) {
                    const data = await res.json();
                    setRecords(data.map((item: any) => ({
                        id: Number(item.id),
                        data: item.data ? item.data.split("T")[0] : "",
                        telefone: item.telefone || "",
                        nome: item.nome || "",
                        motivo: item.motivo || "",
                    })));
                }
            } catch (error) {
                console.error("Error fetching registos:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

    const [createOpen, setCreateOpen] = useState(false);
    const [viewItem, setViewItem] = useState<Registo | null>(null);
    const [editItem, setEditItem] = useState<Registo | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const [form, setForm] = useState(emptyForm());

    const thisMonth = records.filter(r => r.data.slice(0, 7) === new Date().toISOString().slice(0, 7)).length;

    const filtered = useMemo(() => {
        let d = [...records];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            d = d.filter(r =>
                r.nome.toLowerCase().includes(q) ||
                r.telefone.toLowerCase().includes(q) ||
                r.motivo.toLowerCase().includes(q)
            );
        }
        d.sort((a, b) => {
            const cmp = a.data.localeCompare(b.data);
            return sortDir === "desc" ? -cmp : cmp;
        });
        return d;
    }, [records, searchQuery, sortDir]);

    const grouped = useMemo(() => {
        const map = new Map<string, Registo[]>();
        for (const r of filtered) {
            const key = r.data.slice(0, 7);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(r);
        }
        return [...map.entries()];
    }, [filtered]);

    const isCreateValid = form.nome.trim() !== "" && form.telefone.trim() !== "" && form.motivo.trim() !== "";
    const isEditValid = !!editItem && editItem.nome.trim() !== "" && editItem.telefone.trim() !== "" && editItem.motivo.trim() !== "";

    const handleCreate = async () => {
        try {
            const res = await fetch("/api/admin/registoensai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const newItem = await res.json();
                setRecords(p => [{
                    id: Number(newItem.id),
                    data: newItem.data ? newItem.data.split("T")[0] : form.data,
                    telefone: newItem.telefone || "",
                    nome: newItem.nome || "",
                    motivo: newItem.motivo || "",
                }, ...p]);
                setCreateOpen(false);
                setForm(emptyForm());
            }
        } catch (e) { console.error(e); }
    };

    const handleUpdate = async () => {
        if (!editItem) return;
        try {
            const res = await fetch("/api/admin/registoensai", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editItem),
            });
            if (res.ok) {
                setRecords(p => p.map(r => r.id === editItem.id ? { ...editItem } : r));
                setEditItem(null);
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async () => {
        if (deleteConfirmId == null) return;
        try {
            const res = await fetch("/api/admin/registoensai", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: deleteConfirmId }),
            });
            if (res.ok) {
                setRecords(p => p.filter(r => r.id !== deleteConfirmId));
                setDeleteConfirmId(null);
            }
        } catch (e) { console.error(e); }
    };

    const handleExport = () => {
        const rows = [
            ["ID", "Data", "Nome", "Telefone", "Motivo"],
            ...records.map(r => [r.id, formatDate(r.data), r.nome, r.telefone, r.motivo]),
        ];
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `registos_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-20">
                {/* ── Hero ── */}
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 px-6 pt-10 pb-24">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
                        <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-amber-200 blur-3xl" />
                    </div>
                    <div className="relative max-w-5xl mx-auto">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm mb-4">
                                    <ArrowRightLeft className="w-3.5 h-3.5 text-white/80" />
                                    <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Registo de Movimentos</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Entradas e Saídas</h1>
                                <p className="text-orange-100/70 text-sm mt-1.5">Gestão e histórico de entradas e saídas</p>
                            </div>
                            <div className="flex gap-3 items-center flex-wrap">
                                <button onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-bold transition-colors">
                                    <FileDown className="w-4 h-4" /> Exportar CSV
                                </button>
                                <button onClick={() => { setForm(emptyForm()); setCreateOpen(true); }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 text-sm font-extrabold shadow-lg shadow-orange-900/20 transition-colors">
                                    <Plus className="w-4 h-4" /> Novo registo
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                            {[
                                { label: "Total de registos", value: records.length, icon: ArrowRightLeft },
                                { label: "Este mês", value: thisMonth, icon: Calendar },
                                { label: "Hoje", value: records.filter(r => r.data === new Date().toISOString().slice(0, 10)).length, icon: Filter },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className="w-3.5 h-3.5 text-white/60" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</p>
                                    </div>
                                    <p className="text-2xl font-extrabold text-white tabular-nums">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Controls ── */}
                <div className="max-w-5xl mx-auto px-4 mt-6 mb-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-black/5 px-5 py-4 flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <Input
                                placeholder="Pesquisar por nome, telefone ou motivo…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 text-sm"
                            />
                        </div>
                        <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-100 text-sm font-semibold text-gray-500 hover:border-orange-200 hover:text-orange-600 transition-colors">
                            {sortDir === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                            {sortDir === "desc" ? "Mais recentes" : "Mais antigos"}
                        </button>
                        {searchQuery && (
                            <span className="text-sm text-gray-400 font-medium">
                                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── List ── */}
                <div className="max-w-5xl mx-auto px-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                            <p className="text-sm text-gray-400 font-medium">A carregar registos…</p>
                        </div>
                    ) : grouped.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center">
                                <ArrowRightLeft className="w-8 h-8 text-orange-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-700 mb-1">Nenhum registo encontrado</p>
                                <p className="text-sm text-gray-400">
                                    {searchQuery ? "Tente outra pesquisa." : "Clique em \"Novo registo\" para começar."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <AnimatePresence>
                                {grouped.map(([monthKey, items]) => (
                                    <div key={monthKey}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-400" />
                                                <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest capitalize">
                                                    {new Date(monthKey + "-01T00:00:00").toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
                                                </h2>
                                            </div>
                                            <div className="flex-1 h-px bg-gray-100" />
                                            <span className="text-xs font-bold text-gray-300">{items.length} registo{items.length !== 1 ? "s" : ""}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {items.map(record => (
                                                <EntryCard
                                                    key={record.id}
                                                    record={record}
                                                    onEdit={() => setEditItem({ ...record })}
                                                    onDelete={() => setDeleteConfirmId(record.id)}
                                                    onView={() => setViewItem(record)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            {/* ── CREATE MODAL ── */}
            <Dialog open={createOpen} onOpenChange={open => { if (!open) setCreateOpen(false); }}>
                <DialogContent className="rounded-3xl max-w-lg p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-6 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Plus className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-white text-lg font-extrabold">Novo Registo</DialogTitle>
                                <p className="text-white/60 text-xs mt-0.5">Preencha os dados do registo</p>
                            </div>
                        </div>
                    </div>
                    <FormBody data={form} setData={setForm} />
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                        <Button onClick={handleCreate} disabled={!isCreateValid}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold disabled:opacity-40">
                            Gravar registo
                        </Button>
                        <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl h-11 px-5">Cancelar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── EDIT MODAL ── */}
            <Dialog open={!!editItem} onOpenChange={open => { if (!open) setEditItem(null); }}>
                <DialogContent className="rounded-3xl max-w-lg p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-6 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Pencil className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-white text-lg font-extrabold">Editar Registo</DialogTitle>
                                <p className="text-white/60 text-xs mt-0.5">#{editItem?.id} · {editItem ? formatDate(editItem.data) : ""}</p>
                            </div>
                        </div>
                    </div>
                    {editItem && (
                        <>
                            <FormBody data={editItem} setData={setEditItem} />
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

            {/* ── VIEW MODAL ── */}
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
                                        <span className="text-white/60 text-sm mt-1">#{viewItem.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-5 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-100 text-orange-700">
                                        <User className="w-3.5 h-3.5" />{viewItem.nome}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 font-mono tracking-wide">
                                        <Phone className="w-3.5 h-3.5" />{viewItem.telefone}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Motivo</p>
                                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">{viewItem.motivo || "—"}</p>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                                <Button onClick={() => { setEditItem({ ...viewItem }); setViewItem(null); }}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold">
                                    <Pencil className="w-4 h-4 mr-1.5" /> Editar
                                </Button>
                                <Button variant="outline" onClick={() => setViewItem(null)} className="rounded-xl h-11 px-5">Fechar</Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── DELETE CONFIRM ── */}
            <Dialog open={deleteConfirmId !== null} onOpenChange={open => { if (!open) setDeleteConfirmId(null); }}>
                <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <DialogTitle className="text-gray-900 text-lg font-extrabold mb-2">Eliminar registo?</DialogTitle>
                        <p className="text-sm text-gray-500 leading-relaxed">Este registo será eliminado permanentemente.</p>
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


