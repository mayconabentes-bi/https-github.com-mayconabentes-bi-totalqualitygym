import React, { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from './types';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Get or Create profile
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        } else {
          // New user logic - Defaulting to 'teacher' and a default tenant for demo
          // In a real SaaS, this would involve an invite or tenant creation
          const defaultTenantId = 'area-fit-main';
          const newProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Staff Member',
            role: 'teacher', // Default role
            tenantId: defaultTenantId,
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          
          // Also ensure tenant exists
          const tenantRef = doc(db, 'tenants', defaultTenantId);
          const tenantSnap = await getDoc(tenantRef);
          if (!tenantSnap.exists()) {
            await setDoc(tenantRef, {
              name: 'Academia AREA FIT - Unidade Sede',
              createdAt: new Date().toISOString()
            });
          }
          
          setProfile(newProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  return (
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
                  onClick={() => signOut(auth)}
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
  );
}
