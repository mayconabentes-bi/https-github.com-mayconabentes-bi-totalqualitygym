import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  BarChart3, 
  FileText, 
  Target, 
  Users, 
  Settings,
  ChevronRight,
  TrendingUp,
  Award,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  Zap,
  Box,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import QualityPolicyView from './QualityPolicyView';
import StrategicPlanningView from './StrategicPlanningView';
import StaffView from './StaffView';
import KPIAnalyticsView from './KPIAnalyticsView';
import QualityCheckInView from './QualityCheckInView';
import AuditManagementView from './AuditManagementView';
import AuditorPerformanceDashboard from './AuditorPerformanceDashboard';
import NonConformityRegister from './NonConformityRegister';
import RACManagement from './RACManagement';
import WarriorRankView from './WarriorRankView';
import SecretariatDashboard from './SecretariatDashboard';
import StudentProfileManagement from './StudentProfileManagement';
import InstructorMasterConsole from './InstructorMasterConsole';
import AssetHealthMonitor from './AssetHealthMonitor';
import EnrollmentOrchestrator from './EnrollmentOrchestrator';
import UnitManagementDashboard from './UnitManagementDashboard';

interface DashboardProps {
  profile: UserProfile;
}

type Tab = 'overview' | 'policy' | 'planning' | 'staff' | 'analytics' | 'checkin' | 'audit' | 'performance' | 'nc' | 'rac' | 'ranks' | 'secretary' | 'student_profile' | 'instructor_class' | 'assets' | 'new_enrollment' | 'expansion';

export default function Dashboard({ profile }: DashboardProps) {
  // Local state for role switching (Dev Mode)
  const [currentRole, setCurrentRole] = useState(profile.role);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const isTeacher = currentRole === 'teacher';
  const isDirection = ['direction', 'partner'].includes(currentRole);
  const isTechnical = currentRole === 'technical_advice';

  const [activeTab, setActiveTab] = useState<Tab>(isTeacher ? 'instructor_class' : 'overview');

  // Expose navigation to global window for complex component interactions
  React.useEffect(() => {
    (window as any).navigateDashboard = (tab: Tab) => {
      setActiveTab(tab);
    };
    return () => {
      delete (window as any).navigateDashboard;
    };
  }, []);

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3, roles: ['direction', 'partner', 'technical_advice'] },
    { id: 'ranks', label: 'Nível de Guerreiro', icon: Award, roles: ['direction', 'partner', 'technical_advice', 'teacher', 'student', 'secretary'] },
    { id: 'instructor_class', label: 'Aula Ativa', icon: Zap, roles: ['teacher'] },
    { id: 'secretary', label: 'Secretaria', icon: Users, roles: ['direction', 'partner', 'secretary'] },
    { id: 'nc', label: 'Registro de NC', icon: AlertTriangle, roles: ['direction', 'partner', 'technical_advice', 'teacher'] },
    { id: 'rac', label: 'Gestão RAC/6M', icon: ClipboardCheck, roles: ['direction', 'partner', 'technical_advice'] },
    { id: 'assets', label: 'Infra & Ativos', icon: Box, roles: ['direction', 'partner', 'technical_advice', 'teacher'] },
    { id: 'expansion', label: 'Expansão de Rede', icon: Globe, roles: ['direction', 'partner'] },
    { id: 'analytics', label: 'KPI & Performance', icon: TrendingUp, roles: ['direction', 'partner', 'technical_advice'] },
    { id: 'performance', label: 'Ranking de Auditores', icon: Award, roles: ['direction', 'partner'] },
    { id: 'policy', label: 'Gestão de Qualidade', icon: FileText, roles: ['direction', 'partner', 'technical_advice', 'teacher'] },
    { id: 'checkin', label: 'Check-in Diário', icon: ClipboardCheck, roles: ['teacher'] },
    { id: 'audit', label: 'Auditoria Interna', icon: Calendar, roles: ['direction', 'partner', 'technical_advice'] },
    { id: 'planning', label: 'Planejamento', icon: Target, roles: ['direction', 'partner', 'technical_advice'] },
    { id: 'staff', label: 'Organograma', icon: Users, roles: ['direction', 'partner', 'technical_advice'] },
  ].filter(item => !item.roles || item.roles.includes(currentRole));

  // Sync active tab if role changes and current tab is no longer available
  React.useEffect(() => {
    const isTabVisible = navItems.some(item => item.id === activeTab);
    if (!isTabVisible) {
      setActiveTab(isTeacher ? 'instructor_class' : 'overview');
    }
  }, [currentRole]);

  const renderContent = () => {
    // Create a temporary profile with the selected role for child components
    const effectiveProfile = { ...profile, role: currentRole };

    switch (activeTab) {
      case 'instructor_class':
        return <InstructorMasterConsole profile={effectiveProfile} />;
      case 'ranks':
        return <WarriorRankView profile={effectiveProfile} />;
      case 'policy':
        return <QualityPolicyView profile={effectiveProfile} />;
      case 'planning':
        return <StrategicPlanningView profile={effectiveProfile} />;
      case 'staff':
        return <StaffView profile={effectiveProfile} />;
      case 'analytics':
        return <KPIAnalyticsView profile={effectiveProfile} />;
      case 'checkin':
        return <QualityCheckInView profile={effectiveProfile} />;
      case 'audit':
        return <AuditManagementView profile={effectiveProfile} />;
      case 'performance':
        return <AuditorPerformanceDashboard profile={effectiveProfile} />;
      case 'nc':
        return <NonConformityRegister profile={effectiveProfile} />;
      case 'rac':
        return <RACManagement profile={effectiveProfile} />;
      case 'assets':
        return <AssetHealthMonitor profile={effectiveProfile} />;
      case 'expansion':
        return <UnitManagementDashboard profile={effectiveProfile} />;
      case 'new_enrollment':
        return <EnrollmentOrchestrator tenantId={effectiveProfile.tenantId} onComplete={() => setActiveTab('secretary')} />;
      case 'secretary':
        return <SecretariatDashboard 
          profile={effectiveProfile} 
          onSelectStudent={(student) => {
            setSelectedStudent(student);
            setActiveTab('student_profile');
          }} 
        />;
      case 'student_profile':
        return <StudentProfileManagement profile={selectedStudent} onBack={() => setActiveTab('secretary')} />;
      case 'overview':
      default:
        return isTeacher ? <QualityCheckInView profile={effectiveProfile} /> : <Overview profile={effectiveProfile} onNavigate={(tab) => setActiveTab(tab as Tab)} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-81px)] bg-slate-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-sm">
        <div className="p-8 border-b border-slate-800/50 bg-slate-900/50">
          {/* Role Switcher (Persona Selector) */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] px-1">ESPAÇO DE TRABALHO</p>
            <div className="relative group">
              <select 
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-8 text-xs font-medium text-slate-300 appearance-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer"
              >
                <option value="direction">Sócio Diretor (Estratégico)</option>
                <option value="technical_advice">Assessoria (Tático)</option>
                <option value="secretary">Secretaria (Operacional)</option>
                <option value="teacher">Professor (Operacional)</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90" />
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group relative ${
                  isActive 
                    ? 'text-amber-400 bg-amber-400/5 shadow-sm border border-amber-400/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {isActive && <motion.div layoutId="active-bar" className="absolute left-0 w-1 h-6 bg-amber-500 rounded-r-max" />}
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-6 mt-auto">
          <div className="bg-slate-950 border border-slate-800 text-slate-300 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">CERTINTEGRITY</p>
            <p className="font-medium text-slate-50 text-sm leading-tight tracking-wide">TOTAL QUALITY<br/><span className="text-amber-500">MESTRE 2026</span></p>
            <div className="mt-4 flex gap-1">
               <div className="h-1 flex-1 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
               <div className="h-1 flex-1 bg-slate-800 rounded-full" />
               <div className="h-1 flex-1 bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="h-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function Overview({ profile, onNavigate }: { profile: UserProfile, onNavigate: (tab: string) => void }) {
  return (
    <div className="space-y-10 p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-800">
        <div className="space-y-2">
          <h2 className="text-3xl tracking-tight text-slate-50 font-medium">
            System Cockpit <span className="text-amber-500 font-mono text-sm ml-2 px-2 py-1 bg-amber-500/10 rounded-md">/// ADMIN</span>
          </h2>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em]">
            Governance Portal • UNIT: {profile.tenantId.toUpperCase()} • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">SISTEMA NOMINAL</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => onNavigate('ranks')} className="cursor-pointer">
          <StatCard 
            icon={Zap} 
            label="Cashback / XP Bruto" 
            value="15.4k" 
            sub="R$ 154.00 convertidos" 
            color="amber-500"
          />
        </div>
        <div onClick={() => onNavigate('analytics')} className="cursor-pointer">
          <StatCard 
            icon={TrendingUp} 
            label="Performance MRR" 
            value="84%" 
            sub="↑ 12% vs mês anterior" 
            color="emerald-500"
          />
        </div>
        <div onClick={() => onNavigate('nc')} className="cursor-pointer">
          <StatCard 
             icon={AlertTriangle} 
             label="Ativos Críticos" 
             value="02" 
             sub="Pulse lockdown ativo" 
             color="red-500"
          />
        </div>
        <div onClick={() => onNavigate('expansion')} className="cursor-pointer">
          <StatCard 
            icon={Globe} 
            label="Deployments" 
            value="05" 
            sub="Edge nodes sincronizados" 
            color="slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 stark-card p-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-medium flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                <BarChart3 className="w-5 h-5" />
              </div>
              Telemetry & OKRs
            </h3>
            <button className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors">Visualizar Logs</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              {[
                { label: 'Retenção Ativa (LTV)', progress: 92, status: 'NOMINAL', color: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' },
                { label: 'Qualificação IQS', progress: 65, status: 'WARNING', color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]' },
                { label: 'Compliance de Ativos', progress: 100, status: 'SECURE', color: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' },
              ].map((meta, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">{meta.status}</p>
                      <h4 className="text-sm font-medium text-slate-200">{meta.label}</h4>
                    </div>
                    <span className="text-xl font-mono text-slate-50">{meta.progress}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${meta.progress}%` }}
                      className={`h-full ${meta.color} ${meta.shadow}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-950/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center border dashed border-slate-800">
                <div className="w-16 h-16 bg-slate-900 border border-amber-500/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                   <TrendingUp className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="font-medium text-lg mb-2 text-slate-50">Sincronia Estável</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">Edge Nodes operacionais. Motor de XP e Cashback convergindo em tempo real.</p>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-mono rounded-md">Status: Ótimo</div>
            </div>
          </div>
        </div>

        <div className="stark-card p-0 flex flex-col">
          <div className="p-8 border-b border-slate-800 bg-slate-900">
            <h3 className="text-lg font-medium flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              Event Stream
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {[
              { text: '[DOC] Política Rev 04 comitada', time: '2h atrás', color: 'slate-500' },
              { text: '[SGQ] Nova Entidade Adicionada', time: '1 dia atrás', color: 'slate-400' },
              { text: '[KPI] Threshold Adjust by Admin', time: '3 dias atrás', color: 'emerald-500' },
              { text: '[ALERT] Edge Sync Failed - Retry 3', time: '4 dias atrás', color: 'red-500' },
              { text: '[XP] Granular Drop (Decay) Triggered', time: '1 sem atrás', color: 'amber-500' },
            ].map((activity, i) => (
              <div key={i} className="px-8 py-5 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-all cursor-pointer group relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${activity.color} shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${activity.color}`} />
                    <span className="text-[10px] text-slate-500 font-mono">{activity.time}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors leading-snug font-mono">{activity.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'slate-400' }: { icon: any, label: string, value: string, sub: string, color?: string }) {
  return (
    <div className="stark-card p-8 group relative cursor-pointer">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-[2] duration-700`} />
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className={`p-3 bg-slate-950 border border-slate-800 rounded-xl text-${color} transition-all group-hover:-translate-y-1`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">{label}</span>
      </div>
      <p className="text-4xl font-mono text-slate-50 mb-2 tracking-tight relative z-10">{value}</p>
      <div className="flex items-center gap-2 relative z-10">
         <div className={`w-1.5 h-1.5 rounded-full bg-${color} shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${color}`} />
         <p className="text-xs text-slate-400 font-mono leading-none">{sub}</p>
      </div>
    </div>
  );
}
