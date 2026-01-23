"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import {useInView, AnimatePresence } from "framer-motion";
import {useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AboutUs() {
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
    <motion.div 
      className="min-h-screen w-full bg-gray-50 text-gray-800 py-20 px-6 flex justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Moving Grid Pattern */}
        <motion.div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          animate={{ 
            backgroundPosition: ["0px 0px", "24px 24px"]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "linear" 
          }}
        />
        {/* Subtle vignette to focus content */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(255,255,255,0.8)_100%)]" />
      </div>

      <div className="max-w-5xl w-full space-y-20 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 drop-shadow-sm">
            Quem somos?
          </h1>
          <div className="w-24 h-1.5 bg-orange-500 mx-auto rounded-full opacity-80" />
          <p className="text-lg md:text-xl text-gray-600 mx-auto leading-relaxed max-w-4xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae pretium arcu. Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque eget sapien quis augue sagittis suscipit. Ut neque arcu, dignissim sed consectetur non, convallis eu arcu. Donec feugiat pretium mi, vel bibendum lorem scelerisque viverra. Nulla pellentesque nibh eu aliquet bibendum. Maecenas egestas, orci eu condimentum pretium, est tellus imperdiet justo, id volutpat ex ipsum eget ante. Nam vestibulum id massa a pharetra. Aliquam leo turpis, interdum id orci nec, imperdiet condimentum risus.
          </p>
        </motion.div>

        {/* Image section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((item, index) => (
            <motion.div
              key={index}
              className="w-full h-80 bg-white rounded-3xl shadow-lg flex items-center justify-center overflow-hidden border border-gray-100 relative group"
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-gray-100 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-gray-400 font-medium relative z-10">Insert Image {item}</span>
            </motion.div>
          ))}
        </div>

        {/* About Content */}
        <motion.section 
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4">
            O que fazemos?
          </h2>
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed text-justify">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id enim suscipit, efficitur diam quis, molestie libero. Vivamus sed varius metus. Maecenas condimentum elit eu tellus aliquam, at condimentum neque imperdiet. Duis condimentum lectus enim, ut vulputate sapien lacinia sit amet. Maecenas id erat maximus, aliquam magna at, eleifend sem. Aliquam elementum congue lectus eget fringilla. Sed congue fermentum tempor. Integer et blandit risus.
            </p>
            <p>
              Maecenas finibus lectus et ornare sagittis. Praesent lobortis consequat aliquet. Nullam luctus laoreet nisl et imperdiet. Fusce nec pharetra justo. Mauris tortor ex, consectetur sed tortor sed, tempus sodales felis. Pellentesque tincidunt lacus tellus, id mollis ligula convallis vel. In et lacinia magna. Aenean rhoncus eros risus, varius sagittis arcu ultricies ut. Integer quis orci nisi.
            </p>
            <p>
              Donec vestibulum laoreet nulla, non imperdiet metus pharetra sit amet. Phasellus et consequat nisi. Sed varius mattis justo, eget tincidunt velit facilisis scelerisque. Integer dolor nisi, iaculis nec turpis id, pulvinar pretium turpis. Suspendisse blandit felis in rhoncus tincidunt. Mauris porta mollis nisi. Pellentesque nec urna id diam malesuada tempor sit amet vel orci. Quisque sit amet ex risus. Morbi consequat libero id dolor sollicitudin ullamcorper. Nullam a semper risus, sed faucibus felis. Quisque rhoncus blandit purus, fermentum feugiat justo convallis id. Nullam interdum aliquet magna, congue consectetur quam egestas at. Nulla sed imperdiet magna. Sed massa ex, viverra sit amet diam ac, congue luctus sapien. Fusce vulputate ligula et orci interdum, non condimentum metus pharetra. Aliquam nec metus elit.
            </p>
            <p>
              Morbi feugiat magna at porta vulputate. Quisque lacinia leo sed ante semper dapibus. Nam in erat luctus, pharetra lectus quis, sodales metus. Cras iaculis, justo id sagittis ultricies, ante nulla mollis tellus, a porta urna mauris ac libero. Pellentesque posuere tellus eros, ac cursus ligula elementum ut. Proin ornare porta magna, sit amet vehicula nibh tempor eu. Vivamus lacinia cursus libero, gravida elementum justo rutrum in. Aliquam iaculis cursus venenatis. In hac habitasse platea dictumst. Maecenas lacus velit, pulvinar sit amet libero eget, placerat blandit massa.
            </p>
            <p>
              Suspendisse sit amet augue nec leo posuere sagittis. Mauris quis suscipit metus. Morbi tristique, massa tincidunt facilisis cursus, sapien massa porttitor massa, ut mattis enim magna quis quam. Etiam arcu tortor, sagittis at venenatis malesuada, blandit sit amet enim. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed ac consequat ligula, vel aliquam orci. Mauris condimentum vulputate augue eu congue. Duis malesuada nulla eu aliquet consectetur. Phasellus feugiat mattis lorem, rutrum sagittis risus feugiat nec. Suspendisse potenti. Phasellus luctus sem vel molestie scelerisque. Sed sit amet odio suscipit, euismod nisi vitae, auctor orci. Duis vehicula diam velit, ut rhoncus dolor tristique quis.
            </p>
          </div>
        </motion.section>

        {/* Highlight box */}
        <motion.div 
          className="bg-gradient-to-br from-orange-600 to-amber-500 text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />

          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-bold flex items-center gap-3">
 O nosso foco
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              {["meow", "woof", "quack", "behhh"].map((item, i) => (
                <motion.li 
                  key={i}
                  className="flex items-center gap-3 bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}
