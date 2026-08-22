import { store } from '../services/state.js';

export function renderDeliveryView() {
  const rep = store.repartoActivo;
  const clientes = store.clientes;

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            Reparto Diario & Hojas de Ruta
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Despacho de camión, registro de entregas, envases devueltos y rendición de caja del chofer.
          </p>
        </div>
      </div>

      ${!rep ? `
        <!-- Formulario para Despachar Camión -->
        <div class="card" style="max-width: 600px;">
          <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">
            <i data-lucide="truck" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin-right: 6px; color: var(--primary);"></i>
            Iniciar Salida de Camión / Reparto
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Carga la cantidad de mercadería que sale del depósito para la jornada.
          </p>

          <form onsubmit="window.startReparto(event)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div class="form-group">
                <label class="form-label">Chofer Asignado:</label>
                <select id="rep-chofer" class="form-input">
                  <option value="Carlos Chofer">Carlos Chofer (Camión 1)</option>
                  <option value="${store.usuario.nombre}">${store.usuario.nombre} (Dueño)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Zona de Entrega:</label>
                <select id="rep-zona" class="form-input">
                  <option value="Zona Centro">Zona Centro</option>
                  <option value="Zona Norte">Zona Norte</option>
                  <option value="Barrio Sur">Barrio Sur</option>
                </select>
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.6rem;">Carga Inicial de Mercadería Llena:</span>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="font-size: 0.8rem; font-weight: 600;">Sifones de Soda (Llenos):</label>
                  <input type="number" id="rep-sifones" class="form-input" value="80" min="1" required />
                </div>
                <div>
                  <label style="font-size: 0.8rem; font-weight: 600;">Bidones 20L (Llenos):</label>
                  <input type="number" id="rep-bidones" class="form-input" value="25" min="0" required />
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">
              <i data-lucide="play" style="width: 16px; height: 16px;"></i>
              Despachar Camión & Comenzar Reparto
            </button>
          </form>
        </div>
      ` : `
        <!-- Hoja de Ruta Activa -->
        <div style="display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; align-items: start;">
          
          <!-- Columna Izquierda: Formulario de Parada y Lista de Entregas -->
          <div>
            <div class="card" style="margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">
                Registrar Entrega en Domicilio
              </h3>

              <form onsubmit="window.submitEntrega(event)">
                <div class="form-group">
                  <label class="form-label">Seleccionar Cliente:</label>
                  <select id="ent-cliente" class="form-input" required>
                    ${clientes.map(c => `
                      <option value="${c.id_cliente}">${c.nombre} (${c.direccion})</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div style="background: #f0f9ff; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid #bfdbfe;">
                    <span style="font-size: 0.72rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">Sifones de Soda</span>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.35rem;">
                      <input type="number" id="ent-sif-ent" class="form-input" placeholder="Dejados" value="6" min="0" />
                      <input type="number" id="ent-sif-dev" class="form-input" placeholder="Vacíos Recib." value="6" min="0" />
                    </div>
                  </div>

                  <div style="background: #f0fdfa; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid #99f6e4;">
                    <span style="font-size: 0.72rem; font-weight: 700; color: #0d9488; text-transform: uppercase;">Bidones 20 Litros</span>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.35rem;">
                      <input type="number" id="ent-bid-ent" class="form-input" placeholder="Dejados" value="0" min="0" />
                      <input type="number" id="ent-bid-dev" class="form-input" placeholder="Vacíos Recib." value="0" min="0" />
                    </div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                  <div class="form-group">
                    <label class="form-label">Monto Cobrado ($):</label>
                    <input type="number" id="ent-monto" class="form-input" placeholder="$ 2400.00" value="2400" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Forma de Pago:</label>
                    <select id="ent-metodo" class="form-input">
                      <option value="EFECTIVO">Efectivo en Mano</option>
                      <option value="TRANSFERENCIA">Transferencia / Mercado Pago</option>
                      <option value="FIADO">Fiado (Cuenta Corriente)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="btn btn-success" style="width: 100%;">
                  <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
                  Asentar Entrega y Cobro
                </button>
              </form>
            </div>

            <!-- Tabla de Entregas Realizadas -->
            <div class="card">
              <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Paradas Realizadas (${rep.entregas.length})</h3>
              ${rep.entregas.length === 0 ? `
                <p style="color: var(--text-dim); font-size: 0.88rem; text-align: center; padding: 1.5rem 0;">Aún no se registraron entregas en este viaje.</p>
              ` : `
                <div class="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Sifones</th>
                        <th>Bidones</th>
                        <th>Cobrado</th>
                        <th>Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rep.entregas.map(e => `
                        <tr>
                          <td><strong>${e.cliente_nombre}</strong></td>
                          <td>+${e.sifones_entregados} / -${e.sifones_devueltos}</td>
                          <td>+${e.bidones_entregados} / -${e.bidones_devueltos}</td>
                          <td><strong>$${e.cobrado.toFixed(2)}</strong></td>
                          <td><span class="badge ${e.metodo === 'EFECTIVO' ? 'badge-green' : e.metodo === 'TRANSFERENCIA' ? 'badge-blue' : 'badge-amber'}">${e.metodo}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>

          <!-- Columna Derecha: Resumen de Caja y Rendición -->
          <div class="card" style="position: sticky; top: 20px;">
            <span class="badge badge-green" style="margin-bottom: 0.75rem;">Camión en Calle</span>
            <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.25rem;">${rep.chofer}</h3>
            <span style="font-size: 0.8rem; color: var(--text-dim); display: block; margin-bottom: 1.25rem;">Zona: ${rep.zona}</span>

            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.5rem;">Caja Recaudada:</span>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.88rem;">
                <span>Efectivo:</span>
                <strong style="color: #15803d; font-family: var(--font-mono);">$${rep.total_efectivo.toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span>Transferencia:</span>
                <strong style="color: var(--primary); font-family: var(--font-mono);">$${rep.total_transferencia.toFixed(2)}</strong>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%;" onclick="window.cerrarReparto()">
              <i data-lucide="flag" style="width: 16px; height: 16px;"></i>
              Finalizar Reparto & Rendir Caja
            </button>
          </div>

        </div>
      `}
    </div>
  `;
}

window.startReparto = (e) => {
  e.preventDefault();
  const chofer = document.getElementById('rep-chofer').value;
  const zona = document.getElementById('rep-zona').value;
  const sifones = document.getElementById('rep-sifones').value;
  const bidones = document.getElementById('rep-bidones').value;

  store.iniciarReparto({ chofer, zona, sifones_salida: sifones, bidones_salida: bidones });
  window.showToast('🚚 Camión despachado con éxito', 'success');
};

window.submitEntrega = (e) => {
  e.preventDefault();
  const id_cliente = document.getElementById('ent-cliente').value;
  const sif_ent = document.getElementById('ent-sif-ent').value;
  const sif_dev = document.getElementById('ent-sif-dev').value;
  const bid_ent = document.getElementById('ent-bid-ent').value;
  const bid_dev = document.getElementById('ent-bid-dev').value;
  const monto = document.getElementById('ent-monto').value;
  const metodo = document.getElementById('ent-metodo').value;

  store.registrarEntregaReparto({
    id_cliente,
    sifones_entregados: sif_ent,
    sifones_devueltos: sif_dev,
    bidones_entregados: bid_ent,
    bidones_devueltos: bid_dev,
    cobrado: monto,
    metodo
  });

  window.showToast('✅ Entrega registrada', 'success');
};

window.cerrarReparto = () => {
  store.cerrarReparto();
  window.showToast('🏁 Reparto cerrado y caja rendida con éxito', 'success');
};
