import { store } from '../services/state.js';
import { offlineService } from '../services/offlineSync.js';
import { WhatsAppService } from '../services/whatsapp.js';

let selectedClientIndex = 0;
let deliveryState = {
  sifones_ent: 6,
  sifones_dev: 6,
  bidones_ent: 0,
  bidones_dev: 0,
  monto: 2400,
  metodo: 'EFECTIVO'
};

export function renderDriverMobileView() {
  const clientes = store.clientes;
  const currentClient = clientes[selectedClientIndex] || clientes[0];
  const isOnline = offlineService.isOnline;
  const pendingCount = offlineService.getPendingCount();

  if (!currentClient) {
    return `
      <div class="animate-fade-in" style="max-width: 480px; margin: 0 auto; text-align: center; padding: 2rem 1rem;">
        <h3>No hay clientes cargados</h3>
        <button class="btn btn-primary" onclick="window.navigateSod('clientes')">Ir a Clientes</button>
      </div>
    `;
  }

  return `
    <div class="animate-fade-in" style="max-width: 440px; margin: 0 auto 4rem; padding: 0.5rem;">
      
      <!-- Barra de Estado Offline / Online -->
      <div style="background: ${isOnline ? '#ecfdf5' : '#fffbeb'}; border: 1px solid ${isOnline ? '#a7f3d0' : '#fde68a'}; border-radius: var(--radius-sm); padding: 0.6rem 0.9rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; font-weight: 700; color: ${isOnline ? '#065f46' : '#92400e'};">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${isOnline ? '#10b981' : '#f59e0b'};"></span>
          ${isOnline ? '🟢 En Línea (Sincronizado)' : '📡 Modo Offline (Sin señal)'}
        </div>
        ${pendingCount > 0 ? `
          <span class="badge badge-amber" style="font-size: 0.7rem;">${pendingCount} pendientes</span>
        ` : ''}
      </div>

      <!-- Selector Rápido de Cliente (Paso a Paso) -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
        <button class="btn btn-secondary btn-sm" style="padding: 0.6rem 1rem;" onclick="window.changeDriverClient(-1)" ${selectedClientIndex === 0 ? 'disabled' : ''}>
          <i data-lucide="chevron-left" style="width: 18px; height: 18px;"></i>
          Anterior
        </button>
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-dim);">
          Parada ${selectedClientIndex + 1} de ${clientes.length}
        </span>
        <button class="btn btn-secondary btn-sm" style="padding: 0.6rem 1rem;" onclick="window.changeDriverClient(1)" ${selectedClientIndex >= clientes.length - 1 ? 'disabled' : ''}>
          Siguiente
          <i data-lucide="chevron-right" style="width: 18px; height: 18px;"></i>
        </button>
      </div>

      <!-- Tarjeta del Cliente Actual -->
      <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-left: 4px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.1rem;">
            ${currentClient.nombre}
          </h2>
          <span class="badge badge-blue">${currentClient.nombre_zona}</span>
        </div>

        <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.35rem;">
          <i data-lucide="map-pin" style="width: 15px; height: 15px; color: var(--primary); flex-shrink: 0;"></i>
          ${currentClient.direccion}
        </p>

        <!-- Botones de Acción Rápida (GPS & WhatsApp) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
          <a 
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentClient.direccion)}" 
            target="_blank" 
            class="btn btn-secondary btn-sm" 
            style="font-size: 0.8rem; padding: 0.5rem; justify-content: center; background: #f0f9ff; border-color: #bfdbfe; color: var(--primary);"
          >
            <i data-lucide="navigation" style="width: 14px; height: 14px;"></i>
            Abrir en Maps
          </a>

          <button 
            type="button" 
            class="btn btn-secondary btn-sm" 
            style="font-size: 0.8rem; padding: 0.5rem; justify-content: center; background: #ecfdf5; border-color: #a7f3d0; color: #065f46;"
            onclick="window.sendWhatsAppAviso()"
          >
            <i data-lucide="message-circle" style="width: 14px; height: 14px; color: #10b981;"></i>
            Avisar WhatsApp
          </button>
        </div>
      </div>

      <!-- BOTONERA TÁCTIL PARA UNA SOLA MANO -->
      <div class="card" style="padding: 1.25rem; margin-bottom: 1.25rem;">
        
        <!-- Sifones de Soda -->
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="font-size: 0.9rem; color: var(--text-main);">Sifones de Soda (Cajón de 6):</strong>
            <span style="font-size: 1.1rem; font-weight: 800; color: var(--primary); font-family: var(--font-mono);">
              ${deliveryState.sifones_ent} dejados / ${deliveryState.sifones_dev} vacíos
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.6rem 0;" onclick="window.setSifones(6, 6)">+6 / -6</button>
            <button class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.6rem 0;" onclick="window.setSifones(12, 12)">+12 / -12</button>
            <button class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.6rem 0;" onclick="window.setSifones(6, 0)">+6 solo</button>
            <button class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.6rem 0;" onclick="window.setSifones(0, 6)">-6 vacíos</button>
          </div>
        </div>

        <!-- Bidones de 20 Litros -->
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="font-size: 0.9rem; color: var(--text-main);">Bidones de Agua 20L:</strong>
            <span style="font-size: 1.1rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono);">
              ${deliveryState.bidones_ent} dejados / ${deliveryState.bidones_dev} vacíos
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.6rem 0;" onclick="window.setBidones(1, 1)">+1 / -1</button>
            <button class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.6rem 0;" onclick="window.setBidones(2, 2)">+2 / -2</button>
            <button class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.6rem 0;" onclick="window.setBidones(1, 0)">+1 solo</button>
            <button class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.6rem 0;" onclick="window.setBidones(0, 0)">Ninguno</button>
          </div>
        </div>

        <!-- Cobro y Medio de Pago -->
        <div style="margin-bottom: 1.25rem;">
          <label class="form-label">Total Cobrado ($):</label>
          <input 
            type="number" 
            id="mobile-monto" 
            class="form-input" 
            style="font-size: 1.4rem; font-weight: 800; text-align: center; color: var(--primary); padding: 0.75rem;" 
            value="${deliveryState.monto}" 
            onchange="deliveryState.monto = Number(this.value)"
          />

          <!-- Botones Rápidos de Medio de Pago -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.4rem; margin-top: 0.6rem;">
            <button 
              type="button" 
              class="btn ${deliveryState.metodo === 'EFECTIVO' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              style="padding: 0.6rem 0; font-size: 0.8rem;"
              onclick="window.setMetodo('EFECTIVO')"
            >
              💵 Efectivo
            </button>
            <button 
              type="button" 
              class="btn ${deliveryState.metodo === 'TRANSFERENCIA' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              style="padding: 0.6rem 0; font-size: 0.8rem;"
              onclick="window.setMetodo('TRANSFERENCIA')"
            >
              📲 Transf / QR
            </button>
            <button 
              type="button" 
              class="btn ${deliveryState.metodo === 'FIADO' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              style="padding: 0.6rem 0; font-size: 0.8rem;"
              onclick="window.setMetodo('FIADO')"
            >
              📝 Fiado
            </button>
          </div>
        </div>

        <!-- BOTÓN GIGANTE DE REGISTRO EN 1 TOQUE -->
        <button 
          type="button" 
          class="btn btn-success" 
          style="width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: 800; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);" 
          onclick="window.confirmDriverDelivery()"
        >
          <i data-lucide="check-circle-2" style="width: 22px; height: 22px;"></i>
          REGISTRAR ENTREGA
        </button>

      </div>

    </div>
  `;
}

window.changeDriverClient = (delta) => {
  const next = selectedClientIndex + delta;
  if (next >= 0 && next < store.clientes.length) {
    selectedClientIndex = next;
    deliveryState = {
      sifones_ent: 6,
      sifones_dev: 6,
      bidones_ent: 0,
      bidones_dev: 0,
      monto: 2400,
      metodo: 'EFECTIVO'
    };
    store.notify();
  }
};

window.setSifones = (ent, dev) => {
  deliveryState.sifones_ent = ent;
  deliveryState.sifones_dev = dev;
  deliveryState.monto = (ent / 6) * 2400 + deliveryState.bidones_ent * 2800;
  store.notify();
};

window.setBidones = (ent, dev) => {
  deliveryState.bidones_ent = ent;
  deliveryState.bidones_dev = dev;
  deliveryState.monto = (deliveryState.sifones_ent / 6) * 2400 + ent * 2800;
  store.notify();
};

window.setMetodo = (m) => {
  deliveryState.metodo = m;
  if (m === 'FIADO') deliveryState.monto = 0;
  store.notify();
};

window.sendWhatsAppAviso = () => {
  const c = store.clientes[selectedClientIndex];
  WhatsAppService.sendAvisoPaso({
    clienteNombre: c.nombre,
    clienteTelefono: c.telefono,
    empresaNombre: store.empresa.nombre_empresa,
    nombreZona: c.nombre_zona
  });
};

window.confirmDriverDelivery = () => {
  const c = store.clientes[selectedClientIndex];
  
  // Guardar en cola offline / online
  offlineService.enqueueDelivery({
    id_reparto: store.repartoActivo?.id_reparto || 1,
    id_cliente: c.id_cliente,
    sifones_entregados: deliveryState.sifones_ent,
    sifones_devueltos: deliveryState.sifones_dev,
    bidones_entregados: deliveryState.bidones_ent,
    bidones_devueltos: deliveryState.bidones_dev,
    monto_total: deliveryState.monto,
    monto_cobrado: deliveryState.monto,
    metodo_pago: deliveryState.metodo
  });

  // Actualizar estado local
  c.sifones_prestados += (deliveryState.sifones_ent - deliveryState.sifones_dev);
  c.bidones_prestados += (deliveryState.bidones_ent - deliveryState.bidones_dev);

  window.showToast(`✅ Entrega guardada para "${c.nombre}"`, 'success');

  // Pasar al siguiente cliente
  if (selectedClientIndex < store.clientes.length - 1) {
    selectedClientIndex++;
    deliveryState = {
      sifones_ent: 6,
      sifones_dev: 6,
      bidones_ent: 0,
      bidones_dev: 0,
      monto: 2400,
      metodo: 'EFECTIVO'
    };
  }

  store.notify();
};
