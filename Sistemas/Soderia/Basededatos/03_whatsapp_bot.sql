-- ============================================================================
-- MÓDULO BOT DE WHATSAPP Y PEDIDOS AUTOMATIZADOS (SODERIA CLOUD PRO)
-- Archivo: 03_whatsapp_bot.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS sod_pedidos_whatsapp (
    id_pedido BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL REFERENCES sod_empresas(id_empresa) ON DELETE CASCADE,
    id_cliente BIGINT NOT NULL REFERENCES sod_clientes(id_cliente) ON DELETE CASCADE,
    fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    mensaje_cliente TEXT NOT NULL,
    sifones_solicitados INT NOT NULL DEFAULT 0,
    bidones_solicitados INT NOT NULL DEFAULT 0,
    monto_estimado NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'CONFIRMADO', -- 'CONFIRMADO', 'NO_NECESITA', 'CONSULTA'
    respuesta_bot TEXT DEFAULT '',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sod_pedidos_wa_cliente ON sod_pedidos_whatsapp(id_cliente);
CREATE INDEX IF NOT EXISTS idx_sod_pedidos_wa_fecha ON sod_pedidos_whatsapp(id_empresa, fecha_entrega);

CREATE SCHEMA IF NOT EXISTS pkg_sod_whatsapp;

-- Registrar pedido entrante interpretado por el Bot
CREATE OR REPLACE FUNCTION pkg_sod_whatsapp.registrar_pedido_bot(
    p_id_empresa BIGINT,
    p_id_cliente BIGINT,
    p_mensaje TEXT,
    p_sifones INT,
    p_bidones INT,
    p_monto NUMERIC,
    p_estado VARCHAR,
    p_respuesta TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id BIGINT;
BEGIN
    INSERT INTO sod_pedidos_whatsapp (
        id_empresa, id_cliente, mensaje_cliente, sifones_solicitados,
        bidones_solicitados, monto_estimado, estado, respuesta_bot
    ) VALUES (
        p_id_empresa, p_id_cliente, p_mensaje, p_sifones,
        p_bidones, p_monto, p_estado, p_respuesta
    ) RETURNING id_pedido INTO v_id;

    RETURN jsonb_build_object('ok', true, 'id_pedido', v_id, 'mensaje', 'Pedido procesado y guardado en base de datos');
END;
$$;
