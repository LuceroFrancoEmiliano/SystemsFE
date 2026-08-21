import { store } from '../services/state.js';

export function renderNavbar() {
  const user = store.currentUser;
  const view = store.currentView;
  const isAdmin = user.rol_global === 'ADMIN';
  const isMenuOpen = store.isProfileMenuOpen;
  const misLicenciasCount = store.licencias.filter(l => l.id_usuario === user.id_usuario).length;

  return `
    <nav class="navbar">
      <div class="container navbar-container">
        <!-- Brand -->
        <div class="navbar-brand" onclick="window.navigate('catalog')">
          <div class="brand-icon-box">
            <i data-lucide="layers"></i>
          </div>
          <div>
            <span>SYSTEMS<span class="text-gradient">.HUB</span></span>
          </div>
        </div>

        <!-- Navigation Links Principales -->
        <ul class="nav-links">
          <li>
            <button class="nav-link-btn ${view === 'catalog' ? 'active' : ''}" onclick="window.navigate('catalog')">
              <i data-lucide="layout-grid" style="width: 16px; height: 16px;"></i>
              Catálogo
            </button>
          </li>
          <li>
            <button class="nav-link-btn ${view === 'tienda' ? 'active' : ''}" onclick="window.navigate('tienda')">
              <i data-lucide="shopping-bag" style="width: 16px; height: 16px; color: var(--primary);"></i>
              Tienda
            </button>
          </li>
          <li>
            <button class="nav-link-btn ${view === 'manuales' ? 'active' : ''}" onclick="window.navigate('manuales')">
              <i data-lucide="book-open" style="width: 16px; height: 16px;"></i>
              Manuales
            </button>
          </li>
          <li>
            <button class="nav-link-btn ${view === 'contacto' ? 'active' : ''}" onclick="window.navigate('contacto')">
              <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
              Contacto
            </button>
          </li>
          <li>
            <button class="nav-link-btn ${view === 'admin' ? 'active' : ''}" onclick="window.navigate('admin')">
              <i data-lucide="shield-check" style="width: 16px; height: 16px; color: #e11d48;"></i>
              Panel SuperAdmin
            </button>
          </li>
        </ul>

        <!-- User Profile Circle & Dropdown Menu -->
        <div class="profile-dropdown-wrapper" style="position: relative;">
          <button class="profile-avatar-trigger" onclick="window.toggleProfileDropdown(event)" style="background: transparent; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; padding: 0.3rem 0.5rem; border-radius: var(--radius-full); transition: background var(--transition-fast);">
            <div style="position: relative;">
              <img src="${user.avatar_url}" alt="${user.nombre}" class="user-avatar" style="width: 38px; height: 38px; border: 2px solid ${isAdmin ? 'var(--accent-rose)' : 'var(--primary)'}; box-shadow: var(--shadow-sm);" />
              <span style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 2px solid #fff;"></span>
            </div>
            <div style="text-align: left; line-height: 1.15;" class="hidden-mobile">
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); display: block;">${user.nombre}</span>
              <span style="font-size: 0.7rem; color: #e11d48; font-weight: 600;">
                👑 SuperAdmin
              </span>
            </div>
            <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: var(--text-dim);"></i>
          </button>

          <!-- Menú Desplegable del Perfil -->
          ${isMenuOpen ? `
            <div class="profile-dropdown-menu animate-scale-up" style="position: absolute; right: 0; top: calc(100% + 8px); width: 250px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 150; padding: 0.6rem 0; overflow: hidden;">
              
              <!-- Info del Usuario -->
              <div style="padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; background: #f8fafc; margin-bottom: 0.4rem;">
                <strong style="display: block; font-size: 0.88rem; color: var(--text-main);">${user.nombre}</strong>
                <span style="font-size: 0.75rem; color: var(--text-dim); display: block; word-break: break-all;">${user.email}</span>
                <span class="badge badge-admin" style="font-size: 0.68rem; margin-top: 0.4rem; padding: 0.15rem 0.5rem;">
                  Administrador General
                </span>
              </div>

              <!-- Opciones del Menú -->
              <button class="dropdown-item-btn" onclick="window.navigate('perfil')">
                <i data-lucide="user" style="width: 16px; height: 16px; color: var(--primary);"></i>
                <span>Mi Perfil</span>
              </button>

              <button class="dropdown-item-btn" onclick="window.navigate('admin')">
                <i data-lucide="shield-check" style="width: 16px; height: 16px; color: #e11d48;"></i>
                <span>Panel SuperAdmin</span>
              </button>

              <button class="dropdown-item-btn" onclick="window.navigate('library')">
                <i data-lucide="folder-check" style="width: 16px; height: 16px; color: var(--accent-cyan);"></i>
                <span>Mis Sistemas</span>
                <span class="badge badge-primary" style="margin-left: auto; font-size: 0.65rem; padding: 0.1rem 0.45rem;">${misLicenciasCount}</span>
              </button>

              <div style="border-top: 1px solid #f1f5f9; margin: 0.4rem 0;"></div>

              <!-- Cerrar Sesión -->
              <button class="dropdown-item-btn" style="color: #e11d48;" onclick="window.logoutUser()">
                <i data-lucide="log-out" style="width: 16px; height: 16px; color: #e11d48;"></i>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    </nav>
  `;
}

window.toggleProfileDropdown = (e) => {
  e.stopPropagation();
  store.toggleProfileMenu();
};

window.logoutUser = () => {
  store.logout();
  window.showToast('Sesión cerrada correctamente', 'info');
};

// Cerrar dropdown al hacer click afuera
document.addEventListener('click', (e) => {
  if (store.isProfileMenuOpen && !e.target.closest('.profile-dropdown-wrapper')) {
    store.toggleProfileMenu(false);
  }
});
