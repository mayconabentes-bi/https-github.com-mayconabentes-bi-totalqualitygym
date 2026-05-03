import React, { useState, useEffect } from 'react';
import { 
  Shield, Wrench, AlertOctagon, CheckCircle, 
  Settings, History, AlertTriangle, Hammer,
  Activity, Clock, Box, HardHat, FileSearch,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, PhysicalAsset, AssetStatus } from '../types';

interface Props {
  profile: UserProfile;
}

export default function AssetHealthMonitor({ profile }: Props) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | AssetStatus>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/assets?tenant_id=${profile.tenantId}`)
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        setLoading(false);
      });
  }, [profile.tenantId]);

  const filteredAssets = filter === 'ALL' ? assets : assets.filter(a => a.status === filter);
  
  const complianceRate = assets.length > 0 
    ? Math.round((assets.filter(a => a.status === 'CONFORME').length / assets.length) * 100)
    : 0;

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case 'CONFORME': return 'text-green-500 bg-green-50 border-green-100';
      case 'MANUTENCAO': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'CRITICO': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Filters */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-serif italic text-gray-900">Monitor de Ativos & Infra</h2>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-1 italic">Governança AREA FIT - Módulo de Ativos Físicos</p>
         </div>

         <div className="flex bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm items-center gap-8">
            <div className="text-right">
               <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Conformidade Global</p>
               <p className={`text-2xl font-serif italic ${complianceRate > 80 ? 'text-green-500' : 'text-amber-500'}`}>{complianceRate}% Operacional</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 relative">
               <Activity className={`w-6 h-6 ${complianceRate > 80 ? 'text-green-500' : 'text-amber-500'}`} />
               <div className="absolute inset-0 border-2 border-white rounded-2xl shadow-inner" />
            </div>
         </div>
         
         <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            {['ALL', 'CONFORME', 'MANUTENCAO', 'CRITICO'].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f as any)}
                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                   filter === f ? 'bg-[#141414] text-white' : 'text-gray-400 hover:text-[#141414]'
                 }`}
               >
                  {f === 'ALL' ? 'Todos' : f}
               </button>
            ))}
         </div>
      </section>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <AnimatePresence>
            {filteredAssets.map((asset) => (
              <motion.div 
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                onClick={() => setSelectedAsset(asset)}
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-3xl border ${getStatusColor(asset.status)}`}>
                       <Box className="w-6 h-6" />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(asset.status)}`}>
                       {asset.status}
                    </div>
                 </div>

                 <h4 className="text-lg font-serif italic text-gray-900 leading-tight mb-2">{asset.name}</h4>
                 <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{asset.category}</p>

                 <div className="mt-8 space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                       <span>Saúde do Ativo</span>
                       <span className={asset.status === 'CONFORME' ? 'text-green-500' : asset.status === 'MANUTENCAO' ? 'text-yellow-600' : 'text-red-500'}>
                        {asset.status === 'CONFORME' ? '98%' : asset.status === 'MANUTENCAO' ? '65%' : '22%'}
                       </span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${
                           asset.status === 'CONFORME' ? 'bg-green-500 w-[98%]' : 
                           asset.status === 'MANUTENCAO' ? 'bg-yellow-400 w-[65%]' : 'bg-red-500 w-[22%]'
                         }`} 
                       />
                    </div>
                 </div>

                 {asset.deprecationWarning && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
                       <AlertTriangle className="w-4 h-4 text-orange-600" />
                       <span className="text-[9px] font-bold text-orange-700 uppercase tracking-widest">Aviso de Depreciação ({asset.monthsOld}m)</span>
                    </div>
                 )}

                 <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#141414] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-2 underline underline-offset-4">Detalhes do Ativo <ChevronRight className="w-3 h-3" /></span>
                 </div>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Asset Details Sidebar / Modal (Simulated) */}
      <AnimatePresence>
         {selectedAsset && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-[#141414]/80 backdrop-blur-md z-50 flex items-center justify-end p-6"
            >
               <motion.div 
                 initial={{ x: 100 }}
                 animate={{ x: 0 }}
                 exit={{ x: 100 }}
                 className="w-full max-w-xl bg-white h-full rounded-[3.5rem] shadow-2xl p-10 overflow-y-auto"
               >
                  <div className="flex justify-between items-center mb-10">
                     <button onClick={() => setSelectedAsset(null)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all text-gray-400"><History className="w-6 h-6 rotate-180" /></button>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Auditoria Técnica</p>
                        <p className="text-sm font-serif italic italic text-[#141414]">ID: {selectedAsset.id}</p>
                     </div>
                  </div>

                  <div className="space-y-10">
                     <header>
                        <h3 className="text-4xl font-serif italic text-[#141414] leading-tight">{selectedAsset.name}</h3>
                        <div className="mt-4 flex items-center gap-4">
                           <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedAsset.status)}`}>{selectedAsset.status}</span>
                           <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Instalado em {selectedAsset.installationDate}</span>
                        </div>
                     </header>

                     <div className="grid grid-cols-2 gap-6">
                        <InfoBox label="Última Auditoria" value={selectedAsset.lastAuditDate} icon={FileSearch} />
                        <InfoBox label="Próxima Auditoria" value={selectedAsset.nextAuditDate} icon={Clock} color="text-blue-600" />
                     </div>

                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Histórico de Intervenções</h4>
                        <div className="space-y-4 border-l-2 border-gray-50 ml-2">
                           <TimelineItem date="15 Mar 2026" type="Preventiva" desc="Lubrificação geral e limpeza de filtros." />
                           <TimelineItem date="10 Jan 2026" type="Corretiva" desc="Troca de correia de transmissão." isAlert />
                           <TimelineItem date="12 Dez 2025" type="Auditoria" desc="Inspeção trimestral conforme POP.SGQ.12" />
                        </div>
                     </div>

                     <div className="pt-10 flex gap-4">
                        <button className="flex-1 py-5 bg-[#141414] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Reportar Falha (SGQ)</button>
                        <button className="flex-1 py-5 border border-gray-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                           <Hammer className="w-4 h-4" /> Agendar Manutenção
                        </button>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, color = 'text-gray-900' }: any) {
  return (
    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
       <Icon className="w-5 h-5 text-gray-300 mb-4" />
       <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
       <p className={`text-xs font-bold ${color}`}>{value}</p>
    </div>
  );
}

function TimelineItem({ date, type, desc, isAlert = false }: any) {
  return (
    <div className="relative pl-8 pb-8">
       <div className={`absolute top-0 -left-[9px] w-4 h-4 rounded-full border-4 border-white ${isAlert ? 'bg-red-500' : 'bg-gray-200'}`} />
       <div className="space-y-1">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{date} — {type}</p>
          <p className="text-sm italic font-serif text-[#141414]">{desc}</p>
       </div>
    </div>
  );
}
