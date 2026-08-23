import { store } from '../services/state.js';

let authMode = 'login'; // 'login' | 'register'
let showPassword = false;

export function renderLoginView() {
  return `
    <div class="container animate-fade-in" style="max-width: 480px; margin: 2rem auto 4rem; padding-top: 1rem;">
      <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2.5rem 2rem; box-shadow: var(--shadow-lg);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 52px; height: 52px; border-radius: var(--radius-md); background: var(--grad-primary); display: flex; align-items: center; justify-content: center; color: #fff; margin: 0 auto 1rem; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);">
            <i data-lucide="${authMode === 'login' ? 'lock' : 'user-plus'}" style="width: 24px; height: 24px;"></i>
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
            ${authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Nueva'}
          </h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            ${authMode === 'login' 
              ? 'Accede a tu cuenta centralizada para administrar tus sistemas y licencias.' 
              : 'Regístrate gratis para comprar y acceder a tus sistemas cloud.'}
          </p>
        </div>

        <!-- Selector de Pestañas: Login vs Registro -->
        <div style="display: flex; background: #f1f5f9; padding: 0.3rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
          <button 
            type="button" 
            class="btn btn-sm ${authMode === 'login' ? 'btn-primary' : 'btn-ghost'}" 
            style="flex: 1; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 700;"
            onclick="window.switchAuthMode('login')"
          >
            Iniciar Sesión
          </button>
          <button 
            type="button" 
            class="btn btn-sm ${authMode === 'register' ? 'btn-primary' : 'btn-ghost'}" 
            style="flex: 1; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 700;"
            onclick="window.switchAuthMode('register')"
          >
            Crear Cuenta
          </button>
        </div>

        ${authMode === 'login' ? `
          <!-- FORMULARIO DE INICIO DE SESIÓN -->
          <form onsubmit="window.handleLoginForm(event)">
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" for="login-email">Correo Electrónico:</label>
              <input 
                type="email" 
                id="login-email" 
                class="form-input" 
                placeholder="ejemplo@correo.com" 
                required 
                autofocus
              />
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label class="form-label" for="login-password">Contraseña:</label>
              <div style="position: relative; display: flex; align-items: center;">
                <input 
                  type="${showPassword ? 'text' : 'password'}" 
                  id="login-password" 
                  class="form-input" 
                  placeholder="••••••••••••" 
                  required 
                  style="padding-right: 2.5rem;"
                />
                <button 
                  type="button" 
                  onclick="window.togglePasswordVisibility()" 
                  style="position: absolute; right: 0.75rem; background: transparent; border: none; color: var(--text-dim); cursor: pointer; display: flex; align-items: center;"
                  title="${showPassword ? 'Ocultar' : 'Mostrar'}"
                >
                  <i data-lucide="${showPassword ? 'eye-off' : 'eye'}" style="width: 16px; height: 16px;"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.8rem; font-size: 0.95rem; margin-bottom: 1.25rem;" id="btn-login-submit">
              <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
              Entrar a mi Cuenta
            </button>

            <!-- Acceso con Google -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
              <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
              <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">o también</span>
              <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
            </div>

            <button type="button" class="btn btn-secondary" style="width: 100%; padding: 0.75rem; font-size: 0.88rem; margin-bottom: 1.5rem;" onclick="window.handleGoogleLogin()">
              <svg style="width: 16px; height: 16px; margin-right: 6px;" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continuar con Google SSO
            </button>

            <!-- Hint de Credenciales SuperAdmin -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 0.85rem; font-size: 0.78rem; color: #1e3a8a; text-align: left;">
              <strong style="display: block; margin-bottom: 0.2rem;">Credenciales SuperAdmin pre-cargadas:</strong>
              <span>Email: <code>franco.admin@systems.com</code></span><br/>
              <span>Contraseña: <code>FrancoAdmin2026!</code></span>
            </div>
          </form>
        ` : `
          <!-- FORMULARIO DE REGISTRO (CREAR CUENTA) -->
          <form onsubmit="window.handleRegisterForm(event)">
            <div class="form-group" style="margin-bottom: 1.1rem;">
              <label class="form-label" for="reg-nombre">Nombre Completo:</label>
              <input 
                type="text" 
                id="reg-nombre" 
                class="form-input" 
                placeholder="Ej: Franco Lucero" 
                required 
                autofocus
              />
            </div>

            <div class="form-group" style="margin-bottom: 1.1rem;">
              <label class="form-label" for="reg-email">Correo Electrónico:</label>
              <input 
                type="email" 
                id="reg-email" 
                class="form-input" 
                placeholder="tu@correo.com" 
                required 
              />
            </div>

            <div class="form-group" style="margin-bottom: 1.1rem;">
              <label class="form-label" for="reg-telefono">Teléfono / WhatsApp (opcional):</label>
              <input 
                type="tel" 
                id="reg-telefono" 
                class="form-input" 
                placeholder="+54 9 11 1234-5678" 
              />
            </div>

            <div class="form-group" style="margin-bottom: 1.35rem;">
              <label class="form-label" for="reg-password">Crear Contraseña:</label>
              <input 
                type="password" 
                id="reg-password" 
                class="form-input" 
                placeholder="Mínimo 6 caracteres" 
                required 
                minlength="6"
              />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.8rem; font-size: 0.95rem;" id="btn-reg-submit">
              <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
              Crear mi Cuenta Gratis
            </button>
          </form>
        `}

      </div>
    </div>
  `;
}

window.switchAuthMode = (mode) => {
  authMode = mode;
  store.notify();
};

window.togglePasswordVisibility = () => {
  showPassword = !showPassword;
  store.notify();
};

window.handleLoginForm = async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('btn-login-submit');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Validando credenciales...';
  }

  try {
    const res = await store.login(email, pass);
    window.showToast(`👋 ¡Bienvenido de vuelta, ${res.usuario.nombre}!`, 'success');
  } catch (err) {
    window.showToast(`Error: ${err.message}`, 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="log-in" style="width: 16px; height: 16px;"></i> Entrar a mi Cuenta';
    }
  }
};

window.handleRegisterForm = async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const telefono = document.getElementById('reg-telefono')?.value || '';
  const password = document.getElementById('reg-password').value;
  const submitBtn = document.getElementById('btn-reg-submit');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creando cuenta...';
  }

  try {
    const res = await store.register({ nombre, email, password, telefono });
    window.showToast(`🎉 ¡Cuenta creada con éxito! Bienvenido, ${res.usuario.nombre}`, 'success');
  } catch (err) {
    window.showToast(`Error: ${err.message}`, 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Crear mi Cuenta Gratis';
    }
  }
};

window.handleGoogleLogin = () => {
  store.login('franco.admin@systems.com', 'FrancoAdmin2026!').then(res => {
    window.showToast(`✅ Autenticado con Google como ${res.usuario.nombre}`, 'success');
  });
};
