import React from 'react';
import { ShieldCheck, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-950 overflow-hidden relative">
      {/* Decorative Brand Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-slate-500/5 rounded-full blur-3xl animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative z-10 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mb-8 relative"
          >
            <div className="relative w-16 h-16 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl shadow-inner shadow-black/50">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
            </div>
          </motion.div>
          
          <h1 className="text-2xl font-medium tracking-tight text-slate-50 mb-2">
            TOTAL QUALITY
          </h1>
          <p className="text-slate-400 text-[10px] font-mono uppercase tracking-[0.2em]">
            SYSTEM ARCHITECTURE & GOVERNANCE
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={onLogin}
            className="stark-button stark-button-glow flex items-center justify-center w-full gap-3 py-4 shadow-lg shadow-black/20 group"
          >
            <LogIn className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm tracking-wide">Acessar Cockpit Strategic</span>
          </button>
          
          <div className="pt-8 border-t border-slate-800/50">
            <p className="text-[10px] text-center text-slate-500 font-mono uppercase tracking-[0.2em] leading-relaxed">
              POLÍTICA DA QUALIDADE (POL-AF-001)<br />
              COMPLIANCE & PERFORMANCE METRICS
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
