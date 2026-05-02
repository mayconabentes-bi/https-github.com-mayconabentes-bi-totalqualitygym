import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, query, where, onSnapshot, doc, 
  updateDoc, getDocs 
} from 'firebase/firestore';
import { NonConformity, UserProfile, Ishikawa6M, CorrectiveAction, ActionPlanItem, EffectivenessVerification } from '../types';
import { 
  AlertTriangle, ShieldAlert, ChevronRight, 
  Clock, CheckCircle, FileX, Filter, 
  BrainCircuit, ArrowRight, ClipboardList, 
  ShieldCheck, Search, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import IshikawaAnalysis from './IshikawaAnalysis';
import ActionPlanForm from './ActionPlanForm';
import EffectivenessVerificationForm from './EffectivenessVerificationForm';

interface Props {
  profile: UserProfile;
}

export default function RACManagement({ profile }: Props) {
  const [ncs, setNcs] = useState<NonConformity[]>([]);
  const [racs, setRacs] = useState<CorrectiveAction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNc, setSelectedNc] = useState<NonConformity | null>(null);
  const [selectedRac, setSelectedRac] = useState<CorrectiveAction | null>(null);
  
  const [viewState, setViewState] = useState<'LIST' | 'ISHIKAWA' | 'PLAN' | 'VERIFY'>('LIST');
  const [saving, setSaving] = useState(false);

  // Buffer for progressive creation
  const [tempIshikawa, setTempIshikawa] = useState<{ analysis: Ishikawa6M, rootCause: string } | null>(null);

  useEffect(() => {
    // Lead Users for responsibles
    getDocs(query(collection(db, 'users'), where('tenantId', '==', profile.tenantId))).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile)));
    });

    const unsubNCs = onSnapshot(query(
      collection(db, 'tenants', profile.tenantId, 'non_conformities'),
      where('status', 'in', ['Aberta', 'Em Análise', 'RAC Aberta'])
    ), (snap) => {
      setNcs(snap.docs.map(d => ({ id: d.id, ...d.data() } as NonConformity)));
    });

    const unsubRACs = onSnapshot(collection(db, 'tenants', profile.tenantId, 'corrective_actions'), (snap) => {
      setRacs(snap.docs.map(d => ({ id: d.id, ...d.data() } as CorrectiveAction)));
      setLoading(false);
    });

    return () => { unsubNCs(); unsubRACs(); };
  }, [profile.tenantId]);

  const handleSaveIshikawa = (analysis: Ishikawa6M, rootCause: string) => {
    setTempIshikawa({ analysis, rootCause });
    setViewState('PLAN');
  };

  const handleSavePlan = async (actionPlan: ActionPlanItem[]) => {
    if (!selectedNc || !tempIshikawa) return;
    setSaving(true);
    
    try {
      const racId = Math.random().toString(36).substr(2, 9);
      const racData: Omit<CorrectiveAction, 'id'> = {
        ncId: selectedNc.id,
        tenantId: profile.tenantId,
        identifiedById: profile.id,
        analysis6M: tempIshikawa.analysis,
        rootCause: tempIshikawa.rootCause,
        proposedAction: actionPlan.map(a => a.action).join(', '),
        actionPlan,
        status: 'IMPLEMENTING',
        createdAt: new Date().toISOString()
      };

      // Call API to schedule 30-day verification
      await fetch('/api/rac/implement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rac_id: racId, tenant_id: profile.tenantId, action_plan: actionPlan })
      });

      // Save to DB
      await updateDoc(doc(db, 'tenants', profile.tenantId, 'corrective_actions', racId), racData as any);
      await updateDoc(doc(db, 'tenants', profile.tenantId, 'non_conformities', selectedNc.id), { status: 'RAC Aberta' });

      setViewState('LIST');
      setSelectedNc(null);
      setTempIshikawa(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (verification: EffectivenessVerification) => {
    if (!selectedRac) return;
    setSaving(true);
    try {
      const response = await fetch('/api/rac/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rac_id: selectedRac.id, tenant_id: profile.tenantId, verification })
      });
      const text = await response.text();
      const result = text ? JSON.parse(text) : { status: 'PENDING' };

      await updateDoc(doc(db, 'tenants', profile.tenantId, 'corrective_actions', selectedRac.id), {
        verification,
        status: result.status
      });

      if (result.status === 'CLOSED') {
        await updateDoc(doc(db, 'tenants', profile.tenantId, 'non_conformities', selectedRac.ncId), { status: 'Concluída' });
        
        // Gamification: Trigger Badge Check (Mestre do PDCA)
        const daysToClose = Math.floor((new Date().getTime() - new Date(selectedRac.createdAt).getTime()) / (1000 * 3600 * 24));
        fetch('/api/gamification/check-badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: profile.id,
            event_type: 'RAC_CLOSED_SUCCESS',
            data: {
              daysToClose,
              effectivenessVerified: verification.isEffective
            }
          })
        });
      }

      setViewState('LIST');
      setSelectedRac(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">CARREGANDO GESTÃO DE QUALIDADE...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <AnimatePresence mode="wait">
        {viewState === 'LIST' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif italic text-[#141414]">Gestão de Qualidade & RAC</h2>
                <p className="text-xs font-mono text-[#141414]/40 uppercase tracking-widest">Procedimento POP.SGQ.12</p>
              </div>
            </div>

            {/* Pendências de NCs (Abertura de RAC) */}
            <section className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> NCs Aguardando Análise (Ishikawa)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {ncs.filter(n => n.status === 'Aberta' || n.status === 'Em Análise').map(nc => (
                  <NCListItem 
                    key={nc.id} 
                    nc={nc} 
                    onAction={() => { setSelectedNc(nc); setViewState('ISHIKAWA'); }} 
                  />
                ))}
                {ncs.filter(n => n.status === 'Aberta' || n.status === 'Em Análise').length === 0 && (
                  <p className="text-sm font-serif italic text-[#141414]/30 p-10 border-2 border-dashed border-[#141414]/5 rounded-[2rem] text-center">Nenhuma NC pendente de análise.</p>
                )}
              </div>
            </section>

            {/* RACs em Curso */}
            <section className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                <History className="w-4 h-4" /> Ações Corretivas em Andamento (RACs)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {racs.map(rac => (
                   <RACCard 
                     key={rac.id} 
                     rac={rac} 
                     onVerify={() => { setSelectedRac(rac); setViewState('VERIFY'); }} 
                   />
                 ))}
                 {racs.length === 0 && (
                   <div className="col-span-full p-20 text-center bg-[#141414]/5 rounded-[3rem]">
                      <p className="text-sm font-serif italic text-[#141414]/30">Nenhum Registro de Ação Corretiva ativo.</p>
                   </div>
                 )}
              </div>
            </section>
          </motion.div>
        )}

        {viewState === 'ISHIKAWA' && (
           <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
             <div className="bg-[#141414] text-white p-6 rounded-2xl flex items-center gap-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <p className="text-xs font-serif italic opacity-80">NC: {selectedNc?.description}</p>
             </div>
             <IshikawaAnalysis onSave={handleSaveIshikawa} onCancel={() => setViewState('LIST')} />
           </motion.div>
        )}

        {viewState === 'PLAN' && (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ActionPlanForm users={users} onSave={handleSavePlan} onCancel={() => setViewState('ISHIKAWA')} />
           </motion.div>
        )}

        {viewState === 'VERIFY' && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EffectivenessVerificationForm 
                verifierId={profile.id} 
                onVerify={handleVerify} 
                onCancel={() => setViewState('LIST')} 
              />
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NCListItem = ({ nc, onAction }: { nc: NonConformity, onAction: () => void, key?: any }) => {
  return (
    <div className="bg-white border border-[#141414]/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-[#141414]/40 transition-all shadow-sm">
      <div className={`p-3 rounded-lg ${nc.gravity === 'Crítica' ? 'bg-red-50 text-red-600' : 'bg-[#141414]/5 text-[#141414]'}`}>
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{nc.source}</span>
           <span className="px-2 py-0.5 bg-[#141414]/5 text-[#141414] text-[8px] rounded-full uppercase font-bold">{nc.gravity}</span>
        </div>
        <h4 className="text-base font-serif italic text-[#141414]">{nc.description}</h4>
      </div>
      <button 
        onClick={onAction}
        className="px-6 py-3 bg-[#141414] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
      >
        <BrainCircuit className="w-4 h-4" /> Iniciar Ishikawa
      </button>
    </div>
  );
};

const RACCard = ({ rac, onVerify }: { rac: CorrectiveAction, onVerify: () => void, key?: any }) => {
  const statusStyles = {
    PLANNING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    IMPLEMENTING: 'bg-blue-50 text-blue-700 border-blue-200',
    VERIFYING: 'bg-purple-50 text-purple-700 border-purple-200',
    CLOSED: 'bg-green-50 text-green-700 border-green-200',
    REOPENED: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="bg-white border border-[#141414]/10 rounded-[2rem] p-8 space-y-6 group hover:shadow-xl transition-all">
       <div className="flex items-start justify-between">
          <div className="space-y-1">
             <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${statusStyles[rac.status]}`}>
                {rac.status}
             </span>
             <h4 className="text-xl font-serif italic text-[#141414] leading-tight mt-2">{rac.rootCause}</h4>
          </div>
          <div className="p-3 bg-[#141414]/5 rounded-xl text-[#141414]/30 group-hover:text-[#141414] transition-colors">
             <ClipboardList className="w-6 h-6" />
          </div>
       </div>

       <div className="space-y-4">
          <p className="text-xs text-[#141414]/60 line-clamp-2">Ações: {rac.proposedAction}</p>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 pt-4 border-t border-[#141414]/5">
             <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" /> {new Date(rac.createdAt).toLocaleDateString()}
             </div>
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Eficácia: {rac.verification ? (rac.verification.isEffective ? 'OK' : 'FAIL') : 'Pend.'}
             </div>
          </div>
       </div>

       {(rac.status === 'IMPLEMENTING' || rac.status === 'VERIFYING') && (
         <button 
           onClick={onVerify}
           className="w-full py-4 bg-[#141414] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-black transition-all"
         >
           <Search className="w-4 h-4" /> Verificar Eficácia
         </button>
       )}
    </div>
  );
};
