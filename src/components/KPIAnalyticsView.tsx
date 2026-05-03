import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, CheckCircle2, Activity,
  PieChart as PieIcon, LineChart as LineIcon, ShieldCheck, 
  Trash2, Database, Clock, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  profile: UserProfile;
}

interface KPIStats {
  volumeOccurrences: { month: string, count: number }[];
  recurrenceIndex: { cause: string, value: number }[];
  effectivenessRate: number;
  avgLeadTime: number;
  retentionPolicy: string;
  lastCleanup: string;
}

export default function KPIAnalyticsView({ profile }: Props) {
  const [data, setData] = useState<KPIStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isStrategicUser = profile.role === 'direction' || profile.role === 'partner';

  useEffect(() => {
    fetch(`/api/analytics/kpis?tenant_id=${profile.tenantId}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, [profile.tenantId]);

  if (loading) return <div className="p-20 text-center animate-pulse font-mono uppercase tracking-widest text-[#141414]/40">Sincronizando BI Engine...</div>;
  if (!data) return null;

  // Access Control Guard
  if (!isStrategicUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 space-y-6">
        <div className="p-6 bg-red-50 text-red-600 rounded-full border border-red-100">
           <ShieldCheck className="w-12 h-12" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-serif italic text-[#141414]">Acesso Restrito</h2>
          <p className="text-sm font-serif italic text-[#141414]/60 mt-4">
            Relatórios estratégicos e indicadores de governança são reservados à Alta Direção e Coordenação Técnica (Saavedra/Alves).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 p-8">
      <div className="flex items-center justify-between border-b border-tq-silver pb-6">
        <div>
          <h2 className="text-3xl font-serif italic text-tq-black">Motor de Analytics SGQ</h2>
          <p className="text-[10px] font-bold text-tq-gray/40 uppercase tracking-[0.2em] mt-1">Total Quality Business Intelligence • POP.SGQ.12</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-tq-gray text-white rounded-2xl shadow-xl shadow-tq-black/20">
          <Zap className="w-4 h-4 text-tq-orange fill-tq-orange" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Eficácia Real: {data.effectivenessRate}%</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <IndicatorCard 
          label="Volume Mensal (NCs)" 
          value={data.volumeOccurrences[data.volumeOccurrences.length - 1].count} 
          target={5} 
          unit=""
          desc="Limite máximo por unidade"
          inverse
          color="tq-red"
        />
        <IndicatorCard 
          label="SLA Médio Fechamento" 
          value={data.avgLeadTime} 
          target={30} 
          unit=" dias"
          color="tq-blue"
          desc="Lead time entre NC e Fechamento"
          inverse
        />
        <IndicatorCard 
          label="Índice de Eficácia" 
          value={data.effectivenessRate} 
          target={90} 
          unit="%"
          color="tq-green"
          desc="Taxa de sucesso dos planos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="tq-card p-10 space-y-8 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-tq-gray/50">
              <LineIcon className="w-4 h-4" /> TRENDLINE • NC VOLUME (JAN-ABR)
            </h3>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${data.volumeOccurrences.some(v => v.count > 5) ? 'bg-tq-red/10 text-tq-red' : 'bg-tq-green/10 text-tq-green'}`}>
              THRESHOLD: 5 NC/UNIT
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.volumeOccurrences}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="count" stroke="#2D2D2D" strokeWidth={5} dot={{ r: 6, fill: '#2D2D2D', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="target" stroke="#F44336" strokeDasharray="8 8" opacity={0.4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ishikawa Breakdown */}
        <div className="tq-card p-10 space-y-8 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-tq-gray/50">
              <PieIcon className="w-4 h-4" /> ANALYSIS • ROOT CAUSE (6M)
            </h3>
          </div>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="w-full h-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.recurrenceIndex}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      '#2D2D2D', // Anthracite
                      '#2196F3', // Blue
                      '#FF9800', // Orange
                      '#8BC34A', // Green
                      '#F44336', // Red
                      '#9CA3AF'  // Silver/Gray
                    ].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
               {data.recurrenceIndex.map((item, id) => (
                 <div key={id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: [
                      '#2D2D2D', '#2196F3', '#FF9800', '#8BC34A', '#F44336', '#9CA3AF'
                    ][id % 6] }} />
                    <div className="leading-none">
                       <p className="text-[10px] font-black uppercase text-tq-black">{item.cause}</p>
                       <p className="text-[12px] font-mono font-bold text-tq-gray/40">{item.value}%</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Governance & Retention Panel */}
      <section className="bg-white border border-tq-silver rounded-[2.5rem] p-10 space-y-10 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-tq-blue/5 rounded-full -mr-32 -mt-32 blur-3xl" />
         <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
               <div className="p-5 bg-tq-paper rounded-2xl border border-tq-silver shadow-sm"><Database className="w-8 h-8 text-tq-black" /></div>
               <div>
                  <h3 className="text-2xl font-serif italic text-tq-black leading-tight">Governança e Mapeamento de Ativos</h3>
                  <p className="text-[10px] font-bold text-tq-gray/40 uppercase tracking-[0.3em] mt-1">Digital Compliance Strategy • UNIT: {profile.tenantId.toUpperCase()}</p>
               </div>
            </div>
            <div className="text-right">
               <div className="tq-badge bg-tq-green/10 text-tq-green border border-tq-green/20">Active Node</div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="bg-tq-paper p-8 rounded-2xl border border-tq-silver/50 space-y-4 group hover:bg-white hover:shadow-xl transition-all">
               <div className="flex items-center gap-3 text-tq-blue">
                  <Clock className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Prazo de Retenção</span>
               </div>
               <p className="text-3xl font-serif italic font-black text-tq-black">{data.retentionPolicy}</p>
               <p className="text-[10px] font-bold text-tq-gray/40 uppercase tracking-widest leading-tight">HISTÓRICO RAC ARQUIVADO EM COLD STORAGE</p>
            </div>

            <div className="bg-tq-paper p-8 rounded-2xl border border-tq-silver/50 space-y-4 group hover:bg-white hover:shadow-xl transition-all">
               <div className="flex items-center gap-3 text-tq-red">
                  <Trash2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Descarte Seguro</span>
               </div>
               <p className="text-xl font-serif italic font-bold">Flush: {new Date(data.lastCleanup).toLocaleDateString()}</p>
               <p className="text-[10px] font-bold text-tq-gray/40 uppercase tracking-widest leading-tight">ZERO-KNOWLEDGE PURGE PROTOCOL ACTIVE</p>
            </div>

            <div className="bg-tq-paper p-8 rounded-2xl border border-tq-silver/50 space-y-4 group hover:bg-white hover:shadow-xl transition-all">
               <div className="flex items-center gap-3 text-tq-black">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Acesso Auditável</span>
               </div>
               <p className="text-xl font-serif italic text-tq-blue font-bold">{profile.displayName.toUpperCase()}</p>
               <p className="text-[10px] font-bold text-tq-gray/40 uppercase tracking-widest leading-tight">ACCESS LOGS ENCRYPTED & SIGNED</p>
            </div>
         </div>
      </section>
    </div>
  );
}

function IndicatorCard({ label, value, target, unit, desc, inverse = false, color = 'tq-blue' }: { label: string, value: number, target: number, unit: string, desc: string, inverse?: boolean, color?: string }) {
  const isOk = inverse ? value <= target : value >= target;
  
  return (
    <div className="tq-card p-8 bg-white space-y-6 group hover:border-tq-blue/30 transition-all">
       <h4 className="text-[10px] font-black uppercase tracking-widest text-tq-gray/30">{label}</h4>
       <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
             <span className="text-5xl font-serif italic font-black text-tq-black">{value}</span>
             <span className="text-xs font-black uppercase text-tq-gray/20">{unit}</span>
          </div>
          <div className={`p-4 rounded-2xl shadow-inner ${isOk ? 'bg-tq-green/10 text-tq-green' : 'bg-tq-red/10 text-tq-red'}`}>
             <TrendingUp className={`w-6 h-6 ${!isOk && 'rotate-180'} transition-transform duration-500`} />
          </div>
       </div>
       <div className="pt-6 border-t border-tq-silver/50">
          <div className="flex items-center justify-between">
             <p className="text-[9px] text-tq-gray/50 font-bold uppercase tracking-tighter">
                Meta: {inverse ? '≤' : '≥'} {target}{unit}
             </p>
             <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-tq-green animate-pulse' : 'bg-tq-red'}`} />
                <span className="text-[8px] font-black uppercase tracking-widest text-tq-gray/30">{isOk ? 'Nominal' : 'Crítico'}</span>
             </div>
          </div>
          <p className="text-[9px] text-tq-gray/30 mt-2 italic font-serif">{desc}</p>
       </div>
    </div>
  );
}
