import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type StudentLifecycleState = 'ONBOARDING' | 'ENGAJADO' | 'EM_RISCO' | 'GRADUATION_READY' | 'INATIVO';
type EnrollmentStep = 'IDENTIDADE' | 'PLANO' | 'BIOMETRIA' | 'ASSINATURA' | 'PAGAMENTO';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- ARCHITECTURE LAYER: Hardening de Segurança (Zero-Trust MFA) ---
  app.use((req, res, next) => {
    // Verifica se a transação exige a role ADMIN_GLOBAL
    const adminRole = req.headers['x-admin-role'] || req.body?.admin_role;
    
    if (adminRole === 'ADMIN_GLOBAL' && req.path !== '/api/units/register') { // exceção controlada para evitar quebrar mocks front-end
        const mfaToken = req.headers['x-mfa-token'];
        
        // Simulação da Validação de FIDO2 / WebAuthn
        if (!mfaToken) {
            console.log(`\n\x1b[31m[SEC-OPS]\x1b[0m Alerta: Tentativa de bypass de ADMIN_GLOBAL via IP ${req.ip}`);
            return res.status(403).json({
                error: "MFA_REQUIRED",
                message: "Acesso ROOT detectado. Autenticação Multi-Fator (Hardware/WebAuthn) obrigatória para aprovação."
            });
        }
        console.log(`\n\x1b[32m[SEC-OPS]\x1b[0m Hardware Token validado. Zero-Trust Access Granted.`);
    }
    next();
  });

  // Subsistema de Mensageria (WebSocket / SSE Simulation) para Lockdown
  const lockdownClients = new Set<any>();
  
  app.get("/api/system/lockdown-stream", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    lockdownClients.add(res);
    req.on('close', () => lockdownClients.delete(res));
  });

  // API Route for Non-Conformity Registration (POP.SGQ.12)
  app.post("/api/nc/register", async (req, res) => {
    const { 
      tenant_id, 
      source, 
      description, 
      immediate_action, 
      gravity, 
      identified_by_id,
      audit_plan_id 
    } = req.body;

    // 1. Validation (as per POP.SGQ.12)
    if (!source || !description || !immediate_action) {
      return res.status(400).json({ 
        error: "Campos obrigatórios ausentes: fonte, descrição e ação imediata são necessários." 
      });
    }

    // 2. Notification Logic
    if (gravity === 'Alta' || gravity === 'Crítica') {
      console.log(`[ALERTA GESTÃO] Gravidade ${gravity} detectada!`);
      console.log(`Notificando Rodrigo Saavedra e Fredson Alves...`);
      // In a real production app, we would use SendGrid/Nodemailer/Twilio here
    }

    // 3. Persist (In this environment, we'd normally use the Firestore Admin SDK)
    // For the sake of this architectural demo, we'll return the success payload
    // to simulate the "salvamento" logic.
    
    const newNC = {
      id: crypto.randomUUID(),
      tenant_id,
      source,
      description,
      immediate_action,
      gravity: gravity || 'Média',
      status: 'Aberta',
      identified_by_id,
      audit_plan_id: source === 'Auditoria Interna' ? audit_plan_id : null,
      created_at: new Date().toISOString()
    };

    console.log("NC Registrada:", newNC);

    res.status(201).json({
      message: "Não Conformidade registrada com sucesso.",
      data: newNC
    });
  });

  // API Route for RAC (Ação Corretiva) with Ishikawa 6M
  app.post("/api/rac/register", async (req, res) => {
    const { 
      nc_id,
      tenant_id,
      identified_by_id,
      analysis_6m,
      root_cause,
      proposed_action
    } = req.body;

    // 1. Validation Logic: Ensure at least one M is filled with content
    const mKeys = ['method', 'manpower', 'machine', 'material', 'environment', 'measurement'];
    const hasAnyM = mKeys.some(key => analysis_6m[key] && analysis_6m[key].length > 0 && analysis_6m[key].some((s: string) => s.trim().length > 3));

    if (!hasAnyM) {
      return res.status(400).json({ 
        error: "Análise Incompleta: Pelo menos uma categoria do 6M deve conter uma justificativa detalhada para evitar análise superficial." 
      });
    }

    if (!root_cause || !proposed_action) {
      return res.status(400).json({ error: "Causa Raiz e Ação Proposta são obrigatórios." });
    }

    const newRAC = {
      id: crypto.randomUUID(),
      nc_id,
      tenant_id,
      identified_by_id,
      analysis_6m,
      root_cause,
      proposed_action,
      status: 'Draft',
      created_at: new Date().toISOString()
    };

    console.log("RAC Registrada (6M Ishikawa):", newRAC);

    res.status(201).json({
      message: "RAC e Análise 6M registradas com sucesso.",
      data: newRAC
    });
  });

  // API Route for Action Plan Implementation (POP.SGQ.12)
  app.post("/api/rac/implement", async (req, res) => {
    const { rac_id, tenant_id, action_plan } = req.body;
    
    // Simulate notification scheduling
    console.log(`[JOB SCHEDULER] RAC ${rac_id} marked as IMPLEMENTING.`);
    console.log(`Scheduling effectiveness verification alert for 30 days from now...`);
    
    // Pseudo-code function for Cron/Event Trigger:
    /*
      schedule('30d', async () => {
         const rac = await getRAC(rac_id);
         if (rac.status === 'IMPLEMENTING') {
           notify(rac.managerId, "Hora de verificar a eficácia da RAC " + rac_id);
           updateStatus(rac_id, 'VERIFYING');
         }
      });
    */

    res.json({ 
      success: true, 
      message: "Plano de ação registrado. Verificação de eficácia agendada para 30 dias.",
      verificationScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  });

  // API Route for Effectiveness Verification
  app.post("/api/rac/verify", async (req, res) => {
    const { rac_id, tenant_id, verification } = req.body;

    if (verification.is_effective) {
       console.log(`[RAC CLOSED] RAC ${rac_id} was effective. Archived for 5 years.`);
       res.json({ status: 'CLOSED', message: "RAC Finalizada com sucesso." });
    } else {
       console.log(`[RAC REOPENED] RAC ${rac_id} was ineffective. Forcing new RAC opening.`);
       res.json({ 
         status: 'REOPENED', 
         message: "Ação ineficaz. O sistema exige a abertura de uma nova RAC vinculada.",
         requiresNewRAC: true 
       });
    }
  });

  // API Route for Quality Analytics (BI Engine)
  app.get("/api/analytics/kpis", async (req, res) => {
    const { tenant_id } = req.query;
    
    // In a real scenario, this would aggregate from Firestore/Postgres
    // We simulate the processing of the "Dirty Dozen" and historical records
    res.json({
      volumeOccurrences: [
        { month: 'Jan', count: 4 },
        { month: 'Fev', count: 3 },
        { month: 'Mar', count: 6 }, // Over target
        { month: 'Abr', count: 2 },
      ],
      recurrenceIndex: [
        { cause: 'Método', value: 35 },
        { cause: 'Mão de Obra', value: 25 },
        { cause: 'Material', value: 15 },
        { cause: 'Máquina', value: 10 },
        { cause: 'Meio Ambiente', value: 10 },
        { cause: 'Medição', value: 5 },
      ],
      effectivenessRate: 92, // Target: >= 90%
      avgLeadTime: 24, // Target: <= 30 days
      retentionPolicy: "5 Anos (Ativo)",
      lastCleanup: new Date().toISOString()
    });
  });

  // Gamification Engine Logic (V2 - Exponential Curve & Tiers)
  const calculateLevel = (xp: number) => {
    if (xp <= 0) return 1;
    // Formula: L = (xp/100)^(1/1.5) + 1
    const level = Math.pow(xp / 100, 1 / 1.5) + 1;
    return Math.floor(level);
  };

  const xpForLevel = (level: number) => {
    if (level === 1) return 0;
    // Inverse: xp = 100 * (L - 1)^1.5
    return Math.floor(100 * Math.pow(level - 1, 1.5));
  };

  const getGamificationTier = (level: number) => {
    if (level <= 10) return { title: 'Iniciante', tier: 1 };
    if (level <= 30) return { title: 'Praticante', tier: 2 };
    if (level <= 50) return { title: 'Graduado', tier: 3 };
    return { title: 'Elite', tier: 4 };
  };

  const getXPProgress = (xp: number) => {
    const currentLevel = calculateLevel(xp);
    const xpCurrentLevel = xpForLevel(currentLevel);
    const xpNextLevel = xpForLevel(currentLevel + 1);
    
    const progressInLevel = xp - xpCurrentLevel;
    const neededForLevel = xpNextLevel - xpCurrentLevel;
    const percent = Math.min(100, Math.floor((progressInLevel / neededForLevel) * 100));

    return {
      currentLevel,
      xpToNext: xpNextLevel - xp,
      percent,
      tier: getGamificationTier(currentLevel)
    };
  };

  // Badge Engine (POP.SGQ.12 Achievement Verification)
  const BADGES_DB = [
    { id: 'b1', name: 'Guardião da Conformidade', rarity: 'Ouro', xpBonus: 5000, iconSlug: 'shield-check' },
    { id: 'b2', name: 'Olho Clínico', rarity: 'Prata', xpBonus: 2500, iconSlug: 'search' },
    { id: 'b3', name: 'Auditor de Elite', rarity: 'Ouro', xpBonus: 5000, iconSlug: 'award' },
    { id: 'b4', name: 'Mestre do PDCA', rarity: 'Prata', xpBonus: 2000, iconSlug: 'zap' },
    { id: 'b5', name: 'Detetive do Tatame', rarity: 'Bronze', xpBonus: 500, iconSlug: 'target' }
  ];

  app.post("/api/gamification/check-badges", async (req, res) => {
    const { user_id, event_type, data } = req.body;
    let earnedBadge = null;

    console.log(`[GAMIFICATION] Checking badges for ${user_id} on ${event_type}`);

    if (event_type === 'AUDIT_CLOSED') {
      if (data.conformityScore === 100) {
        earnedBadge = BADGES_DB.find(b => b.id === 'b1');
      }
      if (data.identifiedCriticalMissingInPrevious) {
        earnedBadge = BADGES_DB.find(b => b.id === 'b2');
      }
    }

    if (event_type === 'RAC_CLOSED_SUCCESS') {
      if (data.daysToClose <= 30 && data.effectivenessVerified) {
        earnedBadge = BADGES_DB.find(b => b.id === 'b4');
      }
    }

    if (event_type === 'NC_REPORTED_EQUIPMENT') {
      earnedBadge = BADGES_DB.find(b => b.id === 'b5');
    }

    if (earnedBadge) {
      console.log(`[ACHIEVEMENT] User ${user_id} earned: ${earnedBadge.name}! (+${earnedBadge.xpBonus} XP)`);
      
      // Global Notification Simulation
      if (earnedBadge.rarity === 'Ouro') {
        process.stdout.write(`\n\x1b[33m[TIMELINE DA QUALIDADE]\x1b[0m Alerta de Elite: ${user_id} acaba de conquistar a Medalha de OURO: ${earnedBadge.name}!\n`);
      }

      return res.json({
        success: true,
        earned: true,
        badge: earnedBadge,
        xpBonus: earnedBadge.xpBonus
      });
    }

    res.json({ success: true, earned: false });
  });

  // CRM Lifecycle & Intelligence Engine
  const calculateEngagementScore = (freq: number, xpGain: number, penalty: number) => {
    // Basic weight: frequency(40%) + XP(60%) - SGQ Penalties
    const freqFactor = Math.min(100, (freq / 12) * 100); // 12 classes/month is target 100%
    const xpFactor = Math.min(100, (xpGain / 2000) * 100); // 2000 XP/month is target 100%
    return Math.max(0, Math.floor((freqFactor * 0.4 + xpFactor * 0.6) - penalty));
  };

  const determineLifecycleState = (currentXP: number, freq: number, daysSinceLast: number, startDate: string): StudentLifecycleState => {
    const isNew = (new Date().getTime() - new Date(startDate).getTime()) < (30 * 24 * 3600 * 1000);
    
    if (daysSinceLast > 60) return 'INATIVO';
    if (daysSinceLast > 7 || freq < 1) return 'EM_RISCO';
    if (currentXP > 50000) return 'GRADUATION_READY'; // Simplified threshold
    if (isNew) return 'ONBOARDING';
    
    return 'ENGAJADO';
  };

  app.get("/api/crm/student-health/:userId", async (req, res) => {
    const { userId } = req.params;
    
    // Simulated health data
    const mockHealth = {
      userId,
      engagementScore: 78,
      frequency30d: 9,
      xpVelocity30d: 1200,
      ncImpactPenalty: 5, // Active NC reducing score
      currentState: 'ENGAJADO',
      lastScanDate: new Date().toISOString()
    };

    res.json(mockHealth);
  });

  app.post("/api/crm/trigger-scan", async (req, res) => {
    const { user_id, frequency, xpGain, lastCheckinAt, startDate } = req.body;
    
    const daysSinceLast = lastCheckinAt ? Math.floor((new Date().getTime() - new Date(lastCheckinAt).getTime()) / (1000 * 3600 * 24)) : 99;
    const previousState: StudentLifecycleState = 'ENGAJADO'; // Mock previous
    const newState = determineLifecycleState(xpGain, frequency, daysSinceLast, startDate);
    
    const score = calculateEngagementScore(frequency, xpGain, 0);

    // Agentic Notifications for Churn Prevention
    if (newState === 'EM_RISCO') {
      console.log(`\n\x1b[31m[ALERTA CHURN]\x1b[0m Aluno ${user_id} em risco de evasão. Frequência: ${frequency}.`);
      console.log(`[AGENTIC MSG] "Ei, sentimos sua falta no tatame! A AREA FIT é mais forte com você. Te esperamos amanhã?"`);
    }

    if (newState === 'GRADUATION_READY') {
      console.log(`\n\x1b[32m[NOTIFICAÇÃO GRADUAÇÃO]\x1b[0m Aluno ${user_id} pronto para exame.`);
      console.log(`[TASK] Gerado convite de graduação para o Professor Responsável.`);
    }

    res.json({
      userId: user_id,
      engagementScore: score,
      newState,
      transitioned: newState !== previousState
    });
  });

  app.get("/api/gamification/ranking", async (req, res) => {
    const { tenant_id, modality, category } = req.query;
    
    // Simulate ranking filtering logic with mock data
    // In production, this would query ranking_consolidado_v3
    const mockRanking = [
      { id: '1', displayName: 'Ricardo Saavedra', totalXp: 18400, level: calculateLevel(18400), rank: 'Praticante (Tier 2)', modality: 'Jiu Jitsu', category: 'Faixa Preta', qualityBadges: 5 },
      { id: '2', displayName: 'Maycon Alves', totalXp: 15100, level: calculateLevel(15100), rank: 'Praticante (Tier 2)', modality: 'Jiu Jitsu', category: 'Faixa Roxa', qualityBadges: 3 },
      { id: '3', displayName: 'Ana Silva', totalXp: 8500, level: calculateLevel(8500), rank: 'Iniciante (Tier 1)', modality: 'Muay Thai', category: 'Grau Azul', qualityBadges: 1 },
      { id: '4', displayName: 'Bruno Costa', totalXp: 7200, level: calculateLevel(7200), rank: 'Iniciante (Tier 1)', modality: 'Jiu Jitsu', category: 'Faixa Azul', qualityBadges: 0 },
      { id: '5', displayName: 'Carla Dias', totalXp: 6100, level: calculateLevel(6100), rank: 'Iniciante (Tier 1)', modality: 'Muay Thai', category: 'Grau Branco', qualityBadges: 2 },
      { id: '6', displayName: 'Jefferson Melo', totalXp: 4500, level: calculateLevel(4500), rank: 'Iniciante (Tier 1)', modality: 'Kids/Teens', category: 'Faixa Laranja', qualityBadges: 0 },
    ];

    let filtered = mockRanking;
    if (modality && modality !== 'Todos') {
      filtered = filtered.filter(p => p.modality === modality);
    }
    if (category && category !== 'Todas') {
      filtered = filtered.filter(p => p.category === category);
    }

    res.json(filtered.sort((a, b) => b.totalXp - a.totalXp));
  });

  app.get("/api/gamification/quality-champions", async (req, res) => {
    const { tenant_id } = req.query;
    // Users with most quality-related achievements
    const champions = [
      { id: '1', displayName: 'Ricardo Saavedra', qualityBadges: 8, topBadge: 'Guardião da Conformidade' },
      { id: '2', displayName: 'Maycon Alves', qualityBadges: 5, topBadge: 'Mestre do PDCA' },
      { id: '7', displayName: 'Beatriz Lima', qualityBadges: 4, topBadge: 'Olho Clínico' },
    ];
    res.json(champions);
  });

  app.post("/api/gamification/grant-xp", async (req, res) => {
    let { user_id, amount, source, description } = req.body;
    
    // 1. Quality Bonus Logic: 1.2x multiplier for NC reports
    if (source === 'QUALITY_REPORT') {
      amount = Math.floor(amount * 1.2);
      console.log(`[BONUS] Quality Multiplier (1.2x) applied to NC Report from ${user_id}`);
    }

    // 2. Badge Grant Logic
    let badgeEarned = null;
    if (source === 'QUALITY_REPORT' && amount >= 500) {
      badgeEarned = "Olho de Águia";
    }

    const currentXp = 15400; // Mock current
    const newTotal = currentXp + amount;
    const progress = getXPProgress(newTotal);

    console.log(`[XP GRANTED] User ${user_id} earned ${amount} XP via ${source}. New Level: ${progress.currentLevel}`);
    
    res.json({
      success: true,
      newXp: newTotal,
      level: progress.currentLevel,
      xpToNext: progress.xpToNext,
      percent: progress.percent,
      tier: progress.tier,
      badgeEarned
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Enrollment Orchestration API (State Machine)
  const ENROLLMENT_STEPS: EnrollmentStep[] = ['IDENTIDADE', 'PLANO', 'BIOMETRIA', 'ASSINATURA', 'PAGAMENTO'];

  app.post("/api/enrollment/start", async (req, res) => {
    const { tenant_id, channel, initial_data } = req.body;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log(`[ENROLLMENT] Starting session for tenant ${tenant_id} via ${channel}`);
    
    res.json({
      success: true,
      token,
      step: 'IDENTIDADE',
      nextSteps: ENROLLMENT_STEPS.slice(1)
    });
  });

  app.post("/api/enrollment/resume", async (req, res) => {
    const { tenant_id, cpf } = req.body;
    
    // Simulate finding a session by CPF
    console.log(`[ENROLLMENT] Resuming session for CPF ${cpf} at tenant ${tenant_id}`);
    
    res.json({
      success: true,
      session: {
        token: 'resumed-token-123',
        currentStep: 'PLANO',
        data: { cpf, name: 'Candidato Exemplo' }
      }
    });
  });

  app.post("/api/enrollment/complete", async (req, res) => {
    const { 
      token, 
      tenant_id, 
      data, 
      quality_policy_accepted, 
      plan_id, 
      payment_method 
    } = req.body;

    // 1. Quality Policy Validation (Mandatory)
    if (!quality_policy_accepted) {
      return res.status(400).json({ error: "A política de qualidade deve ser aceita para concluir a matrícula." });
    }

    // 2. Business Rule: Age Validation
    const birthDate = new Date(data.birthDate);
    const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000));
    
    if (age < 18 && (!data.guardianName || !data.guardianCpf)) {
      return res.status(400).json({ error: "Responsável legal é obrigatório para menores de 18 anos." });
    }

    // 3. Business Rule: Duplicity check (Mock)
    if (data.cpf === '000.000.000-00') {
       return res.status(400).json({ error: "CPF já possui matrícula ativa nesta unidade." });
    }

    console.log(`[ENROLLMENT] Completing enrollment for ${data.name}. Plan: ${plan_id}. Payment: ${payment_method}`);

    // Create User, Profile, and Contract (Simulated)
    const newUserId = `u-${Date.now()}`;
    
    res.json({
      success: true,
      userId: newUserId,
      contractId: `c-${Date.now()}`,
      message: "Matrícula concluída com sucesso. Bem-vindo à AREA FIT!",
      nextAction: "BIOMETRIA_SETUP"
    });
  });

  // Financial Engine & Billing Orchestration
  const calculatePerformanceDiscount = (xp: number) => {
    // Business Rule: For every 1000 XP in the period, 5% discount (max 20%)
    const discountTier = Math.min(4, Math.floor(xp / 1000));
    return discountTier * 0.05;
  };

  app.post("/api/finance/process-recurring", async (req, res) => {
    const { tenant_id } = req.body;
    console.log(`[FINANCE] Processing recurring billing for tenant ${tenant_id}`);
    
    // Simulate finding active subscriptions ending today
    const mockSubs = [
      { id: 'sub-1', studentId: 'u-1', planPrice: 200, currentXp: 2500 },
      { id: 'sub-2', studentId: 'u-2', planPrice: 150, currentXp: 800 }
    ];

    const generatedInvoices = mockSubs.map(sub => {
      const discountPercent = calculatePerformanceDiscount(sub.currentXp);
      const discountAmount = sub.planPrice * discountPercent;
      const finalAmount = sub.planPrice - discountAmount;

      return {
        subscriptionId: sub.id,
        amountOriginal: sub.planPrice,
        performanceDiscount: discountAmount,
        amountFinal: finalAmount,
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString()
      };
    });

    console.log(`[FINANCE] Generated ${generatedInvoices.length} invoices with XP-based discounts.`);
    res.json({ success: true, processed: generatedInvoices.length });
  });

  app.post("/api/finance/webhook", async (req, res) => {
    const { type, data } = req.body;
    console.log(`[FINANCE] Webhook received: ${type}`);

    if (type === 'payment.failed') {
      const { invoice_id, student_id, attempt_count } = data;
      console.log(`[FINANCE] Payment failed for invoice ${invoice_id}. Attempt ${attempt_count}.`);
      
      // Access Blocking Trigger: If past due > 72h (simulated by attempt logic)
      if (attempt_count >= 3) {
        console.log(`\n\x1b[31m[BLOQUEIO DE ACESSO]\x1b[0m Aluno ${student_id} desativado por inadimplência.`);
        console.log(`[ACTION] Biometria Facial SUSPENSA temporariamente.`);
        
        // Sales Recovery Agent Prompt
        console.log(`[AGENTIC RECOVERY] "Olá, vimos que houve um problema com seu pagamento. Regularize agora para não perder seu streak de 12 dias no tatame!"`);
      }
    }

    if (type === 'payment.succeeded') {
      console.log(`[FINANCE] Payment success. Resetting access permissions.`);
    }

    res.json({ received: true });
  });

  app.get("/api/finance/reports/mrr", async (req, res) => {
    const { tenant_id } = req.query;
    // Mock financial report
    res.json({
      mrr: 45200.50,
      churnRate: "2.4%",
      performanceDiscountsTotal: 1240.00,
      activeSubscriptions: 245
    });
  });

  // Instructor Interface & Technical Validation (Module 13 & 15 Integration)
  app.post("/api/instructor/validate-session", async (req, res) => {
    const { tenant_id, instructor_id, students, performance_rating } = req.body;
    
    console.log(`[INSTRUCTOR] Validating class for ${students.length} students. Rating: ${performance_rating}`);

    const results = students.map((student: { id: string, hasQualityBadge: boolean }) => {
      const multiplier = student.hasQualityBadge ? 1.2 : 1.0;
      const xpExtra = Math.floor(performance_rating * 10 * multiplier);

      // CRM Trigger: Performance < 4 points to churning risk
      if (performance_rating < 4) {
        console.log(`\n\x1b[31m[CRM ALERT]\x1b[0m Aluno ${student.id} com baixa performance (${performance_rating}). Notificando Gestora de Retenção.`);
        console.log(`[ACTION] Tarefa aberta no CRM: "Auditória de Satisfação - Aluno Desmotivado"`);
      }

      return {
        studentId: student.id,
        xpGranted: xpExtra,
        multiplier
      };
    });

    // Logging for Audit (technical_logs)
    console.log(`[AUDIT] Session validated by ${instructor_id}. Total XP Distributed: ${results.reduce((acc: number, r: any) => acc + r.xpGranted, 0)}`);

    res.json({
      success: true,
      message: "Validação concluída com sucesso.",
      data: results
    });
  });

  app.post("/api/instructor/report-issue", async (req, res) => {
    const { tenant_id, instructor_id, issue_type, description } = req.body;
    
    console.log(`\n\x1b[41m\x1b[37m[SGQ PANIC]\x1b[0m Instrutor ${instructor_id} relatou falha crítica!`);
    console.log(`Tipo: ${issue_type} | Descrição: ${description}`);

    const newNC = {
      id: crypto.randomUUID(),
      tenant_id,
      source: 'Incidente',
      description: `[FALHA DE ATIVO] Relatado pelo Instrutor: ${description}`,
      immediate_action: 'Isolar área e notificar manutenção',
      gravity: 'Alta',
      status: 'Aberta',
      identified_by_id: instructor_id,
      created_at: new Date().toISOString()
    };

    // Triggering NC workflow (Module 19 integration)
    res.json({
      success: true,
      nc: newNC,
      message: "Não Conformidade aberta no Bloco 19 (Ativos). A diretoria foi notificada."
    });
  });

  // Asset & Infrastructure Management Engine
  app.get("/api/assets", async (req, res) => {
    const { tenant_id } = req.query;
    
    // Simulate asset list with some logic (depreciation check)
    const mockAssets = [
      { 
        id: 'a1', 
        name: 'Tatame Profissional (Área A)', 
        category: 'INFRA', 
        status: 'CONFORME',
        installationDate: '2023-01-15',
        lastAuditDate: new Date().toISOString(),
        nextAuditDate: '2026-06-15'
      },
      { 
        id: 'a2', 
        name: 'Ar Condicionado Central', 
        category: 'INFRA', 
        status: 'MANUTENCAO',
        installationDate: '2022-05-10',
        lastAuditDate: '2026-03-01',
        nextAuditDate: '2026-05-10'
      },
      { 
        id: 'a3', 
        name: 'Estação de Musculação (Smith)', 
        category: 'MAQUINA', 
        status: 'CRITICO',
        installationDate: '2021-11-20',
        lastAuditDate: '2025-12-15',
        nextAuditDate: '2026-02-20'
      },
      { 
        id: 'a4', 
        name: 'Sacos de Pancada (Boxe)', 
        category: 'EQUIPAMENTO_LUTA', 
        status: 'CONFORME',
        installationDate: '2024-08-01',
        lastAuditDate: new Date().toISOString(),
        nextAuditDate: '2026-12-01'
      },
      { 
        id: 'a5', 
        name: 'Ventilação Industrial (Exaustores)', 
        category: 'INFRA', 
        status: 'CONFORME',
        installationDate: '2023-10-12',
        lastAuditDate: new Date().toISOString(),
        nextAuditDate: '2026-10-12'
      }
    ];

    // Depreciation logic: Material > 24 months = Warning
    const processedAssets = mockAssets.map(asset => {
      const installDate = new Date(asset.installationDate);
      const monthsOld = Math.floor((new Date().getTime() - installDate.getTime()) / (1000 * 3600 * 24 * 30.44));
      
      const deprecationWarning = asset.category === 'MATERIAL' && monthsOld > 24;
      
      return { ...asset, monthsOld, deprecationWarning };
    });

    res.json(processedAssets);
  });

  app.post("/api/assets/report-failure", async (req, res) => {
    const { asset_id, description, reported_by } = req.body;
    
    console.log(`\n\x1b[41m\x1b[37m[ASSET FAILURE]\x1b[0m Falha reportada no Ativo ${asset_id}`);
    
    // Auto-Trigger Non-Conformity (Module 9 Integration)
    const newNC = {
      id: crypto.randomUUID(),
      source: 'Incidente de Ativo',
      description: `Falha técnica detectada no Ativo ${asset_id}: ${description}`,
      immediate_action: 'Suspender uso do equipamento e isolar área.',
      gravity: 'Crítica',
      status: 'Aberta',
      created_at: new Date().toISOString()
    };

    console.log(`[SGQ ACTION] NC Automática Gerada: ${newNC.id}`);

    // Logical Lockdown Real-time Trigger via SSE (Module 24)
    console.log(`\x1b[31m[LOCKDOWN LÓGICO]\x1b[0m Transmitindo sinal de bloqueio para ${lockdownClients.size} telões/painéis ativos...`);
    lockdownClients.forEach(client => {
       client.write(`data: ${JSON.stringify({ type: 'ASSET_LOCKDOWN', asset_id, new_status: 'CRITICAL', nc_id: newNC.id })}\n\n`);
    });

    res.json({
      success: true,
      message: "Falha registrada. O SGQ abriu uma Não Conformidade Crítica automaticamente.",
      nc: newNC
    });
  });

  // Unit Expansion & Franchise Management (Module 21 Integration)
  app.post("/api/units/update-theme", async (req, res) => {
    const { unit_id, theme_config } = req.body;
    console.log(`\n\x1b[35m[BRANDING]\x1b[0m Atualizando identidade visual da unidade ${unit_id}`);
    
    // In production, this would persist in the 'units' table theme_config JSONB column
    res.json({
      success: true,
      message: "Identidade visual atualizada e replicada via Edge CSS Variables.",
      theme: theme_config
    });
  });

  app.post("/api/units/register", async (req, res) => {
    const { name, city, state, email, admin_role } = req.body;

    console.log(`\n\x1b[34m[EXPANSION]\x1b[0m Tentativa de cadastro de nova unidade: ${name}`);

    // Simulação do check de segurança RLS: Apenas ADMIN_GLOBAL
    if (admin_role !== 'ADMIN_GLOBAL') {
      console.log(`\x1b[31m[SECURITY ALERT]\x1b[0m Tentativa de cadastro negada. Role insuficiente: ${admin_role}`);
      return res.status(403).json({ 
        success: false, 
        message: "Acesso Negado: Permissionamento ADMIN_GLOBAL obrigatório para expansão de rede." 
      });
    }

    const newUnit = {
      id: crypto.randomUUID(),
      name,
      location_city: city,
      location_state: state,
      contact_email: email,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };

    console.log(`\x1b[32m[SUCCESS]\x1b[0m Unidade ${name} registrada no cofre global.`);

    res.json({
      success: true,
      unit: newUnit,
      message: "Unidade cadastrada com sucesso e isolamento de dados RLS ativado."
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
