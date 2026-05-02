import React, { useState, useEffect } from 'react';
import { 
  Users, Star, ShieldAlert, CheckCircle2, 
  Clock, Zap, AlertTriangle, ArrowRight,
  TrendingDown, TrendingUp, Info, ChevronRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface StudentData {
  id: string;
  name: string;
  hasQualityBadge: boolean;
  checkinTime: string;
}

interface Props {
  profile: UserProfile;
}

export default function InstructorClassView({ profile }: Props) {
  const [activeStudents, setActiveStudents] = useState<StudentData[]>([]);
  const [globalRating, setGlobalRating] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');

  useEffect(() => {
    // Simulated fetch of students who checked in recently at this unit
    setTimeout(() => {
      setActiveStudents([
        { id: 'u-101', name: 'Leandro Pereira', hasQualityBadge: true, checkinTime: '18:45' },
        { id: 'u-102', name: 'Fernanda Lima', hasQualityBadge: false, checkinTime: '18:50' },
        { id: 'u-103', name: 'Carlos Eduardo', hasQualityBadge: true, checkinTime: '18:55' },
        { id: 'u-104', name: 'Mariana Santos', hasQualityBadge: false, checkinTime: '19:02' },
        { id: 'u-105', name: 'Roberto Silva', hasQualityBadge: false, checkinTime: '19:05' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleValidateAll = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/instructor/validate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: profile.tenantId,
          instructor_id: profile.id,
          students: activeStudents.map(s => ({ id: s.id, hasQualityBadge: s.hasQualityBadge })),
          performance_rating: globalRating
        })
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        alert('Toda a turma validada com sucesso! XP distribuído.');
      }
    } catch (error) {
      console.error('Error validating class:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePanicSubmit = async () => {
    if (!issueDescription) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/instructor/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tenant_id: profile.tenantId,
            instructor_id: profile.id,
            issue_type: 'Falha de Infraestrutura',
            description: issueDescription
        })
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : { success: false };
      if (data.success) {
        alert('Alerta do Instrutor enviado com sucesso. SGQ notificado.');
        setShowPanicModal(false);
        setIssueDescription('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
      {/* Header Instructor Info */}
      <section className="flex items-center justify-between bg-[#141414] text-white p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Zap className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-6 relative">
             <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Users className="w-8 h-8 text-yellow-400" />
             </div>
             <div>
                <h2 className="text-2xl font-serif italic">Aula em Andamento</h2>
                <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-1">Instrutor: {profile.displayName}</p>
             </div>
          </div>
          <button 
            onClick={() => setShowPanicModal(true)}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40 relative z-10 transition-transform active:scale-90"
          >
             <ShieldAlert className="w-8 h-8" />
          </button>
      </section>

      {/* Class Overview */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Check-ins Ativos ({activeStudents.length})</h3>
                <p className="text-lg font-serif italic text-[#141414]">Avalie a performance técnica da turma</p>
             </div>
             
             {/* Global Validation Control */}
             <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-6 min-w-[300px]">
                <div className="flex-1">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#141414] mb-2">
                      <span>Rating GERAL</span>
                      <span className="text-yellow-600 font-bold">{globalRating}/10</span>
                   </div>
                   <input 
                     type="range" min="1" max="10" step="1"
                     value={globalRating}
                     onChange={(e) => setGlobalRating(parseInt(e.target.value))}
                     className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#141414]"
                   />
                </div>
                <button 
                  onClick={handleValidateAll}
                  disabled={isSubmitting || activeStudents.length === 0}
                  className="px-6 py-3 bg-[#141414] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                >
                   Validar Todos
                </button>
             </div>
          </div>

          <div className="p-4 md:p-8">
             {loading ? (
                <div className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-3xl" />)}
                </div>
             ) : (
                <div className="grid gap-3">
                   {activeStudents.map((student) => (
                      <StudentRow key={student.id} student={student} />
                   ))}
                </div>
             )}
          </div>
      </div>

      {/* Business Intelligence / Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-8 bg-green-50 border border-green-100 rounded-[2.5rem] flex items-center gap-6">
            <div className="p-4 bg-white rounded-3xl shadow-sm text-green-600">
               <Zap className="w-8 h-8" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Injeção de XP Estimada</p>
               <p className="text-2xl font-serif italic text-green-900 leading-tight mt-1">+{activeStudents.length * globalRating * 10} XP em circulação</p>
            </div>
         </div>

         <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex items-center gap-6">
            <div className="p-4 bg-white rounded-3xl shadow-sm text-blue-600">
               <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Badge Módulo 13</p>
               <p className="text-sm font-serif italic text-blue-900 leading-tight mt-1">Alunos com 'Olho de Águia' recebem bônus de 1.2x automático.</p>
            </div>
         </div>
      </div>

      {/* Panic Modal */}
      <AnimatePresence>
         {showPanicModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#141414]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.9, y: 20 }}
                 className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-lg w-full space-y-8"
               >
                  <div className="text-center">
                     <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10" />
                     </div>
                     <h3 className="text-3xl font-serif italic text-[#141414]">Relatar Incidente (SGQ)</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Bloco 19 - Ativos e Infraestrutura</p>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Descrição Detalhada do Problema</label>
                     <textarea 
                       value={issueDescription}
                       onChange={(e) => setIssueDescription(e.target.value)}
                       placeholder="Ex: Tatame solto na área A, Risco de lesão imediato..."
                       className="w-full h-32 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                     />
                  </div>

                  <div className="flex gap-4">
                     <button 
                       onClick={() => setShowPanicModal(false)}
                       className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#141414] transition-colors"
                     >
                        Cancelar
                     </button>
                     <button 
                       onClick={handlePanicSubmit}
                       disabled={isSubmitting || !issueDescription}
                       className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-200 transition-all disabled:opacity-50"
                     >
                        Relatar ao SGQ
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}

function StudentRow({ student }: any) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-100 rounded-3xl flex items-center gap-6 hover:border-[#141414]/20 transition-all">
       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-bold text-[#141414] shadow-sm relative overflow-hidden">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
            alt="Avatar"
            className="w-full h-full object-cover"
          />
       </div>
       <div className="flex-1">
          <div className="flex items-center gap-2">
             <h5 className="text-sm font-bold text-[#141414]">{student.name}</h5>
             {student.hasQualityBadge && (
                <div className="p-1 bg-yellow-100 rounded-lg" title="Guardião da Qualidade (Multiplicador 1.2x)">
                   <Zap className="w-3 h-3 text-yellow-600" />
                </div>
             )}
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1 flex items-center gap-2">
             <Clock className="w-3 h-3" /> Check-in às {student.checkinTime}h
          </p>
       </div>
       <div className="hidden md:flex flex-col items-end">
          <span className="text-[8px] font-black uppercase tracking-tighter text-gray-300">Status Técnico</span>
          <div className="flex gap-1 mt-1">
             {[1,2,3,4,5].map(i => (
                <div key={i} className="w-5 h-1.5 rounded-full bg-green-500 opacity-20" />
             ))}
          </div>
       </div>
       <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-[#141414] hover:text-white transition-all shadow-sm">
          <Star className="w-4 h-4" />
       </button>
    </div>
  );
}
