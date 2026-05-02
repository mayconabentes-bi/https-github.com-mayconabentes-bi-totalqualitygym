import { Database } from 'sqlite3';
import { promisify } from 'util';

/**
 * MICRO-EDGE SYNC WORKER (Air-Gapped Resiliency)
 * Arquitetura projetada para rodar em hardware embarcado (ex: Raspberry Pi no balcão da catraca)
 */

interface SyncDelta {
    student_id: string;
    status: 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
    face_hash: string;
    updated_at: string;
}

export class DeltaSyncWorker {
    private db: Database;
    private lastSyncTimestamp: number = Date.now();
    private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
    private readonly MAX_OFFLINE_TIME = 12 * 60 * 60 * 1000; // 12 horas
    private isSyncing = false;
    private backoffMultiplier = 1;

    constructor() {
        // SQLite In-Memory ou arquivo local para persistência de borda
        this.db = new Database(':memory:');
        this.initSchema();
        this.startSyncLoop();
    }

    private initSchema() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS edge_access_control (
                student_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                face_hash TEXT NOT NULL,
                last_updated INTEGER NOT NULL
            );
        `);
    }

    private async startSyncLoop() {
        setInterval(async () => {
            if (this.isSyncing) return;
            this.isSyncing = true;
            
            try {
                // Sincronização Incremental (Apenas Deltas)
                const response = await fetch(`https://api.totalqualitygym.com/v1/sync/deltas?since=${this.lastSyncTimestamp}`);
                if (!response.ok) throw new Error('Sync failed');
                
                const deltas: SyncDelta[] = await response.json();
                await this.applyDeltas(deltas);
                
                this.lastSyncTimestamp = Date.now();
                this.backoffMultiplier = 1; // Reset backoff on success
                console.log(`[EDGE-SYNC] ${deltas.length} registros atualizados com sucesso.`);
            } catch (error) {
                console.error(`[EDGE-SYNC] Falha ao sincronizar. Rede instável. Tentativa com Exponential Backoff.`);
                // Exponential Backoff Logic:
                const delay = Math.min(1000 * 2 ** this.backoffMultiplier, 60000); // max 60s
                this.backoffMultiplier++;
                await new Promise(res => setTimeout(res, delay));
            } finally {
                this.isSyncing = false;
            }
        }, this.SYNC_INTERVAL);
    }

    private async applyDeltas(deltas: SyncDelta[]) {
        const stmt = this.db.prepare(`
            INSERT INTO edge_access_control (student_id, status, face_hash, last_updated)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(student_id) DO UPDATE SET 
                status = excluded.status,
                face_hash = excluded.face_hash,
                last_updated = excluded.last_updated
        `);

        this.db.serialize(() => {
            deltas.forEach(delta => {
                stmt.run(delta.student_id, delta.status, delta.face_hash, Date.now());
            });
            stmt.finalize();
        });
    }

    /**
     * Lógica de Decisão de Acesso (Air-Gapped Mode)
     * Responde em menos de 100ms offline.
     */
    public async evaluateAccess(studentId: string, matchedFaceHash: string): Promise<{ granted: boolean, reason?: string, requiresOverride: boolean }> {
        return new Promise((resolve) => {
            this.db.get('SELECT status, last_updated FROM edge_access_control WHERE student_id = ? AND face_hash = ?', [studentId, matchedFaceHash], (err, row: any) => {
                if (err || !row) {
                    return resolve({ granted: false, reason: 'IDENTIDADE_NAO_ENCONTRADA_OU_DESATUALIZADA', requiresOverride: false });
                }

                // 1. Air-Gapped Timeout Protection (Se ficou +12h offline, bloquear por segurança)
                const timeSinceLastSync = Date.now() - this.lastSyncTimestamp;
                if (timeSinceLastSync > this.MAX_OFFLINE_TIME) {
                    return resolve({ 
                        granted: false, 
                        reason: 'EDGE_SYNC_TIMEOUT_EXCEEDED', 
                        requiresOverride: true // Operador pode sobrepor se visualizar comprovante pago
                    });
                }

                // 2. Proteção Financeira e Metabólica
                if (row.status === 'PAST_DUE') {
                    return resolve({ 
                        granted: false, 
                        reason: 'PENDENCIA_FINANCEIRA', 
                        requiresOverride: true 
                    });
                }
                
                if (row.status === 'SUSPENDED') {
                    return resolve({ 
                        granted: false, 
                        reason: 'CONTRATO_SUSPENSO', 
                        requiresOverride: false 
                    });
                }

                // Access Granted
                resolve({ granted: true, requiresOverride: false });
            });
        });
    }
}
