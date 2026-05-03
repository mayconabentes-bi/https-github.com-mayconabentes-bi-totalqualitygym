import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { 
  collection, query, where, onSnapshot 
} from '@/lib/supabase';
import { UserProfile } from '../types';
import { 
  Trophy, Medal, Award, TrendingUp, 
  Users, ShieldAlert, Star, Filter
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  profile: UserProfile;
}

export default function AuditorPerformanceDashboard({ profile }: Props) {
  const [auditors, setAuditors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In this app, users with specific roles or those who have been auditors are what we're looking for
    // Actually, we'll just fetch all users in the tenant and filter those who have an averageScore
    const unsub = onSnapshot(query(
      collection(db, 'users'),
      where('tenantId', '==', profile.tenantId)
    ), (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as UserProfile))
        .filter(u => u.averageScore !== undefined)
        .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
      
      setAuditors(data);
      setLoading(false);
    });

    return () => unsub();
  }, [profile.tenantId]);

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'Master': return 'bg-yellow-500 shadow-yellow-500/20';
      case 'Pleno': return 'bg-blue-500 shadow-blue-500/20';
      default: return 'bg-red-500 shadow-red-500/20';
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-8 h-8 text-yellow-400" />;
    if (index === 1) return <Medal className="w-7 h-7 text-gray-300" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-400" />;
    return null;
  };

  if (loading) return <div className="p-12 text-center animate-pulse">RANKING DE AUDITORES...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#141414]/40">
            <Award className="w-4 h-4" /> Qualificação & Performance
          </div>
          <h2 className="text-4xl font-serif italic text-[#141414]">Equipe de Auditoria</h2>
        </div>
        
        <div className="flex gap-4">
          <StatCard label="Total Auditores" value={auditors.length.toString()} icon={<Users className="w-4 h-4" />} />
          <StatCard 
            label="Média Global" 
            value={(auditors.reduce((acc, curr) => acc + (curr.averageScore || 0), 0) / (auditors.length || 1)).toFixed(1)} 
            icon={<TrendingUp className="w-4 h-4" />} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {auditors.map((auditor, index) => (
          <motion.div 
            key={auditor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-[#141414]/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-8 group hover:border-[#141414]/30 transition-all hover:shadow-xl"
          >
            {/* Rank Visual */}
            <div className="flex flex-col items-center justify-center w-16 h-16 shrink-0 relative">
               {getRankIcon(index)}
               {!getRankIcon(index) && <span className="text-2xl font-mono font-bold text-[#141414]/20">#{index + 1}</span>}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-1">
              <h3 className="text-xl font-bold text-[#141414] group-hover:tracking-tight transition-all uppercase">{auditor.displayName}</h3>
              <p className="text-xs font-mono text-[#141414]/40">{auditor.email}</p>
            </div>

            {/* Level Badge */}
            <div className="flex flex-col items-center gap-2 min-w-[140px]">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg ${getBadgeColor(auditor.auditorLevel || '')}`}>
                {auditor.auditorLevel}
              </span>
              {auditor.auditorLevel === 'Needs Training' && (
                <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold uppercase">
                  <ShieldAlert className="w-3 h-3" /> Bloqueado
                </div>
              )}
            </div>

            {/* Score Visual */}
            <div className="bg-[#141414]/5 px-8 py-4 rounded-3xl flex flex-col items-center min-w-[120px]">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-2xl font-serif italic">{auditor.averageScore?.toFixed(1)}</span>
              </div>
              <p className="text-[10px] uppercase font-bold text-[#141414]/40 tracking-widest">Média</p>
            </div>
          </motion.div>
        ))}

        {auditors.length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-[#141414]/10 rounded-[3rem]">
            <Users className="w-16 h-16 text-[#141414]/10 mx-auto mb-4" />
            <p className="text-sm font-serif italic text-[#141414]/40">Nenhum auditor avaliado até o momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#141414] text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
      <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">{label}</p>
        <p className="text-lg font-serif italic">{value}</p>
      </div>
    </div>
  );
}
