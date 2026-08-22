import { store } from '../services/state.js';
import { WhatsAppService } from '../services/whatsapp.js';

let showNewClientModal = false;

export function renderClientsView() {
  const clientes = store.clientes;

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            Clientes & Control de Envases
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Listado general de clientes, envases en su posesión y estado de cuentas corrientes.
          </p>
        </div>

        <button class="btn btn-primary" onclick="window.toggleNewClientModal(true)">
          <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
          + Nuevo Cliente
        </button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Zona</th>
                <th>Sifones Prestados</th>
                <th>Bidones Prestados</th>
                <th>Saldo Pendiente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${clientes.map(c => `
                <tr>
                  <td><strong>${c.nombre}</strong></td>
                  <td>${c.telefono || '-'}</td>
                  <td>${c.direccion}</td>
                  <td><span class="badge badge-blue">${c.nombre_zona}</span></td>
                  <td><strong style="color: var(--primary);">${c.sifones_prestados}</strong> sifones</td>
                  <td><strong style="color: var(--accent-cyan);">${c.bidones_prestados}</strong> bidones</td>
                  <td>
                    <strong style="color: ${c.saldo_deudor > 0 ? '#dc2626' : '#15803d'}; font-family: var(--font-mono);">
                      $${c.saldo_deudor.toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.4rem;">
                      <button 
                        class="btn btn-secondary btn-sm" 
                        style="padding: 0.35rem 0.65rem; color: #15803d; border-color: #bbf7d0; background: #f0fdf4;"
                        onclick="window.sendClientAviso('${c.nombre}', '${c.telefono}', '${c.nombre_zona}')"
                        title="Enviar aviso de paso de camión por WhatsApp"
                      >
                        <i data-lucide="message-circle" style="width: 14px; height: 14px; color: #16a34a;"></i>
                        Avisar
                      </button>
                      <button class="btn btn-secondary btn-sm" style="padding: 0.35rem 0.65rem;" onclick="window.showToast('Historial y comodato de ${c.nombre}', 'info')">
                        Detalles
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Nuevo Cliente -->
      ${showNewClientModal ? `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
          <div class="card animate-scale-up" style="max-width: 500px; width: 100%; box-shadow: var(--shadow-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
              <h3 style="font-size: 1.25rem; font-weight: 800;">Dar de Alta Cliente</h3>
              <button onclick="window.toggleNewClientModal(false)" style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer;">✕</button>
            </div>

            <form onsubmit="window.submitNewClient(event)">
              <div class="form-group">
                <label class="form-label">Nombre del Cliente / Negocio:</label>
                <input type="text" id="cli-nombre" class="form-input" placeholder="Ej: Panadería El Sol, Juan Gómez" required />
              </div>

              <div class="form-group">
                <label class="form-label">Dirección de Entrega:</label>
                <input type="text" id="cli-direccion" class="form-input" placeholder="Ej: Av. San Martín 1450" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Teléfono:</label>
                  <input type="text" id="cli-telefono" class="form-input" placeholder="+54 11 ..." />
                </div>

                <div class="form-group">
                  <label class="form-label">Zona de Reparto:</label>
                  <select id="cli-zona" class="form-input">
                    <option value="Zona Centro">Zona Centro</option>
                    <option value="Zona Norte">Zona Norte</option>
                    <option value="Barrio Sur">Barrio Sur</option>
                  </select>
                </div>
              </div>

              <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
                <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.5rem;">Envases iniciales en comodato:</span>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div>
                    <label style="font-size: 0.75rem;">Sifones de Soda:</label>
                    <input type="number" id="cli-sifones" class="form-input" value="6" min="0" />
                  </div>
                  <div>
                    <label style="font-size: 0.75rem;">Bidones de Agua:</label>
                    <input type="number" id="cli-bidones" class="form-input" value="0" min="0" />
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-secondary" onclick="window.toggleNewClientModal(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

window.sendClientAviso = (nombre, telefono, zona) => {
  WhatsAppService.sendAvisoPaso({
    clienteNombre: nombre,
    clienteTelefono: telefono,
    empresaNombre: store.empresa.nombre_empresa,
    nombreZona: zona
  });
};

window.toggleNewClientModal = (val) => {
  showNewClientModal = val;
  store.notify();
};

window.submitNewClient = (e) => {
  e.preventDefault();
  const nombre = document.getElementById('cli-nombre').value;
  const direccion = document.getElementById('cli-direccion').value;
  const telefono = document.getElementById('cli-telefono').value;
  const zona = document.getElementById('cli-zona').value;
  const sifones = document.getElementById('cli-sifones').value;
  const bidones = document.getElementById('cli-bidones').value;

  store.addCliente({
    nombre,
    direccion,
    telefono,
    nombre_zona: zona,
    sifones_inicial: sifones,
    bidones_inicial: bidones
  });

  showNewClientModal = false;
  window.showToast(`Cliente "${nombre}" registrado con éxito`, 'success');
};
