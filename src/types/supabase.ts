export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      enrollment_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          token: string;
          current_step: 'IDENTIDADE' | 'PLANO' | 'BIOMETRIA' | 'ASSINATURA' | 'PAGAMENTO';
          channel: 'ONLINE' | 'PRESENCIAL';
          data_json: Json | null;
          quality_policy_accepted: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          token: string;
          current_step?: 'IDENTIDADE' | 'PLANO' | 'BIOMETRIA' | 'ASSINATURA' | 'PAGAMENTO';
          channel: 'ONLINE' | 'PRESENCIAL';
          data_json?: Json | null;
          quality_policy_accepted?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          token?: string;
          current_step?: 'IDENTIDADE' | 'PLANO' | 'BIOMETRIA' | 'ASSINATURA' | 'PAGAMENTO';
          channel?: 'ONLINE' | 'PRESENCIAL';
          data_json?: Json | null;
          quality_policy_accepted?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      physical_assets: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          category: 'MAQUINA' | 'MATERIAL' | 'INFRA' | 'EQUIPAMENTO_LUTA';
          status: 'CONFORME' | 'MANUTENCAO' | 'CRITICO' | null;
          installation_date: string;
          last_audit_date: string | null;
          next_audit_date: string;
          technical_specs: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          category: 'MAQUINA' | 'MATERIAL' | 'INFRA' | 'EQUIPAMENTO_LUTA';
          status?: 'CONFORME' | 'MANUTENCAO' | 'CRITICO' | null;
          installation_date: string;
          last_audit_date?: string | null;
          next_audit_date: string;
          technical_specs?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          category?: 'MAQUINA' | 'MATERIAL' | 'INFRA' | 'EQUIPAMENTO_LUTA';
          status?: 'CONFORME' | 'MANUTENCAO' | 'CRITICO' | null;
          installation_date?: string;
          last_audit_date?: string | null;
          next_audit_date?: string;
          technical_specs?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          student_id: string;
          tenant_id: string;
          plan_id: string;
          status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | null;
          current_period_start: string | null;
          current_period_end: string;
          cancel_at_period_end: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          tenant_id: string;
          plan_id: string;
          status?: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | null;
          current_period_start?: string | null;
          current_period_end: string;
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          tenant_id?: string;
          plan_id?: string;
          status?: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | null;
          current_period_start?: string | null;
          current_period_end?: string;
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
        };
      };
      invoices: {
        Row: {
          id: string;
          subscription_id: string;
          tenant_id: string;
          amount_original: number;
          performance_discount: number | null;
          amount_final: number;
          due_date: string;
          payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | null;
          paid_at: string | null;
          billing_reason: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          tenant_id: string;
          amount_original: number;
          performance_discount?: number | null;
          amount_final: number;
          due_date: string;
          payment_status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | null;
          paid_at?: string | null;
          billing_reason?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          tenant_id?: string;
          amount_original?: number;
          performance_discount?: number | null;
          amount_final?: number;
          due_date?: string;
          payment_status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | null;
          paid_at?: string | null;
          billing_reason?: string | null;
          created_at?: string | null;
        };
      };
      non_conformities: {
        Row: {
          id: string;
          tenant_id: string;
          source: 'Professor' | 'Aluno/Reclamação' | 'Auditoria Interna' | 'Indicador' | 'Incidente';
          description: string;
          immediate_action: string;
          gravity: 'Baixa' | 'Média' | 'Alta' | 'Crítica' | null;
          status: 'Aberta' | 'Em Análise' | 'RAC Aberta' | 'Concluída' | null;
          identified_by_id: string;
          audit_plan_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          source: 'Professor' | 'Aluno/Reclamação' | 'Auditoria Interna' | 'Indicador' | 'Incidente';
          description: string;
          immediate_action: string;
          gravity?: 'Baixa' | 'Média' | 'Alta' | 'Crítica' | null;
          status?: 'Aberta' | 'Em Análise' | 'RAC Aberta' | 'Concluída' | null;
          identified_by_id: string;
          audit_plan_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          source?: 'Professor' | 'Aluno/Reclamação' | 'Auditoria Interna' | 'Indicador' | 'Incidente';
          description?: string;
          immediate_action?: string;
          gravity?: 'Baixa' | 'Média' | 'Alta' | 'Crítica' | null;
          status?: 'Aberta' | 'Em Análise' | 'RAC Aberta' | 'Concluída' | null;
          identified_by_id?: string;
          audit_plan_id?: string | null;
          created_at?: string | null;
        };
      };
      action_plan_items: {
        Row: {
          id: string;
          rac_id: string;
          tenant_id: string;
          action_text: string;
          responsible_id: string;
          deadline: string;
          execution_method: string;
          effectiveness_criteria: string;
          status: 'Pending' | 'Completed' | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          rac_id: string;
          tenant_id: string;
          action_text: string;
          responsible_id: string;
          deadline: string;
          execution_method: string;
          effectiveness_criteria: string;
          status?: 'Pending' | 'Completed' | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          rac_id?: string;
          tenant_id?: string;
          action_text?: string;
          responsible_id?: string;
          deadline?: string;
          execution_method?: string;
          effectiveness_criteria?: string;
          status?: 'Pending' | 'Completed' | null;
          completed_at?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          display_name: string;
          email: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          display_name: string;
          email: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string;
          email?: string;
          created_at?: string | null;
        };
      };
      gamification_profiles: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string;
          total_xp: number | null;
          current_level: number | null;
          warrior_rank: string | null;
          badges: Json | null;
          streak_days: number | null;
          last_checkin_at: string | null;
          modality: string | null;
          graduation: string | null;
          gender: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tenant_id: string;
          total_xp?: number | null;
          current_level?: number | null;
          warrior_rank?: string | null;
          badges?: Json | null;
          streak_days?: number | null;
          last_checkin_at?: string | null;
          modality?: string | null;
          graduation?: string | null;
          gender?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          tenant_id?: string;
          total_xp?: number | null;
          current_level?: number | null;
          warrior_rank?: string | null;
          badges?: Json | null;
          streak_days?: number | null;
          last_checkin_at?: string | null;
          modality?: string | null;
          graduation?: string | null;
          gender?: string | null;
          updated_at?: string | null;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon_slug: string;
          rarity: 'Bronze' | 'Prata' | 'Ouro';
          xp_bonus: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon_slug: string;
          rarity: 'Bronze' | 'Prata' | 'Ouro';
          xp_bonus: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon_slug?: string;
          rarity?: 'Bronze' | 'Prata' | 'Ouro';
          xp_bonus?: number;
          created_at?: string | null;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string | null;
          context_data: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string | null;
          context_data?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string | null;
          context_data?: Json | null;
        };
      };
      xp_transactions: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string;
          amount: number;
          source: 'CHECKIN' | 'PERFORMANCE' | 'QUALITY_REPORT' | 'GRADUATION' | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tenant_id: string;
          amount: number;
          source: 'CHECKIN' | 'PERFORMANCE' | 'QUALITY_REPORT' | 'GRADUATION';
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          tenant_id?: string;
          amount?: number;
          source?: 'CHECKIN' | 'PERFORMANCE' | 'QUALITY_REPORT' | 'GRADUATION' | null;
          description?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
}
