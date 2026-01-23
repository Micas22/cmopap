"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, PawPrint, Pencil, Trash2, Plus, ChevronDown, Check, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";



export default function AdminDashboard() {
  const [activeTable, setActiveTable] = useState<"users" | "animals">("users");
  const [editItem, setEditItem] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

const [users, setUsers] = useState<
  { id: number; username: string; password: string; perms: number }[]
>([]);

  const [animals, setAnimals] = useState<{ id: number; nome: string; chip: string; sex: number; image?: string }[]>([]);

const fetchUsers = async () => {
  const res = await fetch("/api/admin/users");
  const data = await res.json();
  setUsers(data);
};

const fetchAnimals = async () => {
  try {
    const res = await fetch("/api/admin/animals");
    const data = await res.json();
    setAnimals(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch animals:", error);
  }
};

useEffect(() => {
  fetchUsers();
  fetchAnimals();
}, []);

const handleSort = (key: string) => {
  let direction: "asc" | "desc" = "asc";
  if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
    direction = "desc";
  }
  setSortConfig({ key, direction });
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
    if (activeTable === "users") {
      // Call the API to update the user
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

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    } else {
      const formData = new FormData();
      Object.keys(editItem).forEach((key) => {
        if (key !== "image" && key !== "deleteImage" && editItem[key] !== null && editItem[key] !== undefined) {
          formData.append(key, String(editItem[key]));
        }
      });
      if (editImageFile) {
        formData.append("image", editImageFile);
      }
      if (editItem.deleteImage) {
        formData.append("deleteImage", "true");
      }

      const res = await fetch("/api/admin/animals", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to update animal: ${error.error}`);
        return;
      }

      const updatedAnimal = await res.json();

      setAnimals((prev) =>
        prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a))
      );
    }

    setEditItem(null);
    setEditImageFile(null);
  } catch (err) {
    console.error(err);
    alert("An unexpected error occurred while saving.");
  }
};

const handleRemoveImage = async () => {
  if (!editItem) return;

  try {
    const formData = new FormData();
    Object.keys(editItem).forEach((key) => {
      if (key !== "image" && key !== "deleteImage" && editItem[key] !== null && editItem[key] !== undefined) {
        formData.append(key, String(editItem[key]));
      }
    });
    formData.append("deleteImage", "true");

    const res = await fetch("/api/admin/animals", {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Failed to remove image: ${error.error}`);
      return;
    }

    const updatedAnimal = await res.json();

    setAnimals((prev) => prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a)));
    setEditItem(updatedAnimal);
    setEditImageFile(null);
  } catch (err) {
    console.error(err);
    alert("Error removing image");
  }
};

{/* Create User Dialog */}
const [createDialogOpen, setCreateDialogOpen] = useState(false);
const [newUsername, setNewUsername] = useState("");
const [newPassword, setNewPassword] = useState("");
const [newPerms, setNewPerms] = useState(0);

const handleCreateUser = async () => {
  if (!newUsername || !newPassword) return alert("Fill all fields");

  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername, password: newPassword }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Failed to create user: ${error.error}`);
      return;
    }

    const newUser = await res.json();
    setUsers((prev) => [...prev, newUser]);
    setNewUsername("");
    setNewPassword("");
    setNewPerms(0);
    setCreateDialogOpen(false);
  } catch (err) {
    console.error(err);
    alert("Error creating user");
  }
};

const [createAnimalDialogOpen, setCreateAnimalDialogOpen] = useState(false);
const [newAnimalNome, setNewAnimalNome] = useState("");
const [newAnimalChip, setNewAnimalChip] = useState("");
const [newAnimalSex, setNewAnimalSex] = useState(1);
const [createSexOpen, setCreateSexOpen] = useState(false);
const [editSexOpen, setEditSexOpen] = useState(false);
const [newAnimalImage, setNewAnimalImage] = useState<File | null>(null);
const [editImageFile, setEditImageFile] = useState<File | null>(null);

const handleCreateAnimal = async () => {
  if (!newAnimalNome || !newAnimalChip) return alert("Fill all fields");

  try {
    const formData = new FormData();
    formData.append("nome", newAnimalNome);
    formData.append("chip", newAnimalChip);
    formData.append("sex", newAnimalSex.toString());
    if (newAnimalImage) {
      formData.append("image", newAnimalImage);
    }

    const res = await fetch("/api/admin/animals", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Failed to create animal: ${error.error}`);
      return;
    }

    const newAnimal = await res.json();
    setAnimals((prev) => [...prev, newAnimal]);
    setNewAnimalNome("");
    setNewAnimalChip("");
    setNewAnimalSex(1);
    setNewAnimalImage(null);
    setCreateSexOpen(false);
    setCreateAnimalDialogOpen(false);
  } catch (err) {
    console.error(err);
    alert("Error creating animal");
  }
};

  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username"); // remove stored username
    router.push("/login"); // redirect to login page
  };
  
  return (
    <>
    <header className="w-full shadow-xl z-50 relative font-sans">
      {/* Main Header - Consolidated */}
      <motion.div
        className="bg-gradient-to-r from-orange-600 to-amber-500 shadow-lg relative z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 bg-white/10 p-2 rounded-xl backdrop-blur-sm"
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src="/croa.png" alt="CROA Olhão" className="w-auto h-[60px] md:h-[80px] object-contain drop-shadow-md" />
          </motion.div>

          <div className="flex items-center gap-6">
            {/* Search Bar - Integrated */}
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

            {/* Navigation */}
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

              {/* User Profile */}
              <div className="relative ml-2">
                <motion.button
                  onClick={() => setShowPopup(!showPopup)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-1.5 rounded-full transition-all duration-300 ${showPopup ? 'bg-white text-orange-500 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20">
                     <img src="/user.png" alt="User" className="w-full h-full object-cover" />
                  </div>
                </motion.button>

                {/* Popup */}
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

    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 bg-white border-r border-gray-100 p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10"
      >
        <div className="flex items-center gap-3 mb-10 px-2">
           <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
             <Users className="w-6 h-6" />
           </div>
           <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Menu</p>
          <Button
            onClick={() => { setActiveTable("users"); setSortConfig(null); }}
            className={`w-full justify-start h-12 rounded-xl text-base font-medium transition-all duration-200 ${activeTable === "users" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200" : "bg-transparent text-gray-600 hover:bg-orange-50 hover:text-orange-600"}`}
            variant="ghost"
          >
            <Users className="mr-3 h-5 w-5" /> Utilizadores
          </Button>
          <Button
            onClick={() => { setActiveTable("animals"); setSortConfig(null); }}
            className={`w-full justify-start h-12 rounded-xl text-base font-medium transition-all duration-200 ${activeTable === "animals" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200" : "bg-transparent text-gray-600 hover:bg-orange-50 hover:text-orange-600"}`}
            variant="ghost"
          >
            <PawPrint className="mr-3 h-5 w-5" /> Animais
          </Button>
        </div>

      </motion.aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        <AnimatePresence mode="wait">
          {activeTable === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-gray-100">
                <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Utilizadores</CardTitle>
                  </div>

  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
    {/* Only the button is wrapped in DialogTrigger */}
    <DialogTrigger asChild>
      <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95">
        <Plus className="mr-2 h-4 w-4" /> Novo Utilizador
      </Button>
    </DialogTrigger>

    {/* The modal itself */}
    <DialogContent className="rounded-3xl space-y-4 p-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-800">Criar novo utilizador</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 pt-2">
      <Input
        placeholder="Username"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        className="rounded-xl border-gray-200 focus:ring-orange-500"
      />
      <Input
        placeholder="Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="rounded-xl border-gray-200 focus:ring-orange-500"
      />
            <Input
        placeholder="Perms"
        type="number"
        value={newPerms}
        onChange={(e) => setNewPerms(Number(e.target.value))}
        className="rounded-xl border-gray-200 focus:ring-orange-500"
      />
      <Button
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md"
        onClick={handleCreateUser}
      >
        Criar
      </Button>
      </div>
    </DialogContent>
  </Dialog>
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
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("username")}>
                         <div className="flex items-center gap-1">
                            Username
                            {sortConfig?.key === "username" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
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
                            Perms
                            {sortConfig?.key === "perms" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right pr-8 font-semibold text-gray-500">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortData(users).map((u) => (
                        <TableRow key={u.id} className="group hover:bg-orange-50/30 transition-colors border-gray-50">
                          <TableCell className="pl-8 font-medium text-gray-600">#{u.id}</TableCell>
                          <TableCell className="font-medium text-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                {u.username}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400 font-mono text-xs">••••••••</TableCell>
                                           <TableCell className="font-medium text-gray-900">{u.perms}</TableCell>
                          <TableCell className="text-right pr-8 space-x-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditItem({ ...u })}>
                              <Pencil className="h-4 w-4" />
                            </Button>
<Button
  size="icon"
  variant="ghost"
  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
  onClick={async () => {
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
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTable === "animals" && (
            <motion.div key="animals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-gray-100">
                <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <PawPrint className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Animais</CardTitle>
                  </div>
                  <Dialog open={createAnimalDialogOpen} onOpenChange={setCreateAnimalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95">
                        <Plus className="mr-2 h-4 w-4" /> Novo Animal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl space-y-4 p-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800">Criar novo animal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-2">
                      <Input
                        placeholder="Nome"
                        value={newAnimalNome}
                        onChange={(e) => setNewAnimalNome(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-orange-500"
                      />
                      <Input
                        placeholder="Chip"
                        value={newAnimalChip}
                        onChange={(e) => setNewAnimalChip(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-orange-500"
                      />
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 ml-1">Foto (Opcional)</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewAnimalImage(e.target.files?.[0] || null)}
                          className="rounded-xl border-gray-200 focus:ring-orange-500 file:text-orange-600 file:font-medium file:bg-orange-50 file:rounded-lg file:border-0 file:mr-4 file:px-4 file:py-1 hover:file:bg-orange-100 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCreateSexOpen(!createSexOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all h-10"
                        >
                          <span className="text-gray-900">
                            {newAnimalSex === 1 ? "Macho" : "Fêmea"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${createSexOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {createSexOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                            >
                              {[
                                { label: "Macho", value: 1 },
                                { label: "Fêmea", value: 0 }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setNewAnimalSex(option.value);
                                    setCreateSexOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                  {option.label}
                                  {newAnimalSex === option.value && <Check className="w-4 h-4 text-orange-500" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 shadow-md"
                        onClick={handleCreateAnimal}
                      >
                        Criar
                      </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("image")}>
                          <div className="flex items-center gap-1">
                            Foto
                            {sortConfig?.key === "image" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("nome")}>
                          <div className="flex items-center gap-1">
                            Nome
                            {sortConfig?.key === "nome" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("chip")}>
                          <div className="flex items-center gap-1">
                            Chip
                            {sortConfig?.key === "chip" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort("sex")}>
                          <div className="flex items-center gap-1">
                            Sexo
                            {sortConfig?.key === "sex" && <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === "asc" ? "rotate-180" : ""}`} />}
                          </div>
                       </TableHead>
                        <TableHead className="text-right pr-8 font-semibold text-gray-500">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortData(animals).map((a) => (
                        <TableRow key={a.id} className="group hover:bg-orange-50/30 transition-colors border-gray-50">
                          <TableCell className="pl-8 font-medium text-gray-600">#{a.id}</TableCell>
                          <TableCell>
                            {a.image ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                                <img src={a.image} alt={a.nome} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{a.nome}</TableCell>
                          <TableCell className="text-gray-500 font-mono">{a.chip}</TableCell>
                          <TableCell className="text-gray-500">{a.sex === 1 ? "Macho" : "Fêmea"}</TableCell>
                          <TableCell className="text-right pr-8 space-x-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditItem({ ...a })}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={async () => {
                                if (!confirm("Are you sure you want to delete this animal?")) return;

                                try {
                                  const res = await fetch("/api/admin/animals", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: a.id }),
                                  });

                                  if (!res.ok) {
                                    const error = await res.json();
                                    alert(`Failed to delete animal: ${error.error}`);
                                    return;
                                  }

                                  setAnimals((prev) => prev.filter((animal) => animal.id !== a.id));
                                } catch (err) {
                                  console.error(err);
                                  alert("Error deleting animal");
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
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
  <DialogTrigger asChild>

  </DialogTrigger>

  <DialogContent className="rounded-2xl space-y-4">
    <DialogHeader>
      <DialogTitle className="text-orange-500">Criar novo utilizador</DialogTitle>
    </DialogHeader>
    <Input
      placeholder="Username"
      value={newUsername}
      onChange={(e) => setNewUsername(e.target.value)}
    />
    <Input
      placeholder="Password"
      type="password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />
        <Input
      placeholder="Perms"
      type="number"
             min={0}
        max={1}
      value={newPerms}
      onChange={(e) => {
          const val = Number(e.target.value);
          if (val === 0 || val === 1) setNewPerms(val);
        }}
    />
    <Button
      className="w-full bg-orange-500 hover:bg-orange-600"
      onClick={handleCreateUser}
    >
      Confirmar
    </Button>
  </DialogContent>
</Dialog>

      {/* EDIT MODAL */}
      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); setEditSexOpen(false); setEditImageFile(null); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-orange-500">Editar Utilizador</DialogTitle>
          </DialogHeader>

          {editItem && (
            <div className="space-y-4">
              {Object.keys(editItem).map((key) => {
                if (key === "id" || key === "deleteImage") return null;
                if (key === "image") {
                  return (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Foto</label>
                      {editItem[key] && (
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img src={editItem[key]} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <Button
                            type="button"
                            onClick={handleRemoveImage}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-sm transition-all hover:scale-105 active:scale-95 h-10 px-4 rounded-xl font-medium"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                        className="rounded-xl border-gray-200 focus:ring-orange-500 file:text-orange-600 file:font-medium file:bg-orange-50 file:rounded-lg file:border-0 file:mr-4 file:px-4 file:py-1 hover:file:bg-orange-100 transition-all"
                      />
                    </div>
                  );
                }
                if (key === "sex") {
                  return (
                    <div key={key} className="relative">
                      <button
                        type="button"
                        onClick={() => setEditSexOpen(!editSexOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all h-10"
                      >
                        <span className="text-gray-900">
                          {editItem[key] === 1 ? "Macho" : "Fêmea"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${editSexOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {editSexOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                          >
                            {[
                              { label: "Macho", value: 1 },
                              { label: "Fêmea", value: 0 }
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setEditItem({ ...editItem, [key]: option.value });
                                  setEditSexOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 hover:text-orange-600 transition-colors"
                              >
                                {option.label}
                                {editItem[key] === option.value && <Check className="w-4 h-4 text-orange-500" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                                if (key === "perms") {
                  return (
                    <Input
                     key={key}
                      type="number"
                      min={0}
                     max={1}
                      value={editItem[key]}
                     onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val === 0 || val === 1) setEditItem({ ...editItem, [key]: val });
                     }}
                     placeholder={key}
                    />
                  );
                }
                return (
                  <Input
                    key={key}
                    value={editItem[key]}
                    onChange={(e) => setEditItem({ ...editItem, [key]: e.target.value })}
                    placeholder={key}
                  />
                );
              })}
              <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600">
                Salvar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
