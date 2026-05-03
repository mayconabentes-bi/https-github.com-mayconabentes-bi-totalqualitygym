export type UserRole = 'direction' | 'partner' | 'technical_advice' | 'teacher' | 'secretary';

export type DocumentStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED';

export type NCSource = 'Professor' | 'Aluno/Reclamação' | 'Auditoria Interna' | 'Indicador' | 'Incidente';
export type NCGravity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type NCStatus = 'Aberta' | 'Em Análise' | 'RAC Aberta' | 'Concluída';

export interface Ishikawa6M {
  method: string[];
  manpower: string[];
  machine: string[];
  material: string[];
  environment: string[];
  measurement: string[];
}

export interface ActionPlanItem {
  id: string;
  action: string;
  responsibleId: string;
  responsibleName: string;
  deadline: string;
  executionMethod: string;
  effectivenessCriteria: string;
  status: 'Pending' | 'Completed';
  completedAt?: string;
}

export interface EffectivenessVerification {
  id: string;
  reoccurred: boolean;
  indicatorImproved: boolean;
  complaintCeased: boolean;
  technicalObservation: string;
  isEffective: boolean;
  verifiedById: string;
  verifiedAt: string;
}

export interface CorrectiveAction {
  id: string;
  ncId: string;
  tenantId: string;
  identifiedById: string;
  analysis6M: Ishikawa6M;
  rootCause: string;
  proposedAction: string; // Brief summary
  actionPlan: ActionPlanItem[];
  verification?: EffectivenessVerification;
  status: 'PLANNING' | 'IMPLEMENTING' | 'VERIFYING' | 'CLOSED' | 'REOPENED';
  createdAt: string;
  implementationDeadline?: string;
}

export interface NonConformity {
  id: string;
  tenantId: string;
  source: NCSource;
  description: string;
  immediateAction: string;
  gravity: NCGravity;
  status: NCStatus;
  identifiedById: string;
  identifiedByName: string;
  auditPlanId?: string; // Optional link to audit
  createdAt: string;
}

export interface GamificationProfile {
  id: string;
  userId: string;
  tenantId: string;
  totalXp: number;
  level: number;
  warriorRank: string;
  badges: string[];
  lastCheckinAt?: string;
  streakDays: number;
  modality: 'Jiu Jitsu' | 'Muay Thai' | 'Kids/Teens' | 'Geral';
  graduation?: string; // e.g., 'Faixa Branca', 'Faixa Azul', 'Grau 1', etc.
  gender: 'M' | 'F' | 'Prefiro não dizer';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconSlug: string;
  rarity: 'Bronze' | 'Prata' | 'Ouro';
  xpBonus: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  context?: string;
}

export type XPSource = 'CHECKIN' | 'PERFORMANCE' | 'QUALITY_REPORT' | 'GRADUATION' | 'BADGE_EARNED';

export interface XPTransaction {
  id: string;
  userId: string;
  tenantId: string;
  amount: number;
  source: XPSource;
  description: string;
  createdAt: string;
}

export type StudentLifecycleState = 'ONBOARDING' | 'ENGAJADO' | 'EM_RISCO' | 'GRADUATION_READY' | 'INATIVO';

export interface StudentHealthScore {
  id: string;
  userId: string;
  tenantId: string;
  engagementScore: number;
  frequency30d: number;
  xpVelocity30d: number;
  ncImpactPenalty: number;
  lastScanDate: string;
  currentState: StudentLifecycleState;
}

export interface LifecycleLog {
  id: string;
  userId: string;
  previousState: StudentLifecycleState;
  currentState: StudentLifecycleState;
  triggerReason: string;
  createdAt: string;
}

export type EnrollmentStep = 'IDENTIDADE' | 'PLANO' | 'BIOMETRIA' | 'ASSINATURA' | 'PAGAMENTO';
export type EnrollmentChannel = 'ONLINE' | 'PRESENCIAL';

export interface EnrollmentSession {
  id: string;
  tenantId: string;
  token: string;
  currentStep: EnrollmentStep;
  channel: EnrollmentChannel;
  data: any;
  qualityPolicyAccepted: boolean;
  createdAt: string;
}

export interface Contract {
  id: string;
  studentId: string;
  planId: string;
  signedAt: string;
  ipAddress: string;
  deviceInfo: string;
  isMinor: boolean;
  guardianName?: string;
  guardianCpf?: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Subscription {
  id: string;
  studentId: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  amountOriginal: number;
  performanceDiscount: number;
  amountFinal: number;
  dueDate: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
}

export type AssetCategory = 'MAQUINA' | 'MATERIAL' | 'INFRA' | 'EQUIPAMENTO_LUTA';
export type AssetStatus = 'CONFORME' | 'MANUTENCAO' | 'CRITICO';

export interface PhysicalAsset {
  id: string;
  tenantId: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  installationDate: string;
  lastAuditDate: string;
  nextAuditDate: string;
  technicalSpecs?: any;
}

export interface AssetMaintenanceLog {
  id: string;
  assetId: string;
  interventionType: string;
  description: string;
  technicianName: string;
  cost: number;
  performedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  tenantId: string;
  auditorLevel?: 'Master' | 'Pleno' | 'Needs Training';
  averageScore?: number;
}

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

export interface QualityPolicy {
  id: string;
  content: string;
  version: string;
  status: DocumentStatus;
  approvalDate?: string;
  approvedBy?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  documentId: string;
  previousStatus?: DocumentStatus;
  newStatus: DocumentStatus;
  timestamp: string;
  tenantId: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  needs: string;
  expectations: string;
  tenantId: string;
}

export interface StrategicPlan {
  id: string;
  year: number;
  mission: string;
  vision: string;
  values: string;
  tenantId: string;
}

export interface KPIStats {
  efficiency: number; // tasks completed / planned
  satisfaction: number; // derived from stakeholders
  improvement: number; // updates/audits
  healthScore: number;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  category: 'efficiency' | 'satisfaction' | 'improvement';
  timestamp: string;
  tenantId: string;
}

export type AuditStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

export type AuditItemStatus = 'C' | 'NC' | 'NA';

export interface AuditorEvaluation {
  id: string;
  reportId: string;
  auditorId: string;
  auditeeId: string;
  scores: {
    ethics: number;
    technicalKnowledge: number;
    communication: number;
    punctuality: number;
  };
  averageScore: number;
  comments: string;
  tenantId: string;
  createdAt: string;
}

export interface AuditReport {
  id: string;
  planId: string;
  tenantId: string;
  summary: string;
  strengths: string[];
  improvementOpportunities: string[];
  conclusion: string;
  status: 'DRAFT' | 'APPROVED';
  approvedAt?: string;
  approverId?: string;
  approverName?: string;
  aggregatedNCs: {
    itemId: string;
    requirement: string;
    itemToVerify: string;
    observations: string;
  }[];
  score: number;
}

export interface AuditChecklistItem {
  id: string;
  requirement: string;
  itemToVerify: string;
  evidenceToLookFor: string;
}

export interface AuditResponse {
  id: string;
  planId: string;
  itemId: string;
  status: AuditItemStatus;
  observations: string;
  auditorId: string;
  tenantId: string;
}

export interface AuditEvidence {
  id: string;
  responseId: string;
  fileUrl: string;
  type: 'IMAGE' | 'DOC';
  createdAt: string;
  metadata?: {
    gps?: string;
    timestamp?: string;
  };
}

export interface AuditProgram {
  id: string;
  tenantId: string;
  year: number;
  processName: string;
  targetMonth: number; // 1-12
}

export interface AuditPlan {
  id: string;
  programId: string;
  tenantId: string;
  status: AuditStatus;
  auditorLeaderId: string;
  auditorLeaderName: string;
  scope: string;
  objectives: string;
  startTime: string;
  endTime: string;
  homologatedBy?: string;
  homologatedAt?: string;
}

export interface AuditScheduleItem {
  id: string;
  planId: string;
  startTime: string;
  endTime: string;
  activity: string;
}

export interface QualityCheckIn {
  id: string;
  userId: string;
  userName: string;
  date: string;
  followedGuidelines: boolean;
  evidence: string;
  tenantId: string;
}

export interface QualityObjective {
  id: string;
  title: string;
  target: string;
  result: string;
  planId: string;
  tenantId: string;
  currentValue?: number; // Added for numeric tracking
  targetValue?: number;  // Added for numeric tracking
}
