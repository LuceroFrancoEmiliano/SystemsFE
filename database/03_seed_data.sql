-- ============================================================================
-- SISTEMA DE SISTEMAS (SaaS Central Hub & SSO)
-- Archivo: 03_seed_data.sql
-- Datos iniciales de prueba (SuperAdmin, Catálogo de Sistemas y Demo User)
-- ============================================================================

-- 1. Crear Usuario SuperAdmin (Tú / Franco)
INSERT INTO usuarios (id_usuario, email, nombre, avatar_url, google_id, rol_global, activo)
VALUES 
(1, 'franco.admin@systems.com', 'Franco (SuperAdmin)', 'https://api.dicebear.com/7.x/bottts/svg?seed=FrancoAdmin', 'google_admin_001', 'ADMIN', TRUE)
ON CONFLICT (email) DO UPDATE SET rol_global = 'ADMIN';

-- 2. Crear Usuario Cliente de Prueba
INSERT INTO usuarios (id_usuario, email, nombre, avatar_url, google_id, rol_global, activo)
VALUES 
(2, 'cliente.demo@empresa.com', 'Martín Sodería', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Martin', 'google_user_002', 'USER', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Ajustar la secuencia de IDs de usuarios
SELECT setval('usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios));

-- 3. Insertar Catálogo Inicial de Sistemas Web
INSERT INTO sistemas (
    id_sistema, codigo, titulo, descripcion, descripcion_corta, 
    precio, moneda, url_base, api_secret, icono, banner_url, caracteristicas
) VALUES 
(
    1,
    'soderia_cloud',
    'Sodería Cloud Pro',
    'Sistema integral de gestión de reparto de bidones, comodatos, cobranzas en calle, clientes y control de stock de envases retornables en tiempo real.',
    'Gestión total de reparto de bidones, clientes y comodatos.',
    29.99,
    'USD',
    'http://localhost:4001',
    'sec_live_soderia_98a72f1b4c',
    'droplet',
    'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=60',
    '["Control de envases retornables y comodatos", "Rutas de reparto y cobranza móvil", "Facturación automática y cuentas corrientes", "Gestión de múltiples choferes y zonas"]'::jsonb
),
(
    2,
    'gym_master',
    'GymMaster Suite',
    'Plataforma completa para gimnasios, box de crossfit y centros deportivos. Control de accesos con molinetes/QR, cobro de cuotas recurrentes y rutinas.',
    'Gestión integral de socios, membresías, accesos QR y rutinas.',
    39.99,
    'USD',
    'http://localhost:4002',
    'sec_live_gym_84c910fa7e',
    'activity',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60',
    '["Control de acceso QR y reconocimiento", "Cobro automático de cuotas y vencimientos", "App para socios con rutinas y reservas de clases", "Estadísticas de ocupación en vivo"]'::jsonb
),
(
    3,
    'stock_facturacion',
    'OmniPoint Facturación & Stock',
    'Punto de venta y facturación electrónica ultra veloz para comercios minoristas y mayoristas. Control de inventario multi-depósito y código de barras.',
    'Punto de venta rápido, stock multi-depósito y facturación.',
    49.99,
    'USD',
    'http://localhost:4003',
    'sec_live_stock_73d82bc19a',
    'shopping-cart',
    'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=60',
    '["Punto de venta POS ultra ágil con atajos", "Control de stock e inventario con alertas", "Integración con lectores de código de barras", "Reportes de caja diarios y márgenes de ganancia"]'::jsonb
)
ON CONFLICT (codigo) DO UPDATE 
SET titulo = EXCLUDED.titulo,
    precio = EXCLUDED.precio,
    url_base = EXCLUDED.url_base,
    api_secret = EXCLUDED.api_secret;

-- Ajustar la secuencia de IDs de sistemas
SELECT setval('sistemas_id_sistema_seq', (SELECT MAX(id_sistema) FROM sistemas));

-- 4. Crear una Licencia de Ejemplo ya Comprada para el Usuario Demo
INSERT INTO licencias (
    id_licencia, id_usuario, id_sistema, nombre_empresa, slug_empresa, 
    rol_en_sistema, estado, fecha_compra
) VALUES 
(
    1,
    2, -- Martín Sodería
    1, -- Sodería Cloud Pro
    'Sodería San Martín',
    'soderia-san-martin',
    'ADMIN_PROPIETARIO',
    'ACTIVA',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
)
ON CONFLICT (id_sistema, slug_empresa) DO NOTHING;

SELECT setval('licencias_id_licencia_seq', (SELECT COALESCE(MAX(id_licencia), 1) FROM licencias));
