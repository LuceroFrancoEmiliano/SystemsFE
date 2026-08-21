import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { callPackage } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales ultra livianos
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Middleware de Logging Detallado de Métodos, Status y Tiempos
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Formato de colores y estado
    const statusText = statusCode >= 200 && statusCode < 300 ? 'OK' :
                       statusCode === 400 ? 'BAD REQUEST' :
                       statusCode === 401 ? 'UNAUTHORIZED' :
                       statusCode === 404 ? 'NOT FOUND' : 'ERROR';

    console.log(`[${timestamp}] [HTTP] ${req.method.padEnd(6)} ${req.originalUrl.padEnd(32)} -> Código: ${statusCode} ${statusText.padEnd(12)} (${duration}ms)`);
  });

  next();
});

// ----------------------------------------------------------------------------
// 1. HEALTHCHECK
// ----------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'online',
    service: 'Systems SaaS API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------------------------------
// 2. RUTAS DE AUTENTICACIÓN (Llama a PKG_AUTH)
// ----------------------------------------------------------------------------
// Login o Registro automático con Google OAuth
app.post('/api/auth/google', async (req, res) => {
  const { email, nombre, avatar_url, google_id } = req.body;
  const result = await callPackage('pkg_auth.login_google', [
    email,
    nombre || '',
    avatar_url || '',
    google_id || ''
  ]);
  res.status(result.ok ? 200 : 400).json(result);
});

// Login con Email y Contraseña directa
app.post('/api/auth/login-password', async (req, res) => {
  const { email, password } = req.body;
  const result = await callPackage('pkg_auth.login_password', [email, password]);
  res.status(result.ok ? 200 : 401).json(result);
});

// Asignar o cambiar contraseña de usuario
app.post('/api/auth/set-password', async (req, res) => {
  const { id_usuario, new_password } = req.body;
  const result = await callPackage('pkg_auth.set_password', [id_usuario, new_password]);
  res.status(result.ok ? 200 : 400).json(result);
});

// Obtener perfil de usuario
app.get('/api/auth/perfil/:id_usuario', async (req, res) => {
  const result = await callPackage('pkg_auth.get_perfil', [req.params.id_usuario]);
  res.status(result.ok ? 200 : 404).json(result);
});

// ----------------------------------------------------------------------------
// 3. RUTAS DE CATÁLOGO DE SISTEMAS (Llama a PKG_SISTEMAS)
// ----------------------------------------------------------------------------
// Listar todos los sistemas activos en venta
app.get('/api/sistemas', async (req, res) => {
  const result = await callPackage('pkg_sistemas.listar_activos', []);
  res.json(result);
});

// Validar en tiempo real si el nombre de empresa / slug está disponible
app.get('/api/sistemas/:id_sistema/validar-slug', async (req, res) => {
  const { slug } = req.query;
  const result = await callPackage('pkg_sistemas.validar_slug', [
    req.params.id_sistema,
    slug || ''
  ]);
  res.json(result);
});

// ----------------------------------------------------------------------------
// 4. RUTAS DE VENTAS & CHECKOUT (Llama a PKG_VENTAS)
// ----------------------------------------------------------------------------
// Procesar compra y generar licencia de empresa (Tenant)
app.post('/api/ventas/checkout', async (req, res) => {
  const {
    id_usuario,
    id_sistema,
    nombre_empresa,
    slug_empresa,
    metodo_pago,
    referencia_pago,
    monto
  } = req.body;

  const result = await callPackage('pkg_ventas.procesar_compra', [
    id_usuario,
    id_sistema,
    nombre_empresa,
    slug_empresa || nombre_empresa,
    metodo_pago || 'MERCADO_PAGO',
    referencia_pago || null,
    monto || null
  ]);

  res.status(result.ok ? 201 : 400).json(result);
});

// ----------------------------------------------------------------------------
// 5. RUTAS DE ACCESOS Y BIBLIOTECA (Llama a PKG_ACCESOS)
// ----------------------------------------------------------------------------
// Obtener todos los sistemas comprados por el usuario
app.get('/api/usuarios/:id_usuario/licencias', async (req, res) => {
  const result = await callPackage('pkg_accesos.listar_mis_licencias', [
    req.params.id_usuario
  ]);
  res.json(result);
});

// Verificación rápida de acceso
app.get('/api/accesos/verificar', async (req, res) => {
  const { id_usuario, id_sistema, slug_empresa } = req.query;
  const result = await callPackage('pkg_accesos.verificar_acceso', [
    id_usuario,
    id_sistema,
    slug_empresa
  ]);
  res.json(result);
});

// ----------------------------------------------------------------------------
// 6. RUTAS DE SINGLE SIGN-ON (SSO HANDSHAKE) (Llama a PKG_SSO)
// ----------------------------------------------------------------------------
// Paso 1: El Frontend Central genera el ticket para saltar al sistema hijo
app.post('/api/sso/generate-ticket', async (req, res) => {
  const { id_usuario, id_licencia } = req.body;
  const result = await callPackage('pkg_sso.generar_ticket', [
    id_usuario,
    id_licencia
  ]);
  res.status(result.ok ? 200 : 400).json(result);
});

// Paso 2: El Backend del Sistema Secundario canjea y verifica el ticket (API a API)
app.post('/api/sso/verify-ticket', async (req, res) => {
  const { ticket, api_secret } = req.body;
  // También permite pasar el secret por Header X-System-Secret
  const secret = api_secret || req.headers['x-system-secret'];

  if (!ticket || !secret) {
    return res.status(400).json({
      ok: false,
      valido: false,
      error: 'Parámetros ticket y secret son obligatorios'
    });
  }

  const result = await callPackage('pkg_sso.canjear_ticket', [ticket, secret]);
  res.status(result.valido ? 200 : 401).json(result);
});

// ----------------------------------------------------------------------------
// 7. RUTAS DE ADMINISTRACIÓN (SUPERADMIN - FRANCO) (Llama a PKG_ADMIN)
// ----------------------------------------------------------------------------
// Dar de alta un nuevo sistema en el catálogo
app.post('/api/admin/sistemas', async (req, res) => {
  const {
    admin_id,
    codigo,
    titulo,
    descripcion,
    descripcion_corta,
    precio,
    url_base,
    api_secret,
    icono,
    caracteristicas
  } = req.body;

  const result = await callPackage('pkg_admin.crear_sistema', [
    admin_id,
    codigo,
    titulo,
    descripcion,
    descripcion_corta,
    precio,
    url_base,
    api_secret || null,
    icono || 'box',
    JSON.stringify(caracteristicas || [])
  ]);

  res.status(result.ok ? 201 : 403).json(result);
});

// Listar compradores y si están usando o no sus sistemas comprados
app.get('/api/admin/compradores/:admin_id', async (req, res) => {
  const result = await callPackage('pkg_admin.listar_compradores_y_uso', [
    req.params.admin_id
  ]);
  res.status(result.ok ? 200 : 403).json(result);
});

// ----------------------------------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SYSTEMS API GATEWAY (Node.js + PostgreSQL Packages)`);
  console.log(`📡 Servidor escuchando en: http://localhost:${PORT}`);
  console.log(`⚡ Consumo de RAM en reposo: ~28MB`);
  console.log(`=======================================================`);
});
