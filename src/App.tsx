import React, { useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { signInWithGoogle, supabase } from '@/lib/supabase';
import { AuthProvider } from './contexts/AuthContext';
import { UserProfile, UserRole } from './types';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AuthState = {
  user: User | null;
  session: Session | null;
  tenantId: string | null;
};

function extractTenantId(authUser: User): string | null {
  const appMeta = (authUser.app_metadata ?? {}) as Record<string, unknown>;
  const userMeta = (authUser.user_metadata ?? {}) as Record<string, unknown>;

  const candidate =
    appMeta.tenant_id ??
    appMeta.unit_id ??
    userMeta.tenant_id ??
    userMeta.unit_id;

  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate;
  }

  return null;
}

function resolveRole(authUser: User): UserRole {
  const appMeta = (authUser.app_metadata ?? {}) as Record<string, unknown>;
  const userMeta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const candidate = appMeta.role ?? userMeta.role;

  const roles: UserRole[] = ['direction', 'partner', 'technical_advice', 'teacher', 'secretary'];
  if (typeof candidate === 'string' && roles.includes(candidate as UserRole)) {
    return candidate as UserRole;
  }

  return 'teacher';
}

function resolveDisplayName(authUser: User): string {
  const userMeta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const namedCandidate = userMeta.full_name ?? userMeta.name;

  if (typeof namedCandidate === 'string' && namedCandidate.trim().length > 0) {
    return namedCandidate;
  }

  if (authUser.email) {
    return authUser.email.split('@')[0];
  }

  return 'Staff Member';
}

function buildProfile(authUser: User, tenantId: string | null): UserProfile {
  return {
    id: authUser.id,
    email: authUser.email || '',
    displayName: resolveDisplayName(authUser),
    role: resolveRole(authUser),
    tenantId: tenantId ?? 'area-fit-main',
  };
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    tenantId: null,
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrateInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      const currentSession = data.session ?? null;
      const currentUser = currentSession?.user ?? null;
      const tenantId = currentUser ? extractTenantId(currentUser) : null;

      setAuthState({
        user: currentUser,
        session: currentSession,
        tenantId,
      });
      setProfile(currentUser ? buildProfile(currentUser, tenantId) : null);
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      const tenantId = currentUser ? extractTenantId(currentUser) : null;

      setAuthState({
        user: currentUser,
        session: session ?? null,
        tenantId,
      });
      setProfile(currentUser ? buildProfile(currentUser, tenantId) : null);
      setLoading(false);
    });

    hydrateInitialSession();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  const { user } = authState;

  return (
    <AuthProvider value={authState}>
      <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Login onLogin={signInWithGoogle} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-screen"
            >
              {/* Header */}
              <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                  <div className="relative w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl shadow-inner shadow-black/50">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-medium tracking-tight text-slate-50 leading-none">TOTAL QUALITY</h1>
                    <p className="text-[10px] text-slate-500 uppercase font-mono tracking-[0.2em] mt-1">
                      Gestão Estratégica & Performance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end text-right">
                    <p className="text-sm font-medium text-slate-200 leading-tight">{profile?.displayName}</p>
                    <p className="text-[10px] text-amber-500 font-mono uppercase tracking-widest">{profile?.role.replace('_', ' ')}</p>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800" />
                  <button
                    onClick={handleSignOut}
                    className="p-2.5 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-all text-slate-400 hover:text-amber-500/80 group"
                    title="Sair do Sistema"
                  >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-auto bg-slate-950 relative">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
                <div className="max-w-[1600px] mx-auto p-4 md:p-8 relative z-10">
                  {profile && <Dashboard profile={profile} />}
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}
