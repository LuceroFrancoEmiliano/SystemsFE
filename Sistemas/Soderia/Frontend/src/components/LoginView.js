import { store } from '../services/state.js';

export function renderLoginView() {
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 1.5rem;">
      <div class="card animate-scale-up" style="max-width: 440px; width: 100%; padding: 2.5rem 2rem; box-shadow: var(--shadow-lg);">
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 52px; height: 52px; border-radius: 14px; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
            <i data-lucide="droplet" style="width: 28px; height: 28px;"></i>
          </div>
          <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
            ${store.empresa.nombre_empresa}
          </h1>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            Ingreso al sistema para Administrador o Choferes
          </p>
        </div>

        <form onsubmit="window.handleSoderiaLogin(event)">
          <div class="form-group">
            <label class="form-label">Correo Electrónico:</label>
            <input 
              type="email" 
              id="sod-login-email" 
              class="form-input" 
              placeholder="admin@soderia.com o chofer@soderia.com" 
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña:</label>
            <input 
              type="password" 
              id="sod-login-pass" 
              class="form-input" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.8rem; font-size: 0.95rem; margin-top: 0.5rem;">
            Iniciar Sesión
          </button>
        </form>

        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-subtle); text-align: center;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.75rem;">
            Acceso Rápido de Prueba:
          </span>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <button 
              type="button" 
              class="btn btn-secondary btn-sm" 
              style="font-size: 0.78rem;" 
              onclick="window.quickLogin('admin@soderia.com', 'admin')"
            >
              👑 Dueño / Admin
            </button>
            <button 
              type="button" 
              class="btn btn-secondary btn-sm" 
              style="font-size: 0.78rem;" 
              onclick="window.quickLogin('carlos@soderia.com', 'chofer')"
            >
              🚚 Chofer Móvil
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

window.handleSoderiaLogin = async (e) => {
  e.preventDefault();
  const email = document.getElementById('sod-login-email').value;
  const pass = document.getElementById('sod-login-pass').value;

  try {
    const res = await store.login(email, pass);
    window.showToast(`Bienvenido ${res.usuario.nombre} (${res.usuario.rol})`, 'success');
  } catch (err) {
    window.showToast(err.message || 'Error al iniciar sesión', 'error');
  }
};

window.quickLogin = (email, role) => {
  if (role === 'admin') {
    store.switchUserRole('ADMIN_PROPIETARIO');
    window.showToast('Sesión iniciada como Administrador Propietario (Dueño)', 'success');
  } else {
    store.switchUserRole('CHOFER');
    window.showToast('Sesión iniciada como Chofer Repartidor (Modo Móvil)', 'success');
  }
};
