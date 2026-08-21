import { store } from '../services/state.js';

export function renderProfileView() {
  const user = store.currentUser;
  if (!user) {
    return `
      <div class="container animate-fade-in" style="max-width: 600px; margin: 3rem auto; text-align: center;">
        <div style="background: #fff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 3rem 2rem; box-shadow: var(--shadow-md);">
          <i data-lucide="lock" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">Inicia sesión para ver tu perfil</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Accede a tu cuenta central para ver tus accesos y licencias.</p>
          <button class="btn btn-primary" onclick="window.navigate('login')">
            <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
            Iniciar Sesión
          </button>
        </div>
      </div>
    `;
  }
  const isAdmin = user.rol_global === 'ADMIN';
  const misLicencias = store.licencias.filter(l => l.id_usuario === user.id_usuario);
  const fechaRegistro = user.creado_en ? new Date(user.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '10 de enero de 2026';

  return `
    <div class="container animate-fade-in" style="max-width: 920px; margin: 0 auto 4rem;">
      <div class="section-header">
        <div>
          <span class="badge ${isAdmin ? 'badge-admin' : 'badge-primary'}" style="margin-bottom: 0.5rem;">
            <i data-lucide="user" style="width: 12px; height: 12px;"></i>
            Cuenta Central
          </span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Mi Perfil de Usuario</h2>
          <p style="font-size: 0.92rem;">Información de tu identidad centralizada, accesos y empresas administradas.</p>
        </div>
      </div>

      <!-- Tarjeta Principal del Perfil -->
      <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-md); margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; padding-bottom: 1.75rem; border-bottom: 1px solid #f1f5f9;">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <img src="${user.avatar_url}" alt="${user.nombre}" style="width: 72px; height: 72px; border-radius: 50%; border: 3px solid ${isAdmin ? '#f43f5e' : 'var(--primary)'}; box-shadow: var(--shadow-sm);" />
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">${user.nombre}</h3>
                <span class="badge ${isAdmin ? 'badge-admin' : 'badge-primary'}" style="font-size: 0.72rem;">
                  ${isAdmin ? '👑 SuperAdmin (Franco)' : '💼 Administrador de Empresa'}
                </span>
              </div>
              <span style="font-size: 0.88rem; color: var(--text-muted); display: block;">${user.email}</span>
              <span style="font-size: 0.78rem; color: var(--text-dim);">Miembro desde: ${fechaRegistro}</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.navigate('library')">
              <i data-lucide="folder-check" style="width: 14px; height: 14px;"></i>
              Ver Mis Sistemas (${misLicencias.length})
            </button>
            ${isAdmin ? `
              <button class="btn btn-primary btn-sm" onclick="window.navigate('admin')">
                <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i>
                Panel SuperAdmin
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Detalles de Cuenta & Contacto -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; padding-top: 1.5rem;">
          <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.25rem;">Tipo de Autenticación</span>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="lock" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i>
              <strong style="color: var(--text-main); font-size: 0.9rem;">SSO Centralizado Google</strong>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.25rem;">Teléfono / WhatsApp</span>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="phone" style="width: 14px; height: 14px; color: var(--primary);"></i>
              <strong style="color: var(--text-main); font-size: 0.9rem;">${user.telefono || '+54 9 11 0000-0000'}</strong>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.25rem;">Sistemas Adquiridos</span>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="package" style="width: 14px; height: 14px; color: var(--accent-cyan);"></i>
              <strong style="color: var(--text-main); font-size: 0.9rem;">${misLicencias.length} Licencias Activas</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Empresas del Usuario -->
      <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-md);">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
          Tus Empresas e Instancias Vinculadas
        </h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Al ingresar a cualquiera de estos sistemas, tu rol será automáticamente <strong>Administrador</strong> con capacidad de agregar empleados.
        </p>

        ${misLicencias.length === 0 ? `
          <p style="font-size: 0.88rem; color: var(--text-dim); padding: 1rem; background: #f8fafc; border-radius: var(--radius-sm);">
            No posees sistemas adquiridos con esta cuenta. Puedes explorar la <a href="#" onclick="window.navigate('tienda')">Tienda de Sistemas</a>.
          </p>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${misLicencias.map(l => {
              const sys = store.sistemas.find(s => s.id_sistema === l.id_sistema) || {};
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <strong style="color: var(--text-main); font-size: 0.95rem;">${l.nombre_empresa}</strong>
                      <span class="badge badge-success" style="font-size: 0.65rem;">Activa</span>
                    </div>
                    <span style="font-size: 0.78rem; color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 600;">
                      ${sys.titulo || 'Sistema'} • ${l.slug_empresa}.misistema.com
                    </span>
                  </div>
                  <button class="btn btn-sso btn-sm" onclick="window.launchSSO(${l.id_licencia})">
                    <i data-lucide="external-link" style="width: 13px; height: 13px;"></i>
                    Acceder
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}
