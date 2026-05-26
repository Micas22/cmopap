"use client";

import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  PawPrint, Phone, User, MapPin, Search, Plus, X,
  Filter, Crosshair, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, List, SlidersHorizontal, RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Shelter {
  id: number;
  name: string;
  position: [number, number];
  count: number;
  owner: string;
  contact: string;
}

type Tab = "list" | "add";
type Toast = { msg: string; type: "success" | "error" } | null;

// ─── Marker Icons ─────────────────────────────────────────────────────────────

const makeIcon = (html: string, size = 48) =>
  L.divIcon({ className: "", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -(size / 2)] });

const customIcon = makeIcon(`
  <div style="position:relative;display:flex;align-items:center;justify-content:center;width:48px;height:48px" class="shelter-marker">
    <span style="position:absolute;inset:0;border-radius:9999px;background:#f97316;opacity:.35;animation:ping 1.4s cubic-bezier(0,0,.2,1) infinite"></span>
    <span style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:linear-gradient(135deg,#ea580c,#d97706);border:2.5px solid #fff;box-shadow:0 4px 14px rgba(234,88,12,.45),0 2px 4px rgba(0,0,0,.15);color:#fff">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </span>
  </div>
`);

const selectedIcon = makeIcon(`
  <div style="position:relative;display:flex;align-items:center;justify-content:center;width:56px;height:56px">
    <span style="position:absolute;inset:0;border-radius:9999px;background:#f97316;opacity:.4;animation:ping 1s cubic-bezier(0,0,.2,1) infinite"></span>
    <span style="position:relative;display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:9999px;background:linear-gradient(135deg,#c2410c,#b45309);border:3px solid #fff;box-shadow:0 6px 20px rgba(194,65,12,.55),0 2px 6px rgba(0,0,0,.2);color:#fff">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </span>
  </div>
`, 56);

const tempIcon = makeIcon(`
  <div style="position:relative;display:flex;align-items:center;justify-content:center;width:48px;height:48px">
    <span style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;opacity:.3;animation:ping 1.2s cubic-bezier(0,0,.2,1) infinite"></span>
    <span style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:linear-gradient(135deg,#2563eb,#1d4ed8);border:2.5px solid #fff;box-shadow:0 4px 14px rgba(37,99,235,.45);color:#fff">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </span>
  </div>
`);

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Flies the map to a target position */
const FlyController = ({ target }: { target: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 17, { duration: 1.1 });
  }, [target, map]);
  return null;
};

/** Handles map click for location selection */
const MapClickHandler = ({
  active,
  onPick,
}: {
  active: boolean;
  onPick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click: (e) => {
      if (active) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

/** Individual shelter marker with styled popup */
const ShelterMarker = ({
  shelter,
  isVisible,
  isSelected,
  onClick,
}: {
  shelter: Shelter;
  isVisible: boolean;
  isSelected: boolean;
  onClick: () => void;
}) => {
  if (!isVisible) return null;

  return (
    <Marker
      position={shelter.position}
      icon={isSelected ? selectedIcon : customIcon}
      eventHandlers={{ click: onClick }}
    >
      <Popup className="shelter-popup" closeButton={false} minWidth={220}>
        <div className="font-sans">
          {/* Popup header */}
          <div
            style={{
              background: "linear-gradient(135deg, #ea580c, #d97706)",
              margin: "-1px -1px 0",
              padding: "12px 14px 10px",
              borderRadius: "10px 10px 0 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: 5 }}>
                <PawPrint size={13} color="#fff" />
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>
                {shelter.name}
              </span>
            </div>
          </div>

          {/* Popup body */}
          <div style={{ padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
            <PopupRow icon={<PawPrint size={11} />} label="Animais" value={String(shelter.count)} highlight />
            <PopupRow icon={<User size={11} />} label="Responsável" value={shelter.owner} />
            <PopupRow icon={<Phone size={11} />} label="Contacto" value={shelter.contact} />
            <a
              href={`https://maps.google.com/?q=${shelter.position[0]},${shelter.position[1]}`}
              target="_blank"
              rel="noreferrer"
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                background: "linear-gradient(135deg,#ea580c,#d97706)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 0",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              <MapPin size={10} />
              Abrir no Google Maps
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const PopupRow = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontSize: 11 }}>
      {icon}
      <span>{label}</span>
    </div>
    <span
      style={
        highlight
          ? { background: "#fff7ed", color: "#ea580c", fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 999 }
          : { color: "#374151", fontSize: 11, fontWeight: 600 }
      }
    >
      {value}
    </span>
  </div>
);

// ─── Form field ───────────────────────────────────────────────────────────────

const Field = ({
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShelterMap() {
  const [tab, setTab] = useState<Tab>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [minAnimals, setMinAnimals] = useState(0);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [newShelter, setNewShelter] = useState({
    nome: "", responsavel: "", contacto: "", num_animais: 0,
    latitude: 0, longitude: 0,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchShelters = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/admin/colonias");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setShelters(
        data.map((c: any) => ({
          id: c.id,
          name: c.nome,
          position: [c.latitude, c.longitude] as [number, number],
          count: c.num_animais,
          owner: c.responsavel,
          contact: c.contacto,
        }))
      );
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShelters(); }, [fetchShelters]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Map pick ───────────────────────────────────────────────────────────────
  const handleMapPick = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
    setNewShelter((s) => ({ ...s, latitude: lat, longitude: lng }));
    setIsSelectingLocation(false);
  };

  // ── Select shelter from list ───────────────────────────────────────────────
  const handleSelectShelter = (shelter: Shelter) => {
    setSelectedId(shelter.id);
    setFlyTarget([...shelter.position]);
  };

  // ── Create shelter ─────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newShelter.nome.trim()) return setFormError("O nome é obrigatório.");
    if (!newShelter.responsavel.trim()) return setFormError("O responsável é obrigatório.");
    if (!newShelter.contacto.trim()) return setFormError("O contacto é obrigatório.");
    if (!selectedLocation) return setFormError("Selecione uma localização no mapa.");
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/colonias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShelter),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setShelters((prev) => [
        ...prev,
        {
          id: created.id, name: created.nome,
          position: [created.latitude, created.longitude],
          count: created.num_animais, owner: created.responsavel, contact: created.contacto,
        },
      ]);
      setNewShelter({ nome: "", responsavel: "", contacto: "", num_animais: 0, latitude: 0, longitude: 0 });
      setSelectedLocation(null);
      setTab("list");
      showToast("Abrigo criado com sucesso!", "success");
    } catch {
      showToast("Erro ao criar abrigo. Tente novamente.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = shelters.filter(
    (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) && s.count >= minAnimals
  );
  const totalAnimals = shelters.reduce((acc, s) => acc + s.count, 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Marker ping keyframe */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .shelter-popup .leaflet-popup-content-wrapper {
          padding: 0; border-radius: 12px; overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.1);
          border: none;
        }
        .shelter-popup .leaflet-popup-content { margin: 0; }
        .shelter-popup .leaflet-popup-tip-container { margin-top: -1px; }
        .shelter-popup .leaflet-popup-tip { background: white; }
      `}</style>

      <div className="relative h-full w-full overflow-hidden">

        {/* ── Crosshair mode overlay ──────────────────────────────────────── */}
        <AnimatePresence>
          {isSelectingLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[999] cursor-crosshair pointer-events-none"
            >
              {/* Dimmed border */}
              <div className="absolute inset-0 ring-inset ring-4 ring-blue-500/30 pointer-events-none" />
              {/* Banner */}
              <motion.div
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl shadow-blue-900/25 select-none pointer-events-auto"
              >
                <Crosshair size={14} className="animate-pulse" />
                Clique no mapa para selecionar a localização
                <button
                  onClick={() => setIsSelectingLocation(false)}
                  className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 transition-colors"
                >
                  <X size={11} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Toast ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold select-none ${toast.type === "success"
                  ? "bg-green-600 text-white shadow-green-900/20"
                  : "bg-red-600 text-white shadow-red-900/20"
                }`}
            >
              {toast.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Sidebar panel ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-4 left-4 z-[1000] w-72 flex flex-col bg-white/97 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden"
          style={{ maxHeight: "calc(100% - 2rem)" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3.5 flex-shrink-0 relative overflow-hidden">
            {/* Grain */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "128px",
              }}
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <PawPrint size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">Colónias Felinas</p>
                  <p className="text-white/65 text-[10px]">Olhão</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {shelters.length} colónias
                </span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalAnimals} animais
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 flex-shrink-0">
            {(["list", "add"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 relative ${tab === t ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {t === "list" ? <List size={12} /> : <Plus size={12} />}
                {t === "list" ? "Colónias" : "Adicionar"}
                {tab === t && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── LIST TAB ─────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {tab === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                {/* Search + filter */}
                <div className="p-3 space-y-3 flex-shrink-0 border-b border-gray-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <input
                      type="text"
                      placeholder="Pesquisar colónia..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400/25 focus:border-orange-400 transition-all"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <SlidersHorizontal size={9} /> Mín. animais
                      </span>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        {minAnimals}+
                      </span>
                    </div>
                    <input
                      type="range" min={0} max={50} value={minAnimals}
                      onChange={(e) => setMinAnimals(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-500 bg-gray-200"
                    />
                  </div>
                </div>

                {/* Shelter list */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                      <Loader2 size={18} className="animate-spin text-orange-400" />
                      <span className="text-xs">A carregar...</span>
                    </div>
                  ) : fetchError ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 px-4 text-center">
                      <AlertCircle size={20} className="text-red-400" />
                      <p className="text-xs text-gray-500">Erro ao carregar colónias</p>
                      <button onClick={fetchShelters} className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:underline">
                        <RefreshCw size={11} /> Tentar novamente
                      </button>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                      <PawPrint size={20} className="text-gray-300" />
                      <p className="text-xs">Nenhuma colónia encontrada</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filtered.map((shelter, i) => (
                        <motion.button
                          key={shelter.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => handleSelectShelter(shelter)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${selectedId === shelter.id
                              ? "bg-orange-50 ring-1 ring-orange-200"
                              : "hover:bg-gray-50"
                            }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${selectedId === shelter.id
                                ? "bg-orange-500 text-white"
                                : "bg-orange-50 text-orange-500 group-hover:bg-orange-100"
                              }`}
                          >
                            <PawPrint size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-semibold leading-tight truncate ${selectedId === shelter.id ? "text-orange-700" : "text-gray-800"}`}>
                              {shelter.name}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{shelter.owner}</p>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedId === shelter.id ? "bg-orange-200 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                              {shelter.count}
                            </span>
                            <ChevronRight size={11} className={`transition-colors ${selectedId === shelter.id ? "text-orange-400" : "text-gray-300"}`} />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer count */}
                {!loading && !fetchError && (
                  <div className="px-4 py-2 border-t border-gray-50 flex-shrink-0">
                    <p className="text-[10px] text-gray-400 text-center">
                      {filtered.length} de {shelters.length} colónias
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ADD TAB ────────────────────────────────────────────────── */}
            {tab === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-4 space-y-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    Nova colónia
                  </p>

                  <Field
                    label="Nome" id="nome"
                    placeholder="Nome da colónia"
                    value={newShelter.nome}
                    onChange={(e) => setNewShelter({ ...newShelter, nome: e.target.value })}
                  />
                  <Field
                    label="Responsável" id="responsavel"
                    placeholder="Nome do responsável"
                    value={newShelter.responsavel}
                    onChange={(e) => setNewShelter({ ...newShelter, responsavel: e.target.value })}
                  />
                  <Field
                    label="Contacto" id="contacto"
                    placeholder="Número de telefone"
                    value={newShelter.contacto}
                    onChange={(e) => setNewShelter({ ...newShelter, contacto: e.target.value })}
                  />
                  <Field
                    label="Nº de animais" id="num_animais"
                    type="number" min={0}
                    placeholder="0"
                    value={newShelter.num_animais}
                    onChange={(e) => setNewShelter({ ...newShelter, num_animais: Number(e.target.value) })}
                  />

                  {/* Location picker */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Localização
                    </span>
                    {selectedLocation ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2.5">
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-green-700">Localização definida</p>
                          <p className="text-[10px] text-green-600 mt-0.5 font-mono">
                            {selectedLocation[0].toFixed(5)}, {selectedLocation[1].toFixed(5)}
                          </p>
                        </div>
                        <button
                          onClick={() => { setSelectedLocation(null); setIsSelectingLocation(true); }}
                          className="text-green-400 hover:text-green-600 flex-shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSelectingLocation(true)}
                        disabled={isSelectingLocation}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-all duration-200 ${isSelectingLocation
                            ? "border-blue-400 bg-blue-50 text-blue-500 cursor-wait"
                            : "border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                      >
                        {isSelectingLocation ? (
                          <><Crosshair size={14} className="animate-pulse" /> A aguardar clique no mapa...</>
                        ) : (
                          <><MapPin size={14} /> Selecionar no mapa</>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Inline form error */}
                  <AnimatePresence>
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-3 py-2.5 rounded-xl"
                      >
                        <AlertCircle size={13} className="flex-shrink-0" />
                        {formError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    onClick={handleCreate}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 active:scale-[.98]"
                  >
                    {submitting ? (
                      <><Loader2 size={14} className="animate-spin" /> A criar...</>
                    ) : (
                      <><Plus size={14} /> Criar Colónia</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Map ─────────────────────────────────────────────────────────── */}
        <MapContainer
          center={[37.0286, -7.8411]}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={false}
          className="h-full w-full"
          style={{ cursor: isSelectingLocation ? "crosshair" : undefined }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <FlyController target={flyTarget} />
          <MapClickHandler active={isSelectingLocation} onPick={handleMapPick} />

          {selectedLocation && (
            <Marker position={selectedLocation} icon={tempIcon}>
              <Popup closeButton={false} minWidth={180}>
                <div style={{ padding: "8px 12px", fontSize: 12, color: "#374151", fontFamily: "sans-serif" }}>
                  <strong style={{ color: "#2563eb" }}>Nova colónia</strong>
                  <br />
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>
                    {selectedLocation[0].toFixed(5)}, {selectedLocation[1].toFixed(5)}
                  </span>
                </div>
              </Popup>
            </Marker>
          )}

          {shelters.map((shelter) => (
            <ShelterMarker
              key={shelter.id}
              shelter={shelter}
              isVisible={
                shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                shelter.count >= minAnimals
              }
              isSelected={selectedId === shelter.id}
              onClick={() => setSelectedId(shelter.id)}
            />
          ))}
        </MapContainer>
      </div>
    </>
  );
}