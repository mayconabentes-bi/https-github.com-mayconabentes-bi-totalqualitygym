import React, { useState, useEffect } from 'react';
import { 
  Palette, ShieldCheck, RefreshCcw, Save, 
  Layout, Eye, AlertCircle, Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeConfig {
  primary: string;
  secondary: string;
  logoUrl?: string;
}

interface Props {
  unitId: string;
  unitName: string;
  initialTheme?: ThemeConfig;
  onSave: (config: ThemeConfig) => void;
  onClose: () => void;
}

export default function UnitThemeConfig({ unitId, unitName, initialTheme, onSave, onClose }: Props) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme || {
    primary: '#141414',
    secondary: '#525252',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=AF'
  });

  const [previewActive, setPreviewActive] = useState(true);
  const [contrastError, setContrastError] = useState(false);

  // Validação de Contraste (SGQ-UX)
  useEffect(() => {
    const isTooClose = (c1: string, c2: string) => {
      const hex2rgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
      };
      
      const rgb1 = hex2rgb(c1);
      const rgb2 = hex2rgb(c2);
      
      const diff = Math.abs(rgb1.r - rgb2.r) + Math.abs(rgb1.g - rgb2.g) + Math.abs(rgb1.b - rgb2.b);
      return diff < 100; // Limiar de segurança para contraste legível
    };

    setContrastError(isTooClose(theme.primary, theme.secondary));
  }, [theme.primary, theme.secondary]);

  // Injeção de Live Preview no Container de Mock
  const applyThemeToRoot = (isPersistent: boolean) => {
    const root = document.documentElement;
    root.style.setProperty('--gym-primary', theme.primary);
    root.style.setProperty('--gym-secondary', theme.secondary);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-5xl rounded-[3.5rem] overflow-hidden flex h-[80vh] shadow-2xl"
      >
        {/* Painel de Controle */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-100 p-10 flex flex-col justify-between">
           <div className="space-y-8">
              <header>
                 <div className="flex items-center gap-3 text-emerald-500 mb-2">
                    <Palette className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Brand Engine v1.0</span>
                 </div>
                 <h3 className="text-2xl font-serif italic text-gray-900">Configurar Brand: {unitName}</h3>
              </header>

              <div className="space-y-6">
                 <ColorField 
                    label="Cor Primária" 
                    value={theme.primary} 
                    onChange={(v) => setTheme({...theme, primary: v})} 
                 />
                 <ColorField 
                    label="Cor Secundária" 
                    value={theme.secondary} 
                    onChange={(v) => setTheme({...theme, secondary: v})} 
                 />
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Logo URL</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={theme.logoUrl} 
                         onChange={(e) => setTheme({...theme, logoUrl: e.target.value})}
                         className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                       />
                       <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                 </div>
              </div>

              {contrastError && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                       <p className="text-[9px] font-black text-red-700 uppercase">ERRO DE CONFORME (SGQ)</p>
                       <p className="text-[10px] text-red-600 mt-1">Contraste insuficiente detectado. As cores selecionadas podem prejudicar a acessibilidade.</p>
                    </div>
                 </div>
              )}
           </div>

           <div className="space-y-4">
              <button 
                onClick={() => onSave(theme)}
                disabled={contrastError}
                className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
              >
                 <Save className="w-4 h-4" /> Aplicar Identidade
              </button>
              <button onClick={onClose} className="w-full py-2 text-[9px] font-bold text-gray-400 hover:text-black transition-colors">Descartar Alterações</button>
           </div>
        </div>

        {/* Live Preview Console */}
        <div className="flex-1 bg-white p-12 overflow-y-auto">
           <div className="flex items-center justify-between mb-10">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-gray-300">Ambiente de Simulação Real-Time</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">
                 <ShieldCheck className="w-3.5 h-3.5" /> SGQ Ativo
              </div>
           </div>

           {/* Dashboard Mock com Variáveis Dinâmicas */}
           <div 
             className="border border-gray-100 rounded-[2.5rem] p-10 space-y-8 shadow-inner bg-gray-50/50"
             style={{ 
               ['--local-primary' as any]: theme.primary, 
               ['--local-secondary' as any]: theme.secondary 
             }}
           >
              {/* Mock Header */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <img src={theme.logoUrl} className="w-12 h-12 rounded-xl bg-white shadow-sm" alt="Logo" />
                    <div className="h-10 w-px bg-gray-200" />
                    <h4 className="text-xl font-serif italic text-gray-900">{unitName}</h4>
                 </div>
                 <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--local-primary)' }} />
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--local-secondary)' }} />
                 </div>
              </div>

              {/* Mock Card */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                 <div className="w-12 h-1 bg-gray-100 rounded-full mb-6" style={{ backgroundColor: 'var(--local-primary)' }} />
                 <h5 className="text-3xl font-serif italic mb-2" style={{ color: 'var(--local-primary)' }}>Performance do Dia</h5>
                 <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Clique para ver os detalhes da unidade</p>
                 
                 <div className="mt-8 flex gap-4">
                    <button 
                      className="px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-lg"
                      style={{ backgroundColor: 'var(--local-primary)' }}
                    >
                       Botão Primário
                    </button>
                    <button 
                      className="px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white border transition-all"
                      style={{ borderColor: 'var(--local-secondary)', color: 'var(--local-secondary)' }}
                    >
                       Ação Secundária
                    </button>
                 </div>
              </div>

              {/* Mock Stats */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-6 bg-white rounded-3xl border-2" style={{ borderColor: 'var(--local-primary)' }}>
                    <p className="text-[8px] font-black uppercase tracking-tighter" style={{ color: 'var(--local-secondary)' }}>Status da Unidade</p>
                    <p className="text-lg font-serif italic mt-1">Conforme POL-AF-001</p>
                 </div>
                 <div className="p-6 bg-white rounded-3xl border-2" style={{ borderColor: 'var(--local-secondary)' }}>
                    <p className="text-[8px] font-black uppercase tracking-tighter" style={{ color: 'var(--local-primary)' }}>Integridade RLS</p>
                    <p className="text-lg font-serif italic mt-1">Isolamento Ativo</p>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function ColorField({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</label>
       <div className="flex items-center gap-4">
          <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-xl bg-white border border-gray-100 p-1 cursor-pointer overflow-hidden"
          />
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-white border border-gray-100 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono uppercase"
          />
       </div>
    </div>
  );
}
