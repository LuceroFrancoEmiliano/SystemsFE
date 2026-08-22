import { store } from '../services/state.js';
import { WhatsAppService } from '../services/whatsapp.js';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

let selectedClientId = null;
let isOptimizingGPS = false;
let currentDelivery = {
  sifones_ent: 6,
  sifones_dev: 6,
  bidones_ent: 0,
  bidones_dev: 0,
  monto_cobrado: 2400,
  metodo_pago: 'EFECTIVO'
};

export function renderDriverMobileView() {
  const dia = store.diaSeleccionado;
  const clientesDelDia = store.getClientesDelDia(dia);
  
  // Auto-seleccionar el primer cliente pendiente si no hay ninguno seleccionado
  if (!selectedClientId && clientesDelDia.length > 0) {
    selectedClientId = clientesDelDia[0].id_cliente;
    currentDelivery.monto_cobrado = 2400;
  }

  const activeClient = clientesDelDia.find(c => c.id_cliente === Number(selectedClientId)) || clientesDelDia[0];
  const estadoActual = activeClient ? store.getEstadoEntregaCliente(activeClient.id_cliente) : null;

  const totalParadas = clientesDelDia.length;
  const completadas = clientesDelDia.filter(c => store.getEstadoEntregaCliente(c.id_cliente)).length;

  return `
    <div class="animate-fade-in" style="max-width: 480px; margin: 0 auto 3rem; padding: 0.25rem;">
      
      <!-- Selector de Día de Reparto & Botón de Optimizar GPS -->
      <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-dim);">
            📅 Día de Reparto:
          </span>
          <span class="badge badge-blue" style="font-size: 0.72rem;">
            ${completadas}/${totalParadas} Paradas
          </span>
        </div>

        <div style="display: flex; gap: 0.35rem; overflow-x: auto; padding-bottom: 0.4rem; margin-bottom: 0.5rem;">
          ${DIAS.map(d => {
            const isSelected = store.diaSeleccionado === d;
            return `
              <button 
                type="button" 
                class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}"
                style="padding: 0.35rem 0.65rem; font-size: 0.75rem; border-radius: var(--radius-full); white-space: nowrap;"
                onclick="window.selectDriverDay('${d}')"
              >
                ${d.substring(0, 3)}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Botón de Ordenamiento por Cercanía GPS -->
        <button 
          type="button"
          class="btn btn-secondary btn-sm"
          style="width: 100%; font-size: 0.78rem; justify-content: center; background: ${store.driverCoords ? '#ecfdf5' : '#f0f9ff'}; color: ${store.driverCoords ? '#065f46' : 'var(--primary)'}; border-color: ${store.driverCoords ? '#a7f3d0' : '#bfdbfe'};"
          onclick="window.handleOptimizeProximity()"
          ${isOptimizingGPS ? 'disabled' : ''}
        >
          <i data-lucide="navigation" style="width: 14px; height: 14px; color: ${store.driverCoords ? '#10b981' : 'var(--primary)'};"></i>
          ${isOptimizingGPS ? 'Calculando GPS...' : (store.driverCoords ? '📍 Ruta Ordenada por Cercanía GPS Activa' : '📍 Ordenar Paradas por Cercanía de mi Ubicación')}
        </button>
      </div>

      ${totalParadas === 0 ? `
        <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: #e0f2fe; color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <i data-lucide="calendar" style="width: 26px; height: 26px;"></i>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.4rem;">Sin Entregas para el ${dia}</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem;">
            No hay clientes programados automáticamente para este día.
          </p>
          <button class="btn btn-secondary btn-sm" onclick="window.navigateSod('clientes')">
            Ver Padrón de Clientes
          </button>
        </div>
      ` : `
        
        <!-- Carrusel / Lista de Paradas del Día (Ordenadas por Cercanía) -->
        <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.6rem; margin-bottom: 0.75rem;">
          ${clientesDelDia.map((c, idx) => {
            const st = store.getEstadoEntregaCliente(c.id_cliente);
            const isCurrent = activeClient?.id_cliente === c.id_cliente;
            return `
              <button 
                type="button"
                onclick="window.selectClientStop(${c.id_cliente})"
                style="
                  min-width: 140px; 
                  padding: 0.6rem; 
                  border-radius: var(--radius-sm); 
                  border: 2px solid ${isCurrent ? 'var(--primary)' : 'var(--border-subtle)'}; 
                  background: ${isCurrent ? '#f0f9ff' : '#fff'}; 
                  text-align: left; 
                  cursor: pointer;
                  flex-shrink: 0;
                "
              >
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                  <strong style="font-size: 0.75rem; color: var(--text-dim);">#${idx + 1}</strong>
                  ${st?.estado === 'OK' ? '<span style="color: #16a34a; font-size: 0.75rem; font-weight: 800;">✓ OK</span>' : ''}
                  ${st?.estado === 'NO_ESTABA' ? '<span style="color: #dc2626; font-size: 0.75rem; font-weight: 800;">✗ No</span>' : ''}
                  ${!st ? (c.distanciaTexto ? `<span style="color: #0284c7; font-size: 0.7rem; font-weight: 800;">📍 ${c.distanciaTexto}</span>` : '<span style="color: var(--primary); font-size: 0.7rem; font-weight: 700;">Pendiente</span>') : ''}
                </div>
                <strong style="font-size: 0.85rem; color: var(--text-main); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${c.nombre}
                </strong>
              </button>
            `;
          }).join('')}
        </div>

        ${activeClient ? `
          <!-- FICHA DE ENTREGA ACTUAL -->
          <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-top: 4px solid var(--primary);">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.15rem;">
                  <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin: 0;">
                    ${activeClient.nombre}
                  </h2>
                  ${activeClient.distanciaTexto ? `
                    <span class="badge badge-blue" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">
                      📍 a ${activeClient.distanciaTexto}
                    </span>
                  ` : ''}
                </div>
                <p style="font-size: 0.88rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
                  <i data-lucide="map-pin" style="width: 14px; height: 14px; color: var(--primary); flex-shrink: 0;"></i>
                  ${activeClient.direccion}
                </p>
              </div>

              ${estadoActual ? `
                <span class="badge ${estadoActual.estado === 'OK' ? 'badge-green' : 'badge-amber'}" style="font-size: 0.78rem;">
                  ${estadoActual.estado === 'OK' ? '✅ Ya Entregado' : '❌ No Estaba'}
                </span>
              ` : ''}
            </div>

            <!-- Accesos directos: Maps & WhatsApp -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem; margin-bottom: 1rem;">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeClient.direccion)}" 
                target="_blank" 
                class="btn btn-secondary btn-sm" 
                style="justify-content: center; font-size: 0.78rem; background: #f0f9ff; border-color: #bfdbfe; color: var(--primary);"
              >
                <i data-lucide="navigation" style="width: 14px; height: 14px;"></i>
                Abrir en Maps
              </a>

              <button 
                type="button" 
                class="btn btn-secondary btn-sm" 
                style="justify-content: center; font-size: 0.78rem; background: #ecfdf5; border-color: #a7f3d0; color: #065f46;"
                onclick="window.sendAvisoWhatsAppCurrent()"
              >
                <i data-lucide="message-circle" style="width: 14px; height: 14px; color: #10b981;"></i>
                Avisar WhatsApp
              </button>
            </div>

            <!-- Resumen de Envases en poder del Cliente y Deuda previa -->
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 0.85rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem;">
              <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: var(--text-dim); display: block; margin-bottom: 0.35rem;">
                Posesión actual del Cliente:
              </span>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
                <span>Sifones en comodato:</span>
                <strong style="color: var(--primary); font-family: var(--font-mono);">${activeClient.sifones_prestados || 0} unid.</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
                <span>Bidones 20L en comodato:</span>
                <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${activeClient.bidones_prestados || 0} unid.</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.3rem;">
                <span>Deuda fiado acumulada:</span>
                <strong style="color: ${activeClient.saldo_deudor > 0 ? '#dc2626' : '#15803d'}; font-family: var(--font-mono);">
                  $${(activeClient.saldo_deudor || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <!-- CONTROLES [+] Y [-] DE SIFONES DE SODA -->
            <div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 0.9rem; margin-bottom: 1rem;">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--primary); display: block; margin-bottom: 0.6rem;">
                💧 Sifones de Soda (Cajón de 6)
              </span>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div>
                  <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Llenos Dejados:</label>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 38px; height: 38px; font-size: 1.2rem; font-weight: 800;" onclick="window.stepSifonesEnt(-6)">-</button>
                    <span style="flex: 1; text-align: center; font-size: 1.2rem; font-weight: 800; font-family: var(--font-mono); color: var(--primary);">${currentDelivery.sifones_ent}</span>
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 38px; height: 38px; font-size: 1.2rem; font-weight: 800;" onclick="window.stepSifonesEnt(+6)">+</button>
                  </div>
                </div>

                <div>
                  <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Vacíos Recibidos:</label>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 38px; height: 38px; font-size: 1.2rem; font-weight: 800;" onclick="window.stepSifonesDev(-6)">-</button>
                    <span style="flex: 1; text-align: center; font-size: 1.2rem; font-weight: 800; font-family: var(--font-mono); color: #b45309;">${currentDelivery.sifones_dev}</span>
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 38px; height: 38px; font-size: 1.2rem; font-weight: 800;" onclick="window.stepSifonesDev(+6)">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- CONTROLES [+] Y [-] DE BOTELLAS GRANDES DE AGUA (20L) -->
            <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: var(--radius-sm); padding: 0.9rem; margin-bottom: 1rem;">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #0d9488; display: block; margin-bottom: 0.6rem;">
                🛢️ Bidones Grandes de Agua (20 Litros)
              </span>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div>
                  <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Llenos Dejados:</label>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 38px; height: 38px; font-size: 1.2rem; font-weight: 800;" onclick="window.stepBidonesEnt(-1)">-</button>
                    <span style="flex: 1; text-align: center; font-size: 1.2rem; font-weight: 800; font-family: var(--font-mono); color: #0d9488;">${currentDelivery.bidones_ent}</span>
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 38px; height: 38px; font-size: 1.2rem; font-weight: 800;" onclick="window.stepBidonesEnt(+1)">+</button>
                  </div>
                </div>

                <div>
                  <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Vacíos Recibidos:</label>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 38px; height: 38px; font-size: 1.2rem; font-weight: 800;" onclick="window.stepBidonesDev(-1)">-</button>
                    <span style="flex: 1; text-align: center; font-size: 1.2rem; font-weight: 800; font-family: var(--font-mono); color: #b45309;">${currentDelivery.bidones_dev}</span>
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 38px; height: 38px; font-size: 1.2rem; font-weight: 800;" onclick="window.stepBidonesDev(+1)">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- COBRO Y MEDIO DE PAGO -->
            <div style="margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label class="form-label" style="margin: 0;">Monto Cobrado hoy ($):</label>
                <span style="font-size: 0.8rem; color: var(--text-dim);">
                  Sugerido: $${((currentDelivery.sifones_ent / 6) * 2400 + currentDelivery.bidones_ent * 2800).toFixed(2)}
                </span>
              </div>
              <input 
                type="number" 
                id="cobro-input" 
                class="form-input" 
                style="font-size: 1.3rem; font-weight: 800; text-align: center; color: var(--primary);" 
                value="${currentDelivery.monto_cobrado}"
                onchange="currentDelivery.monto_cobrado = Number(this.value)"
              />

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-top: 0.5rem;">
                <button 
                  type="button" 
                  class="btn btn-sm ${currentDelivery.metodo_pago === 'EFECTIVO' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="window.setDriverMetodo('EFECTIVO')"
                >
                  💵 Efectivo
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm ${currentDelivery.metodo_pago === 'TRANSFERENCIA' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="window.setDriverMetodo('TRANSFERENCIA')"
                >
                  📲 Transferencia
                </button>
              </div>
            </div>

            <!-- DOS BOTONES PRINCIPALES: OK vs NO OK -->
            <div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 0.6rem; margin-top: 1rem;">
              <button 
                type="button" 
                class="btn btn-secondary" 
                style="padding: 0.9rem; font-weight: 800; color: #dc2626; border-color: #fca5a5; background: #fef2f2;" 
                onclick="window.confirmEntregaNoEstaba()"
              >
                <i data-lucide="x-circle" style="width: 18px; height: 18px;"></i>
                NO ESTABA
              </button>

              <button 
                type="button" 
                class="btn btn-success" 
                style="padding: 0.9rem; font-size: 1.05rem; font-weight: 800; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);" 
                onclick="window.confirmEntregaOK()"
              >
                <i data-lucide="check-circle" style="width: 20px; height: 20px;"></i>
                OK ENTREGADO
              </button>
            </div>

          </div>
        ` : ''}

      `}

    </div>
  `;
}

// Handlers
window.handleOptimizeProximity = async () => {
  isOptimizingGPS = true;
  store.notify();
  try {
    const coords = await store.autoOptimizarRutaGPS();
    window.showToast(`📍 Paradas ordenadas por cercanía a tu ubicación GPS`, 'success');
  } catch (e) {
    window.showToast('No se pudo obtener la ubicación GPS', 'error');
  } finally {
    isOptimizingGPS = false;
    store.notify();
  }
};

window.selectDriverDay = (dia) => {
  store.setDiaSeleccionado(dia);
  selectedClientId = null;
};

window.selectClientStop = (id) => {
  selectedClientId = id;
  currentDelivery = {
    sifones_ent: 6,
    sifones_dev: 6,
    bidones_ent: 0,
    bidones_dev: 0,
    monto_cobrado: 2400,
    metodo_pago: 'EFECTIVO'
  };
  store.notify();
};

window.stepSifonesEnt = (delta) => {
  currentDelivery.sifones_ent = Math.max(0, currentDelivery.sifones_ent + delta);
  currentDelivery.monto_cobrado = (currentDelivery.sifones_ent / 6) * 2400 + currentDelivery.bidones_ent * 2800;
  store.notify();
};

window.stepSifonesDev = (delta) => {
  currentDelivery.sifones_dev = Math.max(0, currentDelivery.sifones_dev + delta);
  store.notify();
};

window.stepBidonesEnt = (delta) => {
  currentDelivery.bidones_ent = Math.max(0, currentDelivery.bidones_ent + delta);
  currentDelivery.monto_cobrado = (currentDelivery.sifones_ent / 6) * 2400 + currentDelivery.bidones_ent * 2800;
  store.notify();
};

window.stepBidonesDev = (delta) => {
  currentDelivery.bidones_dev = Math.max(0, currentDelivery.bidones_dev + delta);
  store.notify();
};

window.setDriverMetodo = (m) => {
  currentDelivery.metodo_pago = m;
  store.notify();
};

window.sendAvisoWhatsAppCurrent = () => {
  const dia = store.diaSeleccionado;
  const clientesDelDia = store.getClientesDelDia(dia);
  const activeClient = clientesDelDia.find(c => c.id_cliente === Number(selectedClientId)) || clientesDelDia[0];
  if (!activeClient) return;

  WhatsAppService.sendAvisoPaso({
    clienteNombre: activeClient.nombre,
    clienteTelefono: activeClient.telefono,
    empresaNombre: store.empresa.nombre_empresa,
    nombreZona: activeClient.nombre_zona
  });
};

window.confirmEntregaOK = () => {
  const dia = store.diaSeleccionado;
  const clientesDelDia = store.getClientesDelDia(dia);
  const activeClient = clientesDelDia.find(c => c.id_cliente === Number(selectedClientId)) || clientesDelDia[0];
  if (!activeClient) return;

  const montoTotalSugerido = (currentDelivery.sifones_ent / 6) * 2400 + currentDelivery.bidones_ent * 2800;

  store.registrarResultadoEntrega({
    id_cliente: activeClient.id_cliente,
    estado: 'OK',
    sifones_entregados: currentDelivery.sifones_ent,
    sifones_devueltos: currentDelivery.sifones_dev,
    bidones_entregados: currentDelivery.bidones_ent,
    bidones_devueltos: currentDelivery.bidones_dev,
    monto_total: montoTotalSugerido,
    monto_cobrado: currentDelivery.monto_cobrado,
    metodo_pago: currentDelivery.metodo_pago
  });

  window.showToast(`✅ Entrega registrada para ${activeClient.nombre}`, 'success');

  // Avanzar a la siguiente parada pendiente más cercana
  const siguiente = clientesDelDia.find(c => !store.getEstadoEntregaCliente(c.id_cliente) && c.id_cliente !== activeClient.id_cliente);
  if (siguiente) {
    selectedClientId = siguiente.id_cliente;
    currentDelivery = {
      sifones_ent: 6,
      sifones_dev: 6,
      bidones_ent: 0,
      bidones_dev: 0,
      monto_cobrado: 2400,
      metodo_pago: 'EFECTIVO'
    };
  }

  store.notify();
};

window.confirmEntregaNoEstaba = () => {
  const dia = store.diaSeleccionado;
  const clientesDelDia = store.getClientesDelDia(dia);
  const activeClient = clientesDelDia.find(c => c.id_cliente === Number(selectedClientId)) || clientesDelDia[0];
  if (!activeClient) return;

  store.registrarResultadoEntrega({
    id_cliente: activeClient.id_cliente,
    estado: 'NO_ESTABA'
  });

  window.showToast(`❌ Parada marcada como "No Estaba" (${activeClient.nombre})`, 'info');

  const siguiente = clientesDelDia.find(c => !store.getEstadoEntregaCliente(c.id_cliente) && c.id_cliente !== activeClient.id_cliente);
  if (siguiente) {
    selectedClientId = siguiente.id_cliente;
  }

  store.notify();
};
