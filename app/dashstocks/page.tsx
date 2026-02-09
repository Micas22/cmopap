"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Pencil, Trash2, Plus, ChevronDown, Check, Filter, X, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

type StockHistory = {
  id: number;
  stockId: number;
  nome: string;
  quantidade: number;
  datas: string;
  utilizador: number;
};

type Stock = {
  id: number;
  nome: string;
  quantidade: number;
  datas: string; // ISO string from API
  utilizador: number;
  StockHistory?: StockHistory[];
};

type User = {
  id: number;
  username: string;
};

export default function StocksDashboard() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [editItem, setEditItem] = useState<Stock | null>(null);
  const [viewItem, setViewItem] = useState<Stock | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Stock; direction: "asc" | "desc" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newQuantidade, setNewQuantidade] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    quantityMin: "",
    quantityMax: "",
    user: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sort, setSort] = useState({ field: "id", direction: "asc" as "asc" | "desc" });

  const handleExportPdf = () => {
    const params = new URLSearchParams();
    params.set("format", "pdf");

    if (selectedStocks.length > 0) {
      params.set("ids", selectedStocks.join(","));
    }

    const filterObj: any = {};
    if (filters.name.trim()) filterObj.name = filters.name.trim();
    if (filters.quantityMin.trim()) filterObj.quantityMin = Number(filters.quantityMin);
    if (filters.quantityMax.trim()) filterObj.quantityMax = Number(filters.quantityMax);
    if (filters.user.trim()) filterObj.user = filters.user.trim();
    if (filters.dateFrom.trim()) filterObj.dateFrom = filters.dateFrom.trim();
    if (filters.dateTo.trim()) filterObj.dateTo = filters.dateTo.trim();

    if (Object.keys(filterObj).length > 0) {
      params.set("filters", JSON.stringify(filterObj));
    }

    params.set("sort", `${sort.field}:${sort.direction}`);

    window.open(`/api/admin/stocks?${params.toString()}`, "_blank");
    setExportDialogOpen(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      const safeUsers: User[] = Array.isArray(data)
        ? data.map((u: any) => ({ id: u.id, username: u.username }))
        : [];
      setUsers(safeUsers);
      const map: Record<number, string> = {};
      safeUsers.forEach((u) => {
        map[u.id] = u.username;
      });
      setUserMap(map);

      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
        const found = safeUsers.find((u) => u.username === storedUsername);
        if (found) {
          setCurrentUserId(found.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await fetch("/api/admin/stocks");
      const data = await res.json();
      setStocks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStocks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handleSort = (key: keyof Stock) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filterAndSearchData = (data: Stock[]) => {
    let filtered = [...data];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          s.nome.toLowerCase().includes(query) ||
          s.quantidade.toString().includes(query) ||
          (userMap[s.utilizador]?.toLowerCase().includes(query) ?? false)
      );
    }

    return filtered;
  };

  const sortData = (data: Stock[]) => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (valA < (valB as any)) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > (valB as any)) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleCreateStock = async () => {
    if (!newNome.trim() || !newQuantidade.trim()) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    if (currentUserId == null) {
      alert("Não foi possível identificar o utilizador atual");
      return;
    }

    try {
      const res = await fetch("/api/admin/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: newNome.trim(),
          quantidade: Number(newQuantidade),
          utilizador: currentUserId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Falha ao criar stock: ${error.error}`);
        return;
      }

      const created = await res.json();
      setStocks((prev) => [...prev, created]);
      setNewNome("");
      setNewQuantidade("");
      setCreateDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar stock");
    }
  };

  const handleSave = async () => {
    if (!editItem) return;
    if (currentUserId == null) {
      alert("Não foi possível identificar o utilizador atual");
      return;
    }

    try {
      const res = await fetch("/api/admin/stocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editItem.id,
          nome: editItem.nome,
          quantidade: editItem.quantidade,
          utilizador: currentUserId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Falha ao atualizar stock: ${error.error}`);
        return;
      }

      const updated = await res.json();
      setStocks((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditItem(null);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao guardar.");
    }
  };

  const handleDelete = async (stock: Stock, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem a certeza que deseja apagar este stock?")) return;

    try {
      const res = await fetch("/api/admin/stocks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: stock.id }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Falha ao apagar stock: ${error.error}`);
        return;
      }

      setStocks((prev) => prev.filter((s) => s.id !== stock.id));
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar stock");
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const enrichedData = sortData(filterAndSearchData(stocks));

  return (
    <>
      <header className="w-full shadow-xl z-50 relative font-sans">
        <motion.div
          className="bg-gradient-to-r from-orange-600 to-amber-500 shadow-lg relative z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full px-6 py-4 flex items-center justify-between">
            <motion.div
              className="flex-shrink-0 bg-white/10 p-2 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src="/croa.png" alt="CROA Olhão" className="w-auto h-[60px] md:h-[80px] object-contain drop-shadow-md" />
            </motion.div>

            <div className="flex items-center gap-6">
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

                <div className="relative ml-2">
                  <motion.button
                    onClick={() => setShowPopup(!showPopup)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-1.5 rounded-full transition-all duration-300 ${showPopup ? "bg-white text-orange-500 shadow-lg" : "bg-white/20 text-white hover:bg-white/30"}`}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20">
                      <img src="/user.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                  </motion.button>

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
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Package className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Stocks</CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95">
                          <Plus className="mr-2 h-4 w-4" /> Novo Stock
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl space-y-4 p-6">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-gray-800">Criar novo stock</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 pt-2">
                          <Input
                            placeholder="Nome"
                            value={newNome}
                            onChange={(e) => setNewNome(e.target.value)}
                            className="rounded-xl border-gray-200 focus:ring-orange-500"
                          />
                          <Input
                            type="number"
                            placeholder="Quantidade"
                            value={newQuantidade}
                            onChange={(e) => setNewQuantidade(e.target.value)}
                            className="rounded-xl border-gray-200 focus:ring-orange-500"
                          />
                          <p className="text-xs text-gray-500">
                            A data da edição e o utilizador serão preenchidos automaticamente.
                          </p>
                          <Button
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md"
                            onClick={handleCreateStock}
                          >
                            Criar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          Exportar PDF
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-gray-800">Opções de Exportação PDF</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          {/* Stock Selection */}
                          <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Selecionar Stocks</label>
                            <div className="flex gap-2 mb-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStocks(stocks.map(s => s.id))}
                                className="text-xs"
                              >
                                Selecionar Todos
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStocks([])}
                                className="text-xs"
                              >
                                Desmarcar Todos
                              </Button>
                            </div>
                            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                              {stocks.map((stock) => (
                                <label key={stock.id} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedStocks.includes(stock.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedStocks(prev => [...prev, stock.id]);
                                      } else {
                                        setSelectedStocks(prev => prev.filter(id => id !== stock.id));
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  {stock.nome} (#{stock.id})
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Filters */}
                          <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Filtros</label>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="Nome contém..."
                                value={filters.name}
                                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                className="rounded-xl"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  placeholder="Qtd Min"
                                  value={filters.quantityMin}
                                  onChange={(e) => setFilters(prev => ({ ...prev, quantityMin: e.target.value }))}
                                  className="rounded-xl"
                                />
                                <Input
                                  type="number"
                                  placeholder="Qtd Max"
                                  value={filters.quantityMax}
                                  onChange={(e) => setFilters(prev => ({ ...prev, quantityMax: e.target.value }))}
                                  className="rounded-xl"
                                />
                              </div>
                              <Input
                                placeholder="Utilizador contém..."
                                value={filters.user}
                                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                                className="rounded-xl"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  value={filters.dateFrom}
                                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                  className="rounded-xl"
                                />
                                <Input
                                  type="date"
                                  value={filters.dateTo}
                                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                  className="rounded-xl"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Sort */}
                          <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Ordenação</label>
                            <div className="flex gap-3">
                              <select
                                value={sort.field}
                                onChange={(e) => setSort(prev => ({ ...prev, field: e.target.value }))}
                                className="rounded-xl border-gray-200 px-3 py-2"
                              >
                                <option value="id">ID</option>
                                <option value="nome">Nome</option>
                                <option value="quantidade">Quantidade</option>
                                <option value="datas">Data</option>
                                <option value="utilizador">Utilizador</option>
                              </select>
                              <select
                                value={sort.direction}
                                onChange={(e) => setSort(prev => ({ ...prev, direction: e.target.value as "asc" | "desc" }))}
                                className="rounded-xl border-gray-200 px-3 py-2"
                              >
                                <option value="asc">Ascendente</option>
                                <option value="desc">Descendente</option>
                              </select>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md"
                            onClick={handleExportPdf}
                          >
                            Gerar PDF
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Pesquisar por nome, quantidade ou utilizador..."
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

                  <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-500">{stocks.length} registos</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-gray-100">
                      <TableHead
                        className="pl-8 h-12 font-semibold text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center gap-1">
                          ID
                          {sortConfig?.key === "id" && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("nome")}
                      >
                        <div className="flex items-center gap-1">
                          Nome
                          {sortConfig?.key === "nome" && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("quantidade")}
                      >
                        <div className="flex items-center gap-1">
                          Quantidade
                          {sortConfig?.key === "quantidade" && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("datas")}
                      >
                        <div className="flex items-center gap-1">
                          Última edição
                          {sortConfig?.key === "datas" && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("utilizador")}
                      >
                        <div className="flex items-center gap-1">
                          Utilizador
                          {sortConfig?.key === "utilizador" && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right pr-8 font-semibold text-gray-500">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedData.map((s) => (
                      <TableRow
                        key={s.id}
                        className="group hover:bg-orange-50/30 transition-colors border-gray-50 cursor-pointer"
                        onClick={() => setViewItem(s)}
                      >
                        <TableCell className="pl-8 font-medium text-gray-600">#{s.id}</TableCell>
                        <TableCell className="font-medium text-gray-900">{s.nome}</TableCell>
                        <TableCell className="text-gray-700">{s.quantidade}</TableCell>
                        <TableCell className="text-gray-500">{formatDate(s.datas)}</TableCell>
                        <TableCell className="text-gray-700">
                          {userMap[s.utilizador] ?? `ID ${s.utilizador}`}
                        </TableCell>
                        <TableCell
                          className="text-right pr-8 space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => setEditItem(s)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={(e) => handleDelete(s, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {enrichedData.length === 0 && (
                  <div className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">Nenhum stock encontrado</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery
                        ? "Tente ajustar a pesquisa"
                        : "Adicione um novo stock para começar"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* VIEW MODAL */}
        <Dialog open={!!viewItem} onOpenChange={(open) => { if (!open) setViewItem(null); }}>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-orange-500 text-2xl">Detalhes do Stock</DialogTitle>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantidade</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.quantidade}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Última edição</label>
                    <div className="text-lg font-medium text-gray-900">{formatDate(viewItem.datas)}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilizador</label>
                    <div className="text-lg font-medium text-gray-900">
                      {userMap[viewItem.utilizador] ?? `ID ${viewItem.utilizador}`}
                    </div>
                  </div>
                </div>

                {viewItem.StockHistory && viewItem.StockHistory.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Histórico das últimas edições (máx. 10)
                    </label>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Data</TableHead>
                            <TableHead className="text-xs">Utilizador</TableHead>
                                                     <TableHead className="text-xs">Quantidade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewItem.StockHistory.map((h) => (
                            <TableRow key={h.id}>
                              <TableCell className="text-xs text-gray-700">
                                {formatDate(h.datas)}
                              </TableCell>
                              <TableCell className="text-xs text-gray-700">
                                {userMap[h.utilizador] ?? `ID ${h.utilizador}`}
                              </TableCell>
                              <TableCell className="text-xs text-gray-700">
                                {h.quantidade}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      setViewItem(null);
                      setEditItem(viewItem);
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
        <Dialog
          open={!!editItem}
          onOpenChange={(open) => {
            if (!open) setEditItem(null);
          }}
        >
          <DialogContent className="rounded-2xl max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-orange-500 text-2xl font-bold">Editar Stock</DialogTitle>
              </DialogHeader>

              {editItem && (
                <div className="space-y-5 py-4">
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
                      value={editItem.nome}
                      onChange={(e) => setEditItem({ ...editItem, nome: e.target.value })}
                      placeholder="Nome do stock"
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
                      <span>Quantidade</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={editItem.quantidade}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          quantidade: e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                      placeholder="Quantidade"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
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

