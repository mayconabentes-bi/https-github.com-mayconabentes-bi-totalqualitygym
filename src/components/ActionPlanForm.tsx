import React, { useState } from 'react';
import { 
  Plus, X, User, Calendar, 
  Settings, Target, Save, 
  ClipboardList, ArrowRight, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActionPlanItem, UserProfile } from '../types';

interface Props {
  onSave: (items: ActionPlanItem[]) => void;
  onCancel: () => void;
  users: UserProfile[];
}

export default function ActionPlanForm({ onSave, onCancel, users }: Props) {
  const [items, setItems] = useState<Partial<ActionPlanItem>[]>([
    { id: Math.random().toString(36).substr(2, 9), action: '', responsibleId: '', deadline: '', executionMethod: '', effectivenessCriteria: '', status: 'Pending' }
  ]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), action: '', responsibleId: '', deadline: '', executionMethod: '', effectivenessCriteria: '', status: 'Pending' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ActionPlanItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSave = () => {
    // Basic validation
    const valid = items.every(i => i.action && i.responsibleId && i.deadline);
    if (!valid) {
      alert("Por favor, preencha todos os campos obrigatórios (Ação, Responsável e Prazo).");
      return;
    }
    
    // Find names for responsible IDs
    const finalItems = items.map(i => {
      const user = users.find(u => u.id === i.responsibleId);
      return { ...i, responsibleName: user?.displayName || 'N/A' } as ActionPlanItem;
    });

    onSave(finalItems);
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-1">
         <h3 className="text-2xl font-serif italic text-[#141414]">Plano de Ação Corretiva</h3>
         <p className="text-[10px] font-mono text-[#141414]/40 uppercase tracking-[0.2em]">O que, quem, quando e como - POP.SGQ.12</p>
      </div>

      <div className="space-y-6">
        {items.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-[#141414]/10 rounded-[2rem] p-8 shadow-md relative group"
          >
            {items.length > 1 && (
              <button 
                onClick={() => removeItem(item.id!)}
                className="absolute top-6 right-6 p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                    <ClipboardList className="w-3 h-3" /> Ação (O que será feito?)
                  </label>
                  <input 
                    type="text"
                    value={item.action}
                    onChange={(e) => updateItem(item.id!, 'action', e.target.value)}
                    placeholder="Ex: Treinamento de reciclagem sobre o POP..."
                    className="w-full p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none text-xs font-serif italic border border-transparent focus:border-[#141414]/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                      <User className="w-3 h-3" /> Responsável
                    </label>
                    <select 
                      value={item.responsibleId}
                      onChange={(e) => updateItem(item.id!, 'responsibleId', e.target.value)}
                      className="w-full p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none text-[10px] font-bold uppercase tracking-wider"
                    >
                      <option value="">Selecionar...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.displayName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Prazo
                    </label>
                    <input 
                      type="date"
                      value={item.deadline}
                      onChange={(e) => updateItem(item.id!, 'deadline', e.target.value)}
                      className="w-full p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none text-[10px] font-bold uppercase tracking-wider"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                    <Settings className="w-3 h-3" /> Forma de Execução
                  </label>
                  <textarea 
                    value={item.executionMethod}
                    onChange={(e) => updateItem(item.id!, 'executionMethod', e.target.value)}
                    placeholder="Descreva o passo a passo..."
                    className="w-full p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none text-xs h-20 font-serif italic"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Critério de Eficácia
                  </label>
                  <input 
                    type="text"
                    value={item.effectivenessCriteria}
                    onChange={(e) => updateItem(item.id!, 'effectivenessCriteria', e.target.value)}
                    placeholder="O que prova que funcionou?"
                    className="w-full p-4 bg-yellow-50/50 border border-yellow-200/50 rounded-2xl outline-none text-xs font-serif italic"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-[#141414]/5">
        <button 
          onClick={addItem}
          className="flex-1 py-4 border-2 border-dashed border-[#141414]/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[#141414]/60 hover:bg-[#141414]/5 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Adicionar Outra Ação
        </button>
        <div className="flex gap-4">
           <button onClick={onCancel} className="px-8 py-4 bg-[#E4E3E0] text-[#141414] rounded-2xl font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
           <button onClick={handleSave} className="px-10 py-4 bg-[#141414] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl hover:bg-black">
              Prosseguir <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}
