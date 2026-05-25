"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Pencil, Trash2, Plus, ChevronDown, Check, Filter, X, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";



export default function UsersDashboard() {
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [permsFilter, setPermsFilter] = useState<number | null>(null);
  const [users, setUsers] = useState<{ id: number; email: string; password: string; perms: number }[]>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPerms, setNewPerms] = useState(0);
  const [createPermsOpen, setCreatePermsOpen] = useState(false);
  const [editPermsOpen, setEditPermsOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filterAndSearchData = (data: typeof users) => {
    let filtered = [...data];


    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(query)
      );
    }


    if (permsFilter !== null) {
      filtered = filtered.filter((user) => user.perms === permsFilter);
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
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to update user: ${error.error}`);
        return;
      }

      const updatedUser = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );

      setEditItem(null);
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while saving.");
    }
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return alert("Fill all fields");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword, perms: newPerms }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to create user: ${error.error}`);
        return;
      }

      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);
      setNewEmail("");
      setNewPassword("");
      setNewPerms(0);
      setCreatePermsOpen(false);
      setCreateDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error creating user");
    }
  };

  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

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
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Utilizadores</CardTitle>
                  </div>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95">
                        <Plus className="mr-2 h-4 w-4" /> Novo Utilizador
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl space-y-4 p-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800">Criar novo utilizador</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-2">
                        <Input
                          placeholder="Email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                        <Input
                          placeholder="Password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500"
                        />
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setCreatePermsOpen(!createPermsOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all h-10"
                          >
                            <span className="text-gray-900">
                              {newPerms === 1 ? "Admin" : "Utilizador"}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${createPermsOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {createPermsOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                              >
                                {[
                                  { label: "Utilizador", value: 0 },
                                  { label: "Admin", value: 1 }
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setNewPerms(option.value);
                                      setCreatePermsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                  >
                                    {option.label}
                                    {newPerms === option.value && <Check className="w-4 h-4 text-orange-500" />}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md"
                          onClick={handleCreateUser}
                        >
                          Criar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Pesquisar por email..."
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

                  {/* Perms Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={18} />
                    <div className="flex gap-2">
                      <Button
                        variant={permsFilter === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPermsFilter(null)}
                        className={`rounded-xl ${permsFilter === null ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                      >
                        Todos
                      </Button>
                      <Button
                        variant={permsFilter === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPermsFilter(0)}
                        className={`rounded-xl ${permsFilter === 0 ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                      >
                        Utilizador
                      </Button>
                      <Button
                        variant={permsFilter === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPermsFilter(1)}
                        className={`rounded-xl ${permsFilter === 1 ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                      >
                        Admin
                      </Button>
                    </div>
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
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("email")}>
                        <div className="flex items-center gap-1">
                          Email
                          {sortConfig?.key === "email" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("password")}>
                        <div className="flex items-center gap-1">
                          Password
                          {sortConfig?.key === "password" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("perms")}>
                        <div className="flex items-center gap-1">
                          Permissões
                          {sortConfig?.key === "perms" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                        </div>
                      </TableHead>
                      <TableHead className="text-right pr-8 font-semibold text-gray-500">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortData(filterAndSearchData(users)).map((u) => (
                      <TableRow
                        key={u.id}
                        className="group hover:bg-orange-50/30 transition-colors border-gray-50 cursor-pointer"
                        onClick={() => setViewItem({ ...u })}
                      >
                        <TableCell className="pl-8 font-medium text-gray-600">#{u.id}</TableCell>
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                               {u.email.charAt(0).toUpperCase()}
                             </div>
                             {u.email.split("@")[0]}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400 font-mono text-xs">••••••••</TableCell>
                        <TableCell className="font-medium text-gray-900">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.perms === 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                            {u.perms === 1 ? "Admin" : "Utilizador"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-8 space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditItem({ ...u })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!confirm("Are you sure you want to delete this user?")) return;

                              try {
                                const res = await fetch("/api/admin/users", {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: u.id }),
                                });

                                if (!res.ok) {
                                  const error = await res.json();
                                  alert(`Failed to delete user: ${error.error}`);
                                  return;
                                }

                                setUsers((prev) => prev.filter((user) => user.id !== u.id));
                              } catch (err) {
                                console.error(err);
                                alert("Error deleting user");
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
                {sortData(filterAndSearchData(users)).length === 0 && (
                  <div className="py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">Nenhum utilizador encontrado</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery || permsFilter !== null
                        ? "Tente ajustar os filtros de pesquisa"
                        : "Adicione um novo utilizador para começar"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* VIEW MODAL */}
        <Dialog open={!!viewItem} onOpenChange={(open) => { if (!open) setViewItem(null); }}>
          <DialogContent className="rounded-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-orange-500 text-2xl">Detalhes do Utilizador</DialogTitle>
            </DialogHeader>
            {viewItem && (
              <div className="space-y-6 py-4">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {viewItem.email.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</label>
                    <div className="text-lg font-medium text-gray-900">#{viewItem.id}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                    <div className="text-lg font-medium text-gray-900">{viewItem.email.split("@")[0]}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                    <div className="text-lg font-mono text-gray-400">••••••••</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissões</label>
                    <div className="text-lg font-medium">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${viewItem.perms === 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                        {viewItem.perms === 1 ? "Admin" : "Utilizador"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
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

        {/* EDIT MODAL */}
        <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); setEditPermsOpen(false); }}>
          <DialogContent className="rounded-2xl max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-orange-500 text-2xl font-bold">Editar Utilizador</DialogTitle>
              </DialogHeader>

              {editItem && (
                <div className="space-y-5 py-4">
                  {/* Username Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>Email</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      value={editItem.email || ""}
                      onChange={(e) => setEditItem({ ...editItem, email: e.target.value })}
                      placeholder="Digite o email"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>Password</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      type="password"
                      value={editItem.password || ""}
                      onChange={(e) => setEditItem({ ...editItem, password: e.target.value })}
                      placeholder="Digite a nova password"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-mono"
                    />
                  </motion.div>

                  {/* Perms Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>Permissões</span>
                      <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <motion.button
                        type="button"
                        onClick={() => setEditPermsOpen(!editPermsOpen)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-orange-500 transition-all hover:border-orange-300"
                      >
                        <span className="text-gray-900 font-medium">
                          {editItem.perms === 1 ? "Admin" : editItem.perms === 0 ? "Utilizador" : "Selecione as permissões"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${editPermsOpen ? "rotate-180" : ""}`} />
                      </motion.button>
                      <AnimatePresence>
                        {editPermsOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl overflow-hidden"
                          >
                            {[
                              { label: "Utilizador", value: 0 },
                              { label: "Admin", value: 1 }
                            ].map((option, index) => (
                              <motion.button
                                key={option.value}
                                type="button"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                  setEditItem({ ...editItem, perms: option.value });
                                  setEditPermsOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                              >
                                {option.label}
                                {editItem.perms === option.value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  >
                                    <Check className="w-4 h-4 text-orange-500" />
                                  </motion.div>
                                )}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Save Button */}
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
