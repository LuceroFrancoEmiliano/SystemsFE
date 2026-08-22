import { store } from '../services/state.js';

export function renderStaffView() {
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

        <button class="btn btn-primary" onclick="window.showToast('Formulario para nuevo chofer', 'info')">
          <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
          + Crear Cuenta de Chofer
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
                <td><span class="badge badge-blue">ADMIN_PROPIETARIO</span></td>
                <td>+54 11 0000-0000</td>
                <td><span class="badge badge-green">Activo</span></td>
              </tr>
              <tr>
                <td><strong>Carlos Repartidor</strong></td>
                <td>carlos.chofer@soderia.com</td>
                <td><span class="badge badge-amber">CHOFER</span></td>
                <td>+54 11 8888-9999</td>
                <td><span class="badge badge-green">Activo</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
