import './styles/main.css';
import { store } from './services/state.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderDashboardView } from './components/DashboardView.js';
import { renderClientsView } from './components/ClientsView.js';
import { renderDeliveryView } from './components/DeliveryView.js';
import { renderStockView } from './components/StockView.js';
import { renderStaffView } from './components/StaffView.js';
import { renderDriverMobileView } from './components/DriverMobileView.js';
import { renderLoginView } from './components/LoginView.js';
import { offlineService } from './services/offlineSync.js';
import './components/Toast.js';

let isMobileSidebarOpen = false;

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const view = store.currentView;
  const user = store.usuario;
  const isAdmin = user?.rol === 'ADMIN_PROPIETARIO';
  const isChofer = user?.rol === 'CHOFER';

  // Si la vista es login, renderizar pantalla de login completa sin sidebar
  if (view === 'login') {
    app.innerHTML = `
      <div id="toast-root"></div>
      ${renderLoginView()}
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Protección de rutas por Rol
  let activeView = view;
  if (isChofer && (view === 'dashboard' || view === 'clientes' || view === 'stock' || view === 'empleados')) {
    activeView = 'chofer-movil';
  }

  if (isAdmin && view === 'chofer-movil') {
    activeView = 'dashboard';
  }

  app.innerHTML = `
    <div id="toast-root"></div>
    <div class="sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}" onclick="window.toggleMobileSidebar(false)"></div>
    <div class="app-layout">
      ${renderSidebar(isMobileSidebarOpen)}

      <div class="main-content">
        <header class="topbar">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="mobile-menu-btn" onclick="window.toggleMobileSidebar(true)" aria-label="Abrir Menú">
              <i data-lucide="menu" style="width: 20px; height: 20px;"></i>
            </button>

            <span class="badge ${isAdmin ? 'badge-blue' : 'badge-amber'}">
              <i data-lucide="${isAdmin ? 'shield-check' : 'truck'}" style="width: 13px; height: 13px; display: inline;"></i>
              ${isAdmin ? 'Administración' : 'Chofer en Ruta'}
            </span>
            
            <span style="font-size: 0.85rem; color: var(--text-muted); display: none; @media(min-width: 640px){ display: inline; }">
              ${store.empresa.nombre_empresa}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.showToast('Conectado a Neon DB en São Paulo', 'success')">
              <i data-lucide="cloud" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i>
              <span style="display: none; @media(min-width: 640px){ display: inline; }">Cloud Activo</span>
            </button>
          </div>
        </header>

        <main class="content-body">
          ${activeView === 'dashboard' ? renderDashboardView() : ''}
          ${activeView === 'clientes' ? renderClientsView() : ''}
          ${activeView === 'reparto' ? renderDeliveryView() : ''}
          ${activeView === 'chofer-movil' ? renderDriverMobileView() : ''}
          ${activeView === 'stock' ? renderStockView() : ''}
          ${activeView === 'empleados' ? renderStaffView() : ''}
        </main>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

window.toggleMobileSidebar = (force) => {
  isMobileSidebarOpen = force !== undefined ? force : !isMobileSidebarOpen;
  renderApp();
};

window.navigateSod = (view) => {
  isMobileSidebarOpen = false;
  store.setCurrentView(view);
};

window.logoutSod = () => {
  store.logout();
  window.showToast('Sesión cerrada correctamente', 'info');
};

window.switchRole = (role) => {
  store.switchUserRole(role);
  window.showToast(`Cambiado a rol: ${role === 'ADMIN_PROPIETARIO' ? '👑 Administrador' : '🚚 Chofer'}`, 'info');
};

window.store = store;

store.subscribe(() => {
  renderApp();
});

offlineService.subscribe(() => {
  renderApp();
});

renderApp();
