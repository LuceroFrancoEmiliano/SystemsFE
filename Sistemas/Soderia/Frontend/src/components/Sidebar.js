import { store } from '../services/state.js';

export function renderSidebar(isMobileOpen = false) {
  const view = store.currentView;
  const empresa = store.empresa;
  const user = store.usuario;
  const isAdmin = user?.rol === 'ADMIN_PROPIETARIO';
  const isChofer = user?.rol === 'CHOFER';

  return `
    <aside class="sidebar ${isMobileOpen ? 'open' : ''}">
      <div class="sidebar-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--primary); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;">
            <i data-lucide="droplet" style="width: 20px; height: 20px;"></i>
          </div>
          <div style="min-width: 0;">
            <strong style="display: block; font-size: 0.95rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${empresa.nombre_empresa}
            </strong>
            <span style="font-size: 0.7rem; color: var(--text-dim); font-family: var(--font-mono); display: block;">
              ${empresa.slug_empresa}.misistema.com
            </span>
          </div>
        </div>

        <button class="mobile-menu-btn" onclick="window.toggleMobileSidebar(false)" style="border: none; padding: 0.2rem;">
          <i data-lucide="x" style="width: 20px; height: 20px;"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        
        ${isAdmin ? `
          <!-- MENÚ DE ADMINISTRADOR PROPIETARIO (Solo lo ve el Dueño) -->
          <button class="sidebar-btn ${view === 'dashboard' ? 'active' : ''}" onclick="window.navigateSod('dashboard')">
            <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
            Dashboard General
          </button>

          <button class="sidebar-btn ${view === 'clientes' ? 'active' : ''}" onclick="window.navigateSod('clientes')">
            <i data-lucide="users" style="width: 18px; height: 18px;"></i>
            Clientes & Envases
          </button>

          <button class="sidebar-btn ${view === 'reparto' ? 'active' : ''}" onclick="window.navigateSod('reparto')">
            <i data-lucide="truck" style="width: 18px; height: 18px;"></i>
            Reparto del Día
          </button>

          <button class="sidebar-btn ${view === 'stock' ? 'active' : ''}" onclick="window.navigateSod('stock')">
            <i data-lucide="boxes" style="width: 18px; height: 18px;"></i>
            Stock & Planta
          </button>

          <button class="sidebar-btn ${view === 'empleados' ? 'active' : ''}" onclick="window.navigateSod('empleados')">
            <i data-lucide="user-check" style="width: 18px; height: 18px;"></i>
            Mis Choferes & Planta
          </button>
        ` : ''}

        ${isChofer ? `
          <!-- MENÚ EXCLUSIVO DEL CHOFER (Solo ve su panel móvil) -->
          <button class="sidebar-btn ${view === 'chofer-movil' ? 'active' : ''}" onclick="window.navigateSod('chofer-movil')" style="background: var(--primary); color: #fff; font-weight: 700;">
            <i data-lucide="smartphone" style="width: 18px; height: 18px; color: #fff;"></i>
            Mi Reparto del Día (Móvil)
          </button>
        ` : ''}

      </nav>

      <!-- Selector de Rol (Para pruebas rápidas de cambio entre Dueño y Chofer) -->
      <div style="padding: 0.75rem 1rem; border-top: 1px solid var(--border-subtle); background: #f0f9ff; margin: 0.5rem 0.75rem; border-radius: var(--radius-sm);">
        <span style="font-size: 0.68rem; text-transform: uppercase; font-weight: 800; color: var(--primary); display: block; margin-bottom: 0.4rem;">
          Simular Sesión:
        </span>
        <div style="display: flex; gap: 0.35rem;">
          <button 
            type="button" 
            class="btn ${isAdmin ? 'btn-primary' : 'btn-secondary'} btn-sm" 
            style="font-size: 0.72rem; padding: 0.35rem 0.5rem; flex: 1;" 
            onclick="window.switchRole('ADMIN_PROPIETARIO')"
          >
            👑 Dueño
          </button>
          <button 
            type="button" 
            class="btn ${isChofer ? 'btn-primary' : 'btn-secondary'} btn-sm" 
            style="font-size: 0.72rem; padding: 0.35rem 0.5rem; flex: 1;" 
            onclick="window.switchRole('CHOFER')"
          >
            🚚 Chofer
          </button>
        </div>
      </div>

      <!-- Footer con Usuario y Botón de Cerrar Sesión -->
      <div style="padding: 0.9rem 1.25rem; border-top: 1px solid var(--border-subtle); background: #f8fafc;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0f2fe; color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;">
              ${user ? user.nombre.charAt(0) : 'U'}
            </div>
            <div style="min-width: 0; flex: 1;">
              <strong style="display: block; font-size: 0.8rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${user ? user.nombre : 'Usuario'}
              </strong>
              <span style="font-size: 0.65rem; color: ${isAdmin ? 'var(--accent-rose)' : 'var(--accent-emerald)'}; font-weight: 700;">
                ${isAdmin ? 'ADMIN DUEÑO' : 'CHOFER REPARTIDOR'}
              </span>
            </div>
          </div>
        </div>

        <button 
          type="button"
          class="btn btn-secondary btn-sm" 
          style="width: 100%; font-size: 0.78rem; padding: 0.4rem; justify-content: center; color: var(--accent-rose); border-color: #fecdd3;" 
          onclick="window.logoutSod()"
        >
          <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  `;
}
