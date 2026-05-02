import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, limit } from 'firebase/firestore';
import { QualityCheckIn, UserProfile } from '../types';
import { CheckCircle2, ClipboardCheck, History, Info, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  profile: UserProfile;
}

export default function QualityCheckInView({ profile }: Props) {
  const [history, setHistory] = useState<QualityCheckIn[]>([]);
  const [followed, setFollowed] = useState<boolean | null>(null);
  const [evidence, setEvidence] = useState('');
  const [submittedToday, setSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const q = query(
      collection(db, 'tenants', profile.tenantId, 'checkins'),
      where('userId', '==', profile.id),
      orderBy('date', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QualityCheckIn));
      setHistory(data);
      setSubmittedToday(data.some(c => c.date === today));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'checkins');
    });

    return () => unsubscribe();
  }, [profile.tenantId, profile.id, today]);

  const handleSubmit = async () => {
    if (followed === null) return;

    try {
      await addDoc(collection(db, 'tenants', profile.tenantId, 'checkins'), {
        userId: profile.id,
        userName: profile.displayName,
        date: today,
        followedGuidelines: followed,
        evidence,
        tenantId: profile.tenantId,
        timestamp: new Date().toISOString()
      });
      setSubmittedToday(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'checkins');
    }
  };

  if (loading) return <div className="p-8 text-center font-mono animate-pulse">CARREGANDO PROTOCOLOS...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-10 py-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-[#141414] text-white rounded-2xl mb-4 shadow-lg shadow-black/20">
          <ClipboardCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-serif italic text-[#141414]">Check-in de Qualidade</h2>
        <p className="text-xs font-mono text-[#141414]/50 uppercase tracking-widest leading-relaxed">
          Evidência Diária de Excelência no Atendimento<br />
          Ref: {new Date().toLocaleDateString()}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {submittedToday ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center space-y-4 shadow-sm"
          >
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif italic text-green-900">Check-in Concluído</h3>
            <p className="text-sm text-green-800/70 leading-relaxed">
              Sua conformidade técnica para hoje foi registrada e enviada à assessoria técnica. Obrigado por manter o padrão AREA FIT.
            </p>
            <div className="pt-4 border-t border-green-200">
               <p className="text-[10px] font-mono font-bold text-green-900 uppercase">PROTOCOL ID: {history[0]?.id.substring(0, 8)}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#141414]/10 p-8 rounded-3xl shadow-xl space-y-8"
          >
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#141414] leading-relaxed">
                Você seguiu rigorosamente os protocolos de <span className="underline decoration-2 underline-offset-4">Excelência no Atendimento</span> e as diretrizes da <span className="font-serif italic">POL-AF-001</span> durante seu turno hoje?
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFollowed(true)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    followed === true 
                      ? 'border-[#141414] bg-[#141414] text-white' 
                      : 'border-[#E4E3E0] hover:border-[#141414]/30'
                  }`}
                >
                  <p className="font-bold text-lg">SIM</p>
                  <p className="text-[10px] uppercase opacity-50">Conforme</p>
                </button>
                <button
                  onClick={() => setFollowed(false)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    followed === false 
                      ? 'border-red-500 bg-red-500 text-white' 
                      : 'border-[#E4E3E0] hover:border-red-500/30'
                  }`}
                >
                  <p className="font-bold text-lg">NÃO</p>
                  <p className="text-[10px] uppercase opacity-50">Não-Conforme</p>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/50">Evidência / Observações (Opcional)</label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="w-full h-32 bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-2xl p-4 focus:ring-2 focus:ring-[#141414]/5 focus:outline-none text-sm transition-all"
                placeholder="Ex: Todos os alunos receberam feedback técnico..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={followed === null}
              className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-black/20 hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <span className="flex items-center justify-center gap-2">
                Enviar Protocolo <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent History */}
      <div className="bg-white/50 border border-[#141414]/5 rounded-3xl p-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414]/40 flex items-center gap-2 mb-6">
          <History className="w-4 h-4" /> Histórico Operacional Recente
        </h3>
        <div className="space-y-4">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-2 border-b border-[#141414]/5 last:border-0 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${h.followedGuidelines ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-red-500'}`} />
                <span className="text-xs font-medium">{new Date(h.date).toLocaleDateString()}</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest">{h.followedGuidelines ? 'Conforme' : 'Desvio'}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-xs italic text-[#141414]/30">Nenhum registro anterior.</p>}
        </div>
      </div>

      <div className="bg-[#141414] text-white p-6 rounded-3xl shadow-xl flex items-start gap-4">
        <div className="p-2 bg-white/10 rounded-lg"><Info className="w-5 h-5 text-white/50" /></div>
        <p className="text-[11px] leading-relaxed opacity-80 italic font-serif">
          "A qualidade não é um ato, é um hábito. Seu registro diário alimenta o motor de melhoria contínua da AREA FIT."
        </p>
      </div>
    </div>
  );
}
