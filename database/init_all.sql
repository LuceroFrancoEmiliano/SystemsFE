-- ============================================================================
-- SCRIPT MAESTRO: EJECUTAR TODO EN UN SOLO PASO
-- ============================================================================
-- Este script ejecuta secuencialmente:
-- 1. 01_schema.sql (Tablas e Índices)
-- 2. 02_packages.sql (Paquetes PL/pgSQL con toda la lógica de negocio)
-- 3. 03_seed_data.sql (Datos iniciales de SuperAdmin, Catálogo y Demo)
-- ============================================================================

\i 01_schema.sql
\i 02_packages.sql
\i 03_seed_data.sql

SELECT '¡Base de Datos del Sistema de Sistemas inicializada con éxito!' AS resultado;
