-- ============================================================================
-- SISTEMA DE SODERÍA & DISTRIBUCIÓN DE AGUA (SODERIA CLOUD PRO)
-- Archivo: 01_schema.sql
-- Motor: PostgreSQL 14+ (Esquema Multi-Tenant con Prefijo sod_)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza preventiva
DROP TABLE IF EXISTS sod_movimientos_cta_cte CASCADE;
DROP TABLE IF EXISTS sod_reparto_entregas CASCADE;
DROP TABLE IF EXISTS sod_repartos CASCADE;
DROP TABLE IF EXISTS sod_ventas_mostrador CASCADE;
DROP TABLE IF EXISTS sod_stock_planta CASCADE;
DROP TABLE IF EXISTS sod_clientes CASCADE;
DROP TABLE IF EXISTS sod_productos CASCADE;
DROP TABLE IF EXISTS sod_zonas CASCADE;
DROP TABLE IF EXISTS sod_usuarios CASCADE;
DROP TABLE IF EXISTS sod_empresas CASCADE;

-- ----------------------------------------------------------------------------
-- 1. TABLA: EMPRESAS (Tenants de cada comprador de la sodería)
-- ----------------------------------------------------------------------------
CREATE TABLE sod_empresas (
    id_empresa BIGSERIAL PRIMARY KEY,
    slug_empresa VARCHAR(100) NOT NULL UNIQUE,
    nombre_empresa VARCHAR(200) NOT NULL,
    telefono VARCHAR(50) DEFAULT '',
    direccion TEXT DEFAULT '',
    precio_sifon_base NUMERIC(10,2) DEFAULT 800.00,
    precio_bidon_base NUMERIC(10,2) DEFAULT 2500.00,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sod_empresas_slug ON sod_empresas(slug_empresa);

-- ----------------------------------------------------------------------------
-- 2. TABLA: USUARIOS (Dueño Propietario, Encargados y Choferes Repartidores)
-- ----------------------------------------------------------------------------
CREATE TABLE sod_usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES sod_empresas(id_empresa) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    password_hash TEXT,
    rol VARCHAR(30) NOT NULL DEFAULT 'CHOFER', -- 'ADMIN_PROPIETARIO', 'PLANTA', 'CHOFER'
    telefono VARCHAR(50) DEFAULT '',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sod_usuarios_empresa_email UNIQUE (id_empresa, email)
);

CREATE INDEX idx_sod_usuarios_empresa ON sod_usuarios(id_empresa);

-- ----------------------------------------------------------------------------
-- 3. TABLA: ZONAS DE REPARTO
-- ----------------------------------------------------------------------------
CREATE TABLE sod_zonas (
    id_zona BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES sod_empresas(id_empresa) ON DELETE CASCADE,
    nombre_zona VARCHAR(120) NOT NULL,
    dias_reparto VARCHAR(150) DEFAULT 'Lunes y Jueves',
    descripcion TEXT DEFAULT '',
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_sod_zonas_empresa ON sod_zonas(id_empresa);

-- ----------------------------------------------------------------------------
-- 4. TABLA: PRODUCTOS
-- ----------------------------------------------------------------------------
CREATE TABLE sod_productos (
    id_producto BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES sod_empresas(id_empresa) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tipo_envase VARCHAR(30) NOT NULL DEFAULT 'SIFON_SODA', -- 'SIFON_SODA', 'BIDON_20L', 'BIDON_12L', 'DISPENSER', 'NINGUNO'
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_sod_productos_empresa_codigo UNIQUE (id_empresa, codigo)
);

-- ----------------------------------------------------------------------------
-- 5. TABLA: CLIENTES & CONTROL DE ENVASES EN COMODATO
-- ----------------------------------------------------------------------------
CREATE TABLE sod_clientes (
    id_cliente BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES sod_empresas(id_empresa) ON DELETE CASCADE,
    id_zona BIGINT REFERENCES sod_zonas(id_zona) ON DELETE SET NULL,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) DEFAULT '',
    direccion TEXT NOT NULL,
    orden_visita INT DEFAULT 0,
    saldo_deudor NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Deuda de cuenta corriente
    sifones_prestados INT NOT NULL DEFAULT 0, -- Envases de soda en comodato
    bidones_prestados INT NOT NULL DEFAULT 0, -- Bidones de agua en comodato
    dispensers_prestados INT NOT NULL DEFAULT 0, -- Dispensers instalados
    notas TEXT DEFAULT '',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sod_clientes_empresa ON sod_clientes(id_empresa);
CREATE INDEX idx_sod_clientes_zona ON sod_clientes(id_zona);

-- ----------------------------------------------------------------------------
-- 6. TABLA: STOCK EN PLANTA (Llenos, Vacíos y Roturas)
-- ----------------------------------------------------------------------------
CREATE TABLE sod_stock_planta (
    id_stock BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES sod_empresas(id_empresa) ON DELETE CASCADE,
    tipo_envase VARCHAR(30) NOT NULL, -- 'SIFON_SODA', 'BIDON_20L', 'BIDON_12L'
    llenos INT NOT NULL DEFAULT 0,
    vacios INT NOT NULL DEFAULT 0,
    rotos INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_sod_stock_empresa_tipo UNIQUE (id_empresa, tipo_envase)
);

-- ----------------------------------------------------------------------------
-- 7. TABLA: REPARTOS (Hojas de Ruta Diarias por Camión/Chofer)
-- ----------------------------------------------------------------------------
CREATE TABLE sod_repartos (
    id_reparto BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES sod_empresas(id_empresa) ON DELETE CASCADE,
    id_chofer BIGINT NOT NULL REFERENCES sod_usuarios(id_usuario),
    id_zona BIGINT REFERENCES sod_zonas(id_zona),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'EN_CURSO', -- 'EN_CURSO', 'FINALIZADO'
    -- Carga al salir
    sifones_salida INT NOT NULL DEFAULT 0,
    bidones_salida INT NOT NULL DEFAULT 0,
    -- Carga al volver (Rendición)
    sifones_retorno_llenos INT NOT NULL DEFAULT 0,
    sifones_retorno_vacios INT NOT NULL DEFAULT 0,
    bidones_retorno_llenos INT NOT NULL DEFAULT 0,
    bidones_retorno_vacios INT NOT NULL DEFAULT 0,
    -- Dinero recaudado
    total_efectivo NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_transferencia NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_fiado NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    observaciones TEXT DEFAULT '',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cerrado_en TIMESTAMPTZ
);

CREATE INDEX idx_sod_repartos_empresa_fecha ON sod_repartos(id_empresa, fecha);

-- ----------------------------------------------------------------------------
-- 8. TABLA: ENTREGAS DE REPARTO (Parada a parada del cliente)
-- ----------------------------------------------------------------------------
CREATE TABLE sod_reparto_entregas (
    id_entrega BIGSERIAL PRIMARY KEY,
    id_reparto BIGINT NOT NULL REFERENCES sod_repartos(id_reparto) ON DELETE CASCADE,
    id_cliente BIGINT NOT NULL REFERENCES sod_clientes(id_cliente),
    sifones_entregados INT NOT NULL DEFAULT 0,
    sifones_devueltos INT NOT NULL DEFAULT 0,
    bidones_entregados INT NOT NULL DEFAULT 0,
    bidones_devueltos INT NOT NULL DEFAULT 0,
    monto_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    monto_cobrado NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    metodo_pago VARCHAR(30) NOT NULL DEFAULT 'EFECTIVO', -- 'EFECTIVO', 'TRANSFERENCIA', 'FIADO'
    observacion VARCHAR(255) DEFAULT '',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. TABLA: MOVIMIENTOS DE CUENTA CORRIENTE (Fiados y Pagos de Clientes)
-- ----------------------------------------------------------------------------
CREATE TABLE sod_movimientos_cta_cte (
    id_movimiento BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES sod_empresas(id_empresa) ON DELETE CASCADE,
    id_cliente BIGINT NOT NULL REFERENCES sod_clientes(id_cliente) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL, -- 'DEUDA_REPARTO', 'PAGO_RECIBIDO', 'AJUSTE'
    monto NUMERIC(10,2) NOT NULL,
    saldo_resultante NUMERIC(10,2) NOT NULL,
    descripcion TEXT DEFAULT '',
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sod_cta_cte_cliente ON sod_movimientos_cta_cte(id_cliente);
