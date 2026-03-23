"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Pencil, Trash2, Plus, ChevronDown, Check, X, ArrowLeft, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Type for Aconselhamento based on schema.prisma
type Aconselhamento = {
  id: number;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  nome: string;
  animal: number | null;
  motivo: string;
  administracao: string;
  feedback: string;
  local: string;
};

// Static mock data
const initialData: Aconselhamento[] = [
  {
    id: 1,
    data: "2024-10-01",
    hora: "10:30",
    nome: "João Silva",
    animal: 123,
    motivo: "Consulta de rotina pós-adoção",
    administracao: "Desparasitação aplicada",
    feedback: "Animal reagiu bem ao tratamento",
    local: "Consultório Principal"
  },
  {
    id: 2,
    data: "2024-10-02",
    hora: "14:15",
    nome: "Maria Santos",
    animal: 456,
    motivo: "Problemas de pele persistentes",
    administracao: "Creme dermatológico tópico",
    feedback: "Melhoria visível esperada em 7 dias",
    local: "Sala de Dermatologia"
  },
  {
    id: 3,
    data: "2024-10-03",
    hora: "09:00",
    nome: "Pedro Oliveira",
    animal: null,
    motivo: "Aconselhamento pré-adoção",
    administracao: "-",
    feedback: "Cliente bem informado sobre cuidados",
    local: "Sala de Aconselhamento"
  },
  {
    id: 4,
    data: "2024-10-04",
    hora: "16:45",
    nome: "Ana Costa",
    animal: 789,
    motivo: "Controlo de peso",
    administracao: "Plano dietético iniciado",
    feedback: "Cliente motivada para follow-up",
    local: "Consultório de Nutrição"
  },
  {
    id: 5,
    data: "2024-10-05",
    hora: "11:20",
    nome: "Carlos Mendes",
    animal: 234,
    motivo: "Comportamento agressivo",
    administracao: "Sessão de treino comportamental",
    feedback: "Progresso inicial positivo",
    local: "Área de Treino"
  },
  {
    id: 6,
    data: "2024-10-06",
    hora: "13:30",
    nome: "Sofia Pereira",
    animal: 567,
    motivo: "Vacinação anual",
    administracao: "Vacina antirrábica + polivalente",
    feedback: "Sem reações adversas",
    local: "Sala de Vacinação"
  },
  {
    id: 7,
    data: "2024-10-07",
    hora: "15:00",
    nome: "Ricardo Almeida",
    animal: 890,
    motivo: "Cirurgia de esterilização",
    administracao: "Castração realizada com sucesso",
    feedback: "Recuperação em vigilância",
    local: "Bloco Operatório"
  },
  {
    id: 8,
    data: "2024-10-08",
    hora: "12:10",
    nome: "Laura Fernandes",
    animal: null,
    motivo: "Aconselhamento de emergência",
    administracao: "Primeiros socorros aplicados",
    feedback: "Estabilizado, recomenda-se acompanhamento",
    local: "Sala de Emergências"
  }
];

export default function AconselhamentosPage() {
  const [data, setData] = useState<Aconselhamento[]>(initialData);
  const [editItem, setEditItem] = useState<Aconselhamento | null>(null);
(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Aconselhamento; direction: "asc" | "desc" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
const [showPopup, setShowPopup] = useState(false);
  const [viewItem, setViewItem] = useState<Aconselhamento | null>(null);
  const [username, setUsername] = useState("Admin");
  const router = useRouter();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    data: "",
    hora: "",
    nome: "",
    animal: "",
    motivo: "",
    administracao: "",
    feedback: "",
    local: ""
  });

  const handleSort = (key: keyof Aconselhamento) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filterAndSearchData = (items: Aconselhamento[]) => {
    let filtered = [...items];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.nome.toLowerCase().includes(query) ||
        item.motivo.toLowerCase().includes(query) ||
        item.local.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const sortData = (items: Aconselhamento[]) => {
    if (!sortConfig) return items;
    return [...items].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      // Handle null/undefined
      if (valA == null) return 1;
      if (valB == null) return -1;
      // Handle numbers
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      }
      // Handle strings
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
      if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleCreate = () => {
    const newId = Math.max(...data.map(d => d.id), 0) + 1;
    const newItem: Aconselhamento = {
      id: newId,
      data: formData.data,
      hora: formData.hora,
      nome: formData.nome,
      animal: formData.animal ? parseInt(formData.animal) : null,
      motivo: formData.motivo,
      administracao: formData.administracao,
      feedback: formData.feedback,
      local: formData.local
    };
    setData([newItem, ...data]);
    setFormData({ data: "", hora: "", nome: "", animal: "", motivo: "", administracao: "", feedback: "", local: "" });
    setCreateDialogOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    setData(data.map(item => item.id === editItem.id ? { ...editItem, ...formData, animal: formData.animal ? parseInt(formData.animal) : null } : item));
    setEditItem(null);
    setFormData({ data: "", hora: "", nome: "", animal: "", motivo: "", administracao: "", feedback: "", local: "" });
  };

  const handleDelete = (id: number) => {
    setData(data.filter(item => item.id !== id));
  };

  const handleEdit = (item: Aconselhamento) => {
    setEditItem(item);
    setFormData({
      data: item.data,
      hora: item.hora,
      nome: item.nome,
      animal: item.animal?.toString() || "",
      motivo: item.motivo,
      administracao: item.administracao,
      feedback: item.feedback,
      local: item.local
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const enrichedData = sortData(filterAndSearchData(data));

  const handleLogout = () => {
    // Static - just navigate
    router.push('/login');
  };

  const resetForm = () => {
    setFormData({ data: "", hora: "", nome: "", animal: "", motivo: "", administracao: "", feedback: "", local: "" });
  };

  return (
    <>
      {/* Header - matches other dash pages */}
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
              <motion.div className="relative group hidden md:block" whileHover={{ scale: 1.02 }}>
                <motion.input
                  type="text"
                  placeholder="Pesquisar..."
                  className="bg-white/20 border border-white/30 rounded-full pl-4 pr-10 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:bg-white focus:text-gray-800 focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm"
                  initial={{ width: "180px" }}
                  whileFocus={{ width: "240px" }}
                  transition={{ duration: 0.3 }}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 group-hover:text-white group-focus-within:text-orange-500 transition-colors" size={16} />
              </motion.div>

              <motion.nav className="flex space-x-6 text-white text-lg font-medium items-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                {[{ name: "Inicio", href: "/" }, { name: "Quem somos?", href: "/aboutus" }, { name: "Dashboard", href: "/dashboard" }].map((link) => (
                  <Link key={link.name} href={link.href} className="relative group px-2 py-1">
                    <span className="relative z-10">{link.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                    <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0" />
                  </Link>
                ))}
                <div className="relative ml-2">
                  <motion.button onClick={() => setShowPopup(!showPopup)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className={`p-1.5 rounded-full transition-all duration-300 ${showPopup ? 'bg-white text-orange-500 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20">
                      <img src="/user.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                  </motion.button>
                  <AnimatePresence>
                    {showPopup && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl p-5 z-50 border border-gray-100 origin-top-right">
                        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">{username.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Logged in as</p>
                            <p className="text-gray-800 font-semibold truncate max-w-[140px]">{username}</p>
                          </div>
                        </div>
                        <button onClick={handleLogout} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">Sair</button>
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
                    <Button asChild variant="ghost" size="icon" className="rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      <Link href="/dashdocumentos"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                    <CardTitle className="text-xl font-bold text-gray-800">Aconselhamentos</CardTitle>
                  </div>
                  <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95">
                        <Plus className="mr-2 h-4 w-4" /> Novo Aconselhamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl space-y-4 p-6 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800">{editItem ? 'Editar' : 'Criar novo'} Aconselhamento</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input placeholder="Data (YYYY-MM-DD)" type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="rounded-xl border-gray-200 focus:ring-orange-500" />
                          <Input placeholder="Hora (HH:MM)" type="time" value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} className="rounded-xl border-gray-200 focus:ring-orange-500" />
                          <Input placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="rounded-xl border-gray-200 focus:ring-orange-500" />
                          <Input placeholder="ID do Animal (opcional)" type="number" value={formData.animal} onChange={(e) => setFormData({...formData, animal: e.target.value})} className="rounded-xl border-gray-200 focus:ring-orange-500" />
                        </div>
                        <Input placeholder="Motivo" value={formData.motivo} onChange={(e) => setFormData({...formData, motivo: e.target.value})} className="rounded-xl border-gray-200 focus:ring-orange-500" />
                        <Input placeholder="Administração" value={formData.administracao} onChange={(e) => setFormData({...formData, administracao: e.target.value})} className="rounded-xl border-gray-200 focus:ring-orange-500" />
                        <Input placeholder="Feedback" value={formData.feedback} onChange={(e) => setFormData({...formData, feedback: e.target.value})} className="rounded-xl border-gray-200 focus:ring-orange-500" />
                        <Input placeholder="Local" value={formData.local} onChange={(e) => setFormData({...formData, local: e.target.value})} className="rounded-xl border-gray-200 focus:ring-orange-500" />
                        <Button onClick={editItem ? handleSaveEdit : handleCreate} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md font-semibold" disabled={!formData.nome || !formData.motivo || !formData.data}>
                          {editItem ? 'Guardar Alterações' : 'Criar'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input type="text" placeholder="Pesquisar por nome, motivo ou local..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-10 rounded-xl border-gray-200 focus:ring-orange-500" />
                    {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={18} /></button>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">{enrichedData.length} de {data.length} registos</div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-gray-100">
                      <TableHead className="pl-8 h-12 font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('id')}>
                        <div className="flex items-center gap-1">ID{sortConfig?.key === 'id' && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}</div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('data')}>
                        <div className="flex items-center gap-1">Data{sortConfig?.key === 'data' && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}</div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('hora')}>
                        <div className="flex items-center gap-1">Hora{sortConfig?.key === 'hora' && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}</div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('nome')}>
                        <div className="flex items-center gap-1">Nome{sortConfig?.key === 'nome' && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}</div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('animal')}>
                        <div className="flex items-center gap-1">Animal{sortConfig?.key === 'animal' && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}</div>
                      </TableHead>
                      <TableHead className="w-[200px] font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('motivo')}>
                        <div className="flex items-center gap-1">Motivo{sortConfig?.key === 'motivo' && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}</div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('local')}>
                        <div className="flex items-center gap-1">Local{sortConfig?.key === 'local' && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}</div>
                      </TableHead>
                      <TableHead className="text-right pr-8 font-semibold text-gray-500">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedData.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-orange-50/30 transition-colors border-gray-50 cursor-pointer" onClick={() => setViewItem(item)}>
                        <TableCell className="pl-8 font-medium text-gray-600">#{item.id}</TableCell>
                        <TableCell className="text-gray-900 font-medium">{formatDate(item.data)}</TableCell>
                        <TableCell className="text-gray-900">{item.hora}</TableCell>
                        <TableCell className="text-gray-900 font-medium">{item.nome}</TableCell>
                        <TableCell className="text-gray-700">{item.animal ? `#${item.animal}` : '-'}</TableCell>
                        <TableCell title={item.motivo} className="text-gray-700 max-w-[200px] truncate">{item.motivo}</TableCell>
                        <TableCell className="text-gray-700">{item.local}</TableCell>
                        <TableCell className="text-right pr-8 space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); if (confirm('Tem a certeza que deseja eliminar este aconselhamento?')) handleDelete(item.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {enrichedData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center py-12">
                          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-500 font-medium text-lg">Nenhum aconselhamento encontrado</p>
                          <p className="text-gray-400 text-sm mt-1">{searchQuery ? 'Tente ajustar a pesquisa' : 'Adicione um novo aconselhamento para começar'}</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* View Dialog */}
        <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
          <DialogContent className="rounded-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-orange-500 text-2xl font-bold">Detalhes do Aconselhamento</DialogTitle>
            </DialogHeader>
            {viewItem && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</label><div className="text-xl font-bold text-gray-900">{formatDate(viewItem.data)} às {viewItem.hora}</div></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</label><div className="text-xl font-bold text-gray-900">{viewItem.nome}</div></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Animal</label><div className="text-xl font-bold text-gray-900">{viewItem.animal ? `#${viewItem.animal}` : 'Geral'}</div></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Local</label><div className="text-xl font-bold text-gray-900">{viewItem.local}</div></div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivo</label><div className="text-lg text-gray-800 bg-gray-50 p-4 rounded-xl border">{viewItem.motivo}</div></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administração</label><div className="text-lg text-gray-800 bg-gray-50 p-4 rounded-xl border">{viewItem.administracao}</div></div>
                  <div className="space-y-2"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Feedback</label><div className="text-lg text-gray-800 bg-gray-50 p-4 rounded-xl border">{viewItem.feedback}</div></div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button onClick={() => { setViewItem(null); if (viewItem) handleEdit(viewItem); }} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"><Pencil className="mr-2 h-4 w-4" /> Editar</Button>
                  <Button variant="outline" onClick={() => setViewItem(null)} className="flex-1 rounded-xl">Fechar</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - reused with create via state */}
        {editItem && (
          <Dialog open={!!editItem} onOpenChange={() => { setEditItem(null); resetForm(); }}>
            <DialogContent className="rounded-3xl space-y-4 p-6 max-w-2xl">
              {/* Same content as create, already handled above */}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}

