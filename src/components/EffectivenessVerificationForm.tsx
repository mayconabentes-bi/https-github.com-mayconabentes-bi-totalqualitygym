import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, 
  MessageSquare, Save, ChevronRight, 
  ShieldCheck, ArrowRight, TrendingUp, Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { EffectivenessVerification } from '../types';

interface Props {
  onVerify: (verification: EffectivenessVerification) => void;
  onCancel: () => void;
  verifierId: string;
}

export default function EffectivenessVerificationForm({ onVerify, onCancel, verifierId }: Props) {
  const [data, setData] = useState<Partial<EffectivenessVerification>>({
    reoccurred: false,
    indicatorImproved: true,
    complaintCeased: true,
    technicalObservation: '',
    isEffective: true
  });

  const handleSave = () => {
    onVerify({
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      verifiedById: verifierId,
      verifiedAt: new Date().toISOString(),
    } as EffectivenessVerification);
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-1">
         <h3 className="text-2xl font-serif italic text-[#141414]">Verificação de Eficácia</h3>
         <p className="text-[10px] font-mono text-[#141414]/40 uppercase tracking-[0.2em]">O problema foi realmente resolvido? - POP.SGQ.12</p>
      </div>

      <div className="bg-white border border-[#141414]/10 rounded-[3rem] p-10 shadow-2xl space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <ToggleField 
             label="O incidente voltou a ocorrer?" 
             value={data.reoccurred!} 
             onChange={(v) => setData({ ...data, reoccurred: v, isEffective: !v && data.indicatorImproved && data.complaintCeased })}
             inverse
           />
           <ToggleField 
             label="O indicador de desempenho melhorou?" 
             value={data.indicatorImproved!} 
             onChange={(v) => setData({ ...data, indicatorImproved: v, isEffective: !data.reoccurred && v && data.complaintCeased })}
           />
           <ToggleField 
             label="A reclamação / Desvio sessou?" 
             value={data.complaintCeased!} 
             onChange={(v) => setData({ ...data, complaintCeased: v, isEffective: !data.reoccurred && data.indicatorImproved && v })}
           />
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
              <Search className="w-3 h-3" /> Evidências e Observações Técnicas
           </label>
           <textarea 
             value={data.technicalObservation}
             onChange={(e) => setData({ ...data, technicalObservation: e.target.value })}
             placeholder="Descreva o que foi analisado para chegar a esta conclusão..."
             className="w-full p-6 bg-[#E4E3E0]/30 rounded-3xl outline-none text-sm h-32 font-serif italic"
           />
        </div>

        <div className={`p-8 rounded-[2rem] border-2 transition-all ${data.isEffective ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 {data.isEffective ? (
                   <ShieldCheck className="w-10 h-10 text-green-600" />
                 ) : (
                   <AlertTriangle className="w-10 h-10 text-red-600" />
                 )}
                 <div>
                    <h4 className={`text-xl font-serif italic ${data.isEffective ? 'text-green-800' : 'text-red-800'}`}>
                       {data.isEffective ? 'Ação Eficaz' : 'Ação Ineficaz'}
                    </h4>
                    <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest">
                       {data.isEffective ? 'A RAC será encerrada e arquivada.' : 'Será necessária a abertura de uma nova RAC.'}
                    </p>
                 </div>
              </div>
              <div className="text-[10px] font-bold uppercase text-[#141414]/30">Checklist POP.SGQ.12</div>
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
         <button onClick={onCancel} className="px-8 py-4 bg-[#E4E3E0] text-[#141414] rounded-2xl font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
         <button 
           onClick={handleSave} 
           className={`px-12 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl transition-all ${
             data.isEffective ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
           }`}
         >
            Finalizar Verificação <CheckCircle className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange, inverse = false }: { label: string, value: boolean, onChange: (v: boolean) => void, inverse?: boolean }) {
  const isPositive = inverse ? !value : value;

  return (
    <div className="space-y-4">
       <p className="text-xs font-bold text-[#141414] leading-tight min-h-[40px]">{label}</p>
       <div className="flex gap-2">
          <button 
            onClick={() => onChange(true)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
              value ? 'bg-[#141414] text-white border-[#141414] shadow-lg' : 'bg-white text-[#141414]/40 border-[#141414]/10'
            }`}
          >
            Sim
          </button>
          <button 
            onClick={() => onChange(false)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
              !value ? 'bg-[#141414] text-white border-[#141414] shadow-lg' : 'bg-white text-[#141414]/40 border-[#141414]/10'
            }`}
          >
            Não
          </button>
       </div>
    </div>
  );
}
