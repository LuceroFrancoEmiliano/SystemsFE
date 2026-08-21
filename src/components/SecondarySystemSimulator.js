import { store } from '../services/state.js';

let employeesList = [
  { id: 1, nombre: 'Carlos Chofer', email: 'carlos@soderiasanmartin.com', rol: 'Repartidor / Chofer', activo: true },
  { id: 2, nombre: 'Ana Ventas', email: 'ana@soderiasanmartin.com', rol: 'Cajera / Mostrador', activo: true }
];

export function renderSecondarySystemSimulator() {
  const session = store.activeSimulatorSession;

  if (!session) {
    // Si no hay una sesión lanzada, tomar la primera licencia existente
    const defaultLic = store.licencias[0];
    if (defaultLic) {
      const ticketData = store.generateSSOTicket(defaultLic.id_licencia);
      store.activeSimulatorSession = {
        sistema: ticketData.sistema,
        licencia: defaultLic,
        usuario: store.currentUser,
        ticket: ticketData.ticket
      };
    }
  }

  const currentSession = store.activeSimulatorSession;

  if (!currentSession) {
    return `
      <div class="container animate-fade-in" style="padding: 4rem 1rem; text-align: center;">
        <p>No hay sesiones de prueba activas. Adquiere un sistema en el catálogo o selecciona uno en 'Mis Sistemas'.</p>
      </div>
    `;
  }

  const { sistema, licencia, usuario, ticket } = currentSession;

  return `
    <div class="container animate-fade-in" style="margin-bottom: 4rem;">
      <div class="section-header">
        <div>
          <span class="badge badge-cyan" style="margin-bottom: 0.5rem;">
            <i data-lucide="terminal" style="width: 12px; height: 12px;"></i>
            Simulador de Sistema Secundario Independiente
          </span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Demostración en Vivo del Handshake SSO</h2>
          <p style="font-size: 0.92rem;">Observa cómo el sistema secundario recibe al usuario desde el Sistema Main y le entrega el control total de su empresa.</p>
        </div>
      </div>

      <!-- Ventana Simulada de Navegador (Tema Blanco Limpio) -->
      <div class="simulator-window animate-scale-up">
        <!-- Barra Superior de Navegador -->
        <div class="simulator-browser-bar">
          <div class="browser-dots">
            <span class="browser-dot" style="background: #ef4444;"></span>
            <span class="browser-dot" style="background: #f59e0b;"></span>
            <span class="browser-dot" style="background: #10b981;"></span>
          </div>
          <div class="browser-url-input">
            🔒 https://${licencia.slug_empresa}.misistema.com/app/dashboard (Ticket SSO: ${ticket ? ticket.substring(0, 14) + '...' : 'Sesión Activa'})
          </div>
          <span class="badge badge-success" style="font-size: 0.7rem;">
            <i data-lucide="link" style="width: 10px; height: 10px;"></i>
            SSO Validado
          </span>
        </div>

        <!-- Contenido del Sistema Secundario -->
        <div style="padding: 2rem; background: #ffffff; color: var(--text-main);">
          
          <!-- Encabezado del Sistema Secundario -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--primary); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; box-shadow: var(--shadow-sm);">
                <i data-lucide="${sistema.icono || 'package'}"></i>
              </div>
              <div>
                <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">${licencia.nombre_empresa}</h3>
                <span style="font-size: 0.82rem; color: var(--accent-cyan); font-weight: 600;">Software Activo: ${sistema.titulo} • Instancia ID: #${licencia.id_licencia}</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0.45rem 0.95rem; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
              <img src="${usuario.avatar_url}" style="width: 34px; height: 34px; border-radius: 50%; border: 1px solid #bfdbfe;" />
              <div style="text-align: left; line-height: 1.2;">
                <strong style="font-size: 0.84rem; color: var(--text-main); display: block;">${usuario.nombre}</strong>
                <span style="font-size: 0.72rem; color: var(--accent-emerald); font-weight: 700;">👑 Administrador de la Empresa</span>
              </div>
            </div>
          </div>

          <!-- Payload SSO Recibido en Background -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 1rem 1.25rem; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); font-weight: 700;">
                <i data-lucide="code" style="width: 12px; height: 12px; display: inline;"></i>
                Payload JSON recibido desde el Sistema Central (Verificado por Backend Secundario):
              </span>
              <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-emerald); font-weight: 700;">HTTP 200 OK</span>
            </div>
            <pre style="font-family: var(--font-mono); font-size: 0.8rem; color: #0369a1; overflow-x: auto; margin: 0; background: #ffffff; padding: 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0;">${JSON.stringify({
              valido: true,
              usuario_central: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email
              },
              empresa_tenant: {
                id_licencia: licencia.id_licencia,
                nombre_empresa: licencia.nombre_empresa,
                slug: licencia.slug_empresa,
                rol: "ADMIN_PROPIETARIO"
              }
            }, null, 2)}</pre>
          </div>

          <!-- Módulo de Gestión de Empleados del Dueño de la Empresa -->
          <div style="background: #ffffff; border-radius: var(--radius-md); padding: 1.5rem; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
              <div>
                <h4 style="font-size: 1.1rem; color: var(--text-main); font-weight: 700;">Usuarios / Empleados de "${licencia.nombre_empresa}"</h4>
                <p style="font-size: 0.84rem; color: var(--text-muted);">Como comprador y dueño de este sistema, puedes crear y dar de baja a tus empleados sin tocar el sistema central.</p>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.addMockEmployee()">
                <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i>
                + Agregar Empleado
              </button>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.78rem; color: var(--text-dim); background: #f8fafc;">
                  <th style="padding: 0.75rem 0.85rem;">Empleado</th>
                  <th style="padding: 0.75rem 0.85rem;">Email Interno</th>
                  <th style="padding: 0.75rem 0.85rem;">Rol en la Empresa</th>
                  <th style="padding: 0.75rem 0.85rem;">Estado</th>
                  <th style="padding: 0.75rem 0.85rem; text-align: right;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${employeesList.map(emp => `
                  <tr style="border-bottom: 1px solid #f1f5f9; font-size: 0.88rem;">
                    <td style="padding: 0.85rem; font-weight: 600; color: var(--text-main);">${emp.nombre}</td>
                    <td style="padding: 0.85rem; font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted);">${emp.email}</td>
                    <td style="padding: 0.85rem;"><span class="badge badge-primary">${emp.rol}</span></td>
                    <td style="padding: 0.85rem;"><span class="status-chip active"><span class="status-dot"></span> Activo</span></td>
                    <td style="padding: 0.85rem; text-align: right;">
                      <button style="background: transparent; border: none; color: #e11d48; cursor: pointer; font-size: 0.8rem; font-weight: 600;" onclick="window.removeMockEmployee(${emp.id})">Eliminar</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  `;
}

window.addMockEmployee = () => {
  const name = prompt('Nombre del nuevo empleado:');
  if (!name) return;
  const role = prompt('Rol del empleado (ej. Chofer, Cajero, Encargado):', 'Operador');
  employeesList.push({
    id: Date.now(),
    nombre: name,
    email: `${name.toLowerCase().replace(/\s+/g, '')}@empresa.com`,
    rol: role || 'Operador',
    activo: true
  });
  store.notify();
};

window.removeMockEmployee = (id) => {
  employeesList = employeesList.filter(e => e.id !== id);
  store.notify();
};
