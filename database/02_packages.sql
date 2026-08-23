-- ============================================================================
-- SISTEMA DE SISTEMAS (SaaS Central Hub & SSO)
-- Archivo: 02_packages.sql
-- Motor: PostgreSQL (Funciones PL/pgSQL organizadas en Schemas / Paquetes)
-- ============================================================================

-- Creación de los Schemas (Equivalente a Paquetes en PostgreSQL)
CREATE SCHEMA IF NOT EXISTS pkg_auth;
CREATE SCHEMA IF NOT EXISTS pkg_sistemas;
CREATE SCHEMA IF NOT EXISTS pkg_ventas;
CREATE SCHEMA IF NOT EXISTS pkg_accesos;
CREATE SCHEMA IF NOT EXISTS pkg_sso;
CREATE SCHEMA IF NOT EXISTS pkg_admin;

-- ============================================================================
-- PAQUETE: PKG_AUTH (Autenticación y Cuentas)
-- ============================================================================

-- 1. Login o Registro Automático con Google
CREATE OR REPLACE FUNCTION pkg_auth.login_google(
    p_email VARCHAR,
    p_nombre VARCHAR,
    p_avatar TEXT,
    p_google_id VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user usuarios%ROWTYPE;
BEGIN
    -- Validaciones básicas
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'El email es obligatorio');
    END IF;

    -- Buscar usuario por google_id o por email
    SELECT * INTO v_user FROM usuarios 
    WHERE google_id = p_google_id OR email = LOWER(TRIM(p_email));

    IF FOUND THEN
        -- Actualizar último acceso / datos si cambiaron
        UPDATE usuarios 
        SET nombre = COALESCE(NULLIF(p_nombre, ''), nombre),
            avatar_url = COALESCE(NULLIF(p_avatar, ''), avatar_url),
            google_id = COALESCE(usuarios.google_id, p_google_id),
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id_usuario = v_user.id_usuario
        RETURNING * INTO v_user;
    ELSE
        -- Registrar nuevo usuario
        INSERT INTO usuarios (email, nombre, avatar_url, google_id, rol_global)
        VALUES (LOWER(TRIM(p_email)), COALESCE(p_nombre, 'Usuario'), COALESCE(p_avatar, ''), p_google_id, 'USER')
        RETURNING * INTO v_user;
    END IF;

    IF NOT v_user.activo THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Cuenta deshabilitada');
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'usuario', jsonb_build_object(
            'id_usuario', v_user.id_usuario,
            'email', v_user.email,
            'nombre', v_user.nombre,
            'avatar_url', v_user.avatar_url,
            'rol_global', v_user.rol_global
        )
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- 2. Login con Email y Contraseña (Bcrypt seguro con pgcrypto)
CREATE OR REPLACE FUNCTION pkg_auth.login_password(
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user usuarios%ROWTYPE;
BEGIN
    IF p_email IS NULL OR p_password IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Email y contraseña son requeridos');
    END IF;

    SELECT * INTO v_user FROM usuarios 
    WHERE email = LOWER(TRIM(p_email)) AND activo = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Credenciales no válidas');
    END IF;

    IF v_user.password_hash IS NULL OR v_user.password_hash = '' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Esta cuenta no tiene contraseña configurada. Inicia sesión con Google o asigna una contraseña.');
    END IF;

    -- Validar hash con crypt de pgcrypto
    IF v_user.password_hash <> crypt(p_password, v_user.password_hash) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Contraseña incorrecta');
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'usuario', jsonb_build_object(
            'id_usuario', v_user.id_usuario,
            'email', v_user.email,
            'nombre', v_user.nombre,
            'avatar_url', v_user.avatar_url,
            'rol_global', v_user.rol_global
        )
    );
END;
$$;

-- 3. Asignar o Cambiar Contraseña de Usuario
CREATE OR REPLACE FUNCTION pkg_auth.set_password(
    p_id_usuario BIGINT,
    p_new_password VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_hash TEXT;
BEGIN
    IF LENGTH(p_new_password) < 6 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'La contraseña debe tener al menos 6 caracteres');
    END IF;

    -- Hashear con algoritmo Blowfish (Bcrypt) de 10 rondas
    v_hash := crypt(p_new_password, gen_salt('bf', 10));

    UPDATE usuarios 
    SET password_hash = v_hash,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE id_usuario = p_id_usuario;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Usuario no encontrado');
    END IF;

    RETURN jsonb_build_object('ok', true, 'mensaje', 'Contraseña actualizada con éxito');
END;
$$;

-- 4. Registrar Nuevo Usuario (Sign Up)
CREATE OR REPLACE FUNCTION pkg_auth.registrar_usuario(
    p_nombre VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR,
    p_telefono VARCHAR DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_email VARCHAR;
    v_hash TEXT;
    v_new_user usuarios%ROWTYPE;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));

    IF v_clean_email IS NULL OR v_clean_email = '' OR p_password IS NULL OR p_password = '' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'El email y la contraseña son requeridos');
    END IF;

    IF LENGTH(p_password) < 6 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'La contraseña debe tener al menos 6 caracteres');
    END IF;

    IF EXISTS(SELECT 1 FROM usuarios WHERE email = v_clean_email) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Ya existe una cuenta registrada con este correo electrónico');
    END IF;

    -- Hashear contraseña
    v_hash := crypt(p_password, gen_salt('bf', 10));

    INSERT INTO usuarios (
        email, nombre, password_hash, telefono,
        avatar_url, rol_global, activo
    ) VALUES (
        v_clean_email,
        COALESCE(TRIM(p_nombre), 'Usuario'),
        v_hash,
        COALESCE(p_telefono, ''),
        'https://api.dicebear.com/7.x/bottts/svg?seed=' || v_clean_email,
        'USER',
        TRUE
    ) RETURNING * INTO v_new_user;

    RETURN jsonb_build_object(
        'ok', true,
        'mensaje', 'Cuenta creada con éxito',
        'usuario', jsonb_build_object(
            'id_usuario', v_new_user.id_usuario,
            'email', v_new_user.email,
            'nombre', v_new_user.nombre,
            'avatar_url', v_new_user.avatar_url,
            'rol_global', v_new_user.rol_global
        )
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- 2. Obtener Perfil del Usuario
CREATE OR REPLACE FUNCTION pkg_auth.get_perfil(p_id_usuario BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_user usuarios%ROWTYPE;
BEGIN
    SELECT * INTO v_user FROM usuarios WHERE id_usuario = p_id_usuario AND activo = TRUE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Usuario no encontrado');
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'usuario', jsonb_build_object(
            'id_usuario', v_user.id_usuario,
            'email', v_user.email,
            'nombre', v_user.nombre,
            'avatar_url', v_user.avatar_url,
            'rol_global', v_user.rol_global,
            'creado_en', v_user.creado_en
        )
    );
END;
$$;

-- ============================================================================
-- PAQUETE: PKG_SISTEMAS (Catálogo Público y Verificaciones)
-- ============================================================================

-- 1. Listar Catálogo Activo
CREATE OR REPLACE FUNCTION pkg_sistemas.listar_activos()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_sistema', s.id_sistema,
            'codigo', s.codigo,
            'titulo', s.titulo,
            'descripcion', s.descripcion,
            'descripcion_corta', s.descripcion_corta,
            'precio', s.precio,
            'moneda', s.moneda,
            'url_base', s.url_base,
            'icono', s.icono,
            'banner_url', s.banner_url,
            'caracteristicas', s.caracteristicas
        ) ORDER BY s.id_sistema ASC
    ), '[]'::jsonb)
    INTO v_result
    FROM sistemas s
    WHERE s.activo = TRUE;

    RETURN jsonb_build_object('ok', true, 'sistemas', v_result);
END;
$$;

-- 2. Validar Disponibilidad de Nombre de Empresa / Slug
CREATE OR REPLACE FUNCTION pkg_sistemas.validar_slug(
    p_id_sistema BIGINT,
    p_slug VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_slug_limpio VARCHAR;
    v_existe BOOLEAN;
BEGIN
    -- Limpiar slug: minúsculas, reemplazar espacios y caracteres especiales
    v_slug_limpio := LOWER(REGEXP_REPLACE(TRIM(p_slug), '[^a-zA-Z0-9\-]', '-', 'g'));
    v_slug_limpio := REGEXP_REPLACE(v_slug_limpio, '-+', '-', 'g');
    v_slug_limpio := TRIM(BOTH '-' FROM v_slug_limpio);

    IF LENGTH(v_slug_limpio) < 3 THEN
        RETURN jsonb_build_object('ok', false, 'disponible', false, 'error', 'El nombre debe tener al menos 3 caracteres.');
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM licencias 
        WHERE id_sistema = p_id_sistema AND slug_empresa = v_slug_limpio
    ) INTO v_existe;

    IF v_existe THEN
        RETURN jsonb_build_object(
            'ok', true,
            'disponible', false,
            'slug', v_slug_limpio,
            'mensaje', 'El nombre de empresa ya está en uso para este sistema.'
        );
    ELSE
        RETURN jsonb_build_object(
            'ok', true,
            'disponible', true,
            'slug', v_slug_limpio,
            'mensaje', 'Nombre disponible.'
        );
    END IF;
END;
$$;

-- ============================================================================
-- PAQUETE: PKG_VENTAS (Procesamiento de Compras y Creación de Licencias)
-- ============================================================================

CREATE OR REPLACE FUNCTION pkg_ventas.procesar_compra(
    p_id_usuario BIGINT,
    p_id_sistema BIGINT,
    p_nombre_empresa VARCHAR,
    p_slug_empresa VARCHAR,
    p_metodo_pago VARCHAR,
    p_referencia_pago VARCHAR,
    p_monto NUMERIC DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sistema sistemas%ROWTYPE;
    v_usuario usuarios%ROWTYPE;
    v_slug_final VARCHAR;
    v_monto_final NUMERIC;
    v_id_licencia BIGINT;
    v_id_transaccion BIGINT;
BEGIN
    -- 1. Validar Usuario
    SELECT * INTO v_usuario FROM usuarios WHERE id_usuario = p_id_usuario AND activo = TRUE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Usuario no válido');
    END IF;

    -- 2. Validar Sistema
    SELECT * INTO v_sistema FROM sistemas WHERE id_sistema = p_id_sistema AND activo = TRUE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'El sistema solicitado no existe o no está activo');
    END IF;

    -- 3. Limpiar y Validar Slug
    v_slug_final := LOWER(REGEXP_REPLACE(TRIM(COALESCE(p_slug_empresa, p_nombre_empresa)), '[^a-zA-Z0-9\-]', '-', 'g'));
    v_slug_final := REGEXP_REPLACE(v_slug_final, '-+', '-', 'g');
    v_slug_final := TRIM(BOTH '-' FROM v_slug_final);

    IF LENGTH(v_slug_final) < 2 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Nombre de empresa no válido');
    END IF;

    -- Validar si ya existe ese slug para el sistema
    IF EXISTS(SELECT 1 FROM licencias WHERE id_sistema = p_id_sistema AND slug_empresa = v_slug_final) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'El nombre de empresa ya está ocupado en este sistema. Por favor elija otro.');
    END IF;

    v_monto_final := COALESCE(p_monto, v_sistema.precio);

    -- 4. Crear la Licencia (Tenant / Empresa del Comprador)
    INSERT INTO licencias (
        id_usuario,
        id_sistema,
        nombre_empresa,
        slug_empresa,
        rol_en_sistema,
        estado,
        fecha_compra
    ) VALUES (
        p_id_usuario,
        p_id_sistema,
        TRIM(p_nombre_empresa),
        v_slug_final,
        'ADMIN_PROPIETARIO',
        'ACTIVA',
        CURRENT_TIMESTAMP
    )
    RETURNING id_licencia INTO v_id_licencia;

    -- 5. Registrar la Transacción
    INSERT INTO transacciones (
        id_usuario,
        id_sistema,
        id_licencia,
        monto,
        moneda,
        metodo_pago,
        referencia_externa,
        estado
    ) VALUES (
        p_id_usuario,
        p_id_sistema,
        v_id_licencia,
        v_monto_final,
        v_sistema.moneda,
        COALESCE(p_metodo_pago, 'MERCADO_PAGO'),
        COALESCE(p_referencia_pago, 'TX-' || gen_random_uuid()::text),
        'APROBADO'
    )
    RETURNING id_transaccion INTO v_id_transaccion;

    RETURN jsonb_build_object(
        'ok', true,
        'mensaje', 'Compra procesada exitosamente. Tu sistema está listo.',
        'licencia', jsonb_build_object(
            'id_licencia', v_id_licencia,
            'id_sistema', v_sistema.id_sistema,
            'sistema_titulo', v_sistema.titulo,
            'nombre_empresa', TRIM(p_nombre_empresa),
            'slug_empresa', v_slug_final,
            'rol_en_sistema', 'ADMIN_PROPIETARIO',
            'url_base', v_sistema.url_base,
            'estado', 'ACTIVA'
        ),
        'id_transaccion', v_id_transaccion
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- PAQUETE: PKG_ACCESOS (Biblioteca del Usuario y Verificaciones)
-- ============================================================================

-- 1. Listar todas las licencias de un usuario (Mis Sistemas Comprados)
CREATE OR REPLACE FUNCTION pkg_accesos.listar_mis_licencias(p_id_usuario BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_licencia', l.id_licencia,
            'id_sistema', s.id_sistema,
            'titulo_sistema', s.titulo,
            'codigo_sistema', s.codigo,
            'icono', s.icono,
            'nombre_empresa', l.nombre_empresa,
            'slug_empresa', l.slug_empresa,
            'rol_en_sistema', l.rol_en_sistema,
            'estado', l.estado,
            'url_base', s.url_base,
            'fecha_compra', l.fecha_compra
        ) ORDER BY l.fecha_compra DESC
    ), '[]'::jsonb)
    INTO v_result
    FROM licencias l
    JOIN sistemas s ON l.id_sistema = s.id_sistema
    WHERE l.id_usuario = p_id_usuario AND l.estado = 'ACTIVA';

    RETURN jsonb_build_object('ok', true, 'licencias', v_result);
END;
$$;

-- 2. Verificación booleana ultra rápida de acceso
CREATE OR REPLACE FUNCTION pkg_accesos.verificar_acceso(
    p_id_usuario BIGINT,
    p_id_sistema BIGINT,
    p_slug_empresa VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_licencia licencias%ROWTYPE;
BEGIN
    SELECT * INTO v_licencia
    FROM licencias
    WHERE id_usuario = p_id_usuario 
      AND id_sistema = p_id_sistema 
      AND slug_empresa = LOWER(p_slug_empresa)
      AND estado = 'ACTIVA';

    IF FOUND THEN
        RETURN jsonb_build_object(
            'ok', true,
            'tiene_acceso', true,
            'rol', v_licencia.rol_en_sistema,
            'id_licencia', v_licencia.id_licencia
        );
    ELSE
        RETURN jsonb_build_object(
            'ok', true,
            'tiene_acceso', false,
            'mensaje', 'No posee licencia activa para este perfil'
        );
    END IF;
END;
$$;

-- ============================================================================
-- PAQUETE: PKG_SSO (Protocolo Handshake para Conexión de Sistemas Secundarios)
-- ============================================================================

-- 1. Generar Ticket de Un Solo Uso (Desde el Sistema Central)
CREATE OR REPLACE FUNCTION pkg_sso.generar_ticket(
    p_id_usuario BIGINT,
    p_id_licencia BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ticket VARCHAR(80);
    v_licencia licencias%ROWTYPE;
    v_sistema sistemas%ROWTYPE;
    v_expira TIMESTAMPTZ;
BEGIN
    -- Validar que la licencia pertenezca al usuario y esté activa
    SELECT * INTO v_licencia 
    FROM licencias 
    WHERE id_licencia = p_id_licencia AND id_usuario = p_id_usuario AND estado = 'ACTIVA';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Licencia no válida o inactiva');
    END IF;

    SELECT * INTO v_sistema FROM sistemas WHERE id_sistema = v_licencia.id_sistema;

    -- Generar Ticket seguro aleatorio
    v_ticket := 'tk_' || encode(gen_random_bytes(24), 'hex');
    v_expira := CURRENT_TIMESTAMP + INTERVAL '60 seconds'; -- TTL de 60 segundos

    -- Guardar Ticket
    INSERT INTO sso_tickets (ticket, id_usuario, id_licencia, expira_en)
    VALUES (v_ticket, p_id_usuario, p_id_licencia, v_expira);

    RETURN jsonb_build_object(
        'ok', true,
        'ticket', v_ticket,
        'expira_en', v_expira,
        'redirect_url', v_sistema.url_base || '/sso/callback?ticket=' || v_ticket,
        'slug_empresa', v_licencia.slug_empresa,
        'nombre_empresa', v_licencia.nombre_empresa
    );
END;
$$;

-- 2. Canjear y Validar Ticket (Llamado por el Backend del Sistema Secundario)
CREATE OR REPLACE FUNCTION pkg_sso.canjear_ticket(
    p_ticket VARCHAR,
    p_api_secret VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ticket_rec sso_tickets%ROWTYPE;
    v_usuario usuarios%ROWTYPE;
    v_licencia licencias%ROWTYPE;
    v_sistema sistemas%ROWTYPE;
BEGIN
    -- 1. Buscar Ticket
    SELECT * INTO v_ticket_rec FROM sso_tickets WHERE ticket = p_ticket;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'valido', false, 'error', 'Ticket inexistente');
    END IF;

    -- 2. Validar que no haya sido usado
    IF v_ticket_rec.usado THEN
        RETURN jsonb_build_object('ok', false, 'valido', false, 'error', 'El ticket ya fue canjeado previamente');
    END IF;

    -- 3. Validar Expiración
    IF CURRENT_TIMESTAMP > v_ticket_rec.expira_en THEN
        RETURN jsonb_build_object('ok', false, 'valido', false, 'error', 'El ticket ha expirado (TTL 60s superado)');
    END IF;

    -- 4. Obtener Licencia y Sistema
    SELECT * INTO v_licencia FROM licencias WHERE id_licencia = v_ticket_rec.id_licencia;
    SELECT * INTO v_sistema FROM sistemas WHERE id_sistema = v_licencia.id_sistema;

    -- 5. Validar que el API SECRET del sistema secundario coincida
    IF v_sistema.api_secret <> p_api_secret THEN
        RETURN jsonb_build_object('ok', false, 'valido', false, 'error', 'Clave de seguridad de sistema no válida (Unauthorized)');
    END IF;

    -- 6. Obtener Datos del Usuario
    SELECT * INTO v_usuario FROM usuarios WHERE id_usuario = v_ticket_rec.id_usuario;

    -- 7. Quemar el ticket (un solo uso)
    UPDATE sso_tickets SET usado = TRUE WHERE ticket = p_ticket;

    -- 8. Devolver Payload Completo para que el sistema secundario inicie sesión
    RETURN jsonb_build_object(
        'ok', true,
        'valido', true,
        'usuario', jsonb_build_object(
            'id_usuario_central', v_usuario.id_usuario,
            'email', v_usuario.email,
            'nombre', v_usuario.nombre,
            'avatar_url', v_usuario.avatar_url
        ),
        'empresa', jsonb_build_object(
            'id_licencia', v_licencia.id_licencia,
            'nombre_empresa', v_licencia.nombre_empresa,
            'slug', v_licencia.slug_empresa,
            'rol_en_sistema', v_licencia.rol_en_sistema,
            'estado_licencia', v_licencia.estado
        )
    );
END;
$$;

-- ============================================================================
-- PAQUETE: PKG_ADMIN (Panel SuperAdmin - Franco)
-- ============================================================================

-- 1. Crear nuevo sistema al catálogo
CREATE OR REPLACE FUNCTION pkg_admin.crear_sistema(
    p_admin_id BIGINT,
    p_codigo VARCHAR,
    p_titulo VARCHAR,
    p_descripcion TEXT,
    p_descripcion_corta VARCHAR,
    p_precio NUMERIC,
    p_url_base TEXT,
    p_api_secret VARCHAR DEFAULT NULL,
    p_icono VARCHAR DEFAULT 'box',
    p_caracteristicas JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin usuarios%ROWTYPE;
    v_secret VARCHAR;
    v_id_sistema BIGINT;
BEGIN
    -- Validar que el usuario sea SuperAdmin
    SELECT * INTO v_admin FROM usuarios WHERE id_usuario = p_admin_id AND rol_global = 'ADMIN';
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Acceso denegado: Se requieren permisos de SuperAdmin');
    END IF;

    -- Generar Secret si no se proveyó
    v_secret := COALESCE(p_api_secret, 'sec_' || encode(gen_random_bytes(20), 'hex'));

    INSERT INTO sistemas (
        codigo, titulo, descripcion, descripcion_corta, 
        precio, url_base, api_secret, icono, caracteristicas
    ) VALUES (
        LOWER(TRIM(p_codigo)), TRIM(p_titulo), TRIM(p_descripcion), TRIM(p_descripcion_corta),
        p_precio, TRIM(p_url_base), v_secret, p_icono, p_caracteristicas
    )
    RETURNING id_sistema INTO v_id_sistema;

    RETURN jsonb_build_object(
        'ok', true,
        'mensaje', 'Sistema agregado exitosamente al catálogo',
        'sistema', jsonb_build_object(
            'id_sistema', v_id_sistema,
            'codigo', LOWER(TRIM(p_codigo)),
            'titulo', TRIM(p_titulo),
            'precio', p_precio,
            'url_base', TRIM(p_url_base),
            'api_secret', v_secret
        )
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- 2. Listar Clientes que compraron sistemas y si los están usando
CREATE OR REPLACE FUNCTION pkg_admin.listar_compradores_y_uso(p_admin_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_admin usuarios%ROWTYPE;
    v_result JSONB;
BEGIN
    SELECT * INTO v_admin FROM usuarios WHERE id_usuario = p_admin_id AND rol_global = 'ADMIN';
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Acceso denegado: Se requieren permisos de SuperAdmin');
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_licencia', l.id_licencia,
            'cliente_nombre', u.nombre,
            'cliente_email', u.email,
            'cliente_avatar', u.avatar_url,
            'sistema_titulo', s.titulo,
            'sistema_codigo', s.codigo,
            'nombre_empresa', l.nombre_empresa,
            'slug_empresa', l.slug_empresa,
            'estado_licencia', l.estado,
            'fecha_compra', l.fecha_compra,
            'ultimo_acceso', (
                SELECT MAX(t.creado_en) 
                FROM sso_tickets t 
                WHERE t.id_licencia = l.id_licencia
            ),
            'en_uso', EXISTS(
                SELECT 1 FROM sso_tickets t 
                WHERE t.id_licencia = l.id_licencia 
                  AND t.creado_en > (CURRENT_TIMESTAMP - INTERVAL '30 days')
            )
        ) ORDER BY l.fecha_compra DESC
    ), '[]'::jsonb)
    INTO v_result
    FROM licencias l
    JOIN usuarios u ON l.id_usuario = u.id_usuario
    JOIN sistemas s ON l.id_sistema = s.id_sistema;

    RETURN jsonb_build_object(
        'ok', true,
        'compradores', v_result
    );
END;
$$;

-- 3. Actualizar Datos o Precio de un Sistema Existente
CREATE OR REPLACE FUNCTION pkg_admin.actualizar_sistema(
    p_admin_id BIGINT,
    p_id_sistema BIGINT,
    p_precio NUMERIC,
    p_titulo VARCHAR DEFAULT NULL,
    p_descripcion_corta VARCHAR DEFAULT NULL,
    p_url_base VARCHAR DEFAULT NULL,
    p_activo BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin usuarios%ROWTYPE;
BEGIN
    SELECT * INTO v_admin FROM usuarios WHERE id_usuario = p_admin_id AND rol_global = 'ADMIN';
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Acceso denegado: Se requieren permisos de SuperAdmin');
    END IF;

    UPDATE sistemas
    SET 
        precio = COALESCE(p_precio, precio),
        titulo = COALESCE(p_titulo, titulo),
        descripcion_corta = COALESCE(p_descripcion_corta, descripcion_corta),
        url_base = COALESCE(p_url_base, url_base),
        activo = COALESCE(p_activo, activo),
        actualizado_en = CURRENT_TIMESTAMP
    WHERE id_sistema = p_id_sistema;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Sistema no encontrado');
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'mensaje', 'Sistema actualizado con éxito',
        'sistema', (SELECT row_to_json(s) FROM sistemas s WHERE s.id_sistema = p_id_sistema)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;
