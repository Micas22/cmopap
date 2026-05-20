"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, MapPin, FileText, AlertCircle, CheckCircle2,
  X, ChevronRight, ChevronLeft, Upload, Image as ImageIcon,
  PawPrint, Bandage, TriangleAlert, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

/* ─── Dynamic map ─────────────────────────────────────────── */
const ReportMap = dynamic(() => import("@/components/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400 font-medium">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-sm">A carregar mapa...</span>
      </div>
    </div>
  ),
});

/* ─── Constants ───────────────────────────────────────────── */
const OCCURRENCE_TYPES = [
  { value: "type1", label: "Animal Perdido", icon: PawPrint, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-300" },
  { value: "type2", label: "Animal Ferido", icon: Bandage, color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
  { value: "type3", label: "Abandono", icon: TriangleAlert, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300" },
  { value: "type4", label: "Outro", icon: ClipboardList, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-300" },
];

const STEPS = [
  { id: 1, label: "Tipo" },
  { id: 2, label: "Detalhes" },
  { id: 3, label: "Localização" },
  { id: 4, label: "Revisão" },
];

const MAX_DESC = 500;

/* ─── Small helpers ───────────────────────────────────────── */
function FieldError({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="text-xs text-red-500 flex items-center gap-1 mt-1"
    >
      <AlertCircle className="w-3 h-3 shrink-0" /> {message}
    </motion.p>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${done ? "bg-orange-500 text-white"
                  : active ? "bg-orange-500 text-white ring-4 ring-orange-100"
                    : "bg-gray-100 text-gray-400"
                }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? "text-orange-600" : done ? "text-gray-500" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded transition-all duration-500 ${done ? "bg-orange-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-sm w-full mx-4"
    >
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function SuccessModal({ type, onClose }: { type: typeof OCCURRENCE_TYPES[0]; onClose: () => void }) {
  const Icon = type.icon;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.82, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.82, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated rings */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
            className="absolute inset-0 bg-green-200 rounded-full"
          />
          <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Relatório Enviado!</h3>
        <p className="text-gray-500 text-sm mb-1">
          A sua ocorrência de <strong className="text-gray-700">{type.label}</strong> foi registada com sucesso.
        </p>
        <p className="text-gray-400 text-xs mb-6">Iremos analisar e dar seguimento em breve.</p>
        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 font-medium"
        >
          Fechar
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Review row ──────────────────────────────────────────── */
function ReviewRow({ label, value, onEdit, step }: { label: string; value: string; onEdit: (s: number) => void; step: number }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-gray-700 break-words leading-relaxed">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="text-xs text-orange-500 font-medium hover:text-orange-700 transition-colors shrink-0 mt-1"
      >
        Editar
      </button>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    address: "",
    type: "type1",
    image: null as File | null,
  });

  /* Derived */
  const selectedType = OCCURRENCE_TYPES.find((t) => t.value === formData.type)!;
  const descLength = formData.body.length;

  const stepErrors = {
    1: "",
    2: !formData.title.trim() ? "O título é obrigatório" : !formData.body.trim() ? "A descrição é obrigatória" : "",
    3: !formData.address.trim() ? "Selecione uma localização no mapa" : "",
    4: "",
  };

  /* Completed fields for progress bar */
  const completedFields = [
    true, // type always chosen
    !!formData.title.trim(),
    !!formData.body.trim(),
    !!formData.address.trim(),
  ];
  const progress = Math.round((completedFields.filter(Boolean).length / completedFields.length) * 100);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleNextStep = () => {
    if (step === 2) {
      setTouched({ title: true, body: true });
      if (stepErrors[2]) { showToast(stepErrors[2]); return; }
    }
    if (step === 3) {
      setTouched((p) => ({ ...p, address: true }));
      if (stepErrors[3]) { showToast(stepErrors[3]); return; }
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data?.display_name) {
        setFormData((p) => ({ ...p, address: data.display_name }));
        setTouched((p) => ({ ...p, address: true }));
      }
    } catch { /* silent */ }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("A imagem não pode exceder 5 MB."); return; }
    setFormData((p) => ({ ...p, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const estadoMap: Record<string, number> = { type1: 0, type2: 1, type3: 2, type4: 3 };

    try {
      const body: Record<string, unknown> = {
        titulo: formData.title,
        descricao: formData.body,
        morada: formData.address,
        data_criacao: new Date().toISOString(),
        data_resolucao: null,
        estado: estadoMap[formData.type] ?? 0,
      };

      const response = await fetch("/api/admin/ocorrencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setFormData({ title: "", body: "", address: "", type: "type1", image: null });
        setPreviewUrl(null);
        setTouched({});
        setStep(1);
        setShowSuccess(true);
      } else {
        const err = await response.json();
        showToast(`Erro: ${err.error ?? "Tente novamente."}`);
      }
    } catch {
      showToast("Falha ao enviar relatório. Verifique a sua ligação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Step panels */
  const stepContent: Record<number, React.ReactNode> = {
    /* ── Step 1: Type ── */
    1: (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Que tipo de ocorrência quer reportar?</h2>
          <p className="text-sm text-gray-500 mt-1">Escolha a categoria que melhor descreve a situação.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {OCCURRENCE_TYPES.map((t) => {
            const Icon = t.icon;
            const active = formData.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: t.value })}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${active
                    ? `${t.border} ${t.bg} shadow-sm`
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? t.bg : "bg-gray-100"} transition-colors`}>
                  <Icon className={`w-5 h-5 ${active ? t.color : "text-gray-400"}`} />
                </div>
                <span className={`font-semibold text-sm ${active ? t.color : "text-gray-700"}`}>{t.label}</span>
                {active && (
                  <motion.div
                    layoutId="type-check"
                    className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    ),

    /* ── Step 2: Details ── */
    2: (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Descreva a ocorrência</h2>
          <p className="text-sm text-gray-500 mt-1">Quanto mais detalhe fornecer, mais rápido podemos ajudar.</p>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Título <span className="text-red-400">*</span></label>
          <Input
            placeholder="Ex: Cão perdido perto do mercado"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onBlur={() => setTouched((p) => ({ ...p, title: true }))}
            className={`rounded-xl h-11 text-sm border transition-colors ${touched.title && !formData.title.trim() ? "border-red-300 focus-visible:ring-red-400" : "border-gray-200"
              }`}
          />
          <AnimatePresence>
            {touched.title && !formData.title.trim() && <FieldError message="O título é obrigatório" />}
          </AnimatePresence>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Descrição <span className="text-red-400">*</span></label>
            <span className={`text-xs tabular-nums ${descLength > MAX_DESC * 0.9 ? "text-orange-500 font-medium" : "text-gray-400"}`}>
              {descLength}/{MAX_DESC}
            </span>
          </div>
          <textarea
            placeholder="Descreva a situação — onde estava, cor/raça do animal, estado de saúde aparente..."
            value={formData.body}
            onChange={(e) => { if (e.target.value.length <= MAX_DESC) setFormData({ ...formData, body: e.target.value }); }}
            onBlur={() => setTouched((p) => ({ ...p, body: true }))}
            className={`w-full min-h-[130px] p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-y transition-colors ${touched.body && !formData.body.trim() ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-orange-500"
              }`}
          />
          {/* Progress bar */}
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
              animate={{ width: `${(descLength / MAX_DESC) * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <AnimatePresence>
            {touched.body && !formData.body.trim() && <FieldError message="A descrição é obrigatória" />}
          </AnimatePresence>
        </div>

        {/* Image upload */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Fotografia <span className="text-gray-400 font-normal">(opcional)</span></label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
              <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-cover" />
              <button
                type="button"
                onClick={() => { setPreviewUrl(null); setFormData((p) => ({ ...p, image: null })); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                {formData.image?.name}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-orange-300 hover:bg-orange-50/40 hover:text-orange-500 transition-all"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Clique para carregar uma imagem</span>
              <span className="text-xs">PNG, JPG, WEBP até 5 MB</span>
            </button>
          )}
        </div>
      </div>
    ),

    /* ── Step 3: Location ── */
    3: (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Onde ocorreu?</h2>
          <p className="text-sm text-gray-500 mt-1">Clique no mapa para marcar o local exato da ocorrência.</p>
        </div>

        {/* Map */}
        <div className="relative h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <ReportMap onLocationSelect={handleLocationSelect} />

          <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-medium text-gray-600 border border-gray-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
              Olhão, Portugal
            </div>
          </div>

          {!formData.address && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-medium text-gray-600 border border-gray-100 flex items-center gap-2 whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Clique para marcar a localização
              </motion.div>
            </div>
          )}

          {formData.address && (
            <div className="absolute top-3 right-3 z-[1000] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-orange-500 text-white px-3 py-1.5 rounded-full shadow-sm text-xs font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3" /> Localização definida
              </motion.div>
            </div>
          )}
        </div>

        {/* Address display */}
        <AnimatePresence mode="wait">
          {formData.address ? (
            <motion.div
              key="addr"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3.5 bg-orange-50 border border-orange-200 rounded-2xl"
            >
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 flex-1 leading-relaxed">{formData.address}</span>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, address: "" }))}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center gap-2 p-3 rounded-2xl border text-sm transition-colors ${touched.address ? "border-red-300 bg-red-50/40 text-red-400" : "border-dashed border-gray-200 text-gray-400"
                }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Nenhuma localização selecionada</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {touched.address && !formData.address && <FieldError message="Selecione uma localização no mapa" />}
        </AnimatePresence>
      </div>
    ),

    /* ── Step 4: Review ── */
    4: (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Confirme os dados</h2>
          <p className="text-sm text-gray-500 mt-1">Verifique as informações antes de enviar o relatório.</p>
        </div>

        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <CardContent className="p-0 divide-y divide-gray-100">
            {/* Type hero */}
            <div className={`flex items-center gap-4 px-5 py-4 ${selectedType.bg}`}>
              <div className={`w-10 h-10 rounded-xl ${selectedType.bg} flex items-center justify-center border ${selectedType.border}`}>
                <selectedType.icon className={`w-5 h-5 ${selectedType.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tipo</p>
                <p className={`font-bold text-sm ${selectedType.color}`}>{selectedType.label}</p>
              </div>
              <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-orange-500 font-medium hover:text-orange-700">Editar</button>
            </div>

            <div className="px-5">
              <ReviewRow label="Título" value={formData.title} onEdit={setStep} step={2} />
              <ReviewRow label="Descrição" value={formData.body} onEdit={setStep} step={2} />
              <ReviewRow label="Localização" value={formData.address} onEdit={setStep} step={3} />
            </div>

            {previewUrl && (
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Fotografia</p>
                  <p className="text-sm text-gray-700 truncate max-w-[180px]">{formData.image?.name}</p>
                </div>
                <button type="button" onClick={() => setStep(2)} className="ml-auto text-xs text-orange-500 font-medium hover:text-orange-700">Editar</button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center">
          Ao enviar, confirma que as informações prestadas são verídicas.
        </p>
      </div>
    ),
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 font-sans">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Hero header */}
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 leading-tight">Nova Ocorrência</h1>
                <p className="text-xs text-gray-400">Olhão, Portugal</p>
              </div>
              {/* Overall progress */}
              <div className="ml-auto flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-xs text-gray-400 tabular-nums w-8">{progress}%</span>
              </div>
            </div>

            {/* Step indicator */}
            <StepIndicator current={step} />

            {/* Card */}
            <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    {stepContent[step]}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => Math.max(s - 1, 1))}
                disabled={step === 1}
                className="rounded-xl h-11 px-5 border-gray-200 text-gray-600 disabled:opacity-30 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-xl h-11 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-200 font-medium flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-xl h-11 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white shadow-md shadow-orange-200 font-medium flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>
                      Enviar Relatório <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal type={selectedType} onClose={() => setShowSuccess(false)} />
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}