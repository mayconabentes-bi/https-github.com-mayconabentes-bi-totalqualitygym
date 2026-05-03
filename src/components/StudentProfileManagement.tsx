import React, { useState, useEffect } from 'react';
import { 
  User, Shield, FileText, CheckCircle2, 
  XCircle, Clock, Zap, Heart, 
  Award, TrendingUp, ChevronLeft, 
  Mail, Phone, ExternalLink, Download,
  Lock, Unlock
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, StudentHealthScore, StudentLifecycleState } from '../types';

interface Props {
  profile: any; // The student being viewed
  onBack: () => void;
}

export default function StudentProfileManagement({ profile, onBack }: Props) {
  const [health, setHealth] = useState<StudentHealthScore | null>(null);
  
  const documents = [
    { id: 'd1', name: 'Contrato de Prestação de Serviços', status: 'Assinado', date: '12/01/2026', icon: FileText },
    { id: 'd2', name: 'Termo de Aceite: Política de Qualidade', status: 'Assinado', date: '12/01/2026', icon: Shield },
    { id: 'd3', name: 'Atestado Médico / PAR-Q', status: 'Vencido', date: '15/12/2024', icon: FileText },
    { id: 'd4', name: 'Autorização de Uso de Imagem', status: 'Pendente', date: '--', icon: FileText },
  ];

  useEffect(() => {
    fetch(`/api/crm/student-health/${profile.id}`)
      .then(res => res.json())
      .then(json => setHealth(json));
  }, [profile.id]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#141414] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar para Dashboard
      </button>

      {/* Profile Header */}
      <section className="bg-[#141414] text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-20 opacity-5">
            <User className="w-64 h-64" />
         </div>
         
         <div className="flex flex-col md:flex-row items-center gap-10 relative">
            <div className="w-40 h-40 rounded-full border-4 border-yellow-400 p-1 bg-white/10 overflow-hidden shadow-2xl">
               <img 
                 src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}`} 
                 alt="Avatar"
                 className="w-full h-full object-cover"
               />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
               <div>
                  <h2 className="text-4xl font-serif italic">{profile.displayName}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                     <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ID: {profile.id}</span>
                     <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest">Matriculado em: 12/Jan/2026</span>
                  </div>
               </div>

               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <ContactInfo icon={Mail} value={profile.email} />
                  <ContactInfo icon={Phone} value="(11) 98765-4321" />
               </div>

               {health && (
                 <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   health.currentState === 'ENGAJADO' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                 }`}>
                   <Heart className="w-3 h-3" /> Status Lifecycle: {health.currentState}
                 </div>
               )}
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Left Side: Health & Engagement */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Score de Engajamento</h3>
               {health ? (
                 <div className="space-y-6">
                    <div className="relative flex items-center justify-center">
                       <svg className="w-32 h-32">
                          <circle className="text-gray-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                          <circle 
                            className={health.engagementScore > 70 ? 'text-green-500' : 'text-red-500'}
                            strokeWidth="8" 
                            strokeDasharray={364}
                            strokeDashoffset={364 - (364 * health.engagementScore) / 100}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="58" cx="64" cy="64" 
                          />
                       </svg>
                       <span className="absolute text-3xl font-serif italic">{health.engagementScore}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <HealthStat label="Frequência" value={`${health.frequency30d} aulas`} />
                       <HealthStat label="XP Vel." value={`+${health.xpVelocity30d}`} />
                    </div>
                 </div>
               ) : (
                 <div className="h-48 animate-pulse bg-gray-50 rounded-3xl" />
               )}
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl space-y-6">
               <Award className="w-10 h-10 opacity-30" />
               <h4 className="text-xl font-serif italic">Próxima Graduação</h4>
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                     <span>Progresso Técnico</span>
                     <span>82%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-yellow-400 w-[82%]" />
                  </div>
               </div>
               <p className="text-[9px] font-mono uppercase tracking-widest opacity-60">Faltam: 1.250 XP p/ Faixa Marrom</p>
               <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all">
                  Antecipar Avaliação
               </button>
            </div>
         </div>

         {/* Right Side: Document Vault & Finance */}
         <div className="lg:col-span-8 space-y-8">
            {/* Financial Performance Widget (NEW) */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-serif italic text-[#141414]">Performance Financeira</h3>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-1">Detalhamento de Descontos via XP (Módulo 13)</p>
                  </div>
                  <div className="flex gap-2">
                     <button className="px-6 py-3 bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" /> Bloquear Acesso (Manual)
                     </button>
                     <button className="px-4 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                     </button>
                  </div>
               </div>

               <div className="p-8 bg-[#141414] rounded-[2rem] text-white space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                     <span>Fatura Próxima (Venc: 12/Fev)</span>
                     <span>Iniciais: R$ 199,00</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-400 text-[#141414] rounded-2xl">
                           <Zap className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-sm font-bold">Desconto por Performance (XP)</p>
                           <p className="text-[9px] opacity-60">Aluno atingiu 2.450 XP no mês atual</p>
                        </div>
                     </div>
                     <span className="text-green-400 font-serif italic text-xl">- R$ 19,90</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-baseline">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Total a Pagar</span>
                     <span className="text-4xl font-serif italic text-white">R$ 179,10</span>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-serif italic text-[#141414]">Cofre de Documentos</h3>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-1">Conformidade AREA FIT - POP.SGQ.04</p>
                  </div>
                  <button className="p-4 bg-[#141414]/5 rounded-2xl hover:bg-[#141414] hover:text-white transition-all">
                     <Download className="w-5 h-5" />
                  </button>
               </div>

               <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex items-center gap-6 group hover:border-[#141414]/20 transition-all">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                         doc.status === 'Assinado' ? 'bg-green-100 text-green-600' : 
                         doc.status === 'Pendente' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                       }`}>
                          <doc.icon className="w-6 h-6" />
                       </div>
                       
                       <div className="flex-1">
                          <h5 className="text-sm font-bold text-[#141414]">{doc.name}</h5>
                          <div className="flex items-center gap-4 mt-1">
                             <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{doc.date}</span>
                             <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                               doc.status === 'Assinado' ? 'text-green-600' : 
                               doc.status === 'Pendente' ? 'text-yellow-600' : 'text-red-600'
                             }`}>
                                {doc.status === 'Assinado' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                {doc.status === 'Pendente' && <Clock className="w-2.5 h-2.5" />}
                                {doc.status === 'Vencido' && <XCircle className="w-2.5 h-2.5" />}
                                {doc.status}
                             </span>
                          </div>
                       </div>

                       <div className="flex items-center gap-2">
                          <button className="px-4 py-2 border border-gray-200 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all">Visualizar</button>
                          {doc.status !== 'Assinado' && (
                             <button className="px-4 py-2 bg-[#141414] text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg">Solicitar Assinatura</button>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Quality Policy Widget */}
            <div className="bg-gray-900 border border-white/10 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="flex items-center gap-6">
                  <div className="p-5 bg-green-500/20 rounded-3xl">
                     <Shield className="w-10 h-10 text-green-400" />
                  </div>
                  <div>
                     <h4 className="text-xl font-serif italic">Compromisso com a Qualidade</h4>
                     <p className="text-[10px] font-medium text-white/50 mt-2 max-w-sm leading-relaxed">Este aluno aceitou formalmente a Política de Qualidade AREA FIT e as normas de segurança do tatame.</p>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-2">
                  <span className="text-[8px] font-mono uppercase text-green-400 tracking-[0.3em]">Validado pela Auditoria</span>
                  <div className="px-6 py-2 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">Ativo / Conforme</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, value }: any) {
  return (
    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
       <Icon className="w-4 h-4 text-yellow-400" />
       <span className="text-[10px] font-mono text-white/60">{value}</span>
    </div>
  );
}

function HealthStat({ label, value }: any) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center">
       <p className="text-[8px] font-black uppercase text-gray-400 tracking-tighter mb-1">{label}</p>
       <p className="text-sm font-bold text-[#141414]">{value}</p>
    </div>
  );
}
