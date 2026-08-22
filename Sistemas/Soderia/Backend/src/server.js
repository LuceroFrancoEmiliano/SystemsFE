import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { callPackage } from './db.js';
import { ssoClient } from './services/ssoClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Logger de Peticiones
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] [SODERIA API] ${req.method.padEnd(6)} ${req.originalUrl.padEnd(36)} -> ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// ----------------------------------------------------------------------------
// 1. SSO HANDSHAKE & AUTENTICACIÓN
// ----------------------------------------------------------------------------
// Callback para compradores que entran desde el Sistema Central
app.post('/api/sso/callback', async (req, res) => {
  const { ticket } = req.body;
  const result = await ssoClient.verifyAndProvisionTicket(ticket);
  res.status(result.valido ? 200 : 401).json(result);
});

// Login directo para choferes y operarios locales
app.post('/api/auth/login', async (req, res) => {
  const { slug, email, password } = req.body;
  const result = await callPackage('pkg_sod_auth.login_empleado', [slug, email, password]);
  res.status(result.ok ? 200 : 401).json(result);
});

// Crear nuevo empleado local
app.post('/api/empleados', async (req, res) => {
  const { id_empresa, nombre, email, password, rol, telefono } = req.body;
  const result = await callPackage('pkg_sod_auth.crear_empleado', [
    id_empresa,
    nombre,
    email,
    password,
    rol || 'CHOFER',
    telefono || ''
  ]);
  res.status(result.ok ? 201 : 400).json(result);
});

// ----------------------------------------------------------------------------
// 2. DASHBOARD & MÉTRICAS
// ----------------------------------------------------------------------------
app.get('/api/dashboard/:id_empresa', async (req, res) => {
  const result = await callPackage('pkg_sod_dashboard.obtener_metricas', [req.params.id_empresa]);
  res.json(result);
});

// ----------------------------------------------------------------------------
// 3. CLIENTES & CONTROL DE ENVASES
// ----------------------------------------------------------------------------
app.get('/api/clientes/:id_empresa', async (req, res) => {
  const { id_zona } = req.query;
  const result = await callPackage('pkg_sod_clientes.listar_clientes', [
    req.params.id_empresa,
    id_zona ? Number(id_zona) : null
  ]);
  res.json(result);
});

app.post('/api/clientes', async (req, res) => {
  const {
    id_empresa,
    nombre,
    telefono,
    direccion,
    id_zona,
    sifones_inicial,
    bidones_inicial,
    notas
  } = req.body;

  const result = await callPackage('pkg_sod_clientes.guardar_cliente', [
    id_empresa,
    nombre,
    telefono || '',
    direccion,
    id_zona || null,
    sifones_inicial || 0,
    bidones_inicial || 0,
    notas || ''
  ]);
  res.status(result.ok ? 201 : 400).json(result);
});

// ----------------------------------------------------------------------------
// 4. REPARTOS Y RENDICIÓN
// ----------------------------------------------------------------------------
app.post('/api/repartos/iniciar', async (req, res) => {
  const { id_empresa, id_chofer, id_zona, sifones_salida, bidones_salida } = req.body;
  const result = await callPackage('pkg_sod_repartos.iniciar_reparto', [
    id_empresa,
    id_chofer,
    id_zona,
    sifones_salida || 0,
    bidones_salida || 0
  ]);
  res.status(result.ok ? 201 : 400).json(result);
});

app.post('/api/repartos/entrega', async (req, res) => {
  const {
    id_reparto,
    id_cliente,
    sifones_entregados,
    sifones_devueltos,
    bidones_entregados,
    bidones_devueltos,
    monto_total,
    monto_cobrado,
    metodo_pago,
    observacion
  } = req.body;

  const result = await callPackage('pkg_sod_repartos.registrar_entrega', [
    id_reparto,
    id_cliente,
    sifones_entregados || 0,
    sifones_devueltos || 0,
    bidones_entregados || 0,
    bidones_devueltos || 0,
    monto_total || 0,
    monto_cobrado || 0,
    metodo_pago || 'EFECTIVO',
    observacion || ''
  ]);
  res.status(result.ok ? 200 : 400).json(result);
});

app.post('/api/repartos/cerrar', async (req, res) => {
  const {
    id_reparto,
    sifones_retorno_llenos,
    sifones_retorno_vacios,
    bidones_retorno_llenos,
    bidones_retorno_vacios,
    observaciones
  } = req.body;

  const result = await callPackage('pkg_sod_repartos.cerrar_reparto', [
    id_reparto,
    sifones_retorno_llenos || 0,
    sifones_retorno_vacios || 0,
    bidones_retorno_llenos || 0,
    bidones_retorno_vacios || 0,
    observaciones || ''
  ]);
  res.status(result.ok ? 200 : 400).json(result);
});

// ----------------------------------------------------------------------------
// 5. BOT DE WHATSAPP & PEDIDOS AUTOMATIZADOS
// ----------------------------------------------------------------------------
app.post('/api/whatsapp/webhook', async (req, res) => {
  const { id_empresa, id_cliente, mensaje, sifones, bidones, monto, estado, respuesta } = req.body;
  
  const result = await callPackage('pkg_sod_whatsapp.registrar_pedido_bot', [
    id_empresa || 1,
    id_cliente,
    mensaje,
    sifones || 0,
    bidones || 0,
    monto || 0,
    estado || 'CONFIRMADO',
    respuesta || ''
  ]);

  res.status(result.ok ? 200 : 400).json(result);
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`💧 SODERÍA CLOUD PRO BACKEND ACTIVO`);
  console.log(`📡 Servidor escuchando en: http://localhost:${PORT}`);
  console.log(`🔗 Conectado al Main Hub en: ${process.env.MAIN_HUB_URL || 'http://localhost:3000'}`);
  console.log(`=======================================================`);
});
