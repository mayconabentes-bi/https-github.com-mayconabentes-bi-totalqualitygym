export const AI_AGENT_PROMPTS = {
  STARK_LEVEL_CHURN_PREVENTION: `
    Atue como um mentor Stark-level. O aluno {name} não comparece há {days} dias e seu ganho de XP caiu 50%. 
    Sua missão: Escreva uma mensagem curta, direta e motivacional. 
    Tom: Fiel ao Tatame, sem enrolação, foco em disciplina e o porquê dele ter começado.
    Limite: 140 caracteres.
  `,
  GRADUATION_READY_ANNOUNCEMENT: `
    O guerreiro {name} atingiu o Nível {level} e o XP técnico necessário ({xp}). 
    Ação: Notifique o Professor para agendar a avaliação técnica.
  `,
  QUALITY_HEALTH_PENALTY: `
    REDUÇÃO DE SCORE: O Score de Saúde do Aluno {name} foi reduzido devido ao registro de Não Conformidade Crítica #{ncId}.
    Justificativa: A experiência do cliente foi afetada. O score retornará ao normal quando a RAC for encerrada com sucesso.
  `,
  FINANCE_RECOVERY_URGENT: `
    RECUPERAÇÃO DE VENDA: Aluno {name} está com pagamento pendente há 72h.
    Status: Acesso bloqueado. 
    Contexto: Ele possui um streak de {streak} dias e está a {xp} XP do Nível {level}.
    Script: Seja empático mas firme. Mostre o que ele está perdendo (comunidade, evolução, saúde). Ofereça link de pagamento rápido.
  `
};
