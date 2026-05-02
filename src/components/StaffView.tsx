import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { Users, Shield, UserCheck, GraduationCap, ChevronDown, Network } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  profile: UserProfile;
}

const ROLES: { id: UserRole; label: string; icon: any; color: string }[] = [
  { id: 'direction', label: 'Direção Geral', icon: Shield, color: 'bg-red-500' },
  { id: 'partner', label: 'Sócios', icon: UserCheck, color: 'bg-blue-500' },
  { id: 'technical_advice', label: 'Assessoria Técnica', icon: Network, color: 'bg-green-500' },
  { id: 'teacher', label: 'Professores', icon: GraduationCap, color: 'bg-orange-500' },
];

export default function StaffView({ profile }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('tenantId', '==', profile.tenantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    return () => unsubscribe();
  }, [profile.tenantId]);

  const usersByRole = (role: UserRole) => users.filter(u => u.role === role);

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#141414] text-white rounded-lg"><Users className="w-5 h-5" /></div>
        <div>
          <h2 className="text-2xl font-serif italic text-[#141414]">Equipe & Organograma</h2>
          <p className="text-xs font-mono text-[#141414]/50 uppercase">Estrutura de Governança da AREA FIT</p>
        </div>
      </div>

      {/* Visual Organogram */}
      <div className="flex flex-col items-center gap-8 p-12 bg-white rounded-3xl border border-[#141414]/10 shadow-sm overflow-x-auto min-w-max md:min-w-0">
        {ROLES.map((roleDef, index) => (
          <React.Fragment key={roleDef.id}>
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center gap-2 px-6 py-2 bg-[#141414] text-white rounded-full shadow-lg">
                <roleDef.icon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{roleDef.label}</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                {usersByRole(roleDef.id).map(user => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={user.id} 
                    className="flex flex-col items-center bg-[#E4E3E0] p-4 rounded-2xl min-w-[140px] text-center border border-black/5 hover:border-black/20 transition-all hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <span className="text-xs font-bold text-[#141414]">{user.displayName.charAt(0)}</span>
                    </div>
                    <p className="text-xs font-bold truncate w-full">{user.displayName}</p>
                    <p className="text-[9px] text-[#141414]/50 uppercase truncate w-full">{user.email}</p>
                  </motion.div>
                ))}
                {usersByRole(roleDef.id).length === 0 && (
                  <div className="p-4 border border-dashed border-[#141414]/20 rounded-2xl text-[10px] text-[#141414]/30 uppercase italic">
                    Nenhum membro
                  </div>
                )}
              </div>
            </div>
            
            {index < ROLES.length - 1 && (
              <div className="flex flex-col items-center py-2">
                <div className="w-px h-8 bg-[#141414]/20" />
                <ChevronDown className="w-4 h-4 text-[#141414]/20" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Role Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ROLES.map(role => (
          <div key={role.id} className="bg-white p-6 rounded-2xl border border-[#141414]/10 shadow-sm border-t-4 border-t-[#141414]/80">
            <div className="flex items-center justify-between mb-4">
              <role.icon className="w-5 h-5 text-[#141414]/60" />
              <span className="text-xs font-mono bg-[#E4E3E0] px-2 py-0.5 rounded">{usersByRole(role.id).length}</span>
            </div>
            <h4 className="text-sm font-bold uppercase mb-2">{role.label}</h4>
            <p className="text-[10px] text-[#141414]/60 leading-relaxed italic">
              {getRoleDescription(role.id)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'direction': return 'Responsável pela estratégia global, aprovação final da POL-AF-001 e alocação de recursos.';
    case 'partner': return 'Governança compartilhada, supervisão financeira e alinhamento com a identidade AREA FIT.';
    case 'technical_advice': return 'Especialistas responsáveis pela qualidade técnica dos treinos e conformidade documental.';
    case 'teacher': return 'Agentes operacionais que garantem a aplicação prática da política da qualidade no salão.';
    default: return '';
  }
}
