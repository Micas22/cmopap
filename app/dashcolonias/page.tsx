"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Pencil, Trash2, Plus, ChevronDown, X, ArrowLeft,
  Search, User, Phone, Globe, Navigation, Copy, Check,
  AlertTriangle, Loader2, PawPrint, CheckCircle2, XCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

// ─── Types ────────────────────────────────────────────────────────────────────

type Colonia = {
  id: number;
  nome: string;
  responsavel: string;
  contacto: string;
  num_animais: number;
  longitude: number;
  latitude: number;
};

type Animal = {
  id: number;
  nome: string;
  especie?: string;
  esterilizado?: boolean;
  sexo?: string;
  cor?: string;
};

// ─── Leaflet CSS loader ───────────────────────────────────────────────────────

function useLeafletCSS() {
  useEffect(() => {
    if (document.querySelector("link[data-leaflet-css]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.setAttribute("data-leaflet-css", "1");
    document.head.appendChild(link);
  }, []);
}

// ─── Orange custom Leaflet marker HTML ───────────────────────────────────────

const ORANGE_MARKER_HTML = `
  <div style="
    width:28px;height:28px;
    background:linear-gradient(135deg,#f97316,#f59e0b);
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid white;
    box-shadow:0 3px 12px rgba(249,115,22,0.45);
  "></div>
`;

// ─── MapPicker: click-to-place interactive map ────────────────────────────────

function MapPicker({
  lat,
  lng,
  onSelect,
}: {
  lat?: number;
  lng?: number;
  onSelect: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  // keep onSelect stable across renders without re-initialising the map
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      const icon = L.divIcon({
        html: ORANGE_MARKER_HTML,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: "",
      });

      const center: [number, number] =
        lat && lng ? [lat, lng] : [38.7167, -9.1333];

      const map = L.map(containerRef.current!, { center, zoom: 13 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
      }

      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng], { icon }).addTo(map);
        }
        onSelectRef.current(clickLat, clickLng);
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // intentional: mount once per key

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 select-none">
        <Navigation size={14} className="text-orange-500" />
        Localização no mapa
        <span className="text-orange-400 text-xs">*</span>
      </label>
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border-2 border-orange-100"
        style={{ height: 220 }}
      />
      <p className="text-xs text-gray-400">
        {lat && lng ? (
          <span className="font-mono text-orange-500">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        ) : (
          <span className="italic">Clique no mapa para marcar a localização</span>
        )}
      </p>
    </div>
  );
}

// ─── MapView: static read-only map for view modal ────────────────────────────

function MapView({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      const icon = L.divIcon({
        html: ORANGE_MARKER_HTML,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: "",
      });

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng], { icon }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border-2 border-orange-100"
      style={{ height: 190 }}
    />
  );
}

// ─── Shared form component ────────────────────────────────────────────────────

function ColoniaFormFields({
  data,
  onChange,
  mapKey,
}: {
  data: Partial<Colonia>;
  onChange: (d: Partial<Colonia>) => void;
  mapKey: string;
}) {
  const set = (patch: Partial<Colonia>) => onChange({ ...data, ...patch });
  const inputCls =
    "rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-sm h-10";

  return (
    <div className="space-y-4">
      {/* Nome */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <MapPin size={14} className="text-orange-500" />
          Nome da Colónia
          <span className="text-orange-400 text-xs">*</span>
        </label>
        <Input
          value={data.nome ?? ""}
          onChange={(e) => set({ nome: e.target.value })}
          placeholder="Ex: Colónia do Parque"
          className={inputCls}
        />
      </div>

      {/* Responsável + Contacto */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <User size={14} className="text-orange-500" />
            Responsável
            <span className="text-orange-400 text-xs">*</span>
          </label>
          <Input
            value={data.responsavel ?? ""}
            onChange={(e) => set({ responsavel: e.target.value })}
            placeholder="Nome completo"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Phone size={14} className="text-orange-500" />
            Contacto
            <span className="text-orange-400 text-xs">*</span>
          </label>
          <Input
            value={data.contacto ?? ""}
            onChange={(e) => set({ contacto: e.target.value })}
            placeholder="Nº de telefone"
            className={inputCls}
          />
        </div>
      </div>

      {/* Map picker — key forces remount per modal session */}
      <MapPicker
        key={mapKey}
        lat={data.latitude}
        lng={data.longitude}
        onSelect={(lat, lng) => set({ latitude: lat, longitude: lng })}
      />

      {/* Manual coordinate overrides */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <Navigation size={12} className="text-orange-400" />
            Latitude
          </label>
          <Input
            type="number"
            step="any"
            value={data.latitude ?? ""}
            onChange={(e) => set({ latitude: Number(e.target.value) })}
            placeholder="38.7167"
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <Globe size={12} className="text-orange-400" />
            Longitude
          </label>
          <Input
            type="number"
            step="any"
            value={data.longitude ?? ""}
            onChange={(e) => set({ longitude: Number(e.target.value) })}
            placeholder="-9.1333"
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  useLeafletCSS();
  const router = useRouter();

  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [loading, setLoading] = useState(true);

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalsLoading, setAnimalsLoading] = useState(false);

  const [viewItem, setViewItem] = useState<Colonia | null>(null);
  const [editItem, setEditItem] = useState<Partial<Colonia> | null>(null);
  const [deleteItem, setDeleteItem] = useState<Colonia | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Colonia>>({});

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [copiedCoord, setCopiedCoord] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem("email")) router.push("/login");
    fetchColonias();
  }, [router]);

  const fetchColonias = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/colonias");
      const data = await res.json();
      setColonias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimals = async (id: number) => {
    setAnimalsLoading(true);
    setAnimals([]);
    try {
      const res = await fetch(`/api/admin/colonias/${id}/animais`);
      if (res.ok) {
        const data = await res.json();
        setAnimals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnimalsLoading(false);
    }
  };

  const openView = (c: Colonia) => {
    setViewItem(c);
    fetchAnimals(c.id);
  };

  // ── Table ─────────────────────────────────────────────────────────────────

  const handleSort = (key: string) =>
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const sortData = <T extends Record<string, any>>(data: T[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const [vA, vB] = [a[sortConfig.key], b[sortConfig.key]];
      if (vA === vB) return 0;
      if (vA == null) return 1;
      if (vB == null) return -1;
      return (vA < vB ? -1 : 1) * (sortConfig.direction === "asc" ? 1 : -1);
    });
  };

  const filteredColonias = sortData(
    colonias.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        [c.nome, c.responsavel, c.contacto].some((f) =>
          f.toLowerCase().includes(q)
        )
      );
    })
  );

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!editItem) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/colonias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });
      if (!res.ok) {
        alert(`Erro ao atualizar: ${(await res.json()).error}`);
        return;
      }
      const updated: Colonia = await res.json();
      setColonias((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditItem(null);
    } catch {
      alert("Erro inesperado ao guardar.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreate = async () => {
    const { nome, responsavel, contacto, latitude, longitude } = newForm;
    if (!nome || !responsavel || !contacto || latitude == null || longitude == null) {
      alert("Preencha todos os campos e selecione a localização no mapa.");
      return;
    }
    setCreatingNew(true);
    try {
      const res = await fetch("/api/admin/colonias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newForm, num_animais: 0 }),
      });
      if (!res.ok) {
        alert(`Erro ao criar: ${(await res.json()).error}`);
        return;
      }
      const createdColonia = await res.json();
      setColonias((prev) => [...prev, createdColonia]);
      setNewForm({});
      setCreateOpen(false);
    } catch {
      alert("Erro ao criar colónia.");
    } finally {
      setCreatingNew(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeletingItem(true);
    try {
      const res = await fetch("/api/admin/colonias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteItem.id }),
      });
      if (!res.ok) {
        alert(`Erro ao eliminar: ${(await res.json()).error}`);
        return;
      }
      setColonias((prev) => prev.filter((c) => c.id !== deleteItem.id));
      setDeleteItem(null);
    } catch {
      alert("Erro ao eliminar colónia.");
    } finally {
      setDeletingItem(false);
    }
  };

  const copyCoords = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedCoord(true);
    setTimeout(() => setCopiedCoord(false), 2000);
  };

  const totalAnimals = colonias.reduce((sum, c) => sum + (c.num_animais ?? 0), 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">

          {/* ── Stats ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-orange-100">
              <div className="p-3 bg-white/20 rounded-xl">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-100 uppercase tracking-widest">
                  Total Colónias
                </p>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {loading ? "—" : colonias.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <PawPrint className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Total Animais
                </p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {loading ? "—" : totalAnimals}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Table card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-white ring-1 ring-gray-100">
              <CardHeader className="px-8 py-6 border-b border-gray-50 space-y-4">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                      </Link>
                    </Button>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Colónias
                    </CardTitle>
                  </div>

                  <Button
                    onClick={() => {
                      setNewForm({});
                      setCreateOpen(true);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md shadow-orange-200 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Colónia
                  </Button>
                </div>

                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    placeholder="Pesquisar por nome, responsável ou contacto…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">A carregar colónias…</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader className="bg-gray-50/60">
                        <TableRow className="hover:bg-transparent border-gray-100">
                          {[
                            { key: "id", label: "ID" },
                            { key: "nome", label: "Nome" },
                            { key: "responsavel", label: "Responsável" },
                            { key: "contacto", label: "Contacto" },
                            { key: "num_animais", label: "N.º Animais" },
                          ].map((col) => (
                            <TableHead
                              key={col.key}
                              onClick={() => handleSort(col.key)}
                              className={`${col.key === "id" ? "pl-8" : ""} h-11 font-semibold text-gray-500 cursor-pointer hover:text-orange-500 text-xs uppercase tracking-wider select-none transition-colors`}
                            >
                              <div className="flex items-center gap-1">
                                {col.label}
                                {sortConfig?.key === col.key && (
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 text-orange-500 transition-transform ${sortConfig.direction === "asc"
                                      ? "rotate-180"
                                      : ""
                                      }`}
                                  />
                                )}
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="text-right pr-8 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                            Ações
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredColonias.map((c) => (
                          <TableRow
                            key={c.id}
                            className="group hover:bg-orange-50/40 transition-colors border-gray-50/60 cursor-pointer"
                            onClick={() => openView(c)}
                          >
                            <TableCell className="pl-8 font-mono text-xs text-gray-400 tabular-nums">
                              #{c.id}
                            </TableCell>
                            <TableCell className="font-semibold text-gray-900">
                              {c.nome}
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {c.responsavel}
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {c.contacto}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                <PawPrint size={10} />
                                {c.num_animais}
                              </span>
                            </TableCell>
                            <TableCell
                              className="text-right pr-8 space-x-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                onClick={() => setEditItem({ ...c })}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                onClick={() => setDeleteItem(c)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {filteredColonias.length === 0 && (
                      <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MapPin className="h-8 w-8 text-orange-300" />
                        </div>
                        <p className="text-gray-700 font-semibold text-base">
                          Nenhuma colónia encontrada
                        </p>
                        <p className="text-gray-400 text-sm mt-1.5">
                          {searchQuery
                            ? "Tente ajustar os filtros de pesquisa"
                            : "Adicione uma nova colónia para começar"}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* ════════════════════════════════════════════
            VIEW MODAL
        ════════════════════════════════════════════ */}
        <Dialog
          open={!!viewItem}
          onOpenChange={(open) => {
            if (!open) setViewItem(null);
          }}
        >
          <DialogContent className="rounded-3xl max-w-xl p-0 overflow-hidden border-0 shadow-2xl gap-0">
            {viewItem && (
              <>
                {/* Orange header */}
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 px-7 pt-7 pb-6 relative">
                  <button
                    onClick={() => setViewItem(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-xl text-orange-100 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">
                    Colónia #{viewItem.id}
                  </p>
                  <h2 className="text-white text-xl font-bold leading-tight pr-8">
                    {viewItem.nome}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold rounded-xl px-3 py-1.5">
                      <PawPrint size={11} />
                      {viewItem.num_animais} animais
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold rounded-xl px-3 py-1.5">
                      <User size={11} />
                      {viewItem.responsavel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold rounded-xl px-3 py-1.5">
                      <Phone size={11} />
                      {viewItem.contacto}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto bg-white">

                  {/* Map */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Navigation size={13} className="text-orange-500" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Localização
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            copyCoords(viewItem.latitude, viewItem.longitude)
                          }
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors font-medium"
                        >
                          {copiedCoord ? (
                            <Check size={11} className="text-green-500" />
                          ) : (
                            <Copy size={11} />
                          )}
                          {copiedCoord ? "Copiado!" : "Copiar coords"}
                        </button>
                        <a
                          href={`https://www.google.com/maps?q=${viewItem.latitude},${viewItem.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-bold transition-colors"
                        >
                          <ExternalLink size={11} />
                          Google Maps
                        </a>
                      </div>
                    </div>

                    {/* Static map — key ensures remount per colonia */}
                    <MapView
                      key={viewItem.id}
                      lat={viewItem.latitude}
                      lng={viewItem.longitude}
                      name={viewItem.nome}
                    />

                    <div className="flex gap-6 px-1">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                          Latitude
                        </p>
                        <p className="font-mono text-xs font-semibold text-gray-600">
                          {viewItem.latitude}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                          Longitude
                        </p>
                        <p className="font-mono text-xs font-semibold text-gray-600">
                          {viewItem.longitude}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Animals */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <PawPrint size={13} className="text-green-600" />
                      <h3 className="text-sm font-bold text-gray-700">
                        Animais
                      </h3>
                      {!animalsLoading && animals.length > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-bold">
                          {animals.length}
                        </span>
                      )}
                    </div>

                    {animalsLoading ? (
                      <div className="flex items-center gap-2 py-5 text-gray-400 text-sm">
                        <Loader2 size={14} className="animate-spin text-orange-400" />
                        A carregar animais…
                      </div>
                    ) : animals.length === 0 ? (
                      <div className="bg-gray-50 rounded-2xl py-8 text-center">
                        <PawPrint className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm font-medium">
                          Nenhum animal registado
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {animals.map((animal) => (
                          <div
                            key={animal.id}
                            className="flex items-center justify-between bg-gray-50 hover:bg-orange-50/40 transition-colors rounded-xl px-4 py-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center shrink-0">
                                <PawPrint size={11} className="text-orange-500" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 leading-tight">
                                  {animal.nome}
                                </p>
                                {animal.especie && (
                                  <p className="text-xs text-gray-400">
                                    {animal.especie}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {animal.sexo && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                  {animal.sexo}
                                </span>
                              )}
                              {animal.esterilizado !== undefined &&
                                (animal.esterilizado ? (
                                  <CheckCircle2
                                    size={15}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <XCircle size={15} className="text-gray-300" />
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex gap-3 bg-white">
                  <Button
                    onClick={() => {
                      setViewItem(null);
                      setEditItem({ ...viewItem });
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold h-10 shadow-sm shadow-orange-100"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewItem(null);
                      setDeleteItem(viewItem);
                    }}
                    className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 h-10 px-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setViewItem(null)}
                    className="rounded-xl h-10 px-4"
                  >
                    Fechar
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════════════
            EDIT MODAL
        ════════════════════════════════════════════ */}
        <Dialog
          open={!!editItem}
          onOpenChange={(open) => {
            if (!open) setEditItem(null);
          }}
        >
          <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-0 shadow-2xl gap-0">
            {/* Orange gradient header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-7 pt-6 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Pencil size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Editar Colónia
                  </h2>
                  {editItem && (
                    <p className="text-xs text-orange-100 mt-0.5">
                      #{(editItem as Colonia).id} · {editItem.nome}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {editItem && (
              <div className="px-7 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <ColoniaFormFields
                  data={editItem}
                  onChange={(d) => setEditItem(d)}
                  mapKey={`edit-${(editItem as Colonia).id}`}
                />
                <Button
                  onClick={handleSave}
                  disabled={savingEdit}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 font-semibold shadow-md shadow-orange-100"
                >
                  {savingEdit ? (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Guardar Alterações
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════════════
            CREATE MODAL
        ════════════════════════════════════════════ */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-0 shadow-2xl gap-0">
            {/* Orange gradient header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-7 pt-6 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Plus size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Nova Colónia
                  </h2>
                  <p className="text-xs text-orange-100 mt-0.5">
                    Preencha os dados e selecione a localização no mapa
                  </p>
                </div>
              </div>
            </div>

            <div className="px-7 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <ColoniaFormFields
                data={newForm}
                onChange={setNewForm}
                mapKey="create-new"
              />
              <Button
                onClick={handleCreate}
                disabled={creatingNew}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 font-semibold shadow-md shadow-orange-100"
              >
                {creatingNew ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Criar Colónia
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════════════
            DELETE CONFIRMATION MODAL
        ════════════════════════════════════════════ */}
        <Dialog
          open={!!deleteItem}
          onOpenChange={(open) => {
            if (!open) setDeleteItem(null);
          }}
        >
          <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-0 shadow-2xl gap-0">
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-gray-900">
                  Eliminar Colónia
                </h2>
                {deleteItem && (
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Tem a certeza que quer eliminar{" "}
                    <span className="font-bold text-gray-800">
                      "{deleteItem.nome}"
                    </span>
                    ?{" "}
                    <span className="text-red-400">
                      Esta ação não pode ser revertida.
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex gap-3 bg-gray-50/50">
              <Button
                variant="outline"
                onClick={() => setDeleteItem(null)}
                className="flex-1 rounded-xl h-10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deletingItem}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold h-10 shadow-sm shadow-red-100"
              >
                {deletingItem ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}