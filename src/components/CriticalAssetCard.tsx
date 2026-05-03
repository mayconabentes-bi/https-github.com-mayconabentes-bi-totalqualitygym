import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Wrench, Clock } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL';
  lastMaintenance: string;
  location: string;
}

export default function CriticalAssetCard({ asset }: { asset: Asset }) {
  const isCritical = asset.status === 'CRITICAL';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-slate-900 border ${isCritical ? 'border-amber-500/30' : 'border-slate-800'} p-6 transition-all hover:border-slate-700`}
    >
      {/* Background Subtle Glow if Critical */}
      {isCritical && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
      )}

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">{asset.location}</span>
          </div>
          <h3 className="text-lg font-medium text-slate-50">{asset.name}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
            <Clock className="w-3 h-3" /> Última Verificação: {asset.lastMaintenance}
          </p>
        </div>

        {/* Pulse Indicator */}
        <div className="flex flex-col items-end gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 border border-slate-800">
            {isCritical ? (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500/30 animate-ping" />
                <AlertCircle className="relative w-4 h-4 text-amber-500" />
              </>
            ) : (
              <Wrench className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <span className={`text-[9px] font-mono uppercase tracking-widest ${isCritical ? 'text-amber-500' : 'text-slate-500'}`}>
            {asset.status}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Ação Requerida</span>
        <button className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
          {isCritical ? 'Abrir Ordem de Serviço' : 'Agendar Manutenção'}
        </button>
      </div>
    </motion.div>
  );
}
