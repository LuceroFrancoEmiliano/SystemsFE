import { store } from '../services/state.js';
import { WhatsAppService } from '../services/whatsapp.js';

let showNewClientModal = false;

export function renderClientsView() {
  const clientes = store.clientes;
  const empleados = store.empleados.filter(e => e.rol === 'CHOFER');

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            Clientes & Días de Entrega Automática
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Configura qué días se visita a cada cliente para que su hoja de ruta se genere sola para los choferes.
          </p>
        </div>

        <button class="btn btn-primary" onclick="window.toggleNewClientModal(true)">
          <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
          + Nuevo Cliente
        </button>
      </div>

      <div class="card">
        ${clientes.length === 0 ? `
          <div style="padding: 4rem 2rem; text-align: center;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #e0f2fe; color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
              <i data-lucide="users" style="width: 28px; height: 28px;"></i>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.4rem;">Padrón de Clientes Vacío</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Comienza dando de alta a los clientes de tu sodería y sus días de entrega.</p>
            <button class="btn btn-primary" onclick="window.toggleNewClientModal(true)">
              <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
              + Dar de Alta Primer Cliente
            </button>
          </div>
        ` : `
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Días de Reparto</th>
                  <th>Sifones Prestados</th>
                  <th>Bidones Prestados</th>
                  <th>Saldo Deudor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${clientes.map(c => `
                  <tr>
                    <td>
                      <strong>${c.nombre}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-dim); display: block;">${c.telefono || 'Sin teléfono'}</span>
                    </td>
                    <td>${c.direccion}</td>
                    <td>
                      <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                        ${(c.dias_visita || ['Lunes', 'Jueves']).map(d => `
                          <span class="badge badge-blue" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">${d.substring(0, 3)}</span>
                        `).join('')}
                      </div>
                    </td>
                    <td><strong style="color: var(--primary);">${c.sifones_prestados || 0}</strong> unid.</td>
                    <td><strong style="color: var(--accent-cyan);">${c.bidones_prestados || 0}</strong> unid.</td>
                    <td>
                      <strong style="color: ${(c.saldo_deudor || 0) > 0 ? '#dc2626' : '#15803d'}; font-family: var(--font-mono);">
                        $${(c.saldo_deudor || 0).toFixed(2)}
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
        `}
      </div>

      <!-- Modal Nuevo Cliente -->
      ${showNewClientModal ? `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
          <div class="card animate-scale-up" style="max-width: 520px; width: 100%; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
              <h3 style="font-size: 1.25rem; font-weight: 800;">Dar de Alta Cliente</h3>
              <button onclick="window.toggleNewClientModal(false)" style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer;">✕</button>
            </div>

            <form onsubmit="window.submitNewClient(event)">
              <div class="form-group">
                <label class="form-label">Nombre del Cliente / Comercio:</label>
                <input type="text" id="cli-nombre" class="form-input" placeholder="Ej: Panadería El Sol, Juan Gómez" required />
              </div>

              <div class="form-group">
                <label class="form-label">Dirección de Entrega:</label>
                <input type="text" id="cli-direccion" class="form-input" placeholder="Ej: Av. San Martín 1450" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Teléfono (WhatsApp):</label>
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

              <!-- Días de Reparto Automático -->
              <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 0.9rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem;">
                <label class="form-label" style="color: var(--primary); margin-bottom: 0.4rem;">
                  📅 Días de Entrega Automática al Chofer:
                </label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem;">
                  <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" name="cli-dias" value="Lunes" checked /> Lunes
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" name="cli-dias" value="Martes" /> Martes
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" name="cli-dias" value="Miércoles" /> Miércoles
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" name="cli-dias" value="Jueves" checked /> Jueves
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" name="cli-dias" value="Viernes" /> Viernes
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" name="cli-dias" value="Sábado" /> Sábado
                  </label>
                </div>
              </div>

              <!-- Envases Iniciales en Comodato -->
              <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 0.9rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem;">
                <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.5rem;">
                  Envases iniciales prestados (Comodato):
                </span>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div>
                    <label style="font-size: 0.75rem;">Sifones de Soda:</label>
                    <input type="number" id="cli-sifones" class="form-input" value="6" min="0" />
                  </div>
                  <div>
                    <label style="font-size: 0.75rem;">Bidones de Agua 20L:</label>
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

  // Leer checkboxes de días
  const checkedBoxes = Array.from(document.querySelectorAll('input[name="cli-dias"]:checked')).map(cb => cb.value);
  const dias = checkedBoxes.length > 0 ? checkedBoxes : ['Lunes', 'Jueves'];

  store.addCliente({
    nombre,
    direccion,
    telefono,
    nombre_zona: zona,
    dias_visita: dias,
    sifones_inicial: sifones,
    bidones_inicial: bidones
  });

  showNewClientModal = false;
  window.showToast(`Cliente "${nombre}" registrado con éxito para los días: ${dias.join(', ')}`, 'success');
};
