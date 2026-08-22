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

  // Protección de rutas por Rol:
  // Si un chofer intenta acceder a una vista de admin, forzar a 'chofer-movil'
  let activeView = view;
  if (isChofer && (view === 'dashboard' || view === 'clientes' || view === 'stock' || view === 'empleados')) {
    activeView = 'chofer-movil';
  }

  // Si un administrador entra a 'chofer-movil', redirigir a 'dashboard'
  if (isAdmin && view === 'chofer-movil') {
    activeView = 'dashboard';
  }

  app.innerHTML = `
    <div id="toast-root"></div>
    <div class="app-layout">
      ${renderSidebar()}

      <div class="main-content">
        <header class="topbar">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge ${isAdmin ? 'badge-blue' : 'badge-amber'}">
              <i data-lucide="${isAdmin ? 'shield-check' : 'truck'}" style="width: 13px; height: 13px; display: inline;"></i>
              ${isAdmin ? 'Panel de Administración' : 'Panel Chofer en Ruta'}
            </span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">
              ${store.empresa.nombre_empresa}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 1rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.showToast('Conectado a Neon DB en Sao Paulo', 'success')">
              <i data-lucide="cloud" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i>
              Cloud Activo
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

window.navigateSod = (view) => {
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
