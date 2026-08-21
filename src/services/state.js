/**
 * ============================================================================
 * GESTOR DE ESTADO REACTIVO GLOBAL (Systems State Store) - 100% LIMPIO
 * ============================================================================
 */

// Cuentas base
export const INITIAL_USERS = [
  {
    id_usuario: 1,
    email: 'franco.admin@systems.com',
    nombre: 'Franco (SuperAdmin)',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FrancoAdmin',
    rol_global: 'ADMIN',
    telefono: '+54 9 11 0000-0000',
    creado_en: new Date().toISOString()
  },
  {
    id_usuario: 2,
    email: 'cliente@empresa.com',
    nombre: 'Cliente Comprador',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ClienteDemo',
    rol_global: 'USER',
    telefono: '+54 9 11 1234-5678',
    creado_en: new Date().toISOString()
  }
];

export const INITIAL_SYSTEMS = [];
export const INITIAL_LICENSES = [];

class Store {
  constructor() {
    this.currentUser = INITIAL_USERS[0]; // Inicia por defecto como Franco (SuperAdmin)
    this.currentView = 'catalog'; // 'catalog' | 'tienda' | 'manuales' | 'contacto' | 'perfil' | 'library' | 'admin' | 'simulator' | 'checkout'
    this.isProfileMenuOpen = false;
    
    // Cargar del storage o array limpio
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
  }

  save() {
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

  startCheckout(sistemaId) {
    this.selectedCheckoutSystemId = Number(sistemaId);
    this.checkoutStep = 1;
    this.checkoutData = {
      nombreEmpresa: '',
      slugEmpresa: '',
      metodoPago: 'MERCADO_PAGO'
    };
    this.currentView = 'checkout';
    this.isProfileMenuOpen = false;
    this.notify();
  }

  setCheckoutStep(step) {
    this.checkoutStep = step;
    this.notify();
  }

  updateCheckoutData(data) {
    this.checkoutData = { ...this.checkoutData, ...data };
    this.notify();
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.isProfileMenuOpen = false;
    if (user.rol_global === 'ADMIN' && this.currentView === 'library') {
      this.currentView = 'admin';
    } else if (user.rol_global === 'USER' && this.currentView === 'admin') {
      this.currentView = 'catalog';
    }
    this.notify();
  }

  setCurrentView(view) {
    this.currentView = view;
    this.isProfileMenuOpen = false;
    this.notify();
  }

  toggleProfileMenu(force) {
    this.isProfileMenuOpen = force !== undefined ? force : !this.isProfileMenuOpen;
    this.notify();
  }

  logout() {
    this.currentUser = INITIAL_USERS[1];
    this.isProfileMenuOpen = false;
    this.currentView = 'catalog';
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
    this.sistemas.unshift(newSystem);
    this.notify();
    return newSystem;
  }

  buySystem({ sistemaId, nombreEmpresa, slugEmpresa, metodoPago }) {
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
    this.notify();

    const ticket = 'tk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    return {
      ticket,
      licencia: lic,
      sistema: sys,
      redirect_url: `${sys.url_base}/sso/callback?ticket=${ticket}`
    };
  }

  getBuyersList() {
    return this.licencias.map(l => {
      const user = INITIAL_USERS.find(u => u.id_usuario === l.id_usuario) || {
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
