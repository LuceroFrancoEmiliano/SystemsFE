import { store } from '../services/state.js';

export function renderSidebar() {
  const view = store.currentView;
  const empresa = store.empresa;

  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--primary); display: flex; align-items: center; justify-content: center; color: #fff;">
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
      </div>

      <nav class="sidebar-nav">
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

        <button class="sidebar-btn ${view === 'chofer-movil' ? 'active' : ''}" onclick="window.navigateSod('chofer-movil')" style="background: ${view === 'chofer-movil' ? 'var(--primary)' : '#f0fdf4'}; color: ${view === 'chofer-movil' ? '#fff' : '#15803d'}; font-weight: 700;">
          <i data-lucide="smartphone" style="width: 18px; height: 18px; color: ${view === 'chofer-movil' ? '#fff' : '#16a34a'};"></i>
          Modo Chofer (Móvil)
        </button>

        <button class="sidebar-btn ${view === 'stock' ? 'active' : ''}" onclick="window.navigateSod('stock')">
          <i data-lucide="boxes" style="width: 18px; height: 18px;"></i>
          Stock & Planta
        </button>

        <button class="sidebar-btn ${view === 'empleados' ? 'active' : ''}" onclick="window.navigateSod('empleados')">
          <i data-lucide="user-check" style="width: 18px; height: 18px;"></i>
          Mis Choferes & Planta
        </button>
      </nav>

      <div style="padding: 1rem 1.25rem; border-top: 1px solid var(--border-subtle); background: #f8fafc;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0f2fe; color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
            ${store.usuario.nombre.charAt(0)}
          </div>
          <div style="min-width: 0; flex: 1;">
            <strong style="display: block; font-size: 0.82rem; color: var(--text-main);">${store.usuario.nombre}</strong>
            <span style="font-size: 0.68rem; color: var(--accent-emerald); font-weight: 700;">${store.usuario.rol}</span>
          </div>
        </div>
      </div>
    </aside>
  `;
}
