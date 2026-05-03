import React, { useState, useEffect } from 'react';
import { 
  Users, Star, ShieldAlert, CheckCircle2, 
  Clock, Zap, AlertTriangle, ArrowRight,
  TrendingDown, TrendingUp, Info, ChevronRight,
  UserCheck, MessageSquare, History, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface StudentSessionData {
  id: string;
  name: string;
  level: number;
  belt: string;
  healthScore: number;
  currentXp: number;
  targetXp: number;
  photo: string;
  hasQualityBadge: boolean;
}

interface Props {
  profile: UserProfile;
}

export default function InstructorMasterConsole({ profile }: Props) {
  const [students, setStudents] = useState<StudentSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentSessionData | null>(null);
  const [performance, setPerformance] = useState(7);
  const [observation, setObservation] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicDescription, setPanicDescription] = useState('');

  useEffect(() => {
    // Simulated fetch of active session data
    setTimeout(() => {
      setStudents([
        { 
          id: 'u-201', name: 'Leandro Pereira', level: 42, belt: 'Faixa Azul', 
          healthScore: 88, currentXp: 12400, targetXp: 12500, photo: 'Leandro', hasQualityBadge: true 
        },
        { 
          id: 'u-202', name: 'Fernanda Lima', level: 15, belt: 'Faixa Branca', 
          healthScore: 92, currentXp: 4200, targetXp: 5000, photo: 'Fernanda', hasQualityBadge: false 
        },
        { 
          id: 'u-203', name: 'Carlos Eduardo', level: 31, belt: 'Faixa Azul', 
          healthScore: 35, currentXp: 9800, targetXp: 10000, photo: 'Carlos', hasQualityBadge: true 
        },
        { 
          id: 'u-204', name: 'Mariana Santos', level: 58, belt: 'Faixa Marrom', 
          healthScore: 78, currentXp: 18950, targetXp: 19000, photo: 'Mariana', hasQualityBadge: false 
        },
      ]);
      setHistory([
        { id: 'h1', name: 'Marcos Oliveira', rating: 9, time: '19:12', comment: 'Excelente guarda' },
        { id: 'h2', name: 'Julia Santos', rating: 8, time: '19:15', comment: 'Postura corrigida' },
        { id: 'h3', name: 'Rodrigo Lima', rating: 7, time: '19:18', comment: 'Foco no drill' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleValidation = async () => {
    if (!selectedStudent) return;
    
    // Simulate API call
    const newEntry = {
      id: Date.now().toString(),
      name: selectedStudent.name,
      rating: performance,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      comment: observation
    };

    setHistory(prev => [newEntry, ...prev.slice(0, 2)]);
    setSelectedStudent(null);
    setObservation('');
    setPerformance(7);
    alert(`Validação técnica registrada para ${selectedStudent.name}`);
  };

  const handlePanic = async () => {
    if (!panicDescription) return;
    // Integration with server.ts logic (Module 19)
    await fetch('/api/instructor/report-issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: profile.tenantId,
        instructor_id: profile.id,
        issue_type: 'FALHA_INFRAESTRUTURA',
        description: panicDescription
      })
    });
    setShowPanicModal(false);
    setPanicDescription('');
    alert('SGQ Notificado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header - Technical Hub */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-emerald-400" />
                 </div>
                 <h1 className="text-3xl font-serif italic tracking-tight text-white/90">Instructor Master Console</h1>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
                 UNIDADE {profile.tenantId?.slice(0, 8)} | STATUS: SESSÃO ATIVA
              </p>
           </div>

           <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                 <p className="font-mono text-[10px] uppercase text-white/30 tracking-widest leading-none">Instrutor Logado</p>
                 <p className="text-sm font-bold text-white/90">{profile.displayName}</p>
              </div>
              <button 
                onClick={() => setShowPanicModal(true)}
                className="group relative flex items-center justify-center w-14 h-14 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-2xl transition-all shadow-2xl"
              >
                 <ShieldAlert className="w-7 h-7 text-red-500 group-hover:scale-110 transition-transform" />
                 <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 text-[9px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Reportar Falha (SGQ)</span>
              </button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Left Column: Active Students List */}
           <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between px-4">
                 <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Lista de Alunos Ativos ({students.length})</h2>
                 <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> Em Treinamento
                 </div>
              </div>

              <div className="space-y-3">
                 {loading ? (
                    [1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-3xl" />)
                 ) : (
                    students.map(student => (
                       <div 
                         key={student.id}
                         onClick={() => setSelectedStudent(student)}
                         className={`p-4 rounded-[2rem] border transition-all cursor-pointer group flex items-center gap-6 ${
                           selectedStudent?.id === student.id 
                           ? 'bg-emerald-500/10 border-emerald-500/50 shadow-2xl shadow-emerald-500/5' 
                           : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                         }`}
                       >
                          <div className="relative">
                             <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.photo}`} 
                                  alt={student.name}
                                  className="w-full h-full object-cover"
                                />
                             </div>
                             {student.hasQualityBadge && (
                                <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-lg shadow-xl border-2 border-[#0A0A0A]">
                                   <Zap className="w-3 h-3 text-black fill-current" />
                                </div>
                             )}
                          </div>

                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-3">
                                <h3 className="text-lg font-serif italic text-white/90 truncate">{student.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                  student.healthScore > 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                  student.healthScore > 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                  'bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse'
                                }`}>
                                   HEALTH: {student.healthScore}
                                </span>
                             </div>
                             <div className="flex items-center gap-4 mt-1">
                                <span className="font-mono text-[9px] uppercase text-white/30 tracking-widest">{student.belt} • LVL {student.level}</span>
                                {student.currentXp >= student.targetXp && (
                                  <span className="flex items-center gap-1 text-[9px] font-black text-amber-400 uppercase tracking-widest animate-bounce">
                                     <Award className="w-3 h-3" /> Graduação Disponível
                                  </span>
                                )}
                             </div>
                          </div>

                          <div className="hidden md:flex flex-col items-end gap-1">
                             <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 transition-all" 
                                  style={{ width: `${Math.min(100, (student.currentXp / student.targetXp) * 100)}%` }} 
                                />
                             </div>
                             <span className="font-mono text-[8px] text-white/20">XP PROGRESSIVE</span>
                          </div>

                          <div className={`p-3 rounded-xl transition-all ${selectedStudent?.id === student.id ? 'bg-emerald-500 text-black' : 'text-white/20 group-hover:text-white/60'}`}>
                             {selectedStudent?.id === student.id ? <ArrowRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Right Column: Performance Validation Console */}
           <div className="lg:col-span-5 space-y-8">
              <AnimatePresence mode="wait">
                 {selectedStudent ? (
                    <motion.div 
                      key="console-active"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white/[0.03] border border-emerald-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                          <CheckCircle2 className="w-48 h-48 text-emerald-500" />
                       </div>

                       <div className="relative space-y-10">
                          <header className="space-y-4">
                             <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400">Validação Técnica</h4>
                             <h3 className="text-3xl font-serif italic text-white leading-tight">Avaliar: {selectedStudent.name}</h3>
                          </header>

                          {/* XP Performance Slider */}
                          <div className="space-y-6">
                             <div className="flex justify-between items-baseline">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Performance Aula (1-10)</label>
                                <span className={`text-4xl font-serif italic ${performance > 7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                   {performance}
                                </span>
                             </div>
                             <input 
                               type="range" min="1" max="10" step="1"
                               value={performance}
                               onChange={(e) => setPerformance(parseInt(e.target.value))}
                               className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                             />
                             <div className="flex justify-between font-mono text-[8px] text-white/20 uppercase">
                                <span>Fundamental</span>
                                <span>Elite</span>
                             </div>
                          </div>

                          {/* Technical Observation */}
                          <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-white/20" />
                                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Observação Técnica</label>
                             </div>
                             <textarea 
                               value={observation}
                               onChange={(e) => setObservation(e.target.value)}
                               placeholder="Ex: Melhorar postura no clinch, foco na pegada de costas..."
                               className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-serif italic text-white/90 placeholder:text-white/10 focus:border-emerald-500/50 outline-none transition-all resize-none"
                             />
                          </div>

                          <div className="pt-6 space-y-4">
                             <button 
                               onClick={handleValidation}
                               className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
                             >
                                Registrar Validação Técnica
                             </button>
                             <button 
                               onClick={() => setSelectedStudent(null)}
                               className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
                             >
                                Cancelar Seleção
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <div className="h-full min-h-[500px] border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10 opacity-30">
                       <UserCheck className="w-20 h-20 mb-6 text-white" />
                       <h3 className="text-xl font-serif italic mb-2 tracking-tight">Console de Liderança Técnico</h3>
                       <p className="font-mono text-[10px] uppercase tracking-widest">Selecione um guerreiro para validar performance</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* Footer Session History */}
        <footer className="border-t border-white/5 pt-10">
           <div className="flex items-center gap-4 mb-6">
              <History className="w-5 h-5 text-white/20" />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Log de Auditoria da Sessão (Últimas 3)</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {history.map(item => (
                 <div key={item.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-white/10">{item.time}</div>
                    <div className="flex items-center gap-3 mb-3">
                       <h5 className="font-serif italic text-white/80">{item.name}</h5>
                       <span className="text-[10px] font-black text-emerald-400">RATING {item.rating}</span>
                    </div>
                    <p className="text-[11px] text-white/40 italic leading-relaxed group-hover:text-white/70 transition-colors">"{item.comment || 'Sem observações técnicas.'}"</p>
                 </div>
              ))}
           </div>
        </footer>
      </div>

      {/* SGQ Panic Modal */}
      <AnimatePresence>
         {showPanicModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
            >
               <motion.div 
                 initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                 className="bg-[#141414] border border-red-500/30 p-10 rounded-[3rem] shadow-2xl max-w-lg w-full space-y-8"
               >
                  <div className="text-center space-y-4">
                     <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-500/30">
                        <AlertTriangle className="w-10 h-10" />
                     </div>
                     <h3 className="text-3xl font-serif italic text-white">Reportar Incidente Técnico</h3>
                     <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">Integração Bloco 19 - Auditoria SGQ</p>
                  </div>

                  <textarea 
                    value={panicDescription}
                    onChange={(e) => setPanicDescription(e.target.value)}
                    placeholder="Descreva a falha de infraestrutura (Ex: Vazamento, Tatame Solto, Elétrica...)"
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-serif italic text-white outline-none focus:border-red-500/50 transition-all resize-none"
                  />

                  <div className="flex gap-4">
                     <button onClick={() => setShowPanicModal(false)} className="flex-1 py-4 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white">Cancelar</button>
                     <button 
                       onClick={handlePanic}
                       disabled={!panicDescription}
                       className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-600/20 disabled:opacity-20 transition-all"
                     >
                        Disparar Alerta SGQ
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
