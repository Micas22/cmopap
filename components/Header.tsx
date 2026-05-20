"use client";
import Link from "next/link";
import { Search, LogOut, Bell, X, Menu, ChevronRight, Info, AlertTriangle, CheckCircle2, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  dataAndTime: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `há ${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  message: { icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-50" },
};

function getTypeConfig(type: string) {
  return typeConfig[type.toLowerCase()] ?? typeConfig.info;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header() {
  const [showPopup, setShowPopup] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const popupRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // ── Bootstrap from localStorage ───────────────────────────────────────────
  useEffect(() => {
    const u = localStorage.getItem("username");
    const id = localStorage.getItem("userId");
    if (u) setUsername(u);
    if (id) setUserId(id);
  }, []);

  // ── Fetch notifications ───────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setNotifLoading(true);
    setNotifError(false);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) throw new Error("fetch failed");
      const data: Notification[] = await res.json();
      setNotifications(data);
    } catch {
      setNotifError(true);
    } finally {
      setNotifLoading(false);
    }
  }, [userId]);

  // Fetch on mount + whenever userId resolves
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Poll every 60 s while tab is visible
  useEffect(() => {
    if (!userId) return;
    const id = setInterval(() => {
      if (!document.hidden) fetchNotifications();
    }, 60_000);
    return () => clearInterval(id);
  }, [userId, fetchNotifications]);

  // ── Scroll shadow ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Outside-click closes dropdowns ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setShowPopup(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Close mobile menu on route change ────────────────────────────────────
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // ── ⌘K search shortcut ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("header-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  const handleBellClick = () => {
    const next = !showNotifs;
    setShowNotifs(next);
    setShowPopup(false);
    if (next && notifications.length === 0) fetchNotifications();
  };

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Quem somos?", href: "/aboutus" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const unreadCount = notifications.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <header
        className={`w-full z-50 sticky top-0 font-sans transition-all duration-500 ${scrolled ? "shadow-2xl shadow-orange-900/30" : "shadow-xl"
          }`}
      >
        {/* Grain texture */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />

        <motion.div
          className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 relative z-10"
          initial={{ opacity: 0, y: -32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div className="absolute -right-16 -top-16 w-64 h-64 border-[36px] border-white/[0.07] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute -left-8 -bottom-14 w-44 h-44 border-[22px] border-white/[0.07] rounded-full" animate={{ rotate: -360 }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute right-1/3 -top-20 w-48 h-48 border-[16px] border-white/[0.04] rounded-full" animate={{ rotate: 180 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
          </div>

          {/* Bottom shimmer */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative w-full px-5 lg:px-10 py-2.5 flex items-center justify-between gap-4">

            {/* Logo */}
            <motion.div className="flex-shrink-0" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 320, damping: 20 }}>
              <Link href="/" className="block">
                <div className="bg-white/15 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-inner shadow-white/10 hover:bg-white/22 transition-colors duration-200">
                  <img src="/croa.png" alt="CROA Olhão" className="w-auto h-[52px] md:h-[68px] object-contain drop-shadow-lg" />
                </div>
              </Link>
            </motion.div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-3 lg:gap-5">

              {/* Search */}
              <div className="relative">
                <motion.div
                  className={`flex items-center bg-white/15 border rounded-full overflow-hidden transition-colors duration-300 ${searchFocused ? "bg-white border-white shadow-lg shadow-orange-900/20" : "border-white/25 hover:bg-white/22 hover:border-white/40"
                    }`}
                  animate={{ width: searchFocused ? 240 : 190 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Search className={`ml-3 flex-shrink-0 transition-colors duration-200 ${searchFocused ? "text-orange-500" : "text-white/70"}`} size={14} />
                  <input
                    id="header-search"
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`bg-transparent pl-2 pr-3 py-2 text-sm focus:outline-none w-full transition-colors duration-200 ${searchFocused ? "text-gray-800 placeholder-gray-400" : "text-white placeholder-white/60"}`}
                  />
                  {!searchFocused && (
                    <span className="mr-2.5 flex-shrink-0 text-[10px] text-white/50 font-mono bg-white/10 px-1.5 py-0.5 rounded-md border border-white/15">⌘K</span>
                  )}
                  {searchFocused && searchValue && (
                    <button onMouseDown={(e) => { e.preventDefault(); setSearchValue(""); }} className="mr-2 text-gray-400 hover:text-gray-600">
                      <X size={12} />
                    </button>
                  )}
                </motion.div>
              </div>

              {/* Nav */}
              <nav className="flex items-center gap-0.5 text-white font-medium">
                {navLinks.map((link, i) => (
                  <motion.div key={link.name} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.07, duration: 0.35 }}>
                    <Link
                      href={link.href}
                      className={`relative px-3.5 py-2 rounded-xl text-sm tracking-wide transition-all duration-200 block group ${isActive(link.href) ? "bg-white/20 text-white font-semibold" : "hover:bg-white/12 text-white/90 hover:text-white"
                        }`}
                    >
                      {link.name}
                      {isActive(link.href) && (
                        <motion.span layoutId="nav-active-pill" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                      )}
                      {!isActive(link.href) && (
                        <span className="absolute bottom-1.5 left-3 right-3 h-px bg-white/0 group-hover:bg-white/60 transition-all duration-300 rounded-full" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="h-6 w-px bg-white/20 rounded-full" />

              {/* ── Bell ─────────────────────────────────────────────────── */}
              <div className="relative" ref={bellRef}>
                <motion.button
                  onClick={handleBellClick}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative w-9 h-9 flex items-center justify-center rounded-full border transition-colors duration-200 ${showNotifs ? "bg-white border-white text-orange-500 shadow-lg shadow-orange-900/20" : "bg-white/15 border-white/20 text-white hover:bg-white/25"
                    }`}
                >
                  {notifLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Bell size={15} />
                  )}
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-white text-orange-600 text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* Notifications dropdown */}
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.93 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.93 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-2xl shadow-orange-900/15 border border-gray-100/80 overflow-hidden z-50 origin-top-right"
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">Notificações</p>
                          <p className="text-white/65 text-[10px]">
                            {unreadCount === 0 ? "Nenhuma notificação" : `${unreadCount} notificaç${unreadCount === 1 ? "ão" : "ões"}`}
                          </p>
                        </div>
                        <button
                          onClick={fetchNotifications}
                          disabled={notifLoading}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                          title="Atualizar"
                        >
                          <motion.div animate={{ rotate: notifLoading ? 360 : 0 }} transition={{ duration: 0.6, repeat: notifLoading ? Infinity : 0, ease: "linear" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                            </svg>
                          </motion.div>
                        </button>
                      </div>

                      {/* Body */}
                      <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50">
                        {notifLoading && notifications.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                            <Loader2 size={20} className="animate-spin text-orange-400" />
                            <span className="text-xs">A carregar...</span>
                          </div>
                        )}

                        {notifError && (
                          <div className="flex flex-col items-center justify-center py-10 text-center px-6 gap-2">
                            <AlertTriangle size={20} className="text-amber-400" />
                            <p className="text-sm text-gray-500 font-medium">Erro ao carregar notificações</p>
                            <button onClick={fetchNotifications} className="text-xs text-orange-500 hover:underline">Tentar novamente</button>
                          </div>
                        )}

                        {!notifLoading && !notifError && notifications.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 text-center px-6 gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                              <Bell size={18} className="text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400">Sem notificações</p>
                          </div>
                        )}

                        {notifications.map((notif, i) => {
                          const { icon: Icon, color, bg } = getTypeConfig(notif.type);
                          return (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-default"
                            >
                              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <Icon size={14} className={color} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{notif.title}</p>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">{relativeTime(notif.dataAndTime)}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.description}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── User popup ───────────────────────────────────────────── */}
              <div className="relative" ref={popupRef}>
                <motion.button
                  onClick={() => { setShowPopup(!showPopup); setShowNotifs(false); }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 340, damping: 22 }}
                  className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all duration-200 ${showPopup ? "bg-white border-white shadow-lg shadow-orange-900/20" : "bg-white/15 border-white/25 hover:bg-white/25 hover:border-white/40"
                    }`}
                >
                  <div className={`w-7 h-7 rounded-full overflow-hidden border-2 flex-shrink-0 transition-colors ${showPopup ? "border-orange-300" : "border-white/40"}`}>
                    <img src="/user.png" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-sm font-medium hidden sm:block truncate max-w-[72px] transition-colors ${showPopup ? "text-orange-600" : "text-white"}`}>
                    {username || "Conta"}
                  </span>
                  <motion.div animate={{ rotate: showPopup ? 90 : 0 }} transition={{ duration: 0.2 }} className={`transition-colors ${showPopup ? "text-orange-400" : "text-white/60"}`}>
                    <ChevronRight size={12} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showPopup && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.93 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.93 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-2xl shadow-orange-900/15 border border-gray-100/80 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="bg-gradient-to-br from-orange-500 to-amber-400 px-4 py-3.5 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
                        <div className="relative flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                            <img src="/user.png" alt="User" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[9px] text-white/65 uppercase tracking-[0.12em] font-bold mb-0.5">Sessão iniciada</p>
                            <p className="text-white font-semibold text-sm truncate max-w-[140px]">{username || "Convidado"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors duration-150 group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                            <LogOut size={13} />
                          </div>
                          Terminar Sessão
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile right */}
            <div className="flex md:hidden items-center gap-2">
              <motion.button
                onClick={handleBellClick}
                whileTap={{ scale: 0.9 }}
                className={`relative w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${showNotifs ? "bg-white border-white text-orange-500" : "bg-white/15 border-white/20 text-white"
                  }`}
              >
                {notifLoading ? <Loader2 size={14} className="animate-spin" /> : <Bell size={15} />}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-white text-orange-600 text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                onClick={() => setMobileOpen(!mobileOpen)}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 border border-white/20 text-white hover:bg-white/25 transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={mobileOpen ? "close" : "open"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Mobile notification panel (shown above mobile menu) */}
        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden bg-white md:hidden relative z-10 border-t border-gray-100"
            >
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                <div className="px-4 py-2.5 flex items-center justify-between bg-gray-50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notificações</span>
                  <span className="text-xs text-gray-400">{unreadCount} total</span>
                </div>
                {notifLoading && notifications.length === 0 && (
                  <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                    <Loader2 size={16} className="animate-spin text-orange-400" />
                    <span className="text-xs">A carregar...</span>
                  </div>
                )}
                {!notifLoading && notifications.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">Sem notificações</div>
                )}
                {notifications.map((notif) => {
                  const { icon: Icon, color, bg } = getTypeConfig(notif.type);
                  return (
                    <div key={notif.id} className="flex items-start gap-3 px-4 py-3">
                      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={13} className={color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800 truncate">{notif.title}</p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{relativeTime(notif.dataAndTime)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile nav menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden bg-gradient-to-b from-orange-600 to-amber-500 md:hidden relative z-10 border-t border-white/15"
            >
              <div className="px-5 pb-5 pt-3 space-y-1">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={14} />
                  <input type="text" placeholder="Pesquisar..." className="w-full bg-white/15 border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/55 focus:outline-none focus:bg-white/22 focus:border-white/40 transition-all" />
                </div>
                {navLinks.map((link, i) => (
                  <motion.div key={link.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.28 }}>
                    <Link href={link.href} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(link.href) ? "bg-white/25 text-white font-semibold" : "text-white/85 hover:bg-white/15 hover:text-white"}`}>
                      {link.name}
                      {isActive(link.href) && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-2 border-t border-white/15 mt-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl mb-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                      <img src="/user.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Sessão</p>
                      <p className="text-white text-sm font-semibold">{username || "Convidado"}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white transition-colors">
                    <LogOut size={14} />
                    Terminar Sessão
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}