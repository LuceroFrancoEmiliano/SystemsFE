import './styles/main.css';
import { store } from './services/state.js';
import { renderNavbar } from './components/Navbar.js';
import { renderHeroSection } from './components/HeroSection.js';
import { renderCatalogView } from './components/CatalogView.js';
import { renderStoreView } from './components/StoreView.js';
import { renderManualsView } from './components/ManualsView.js';
import { renderContactView } from './components/ContactView.js';
import { renderProfileView } from './components/ProfileView.js';
import { renderUserLibraryView } from './components/UserLibraryView.js';
import { renderAdminCompradoresView } from './components/AdminCompradoresView.js';
import { renderSecondarySystemSimulator } from './components/SecondarySystemSimulator.js';
import { renderCheckoutView } from './components/CheckoutView.js';
import { renderLoginView } from './components/LoginView.js';
import './components/Toast.js';

// Enrutador y renderizador reactivo
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const view = store.currentView;

  app.innerHTML = `
    <div id="modal-root"></div>
    <div id="toast-root" class="toast-container"></div>
    
    ${renderNavbar()}

    <main style="padding-bottom: 4rem;">
      ${view === 'catalog' ? `
        ${renderHeroSection()}
        ${renderCatalogView()}
      ` : ''}

      ${view === 'login' ? `
        ${renderLoginView()}
      ` : ''}

      ${view === 'checkout' ? `
        ${renderCheckoutView()}
      ` : ''}

      ${view === 'tienda' ? `
        <div style="padding-top: 2rem;">
          ${renderStoreView()}
        </div>
      ` : ''}

      ${view === 'manuales' ? `
        <div style="padding-top: 2rem;">
          ${renderManualsView()}
        </div>
      ` : ''}

      ${view === 'contacto' ? `
        <div style="padding-top: 2rem;">
          ${renderContactView()}
        </div>
      ` : ''}

      ${view === 'perfil' ? `
        <div style="padding-top: 2rem;">
          ${renderProfileView()}
        </div>
      ` : ''}

      ${view === 'library' ? `
        <div style="padding-top: 2rem;">
          ${renderUserLibraryView()}
        </div>
      ` : ''}

      ${view === 'admin' ? `
        <div style="padding-top: 2rem;">
          ${renderAdminCompradoresView()}
        </div>
      ` : ''}

      ${view === 'simulator' ? `
        <div style="padding-top: 2rem;">
          ${renderSecondarySystemSimulator()}
        </div>
      ` : ''}
    </main>

    <footer style="border-top: 1px solid var(--border-subtle); padding: 2.5rem 0; text-align: center; color: var(--text-dim); font-size: 0.85rem; background: #ffffff;">
      <div class="container">
        <div style="display: flex; justify-content: center; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <a href="#" onclick="window.navigate('catalog')">Catálogo</a>
          <a href="#" onclick="window.navigate('tienda')">Tienda & Precios</a>
          <a href="#" onclick="window.navigate('manuales')">Manuales</a>
          <a href="#" onclick="window.navigate('contacto')">Contacto</a>
          <a href="#" onclick="window.navigate('perfil')">Mi Perfil</a>
        </div>
        <p><strong>SYSTEMS.HUB</strong> — Ecosistema Multi-Tenant con Cuentas Centralizadas (SSO) y Base de Datos PL/pgSQL.</p>
      </div>
    </footer>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Global Handlers
window.store = store;

window.navigate = (viewName) => {
  store.setCurrentView(viewName);
};

window.startCheckout = (sistemaId) => {
  store.startCheckout(sistemaId);
};

window.launchSSO = (licenciaId) => {
  try {
    const ssoData = store.generateSSOTicket(licenciaId);
    store.activeSimulatorSession = {
      sistema: ssoData.sistema,
      licencia: ssoData.licencia,
      usuario: store.currentUser,
      ticket: ssoData.ticket
    };
    window.showToast(`⚡ Generando Ticket SSO seguro (${ssoData.ticket.substring(0, 10)}...)... Redirigiendo a ${ssoData.licencia.nombre_empresa}`, 'success');
    setTimeout(() => {
      window.navigate('simulator');
    }, 600);
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

// Suscribir al store para re-renderizar cuando cambie el estado
store.subscribe(() => {
  renderApp();
});

// Inicializar la aplicación
renderApp();
