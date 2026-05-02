import React, { useState } from 'react';
import { 
  Building2, Plus, MapPin, Mail, 
  ShieldCheck, Globe, ArrowRight, CheckCircle2,
  AlertCircle, Briefcase, Activity, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import UnitThemeConfig from './UnitThemeConfig';

interface Props {
  profile: UserProfile;
}

export default function UnitManagementDashboard({ profile }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedUnitForTheme, setSelectedUnitForTheme] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    email: ''
  });

  const [units, setUnits] = useState([
    { id: '1', name: 'AREA FIT - Centro', city: 'São Paulo', state: 'SP', status: 'ACTIVE', theme: { primary: '#141414', secondary: '#525252' } },
    { id: '2', name: 'AREA FIT - Ponta Negra', city: 'Manaus', state: 'AM', status: 'ACTIVE', theme: { primary: '#10b981', secondary: '#064e3b' } },
  ]);

  const handleSaveTheme = async (theme: any) => {
    if (!selectedUnitForTheme) return;
    
    // API call to persist theme
    await fetch('/api/units/update-theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit_id: selectedUnitForTheme.id, theme_config: theme })
    });

    setUnits(units.map(u => u.id === selectedUnitForTheme.id ? { ...u, theme } : u));
    setShowThemeModal(false);
    
    // Injeção dinâmica no ROOT se for a unidade atual (Simulado)
    const root = document.documentElement;
    root.style.setProperty('--gym-primary', theme.primary);
    root.style.setProperty('--gym-secondary', theme.secondary);
    alert(`Identidade Visual atualizada para ${selectedUnitForTheme.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/units/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          admin_role: 'ADMIN_GLOBAL' // Simulação de privilégio elevado
        })
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : { success: false, message: 'Resposta vazia do servidor' };
      
      if (data.success) {
        setUnits([...units, data.unit]);
        setShowModal(false);
        setFormData({ name: '', city: '', state: '', email: '' });
        alert('Unidade expandida com sucesso!');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Executive Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#141414] p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Globe className="w-64 h-64" />
         </div>
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20">
               <Briefcase className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
               <h2 className="text-3xl font-serif italic">Expansão de Rede</h2>
               <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40 mt-1">Gestão Central de Unidades (Multi-Tenancy)</p>
            </div>
         </div>
         <button 
           onClick={() => setShowModal(true)}
           className="relative z-10 px-10 py-5 bg-white text-[#141414] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
         >
            <Plus className="w-4 h-4" /> Cadastrar Nova Unidade
         </button>
      </header>

      {/* Analytics Briefing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Unidades Ativas</p>
            <div className="flex items-center justify-between">
               <span className="text-4xl font-serif italic text-[#141414]">{units.length}</span>
               <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                  <Activity className="w-5 h-5" />
               </div>
            </div>
         </div>
         <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Taxa de Crescimento</p>
            <div className="flex items-center justify-between">
               <span className="text-4xl font-serif italic text-blue-600">+100%</span>
               <p className="text-[9px] font-bold text-gray-500 uppercase">Trimestre Atual</p>
            </div>
         </div>
         <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-4">Isolamento de Dados</p>
            <div className="flex items-center gap-3 text-emerald-950">
               <ShieldCheck className="w-6 h-6" />
               <span className="text-xs font-bold uppercase tracking-tight">RLS Zero-Trust Ativo em todas as tabelas</span>
            </div>
         </div>
      </div>

      {/* Units List */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-4 md:p-10 shadow-sm overflow-hidden">
         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 px-4">Portfolio de Operações</h3>
         <div className="grid gap-4">
            {units.map(unit => (
               <div key={unit.id} className="p-6 bg-gray-50 border border-transparent hover:border-[#141414]/10 rounded-[2rem] flex items-center justify-between transition-all group">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
                        <Building2 className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-[#141414]">{unit.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                              <MapPin className="w-3 h-3" /> {unit.city}, {unit.state}
                           </span>
                           <span className="w-1 h-1 bg-gray-200 rounded-full" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Operando</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => {
                         setSelectedUnitForTheme(unit);
                         setShowThemeModal(true);
                       }}
                       className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-300 opacity-0 group-hover:opacity-100 hover:text-emerald-500 hover:border-emerald-100 transition-all flex items-center gap-2"
                     >
                        <Palette className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Identidade</span>
                     </button>
                     <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-300 opacity-0 group-hover:opacity-100 hover:text-[#141414] hover:bg-gray-100 transition-all">
                        <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Brand Config Modal */}
      <AnimatePresence>
         {showThemeModal && selectedUnitForTheme && (
            <UnitThemeConfig 
               unitId={selectedUnitForTheme.id}
               unitName={selectedUnitForTheme.name}
               initialTheme={selectedUnitForTheme.theme}
               onSave={handleSaveTheme}
               onClose={() => setShowThemeModal(false)}
            />
         )}
      </AnimatePresence>

      {/* registration Modal */}
      <AnimatePresence>
         {showModal && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-[#141414]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                 className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-xl w-full"
               >
                  <div className="text-center mb-10">
                     <h3 className="text-4xl font-serif italic text-[#141414]">Expansão de Unidade</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">Provisionamento de Infraestrutura Cloud</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <Input 
                       label="NOME DA UNIDADE" value={formData.name} 
                       onChange={(v: string) => setFormData({...formData, name: v})} 
                       placeholder="Ex: AREA FIT - Centro II"
                     />
                     <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2">
                           <Input label="CIDADE" value={formData.city} onChange={(v: string) => setFormData({...formData, city: v})} />
                        </div>
                        <Input label="UF" value={formData.state} onChange={(v: string) => setFormData({...formData, state: v})} />
                     </div>
                     <Input label="E-MAIL DE CONTATO" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />

                     <div className="pt-6 flex gap-6">
                        <button 
                          type="button" 
                          onClick={() => setShowModal(false)}
                          className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                        >
                           Cancelar
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-5 bg-[#141414] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl disabled:opacity-50"
                        >
                           {isSubmitting ? 'Provisionando...' : 'Confirmar Expansão'}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 block px-1">{label}</label>
       <input 
         type={type}
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         required
         className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-[#141414] focus:bg-white focus:ring-2 focus:ring-[#141414] outline-none transition-all"
       />
    </div>
  );
}
