-- ============================================================================
-- SISTEMA DE SISTEMAS (SaaS Central Hub & SSO)
-- Archivo: 03_seed_data.sql
-- Datos iniciales limpios (Únicamente la cuenta SuperAdmin de Franco)
-- ============================================================================

-- 1. Crear Usuario SuperAdmin (Tú / Franco)
INSERT INTO usuarios (id_usuario, email, nombre, avatar_url, google_id, rol_global, activo)
VALUES 
(1, 'franco.admin@systems.com', 'Franco (SuperAdmin)', 'https://api.dicebear.com/7.x/bottts/svg?seed=FrancoAdmin', 'google_admin_001', 'ADMIN', TRUE)
ON CONFLICT (email) DO UPDATE SET rol_global = 'ADMIN';

-- Ajustar la secuencia de IDs de usuarios
SELECT setval('usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios));
