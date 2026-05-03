import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/supabase';
import { 
  collection, doc, setDoc, updateDoc, getDoc, 
  query, where, getDocs 
} from '@/lib/supabase';
import { 
  AuditPlan, AuditReport, AuditorEvaluation, UserProfile 
} from '../types';
import { 
  Star, Send, CheckCircle2, AlertTriangle, 
  MessageSquare, User, Shield, Zap, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  profile: UserProfile;
  plan: AuditPlan;
  reportId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function AuditorEvaluationForm({ profile, plan, reportId, onComplete, onCancel }: Props) {
  const [scores, setScores] = useState({
    ethics: 5,
    technicalKnowledge: 5,
    communication: 5,
    punctuality: 5
  });
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const calculateAverage = () => {
    const vals = Object.values(scores) as number[];
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const determineLevel = (avg: number) => {
    if (avg >= 4.5) return 'Master';
    if (avg >= 3.0) return 'Pleno';
    return 'Needs Training';
  };

  const handleSubmit = async () => {
    setSaving(true);
    const avg = calculateAverage();
    
    try {
      // 1. Create Evaluation
      const evalData: Omit<AuditorEvaluation, 'id'> = {
        reportId,
        auditorId: plan.auditorLeaderId,
        auditeeId: profile.id,
        scores,
        averageScore: avg,
        comments,
        tenantId: profile.tenantId,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(collection(db, 'tenants', profile.tenantId, 'auditor_evaluations')), evalData);

      // 2. Update Auditor Profile (Ranking)
      // For this demo, we fetch all evaluations for this auditor to recalculate global average
      const evalsSnap = await getDocs(query(
        collection(db, 'tenants', profile.tenantId, 'auditor_evaluations'),
        where('auditorId', '==', plan.auditorLeaderId)
      ));
      
      const allEvals = evalsSnap.docs.map(d => d.data() as AuditorEvaluation);
      const globalAvg = allEvals.reduce((sum: number, e: AuditorEvaluation) => sum + e.averageScore, 0) / (allEvals.length || 1);
      
      await updateDoc(doc(db, 'users', plan.auditorLeaderId), {
        averageScore: globalAvg,
        auditorLevel: determineLevel(globalAvg)
      });

      onComplete();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'auditor_evaluations');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#141414]/10 rounded-3xl p-8 shadow-2xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif italic text-[#141414]">Avaliação de Competência</h3>
          <p className="text-xs font-mono text-[#141414]/50 uppercase">Auditor: {plan.auditorLeaderName}</p>
        </div>
        <button onClick={onCancel} className="text-xs font-bold uppercase tracking-widest opacity-40">Cancelar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RatingField 
          label="Postura e Ética" 
          description="O auditor agiu com imparcialidade e integridade?"
          value={scores.ethics}
          onChange={(v) => setScores({ ...scores, ethics: v })}
          icon={<Shield className="w-4 h-4" />}
        />
        <RatingField 
          label="Conhecimento Técnico" 
          description="Domínio sobre os processos (Jiu-Jitsu, Muay Thai ou Administrativo)"
          value={scores.technicalKnowledge}
          onChange={(v) => setScores({ ...scores, technicalKnowledge: v })}
          icon={<Zap className="w-4 h-4" />}
        />
        <RatingField 
          label="Comunicação" 
          description="As falhas foram explicadas de forma clara e profissional?"
          value={scores.communication}
          onChange={(v) => setScores({ ...scores, communication: v })}
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <RatingField 
          label="Pontualidade" 
          description="O cronograma do Plano de Auditoria foi respeitado?"
          value={scores.punctuality}
          onChange={(v) => setScores({ ...scores, punctuality: v })}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Comentários Adicionais</label>
        <textarea 
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Descreva sua experiência com o auditor..."
          className="w-full p-4 bg-[#E4E3E0]/30 rounded-2xl outline-none text-sm h-32 focus:bg-[#E4E3E0]/50 transition-all font-serif italic"
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-[#141414]/10">
        <div>
          <p className="text-[10px] font-mono opacity-40 uppercase">Média da Avaliação</p>
          <p className="text-2xl font-serif italic text-yellow-600">{calculateAverage().toFixed(1)}</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="px-10 py-4 bg-[#141414] text-white rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-30"
        >
          {saving ? 'Enviando...' : <><Send className="w-4 h-4" /> Enviar Avaliação</>}
        </button>
      </div>
    </motion.div>
  );
}

function RatingField({ label, description, value, onChange, icon }: { 
  label: string, description: string, value: number, onChange: (v: number) => void, icon: React.ReactNode 
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#141414]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-[10px] text-[#141414]/50 leading-tight">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star} 
            onClick={() => onChange(star)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              value >= star ? 'bg-yellow-400 text-[#141414] shadow-lg shadow-yellow-400/20' : 'bg-[#E4E3E0]/30 text-[#141414]/20 hover:bg-[#E4E3E0]/50'
            }`}
          >
            <Star className={`w-5 h-5 ${value >= star ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
