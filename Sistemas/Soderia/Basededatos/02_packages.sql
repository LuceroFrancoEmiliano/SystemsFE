-- ============================================================================
-- SISTEMA DE SODERÍA (SODERIA CLOUD PRO)
-- Archivo: 02_packages.sql
-- Lógica encapsulada en PL/pgSQL con retornos JSONB
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS pkg_sod_auth;
CREATE SCHEMA IF NOT EXISTS pkg_sod_clientes;
CREATE SCHEMA IF NOT EXISTS pkg_sod_repartos;
CREATE SCHEMA IF NOT EXISTS pkg_sod_stock;
CREATE SCHEMA IF NOT EXISTS pkg_sod_dashboard;

-- ============================================================================
-- 1. PAQUETE: PKG_SOD_AUTH (Handshake SSO & Gestión de Empleados)
-- ============================================================================

-- A. Handshake SSO (Provisionamiento automático de empresa y dueño al entrar)
CREATE OR REPLACE FUNCTION pkg_sod_auth.sso_handshake(
    p_slug VARCHAR,
    p_nombre_empresa VARCHAR,
    p_email VARCHAR,
    p_nombre_usuario VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa sod_empresas%ROWTYPE;
    v_usuario sod_usuarios%ROWTYPE;
    v_clean_slug VARCHAR := LOWER(TRIM(p_slug));
    v_clean_email VARCHAR := LOWER(TRIM(p_email));
BEGIN
    -- 1. Buscar o crear empresa
    SELECT * INTO v_empresa FROM sod_empresas WHERE slug_empresa = v_clean_slug;
    IF NOT FOUND THEN
        INSERT INTO sod_empresas (slug_empresa, nombre_empresa)
        VALUES (v_clean_slug, COALESCE(p_nombre_empresa, v_clean_slug))
        RETURNING * INTO v_empresa;

        -- Crear zonas por defecto para la nueva empresa
        INSERT INTO sod_zonas (id_empresa, nombre_zona, dias_reparto) VALUES
        (v_empresa.id_empresa, 'Zona Centro', 'Lunes y Jueves'),
        (v_empresa.id_empresa, 'Zona Norte / Residencial', 'Martes y Viernes');

        -- Crear productos base
        INSERT INTO sod_productos (id_empresa, codigo, nombre, precio, tipo_envase) VALUES
        (v_empresa.id_empresa, 'SIF-01', 'Cajón de Soda (6 Sifones)', 2400.00, 'SIFON_SODA'),
        (v_empresa.id_empresa, 'BID-20', 'Bidón de Agua Purificada 20L', 2800.00, 'BIDON_20L'),
        (v_empresa.id_empresa, 'BID-12', 'Bidón de Agua 12L', 1900.00, 'BIDON_12L');

        -- Inicializar stock de planta
        INSERT INTO sod_stock_planta (id_empresa, tipo_envase, llenos, vacios) VALUES
        (v_empresa.id_empresa, 'SIFON_SODA', 200, 150),
        (v_empresa.id_empresa, 'BIDON_20L', 80, 40),
        (v_empresa.id_empresa, 'BIDON_12L', 50, 30);
    END IF;

    -- 2. Buscar o crear el usuario Admin Propietario en la empresa
    SELECT * INTO v_usuario FROM sod_usuarios 
    WHERE id_empresa = v_empresa.id_empresa AND email = v_clean_email;

    IF NOT FOUND THEN
        INSERT INTO sod_usuarios (id_empresa, email, nombre, rol, activo)
        VALUES (v_empresa.id_empresa, v_clean_email, p_nombre_usuario, 'ADMIN_PROPIETARIO', TRUE)
        RETURNING * INTO v_usuario;
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'empresa', jsonb_build_object(
            'id_empresa', v_empresa.id_empresa,
            'slug_empresa', v_empresa.slug_empresa,
            'nombre_empresa', v_empresa.nombre_empresa
        ),
        'usuario', jsonb_build_object(
            'id_usuario', v_usuario.id_usuario,
            'nombre', v_usuario.nombre,
            'email', v_usuario.email,
            'rol', v_usuario.rol
        )
    );
END;
$$;

-- B. Login de Empleado Local (Choferes y Operarios)
CREATE OR REPLACE FUNCTION pkg_sod_auth.login_empleado(
    p_slug VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa sod_empresas%ROWTYPE;
    v_usuario sod_usuarios%ROWTYPE;
BEGIN
    SELECT * INTO v_empresa FROM sod_empresas WHERE slug_empresa = LOWER(TRIM(p_slug)) AND activo = TRUE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Empresa no encontrada');
    END IF;

    SELECT * INTO v_usuario FROM sod_usuarios 
    WHERE id_empresa = v_empresa.id_empresa AND email = LOWER(TRIM(p_email)) AND activo = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Credenciales inválidas');
    END IF;

    IF v_usuario.password_hash IS NOT NULL AND v_usuario.password_hash <> crypt(p_password, v_usuario.password_hash) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Contraseña incorrecta');
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'empresa', jsonb_build_object('id_empresa', v_empresa.id_empresa, 'nombre_empresa', v_empresa.nombre_empresa, 'slug_empresa', v_empresa.slug_empresa),
        'usuario', jsonb_build_object('id_usuario', v_usuario.id_usuario, 'nombre', v_usuario.nombre, 'email', v_usuario.email, 'rol', v_usuario.rol)
    );
END;
$$;

-- C. Crear Empleado (Chofer / Planta)
CREATE OR REPLACE FUNCTION pkg_sod_auth.crear_empleado(
    p_id_empresa BIGINT,
    p_nombre VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR,
    p_rol VARCHAR,
    p_telefono VARCHAR DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id BIGINT;
    v_hash TEXT := crypt(p_password, gen_salt('bf', 10));
BEGIN
    INSERT INTO sod_usuarios (id_empresa, nombre, email, password_hash, rol, telefono, activo)
    VALUES (p_id_empresa, p_nombre, LOWER(TRIM(p_email)), v_hash, p_rol, p_telefono, TRUE)
    RETURNING id_usuario INTO v_id;

    RETURN jsonb_build_object('ok', true, 'id_usuario', v_id, 'mensaje', 'Empleado registrado con éxito');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- 2. PAQUETE: PKG_SOD_CLIENTES (Gestión de Clientes, Envases y Saldo)
-- ============================================================================

CREATE OR REPLACE FUNCTION pkg_sod_clientes.listar_clientes(
    p_id_empresa BIGINT,
    p_id_zona BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_data JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id_cliente', c.id_cliente,
            'nombre', c.nombre,
            'telefono', c.telefono,
            'direccion', c.direccion,
            'id_zona', c.id_zona,
            'nombre_zona', COALESCE(z.nombre_zona, 'Sin Zona Asignada'),
            'saldo_deudor', c.saldo_deudor,
            'sifones_prestados', c.sifones_prestados,
            'bidones_prestados', c.bidones_prestados,
            'dispensers_prestados', c.dispensers_prestados,
            'notas', c.notas,
            'activo', c.activo
        ) ORDER BY c.id_zona, c.orden_visita, c.nombre
    ) INTO v_data
    FROM sod_clientes c
    LEFT JOIN sod_zonas z ON c.id_zona = z.id_zona
    WHERE c.id_empresa = p_id_empresa AND c.activo = TRUE
      AND (p_id_zona IS NULL OR c.id_zona = p_id_zona);

    RETURN jsonb_build_object('ok', true, 'clientes', COALESCE(v_data, '[]'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION pkg_sod_clientes.guardar_cliente(
    p_id_empresa BIGINT,
    p_nombre VARCHAR,
    p_telefono VARCHAR,
    p_direccion TEXT,
    p_id_zona BIGINT DEFAULT NULL,
    p_sifones_inicial INT DEFAULT 0,
    p_bidones_inicial INT DEFAULT 0,
    p_notas TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id BIGINT;
BEGIN
    INSERT INTO sod_clientes (
        id_empresa, nombre, telefono, direccion, id_zona, sifones_prestados, bidones_prestados, notas
    ) VALUES (
        p_id_empresa, p_nombre, p_telefono, p_direccion, p_id_zona, p_sifones_inicial, p_bidones_inicial, p_notas
    ) RETURNING id_cliente INTO v_id;

    RETURN jsonb_build_object('ok', true, 'id_cliente', v_id, 'mensaje', 'Cliente creado con éxito');
END;
$$;

-- ============================================================================
-- 3. PAQUETE: PKG_SOD_REPARTOS (Hojas de Ruta, Carga de Camión y Rendición)
-- ============================================================================

-- A. Iniciar Salida del Reparto
CREATE OR REPLACE FUNCTION pkg_sod_repartos.iniciar_reparto(
    p_id_empresa BIGINT,
    p_id_chofer BIGINT,
    p_id_zona BIGINT,
    p_sifones_salida INT,
    p_bidones_salida INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id BIGINT;
BEGIN
    -- Descontar del stock lleno en planta
    UPDATE sod_stock_planta 
    SET llenos = GREATEST(0, llenos - p_sifones_salida)
    WHERE id_empresa = p_id_empresa AND tipo_envase = 'SIFON_SODA';

    UPDATE sod_stock_planta 
    SET llenos = GREATEST(0, llenos - p_bidones_salida)
    WHERE id_empresa = p_id_empresa AND tipo_envase = 'BIDON_20L';

    -- Crear planilla de viaje
    INSERT INTO sod_repartos (
        id_empresa, id_chofer, id_zona, sifones_salida, bidones_salida, estado
    ) VALUES (
        p_id_empresa, p_id_chofer, p_id_zona, p_sifones_salida, p_bidones_salida, 'EN_CURSO'
    ) RETURNING id_reparto INTO v_id;

    RETURN jsonb_build_object('ok', true, 'id_reparto', v_id, 'mensaje', 'Reparto iniciado. Camión despachado.');
END;
$$;

-- B. Registrar Entrega en Domicilio del Cliente
CREATE OR REPLACE FUNCTION pkg_sod_repartos.registrar_entrega(
    p_id_reparto BIGINT,
    p_id_cliente BIGINT,
    p_sifones_entregados INT,
    p_sifones_devueltos INT,
    p_bidones_entregados INT,
    p_bidones_devueltos INT,
    p_monto_total NUMERIC,
    p_monto_cobrado NUMERIC,
    p_metodo_pago VARCHAR,
    p_observacion VARCHAR DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rep sod_repartos%ROWTYPE;
    v_cli sod_clientes%ROWTYPE;
    v_diferencia_deuda NUMERIC := p_monto_total - p_monto_cobrado;
BEGIN
    SELECT * INTO v_rep FROM sod_repartos WHERE id_reparto = p_id_reparto;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Reparto no encontrado');
    END IF;

    SELECT * INTO v_cli FROM sod_clientes WHERE id_cliente = p_id_cliente;

    -- 1. Insertar detalle de entrega
    INSERT INTO sod_reparto_entregas (
        id_reparto, id_cliente, sifones_entregados, sifones_devueltos,
        bidones_entregados, bidones_devueltos, monto_total, monto_cobrado,
        metodo_pago, observacion
    ) VALUES (
        p_id_reparto, p_id_cliente, p_sifones_entregados, p_sifones_devueltos,
        p_bidones_entregados, p_bidones_devueltos, p_monto_total, p_monto_cobrado,
        p_metodo_pago, p_observacion
    );

    -- 2. Actualizar envases en poder del cliente y deuda
    UPDATE sod_clientes
    SET sifones_prestados = GREATEST(0, sifones_prestados + (p_sifones_entregados - p_sifones_devueltos)),
        bidones_prestados = GREATEST(0, bidones_prestados + (p_bidones_entregados - p_bidones_devueltos)),
        saldo_deudor = saldo_deudor + v_diferencia_deuda
    WHERE id_cliente = p_id_cliente;

    -- 3. Acumular totales en la planilla de reparto
    IF p_metodo_pago = 'EFECTIVO' THEN
        UPDATE sod_repartos SET total_efectivo = total_efectivo + p_monto_cobrado WHERE id_reparto = p_id_reparto;
    ELSIF p_metodo_pago = 'TRANSFERENCIA' THEN
        UPDATE sod_repartos SET total_transferencia = total_transferencia + p_monto_cobrado WHERE id_reparto = p_id_reparto;
    END IF;

    IF v_diferencia_deuda > 0 THEN
        UPDATE sod_repartos SET total_fiado = total_fiado + v_diferencia_deuda WHERE id_reparto = p_id_reparto;
        
        -- Asentar movimiento en cuenta corriente
        INSERT INTO sod_movimientos_cta_cte (id_empresa, id_cliente, tipo, monto, saldo_resultante, descripcion)
        VALUES (v_rep.id_empresa, p_id_cliente, 'DEUDA_REPARTO', v_diferencia_deuda, v_cli.saldo_deudor + v_diferencia_deuda, 'Saldo pendiente en reparto #' || p_id_reparto);
    END IF;

    RETURN jsonb_build_object('ok', true, 'mensaje', 'Entrega asentada con éxito');
END;
$$;

-- C. Cerrar y Rendir Reparto del Chofer
CREATE OR REPLACE FUNCTION pkg_sod_repartos.cerrar_reparto(
    p_id_reparto BIGINT,
    p_sifones_retorno_llenos INT,
    p_sifones_retorno_vacios INT,
    p_bidones_retorno_llenos INT,
    p_bidones_retorno_vacios INT,
    p_observaciones TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rep sod_repartos%ROWTYPE;
BEGIN
    SELECT * INTO v_rep FROM sod_repartos WHERE id_reparto = p_id_reparto;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Reparto no encontrado');
    END IF;

    -- Actualizar planilla final
    UPDATE sod_repartos
    SET estado = 'FINALIZADO',
        sifones_retorno_llenos = p_sifones_retorno_llenos,
        sifones_retorno_vacios = p_sifones_retorno_vacios,
        bidones_retorno_llenos = p_bidones_retorno_llenos,
        bidones_retorno_vacios = p_bidones_retorno_vacios,
        observaciones = p_observaciones,
        cerrado_en = CURRENT_TIMESTAMP
    WHERE id_reparto = p_id_reparto;

    -- Devolver stock a la planta (llenos que no se vendieron + vacíos recolectados)
    UPDATE sod_stock_planta 
    SET llenos = llenos + p_sifones_retorno_llenos,
        vacios = vacios + p_sifones_retorno_vacios
    WHERE id_empresa = v_rep.id_empresa AND tipo_envase = 'SIFON_SODA';

    UPDATE sod_stock_planta 
    SET llenos = llenos + p_bidones_retorno_llenos,
        vacios = vacios + p_bidones_retorno_vacios
    WHERE id_empresa = v_rep.id_empresa AND tipo_envase = 'BIDON_20L';

    RETURN jsonb_build_object('ok', true, 'mensaje', 'Reparto cerrado y stock de planta reconciliado con éxito');
END;
$$;

-- ============================================================================
-- 4. PAQUETE: PKG_SOD_DASHBOARD (Métricas en Tiempo Real)
-- ============================================================================

CREATE OR REPLACE FUNCTION pkg_sod_dashboard.obtener_metricas(p_id_empresa BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_clientes INT;
    v_sifones_en_calle INT;
    v_bidones_en_calle INT;
    v_deuda_total NUMERIC;
    v_ventas_hoy NUMERIC;
    v_stock_planta JSONB;
BEGIN
    -- 1. Totales de clientes y envases en poder de clientes
    SELECT 
        COUNT(*),
        COALESCE(SUM(sifones_prestados), 0),
        COALESCE(SUM(bidones_prestados), 0),
        COALESCE(SUM(saldo_deudor), 0)
    INTO v_total_clientes, v_sifones_en_calle, v_bidones_en_calle, v_deuda_total
    FROM sod_clientes
    WHERE id_empresa = p_id_empresa AND activo = TRUE;

    -- 2. Ventas del día de hoy
    SELECT COALESCE(SUM(monto_cobrado), 0)
    INTO v_ventas_hoy
    FROM sod_reparto_entregas e
    JOIN sod_repartos r ON e.id_reparto = r.id_reparto
    WHERE r.id_empresa = p_id_empresa AND DATE(e.creado_en) = CURRENT_DATE;

    -- 3. Stock en planta
    SELECT jsonb_agg(
        jsonb_build_object(
            'tipo_envase', tipo_envase,
            'llenos', llenos,
            'vacios', vacios,
            'rotos', rotos
        )
    ) INTO v_stock_planta
    FROM sod_stock_planta
    WHERE id_empresa = p_id_empresa;

    RETURN jsonb_build_object(
        'ok', true,
        'metricas', jsonb_build_object(
            'total_clientes', v_total_clientes,
            'sifones_en_calle', v_sifones_en_calle,
            'bidones_en_calle', v_bidones_en_calle,
            'total_deuda_por_cobrar', v_deuda_total,
            'recaudacion_hoy', v_ventas_hoy,
            'stock_planta', COALESCE(v_stock_planta, '[]'::jsonb)
        )
    );
END;
$$;
