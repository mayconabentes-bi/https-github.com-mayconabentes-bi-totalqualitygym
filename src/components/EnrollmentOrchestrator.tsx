import React, { useState } from 'react';
import { 
  User, Shield, Fingerprint, CreditCard, 
  CheckCircle2, AlertTriangle, Zap, Lock, 
  Unlock, FileCheck, Info, ArrowRight,
  ShieldCheck, Smartphone, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnrollmentStep } from '../types';

interface Props {
  tenantId: string;
  onComplete: (data: any) => void;
}

export default function EnrollmentOrchestrator({ tenantId, onComplete }: Props) {
  const [step, setStep] = useState<EnrollmentStep>('IDENTIDADE');
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    planId: 'black_anual',
    biometryHash: '',
    qualityPolicyAccepted: false,
    guardianName: '',
    guardianCpf: '',
    isMinor: false
  });

  const steps: { id: EnrollmentStep; label: string; icon: any }[] = [
    { id: 'IDENTIDADE', label: 'Identidade', icon: User },
    { id: 'PLANO', label: 'Plano', icon: Zap },
    { id: 'BIOMETRIA', label: 'Biometria', icon: Fingerprint },
    { id: 'ASSINATURA', label: 'Assinatura', icon: FileCheck },
    { id: 'PAGAMENTO', label: 'Pagamento', icon: CreditCard },
  ];

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, cpf: val });
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    return Math.floor((new Date().getTime() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
  };

  const canProceed = () => {
    if (step === 'IDENTIDADE') return formData.name && formData.cpf && formData.birthDate;
    if (step === 'BIOMETRIA') return formData.biometryHash.length > 20;
    if (step === 'ASSINATURA') return formData.qualityPolicyAccepted;
    return true;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[3rem] shadow-2xl overflow-hidden max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <div className="bg-gray-50 border-b border-gray-100 p-8 flex justify-between">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = steps.findIndex(x => x.id === step) > idx;

          return (
            <div key={s.id} className="flex flex-col items-center gap-2 relative">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                 isActive ? 'bg-[#141414] text-white shadow-xl scale-110' : 
                 isDone ? 'bg-green-100 text-green-600' : 'bg-white text-gray-300 border border-gray-100'
               }`}>
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
               </div>
               <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-[#141414]' : 'text-gray-300'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Form Area */}
      <div className="p-12 min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 'IDENTIDADE' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="NOME COMPLETO" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} placeholder="Ex: Maycon Alves" />
                  <Input label="CPF" value={formData.cpf} onChange={(v) => setFormData({...formData, cpf: v})} placeholder="000.000.000-00" />
                  <Input label="DATA NASCIMENTO" type="date" value={formData.birthDate} onChange={(v) => setFormData({...formData, birthDate: v})} />
               </div>

               {calculateAge(formData.birthDate) < 18 && calculateAge(formData.birthDate) > 0 && (
                 <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-3xl space-y-4 animate-in slide-in-from-top">
                    <div className="flex items-center gap-3 text-yellow-700">
                       <Shield className="w-5 h-5" />
                       <h4 className="text-xs font-black uppercase tracking-widest">Responsável Legal Obrigatório</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <Input label="NOME DO RESPONSÁVEL" value={formData.guardianName} onChange={(v) => setFormData({...formData, guardianName: v})} />
                       <Input label="CPF DO RESPONSÁVEL" value={formData.guardianCpf} onChange={(v) => setFormData({...formData, guardianCpf: v})} />
                    </div>
                 </div>
               )}
            </motion.div>
          )}

          {step === 'BIOMETRIA' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center space-y-6">
                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-gray-200">
                   <Fingerprint className="w-16 h-16 text-gray-300" />
                </div>
                <h3 className="text-2xl font-serif italic">Captura de Biometria Facial</h3>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Integrado com Módulo 14 (Acesso)</p>
                
                <div className="max-w-xs mx-auto">
                   <Input 
                      label="FACE-ID HASH (SIMULADO)" 
                      value={formData.biometryHash} 
                      onChange={(v) => setFormData({...formData, biometryHash: v})} 
                      placeholder="8f7d9a1c6e4b2... [CHAVE CRIPTOGRÁFICA]"
                      icon={Hash}
                   />
                </div>
             </motion.div>
          )}

          {step === 'ASSINATURA' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden">
                   <ShieldCheck className="absolute top-0 right-0 p-10 opacity-10 w-40 h-40" />
                   <h3 className="text-2xl font-serif italic mb-4">Termos de Conformidade (POL-AF-001)</h3>
                   <p className="text-xs text-white/60 leading-relaxed max-w-lg mb-8">
                      O contratante declara estar ciente de todas as normas de segurança, política de cancelamento e regras de conduta AREA FIT. O descumprimento destas normas pode resultar no bloqueio imediato do acesso biométrico via SGQ.
                   </p>
                   <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.qualityPolicyAccepted ? 'bg-green-500 border-green-500' : 'border-white/20 group-hover:border-white/50'}`}>
                         <input 
                           type="checkbox" 
                           className="hidden" 
                           checked={formData.qualityPolicyAccepted} 
                           onChange={() => setFormData({...formData, qualityPolicyAccepted: !formData.qualityPolicyAccepted})} 
                         />
                         {formData.qualityPolicyAccepted && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Aceito formalmente a Política da Qualidade</span>
                   </label>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
         <button 
           onClick={() => setStep(steps[Math.max(0, steps.findIndex(s => s.id === step) - 1)].id)}
           disabled={step === 'IDENTIDADE'}
           className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#141414] disabled:opacity-0 transition-all"
         >
            Anterior
         </button>
         
         <div className="flex items-center gap-4">
            <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">Sessão Segura: {tenantId.slice(0,8)}</p>
            <button 
               onClick={() => {
                 const currentIdx = steps.findIndex(s => s.id === step);
                 if (currentIdx < steps.length - 1) {
                   setStep(steps[currentIdx + 1].id);
                 } else {
                   onComplete(formData);
                 }
               }}
               disabled={!canProceed()}
               className="px-10 py-5 bg-[#141414] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl disabled:opacity-20 active:scale-95 transition-all flex items-center gap-2"
            >
               {step === 'PAGAMENTO' ? 'Finalizar Matrícula' : 'Continuar'} <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 block px-1">{label}</label>
       <div className="relative">
          {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />}
          <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#141414] outline-none transition-all ${Icon ? 'pl-14' : ''}`}
          />
       </div>
    </div>
  );
}
