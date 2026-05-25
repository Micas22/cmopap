"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Pencil, Trash2, Plus, ChevronDown, Check, X, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function AdminDashboard() {
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [colonias, setColonias] = useState<{ id: number; nome: string; responsavel: string; contacto: string; num_animais: number; longitude: number; latitude: number }[]>([]);

  const fetchColonias = async () => {
    try {
      const res = await fetch("/api/admin/colonias");
      const data = await res.json();
      setColonias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch colonias:", error);
    }
  };

  useEffect(() => {
    fetchColonias();
  }, []);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filterAndSearchData = (data: typeof colonias) => {
    let filtered = [...data];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((colonia) =>
        colonia.nome.toLowerCase().includes(query) ||
        colonia.responsavel.toLowerCase().includes(query) ||
        colonia.contacto.toLowerCase().includes(query)
      );
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
      const res = await fetch("/api/admin/colonias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to update colonia: ${error.error}`);
        return;
      }

      const updatedColonia = await res.json();

      setColonias((prev) =>
        prev.map((c) => (c.id === updatedColonia.id ? updatedColonia : c))
      );

      setEditItem(null);
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while saving.");
    }
  };

  const [createColoniaDialogOpen, setCreateColoniaDialogOpen] = useState(false);
  const [newColoniaNome, setNewColoniaNome] = useState("");
  const [newColoniaResponsavel, setNewColoniaResponsavel] = useState("");
  const [newColoniaContacto, setNewColoniaContacto] = useState("");
  const [newColoniaNumAnimais, setNewColoniaNumAnimais] = useState("");
  const [newColoniaLongitude, setNewColoniaLongitude] = useState("");
  const [newColoniaLatitude, setNewColoniaLatitude] = useState("");

  const handleCreateColonia = async () => {
    if (!newColoniaNome || !newColoniaResponsavel || !newColoniaContacto || !newColoniaNumAnimais || !newColoniaLongitude || !newColoniaLatitude) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const res = await fetch("/api/admin/colonias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: newColoniaNome,
          responsavel: newColoniaResponsavel,
          contacto: newColoniaContacto,
          num_animais: Number(newColoniaNumAnimais),
          longitude: Number(newColoniaLongitude),
          latitude: Number(newColoniaLatitude),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to create colonia: ${error.error}`);
        return;
      }

      const newColonia = await res.json();
      setColonias((prev) => [...prev, newColonia]);
      setNewColoniaNome("");
      setNewColoniaResponsavel("");
      setNewColoniaContacto("");
      setNewColoniaNumAnimais("");
      setNewColoniaLongitude("");
      setNewColoniaLatitude("");
      setCreateColoniaDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error creating colonia");
    }
  };

  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("email");
    router.push("/login");
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50">
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
                      <MapPin className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Colónias</CardTitle>
                  </div>
                  <Dialog open={createColoniaDialogOpen} onOpenChange={setCreateColoniaDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95">
                        <Plus className="mr-2 h-4 w-4" /> Nova Colónia
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl space-y-4 p-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800">Criar nova colónia</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-2">
                        <Input
                          placeholder="Nome"
                          value={newColoniaNome}
                          onChange={(e) => setNewColoniaNome(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                        <Input
                          placeholder="Responsável"
                          value={newColoniaResponsavel}
                          onChange={(e) => setNewColoniaResponsavel(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                        <Input
                          placeholder="Contacto"
                          value={newColoniaContacto}
                          onChange={(e) => setNewColoniaContacto(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                        <Input
                          type="number"
                          placeholder="Número de Animais"
                          value={newColoniaNumAnimais}
                          onChange={(e) => setNewColoniaNumAnimais(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                        <Input
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          value={newColoniaLongitude}
                          onChange={(e) => setNewColoniaLongitude(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                        <Input
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          value={newColoniaLatitude}
                          onChange={(e) => setNewColoniaLatitude(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                        <Button
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md"
                          onClick={handleCreateColonia}
                        >
                          Criar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Pesquisar por nome, responsável ou contacto..."
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
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("nome")}>
                        <div className="flex items-center gap-1">
                          Nome
                          {sortConfig?.key === "nome" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("responsavel")}>
                        <div className="flex items-center gap-1">
                          Responsável
                          {sortConfig?.key === "responsavel" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("contacto")}>
                        <div className="flex items-center gap-1">
                          Contacto
                          {sortConfig?.key === "contacto" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("num_animais")}>
                        <div className="flex items-center gap-1">
                          N.º Animais
                          {sortConfig?.key === "num_animais" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                        </div>
                      </TableHead>
                      <TableHead className="text-right pr-8 font-semibold text-gray-500">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortData(filterAndSearchData(colonias)).map((c) => (
                      <TableRow
                        key={c.id}
                        className="group hover:bg-orange-50/30 transition-colors border-gray-50 cursor-pointer"
                        onClick={() => setViewItem({ ...c })}
                      >
                        <TableCell className="pl-8 font-medium text-gray-600">#{c.id}</TableCell>
                        <TableCell className="font-medium text-gray-900">{c.nome}</TableCell>
                        <TableCell className="text-gray-500">{c.responsavel}</TableCell>
                        <TableCell className="text-gray-500">{c.contacto}</TableCell>
                        <TableCell className="text-gray-500">{c.num_animais}</TableCell>
                        <TableCell className="text-right pr-8 space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditItem({ ...c })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!confirm("Are you sure you want to delete this colonia?")) return;

                              try {
                                const res = await fetch("/api/admin/colonias", {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: c.id }),
                                });

                                if (!res.ok) {
                                  const error = await res.json();
                                  alert(`Failed to delete colonia: ${error.error}`);
                                  return;
                                }

                                setColonias((prev) => prev.filter((colonia) => colonia.id !== c.id));
                              } catch (err) {
                                console.error(err);
                                alert("Error deleting colonia");
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
                {sortData(filterAndSearchData(colonias)).length === 0 && (
                  <div className="py-12 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">Nenhuma colónia encontrada</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery ? "Tente ajustar os filtros de pesquisa" : "Adicione uma nova colónia para começar"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <Dialog open={!!viewItem} onOpenChange={(open) => { if (!open) setViewItem(null); }}>
          <DialogContent className="rounded-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-orange-500 text-2xl">Detalhes da Colónia</DialogTitle>
            </DialogHeader>
            {viewItem && (
              <div className="space-y-6 py-4">
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsável</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.responsavel}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.contacto}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Número de Animais</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.num_animais}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Longitude</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.longitude}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Latitude</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.latitude}</div>
                  </div>
                </div>

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

        <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
          <DialogContent className="rounded-2xl max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-orange-500 text-2xl font-bold">Editar Colónia</DialogTitle>
              </DialogHeader>

              {editItem && (
                <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
                      placeholder="Digite o nome da colónia"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>Responsável</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      value={editItem.responsavel || ""}
                      onChange={(e) => setEditItem({ ...editItem, responsavel: e.target.value })}
                      placeholder="Digite o nome do responsável"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>Contacto</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      value={editItem.contacto || ""}
                      onChange={(e) => setEditItem({ ...editItem, contacto: e.target.value })}
                      placeholder="Digite o contacto"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.21 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>Número de Animais</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={editItem.num_animais || ""}
                      onChange={(e) => setEditItem({ ...editItem, num_animais: Number(e.target.value) })}
                      placeholder="Digite o número de animais"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.22 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>Longitude</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={editItem.longitude || ""}
                      onChange={(e) => setEditItem({ ...editItem, longitude: Number(e.target.value) })}
                      placeholder="Digite a longitude"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.23 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>Latitude</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={editItem.latitude || ""}
                      onChange={(e) => setEditItem({ ...editItem, latitude: Number(e.target.value) })}
                      placeholder="Digite a latitude"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </motion.div>

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
