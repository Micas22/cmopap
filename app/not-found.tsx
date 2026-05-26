"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl ring-1 ring-gray-100 p-10 text-center relative overflow-hidden"
      >
        {/* Background decorative blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-50 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
            className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-orange-200/50"
          >
            <PawPrint className="w-12 h-12 text-orange-500 drop-shadow-sm" />
          </motion.div>

          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 mb-2 drop-shadow-sm">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Página não encontrada
          </h2>

          <p className="text-gray-500 mb-8 leading-relaxed">
            Oops! Parece que a página que procuras não existe, foi removida ou o endereço está incorreto.
          </p>

          <Button
            asChild
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95 h-12 text-base font-semibold group"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
