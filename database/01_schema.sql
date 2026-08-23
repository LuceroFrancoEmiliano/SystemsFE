-- ============================================================================
-- SISTEMA DE SISTEMAS (SaaS Central Hub & SSO)
-- Archivo: 01_schema.sql
-- Motor: PostgreSQL 14+ (Optimizado para bajo consumo y máxima velocidad)
-- ============================================================================

-- Extensiones necesarias (para generación de UUIDs y funciones criptográficas)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza preventiva si se reinstala
DROP TABLE IF EXISTS sso_tickets CASCADE;
DROP TABLE IF EXISTS transacciones CASCADE;
DROP TABLE IF EXISTS licencias CASCADE;
DROP TABLE IF EXISTS sistemas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ----------------------------------------------------------------------------
-- 1. TABLA: USUARIOS (Cuentas Centrales)
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    google_id VARCHAR(255) UNIQUE,
    password_hash TEXT, -- Opcional para login con contraseña si no usa Google
    rol_global VARCHAR(20) NOT NULL DEFAULT 'USER', -- 'USER' o 'ADMIN' (Franco)
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices de búsqueda rápida
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_google_id ON usuarios(google_id);

-- ----------------------------------------------------------------------------
-- 2. TABLA: SISTEMAS (Catálogo de Productos / Software a Vender)
-- ----------------------------------------------------------------------------
CREATE TABLE sistemas (
    id_sistema BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE, -- ej: 'soderia_v1', 'gym_master'
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    descripcion_corta VARCHAR(255) NOT NULL,
    precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
    moneda VARCHAR(10) NOT NULL DEFAULT 'USD',
    url_base TEXT NOT NULL, -- ej: 'https://soderia.misistema.com'
    api_secret VARCHAR(100) NOT NULL, -- Clave secreta compartida para validar SSO
    icono VARCHAR(50) DEFAULT 'box',
    banner_url TEXT DEFAULT '',
    caracteristicas JSONB NOT NULL DEFAULT '[]'::jsonb, -- Lista de bullets
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sistemas_codigo ON sistemas(codigo);
CREATE INDEX idx_sistemas_activo ON sistemas(activo);

-- ----------------------------------------------------------------------------
-- 3. TABLA: LICENCIAS (Instancias de Empresa / Multi-Tenant)
-- ----------------------------------------------------------------------------
CREATE TABLE licencias (
    id_licencia BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    id_sistema BIGINT NOT NULL REFERENCES sistemas(id_sistema) ON DELETE RESTRICT,
    nombre_empresa VARCHAR(150) NOT NULL, -- ej: 'Sodería San Martín'
    slug_empresa VARCHAR(80) NOT NULL, -- ej: 'soderia-san-martin'
    rol_en_sistema VARCHAR(50) NOT NULL DEFAULT 'ADMIN_PROPIETARIO',
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA', -- 'ACTIVA', 'SUSPENDIDA', 'EXPIRADA'
    fecha_compra TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMPTZ, -- NULL para licencias de por vida (Lifetime)
    configuracion JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Restricción: No puede haber 2 empresas con el mismo slug en el mismo sistema
    CONSTRAINT uq_sistema_slug UNIQUE (id_sistema, slug_empresa)
);

CREATE INDEX idx_licencias_usuario ON licencias(id_usuario);
CREATE INDEX idx_licencias_sistema ON licencias(id_sistema);
CREATE INDEX idx_licencias_slug ON licencias(id_sistema, slug_empresa);

-- ----------------------------------------------------------------------------
-- 4. TABLA: TRANSACCIONES (Historial de Pagos)
-- ----------------------------------------------------------------------------
CREATE TABLE transacciones (
    id_transaccion BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    id_sistema BIGINT NOT NULL REFERENCES sistemas(id_sistema),
    id_licencia BIGINT REFERENCES licencias(id_licencia),
    monto NUMERIC(12,2) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'USD',
    metodo_pago VARCHAR(50) NOT NULL, -- 'MERCADO_PAGO', 'STRIPE', 'DEMO', etc.
    referencia_externa VARCHAR(150), -- Payment ID de la pasarela
    estado VARCHAR(30) NOT NULL DEFAULT 'APROBADO', -- 'PENDIENTE', 'APROBADO', 'RECHAZADO'
    datos_pasarela JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transacciones_usuario ON transacciones(id_usuario);
CREATE INDEX idx_transacciones_fecha ON transacciones(creado_en DESC);

-- ----------------------------------------------------------------------------
-- 5. TABLA: SSO_TICKETS (Tickets de Entrada Temporal de Un Solo Uso)
-- ----------------------------------------------------------------------------
CREATE TABLE sso_tickets (
    ticket VARCHAR(80) PRIMARY KEY, -- Token temporal seguro
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_licencia BIGINT NOT NULL REFERENCES licencias(id_licencia) ON DELETE CASCADE,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    expira_en TIMESTAMPTZ NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sso_tickets_expira ON sso_tickets(expira_en, usado);
