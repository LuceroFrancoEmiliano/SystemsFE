import './styles/main.css';
import { store } from './services/state.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderDashboardView } from './components/DashboardView.js';
import { renderClientsView } from './components/ClientsView.js';
import { renderDeliveryView } from './components/DeliveryView.js';
import { renderStockView } from './components/StockView.js';
import { renderStaffView } from './components/StaffView.js';
import { renderDriverMobileView } from './components/DriverMobileView.js';
import { offlineService } from './services/offlineSync.js';
import './components/Toast.js';

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const view = store.currentView;

  app.innerHTML = `
    <div id="toast-root"></div>
    <div class="app-layout">
      ${renderSidebar()}

      <div class="main-content">
        <header class="topbar">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge badge-blue">
              <i data-lucide="shield-check" style="width: 13px; height: 13px; display: inline;"></i>
              Instancia Dedicada
            </span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">
              ${store.empresa.nombre_empresa}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 1rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.showToast('Sincronizado con Neon DB', 'success')">
              <i data-lucide="cloud" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i>
              Cloud Conectado
            </button>
          </div>
        </header>

        <main class="content-body">
          ${view === 'dashboard' ? renderDashboardView() : ''}
          ${view === 'clientes' ? renderClientsView() : ''}
          ${view === 'reparto' ? renderDeliveryView() : ''}
          ${view === 'chofer-movil' ? renderDriverMobileView() : ''}
          ${view === 'stock' ? renderStockView() : ''}
          ${view === 'empleados' ? renderStaffView() : ''}
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

store.subscribe(() => {
  renderApp();
});

offlineService.subscribe(() => {
  renderApp();
});

renderApp();
