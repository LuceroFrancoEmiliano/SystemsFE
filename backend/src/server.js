import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { callPackage, query } from './db.js';

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

// Registro de nueva cuenta de usuario (Sign Up)
app.post('/api/auth/register', async (req, res) => {
  const { nombre, email, password, telefono } = req.body;
  const result = await callPackage('pkg_auth.registrar_usuario', [
    nombre || 'Usuario',
    email,
    password,
    telefono || ''
  ]);
  res.status(result.ok ? 201 : 400).json(result);
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const { email } = req.body || {};
  res.status(200).json({ ok: true, mensaje: 'Sesión finalizada' });
});

// Registrar y responder vista de navegación
app.get('/api/views/:viewName', (req, res) => {
  const { viewName } = req.params;
  res.status(200).json({ ok: true, vista: viewName, timestamp: new Date().toISOString() });
});

// Listar manuales
app.get('/api/manuales', (req, res) => {
  res.status(200).json({ ok: true, manuales: [] });
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

// Actualizar precio o datos de un sistema existente
app.put('/api/admin/sistemas/:id_sistema', async (req, res) => {
  const { admin_id, precio, titulo, descripcion_corta, url_base, activo } = req.body;
  const result = await callPackage('pkg_admin.actualizar_sistema', [
    admin_id || 1,
    req.params.id_sistema,
    precio,
    titulo || null,
    descripcion_corta || null,
    url_base || null,
    activo !== undefined ? activo : true
  ]);
  res.status(result.ok ? 200 : 400).json(result);
});

// Listar compradores y si están usando o no sus sistemas comprados
app.get('/api/admin/compradores/:admin_id', async (req, res) => {
  const result = await callPackage('pkg_admin.listar_compradores_y_uso', [
    req.params.admin_id
  ]);
  res.json(result);
});

// Aprobar pago y activar licencia manualmente
app.post('/api/admin/licencias/:id_licencia/aprobar', async (req, res) => {
  const { admin_id } = req.body;
  const result = await callPackage('pkg_admin.aprobar_licencia', [
    admin_id || 1,
    req.params.id_licencia
  ]);
  res.status(result.ok ? 200 : 400).json(result);
});

// Rechazar pago y suspender licencia
app.post('/api/admin/licencias/:id_licencia/rechazar', async (req, res) => {
  const { admin_id, motivo } = req.body;
  const result = await callPackage('pkg_admin.rechazar_licencia', [
    admin_id || 1,
    req.params.id_licencia,
    motivo || 'Comprobante no válido o monto insuficiente'
  ]);
  res.status(result.ok ? 200 : 400).json(result);
});

// Helper para obtener cliente de Mercado Pago configurado
async function getMPClient() {
  let token = process.env.MP_ACCESS_TOKEN;
  try {
    const res = await query('SELECT mp_access_token FROM configuracion_pagos ORDER BY id_config ASC LIMIT 1');
    if (res.rows.length > 0 && res.rows[0].mp_access_token) {
      token = res.rows[0].mp_access_token;
    }
  } catch (e) {}

  return new MercadoPagoConfig({
    accessToken: token || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000',
    options: { timeout: 5000 }
  });
}

// ----------------------------------------------------------------------------
// 8. CONFIGURACIÓN DE MERCADO PAGO (API KEYS)
// ----------------------------------------------------------------------------
app.get('/api/config/pagos', async (req, res) => {
  try {
    const result = await query('SELECT * FROM configuracion_pagos ORDER BY id_config ASC LIMIT 1');
    if (result.rows.length > 0) {
      res.json({ ok: true, config: result.rows[0] });
    } else {
      res.json({
        ok: true,
        config: {
          mp_access_token: process.env.MP_ACCESS_TOKEN || '',
          mp_public_key: process.env.MP_PUBLIC_KEY || '',
          mp_sandbox: true
        }
      });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.put('/api/admin/config/pagos', async (req, res) => {
  const { mp_access_token, mp_public_key, mp_sandbox } = req.body;
  try {
    const result = await query(`
      INSERT INTO configuracion_pagos (id_config, mp_access_token, mp_public_key, mp_sandbox, actualizado_en)
      VALUES (1, $1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (id_config) DO UPDATE SET
        mp_access_token = EXCLUDED.mp_access_token,
        mp_public_key = EXCLUDED.mp_public_key,
        mp_sandbox = EXCLUDED.mp_sandbox,
        actualizado_en = CURRENT_TIMESTAMP
      RETURNING *;
    `, [
      mp_access_token || '',
      mp_public_key || '',
      mp_sandbox !== undefined ? mp_sandbox : true
    ]);

    res.json({ ok: true, mensaje: 'Credenciales de Mercado Pago guardadas con éxito', config: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 9. COBROS REALES CON MERCADO PAGO (CHECKOUT PRO & TARJETA DIRECTA)
// ----------------------------------------------------------------------------

// A) Crear Preferencia de Pago Oficial (Checkout Pro / Link de Pago / Saldo en Cuenta)
app.post('/api/pagos/mercadopago/crear-preferencia', async (req, res) => {
  const { id_usuario, id_sistema, nombre_empresa, slug_empresa } = req.body;

  try {
    // 1. Obtener detalles del sistema y usuario
    const sysRes = await query('SELECT * FROM sistemas WHERE id_sistema = $1', [id_sistema]);
    if (sysRes.rows.length === 0) return res.status(404).json({ ok: false, error: 'Sistema no encontrado' });
    const sistema = sysRes.rows[0];

    const userRes = await query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
    const usuario = userRes.rows[0] || { nombre: 'Cliente', email: 'cliente@systems.com' };

    // 2. Crear cliente MP y preferencia
    const client = await getMPClient();
    const preference = new Preference(client);

    const unitPrice = parseFloat(sistema.precio) || 1;

    const prefData = await preference.create({
      body: {
        items: [
          {
            id: String(sistema.id_sistema),
            title: `Licencia Software - ${sistema.titulo}`,
            description: `Instancia privada dedicada para empresa: ${nombre_empresa}`,
            quantity: 1,
            unit_price: unitPrice,
            currency_id: 'ARS'
          }
        ],
        payer: {
          name: usuario.nombre,
          email: usuario.email
        },
        back_urls: {
          success: `http://localhost:5173/?mp_status=approved&id_usuario=${id_usuario}&id_sistema=${id_sistema}&empresa=${encodeURIComponent(nombre_empresa)}&slug=${encodeURIComponent(slug_empresa || '')}`,
          failure: `http://localhost:5173/?mp_status=failure`,
          pending: `http://localhost:5173/?mp_status=pending`
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/pagos/mercadopago/webhook`,
        metadata: {
          id_usuario,
          id_sistema,
          nombre_empresa,
          slug_empresa
        }
      }
    });

    res.json({
      ok: true,
      init_point: prefData.init_point,
      sandbox_init_point: prefData.sandbox_init_point,
      preference_id: prefData.id
    });
  } catch (err) {
    console.error('Error al crear preferencia MP:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// B) Webhook para acreditación automática de pagos reales
app.post('/api/pagos/mercadopago/webhook', async (req, res) => {
  const { type, data } = req.body;
  
  if (type === 'payment' && data?.id) {
    try {
      const client = await getMPClient();
      const paymentApi = new Payment(client);
      const paymentInfo = await paymentApi.get({ id: data.id });

      if (paymentInfo.status === 'approved') {
        const metadata = paymentInfo.metadata || {};
        if (metadata.id_usuario && metadata.id_sistema && metadata.nombre_empresa) {
          // Provisionar licencia inmediatamente
          await callPackage('pkg_ventas.procesar_compra', [
            metadata.id_usuario,
            metadata.id_sistema,
            metadata.nombre_empresa,
            metadata.slug_empresa || metadata.nombre_empresa,
            'MERCADO_PAGO',
            `MP-PAY-${paymentInfo.id}`,
            paymentInfo.transaction_amount
          ]);
          console.log(`✅ Pago real de Mercado Pago ${paymentInfo.id} aprobado y acreditado para ${metadata.nombre_empresa}`);
        }
      }
    } catch (e) {
      console.error('Error procesando webhook MP:', e);
    }
  }

  res.sendStatus(200);
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
