import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { StrategicPlan, Stakeholder, QualityObjective, UserProfile } from '../types';
import { Target, Users, Map, Plus, Save, TrendingUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  profile: UserProfile;
}

export default function StrategicPlanningView({ profile }: Props) {
  const [plans, setPlans] = useState<StrategicPlan[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [objectives, setObjectives] = useState<QualityObjective[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for adding
  const [newStakeholder, setNewStakeholder] = useState({ name: '', needs: '', expectations: '' });
  const [newObjective, setNewObjective] = useState({ title: '', target: '', result: '' });
  const [showForms, setShowForms] = useState({ stakeholder: false, objective: false });

  const canEdit = ['direction', 'partner', 'technical_advice'].includes(profile.role);

  useEffect(() => {
    const unsubPlans = onSnapshot(query(collection(db, 'tenants', profile.tenantId, 'plans')), (snapshot) => {
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StrategicPlan)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'plans'));

    const unsubStakeholders = onSnapshot(query(collection(db, 'tenants', profile.tenantId, 'stakeholders')), (snapshot) => {
      setStakeholders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stakeholder)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'stakeholders'));

    const unsubObjectives = onSnapshot(query(collection(db, 'tenants', profile.tenantId, 'objectives')), (snapshot) => {
      setObjectives(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QualityObjective)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'objectives'));

    setLoading(false);
    return () => {
      unsubPlans();
      unsubStakeholders();
      unsubObjectives();
    };
  }, [profile.tenantId]);

  const currentPlan = plans[0] || { year: 2026, mission: '', vision: '', values: '' };

  const handleAddStakeholder = async () => {
    try {
      await addDoc(collection(db, 'tenants', profile.tenantId, 'stakeholders'), {
        ...newStakeholder,
        tenantId: profile.tenantId
      });
      setNewStakeholder({ name: '', needs: '', expectations: '' });
      setShowForms({ ...showForms, stakeholder: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'stakeholders');
    }
  };

  const handleAddObjective = async () => {
    try {
      await addDoc(collection(db, 'tenants', profile.tenantId, 'objectives'), {
        ...newObjective,
        currentValue: 0,
        targetValue: 100,
        planId: currentPlan.id || 'main',
        tenantId: profile.tenantId
      });
      setNewObjective({ title: '', target: '', result: '' });
      setShowForms({ ...showForms, objective: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'objectives');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Identity Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#141414] text-white rounded-lg"><Map className="w-5 h-5" /></div>
          <div>
            <h2 className="text-2xl font-serif italic text-[#141414]">Planejamento Estratégico {currentPlan.year}</h2>
            <p className="text-xs font-mono text-[#141414]/50 uppercase">Identidade Organizacional e Governança</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <IdentityCard title="Missão" content="Promover saúde e performance com rigor técnico e humanização." type="mission" />
          <IdentityCard title="Visão" content="Ser a maior referência em musculação técnica de São Paulo até 2028." type="vision" />
          <IdentityCard title="Valores" content="Técnica, Disciplina, Resultado, Ética, Comunidade." type="values" />
        </div>
      </section>

      {/* 2. Stakeholders & Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Stakeholders */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#141414]/10 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Users className="w-5 h-5" /> Partes Interessadas
            </h3>
            {canEdit && (
              <button 
                onClick={() => setShowForms({ ...showForms, stakeholder: true })}
                className="p-1 hover:bg-[#141414]/10 rounded transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {showForms.stakeholder && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white p-4 rounded-xl border border-[#141414]/10 space-y-3">
                <input 
                  placeholder="Nome do Stakeholder (Ex: Alunos)" 
                  className="w-full bg-[#E4E3E0] p-2 text-xs rounded border-none"
                  value={newStakeholder.name}
                  onChange={e => setNewStakeholder({...newStakeholder, name: e.target.value})}
                />
                <textarea 
                  placeholder="Necessidades e Expectativas..." 
                  className="w-full bg-[#E4E3E0] p-2 text-xs rounded border-none h-20"
                  value={newStakeholder.needs}
                  onChange={e => setNewStakeholder({...newStakeholder, needs: e.target.value})}
                />
                <button 
                  onClick={handleAddStakeholder}
                  className="w-full bg-[#141414] text-white py-2 text-xs font-bold rounded uppercase tracking-widest"
                >
                  Adicionar
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {stakeholders.map(s => (
              <div key={s.id} className="p-4 bg-white border border-[#141414]/10 rounded-xl hover:shadow-md transition-shadow">
                <p className="font-bold text-sm mb-1">{s.name}</p>
                <p className="text-xs text-[#141414]/60 leading-relaxed italic">"{s.needs}"</p>
              </div>
            ))}
            {stakeholders.length === 0 && <p className="text-xs text-[#141414]/30 italic">Nenhuma parte interessada mapeada.</p>}
          </div>
        </section>

        {/* Quality Objectives */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#141414]/10 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Target className="w-5 h-5" /> Objetivos da Qualidade
            </h3>
            {canEdit && (
              <button 
                onClick={() => setShowForms({ ...showForms, objective: true })}
                className="p-1 hover:bg-[#141414]/10 rounded transition-colors"
                title="Novo Objetivo"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showForms.objective && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white p-4 rounded-xl border border-[#141414]/10 space-y-3">
                <input 
                  placeholder="Título do Objetivo (Ex: KPIs Técnicos)" 
                  className="w-full bg-[#E4E3E0] p-2 text-xs rounded border-none"
                  value={newObjective.title}
                  onChange={e => setNewObjective({...newObjective, title: e.target.value})}
                />
                <input 
                  placeholder="Meta (Ex: 95% de satisfação)" 
                  className="w-full bg-[#E4E3E0] p-2 text-xs rounded border-none"
                  value={newObjective.target}
                  onChange={e => setNewObjective({...newObjective, target: e.target.value})}
                />
                <button 
                  onClick={handleAddObjective}
                  className="w-full bg-[#141414] text-white py-2 text-xs font-bold rounded uppercase tracking-widest"
                >
                  Salvar Objetivo
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {objectives.map(o => (
              <div key={o.id} className="group p-4 bg-white border border-[#141414]/10 rounded-xl hover:border-[#141414]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase">{o.title}</span>
                  <TrendingUp className="w-4 h-4 text-[#141414]/20 group-hover:text-[#141414]" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#141414]/50">
                  <span className="bg-[#E4E3E0] px-2 py-0.5 rounded">Meta: {o.target}</span>
                  <span className="bg-[#141414] text-white px-2 py-0.5 rounded">Atual: {o.result || '0%'}</span>
                </div>
              </div>
            ))}
            {objectives.length === 0 && <p className="text-xs text-[#141414]/30 italic">Nenhum objetivo definido.</p>}
          </div>
        </section>
      </div>

      <div className="bg-[#141414] text-white p-8 rounded-3xl flex items-center gap-8">
        <div className="p-4 bg-white/10 rounded-full"><Info className="w-8 h-8" /></div>
        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-50">Dica de Qualidade</p>
          <p className="text-lg font-serif italic opacity-90">
            A rastreabilidade dos objetivos permite identificar pontos cegos na assessoria técnica. Use o organograma para delegar responsabilidades.
          </p>
        </div>
      </div>
    </div>
  );
}

function IdentityCard({ title, content, type }: { title: string, content: string, type: string }) {
  return (
    <div className="relative bg-white p-8 rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#141414]/5 group-hover:bg-[#141414] transition-colors" />
      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414]/40 mb-4">{title}</h4>
      <p className="text-lg font-serif italic text-[#141414] leading-snug">{content}</p>
      
      <div className="mt-8 flex justify-end opacity-10 group-hover:opacity-100 transition-opacity">
        <div className="p-1 border border-[#141414] rounded-full"><Plus className="w-3 h-3" /></div>
      </div>
    </div>
  );
}
