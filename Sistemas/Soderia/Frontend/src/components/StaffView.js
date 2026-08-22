import { store } from '../services/state.js';

let showNewStaffModal = false;

export function renderStaffView() {
  const empleados = store.empleados;

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            Choferes & Personal de Planta
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Crea y administra los accesos para los empleados de tu sodería (sin costo adicional).
          </p>
        </div>

        <button class="btn btn-primary" onclick="window.toggleNewStaffModal(true)">
          <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
          + Crear Cuenta de Empleado
        </button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email / Usuario</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${store.usuario.nombre}</strong></td>
                <td>${store.usuario.email}</td>
                <td><span class="badge badge-blue">${store.usuario.rol}</span></td>
                <td>-</td>
                <td><span class="badge badge-green">Activo (Dueño)</span></td>
              </tr>
              ${empleados.map(e => `
                <tr>
                  <td><strong>${e.nombre}</strong></td>
                  <td>${e.email}</td>
                  <td><span class="badge ${e.rol === 'CHOFER' ? 'badge-amber' : 'badge-blue'}">${e.rol}</span></td>
                  <td>${e.telefono || '-'}</td>
                  <td><span class="badge badge-green">Activo</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Nuevo Empleado -->
      ${showNewStaffModal ? `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
          <div class="card animate-scale-up" style="max-width: 480px; width: 100%; box-shadow: var(--shadow-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
              <h3 style="font-size: 1.25rem; font-weight: 800;">Crear Cuenta de Empleado</h3>
              <button onclick="window.toggleNewStaffModal(false)" style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer;">✕</button>
            </div>

            <form onsubmit="window.submitNewStaff(event)">
              <div class="form-group">
                <label class="form-label">Nombre y Apellido:</label>
                <input type="text" id="staff-nombre" class="form-input" placeholder="Ej: Carlos Chofer" required />
              </div>

              <div class="form-group">
                <label class="form-label">Email de Ingreso:</label>
                <input type="email" id="staff-email" class="form-input" placeholder="carlos@soderia.com" required />
              </div>

              <div class="form-group">
                <label class="form-label">Contraseña de Acceso:</label>
                <input type="password" id="staff-pass" class="form-input" placeholder="••••••••" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Rol:</label>
                  <select id="staff-rol" class="form-input">
                    <option value="CHOFER">Chofer / Repartidor</option>
                    <option value="PLANTA">Operario de Planta</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Teléfono:</label>
                  <input type="text" id="staff-telefono" class="form-input" placeholder="+54 11 ..." />
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                <button type="button" class="btn btn-secondary" onclick="window.toggleNewStaffModal(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary">Crear Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

window.toggleNewStaffModal = (val) => {
  showNewStaffModal = val;
  store.notify();
};

window.submitNewStaff = (e) => {
  e.preventDefault();
  const nombre = document.getElementById('staff-nombre').value;
  const email = document.getElementById('staff-email').value;
  const password = document.getElementById('staff-pass').value;
  const rol = document.getElementById('staff-rol').value;
  const telefono = document.getElementById('staff-telefono').value;

  store.addEmpleado({ nombre, email, password, rol, telefono });
  showNewStaffModal = false;
  window.showToast(`Cuenta creada para "${nombre}" (${rol})`, 'success');
};
