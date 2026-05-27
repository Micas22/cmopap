"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Search, Pencil, Trash2, AlertTriangle, Calendar,
    User, FileDown, ChevronRight, Eye, SortDesc, SortAsc,
    Dog, Syringe, X, ChevronLeft, CheckCircle2, Clock,
    Weight, Cpu, Thermometer, ClipboardList, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Header";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
type FichaInternamento = {
    id: number;
    nome: string;
    raca: string;
    data: string;
    temperamento: string;
    idade: string;
    peso: number;
    motivo: string;
    chip: string;
};

type Tratamento = {
    id: number;
    medicacao: string;
    dose: string;
    data: string; // YYYY-MM-DD
    internamento: number;
};

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK DATA (animals DB for autofill)
───────────────────────────────────────────────────────────────────────────── */
const MOCK_ANIMALS = [
    { id: 1, nome: "Simba", raca: "Golden Retriever", idade: "4 anos", peso: 32.5, chip: "941000024680135" },
    { id: 2, nome: "Luna", raca: "Labrador", idade: "2 anos", peso: 24.1, chip: "941000024680244" },
    { id: 3, nome: "Rex", raca: "Pastor Alemão", idade: "6 anos", peso: 38.0, chip: "941000024680311" },
    { id: 4, nome: "Mel", raca: "Beagle", idade: "3 anos", peso: 12.8, chip: "941000024680428" },
    { id: 5, nome: "Thor", raca: "Husky Siberiano", idade: "5 anos", peso: 27.3, chip: "941000024680512" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const emptyFicha = (): Omit<FichaInternamento, "id"> => ({
    nome: "", raca: "", data: new Date().toISOString().slice(0, 10),
    temperamento: "", idade: "", peso: 0, motivo: "", chip: "",
});

const emptyTratamento = (internamentoId: number): Omit<Tratamento, "id"> => ({
    medicacao: "", dose: "", data: new Date().toISOString().slice(0, 10),
    internamento: internamentoId,
});

const formatDate = (iso: string) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const PT_MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const PT_DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const TEMPERAMENTOS = ["Dócil", "Nervoso", "Agressivo", "Medroso", "Calmo", "Brincalhão"];

/* ─────────────────────────────────────────────────────────────────────────────
   INPUT SHARED STYLE
───────────────────────────────────────────────────────────────────────────── */
const inputCls = "rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 transition-colors text-sm";

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

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMAL PICKER
───────────────────────────────────────────────────────────────────────────── */
function AnimalPicker({ onSelect, onClose }: {
    onSelect: (a: typeof MOCK_ANIMALS[0]) => void;
    onClose: () => void;
}) {
    const [q, setQ] = useState("");
    const filtered = MOCK_ANIMALS.filter(a =>
        a.nome.toLowerCase().includes(q.toLowerCase()) ||
        a.raca.toLowerCase().includes(q.toLowerCase()) ||
        a.chip.includes(q)
    );
    return (
        <div className="px-6 py-4 space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <Input autoFocus placeholder="Pesquisar por nome, raça ou chip…"
                    value={q} onChange={e => setQ(e.target.value)}
                    className="pl-9 rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 text-sm" />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filtered.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-6">Nenhum animal encontrado</p>
                ) : filtered.map(a => (
                    <button key={a.id} onClick={() => onSelect(a)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Dog className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{a.nome}</p>
                            <p className="text-xs text-gray-400">{a.raca} · {a.idade} · {a.peso} kg</p>
                            <p className="text-[10px] text-gray-300 font-mono truncate">Chip: {a.chip}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TRATAMENTOS CALENDAR
───────────────────────────────────────────────────────────────────────────── */
function TratamentosCalendar({ ficha, tratamentos, onAdd, onDelete }: {
    ficha: FichaInternamento;
    tratamentos: Tratamento[];
    onAdd: (t: Omit<Tratamento, "id">) => void;
    onDelete: (id: number) => void;
}) {
    const today = new Date();
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [newT, setNewT] = useState({ medicacao: "", dose: "" });

    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);

    // Map date → tratamentos
    const byDate = useMemo(() => {
        const m: Record<string, Tratamento[]> = {};
        for (const t of tratamentos) {
            if (!m[t.data]) m[t.data] = [];
            m[t.data].push(t);
        }
        return m;
    }, [tratamentos]);

    const todayStr = today.toISOString().slice(0, 10);
    const selectedTratamentos = selectedDay ? (byDate[selectedDay] || []) : [];

    const navMonth = (dir: 1 | -1) => {
        let m = calMonth + dir;
        let y = calYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        setCalMonth(m); setCalYear(y);
    };

    const handleAdd = () => {
        if (!selectedDay || !newT.medicacao.trim()) return;
        onAdd({ medicacao: newT.medicacao, dose: newT.dose, data: selectedDay, internamento: ficha.id });
        setNewT({ medicacao: "", dose: "" });
        setAddOpen(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-5">
            {/* Calendar */}
            <div className="flex-1">
                {/* Month nav */}
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

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                    {PT_DAYS_SHORT.map(d => (
                        <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-gray-300 py-1">{d}</div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const hasTratamentos = !!(byDate[dateStr]?.length);
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === selectedDay;
                        return (
                            <button key={day} onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                                className={`relative aspect-square rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5
                  ${isSelected ? "bg-orange-500 text-white shadow-md shadow-orange-200" :
                                        isToday ? "bg-orange-50 text-orange-600 border-2 border-orange-200" :
                                            "hover:bg-gray-50 text-gray-600"}`}>
                                {day}
                                {hasTratamentos && (
                                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-orange-400"}`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="text-[10px] text-gray-400 font-medium">Com tratamentos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-lg bg-orange-50 border-2 border-orange-200 inline-block" />
                        <span className="text-[10px] text-gray-400 font-medium">Hoje</span>
                    </div>
                </div>
            </div>

            {/* Day panel */}
            <div className="lg:w-64 flex flex-col">
                {selectedDay ? (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">
                                    {new Date(selectedDay + "T00:00:00").toLocaleDateString("pt-PT", { weekday: "long" })}
                                </p>
                                <p className="text-sm font-extrabold text-gray-800">{formatDate(selectedDay)}</p>
                            </div>
                            <button onClick={() => { setAddOpen(true); }}
                                className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200 transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add inline form */}
                        <AnimatePresence>
                            {addOpen && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="mb-3 p-3 bg-orange-50 rounded-2xl border border-orange-100 space-y-2">
                                    <Input placeholder="Medicação…" value={newT.medicacao}
                                        onChange={e => setNewT(p => ({ ...p, medicacao: e.target.value }))}
                                        className="rounded-xl border-2 border-orange-100 focus:border-orange-300 focus:ring-0 text-sm bg-white" />
                                    <Input placeholder="Dose…" value={newT.dose}
                                        onChange={e => setNewT(p => ({ ...p, dose: e.target.value }))}
                                        className="rounded-xl border-2 border-orange-100 focus:border-orange-300 focus:ring-0 text-sm bg-white" />
                                    <div className="flex gap-2">
                                        <button onClick={handleAdd}
                                            className="flex-1 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors">
                                            Adicionar
                                        </button>
                                        <button onClick={() => setAddOpen(false)}
                                            className="px-3 py-1.5 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tratamentos list */}
                        <div className="flex-1 space-y-2 overflow-y-auto max-h-60 pr-0.5">
                            {selectedTratamentos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                    <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
                                        <Syringe className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">Sem tratamentos neste dia</p>
                                    <p className="text-[10px] text-gray-300">Clique + para adicionar</p>
                                </div>
                            ) : selectedTratamentos.map(t => (
                                <motion.div key={t.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                                    className="group flex items-start gap-2.5 p-3 bg-white rounded-2xl border border-gray-100 hover:border-orange-100 shadow-sm transition-all">
                                    <div className="w-7 h-7 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Syringe className="w-3.5 h-3.5 text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{t.medicacao}</p>
                                        {t.dose && <p className="text-xs text-gray-400">{t.dose}</p>}
                                    </div>
                                    <button onClick={() => onDelete(t.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-12 gap-3 text-center">
                        <div className="w-14 h-14 bg-orange-50 rounded-3xl flex items-center justify-center">
                            <Calendar className="w-7 h-7 text-orange-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">Selecione um dia</p>
                        <p className="text-xs text-gray-400 leading-relaxed">Clique num dia para ver<br />ou adicionar tratamentos</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FICHA FORM
───────────────────────────────────────────────────────────────────────────── */
function FichaForm({ data, setData }: {
    data: Omit<FichaInternamento, "id"> & { id?: number };
    setData: (v: any) => void;
}) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
            {/* Autofill from animal DB */}
            <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-xs font-extrabold text-orange-600">Preencher a partir da base de dados</p>
                        <p className="text-[11px] text-orange-400 mt-0.5">Selecione um animal para autocompletar os campos</p>
                    </div>
                    <button onClick={() => setShowPicker(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-sm shadow-orange-200">
                        <Dog className="w-3.5 h-3.5" /> {showPicker ? "Fechar" : "Escolher animal"}
                    </button>
                </div>
                <AnimatePresence>
                    {showPicker && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden">
                            <div className="pt-2">
                                <AnimalPicker onSelect={a => {
                                    setData({ ...data, nome: a.nome, raca: a.raca, idade: a.idade, peso: a.peso, chip: a.chip });
                                    setShowPicker(false);
                                }} onClose={() => setShowPicker(false)} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ModalSection title="Identificação" icon={Dog}>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel required>Nome</FieldLabel>
                        <Input placeholder="Nome do animal…" value={data.nome}
                            onChange={e => setData({ ...data, nome: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <FieldLabel required>Raça</FieldLabel>
                        <Input placeholder="Raça…" value={data.raca}
                            onChange={e => setData({ ...data, raca: e.target.value })} className={inputCls} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <FieldLabel>Idade</FieldLabel>
                        <Input placeholder="Ex: 3 anos" value={data.idade}
                            onChange={e => setData({ ...data, idade: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <FieldLabel>Peso (kg)</FieldLabel>
                        <Input type="number" step="0.1" placeholder="0.0" value={data.peso || ""}
                            onChange={e => setData({ ...data, peso: parseFloat(e.target.value) || 0 })} className={inputCls} />
                    </div>
                    <div>
                        <FieldLabel>Data</FieldLabel>
                        <Input type="date" value={data.data}
                            onChange={e => setData({ ...data, data: e.target.value })} className={inputCls} />
                    </div>
                </div>
                <div>
                    <FieldLabel>Chip</FieldLabel>
                    <Input placeholder="Número de chip…" value={data.chip}
                        onChange={e => setData({ ...data, chip: e.target.value })} className={`${inputCls} font-mono`} />
                </div>
            </ModalSection>

            <ModalSection title="Clínico" icon={Thermometer}>
                <div>
                    <FieldLabel required>Temperamento</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                        {TEMPERAMENTOS.map(t => (
                            <button key={t} onClick={() => setData({ ...data, temperamento: t })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all
                  ${data.temperamento === t
                                        ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200"
                                        : "border-gray-100 text-gray-500 hover:border-orange-200 hover:text-orange-600"}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <FieldLabel required>Motivo de internamento</FieldLabel>
                    <textarea rows={3} placeholder="Descreva o motivo do internamento…"
                        value={data.motivo} onChange={e => setData({ ...data, motivo: e.target.value })}
                        className={`w-full ${inputCls} px-4 py-2.5 resize-none border-2`} />
                </div>
            </ModalSection>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FICHA CARD
───────────────────────────────────────────────────────────────────────────── */
function FichaCard({ ficha, tratCount, onEdit, onDelete, onView }: {
    ficha: FichaInternamento;
    tratCount: number;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
}) {
    const temperamentColor: Record<string, string> = {
        "Dócil": "bg-green-50 text-green-600", "Calmo": "bg-green-50 text-green-600",
        "Brincalhão": "bg-blue-50 text-blue-600", "Medroso": "bg-yellow-50 text-yellow-700",
        "Nervoso": "bg-amber-50 text-amber-700", "Agressivo": "bg-red-50 text-red-600",
    };
    const tColor = temperamentColor[ficha.temperamento] || "bg-gray-50 text-gray-600";

    return (
        <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-300 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-amber-300 rounded-l-3xl" />

            <div className="pl-5 pr-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                            <Dog className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-extrabold text-gray-900">{ficha.nome}</p>
                                {ficha.chip && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 text-[10px] font-mono text-gray-400">
                                        <Cpu className="w-2.5 h-2.5" />{ficha.chip.slice(-6)}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400">{ficha.raca}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={onView} className="p-2 rounded-xl hover:bg-orange-50 text-gray-300 hover:text-orange-500 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={onEdit} className="p-2 rounded-xl hover:bg-orange-50 text-gray-300 hover:text-orange-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={onDelete} className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Pills */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${tColor}`}>
                        <Zap className="w-3 h-3" />{ficha.temperamento || "—"}
                    </span>
                    {ficha.idade && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-orange-50 text-orange-600">
                            <User className="w-3 h-3" />{ficha.idade}
                        </span>
                    )}
                    {ficha.peso > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-600">
                            <Weight className="w-3 h-3" />{ficha.peso} kg
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-50 text-gray-500">
                        <Calendar className="w-3 h-3" />{formatDate(ficha.data)}
                    </span>
                </div>

                {/* Motivo */}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{ficha.motivo || "—"}</p>

                {/* Tratamentos badge */}
                <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${tratCount > 0 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"}`}>
                        <Syringe className="w-3.5 h-3.5" />
                        {tratCount > 0 ? `${tratCount} tratamento${tratCount !== 1 ? "s" : ""}` : "Sem tratamentos"}
                    </div>
                </div>
            </div>

            <button onClick={onView}
                className="w-full flex items-center justify-end gap-1.5 px-5 py-2.5 bg-gray-50/60 hover:bg-orange-50/60 border-t border-gray-50 transition-colors text-xs font-semibold text-gray-300 hover:text-orange-400">
                Ver ficha completa <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function FichasInternamento() {
    const [fichas, setFichas] = useState<FichaInternamento[]>([]);
    const [tratamentos, setTratamentos] = useState<Tratamento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated fetch — replace with real API calls
        setTimeout(() => {
            setFichas([
                { id: 1, nome: "Simba", raca: "Golden Retriever", data: "2025-05-10", temperamento: "Dócil", idade: "4 anos", peso: 32.5, motivo: "Cirurgia ortopédica ao membro posterior esquerdo", chip: "941000024680135" },
                { id: 2, nome: "Luna", raca: "Labrador", data: "2025-05-18", temperamento: "Nervoso", idade: "2 anos", peso: 24.1, motivo: "Gastroenterite aguda com desidratação moderada", chip: "941000024680244" },
            ]);
            setTratamentos([
                { id: 1, medicacao: "Amoxicilina", dose: "250mg 2x/dia", data: "2025-05-11", internamento: 1 },
                { id: 2, medicacao: "Tramadol", dose: "50mg 3x/dia", data: "2025-05-11", internamento: 1 },
                { id: 3, medicacao: "Metronidazol", dose: "500mg 2x/dia", data: "2025-05-18", internamento: 2 },
                { id: 4, medicacao: "Soro IV", dose: "500ml/dia", data: "2025-05-19", internamento: 2 },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

    // Modals
    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<FichaInternamento | null>(null);
    const [viewItem, setViewItem] = useState<FichaInternamento | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const [form, setForm] = useState(emptyFicha());
    const nextId = useMemo(() => Math.max(0, ...fichas.map(f => f.id)) + 1, [fichas]);

    const filtered = useMemo(() => {
        let d = [...fichas];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            d = d.filter(f =>
                f.nome.toLowerCase().includes(q) ||
                f.raca.toLowerCase().includes(q) ||
                f.motivo.toLowerCase().includes(q) ||
                f.chip.toLowerCase().includes(q)
            );
        }
        d.sort((a, b) => {
            const cmp = a.data.localeCompare(b.data);
            return sortDir === "desc" ? -cmp : cmp;
        });
        return d;
    }, [fichas, searchQuery, sortDir]);

    const tratCount = (id: number) => tratamentos.filter(t => t.internamento === id).length;

    const handleCreate = () => {
        const newFicha: FichaInternamento = { ...form, id: nextId };
        setFichas(p => [newFicha, ...p]);
        setCreateOpen(false);
        setForm(emptyFicha());
    };

    const handleUpdate = () => {
        if (!editItem) return;
        setFichas(p => p.map(f => f.id === editItem.id ? editItem : f));
        setEditItem(null);
    };

    const handleDelete = () => {
        if (deleteConfirmId == null) return;
        setFichas(p => p.filter(f => f.id !== deleteConfirmId));
        setTratamentos(p => p.filter(t => t.internamento !== deleteConfirmId));
        setDeleteConfirmId(null);
    };

    const handleAddTratamento = (t: Omit<Tratamento, "id">) => {
        const newId = Math.max(0, ...tratamentos.map(x => x.id)) + 1;
        setTratamentos(p => [...p, { ...t, id: newId }]);
    };

    const handleDeleteTratamento = (id: number) => {
        setTratamentos(p => p.filter(t => t.id !== id));
    };

    const handleExport = () => {
        const rows = [
            ["ID", "Nome", "Raça", "Data", "Temperamento", "Idade", "Peso", "Motivo", "Chip"],
            ...fichas.map(f => [f.id, f.nome, f.raca, formatDate(f.data), f.temperamento, f.idade, f.peso, f.motivo, f.chip]),
        ];
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `internamentos_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const isFormValid = (f: Omit<FichaInternamento, "id">) =>
        f.nome.trim() !== "" && f.raca.trim() !== "" && f.temperamento.trim() !== "" && f.motivo.trim() !== "";

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/30 pb-20">

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
                                    <ClipboardList className="w-3.5 h-3.5 text-white/80" />
                                    <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Internamento</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Fichas de Internamento</h1>
                                <p className="text-orange-100/70 text-sm mt-1.5">Gestão de internamentos e plano de tratamentos</p>
                            </div>
                            <div className="flex gap-3 items-center flex-wrap">
                                <button onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-bold transition-colors">
                                    <FileDown className="w-4 h-4" /> Exportar CSV
                                </button>
                                <button onClick={() => { setForm(emptyFicha()); setCreateOpen(true); }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 text-sm font-extrabold shadow-lg shadow-orange-900/20 transition-colors">
                                    <Plus className="w-4 h-4" /> Nova ficha
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                            {[
                                { label: "Total internamentos", value: fichas.length, icon: ClipboardList },
                                { label: "Este mês", value: fichas.filter(f => f.data.slice(0, 7) === new Date().toISOString().slice(0, 7)).length, icon: Calendar },
                                { label: "Total tratamentos", value: tratamentos.length, icon: Syringe },
                                { label: "Animais únicos", value: new Set(fichas.map(f => f.chip || f.nome)).size, icon: Dog },
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
                            <Input placeholder="Pesquisar por nome, raça, chip ou motivo…"
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 rounded-xl border-2 border-gray-100 focus:border-orange-300 focus:ring-0 text-sm" />
                        </div>
                        <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-100 text-sm font-semibold text-gray-500 hover:border-orange-200 hover:text-orange-600 transition-colors">
                            {sortDir === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                            {sortDir === "desc" ? "Mais recentes" : "Mais antigas"}
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
                            <p className="text-sm text-gray-400 font-medium">A carregar fichas…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center">
                                <ClipboardList className="w-8 h-8 text-orange-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-700 mb-1">Nenhuma ficha encontrada</p>
                                <p className="text-sm text-gray-400">
                                    {searchQuery ? "Tente outra pesquisa." : "Clique em \"Nova ficha\" para começar."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {filtered.map(ficha => (
                                    <FichaCard key={ficha.id} ficha={ficha}
                                        tratCount={tratCount(ficha.id)}
                                        onEdit={() => setEditItem({ ...ficha })}
                                        onDelete={() => setDeleteConfirmId(ficha.id)}
                                        onView={() => setViewItem(ficha)} />
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
                                <DialogTitle className="text-white text-lg font-extrabold">Nova Ficha de Internamento</DialogTitle>
                                <p className="text-white/60 text-xs mt-0.5">Preencha os dados do internamento</p>
                            </div>
                        </div>
                    </div>
                    <FichaForm data={form} setData={setForm} />
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                        <Button onClick={handleCreate} disabled={!isFormValid(form)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold disabled:opacity-40">
                            Criar ficha
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
                                <DialogTitle className="text-white text-lg font-extrabold">Editar Ficha</DialogTitle>
                                <p className="text-white/60 text-xs mt-0.5">#{editItem?.id} · {editItem?.nome}</p>
                            </div>
                        </div>
                    </div>
                    {editItem && (
                        <>
                            <FichaForm data={editItem} setData={setEditItem} />
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                                <Button onClick={handleUpdate} disabled={!isFormValid(editItem)}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold disabled:opacity-40">
                                    Guardar alterações
                                </Button>
                                <Button variant="outline" onClick={() => setEditItem(null)} className="rounded-xl h-11 px-5">Cancelar</Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── VIEW + TRATAMENTOS MODAL ── */}
            <Dialog open={!!viewItem} onOpenChange={open => { if (!open) setViewItem(null); }}>
                <DialogContent className="rounded-3xl max-w-2xl p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 gap-0">
                    {viewItem && (
                        <>
                            <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-6 py-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Dog className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <DialogTitle className="text-white text-xl font-extrabold">{viewItem.nome}</DialogTitle>
                                        <p className="text-white/70 text-sm">{viewItem.raca}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {viewItem.chip && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-xs font-bold text-white font-mono">
                                                    <Cpu className="w-3 h-3" />{viewItem.chip}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-xs font-bold text-white">
                                                <Calendar className="w-3 h-3" />{formatDate(viewItem.data)}
                                            </span>
                                            {viewItem.idade && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-xs font-bold text-white">
                                                    <User className="w-3 h-3" />{viewItem.idade}
                                                </span>
                                            )}
                                            {viewItem.peso > 0 && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-xs font-bold text-white">
                                                    <Weight className="w-3 h-3" />{viewItem.peso} kg
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-[70vh]">
                                {/* Info grid */}
                                <div className="px-6 pt-5 pb-4 grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Temperamento</p>
                                        <p className="text-sm font-bold text-gray-800">{viewItem.temperamento || "—"}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tratamentos</p>
                                        <p className="text-sm font-bold text-orange-600">{tratCount(viewItem.id)} registados</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl col-span-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Motivo</p>
                                        <p className="text-sm font-semibold text-gray-800 leading-relaxed">{viewItem.motivo || "—"}</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="px-6 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <Syringe className="w-3.5 h-3.5 text-orange-400" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">Plano de Tratamentos</p>
                                        </div>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>
                                </div>

                                {/* Calendar */}
                                <div className="px-6 pb-6">
                                    <TratamentosCalendar
                                        ficha={viewItem}
                                        tratamentos={tratamentos.filter(t => t.internamento === viewItem.id)}
                                        onAdd={handleAddTratamento}
                                        onDelete={handleDeleteTratamento}
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                                <Button onClick={() => { setEditItem({ ...viewItem }); setViewItem(null); }}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold">
                                    <Pencil className="w-4 h-4 mr-1.5" /> Editar ficha
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
                        <DialogTitle className="text-gray-900 text-lg font-extrabold mb-2">Eliminar ficha?</DialogTitle>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A ficha e todos os tratamentos associados serão eliminados permanentemente.
                        </p>
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                        <Button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-bold shadow-sm shadow-red-200">
                            Sim, eliminar
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-xl h-11">Cancelar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}