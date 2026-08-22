/**
 * ============================================================================
 * STORE DE ESTADO REACTIVO - SODERÍA CLOUD PRO
 * Asignación Automática por Día y Gestión Rápida para Choferes
 * ============================================================================
 */

import { GeoService } from './geoService.js';
import { WhatsAppBotEngine } from './whatsappBot.js';

const API_BASE = 'http://localhost:3001/api';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

class SoderiaStore {
  constructor() {
    const savedSession = localStorage.getItem('soderia_session_v4');
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

    this.isAuthenticated = Boolean(parsed);
    this.currentView = this.isAuthenticated 
      ? (this.usuario.rol === 'CHOFER' ? 'chofer-movil' : 'dashboard')
      : 'dashboard';
    
    // Padrón de clientes y empleados
    this.clientes = JSON.parse(localStorage.getItem('soderia_clientes_v4') || '[]');
    this.empleados = JSON.parse(localStorage.getItem('soderia_empleados_v4') || '[]');
    
    // Historial de entregas del día
    this.entregasDelDia = JSON.parse(localStorage.getItem('soderia_entregas_dia_v4') || '{}');
    
    // Pedidos pre-agendados automáticamente por el Bot de WhatsApp
    this.pedidosWhatsapp = JSON.parse(localStorage.getItem('soderia_pedidos_wa_v4') || '{}');
    
    // Posición GPS del chofer
    this.driverCoords = null;

    // Día seleccionado para la ruta (por defecto el día actual)
    const todayIndex = new Date().getDay();
    this.diaSeleccionado = DIAS_SEMANA[todayIndex];

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

    this.listeners = [];

    // Chequear ticket SSO
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
            rol: 'ADMIN_PROPIETARIO'
          };
          this.isAuthenticated = true;
          this.currentView = 'dashboard';
          this.save();
          window.history.replaceState({}, document.title, window.location.pathname);
          this.notify();
          window.showToast?.(`👋 ¡Bienvenido ${this.usuario.nombre} a ${this.empresa.nombre_empresa}!`, 'success');
        }
      } catch (err) {}
    }
  }

  save() {
    if (this.isAuthenticated && this.usuario) {
      localStorage.setItem('soderia_session_v4', JSON.stringify({
        empresa: this.empresa,
        usuario: this.usuario
      }));
    } else {
      localStorage.removeItem('soderia_session_v4');
    }
    localStorage.setItem('soderia_clientes_v4', JSON.stringify(this.clientes));
    localStorage.setItem('soderia_empleados_v4', JSON.stringify(this.empleados));
    localStorage.setItem('soderia_entregas_dia_v4', JSON.stringify(this.entregasDelDia));
    localStorage.setItem('soderia_pedidos_wa_v4', JSON.stringify(this.pedidosWhatsapp));
  }

  // Procesar mensaje entrante de un cliente mediante el Bot Inteligente
  procesarMensajeWhatsApp({ id_cliente, texto }) {
    const cli = this.clientes.find(c => c.id_cliente === Number(id_cliente));
    if (!cli) return null;

    const parsed = WhatsAppBotEngine.parseIncomingMessage(texto, cli);
    const fechaKey = new Date().toISOString().split('T')[0];
    const key = `${fechaKey}_${cli.id_cliente}`;

    const registro = {
      id_pedido: Date.now(),
      id_cliente: cli.id_cliente,
      cliente_nombre: cli.nombre,
      telefono: cli.telefono,
      mensaje_original: texto,
      intent: parsed.intent,
      sifones: parsed.sifones,
      bidones: parsed.bidones,
      monto: parsed.monto,
      totalPagar: parsed.totalPagar,
      respuesta_bot: parsed.respuesta,
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      fecha: fechaKey
    };

    this.pedidosWhatsapp[key] = registro;

    // Enviar en segundo plano a la base de datos Neon
    fetch(`${API_BASE}/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_empresa: this.empresa.id_empresa,
        id_cliente: cli.id_cliente,
        mensaje: texto,
        sifones: parsed.sifones,
        bidones: parsed.bidones,
        monto: parsed.monto,
        estado: parsed.intent,
        respuesta: parsed.respuesta
      })
    }).catch(() => {});

    this.notify();
    return registro;
  }

  getPedidoWhatsAppCliente(id_cliente) {
    const fechaKey = new Date().toISOString().split('T')[0];
    const key = `${fechaKey}_${id_cliente}`;
    return this.pedidosWhatsapp[key] || null;
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

  setDiaSeleccionado(dia) {
    this.diaSeleccionado = dia;
    this.notify();
  }

  // Obtener clientes asignados automáticamente para el día y chofer actual (ordenados por cercanía)
  getClientesDelDia(dia = this.diaSeleccionado) {
    const list = this.clientes.filter(c => {
      const dias = c.dias_visita || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const correspondeDia = Array.isArray(dias) 
        ? dias.some(d => d.toLowerCase().includes(dia.toLowerCase()))
        : String(dias).toLowerCase().includes(dia.toLowerCase());

      if (this.usuario?.rol === 'CHOFER' && c.chofer_asignado) {
        return correspondeDia && (c.chofer_asignado === this.usuario.email || c.chofer_asignado === this.usuario.nombre || c.chofer_asignado === 'TODOS');
      }

      return correspondeDia;
    });

    // Si tenemos coordenadas del chofer, ordenar por cercanía en metros
    if (this.driverCoords) {
      return GeoService.sortByProximity(this.driverCoords, list);
    }

    return list;
  }

  // Optimizar ruta completa según la ubicación GPS actual del chofer
  async autoOptimizarRutaGPS() {
    const coords = await GeoService.getCurrentPosition();
    this.driverCoords = coords;
    this.notify();
    return coords;
  }

  async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();

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

    throw new Error('Credenciales inválidas');
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
      dias_visita: clienteData.dias_visita || ['Lunes', 'Jueves'],
      chofer_asignado: clienteData.chofer_asignado || 'TODOS',
      sifones_prestados: Number(clienteData.sifones_inicial || 0),
      bidones_prestados: Number(clienteData.bidones_inicial || 0),
      saldo_deudor: 0,
      creado_en: new Date().toISOString()
    };

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

    this.empleados.unshift(newEmp);
    this.notify();
    return newEmp;
  }

  // Registrar Resultado de Entrega (OK vs NO ESTABA)
  registrarResultadoEntrega({
    id_cliente,
    estado, // 'OK' | 'NO_ESTABA'
    sifones_entregados = 0,
    sifones_devueltos = 0,
    bidones_entregados = 0,
    bidones_devueltos = 0,
    monto_total = 0,
    monto_cobrado = 0,
    metodo_pago = 'EFECTIVO',
    observacion = ''
  }) {
    const cli = this.clientes.find(c => c.id_cliente === Number(id_cliente));
    if (!cli) return;

    const fechaKey = new Date().toISOString().split('T')[0];
    const key = `${fechaKey}_${id_cliente}`;

    if (estado === 'OK') {
      // 1. Actualizar balance de envases del cliente
      const difSifones = Number(sifones_entregados) - Number(sifones_devueltos);
      const difBidones = Number(bidones_entregados) - Number(bidones_devueltos);
      cli.sifones_prestados = Math.max(0, (cli.sifones_prestados || 0) + difSifones);
      cli.bidones_prestados = Math.max(0, (cli.bidones_prestados || 0) + difBidones);

      // 2. Actualizar saldo / deuda del cliente (si no pagó completo)
      const deudaGenerada = Number(monto_total) - Number(monto_cobrado);
      cli.saldo_deudor = Math.max(0, (cli.saldo_deudor || 0) + deudaGenerada);

      this.entregasDelDia[key] = {
        estado: 'OK',
        id_cliente: cli.id_cliente,
        cliente_nombre: cli.nombre,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        sifones_entregados: Number(sifones_entregados),
        sifones_devueltos: Number(sifones_devueltos),
        bidones_entregados: Number(bidones_entregados),
        bidones_devueltos: Number(bidones_devueltos),
        monto_cobrado: Number(monto_cobrado),
        monto_deuda: deudaGenerada,
        metodo_pago,
        chofer: this.usuario?.nombre || 'Chofer'
      };
    } else {
      // No Estaba
      this.entregasDelDia[key] = {
        estado: 'NO_ESTABA',
        id_cliente: cli.id_cliente,
        cliente_nombre: cli.nombre,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        chofer: this.usuario?.nombre || 'Chofer',
        observacion: observacion || 'Cliente no se encontraba en el domicilio'
      };
    }

    this.notify();
  }

  getEstadoEntregaCliente(id_cliente) {
    const fechaKey = new Date().toISOString().split('T')[0];
    const key = `${fechaKey}_${id_cliente}`;
    return this.entregasDelDia[key] || null;
  }
}

export const store = new SoderiaStore();
