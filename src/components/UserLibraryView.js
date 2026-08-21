import { store } from '../services/state.js';

export function renderUserLibraryView() {
  const user = store.currentUser;
  if (!user) {
    return `
      <div class="container animate-fade-in" style="max-width: 600px; margin: 3rem auto; text-align: center;">
        <div style="background: #fff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 3rem 2rem; box-shadow: var(--shadow-md);">
          <i data-lucide="lock" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">Inicia sesión para ver tus sistemas</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Accede a tu cuenta para administrar las licencias de tus empresas.</p>
          <button class="btn btn-primary" onclick="window.navigate('login')">
            <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
            Iniciar Sesión
          </button>
        </div>
      </div>
    `;
  }
  const misLicencias = store.licencias.filter(l => l.id_usuario === user.id_usuario);

  return `
    <div class="container animate-fade-in">
      <div class="section-header">
        <div>
          <span class="badge badge-primary" style="margin-bottom: 0.5rem;">Panel del Propietario</span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Mis Sistemas Comprados</h2>
          <p style="font-size: 0.92rem;">Aquí tienes acceso directo a todos los sistemas web que has adquirido para tus empresas.</p>
        </div>
      </div>

      ${misLicencias.length === 0 ? `
        <div style="background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 4rem 2rem; text-align: center;">
          <i data-lucide="package-open" style="width: 48px; height: 48px; color: var(--text-dim); margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Aún no has adquirido ningún sistema</h3>
          <p style="margin-bottom: 1.5rem; font-size: 0.9rem;">Explora nuestro catálogo y activa el software para tu negocio en minutos.</p>
          <button class="btn btn-primary" onclick="window.navigate('catalog')">
            <i data-lucide="layout-grid"></i>
            Ir al Catálogo
          </button>
        </div>
      ` : `
        <div class="systems-grid">
          ${misLicencias.map(lic => {
            const sys = store.sistemas.find(s => s.id_sistema === lic.id_sistema) || {};
            const fecha = new Date(lic.fecha_compra).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

            return `
              <div class="system-card" style="border-color: var(--border-subtle);">
                <div style="padding: 1.5rem; background: linear-gradient(135deg, #eff6ff 0%, #f0fdfa 100%); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: #ffffff; border: 1px solid #bfdbfe; display: flex; align-items: center; justify-content: center; color: var(--primary); box-shadow: var(--shadow-sm);">
                      <i data-lucide="${sys.icono || 'box'}" style="width: 22px; height: 22px;"></i>
                    </div>
                    <div>
                      <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${sys.titulo || 'Sistema'}</h4>
                      <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">Licencia Activa</span>
                    </div>
                  </div>
                  <span class="status-chip active">
                    <span class="status-dot"></span>
                    Activa
                  </span>
                </div>

                <div class="system-card-body">
                  <div style="background: #f8fafc; padding: 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
                    <div style="margin-bottom: 0.4rem;">
                      <span style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; display: block;">Empresa Asignada:</span>
                      <strong style="color: var(--text-main); font-size: 1rem;">${lic.nombre_empresa}</strong>
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-cyan); font-weight: 600;">
                      ${lic.slug_empresa}.misistema.com
                    </div>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between;">
                      <span>Tu Rol:</span>
                      <strong style="color: var(--text-main);">👑 Administrador Propietario</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span>Fecha de Adquisición:</span>
                      <span>${fecha}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span>Cuentas de Empleados:</span>
                      <span style="color: var(--accent-emerald); font-weight: 600;">Ilimitadas</span>
                    </div>
                  </div>

                  <div class="system-card-footer">
                    <button class="btn btn-sso" style="width: 100%;" onclick="window.launchSSO(${lic.id_licencia})">
                      <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
                      Acceder a mi Sistema (SSO)
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}
