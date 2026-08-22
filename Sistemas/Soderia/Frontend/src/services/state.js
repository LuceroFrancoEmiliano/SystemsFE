/**
 * ============================================================================
 * STORE DE ESTADO REACTIVO - SODERÍA CLOUD PRO
 * Manejo de Roles: ADMIN_PROPIETARIO vs CHOFER y Autenticación
 * ============================================================================
 */

const API_BASE = 'http://localhost:3001/api';

class SoderiaStore {
  constructor() {
    const savedSession = localStorage.getItem('soderia_session_v3');
    const parsed = savedSession ? JSON.parse(savedSession) : null;

    this.empresa = parsed?.empresa || {
      id_empresa: 1,
      slug_empresa: 'mi-soderia',
      nombre_empresa: 'Mi Sodería'
    };

    // Por defecto el administrador propietario
    this.usuario = parsed?.usuario || {
      id_usuario: 1,
      nombre: 'Administrador Propietario',
      email: 'admin@soderia.com',
      rol: 'ADMIN_PROPIETARIO'
    };

    this.isAuthenticated = Boolean(parsed);
    this.currentView = this.isAuthenticated 
      ? (this.usuario.rol === 'CHOFER' ? 'chofer-movil' : 'dashboard')
      : 'dashboard'; // Inicia en dashboard o login según sesión
    
    // Padrón limpio
    this.clientes = JSON.parse(localStorage.getItem('soderia_clientes_v3') || '[]');
    this.empleados = JSON.parse(localStorage.getItem('soderia_empleados_v3') || '[]');
    
    this.metricas = {
      total_clientes: 0,
      sifones_en_calle: 0,
      bidones_en_calle: 0,
      total_deuda_por_cobrar: 0,
      recaudacion_hoy: 0,
      stock_planta: [
        { tipo_envase: 'SIFON_SODA', llenos: 0, vacios: 0 },
        { tipo_envase: 'BIDON_20L', llenos: 0, vacios: 0 },
        { tipo_envase: 'BIDON_12L', llenos: 0, vacios: 0 }
      ]
    };

    this.repartoActivo = null;
    this.listeners = [];

    // Chequear si viene un Ticket SSO en la URL
    this.checkSSOTicket();
  }

  async checkSSOTicket() {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');
    if (ticket) {
      try {
        const res = await fetch(`${API_BASE}/sso/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket })
        });
        const data = await res.json();
        if (data.valido) {
          this.empresa = data.empresa;
          this.usuario = {
            ...data.usuario,
            rol: 'ADMIN_PROPIETARIO' // El que compra en el Hub siempre es ADMIN
          };
          this.isAuthenticated = true;
          this.currentView = 'dashboard';
          this.save();
          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.pathname);
          this.notify();
          window.showToast?.(`👋 ¡Bienvenido ${this.usuario.nombre} (Administrador de ${this.empresa.nombre_empresa})!`, 'success');
        }
      } catch (err) {
        console.error('Error SSO:', err);
      }
    }
  }

  save() {
    if (this.isAuthenticated && this.usuario) {
      localStorage.setItem('soderia_session_v3', JSON.stringify({
        empresa: this.empresa,
        usuario: this.usuario
      }));
    } else {
      localStorage.removeItem('soderia_session_v3');
    }
    localStorage.setItem('soderia_clientes_v3', JSON.stringify(this.clientes));
    localStorage.setItem('soderia_empleados_v3', JSON.stringify(this.empleados));
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

  setCurrentView(view) {
    this.currentView = view;
    this.notify();
  }

  async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Verificar si es el Administrador Propietario
    if (cleanEmail === 'admin@soderia.com' || cleanEmail === 'franco.admin@systems.com') {
      this.usuario = {
        id_usuario: 1,
        nombre: 'Administrador Propietario',
        email: cleanEmail,
        rol: 'ADMIN_PROPIETARIO'
      };
      this.isAuthenticated = true;
      this.currentView = 'dashboard';
      this.notify();
      return { ok: true, usuario: this.usuario };
    }

    // 2. Verificar en la lista de Choferes / Empleados creados
    const emp = this.empleados.find(e => e.email.toLowerCase() === cleanEmail);
    if (emp) {
      if (emp.password && emp.password !== password) {
        throw new Error('Contraseña incorrecta');
      }
      this.usuario = {
        id_usuario: emp.id_usuario,
        nombre: emp.nombre,
        email: emp.email,
        rol: emp.rol || 'CHOFER'
      };
      this.isAuthenticated = true;
      this.currentView = emp.rol === 'CHOFER' ? 'chofer-movil' : 'dashboard';
      this.notify();
      return { ok: true, usuario: this.usuario };
    }

    // 3. Consultar al backend en vivo
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: this.empresa.slug_empresa,
          email: cleanEmail,
          password
        })
      });
      const data = await res.json();
      if (data.ok && data.usuario) {
        this.usuario = data.usuario;
        this.isAuthenticated = true;
        this.currentView = this.usuario.rol === 'CHOFER' ? 'chofer-movil' : 'dashboard';
        this.notify();
        return { ok: true, usuario: this.usuario };
      }
    } catch (e) {}

    throw new Error('Credenciales inválidas para esta sodería');
  }

  logout() {
    this.usuario = null;
    this.isAuthenticated = false;
    this.currentView = 'login';
    this.save();
    this.notify();
  }

  switchUserRole(role) {
    if (role === 'ADMIN_PROPIETARIO') {
      this.usuario = {
        id_usuario: 1,
        nombre: 'Administrador Propietario',
        email: 'admin@soderia.com',
        rol: 'ADMIN_PROPIETARIO'
      };
      this.isAuthenticated = true;
      this.currentView = 'dashboard';
    } else {
      // Chofer
      const firstChofer = this.empleados.find(e => e.rol === 'CHOFER') || {
        id_usuario: 2,
        nombre: 'Carlos Chofer',
        email: 'carlos@soderia.com',
        rol: 'CHOFER'
      };
      this.usuario = firstChofer;
      this.isAuthenticated = true;
      this.currentView = 'chofer-movil';
    }
    this.notify();
  }

  async addCliente(clienteData) {
    const newCli = {
      id_cliente: Date.now(),
      nombre: clienteData.nombre,
      telefono: clienteData.telefono || '',
      direccion: clienteData.direccion,
      nombre_zona: clienteData.nombre_zona || 'Zona Centro',
      sifones_prestados: Number(clienteData.sifones_inicial || 0),
      bidones_prestados: Number(clienteData.bidones_inicial || 0),
      saldo_deudor: 0
    };

    try {
      await fetch(`${API_BASE}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_empresa: this.empresa.id_empresa,
          ...clienteData
        })
      });
    } catch (e) {}

    this.clientes.unshift(newCli);
    this.notify();
    return newCli;
  }

  async addEmpleado(empData) {
    const newEmp = {
      id_usuario: Date.now(),
      nombre: empData.nombre,
      email: empData.email,
      password: empData.password,
      rol: empData.rol || 'CHOFER',
      telefono: empData.telefono || '',
      activo: true
    };

    try {
      await fetch(`${API_BASE}/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_empresa: this.empresa.id_empresa,
          ...empData
        })
      });
    } catch (e) {}

    this.empleados.unshift(newEmp);
    this.notify();
    return newEmp;
  }

  iniciarReparto({ chofer, zona, sifones_salida, bidones_salida }) {
    this.repartoActivo = {
      id_reparto: Date.now(),
      chofer: chofer || this.usuario.nombre,
      zona: zona || 'Zona Centro',
      sifones_salida: Number(sifones_salida || 0),
      bidones_salida: Number(bidones_salida || 0),
      entregas: [],
      total_efectivo: 0,
      total_transferencia: 0,
      total_fiado: 0
    };
    this.notify();
  }

  registrarEntregaReparto({ id_cliente, sifones_entregados, sifones_devueltos, bidones_entregados, bidones_devueltos, cobrado, metodo }) {
    if (!this.repartoActivo) return;

    const cli = this.clientes.find(c => c.id_cliente === Number(id_cliente));
    if (cli) {
      cli.sifones_prestados += (Number(sifones_entregados) - Number(sifones_devueltos));
      cli.bidones_prestados += (Number(bidones_entregados) - Number(bidones_devueltos));
    }

    const entrega = {
      id_entrega: Date.now(),
      cliente_nombre: cli ? cli.nombre : 'Cliente',
      sifones_entregados: Number(sifones_entregados),
      sifones_devueltos: Number(sifones_devueltos),
      bidones_entregados: Number(bidones_entregados),
      bidones_devueltos: Number(bidones_devueltos),
      cobrado: Number(cobrado),
      metodo: metodo || 'EFECTIVO'
    };

    if (metodo === 'EFECTIVO') this.repartoActivo.total_efectivo += Number(cobrado);
    if (metodo === 'TRANSFERENCIA') this.repartoActivo.total_transferencia += Number(cobrado);

    this.repartoActivo.entregas.push(entrega);
    this.notify();
  }

  cerrarReparto() {
    this.repartoActivo = null;
    this.notify();
  }
}

export const store = new SoderiaStore();
