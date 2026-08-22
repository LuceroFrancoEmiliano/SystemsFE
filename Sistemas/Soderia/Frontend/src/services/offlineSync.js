/**
 * ============================================================================
 * SERVICIO DE MODO OFFLINE & AUTO-SINCRONIZACIÓN (Sodería Cloud)
 * Permite a los choferes registrar entregas en la calle sin señal de internet
 * ============================================================================
 */

class OfflineSyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.queue = JSON.parse(localStorage.getItem('soderia_offline_queue') || '[]');
    this.listeners = [];

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingQueue();
      this.notify();
      window.showToast?.('🟢 Conexión restablecida. Sincronizando datos con la nube...', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notify();
      window.showToast?.('📡 Modo Offline activo. Las entregas se guardarán localmente.', 'info');
    });
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // Guardar entrega en cola local si no hay internet
  enqueueDelivery(deliveryData) {
    this.queue.push({
      ...deliveryData,
      local_id: Date.now(),
      created_at: new Date().toISOString()
    });
    localStorage.setItem('soderia_offline_queue', JSON.stringify(this.queue));
    this.notify();

    if (this.isOnline) {
      this.syncPendingQueue();
    }
  }

  // Sincronizar cola de entregas pendientes cuando vuelve la señal
  async syncPendingQueue() {
    if (this.queue.length === 0) return;

    const pending = [...this.queue];
    console.log(`[Offline Sync] Sincronizando ${pending.length} entregas pendientes con Neon DB...`);

    for (const item of pending) {
      try {
        await fetch('http://localhost:3001/api/repartos/entrega', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });

        // Remover de la cola
        this.queue = this.queue.filter(q => q.local_id !== item.local_id);
        localStorage.setItem('soderia_offline_queue', JSON.stringify(this.queue));
        this.notify();
      } catch (err) {
        console.warn('[Offline Sync] Error al sincronizar item, reintentando luego:', err.message);
        break;
      }
    }

    if (this.queue.length === 0) {
      window.showToast?.('✅ Todas las entregas offline han sido sincronizadas.', 'success');
    }
  }

  getPendingCount() {
    return this.queue.length;
  }
}

export const offlineService = new OfflineSyncService();
