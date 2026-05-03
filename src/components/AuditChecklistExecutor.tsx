import React, { useState, useEffect, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/supabase';
import { 
  collection, query, onSnapshot, doc, updateDoc, 
  setDoc, getDocs, deleteDoc 
} from '@/lib/supabase';
import { 
  AuditPlan, AuditChecklistItem, AuditResponse, AuditItemStatus, UserProfile 
} from '../types';
import { 
  CheckCircle2, XCircle, MinusCircle, Camera, 
  MessageSquare, Save, ChevronLeft, Award, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  profile: UserProfile;
  plan: AuditPlan;
  onBack: () => void;
}

export default function AuditChecklistExecutor({ profile, plan, onBack }: Props) {
  const [items, setItems] = useState<AuditChecklistItem[]>([]);
  const [responses, setResponses] = useState<Record<string, AuditResponse>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1. Load Checklist Items (Templates)
    const unsubItems = onSnapshot(collection(db, 'tenants', profile.tenantId, 'audit_checklists'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditChecklistItem));
      setItems(data);
      
      // Seed initial items if none exist for demo
      if (data.length === 0) {
        seedSampleItems();
      }
    });

    // 2. Load Existing Responses for this Plan
    const unsubResponses = onSnapshot(collection(db, 'tenants', profile.tenantId, 'audit_plans', plan.id, 'responses'), (snap) => {
      const data: Record<string, AuditResponse> = {};
      snap.docs.forEach(d => {
        const resp = { id: d.id, ...d.data() } as AuditResponse;
        data[resp.itemId] = resp;
      });
      setResponses(data);
    });

    setLoading(false);
    return () => {
      unsubItems();
      unsubResponses();
    };
  }, [profile.tenantId, plan.id]);

  const seedSampleItems = async () => {
    const samples = [
      { requirement: 'POL-AF-001', itemToVerify: 'Conhecimento da Política', evidenceToLookFor: 'Entrevista com 2 colaboradores sobre os valores da qualidade.' },
      { requirement: 'Infraestrutura', itemToVerify: 'Manutenção de Tatames', evidenceToLookFor: 'Tatames sem rasgos e devidamente higienizados.' },
      { requirement: 'Secretaria', itemToVerify: 'Contratos Assinados', evidenceToLookFor: 'Amostra de 5 contratos com assinatura de ambas as partes.' },
    ];
    for (const s of samples) {
      await setDoc(doc(collection(db, 'tenants', profile.tenantId, 'audit_checklists')), s);
    }
  };

  const handleUpdateResponse = async (itemId: string, status: AuditItemStatus, observations: string = '') => {
    const existing = responses[itemId];
    const responseId = existing?.id || itemId; // Use itemId as docId if new
    
    const data: Omit<AuditResponse, 'id'> = {
      planId: plan.id,
      itemId,
      status,
      observations,
      auditorId: profile.id,
      tenantId: profile.tenantId
    };

    try {
      await setDoc(doc(db, 'tenants', profile.tenantId, 'audit_plans', plan.id, 'responses', responseId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'audit_responses');
    }
  };

  const score = useMemo(() => {
    const total = items.length;
    if (total === 0) return 0;
    
    const answeredItems = items.filter(i => responses[i.id]);
    const naCount = answeredItems.filter(i => responses[i.id].status === 'NA').length;
    const cCount = answeredItems.filter(i => responses[i.id].status === 'C').length;
    
    const divisor = total - naCount;
    if (divisor <= 0) return 100;
    
    return (cCount / divisor) * 100;
  }, [items, responses]);

  const allAnswered = items.length > 0 && items.every(i => responses[i.id]);

  const handleCompleteAudit = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId, 'audit_plans', plan.id), {
        status: 'COMPLETED',
        finalScore: score,
        completedAt: new Date().toISOString()
      });

      // Gamification: Trigger Badge Check
      fetch('/api/gamification/check-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.id,
          event_type: 'AUDIT_CLOSED',
          data: {
            conformityScore: score,
            identifiedCriticalMissingInPrevious: score > 90 // Simulated logic
          }
        })
      });

      onBack();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'audit_plans');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">CARREGANDO CHECKLIST...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-[#141414]/5 rounded-xl transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-serif italic text-[#141414]">Execução de Auditoria</h2>
          <p className="text-xs font-mono text-[#141414]/50 uppercase">{plan.scope}</p>
        </div>
      </div>

      {/* Score and Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141414] text-white p-8 rounded-3xl shadow-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Score de Conformidade</p>
            <h3 className="text-4xl font-serif italic">{Math.round(score)}%</h3>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl">
            <Award className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white border border-[#141414]/10 p-8 rounded-3xl flex flex-col justify-center gap-2">
            <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold font-mono">Progresso da Sessão</p>
            <div className="h-2 w-full bg-[#E4E3E0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#141414] transition-all duration-500" 
                  style={{ width: `${(Object.keys(responses).length / (items.length || 1)) * 100}%` }} 
                />
            </div>
            <p className="text-xs font-bold text-[#141414]/60">{Object.keys(responses).length} de {items.length} itens verificados</p>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <ChecklistItemRow 
            key={item.id}
            index={idx + 1}
            item={item}
            response={responses[item.id]}
            onUpdate={handleUpdateResponse}
          />
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-4 py-8 border-t border-[#141414]/10">
        {!allAnswered && (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Preencha todos os itens para finalizar</span>
          </div>
        )}
        <button
          onClick={handleCompleteAudit}
          disabled={!allAnswered || saving}
          className="px-10 py-4 bg-[#141414] text-white rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? 'Salvando...' : (
            <>Finalizar e Emitir Laudo <Save className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}

function ChecklistItemRow({ item, index, response, onUpdate }: { 
  item: AuditChecklistItem, 
  index: number, 
  response?: AuditResponse,
  onUpdate: (id: string, status: AuditItemStatus, obs: string) => void,
  key?: React.Key
}) {
  const [obs, setObs] = useState(response?.observations || '');
  const [showObs, setShowObs] = useState(!!response?.observations || response?.status === 'NC');

  const handleStatusChange = (status: AuditItemStatus) => {
    onUpdate(item.id, status, obs);
    if (status === 'NC') setShowObs(true);
  };

  return (
    <div className={`bg-white border transition-all rounded-3xl overflow-hidden ${response ? 'border-[#141414]/20' : 'border-[#141414]/5'}`}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#E4E3E0] px-2 py-0.5 rounded-full">{index}</span>
              <h4 className="text-sm font-bold text-[#141414]">{item.requirement}</h4>
            </div>
            <p className="text-lg font-serif italic text-[#141414]/80">{item.itemToVerify}</p>
            <p className="text-xs text-[#141414]/50 leading-relaxed italic border-l-2 border-[#141414]/10 pl-3">
              Evidência sugerida: {item.evidenceToLookFor}
            </p>
          </div>

          <div className="flex md:flex-col gap-2 justify-center">
            <StatusButton 
              active={response?.status === 'C'} 
              color="green" 
              onClick={() => handleStatusChange('C')}
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Conforme"
            />
            <StatusButton 
              active={response?.status === 'NC'} 
              color="red" 
              onClick={() => handleStatusChange('NC')}
              icon={<XCircle className="w-5 h-5" />}
              label="Não-Conforme"
            />
            <StatusButton 
              active={response?.status === 'NA'} 
              color="gray" 
              onClick={() => handleStatusChange('NA')}
              icon={<MinusCircle className="w-5 h-5" />}
              label="N/A"
            />
          </div>
        </div>

        <AnimatePresence>
          {showObs && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 pt-6 border-t border-[#141414]/5 overflow-hidden"
            >
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 flex items-center justify-between">
                            <span>Observações / Descrição da Falha</span>
                            {response?.status === 'NC' && <span className="text-red-500 font-bold">* OBRIGATÓRIO</span>}
                        </label>
                        <textarea 
                            value={obs}
                            onChange={(e) => setObs(e.target.value)}
                            onBlur={() => onUpdate(item.id, response?.status || 'C', obs)}
                            className="w-full p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none text-sm h-24 transition-all focus:bg-[#E4E3E0]/50"
                            placeholder="Descreva a evidência ou o motivo da não-conformidade..."
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#E4E3E0] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#141414]/60 hover:bg-[#141414]/5 transition-all">
                            <Camera className="w-4 h-4" /> Anexar Foto
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#E4E3E0] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#141414]/60 hover:bg-[#141414]/5 transition-all">
                            <MessageSquare className="w-4 h-4" /> Adicionar Comentário
                        </button>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusButton({ active, color, onClick, icon, label }: { 
  active: boolean, color: 'green' | 'red' | 'gray', onClick: () => void, icon: React.ReactNode, label: string 
}) {
  const styles = {
    green: active ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'border-green-600 text-green-600 hover:bg-green-50',
    red: active ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'border-red-600 text-red-600 hover:bg-red-50',
    gray: active ? 'bg-gray-600 border-gray-600 text-white shadow-lg' : 'border-gray-600 text-gray-600 hover:bg-gray-50',
  };

  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 border-2 rounded-xl transition-all flex items-center justify-center gap-2 group ${styles[color]}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{label}</span>
    </button>
  );
}
