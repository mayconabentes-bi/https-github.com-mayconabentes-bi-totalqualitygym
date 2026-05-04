import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/supabase';
import { 
  collection, query, where, getDocs, doc, setDoc, 
  updateDoc, onSnapshot 
} from '@/lib/supabase';
import { 
  AuditPlan, AuditReport, AuditResponse, AuditChecklistItem, UserProfile, AuditorEvaluation 
} from '../types';
import { 
  FileText, ShieldCheck, AlertCircle, CheckCircle2, 
  ChevronLeft, Printer, Send, Save, Award, Info, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuditorEvaluationForm from './AuditorEvaluationForm';

interface Props {
  profile: UserProfile;
  plan: AuditPlan;
  onBack: () => void;
}

export default function AuditReportView({ profile, plan, onBack }: Props) {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [alreadyEvaluated, setAlreadyEvaluated] = useState(false);

  // Local state for editing draft
  const [summary, setSummary] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [strengths, setStrengths] = useState<string[]>(['']);
  const [opportunities, setOpportunities] = useState<string[]>(['']);

  const isDirector = ['direction', 'partner'].includes(profile.role);
  const isAuditor = plan.auditorLeaderId === profile.id || ['direction', 'partner', 'technical_advice'].includes(profile.role);

  useEffect(() => {
    const unsub = onSnapshot(query(
      collection(db, 'tenants', profile.tenantId, 'audit_reports'),
      where('planId', '==', plan.id)
    ), (snap) => {
      if (snap.docs.length > 0) {
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as AuditReport;
        setReport(data);
        setSummary(data.summary);
        setConclusion(data.conclusion);
        setStrengths(data.strengths.length > 0 ? data.strengths : ['']);
        setOpportunities(data.improvementOpportunities.length > 0 ? data.improvementOpportunities : ['']);
        
        // Check if current user already evaluated this auditor for this report
        checkEvaluation(data.id);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [profile.tenantId, plan.id]);

  const checkEvaluation = async (reportId: string) => {
    const q = query(
      collection(db, 'tenants', profile.tenantId, 'auditor_evaluations'),
      where('reportId', '==', reportId),
      where('auditeeId', '==', profile.id)
    );
    const snap = await getDocs(q);
    setAlreadyEvaluated(snap.docs.length > 0);
  };

  const generateReportDraft = async () => {
    setLoading(true);
    try {
      // 1. Fetch Responses
      const respSnap = await getDocs(collection(db, 'tenants', profile.tenantId, 'audit_plans', plan.id, 'responses'));
      const responses = respSnap.docs.map(d => d.data() as unknown as AuditResponse);
      const nCs = responses.filter(r => r.status === 'NC');

      // 2. Fetch Checklist Items to get requirements/descriptions
      const itemSnap = await getDocs(collection(db, 'tenants', profile.tenantId, 'audit_checklists'));
      const items = itemSnap.docs.map(d => ({ id: d.id, ...d.data() } as AuditChecklistItem));

      const aggregatedNCs = nCs.map(nc => {
        const item = items.find(i => i.id === nc.itemId);
        return {
          itemId: nc.itemId,
          requirement: item?.requirement || 'N/A',
          itemToVerify: item?.itemToVerify || 'N/A',
          observations: nc.observations
        };
      });

      const reportData: Omit<AuditReport, 'id'> = {
        planId: plan.id,
        tenantId: profile.tenantId,
        summary: '',
        strengths: [],
        improvementOpportunities: [],
        conclusion: '',
        status: 'DRAFT',
        aggregatedNCs,
        score: (plan as any).finalScore || 0
      };

      await setDoc(doc(collection(db, 'tenants', profile.tenantId, 'audit_reports')), reportData);
      setEditing(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'audit_reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId, 'audit_reports', report.id), {
        summary,
        conclusion,
        strengths: strengths.filter(s => s.trim() !== ''),
        improvementOpportunities: opportunities.filter(o => o.trim() !== ''),
        updatedAt: new Date().toISOString()
      });
      setEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'audit_reports');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!report || !isDirector) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId, 'audit_reports', report.id), {
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        approverId: profile.id,
        approverName: profile.displayName
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'audit_reports');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">COMPILANDO RELATÓRIO FINAL...</div>;

  if (!report) {
    return (
      <div className="p-12 text-center bg-white border border-[#141414]/10 rounded-3xl space-y-6">
        <FileText className="w-16 h-16 text-[#141414]/10 mx-auto" />
        <div>
          <h3 className="text-xl font-serif italic">Relatório não gerado</h3>
          <p className="text-sm text-[#141414]/40 max-w-sm mx-auto mt-2">
            A auditoria foi concluída, mas o relatório final ainda não foi consolidado.
          </p>
        </div>
        {isAuditor && (
          <button 
            onClick={generateReportDraft}
            className="px-8 py-3 bg-[#141414] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg"
          >
            Gerar Relatório Agora
          </button>
        )}
        <button onClick={onBack} className="block mx-auto text-xs font-bold text-[#141414]/40 uppercase tracking-widest">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 bg-[#E4E3E0]/80 backdrop-blur-md py-4 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex gap-4">
          <button className="p-2 bg-white rounded-xl border border-[#141414]/10 shadow-sm" onClick={() => window.print()}>
            <Printer className="w-5 h-5" />
          </button>
          {report.status === 'DRAFT' && isAuditor && (
            editing ? (
              <button 
                onClick={handleSave} 
                className="px-6 py-2 bg-[#141414] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                disabled={saving}
              >
                <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="px-6 py-2 bg-[#141414] text-white rounded-xl text-xs font-bold uppercase tracking-widest">
                Editar Relatório
              </button>
            )
          )}
          {report.status === 'DRAFT' && !editing && isDirector && (
            <button 
              onClick={handleApprove}
              className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-600/20"
              disabled={saving}
            >
              <ShieldCheck className="w-4 h-4" /> {saving ? 'Processando...' : 'Homologar Relatório'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showEvalForm && (
          <div className="fixed inset-0 bg-[#E4E3E0]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <AuditorEvaluationForm 
                profile={profile}
                plan={plan}
                reportId={report.id}
                onComplete={() => {
                  setShowEvalForm(false);
                  setAlreadyEvaluated(true);
                }}
                onCancel={() => setShowEvalForm(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-[#141414]/10 rounded-[2rem] shadow-2xl overflow-hidden print:shadow-none print:border-none">
        {/* Report Header */}
        <div className="p-12 border-b border-[#141414]/10 bg-[#141414] text-white space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] opacity-50">Relatório Final de Auditoria Interna</span>
              <h1 className="text-4xl font-serif italic">{plan.scope}</h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono opacity-50 uppercase">Score de Conformidade</p>
              <p className="text-4xl font-serif italic text-yellow-400">{Math.round(report.score)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-80">
            <HeaderSection label="Auditor Líder" value={plan.auditorLeaderName} />
            <HeaderSection label="Data Execução" value={new Date(plan.startTime).toLocaleDateString()} />
            <HeaderSection label="Unidade" value="AREA FIT" />
            <HeaderSection label="Status" value={report.status} />
          </div>
        </div>

        {/* Report Body */}
        <div className="p-12 space-y-12">
          {/* Executive Summary */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
              <Info className="w-4 h-4" /> Sumário Executivo
            </h3>
            {editing ? (
              <textarea 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full h-32 p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none text-sm font-serif italic border border-[#141414]/5"
                placeholder="Descreva a visão geral da auditoria..."
              />
            ) : (
              <p className="text-lg font-serif italic text-[#141414]/80 leading-relaxed indent-8">
                {report.summary || 'Nenhum sumário redigido.'}
              </p>
            )}
          </section>

          {/* Non-Conformities Table */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Quadro de Não-Conformidades (NC)
            </h3>
            <div className="border border-[#141414]/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#141414]/5 text-[10px] uppercase font-bold text-[#141414]/60">
                  <tr>
                    <th className="px-6 py-3">Requisito</th>
                    <th className="px-6 py-3">Descrição da Falha / Evidência</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#141414]/5">
                  {report.aggregatedNCs.map((nc, i) => (
                    <tr key={i} className="hover:bg-[#141414]/2 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold w-1/4">{nc.requirement}</td>
                      <td className="px-6 py-4 text-[#141414]/70 leading-relaxed italic font-serif">
                        <p className="text-[#141414] font-bold mb-1">Item: {nc.itemToVerify}</p>
                        {nc.observations}
                      </td>
                    </tr>
                  ))}
                  {report.aggregatedNCs.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-green-600 font-bold uppercase text-xs tracking-widest">
                        Nenhuma não-conformidade detectada. Excelência operacional mantida.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-green-600 flex items-center gap-2">
                <Award className="w-4 h-4" /> Pontos Fortes
              </h3>
              {editing ? (
                <div className="space-y-2">
                  {strengths.map((s, i) => (
                    <input 
                      key={i} value={s} 
                      onChange={(e) => {
                        const newS = [...strengths];
                        newS[i] = e.target.value;
                        setStrengths(newS);
                      }}
                      className="w-full p-4 bg-[#E4E3E0]/30 rounded-xl outline-none text-xs" 
                    />
                  ))}
                  <button onClick={() => setStrengths([...strengths, ''])} className="text-[10px] font-bold uppercase">+ Adicionar</button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#141414]/70 font-medium italic font-serif">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                 <Send className="w-4 h-4" /> Oportunidades de Melhoria
              </h3>
              {editing ? (
                <div className="space-y-2">
                  {opportunities.map((o, i) => (
                    <input 
                      key={i} value={o} 
                      onChange={(e) => {
                        const newO = [...opportunities];
                        newO[i] = e.target.value;
                        setOpportunities(newO);
                      }}
                      className="w-full p-4 bg-[#E4E3E0]/30 rounded-xl outline-none text-xs" 
                    />
                  ))}
                   <button onClick={() => setOpportunities([...opportunities, ''])} className="text-[10px] font-bold uppercase">+ Adicionar</button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {report.improvementOpportunities.map((o, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#141414]/70 font-medium italic font-serif">
                      <div className="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      </div>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Conclusion */}
          <section className="space-y-4 pt-8 border-t border-[#141414]/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40">Conclusão Final</h3>
            {editing ? (
              <textarea 
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="w-full h-24 p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none text-sm font-serif italic"
              />
            ) : (
              <p className="text-lg font-serif italic text-[#141414] leading-relaxed">
                {report.conclusion || 'Aguardando redação final.'}
              </p>
            )}
          </section>

          {/* Signatures */}
          <div className="pt-20 border-t border-[#141414]/10 grid grid-cols-2 gap-20">
             <div className="text-center space-y-2">
                <div className="h-0.5 bg-[#141414] w-full mb-4 opacity-10"></div>
                <p className="text-sm font-bold uppercase tracking-widest">{plan.auditorLeaderName}</p>
                <p className="text-[10px] font-mono opacity-40 uppercase">Auditor Líder</p>
             </div>
             <div className="text-center space-y-2">
                <div className="h-0.5 bg-[#141414] w-full mb-4 opacity-10"></div>
                {report.status === 'APPROVED' ? (
                  <>
                    <p className="text-sm font-bold uppercase tracking-widest">{report.approverName}</p>
                    <p className="text-[10px] font-mono text-green-600 font-bold uppercase">Homologado em {new Date(report.approvedAt!).toLocaleDateString()}</p>
                  </>
                ) : (
                  <p className="text-sm font-serif italic opacity-30">Assinatura Digital (Direção)</p>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Post-Approval Evaluation Call-to-Action */}
      {report.status === 'APPROVED' && !alreadyEvaluated && !isAuditor && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] text-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center space-y-6"
        >
          <div className="p-4 bg-white/10 rounded-full">
            <Star className="w-8 h-8 text-yellow-400 fill-current" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif italic">Avaliação de Desempenho do Auditor</h3>
            <p className="text-sm opacity-60 max-w-md mx-auto">
              Sua opinião é fundamental para a melhoria contínua do SGQ AREA FIT. Por favor, avalie a conduta e técnica do auditor nesta sessão.
            </p>
          </div>
          <button 
            onClick={() => setShowEvalForm(true)}
            className="px-10 py-4 bg-white text-[#141414] rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-yellow-400 transition-all shadow-xl"
          >
            Avaliar Auditor Agora
          </button>
        </motion.div>
      )}

      {alreadyEvaluated && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center gap-4 text-green-800">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="text-xs font-bold uppercase tracking-widest">Obrigado! Você já avaliou este auditor para esta sessão.</p>
        </div>
      )}
    </div>
  );
}

function HeaderSection({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] uppercase font-bold tracking-widest opacity-50">{label}</p>
      <p className="text-xs font-bold">{value}</p>
    </div>
  );
}
