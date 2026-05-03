import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/supabase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, limit } from '@/lib/supabase';
import { QualityPolicy, UserProfile, DocumentStatus } from '../types';
import { FileText, Save, History, Edit3, CheckCircle, Clock, Send, ShieldCheck, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  profile: UserProfile;
}

export default function QualityPolicyView({ profile }: Props) {
  const [policies, setPolicies] = useState<QualityPolicy[]>([]);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const canApprove = ['direction', 'partner'].includes(profile.role);
  const canEdit = ['direction', 'partner', 'technical_advice', 'teacher'].includes(profile.role);

  useEffect(() => {
    const q = query(
      collection(db, 'tenants', profile.tenantId, 'policies'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QualityPolicy));
      setPolicies(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `tenants/${profile.tenantId}/policies`);
    });

    return () => unsubscribe();
  }, [profile.tenantId]);

  const latestPublished = policies.find(p => p.status === 'PUBLISHED');
  const latestDraft = policies.find(p => p.status === 'DRAFT' || p.status === 'UNDER_REVIEW' || p.status === 'APPROVED');
  
  const displayPolicy = editing ? null : (latestDraft || latestPublished || policies[0]);

  const createDraft = async () => {
    const baseVersion = latestPublished ? latestPublished.version : 'Rev 00';
    const versionNum = parseInt(baseVersion.replace('Rev ', '')) + (latestDraft ? 0 : 1);
    const newVersion = `Rev ${versionNum.toString().padStart(2, '0')}`;

    try {
      await addDoc(collection(db, 'tenants', profile.tenantId, 'policies'), {
        content: latestPublished?.content || '',
        version: newVersion,
        status: 'DRAFT',
        tenantId: profile.tenantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: profile.displayName
      });
      setEditing(true);
      setContent(latestPublished?.content || '');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'policies');
    }
  };

  const updateStatus = async (policyId: string, newStatus: DocumentStatus) => {
    try {
      const updates: any = { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      if (newStatus === 'APPROVED' || newStatus === 'PUBLISHED') {
        updates.approvalDate = new Date().toISOString();
        updates.approvedBy = profile.displayName;
      }

      if (newStatus === 'PUBLISHED') {
        // Supersede old published version
        if (latestPublished) {
          await updateDoc(doc(db, 'tenants', profile.tenantId, 'policies', latestPublished.id), {
            status: 'SUPERSEDED',
            updatedAt: new Date().toISOString()
          });
        }
      }

      await updateDoc(doc(db, 'tenants', profile.tenantId, 'policies', policyId), updates);
      
      // Audit Log
      await addDoc(collection(db, 'tenants', profile.tenantId, 'audit_logs'), {
        userId: profile.id,
        userName: profile.displayName,
        action: `Transition to ${newStatus}`,
        documentId: policyId,
        newStatus,
        timestamp: new Date().toISOString(),
        tenantId: profile.tenantId
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'policies');
    }
  };

  const saveDraft = async (policyId: string) => {
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId, 'policies', policyId), {
        content,
        updatedAt: new Date().toISOString()
      });
      setEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'policies');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic text-[#141414]">Ciclo de Vida Documental: POL-AF-001</h2>
          <p className="text-xs font-mono text-[#141414]/50 uppercase">Gestão da Qualidade AREA FIT</p>
        </div>
        {canEdit && !editing && !latestDraft && (
          <button
            onClick={createDraft}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-white rounded-lg text-sm font-medium hover:bg-black transition-all"
          >
            <Edit3 className="w-4 h-4" /> Criar Novo Rascunho
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Doc View / Editor */}
        <div className="lg:col-span-2 space-y-6">
          {displayPolicy || editing ? (
            <div className="bg-white border border-[#141414]/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-[#141414]/5 px-6 py-3 border-b border-[#141414]/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-mono font-bold uppercase flex items-center gap-2 px-2 py-0.5 rounded ${getStatusColor(editing ? 'DRAFT' : displayPolicy!.status)}`}>
                    <StatusIcon status={editing ? 'DRAFT' : displayPolicy!.status} /> {editing ? 'Editando' : displayPolicy!.status}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest">{editing ? 'DRAFT' : displayPolicy!.version}</span>
                </div>
                {!editing && displayPolicy && (
                  <div className="flex gap-2">
                    {displayPolicy.status === 'DRAFT' && (
                      <button onClick={() => setEditing(true)} className="p-1 hover:bg-black/5 rounded"><Edit3 className="w-4 h-4" /></button>
                    )}
                    {displayPolicy.status === 'DRAFT' && (
                      <button onClick={() => updateStatus(displayPolicy.id, 'UNDER_REVIEW')} className="flex items-center gap-1 text-[10px] font-bold uppercase bg-[#141414] text-white px-3 py-1 rounded-full"><Send className="w-3 h-3" /> Submeter</button>
                    )}
                    {displayPolicy.status === 'UNDER_REVIEW' && canApprove && (
                      <button onClick={() => updateStatus(displayPolicy.id, 'APPROVED')} className="flex items-center gap-1 text-[10px] font-bold uppercase bg-green-600 text-white px-3 py-1 rounded-full"><ShieldCheck className="w-3 h-3" /> Aprovar</button>
                    )}
                    {displayPolicy.status === 'APPROVED' && canApprove && (
                      <button onClick={() => updateStatus(displayPolicy.id, 'PUBLISHED')} className="flex items-center gap-1 text-[10px] font-bold uppercase bg-blue-600 text-white px-3 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Publicar</button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8">
                {editing ? (
                  <div className="space-y-4">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-[500px] p-4 border border-[#141414]/20 rounded-xl font-sans focus:outline-none focus:ring-2 focus:ring-[#141414]/10 leading-relaxed text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm">Cancelar</button>
                      <button onClick={() => saveDraft(latestDraft!.id)} className="flex items-center gap-2 px-6 py-2 bg-[#141414] text-white rounded-xl text-sm"><Save className="w-4 h-4" /> Salvar Rascunho</button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed text-[#141414]/80 font-serif text-lg italic">
                      {displayPolicy?.content || 'Selecione uma versão ou crie um rascunho.'}
                    </div>
                  </div>
                )}
              </div>

              {displayPolicy && !editing && (
                <div className="bg-[#141414]/5 px-8 py-3 border-t border-[#141414]/10 flex justify-between text-[10px] font-mono opacity-50 uppercase">
                  <span>Criado por: {displayPolicy.createdBy}</span>
                  <span>Atualizado em: {new Date(displayPolicy.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#141414]/10 rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-[#141414]/10 mx-auto mb-4" />
              <p className="text-[#141414]/40 font-serif italic">Nenhum documento disponível para visualização.</p>
            </div>
          )}
        </div>

        {/* Sidebar History & Audit */}
        <div className="space-y-6">
          <div className="bg-white border border-[#141414]/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-[#141414]/5 pb-4">
              <History className="w-4 h-4" /> Histórico de Versões
            </h3>
            <div className="space-y-3">
              {policies.map((p) => (
                <div 
                  key={p.id} 
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    p.status === 'PUBLISHED' ? 'bg-blue-50 border-blue-200 shadow-sm' : 
                    p.status === 'UNDER_REVIEW' ? 'bg-yellow-50 border-yellow-200' :
                    'border-[#141414]/5 hover:bg-[#141414]/5'
                  }`}
                  onClick={() => {
                    if (!editing) {
                      setContent(p.content);
                    }
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold font-mono">{p.version}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold text-white ${getStatusBg(p.status)}`}>{p.status}</span>
                  </div>
                  <p className="text-[9px] text-[#141414]/50 leading-tight truncate">{p.content.substring(0, 40)}...</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#141414]/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4" /> Auditoria Rápida
            </h3>
            <div className="space-y-4">
               <div className="p-3 bg-[#141414] text-white rounded-xl">
                  <p className="text-[10px] uppercase opacity-50 mb-1">Versão Publicada</p>
                  <p className="text-sm font-serif italic">{latestPublished?.version || 'Nenhuma'}</p>
               </div>
               <div className="p-3 bg-[#E4E3E0] rounded-xl">
                  <p className="text-[10px] uppercase opacity-50 mb-1">Próxima Revisão</p>
                  <p className="text-sm font-serif italic">{latestDraft ? `${latestDraft.status} (${latestDraft.version})` : 'Disponível'}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: DocumentStatus) {
  switch (status) {
    case 'PUBLISHED': return 'bg-blue-600 text-white';
    case 'DRAFT': return 'bg-gray-200 text-gray-700';
    case 'UNDER_REVIEW': return 'bg-yellow-500 text-white';
    case 'APPROVED': return 'bg-green-500 text-white';
    case 'SUPERSEDED': return 'bg-gray-400 text-white';
    default: return '';
  }
}

function getStatusBg(status: DocumentStatus) {
  switch (status) {
    case 'PUBLISHED': return 'bg-blue-500';
    case 'DRAFT': return 'bg-gray-400';
    case 'UNDER_REVIEW': return 'bg-yellow-500';
    case 'APPROVED': return 'bg-green-500';
    case 'SUPERSEDED': return 'bg-gray-300';
    default: return '';
  }
}

function StatusIcon({ status }: { status: DocumentStatus }) {
  switch (status) {
    case 'PUBLISHED': return <CheckCircle className="w-3 h-3" />;
    case 'DRAFT': return <Clock className="w-3 h-3" />;
    case 'UNDER_REVIEW': return <Send className="w-3 h-3" />;
    case 'APPROVED': return <ShieldCheck className="w-3 h-3" />;
    case 'SUPERSEDED': return <Archive className="w-3 h-3" />;
  }
}
