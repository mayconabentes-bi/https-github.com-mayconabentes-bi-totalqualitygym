import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Zap, TrendingUp, 
  Crown, Star, Users, Filter, 
  Flame, Shield, Swords, Target, Search, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, GamificationProfile, StudentHealthScore } from '../types';

interface Props {
  profile: UserProfile;
}

export default function WarriorRankView({ profile }: Props) {
  const [ranking, setRanking] = useState<any[]>([]);
  const [champions, setChampions] = useState<any[]>([]);
  const [health, setHealth] = useState<StudentHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ modality: 'Todos', category: 'Todas' });
  const [activeTab, setActiveTab] = useState<'global' | 'modality' | 'quality'>('global');

  // Formula: L = (xp/100)^(1/1.5) + 1
  // Inverse: xp = 100 * (L - 1)^1.5
  const calculateLevel = (xp: number) => Math.floor(Math.pow(xp / 100, 1 / 1.5)) + 1;
  const xpForLevel = (level: number) => Math.floor(100 * Math.pow(level - 1, 1.5));

  // Mocked Gamification Profile for development
  const myXp = 15400;
  const myLevel = calculateLevel(myXp);
  const xpCurrent = xpForLevel(myLevel);
  const xpNext = xpForLevel(myLevel + 1);
  const progressPercent = Math.floor(((myXp - xpCurrent) / (xpNext - xpCurrent)) * 100);

  const myStats: GamificationProfile = {
    id: 'g1',
    userId: profile.id,
    tenantId: profile.tenantId,
    totalXp: myXp,
    level: myLevel,
    warriorRank: myLevel > 10 ? 'Praticante (Tier 2)' : 'Iniciante (Tier 1)',
    badges: ['Guardião da Conformidade', 'Olho Clínico', 'Detetive do Tatame'],
    streakDays: 12,
    modality: 'Jiu Jitsu',
    graduation: 'Faixa Roxa',
    gender: 'M'
  };

  useEffect(() => {
    setLoading(true);
    const rankingUrl = `/api/gamification/ranking?tenant_id=${profile.tenantId}&modality=${filter.modality}&category=${filter.category}`;
    const championsUrl = `/api/gamification/quality-champions?tenant_id=${profile.tenantId}`;
    const healthUrl = `/api/crm/student-health/${profile.id}`;
    
    const safeFetch = async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const text = await response.text();
        return text ? JSON.parse(text) : null;
      } catch (e) {
        console.error(`Fetch error for ${url}:`, e);
        return null;
      }
    };

    Promise.all([
      safeFetch(rankingUrl),
      safeFetch(championsUrl),
      safeFetch(healthUrl)
    ]).then(([rankingData, championsData, healthData]) => {
      setRanking(rankingData || []);
      setChampions(championsData || []);
      setHealth(healthData);
      setLoading(false);
    });
  }, [profile.id, profile.tenantId, filter.modality, filter.category]);

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Guardião da Conformidade': return <Shield className="w-6 h-6" />;
      case 'Olho Clínico': return <Target className="w-6 h-6" />;
      case 'Auditor de Elite': return <Crown className="w-6 h-6" />;
      case 'Mestre do PDCA': return <Zap className="w-6 h-6" />;
      case 'Detetive do Tatame': return <Search className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 p-8">
      {/* Social Progress Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-tq-gray text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/10">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform hidden md:block">
              <Shield className="w-64 h-64 rotate-12" />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-tq-blue p-1 bg-white/10 overflow-hidden shadow-[0_0_30px_rgba(33,150,243,0.2)]">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}`} 
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                 </div>
                 <div className="absolute -bottom-2 right-2 md:right-4 bg-tq-blue text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter shadow-xl">
                    Lvl {myLevel}
                 </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-6">
                 <div>
                    <h2 className="text-4xl font-serif italic">{profile.displayName}</h2>
                    <p className="text-[10px] font-mono opacity-50 uppercase tracking-[0.4em] mt-1">{myStats.warriorRank}</p>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60">
                       <span className="flex items-center gap-2 text-tq-blue"><Zap className="w-3 h-3 fill-tq-blue text-tq-blue" /> {myStats.totalXp} XP</span>
                       <span className="flex items-center gap-2">Próximo: {xpNext} <ChevronRight className="w-3 h-3" /></span>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progressPercent}%` }}
                         className="h-full bg-gradient-to-r from-tq-blue to-tq-green rounded-full shadow-[0_0_20px_rgba(33,150,243,0.4)]"
                       />
                    </div>
                    <p className="text-[10px] font-serif italic opacity-40">Você está no Top 5% dos praticantes desta unidade.</p>
                 </div>

                 <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <StatBadge icon={Flame} label={`${myStats.streakDays} Dias`} desc="Frequência" color="text-tq-orange" />
                    <StatBadge icon={Trophy} label="Rank #2" desc="Unidade" color="text-tq-blue" />
                    <StatBadge icon={Heart} label={health ? `${health.engagementScore}%` : '---'} desc="Engajamento" color={health && health.engagementScore < 50 ? 'text-tq-red' : 'text-tq-green'} />
                    <StatBadge icon={Shield} label={myStats.graduation || 'Iniciante'} desc="Graduação" color="text-tq-blue" />
                 </div>
              </div>
           </div>
        </div>

        {/* Badges Quick View */}
        <div className="lg:col-span-4 tq-card p-8 md:p-10 shadow-xl flex flex-col justify-between border-tq-silver backdrop-blur-sm bg-white/80">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-tq-gray/40">Principais Conquistas</h3>
              <Award className="w-4 h-4 text-tq-orange opacity-30" />
           </div>
           <div className="grid grid-cols-3 gap-6">
              {myStats.badges.slice(0, 3).map((badge, idx) => (
                <div key={idx} className="group flex flex-col items-center gap-3 cursor-help">
                   <div className="p-5 bg-tq-paper rounded-2xl group-hover:bg-tq-gray group-hover:text-white transition-all shadow-sm border border-tq-silver">
                      {getBadgeIcon(badge)}
                   </div>
                   <span className="text-[8px] font-bold text-center uppercase tracking-normal opacity-40 group-hover:opacity-100 transition-opacity leading-tight max-w-[60px]">
                      {badge}
                   </span>
                </div>
              ))}
           </div>
           <button className="tq-button-outline w-full mt-10 py-4 text-[10px] tracking-widest uppercase">
              Ver Todas Conquistas
           </button>
        </div>
      </section>

      {/* Main Ranking Dashboard */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-tq-silver pb-6">
           <div className="text-center md:text-left">
              <h3 className="text-3xl font-serif italic text-tq-black">Arena de Maestria</h3>
              <p className="text-[10px] font-bold text-tq-gray/40 uppercase tracking-[0.2em] mt-1">Ranking de Performance & Qualidade</p>
           </div>
           
           <div className="flex flex-wrap items-center justify-center gap-4">
              <TabButton active={activeTab === 'global'} onClick={() => setActiveTab('global')} icon={Users} label="Global" />
              <TabButton active={activeTab === 'modality'} onClick={() => setActiveTab('modality')} icon={Swords} label="Modalidade" />
              <TabButton active={activeTab === 'quality'} onClick={() => setActiveTab('quality')} icon={Shield} label="Guardiões" />
           </div>
        </div>

        {/* Filters and Search */}
        <AnimatePresence mode="wait">
          {activeTab !== 'quality' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col md:flex-row gap-4 tq-card p-4 items-center"
            >
               <div className="flex-1 relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tq-gray/20" />
                  <input 
                    type="text" 
                    placeholder="Buscar guerreiro..." 
                    className="w-full pl-12 pr-4 py-3 bg-tq-paper rounded-xl outline-none text-[11px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-tq-blue/10 border border-tq-silver/50"
                  />
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                  <select 
                    value={filter.modality}
                    onChange={(e) => setFilter({ ...filter, modality: e.target.value })}
                    className="flex-1 md:w-40 px-6 py-3 bg-tq-paper border border-tq-silver/50 outline-none text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer"
                  >
                     <option>Todos</option>
                     <option>Jiu Jitsu</option>
                     <option>Muay Thai</option>
                     <option>Kids/Teens</option>
                  </select>
                  <select 
                    value={filter.category}
                    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                    className="flex-1 md:w-40 px-6 py-3 bg-tq-paper border border-tq-silver/50 outline-none text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer"
                  >
                     <option>Todas</option>
                     <option>Faixa Branca</option>
                     <option>Faixa Azul</option>
                     <option>Faixa Roxa</option>
                     <option>Faixa Preta</option>
                  </select>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Primary Ranking List */}
           <div className={`lg:col-span-${activeTab === 'quality' ? '12' : '8'} space-y-3`}>
              {loading ? (
                <div className="p-20 text-center animate-pulse text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Sincronizando ecossistema...</div>
              ) : (
                <>
                  {(activeTab === 'quality' ? champions : ranking).map((player, idx) => (
                    <WarriorListItem key={player.id} player={player} idx={idx} isQuality={activeTab === 'quality'} />
                  ))}
                  <button className="w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 hover:text-tq-blue transition-all">
                    Explorar Todos os Guerreiros
                  </button>
                </>
              )}
           </div>

           {/* Sidebar: Quality Champions Highlight (Hidden if in Quality Tab) */}
           {activeTab !== 'quality' && (
             <div className="lg:col-span-4 space-y-6">
                <div className="tq-card p-8 space-y-6 bg-tq-paper/30">
                   <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-tq-gray/40">Guardiões de Elite</h4>
                      <Shield className="w-4 h-4 text-tq-green opacity-30" />
                   </div>
                   <div className="space-y-5">
                      {champions.slice(0, 3).map((champ, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer">
                           <div className="w-10 h-10 rounded-xl bg-white border border-tq-silver flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-tq-gray group-hover:text-white transition-all">
                              {i + 1}
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-serif italic text-tq-black">{champ.displayName}</p>
                              <p className="text-[8px] font-black uppercase text-tq-green tracking-widest leading-none mt-1">{champ.topBadge}</p>
                           </div>
                           <div className="text-[10px] font-mono text-tq-gray/30 font-bold">{champ.qualityBadges}🎖️</div>
                        </div>
                      ))}
                   </div>
                   <button 
                     onClick={() => setActiveTab('quality')}
                     className="w-full py-4 border border-dashed border-tq-silver rounded-xl text-[9px] font-bold uppercase tracking-widest text-tq-gray/40 hover:bg-white hover:text-tq-blue hover:border-tq-blue transition-all"
                   >
                     Ver Todos Guardiões
                   </button>
                </div>

                <div className="bg-gradient-to-br from-tq-orange to-[#E68A00] p-8 rounded-[2rem] text-white shadow-xl space-y-4 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                   <Star className="w-8 h-8 fill-white" />
                   <h5 className="text-xl font-serif italic leading-tight">Total Quality<br/>Mestre de Audácia</h5>
                   <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase tracking-wider">Reporte não conformidades e audite sua unidade para subir no ranking global de conformidade.</p>
                   <button className="w-full py-3 bg-tq-gray text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                      Reportar NC Agora
                   </button>
                </div>
             </div>
           )}
        </div>
      </section>
    </div>
  );
}

interface WarriorListItemProps {
  player: any;
  idx: number;
  isQuality?: boolean;
  key?: React.Key;
}

function WarriorListItem({ player, idx, isQuality = false }: WarriorListItemProps) {
  return (
    <motion.div 
       initial={{ opacity: 0, x: -20 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{ delay: idx * 0.05 }}
       className={`tq-card p-5 flex items-center gap-4 md:gap-8 group hover:border-tq-blue/50 hover:shadow-xl transition-all ${idx < 3 && !isQuality ? 'border-tq-blue/20 bg-tq-blue/5' : 'bg-white'}`}
    >
       <div className="w-8 md:w-12 text-center text-lg md:text-2xl font-serif italic text-tq-gray/20 group-hover:text-tq-blue transition-colors">
          {idx + 1}
       </div>
       
       <div className="relative">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-tq-paper border border-tq-silver overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.displayName}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          {idx === 0 && !isQuality && (
            <div className="absolute -top-2 -right-2 bg-tq-blue p-1.5 rounded-lg shadow-lg">
               <Crown className="w-3 h-3 text-white fill-white" />
            </div>
          )}
       </div>

       <div className="flex-1 space-y-1">
          <h4 className="text-sm md:text-xl font-serif italic text-tq-black">{player.displayName}</h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
             <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{player.modality}</span>
             <span className="text-[9px] font-black text-tq-orange uppercase tracking-widest flex items-center gap-1">
                <Target className="w-2 h-2" /> {player.category || 'Geral'}
             </span>
             {isQuality && (
               <span className="text-[9px] font-black text-tq-green uppercase tracking-widest flex items-center gap-1">
                 <Shield className="w-2 h-2" /> {player.topBadge}
               </span>
             )}
          </div>
       </div>

       <div className="text-right flex flex-col items-end">
          {isQuality ? (
            <>
               <div className="text-base md:text-xl font-bold font-mono text-tq-black">{player.qualityBadges}</div>
               <div className="text-[8px] font-bold text-tq-gray/30 uppercase tracking-widest">Medalhas</div>
            </>
          ) : (
            <>
               <div className="text-base md:text-xl font-bold font-mono text-tq-black">{player.totalXp} <span className="text-[9px] opacity-30">XP</span></div>
               <div className="text-[8px] font-bold text-tq-blue uppercase tracking-widest">Nível {player.level}</div>
            </>
          )}
       </div>

       <div className="hidden md:flex w-10 justify-center">
          <ChevronRight className="w-4 h-4 opacity-10 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
       </div>
    </motion.div>
  );
}

function StatBadge({ icon: Icon, label, desc, color = 'text-tq-blue' }: { icon: any, label: string, desc: string, color?: string }) {
  return (
    <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 group/badge hover:bg-white/10 transition-colors">
       <Icon className={`w-4 h-4 ${color} transition-transform group-hover/badge:scale-110`} />
       <div className="text-left">
          <p className="text-[9px] font-black uppercase tracking-tighter leading-none">{label}</p>
          <p className="text-[7px] font-bold uppercase opacity-40 tracking-widest mt-0.5">{desc}</p>
       </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all relative ${
        active 
          ? 'bg-tq-gray text-white shadow-xl scale-105' 
          : 'bg-white text-tq-gray/40 border border-tq-silver hover:bg-tq-paper hover:text-tq-gray'
      }`}
    >
       <Icon className={`w-3.5 h-3.5 ${active ? 'text-tq-blue' : ''}`} />
       {label}
    </button>
  );
}

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
