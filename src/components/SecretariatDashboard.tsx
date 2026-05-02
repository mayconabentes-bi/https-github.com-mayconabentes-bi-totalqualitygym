import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, MessageCircle, UserPlus, 
  ChevronRight, Award, FileText, CheckCircle2, 
  XCircle, Clock, Shield, Search, Filter, 
  TrendingDown, TrendingUp, Calendar, Mail, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, StudentHealthScore, StudentLifecycleState } from '../types';

interface Props {
  profile: UserProfile;
  onSelectStudent: (student: any) => void;
}

export default function SecretariatDashboard({ profile, onSelectStudent }: Props) {
  const [churnAlerts, setChurnAlerts] = useState<any[]>([]);
  const [gradReady, setGradReady] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'graduation' | 'contracts' | 'finance'>('alerts');
  const [loading, setLoading] = useState(true);
  const [financeReport, setFinanceReport] = useState<any>(null);

  useEffect(() => {
    // Simulated fetching of management data
    setLoading(true);
    Promise.all([
      fetch(`/api/finance/reports/mrr?tenant_id=${profile.tenantId}`).then(r => r.json())
    ]).then(([fReport]) => {
      setFinanceReport(fReport);
      setChurnAlerts([
        { id: 's1', name: 'Marcos Oliveira', lastCheckin: '8 dias atrás', score: 32, trend: 'down', plan: 'Black', status: 'PAST_DUE' },
        { id: 's2', name: 'Julia Santos', lastCheckin: '12 dias atrás', score: 15, trend: 'down', plan: 'Anual', status: 'ACTIVE' },
        { id: 's3', name: 'Rodrigo Lima', lastCheckin: '6 dias atrás', score: 45, trend: 'down', plan: 'Mensal', status: 'PAST_DUE' },
      ]);
      setGradReady([
        { id: 'g1', name: 'Ricardo Saavedra', level: 52, xp: 18400, belt: 'Faixa Marrom', readySince: '2 dias' },
        { id: 'g2', name: 'Maycon Alves', level: 31, xp: 12100, belt: 'Faixa Azul', readySince: '5 dias' },
      ]);
      setLoading(false);
    });
  }, [profile.tenantId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Top Management Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Alertas de Churn" value={churnAlerts.length} color="text-red-600" bg="bg-red-50" icon={AlertTriangle} />
        <StatCard label="Prontos p/ Graduar" value={gradReady.length} color="text-green-600" bg="bg-green-50" icon={Award} />
        <StatCard label="Inadimplência (MRR)" value={financeReport ? `${financeReport.churnRate}` : '--'} color="text-yellow-600" bg="bg-yellow-50" icon={TrendingDown} />
        <StatCard label="MRR Projetado" value={financeReport ? `R$ ${financeReport.mrr.toLocaleString()}` : '--'} color="text-blue-600" bg="bg-blue-50" icon={TrendingUp} />
      </section>

      {/* Main Container */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 p-2 gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'alerts' ? 'bg-[#141414] text-white shadow-lg' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <AlertTriangle className="w-4 h-4" /> Central de Alertas
          </button>
          <button 
            onClick={() => setActiveTab('graduation')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'graduation' ? 'bg-[#141414] text-white shadow-lg' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <Award className="w-4 h-4" /> Gestor de Graduação
          </button>
          <button 
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'contracts' ? 'bg-[#141414] text-white shadow-lg' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <Shield className="w-4 h-4" /> Cofre de Contratos
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'finance' ? 'bg-[#141414] text-white shadow-lg' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <Clock className="w-4 h-4" /> Gestão Financeira
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'alerts' && (
              <motion.div 
                key="alerts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-red-50/50 p-6 rounded-3xl border border-red-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif italic text-red-900 leading-tight">Alunos em Risco de Evasão</h4>
                      <p className="text-[10px] font-mono text-red-700 uppercase tracking-widest mt-1">Ausência &gt; 7 dias ou engajamento &lt; 40%</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => (window as any).navigateDashboard('new_enrollment')}
                      className="px-6 py-3 bg-[#141414] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"
                    >
                       <UserPlus className="w-4 h-4" /> Nova Matrícula
                    </button>
                    <button className="px-6 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200">Automatizar Todos</button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {churnAlerts.map((student) => (
                    <ChurnAlertRow 
                      key={student.id} 
                      student={student} 
                      onClick={() => onSelectStudent(student)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'graduation' && (
              <motion.div 
                key="graduation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-green-50/50 p-6 rounded-3xl border border-green-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif italic text-green-900 leading-tight">Guerreiros Prontos para Avaliação</h4>
                      <p className="text-[10px] font-mono text-green-700 uppercase tracking-widest mt-1">Requisitos de XP e Tempo Atingidos</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-200">Notificar Professores</button>
                </div>

                <div className="grid gap-3">
                  {gradReady.map((student) => (
                    <GraduationReadyRow key={student.id} student={student} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div 
                key="finance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#141414] text-white p-8 rounded-[2.5rem] shadow-xl">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6">Receita Mensal (MRR)</h4>
                       <div className="flex items-baseline gap-4 mb-8">
                          <span className="text-5xl font-serif italic">R$ {financeReport?.mrr.toLocaleString()}</span>
                          <span className="text-green-400 text-sm font-bold flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +12%</span>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Assinaturas Ativas</span>
                             <span className="text-sm font-mono">{financeReport?.activeSubscriptions}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Taxa de Churn</span>
                             <span className="text-sm font-mono text-red-400">{financeReport?.churnRate}</span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem]">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#141414]/40 mb-6">Performance & Descontos</h4>
                       <p className="text-sm font-serif italic text-[#141414] leading-relaxed">Este mês, os guerreiros da AREA FIT economizaram <span className="text-[#141414] font-bold">R$ {financeReport?.performanceDiscountsTotal.toLocaleString()}</span> através de sua dedicação aos treinos (XP).</p>
                       <div className="mt-8 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-4">
                             <Zap className="w-8 h-8 text-yellow-400" />
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#141414]">Cashback por Evolução</p>
                                <p className="text-[8px] text-gray-400 uppercase mt-1">Média de 7% de economia por aluno</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-lg font-serif italic text-gray-900 px-2">Pendências de Pagamento (Ativas)</h3>
                    {churnAlerts.filter(s => s.status === 'PAST_DUE').map(student => (
                       <div key={student.id} className="p-6 bg-white border border-red-100 rounded-[2rem] flex items-center justify-between group hover:border-red-500 transition-all">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                             </div>
                             <div>
                                <h5 className="text-base font-bold text-[#141414]">{student.name}</h5>
                                <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mt-1">FATURA ATRASADA: {student.plan}</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <button className="px-6 py-3 bg-[#141414] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg">Enviar Cobrança IA</button>
                             <button className="px-4 py-3 border border-gray-200 rounded-2xl text-gray-400 hover:text-red-600 transition-colors"><XCircle className="w-5 h-5" /></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </motion.div>
            )}
            
            {activeTab === 'contracts' && (
               <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
                  <Shield className="w-20 h-20 mb-4" />
                  <p className="text-sm font-serif italic">Módulo de Contratos Híbridos Ativo</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">Documentação Auditoria AREA FIT</p>
               </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg, icon: Icon }: any) {
  return (
    <div className={`p-6 ${bg} rounded-[2rem] border border-gray-100 flex flex-col items-center text-center gap-2`}>
       <Icon className={`w-6 h-6 ${color} opacity-40`} />
       <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
       <p className={`text-2xl font-serif italic ${color}`}>{value}</p>
    </div>
  );
}

function ChurnAlertRow({ student, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="p-4 bg-gray-50 border border-gray-100 rounded-3xl flex flex-col md:flex-row items-center gap-6 hover:border-red-200 transition-all group cursor-pointer"
    >
       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-bold text-red-600 shadow-sm">
          {student.score}%
       </div>
       <div className="flex-1 text-center md:text-left">
          <h5 className="text-sm font-bold text-[#141414]">{student.name}</h5>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{student.plan}</span>
             <span className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Último Check-in: {student.lastCheckin}
             </span>
          </div>
       </div>
       <div className="flex gap-2">
          <ActionButton icon={MessageCircle} tooltip="WhatsApp IA" color="text-green-600" />
          <ActionButton icon={UserPlus} tooltip="Notificar Diretor" color="text-blue-600" />
          <ActionButton icon={Calendar} tooltip="Agendar Call" color="text-[#141414]" />
       </div>
    </div>
  );
}

function GraduationReadyRow({ student }: any) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-100 rounded-3xl flex flex-col md:flex-row items-center gap-6 hover:border-green-200 transition-all group">
       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
          <Award className="w-6 h-6 text-green-600" />
       </div>
       <div className="flex-1 text-center md:text-left">
          <h5 className="text-sm font-bold text-[#141414]">{student.name}</h5>
          <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{student.belt}</span>
             <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Nível {student.level}</span>
             <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Pronto há {student.readySince}</span>
          </div>
       </div>
       <div className="w-48 px-1">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 w-full" />
          </div>
          <p className="text-[8px] text-center font-bold text-green-600 uppercase mt-1">Pronto para Graduação</p>
       </div>
       <button className="px-6 py-3 bg-[#141414] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Solicitar Avaliação</button>
    </div>
  );
}

function ActionButton({ icon: Icon, tooltip, color }: any) {
  return (
    <div className="relative group/btn">
       <button className={`p-3 bg-white border border-gray-100 rounded-2xl hover:bg-[#141414] hover:text-white transition-all shadow-sm ${color}`}>
          <Icon className="w-4 h-4" />
       </button>
       <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#141414] text-white text-[9px] rounded-lg font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
          {tooltip}
       </div>
    </div>
  );
}
