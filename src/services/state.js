/**
 * ============================================================================
 * GESTOR DE ESTADO REACTIVO GLOBAL (Systems State Store)
 * ============================================================================
 */

// Usuarios precargados para alternar en la demo
export const INITIAL_USERS = [
  {
    id_usuario: 1,
    email: 'franco.admin@systems.com',
    nombre: 'Franco (SuperAdmin)',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FrancoAdmin',
    rol_global: 'ADMIN',
    telefono: '+54 9 11 0000-0000',
    creado_en: '2026-01-10T12:00:00.000Z'
  },
  {
    id_usuario: 2,
    email: 'martin.cliente@soderia.com',
    nombre: 'Martín Sodería',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Martin',
    rol_global: 'USER',
    telefono: '+54 9 11 1234-5678',
    creado_en: '2026-02-15T14:30:00.000Z'
  },
  {
    id_usuario: 3,
    email: 'laura.gym@fitness.com',
    nombre: 'Laura Crossfit',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LauraGym',
    rol_global: 'USER',
    telefono: '+54 9 11 9876-5432',
    creado_en: '2026-03-01T09:15:00.000Z'
  }
];

export const INITIAL_SYSTEMS = [
  {
    id_sistema: 1,
    codigo: 'soderia_cloud',
    titulo: 'Sodería Cloud Pro',
    descripcion: 'Sistema integral para fábricas y repartos de agua en bidones, control de comodatos, clientes y cobranzas en calle con app móvil.',
    descripcion_corta: 'Gestión total de reparto de bidones, clientes y comodatos.',
    precio: 29.99,
    moneda: 'USD',
    url_base: 'http://localhost:4001',
    api_secret: 'sec_live_soderia_98a72f1b4c',
    icono: 'droplet',
    banner_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=60',
    caracteristicas: [
      'Control de envases retornables y comodatos',
      'Rutas de reparto y cobranza móvil',
      'Facturación y cuentas corrientes por cliente',
      'Múltiples choferes y zonas asignadas'
    ],
    manual_resumen: 'Aprende a configurar zonas de reparto, dar de alta clientes, controlar comodatos y realizar cobranzas en calle desde la app móvil.',
    activo: true
  },
  {
    id_sistema: 2,
    codigo: 'gym_master',
    titulo: 'GymMaster Suite',
    descripcion: 'Plataforma integral para gimnasios, box de entrenamiento y centros deportivos con control de accesos molinetes/QR y cobro de cuotas.',
    descripcion_corta: 'Gestión integral de socios, membresías, accesos QR y rutinas.',
    precio: 39.99,
    moneda: 'USD',
    url_base: 'http://localhost:4002',
    api_secret: 'sec_live_gym_84c910fa7e',
    icono: 'activity',
    banner_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60',
    caracteristicas: [
      'Control de acceso QR y reconocimiento',
      'Cobro automático de cuotas y vencimientos',
      'App para socios con rutinas y reservas',
      'Estadísticas de ocupación en vivo'
    ],
    manual_resumen: 'Guía paso a paso para enrolar nuevos socios, generar códigos QR de acceso, cobrar planes y armar rutinas personalizadas.',
    activo: true
  },
  {
    id_sistema: 3,
    codigo: 'stock_facturacion',
    titulo: 'OmniPoint Facturación & Stock',
    descripcion: 'Punto de venta POS ultra veloz y facturación electrónica para comercios minoristas y mayoristas con inventario multi-depósito.',
    descripcion_corta: 'Punto de venta rápido, stock multi-depósito y facturación.',
    precio: 49.99,
    moneda: 'USD',
    url_base: 'http://localhost:4003',
    api_secret: 'sec_live_stock_73d82bc19a',
    icono: 'shopping-cart',
    banner_url: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=60',
    caracteristicas: [
      'Punto de venta POS ultra ágil con atajos',
      'Control de stock e inventario con alertas',
      'Integración con lectores de código de barras',
      'Reportes de caja diarios y arqueos'
    ],
    manual_resumen: 'Configuración inicial del lector de barras, apertura y cierre de caja, alta de artículos, control de stock y emisión de tickets.',
    activo: true
  }
];

export const INITIAL_LICENSES = [
  {
    id_licencia: 1,
    id_usuario: 2, // Martín Sodería
    id_sistema: 1,
    nombre_empresa: 'Sodería San Martín',
    slug_empresa: 'soderia-san-martin',
    rol_en_sistema: 'ADMIN_PROPIETARIO',
    estado: 'ACTIVA',
    fecha_compra: new Date(Date.now() - 2 * 86400000).toISOString(),
    ultimo_acceso: new Date(Date.now() - 3600000).toISOString(),
    en_uso: true,
  },
  {
    id_licencia: 2,
    id_usuario: 3, // Laura Gym
    id_sistema: 2,
    nombre_empresa: 'Titan Fitness Club',
    slug_empresa: 'titan-fitness',
    rol_en_sistema: 'ADMIN_PROPIETARIO',
    estado: 'ACTIVA',
    fecha_compra: new Date(Date.now() - 5 * 86400000).toISOString(),
    ultimo_acceso: new Date(Date.now() - 86400000 * 2).toISOString(),
    en_uso: true,
  }
];

class Store {
  constructor() {
    this.currentUser = INITIAL_USERS[1]; // Inicia por defecto como Cliente Martín
    this.currentView = 'catalog'; // 'catalog' | 'tienda' | 'manuales' | 'contacto' | 'perfil' | 'library' | 'admin' | 'simulator' | 'checkout'
    this.isProfileMenuOpen = false;
    this.sistemas = JSON.parse(localStorage.getItem('systems_catalog')) || INITIAL_SYSTEMS;
    this.licencias = JSON.parse(localStorage.getItem('systems_licenses')) || INITIAL_LICENSES;
    this.activeSimulatorSession = null;
    this.selectedCheckoutSystemId = null;
    this.checkoutStep = 1; // 1: Datos & Empresa, 2: Método de Pago & Precio, 3: Confirmación Final
    this.checkoutData = {
      nombreEmpresa: '',
      slugEmpresa: '',
      metodoPago: 'MERCADO_PAGO'
    };
    this.contactEmail = 'franco.soporte@systems.com';
    this.listeners = [];
  }

  save() {
    localStorage.setItem('systems_catalog', JSON.stringify(this.sistemas));
    localStorage.setItem('systems_licenses', JSON.stringify(this.licencias));
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
    // Si cierra sesión, cambiamos a un estado de invitado o usuario demo
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

    // Actualizar último acceso
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
