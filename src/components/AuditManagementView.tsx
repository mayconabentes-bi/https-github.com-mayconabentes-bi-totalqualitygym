import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/supabase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs, orderBy, collectionGroup } from '@/lib/supabase';
import { AuditProgram, AuditPlan, AuditScheduleItem, UserProfile, AuditStatus } from '../types';
import { 
  Calendar, ClipboardList, CheckCircle, Clock, AlertCircle, 
  Plus, User, Target, Layers, ChevronRight, FileCheck, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import AuditChecklistExecutor from './AuditChecklistExecutor';
import AuditReportView from './AuditReportView';

interface Props {
  profile: UserProfile;
}

export default function AuditManagementView({ profile }: Props) {
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AuditProgram | null>(null);
  const [activePlan, setActivePlan] = useState<AuditPlan | null>(null);
  const [activeReport, setActiveReport] = useState<AuditPlan | null>(null);

  const isDirector = ['direction', 'partner'].includes(profile.role);
  const canPlan = ['direction', 'partner', 'technical_advice'].includes(profile.role);

  useEffect(() => {
    const unsubPrograms = onSnapshot(query(
      collection(db, 'tenants', profile.tenantId, 'audit_programs'),
      orderBy('year', 'desc')
    ), (snap) => {
      setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditProgram)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'audit_programs'));

    const unsubPlans = onSnapshot(query(
      collection(db, 'tenants', profile.tenantId, 'audit_plans'),
      orderBy('startTime', 'desc')
    ), (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditPlan)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'audit_plans'));

    setLoading(false);
    return () => {
      unsubPrograms();
      unsubPlans();
    };
  }, [profile.tenantId]);

  const handleHomologate = async (planId: string) => {
    if (!isDirector) return;
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId, 'audit_plans', planId), {
        status: 'SCHEDULED' as AuditStatus,
        homologatedBy: profile.displayName,
        homologatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'audit_plans');
    }
  };

  const handleStartAudit = async (plan: AuditPlan) => {
    if (plan.status === 'SCHEDULED') {
      try {
        await updateDoc(doc(db, 'tenants', profile.tenantId, 'audit_plans', plan.id), {
          status: 'IN_PROGRESS' as AuditStatus
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'audit_plans');
      }
    }
    setActivePlan(plan);
  };

  if (activePlan) {
    return <AuditChecklistExecutor profile={profile} plan={activePlan} onBack={() => setActivePlan(null)} />;
  }

  if (activeReport) {
    return <AuditReportView profile={profile} plan={activeReport} onBack={() => setActiveReport(null)} />;
  }

  if (loading) return <div className="p-8 text-center font-mono animate-pulse">CARREGANDO MÓDULO DE AUDITORIA...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic text-[#141414]">Auditoria Interna SGQ</h2>
          <p className="text-xs font-mono text-[#141414]/50 uppercase tracking-widest">Contratos de Execução e Conformidade</p>
        </div>
        {canPlan && (
           <button 
             onClick={() => { setSelectedProgram(null); setShowPlanModal(true); }}
             className="px-6 py-2 bg-[#141414] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
           >
             <Plus className="w-4 h-4" /> Novo Programa
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Programs Index */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414]/40 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Programa Anual ({new Date().getFullYear()})
          </h3>
          <div className="space-y-3">
            {programs.map((prog) => (
              <div key={prog.id} className="bg-white p-4 rounded-2xl border border-[#141414]/10 shadow-sm flex items-center justify-between group hover:border-[#141414]/30 transition-all">
                <div>
                  <p className="text-sm font-bold text-[#141414]">{prog.processName}</p>
                  <p className="text-[10px] font-mono text-[#141414]/50">Previsto: {new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2022, prog.targetMonth - 1))}</p>
                </div>
                <button 
                  onClick={() => { setSelectedProgram(prog); setShowPlanModal(true); }}
                  className="p-2 opacity-0 group-hover:opacity-100 bg-[#E4E3E0] rounded-lg transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {programs.length === 0 && <p className="text-xs italic text-[#141414]/30">Nenhum programa cadastrado.</p>}
          </div>
        </div>

        {/* Audit Plans Execution */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414]/40 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Planos de Auditoria (Eventos)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan) => (
              <AuditPlanCard 
                key={plan.id} 
                plan={plan} 
                isDirector={isDirector}
                onHomologate={() => handleHomologate(plan.id)}
                onExecute={() => handleStartAudit(plan)}
                onViewReport={() => setActiveReport(plan)}
              />
            ))}
            {plans.length === 0 && (
              <div className="p-12 border-2 border-dashed border-[#141414]/10 rounded-3xl text-center">
                <Clock className="w-8 h-8 text-[#141414]/20 mx-auto mb-4" />
                <p className="text-sm text-[#141414]/40">Aguardando definição de Planos de Auditoria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPlanModal && (
          <AuditModal 
            profile={profile}
            selectedProgram={selectedProgram}
            onClose={() => setShowPlanModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface AuditPlanCardProps {
  plan: AuditPlan;
  isDirector: boolean;
  onHomologate: () => void | Promise<void>;
  onExecute: () => void | Promise<void>;
  onViewReport: () => void;
  key?: React.Key;
}

function AuditPlanCard({ plan, isDirector, onHomologate, onExecute, onViewReport }: AuditPlanCardProps) {
  const statusStyles: Record<AuditStatus, string> = {
    DRAFT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="bg-white border border-[#141414]/10 rounded-3xl overflow-hidden shadow-sm group">
      <div className="p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyles[plan.status]}`}>
                  {plan.status === 'DRAFT' ? 'Aguardando Homologação' : plan.status}
                </span>
                {(plan as any).finalScore !== undefined && (
                  <span className="bg-[#141414] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Score: {Math.round((plan as any).finalScore)}%
                  </span>
                )}
              </div>
              <h4 className="text-xl font-serif italic text-[#141414]">{plan.scope}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-[#141414]/40 uppercase">Início Previsto</p>
              <p className="text-sm font-bold">{new Date(plan.startTime).toLocaleString('pt-BR')}</p>
            </div>
          </div>
          {/* ... existing card code ... */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#141414]/5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#141414]/30" />
              <div>
                <p className="text-[10px] uppercase text-[#141414]/40">Auditor Líder</p>
                <p className="text-xs font-bold">{plan.auditorLeaderName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#141414]/30" />
              <div>
                <p className="text-[10px] uppercase text-[#141414]/40">Objetivo</p>
                <p className="text-xs font-medium truncate w-40">{plan.objectives}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-48 flex flex-col justify-center gap-3">
          {plan.status === 'DRAFT' && isDirector && (
            <button 
              onClick={onHomologate}
              className="w-full py-3 bg-[#141414] text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-3.5 h-3.5" /> Homologar
            </button>
          )}
          {(plan.status === 'SCHEDULED' || plan.status === 'IN_PROGRESS') && (
            <button 
              onClick={onExecute}
              className="w-full py-3 bg-[#141414] text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              {plan.status === 'IN_PROGRESS' ? 'Retomar Execução' : 'Iniciar Execução'}
            </button>
          )}
          {plan.homologatedBy && (
            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
               <p className="text-[9px] uppercase text-green-800/60 font-bold mb-1">Homologado por:</p>
               <p className="text-[11px] font-bold text-green-800">{plan.homologatedBy}</p>
            </div>
          )}
          {plan.status === 'COMPLETED' && (
            <button 
              onClick={onViewReport}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" /> Ver Relatório
            </button>
          )}
          <button className="w-full py-3 border border-[#141414]/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#141414]/5 transition-all">
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditModal({ profile, selectedProgram, onClose }: { profile: UserProfile, selectedProgram: AuditProgram | null, onClose: () => void }) {
  const [mode, setMode] = useState<'PROGRAM' | 'PLAN'>(selectedProgram ? 'PLAN' : 'PROGRAM');
  const [formData, setFormData] = useState({
    processName: selectedProgram?.processName || '',
    targetMonth: selectedProgram?.targetMonth || 1,
    scope: '',
    objectives: '',
    startTime: '',
    endTime: '',
    auditorLeaderId: profile.id,
    auditorLeaderName: profile.displayName
  });

  const handleSubmit = async () => {
    try {
      if (mode === 'PROGRAM') {
        const progData: Omit<AuditProgram, 'id'> = {
          tenantId: profile.tenantId,
          year: new Date().getFullYear(),
          processName: formData.processName,
          targetMonth: formData.targetMonth
        };
        await addDoc(collection(db, 'tenants', profile.tenantId, 'audit_programs'), progData);
      } else {
        // Validation: Logic to prevent creation if outside target month
        if (selectedProgram) {
            const planMonth = new Date(formData.startTime).getMonth() + 1;
            if (planMonth !== selectedProgram.targetMonth) {
                alert(`ERRO DE CONFORMIDADE: Este plano deve ser agendado no mês de ${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2022, selectedProgram.targetMonth - 1))}.`);
                return;
            }
        }

        // Check for Auditor conflicts
        const q = query(
            collection(db, 'tenants', profile.tenantId, 'audit_plans'),
            where('auditorLeaderId', '==', formData.auditorLeaderId),
            where('status', 'in', ['SCHEDULED', 'IN_PROGRESS'])
        );
        const existing = await getDocs(q);
        const hasConflict = existing.docs.some(d => {
          const p = d.data() as unknown as AuditPlan;
            const start = new Date(formData.startTime);
            const end = new Date(formData.endTime);
            const pStart = new Date(p.startTime);
            const pEnd = new Date(p.endTime);
            return (start < pEnd && end > pStart);
        });

        if (hasConflict) {
            alert('CONFLITO DE AGENDA: O Auditor Líder já possui uma auditoria neste horário.');
            return;
        }

        const planData: Omit<AuditPlan, 'id'> = {
          programId: selectedProgram?.id || 'manual',
          tenantId: profile.tenantId,
          status: 'DRAFT',
          auditorLeaderId: formData.auditorLeaderId,
          auditorLeaderName: formData.auditorLeaderName,
          scope: formData.scope,
          objectives: formData.objectives,
          startTime: formData.startTime,
          endTime: formData.endTime
        };
        await addDoc(collection(db, 'tenants', profile.tenantId, 'audit_plans'), planData);
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, mode === 'PROGRAM' ? 'audit_programs' : 'audit_plans');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-xl font-serif italic text-[#141414]">
              {mode === 'PROGRAM' ? 'Novo Programa Anual' : `Agendar Plano: ${selectedProgram?.processName}`}
            </h3>
            <p className="text-[10px] font-mono text-[#141414]/40 uppercase tracking-widest">
              {mode === 'PROGRAM' ? 'Planejamento de Conformidade' : 'Instância de Auditoria Técnica'}
            </p>
          </div>

          <div className="space-y-4">
            {mode === 'PROGRAM' ? (
              <>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase opacity-50">Nome do Processo</label>
                   <input 
                     type="text" 
                     value={formData.processName}
                     onChange={(e) => setFormData({...formData, processName: e.target.value})}
                     className="w-full p-4 bg-[#E4E3E0]/30 rounded-xl outline-none" 
                     placeholder="Ex: Gestão de Secretaria"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase opacity-50">Mês Previsto</label>
                   <select 
                     value={formData.targetMonth}
                     onChange={(e) => setFormData({...formData, targetMonth: parseInt(e.target.value)})}
                     className="w-full p-4 bg-[#E4E3E0]/30 rounded-xl outline-none"
                   >
                     {Array.from({length: 12}).map((_, i) => (
                       <option key={i+1} value={i+1}>{new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2022, i))}</option>
                     ))}
                   </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase opacity-50">Escopo da Auditoria</label>
                   <input 
                     type="text" 
                     value={formData.scope}
                     onChange={(e) => setFormData({...formData, scope: e.target.value})}
                     className="w-full p-4 bg-[#E4E3E0]/30 rounded-xl outline-none" 
                     placeholder="Ex: Verificação de documentos de matrícula"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase opacity-50">Objetivos</label>
                   <textarea 
                     value={formData.objectives}
                     onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                     className="w-full p-4 bg-[#E4E3E0]/30 rounded-xl outline-none h-24" 
                     placeholder="Ex: Garantir conformidade com a LGPD e POL-AF-001"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase opacity-50">Início</label>
                     <input 
                       type="datetime-local" 
                       value={formData.startTime}
                       onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                       className="w-full p-4 bg-[#E4E3E0]/30 rounded-xl outline-none text-xs" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase opacity-50">Fim</label>
                     <input 
                       type="datetime-local" 
                       value={formData.endTime}
                       onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                       className="w-full p-4 bg-[#E4E3E0]/30 rounded-xl outline-none text-xs" 
                     />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-[#E4E3E0] text-[#141414] rounded-2xl font-bold uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-1 py-4 bg-[#141414] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg"
            >
              {mode === 'PROGRAM' ? 'Cadastrar Programa' : 'Agendar Plano'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
