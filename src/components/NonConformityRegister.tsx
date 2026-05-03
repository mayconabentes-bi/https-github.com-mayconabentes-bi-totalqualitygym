import React, { useState } from 'react';
import { 
  AlertTriangle, Save, Loader2, Info, 
  User, ShieldAlert, ChevronRight, ClipboardList 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/supabase';
import { UserProfile, NCSource, NCGravity } from '../types';

type NonConformityInsert = Database['public']['Tables']['non_conformities']['Insert'];

interface Props {
  profile: UserProfile;
  onSuccess?: () => void;
}

export default function NonConformityRegister({ profile, onSuccess }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    source: 'Professor' as NCSource,
    description: '',
    immediate_action: '',
    gravity: 'Média' as NCGravity,
    audit_plan_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const tenantId = user?.app_metadata?.tenant_id as string | undefined;
    if (!tenantId) {
      setError('Tenant indisponível na sessão autenticada.');
      setLoading(false);
      return;
    }

    const payload: NonConformityInsert = {
      ...formData,
      tenant_id: tenantId,
      identified_by_id: user?.id || profile.id,
      status: 'Aberta',
      audit_plan_id: formData.audit_plan_id || null,
    };

    try {
      const { error: insertError } = await supabase.from('non_conformities').insert(payload);
      if (insertError) {
        throw new Error(insertError.message || 'Falha ao registrar NC.');
      }

      // Grant XP if the user is a student (Quality Report Bonus)
      fetch('/api/gamification/grant-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.id,
          amount: 500,
          source: 'QUALITY_REPORT',
          description: `Bônus por reportar NC: ${formData.description.substring(0, 30)}...`
        })
      });

      // Gamification: Trigger Badge Check (Detetive do Tatame)
      if (formData.description.toLowerCase().includes('equipamento') || formData.description.toLowerCase().includes('máquina')) {
          fetch('/api/gamification/check-badges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: profile.id,
              event_type: 'NC_REPORTED_EQUIPMENT',
              data: { description: formData.description }
            })
          });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          source: 'Professor',
          description: '',
          immediate_action: '',
          gravity: 'Média',
          audit_plan_id: ''
        });
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#141414]/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8"
      >
        <div className="flex items-center justify-between border-b border-[#141414]/5 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Registro de Ocorrência</span>
            </div>
            <h2 className="text-3xl font-serif italic text-[#141414]">Não Conformidade (NC)</h2>
            <p className="text-xs font-mono text-[#141414]/40 uppercase tracking-widest">Procedimento POP.SGQ.12</p>
          </div>
          <div className="p-4 bg-[#141414] text-white rounded-3xl">
             <AlertTriangle className="w-8 h-8" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Fonte da NC */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Fonte da Ocorrência</label>
              <select 
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as NCSource })}
                className="w-full p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none font-serif italic text-sm focus:bg-[#E4E3E0]/50 transition-all border border-transparent focus:border-[#141414]/10"
              >
                <option value="Professor">Professor</option>
                <option value="Aluno/Reclamação">Aluno / Reclamação</option>
                <option value="Auditoria Interna">Auditoria Interna</option>
                <option value="Indicador">Indicador</option>
                <option value="Incidente">Incidente</option>
              </select>
            </div>

            {/* Gravidade */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Gravidade</label>
              <select 
                value={formData.gravity}
                onChange={(e) => setFormData({ ...formData, gravity: e.target.value as NCGravity })}
                className={`w-full p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none font-serif italic text-sm focus:bg-[#E4E3E0]/50 transition-all border border-transparent focus:border-[#141414]/10 ${
                  formData.gravity === 'Crítica' ? 'text-red-600 font-bold' : ''
                }`}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {formData.source === 'Auditoria Interna' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                  <ClipboardList className="w-3 h-3" /> ID da Auditoria (Opcional)
                </label>
                <input 
                  type="text"
                  value={formData.audit_plan_id}
                  onChange={(e) => setFormData({ ...formData, audit_plan_id: e.target.value })}
                  placeholder="Vincular ao Bloco 7..."
                  className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none text-xs font-mono border border-blue-100"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex justify-between">
              <span>Descrição da Falha</span>
              <span className="text-red-500 font-bold">* OBRIGATÓRIO</span>
            </label>
            <textarea 
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o não atendimento ao requisito do SGQ..."
              className="w-full p-6 bg-[#E4E3E0]/30 rounded-3xl outline-none text-sm h-32 focus:bg-[#E4E3E0]/50 transition-all font-serif italic leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex justify-between">
              <span>Ação Imediata</span>
              <span className="text-red-500 font-bold">* OBRIGATÓRIO</span>
            </label>
            <textarea 
              required
              value={formData.immediate_action}
              onChange={(e) => setFormData({ ...formData, immediate_action: e.target.value })}
              placeholder="Ex: Isolar equipamento, suspender atividade, informar aluno..."
              className="w-full p-6 bg-[#E4E3E0]/30 rounded-3xl outline-none text-sm h-24 focus:bg-[#E4E3E0]/50 transition-all font-serif italic leading-relaxed"
            />
          </div>

          <div className="pt-6 border-t border-[#141414]/5 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase border border-red-100">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase border border-green-100">
                <Info className="w-4 h-4" /> NC Registrada e Gestão Notificada via API.
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || success}
              className="w-full py-5 bg-[#141414] text-white rounded-3xl font-bold uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Registrar Não Conformidade</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
