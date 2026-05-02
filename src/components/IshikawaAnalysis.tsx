import React, { useState } from 'react';
import { 
  GitBranch, Users, Settings, Package, 
  Wind, Ruler, AlertCircle, Plus, X, 
  Save, ArrowRight, Lightbulb 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ishikawa6M } from '../types';

interface Props {
  onSave: (analysis: Ishikawa6M, rootCause: string) => void;
  onCancel: () => void;
}

export default function IshikawaAnalysis({ onSave, onCancel }: Props) {
  const [analysis, setAnalysis] = useState<Ishikawa6M>({
    method: [''],
    manpower: [''],
    machine: [''],
    material: [''],
    environment: [''],
    measurement: ['']
  });
  const [rootCause, setRootCause] = useState('');

  const mCategories = [
    { key: 'method', label: 'Método', icon: <GitBranch className="w-5 h-5" />, desc: 'Falhas no planejamento ou técnica explicada incorretamente.' },
    { key: 'manpower', label: 'Mão de Obra', icon: <Users className="w-5 h-5" />, desc: 'Falhas de execução, desatenção ou falta de experiência.' },
    { key: 'machine', label: 'Máquina', icon: <Settings className="w-5 h-5" />, desc: 'Problemas com tatames, luvas, som ou climatização.' },
    { key: 'material', label: 'Material', icon: <Package className="w-5 h-5" />, desc: 'Falta de protetores, kimonos inadequados ou insumos.' },
    { key: 'environment', label: 'Meio Ambiente', icon: <Wind className="w-5 h-5" />, desc: 'Calor excessivo, superlotação ou espaço inadequado.' },
    { key: 'measurement', label: 'Medição', icon: <Ruler className="w-5 h-5" />, desc: 'Ausência de controle de qualidade ou indicadores.' },
  ];

  const handleUpdateM = (key: keyof Ishikawa6M, index: number, value: string) => {
    const updated = { ...analysis };
    updated[key][index] = value;
    setAnalysis(updated);
  };

  const addField = (key: keyof Ishikawa6M) => {
    const updated = { ...analysis };
    updated[key] = [...updated[key], ''];
    setAnalysis(updated);
  };

  const removeField = (key: keyof Ishikawa6M, index: number) => {
    const updated = { ...analysis };
    updated[key] = updated[key].filter((_, i) => i !== index);
    if (updated[key].length === 0) updated[key] = [''];
    setAnalysis(updated);
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-serif italic text-[#141414]">Diagrama de Ishikawa (6M)</h3>
        <p className="text-xs font-mono text-[#141414]/40 uppercase tracking-[0.2em]">Análise de Causa Raiz - Registro de Ação Corretiva</p>
      </div>

      <div className="bg-[#141414]/5 p-8 rounded-[3rem] border border-[#141414]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {/* Visual backbone link could be added with absolute SVG if needed */}
          
          {mCategories.map((cat, idx) => (
            <motion.div 
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-[#141414]/5 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-[#141414]/10 pb-3">
                <div className="p-2 bg-[#141414] text-white rounded-xl">
                  {cat.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest">{cat.label}</h4>
                  <p className="text-[10px] text-[#141414]/40 leading-tight">{cat.desc}</p>
                </div>
              </div>

              <div className="space-y-2">
                {analysis[cat.key as keyof Ishikawa6M].map((val, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text"
                      value={val}
                      onChange={(e) => handleUpdateM(cat.key as keyof Ishikawa6M, i, e.target.value)}
                      className="flex-1 p-3 bg-[#E4E3E0]/30 rounded-xl outline-none text-xs font-serif italic focus:bg-[#E4E3E0]/50 transition-all"
                      placeholder="Causa provável..."
                    />
                    {analysis[cat.key as keyof Ishikawa6M].length > 1 && (
                      <button onClick={() => removeField(cat.key as keyof Ishikawa6M, i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => addField(cat.key as keyof Ishikawa6M)}
                  className="w-full py-2 border-2 border-dashed border-[#141414]/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 hover:bg-[#141414]/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Adicionar Causa
                </button>
              </div>
            </motion.div>
          ))}
          
          {/* Target Central (The Problem) */}
          <div className="hidden lg:flex absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: -1 }}>
             <div className="h-px w-full bg-[#141414]/10" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8 bg-white border border-[#141414]/10 p-10 rounded-[2.5rem] shadow-xl">
         <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600">
               <Lightbulb className="w-6 h-6" />
               <h4 className="text-lg font-serif italic">Conclusão: Qual a Causa Raiz?</h4>
            </div>
            <p className="text-xs text-[#141414]/40 italic">
              "De onde veio a origem deste problema?" - Evite focar apenas em pessoas. Olhe para o processo e ambiente.
            </p>
            <textarea 
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="w-full p-6 bg-[#E4E3E0]/30 rounded-3xl outline-none text-sm h-32 focus:bg-[#E4E3E0]/50 transition-all font-serif italic border border-transparent focus:border-[#141414]/10"
              placeholder="Após analisar os 6Ms, identifique a falha sistêmica original..."
            />
         </div>

         <div className="flex gap-4 pt-6 border-t border-[#141414]/5">
            <button 
              onClick={onCancel}
              className="px-8 py-4 bg-[#E4E3E0] text-[#141414] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#141414]/5 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onSave(analysis, rootCause)}
              className="flex-1 py-4 bg-[#141414] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all"
            >
              <Save className="w-4 h-4" /> Salvar Análise Ishikawa
            </button>
         </div>
      </div>
    </div>
  );
}
