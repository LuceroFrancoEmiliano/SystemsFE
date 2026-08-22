/**
 * ============================================================================
 * STORE DE ESTADO REACTIVO - SODERÍA CLOUD PRO (100% LIMPIO)
 * ============================================================================
 */

const API_BASE = 'http://localhost:3001/api';

class SoderiaStore {
  constructor() {
    const savedSession = localStorage.getItem('soderia_session_v2');
    const parsed = savedSession ? JSON.parse(savedSession) : null;

    this.empresa = parsed?.empresa || {
      id_empresa: 1,
      slug_empresa: 'mi-soderia',
      nombre_empresa: 'Mi Sodería'
    };

    this.usuario = parsed?.usuario || {
      id_usuario: 1,
      nombre: 'Administrador Propietario',
      email: 'admin@soderia.com',
      rol: 'ADMIN_PROPIETARIO'
    };

    this.currentView = 'dashboard'; // 'dashboard' | 'clientes' | 'reparto' | 'chofer-movil' | 'stock' | 'empleados'
    
    // Datos 100% limpios
    this.clientes = JSON.parse(localStorage.getItem('soderia_clientes_v2') || '[]');
    this.empleados = JSON.parse(localStorage.getItem('soderia_empleados_v2') || '[]');
    
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
          this.usuario = data.usuario;
          this.save();
          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.pathname);
          this.notify();
          window.showToast?.(`👋 ¡Bienvenido ${this.usuario.nombre} a ${this.empresa.nombre_empresa}!`, 'success');
        }
      } catch (err) {
        console.error('Error SSO:', err);
      }
    }
  }

  save() {
    localStorage.setItem('soderia_session_v2', JSON.stringify({
      empresa: this.empresa,
      usuario: this.usuario
    }));
    localStorage.setItem('soderia_clientes_v2', JSON.stringify(this.clientes));
    localStorage.setItem('soderia_empleados_v2', JSON.stringify(this.empleados));
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
