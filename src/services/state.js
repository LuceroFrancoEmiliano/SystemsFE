/**
 * ============================================================================
 * GESTOR DE ESTADO REACTIVO GLOBAL (Systems State Store)
 * ============================================================================
 */

export const ADMIN_USER = {
  id_usuario: 1,
  email: 'franco.admin@systems.com',
  nombre: 'Franco (SuperAdmin)',
  avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FrancoAdmin',
  rol_global: 'ADMIN',
  telefono: '+54 9 11 0000-0000',
  creado_en: new Date().toISOString()
};

class Store {
  constructor() {
    const savedUser = localStorage.getItem('systems_current_user');
    this.currentUser = savedUser ? JSON.parse(savedUser) : null;
    this.isAuthenticated = Boolean(this.currentUser);
    
    // Inicia en catálogo (inicio) por defecto
    this.currentView = 'catalog'; // 'catalog' | 'tienda' | 'manuales' | 'contacto' | 'perfil' | 'library' | 'admin' | 'simulator' | 'checkout' | 'login'
    this.isProfileMenuOpen = false;
    
    // Cargar del storage
    const storedSystems = localStorage.getItem('systems_catalog_v2');
    const storedLicenses = localStorage.getItem('systems_licenses_v2');

    this.sistemas = storedSystems ? JSON.parse(storedSystems) : [];
    this.licencias = storedLicenses ? JSON.parse(storedLicenses) : [];
    
    this.activeSimulatorSession = null;
    this.selectedCheckoutSystemId = null;
    this.checkoutStep = 1;
    this.checkoutData = {
      nombreEmpresa: '',
      slugEmpresa: '',
      metodoPago: 'MERCADO_PAGO'
    };
    this.contactEmail = 'franco.soporte@systems.com';
    this.listeners = [];

    // Notificar vista inicial al backend y cargar catálogo desde Neon
    this.notifyServerView('catalog');
    this.fetchSistemasFromBackend();
  }

  async fetchSistemasFromBackend() {
    try {
      const res = await fetch('http://localhost:3000/api/sistemas');
      const data = await res.json();
      if (data.ok && Array.isArray(data.sistemas)) {
        this.sistemas = data.sistemas;
        this.save();
        this.notify();
      }
    } catch (e) {}
  }

  save() {
    if (this.currentUser && this.isAuthenticated) {
      localStorage.setItem('systems_current_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('systems_current_user');
    }
    localStorage.setItem('systems_catalog_v2', JSON.stringify(this.sistemas));
    localStorage.setItem('systems_licenses_v2', JSON.stringify(this.licencias));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.save();
    this.listeners.forEach(fn => fn(this));
  }

  notifyServerView(view) {
    fetch(`http://localhost:3000/api/views/${view}`).catch(() => {});
  }

  async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Validar contra el backend Node.js en vivo (conectado a Neon DB)
    try {
      const res = await fetch('http://localhost:3000/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      const data = await res.json();
      if (data.ok && data.usuario) {
        this.currentUser = {
          ...data.usuario,
          telefono: '+54 9 11 0000-0000'
        };
        this.isAuthenticated = true;
        this.currentView = this.currentUser.rol_global === 'ADMIN' ? 'admin' : 'catalog';
        this.notifyServerView('admin-login');
        this.notify();
        return { ok: true, usuario: this.currentUser };
      } else {
        throw new Error(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      // 2. Fallback de contingencia local si el backend no está corriendo en el puerto 3000
      if (cleanEmail === 'franco.admin@systems.com' && password === 'FrancoAdmin2026!') {
        this.currentUser = ADMIN_USER;
        this.isAuthenticated = true;
        this.currentView = 'admin';
        this.notifyServerView('admin-login');
        this.notify();
        return { ok: true, usuario: this.currentUser };
      }
      throw new Error(err.message || 'Email o contraseña incorrectos');
    }
  }

  async register({ nombre, email, password, telefono }) {
    const cleanEmail = (email || '').toLowerCase().trim();

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: cleanEmail,
          password,
          telefono: telefono ? telefono.trim() : ''
        })
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'No se pudo crear la cuenta');
      }

      this.currentUser = {
        ...data.usuario,
        telefono: telefono || ''
      };
      this.isAuthenticated = true;
      this.currentView = 'catalog';
      this.notifyServerView('catalog');
      this.save();
      this.notify();
      return { ok: true, usuario: this.currentUser };
    } catch (err) {
      throw new Error(err.message || 'Error al conectar con el servidor para registrar');
    }
  }

  logout() {
    fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.currentUser?.email })
    }).catch(() => {});

    this.currentUser = null;
    this.isAuthenticated = false;
    this.isProfileMenuOpen = false;
    this.currentView = 'catalog';
    this.notifyServerView('catalog');
    this.save();
    this.notify();
  }

  startCheckout(sistemaId) {
    if (!this.isAuthenticated) {
      this.currentView = 'login';
      this.notifyServerView('login');
      this.notify();
      window.showToast('Inicia sesión para poder adquirir este sistema', 'info');
      return;
    }

    this.selectedCheckoutSystemId = Number(sistemaId);
    this.checkoutStep = 1;
    this.checkoutData = {
      nombreEmpresa: '',
      slugEmpresa: '',
      metodoPago: 'MERCADO_PAGO'
    };
    this.currentView = 'checkout';
    this.isProfileMenuOpen = false;
    this.notifyServerView('checkout');
    this.notify();
  }

  setCheckoutStep(step) {
    this.checkoutStep = step;
    this.notifyServerView(`checkout-paso-${step}`);
    this.notify();
  }

  updateCheckoutData(data) {
    this.checkoutData = { ...this.checkoutData, ...data };
    this.notify();
  }

  setCurrentView(view) {
    // Si intenta entrar a perfil, library o admin sin sesión, mandar al login
    if ((view === 'perfil' || view === 'library' || view === 'admin') && !this.isAuthenticated) {
      this.currentView = 'login';
      this.isProfileMenuOpen = false;
      this.notifyServerView('login');
      this.notify();
      window.showToast('Debes iniciar sesión para acceder a esta sección', 'info');
      return;
    }

    this.currentView = view;
    this.isProfileMenuOpen = false;
    this.notifyServerView(view);
    this.notify();
  }

  toggleProfileMenu(force) {
    this.isProfileMenuOpen = force !== undefined ? force : !this.isProfileMenuOpen;
    this.notify();
  }

  addSystem(systemData) {
    const newSystem = {
      id_sistema: Date.now(),
      codigo: systemData.codigo,
      titulo: systemData.titulo,
      descripcion: systemData.descripcion,
      descripcion_corta: systemData.descripcion_corta,
      precio: parseFloat(systemData.precio),
      moneda: 'USD',
      url_base: systemData.url_base,
      api_secret: 'sec_live_' + Math.random().toString(36).substring(2, 12),
      icono: systemData.icono || 'box',
      banner_url: systemData.banner_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
      caracteristicas: systemData.caracteristicas || ['Acceso Web Completo', 'Soporte Directo'],
      manual_resumen: 'Manual de operaciones y configuración del sistema.',
      activo: true
    };

    // Notificar al backend
    fetch('http://localhost:3000/api/admin/sistemas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admin_id: this.currentUser?.id_usuario || 1,
        ...newSystem
      })
    }).catch(() => {});

    this.sistemas.unshift(newSystem);
    this.notify();
    return newSystem;
  }

  buySystem({ sistemaId, nombreEmpresa, slugEmpresa, metodoPago }) {
    if (!this.isAuthenticated || !this.currentUser) {
      throw new Error('Debes estar autenticado para comprar');
    }

    const system = this.sistemas.find(s => s.id_sistema === Number(sistemaId));
    if (!system) throw new Error('Sistema no encontrado');

    const newLicencia = {
      id_licencia: Date.now(),
      id_usuario: this.currentUser.id_usuario,
      id_sistema: system.id_sistema,
      nombre_empresa: nombreEmpresa,
      slug_empresa: slugEmpresa,
      rol_en_sistema: 'ADMIN_PROPIETARIO',
      estado: 'ACTIVA',
      fecha_compra: new Date().toISOString(),
      ultimo_acceso: new Date().toISOString(),
      en_uso: true
    };

    // Notificar al backend
    fetch('http://localhost:3000/api/ventas/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: this.currentUser.id_usuario,
        id_sistema: system.id_sistema,
        nombre_empresa: nombreEmpresa,
        slug_empresa: slugEmpresa,
        metodo_pago: metodoPago,
        monto: system.precio
      })
    }).catch(() => {});

    this.licencias.unshift(newLicencia);
    this.notify();
    return newLicencia;
  }

  generateSSOTicket(licenciaId) {
    const lic = this.licencias.find(l => l.id_licencia === Number(licenciaId));
    if (!lic) throw new Error('Licencia no encontrada');
    const sys = this.sistemas.find(s => s.id_sistema === lic.id_sistema);

    lic.ultimo_acceso = new Date().toISOString();
    lic.en_uso = true;

    const ticket = 'tk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Notificar al backend
    fetch('http://localhost:3000/api/sso/generate-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: this.currentUser?.id_usuario || 1,
        id_licencia: lic.id_licencia
      })
    }).catch(() => {});

    this.notify();
    
    const baseUrl = (sys?.url_base || 'http://localhost:5174').replace(/\/$/, '');

    return {
      ticket,
      licencia: lic,
      sistema: sys,
      redirect_url: `${baseUrl}/?ticket=${ticket}`
    };
  }

  getBuyersList() {
    return this.licencias.map(l => {
      const user = this.currentUser || {
        nombre: 'Cliente',
        email: 'cliente@empresa.com',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client'
      };
      const sys = this.sistemas.find(s => s.id_sistema === l.id_sistema) || {
        titulo: 'Sistema'
      };

      return {
        id_licencia: l.id_licencia,
        cliente_nombre: user.nombre,
        cliente_email: user.email,
        cliente_avatar: user.avatar_url,
        sistema_titulo: sys.titulo,
        nombre_empresa: l.nombre_empresa,
        slug_empresa: l.slug_empresa,
        fecha_compra: l.fecha_compra,
        ultimo_acceso: l.ultimo_acceso,
        en_uso: l.en_uso
      };
    });
  }
}

export const store = new Store();
