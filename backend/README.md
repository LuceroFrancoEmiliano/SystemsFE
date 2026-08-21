# 🚀 Backend Bridge en Node.js (Systems SaaS API Gateway)

Servidor API ultraligero que conecta el cliente web con los paquetes PL/pgSQL en PostgreSQL. **Sin ORMs ni sobrecarga de procesamiento** (<35MB RAM en reposo).

---

## 🛠️ Instalación y Puesta en Marcha

```bash
# 1. Entrar al directorio
cd backend

# 2. Instalar dependencias mínimas (express, pg, cors, dotenv)
npm install

# 3. Configurar variables de entorno (ver .env)
# DATABASE_URL=postgres://usuario:password@localhost:5432/systems_db

# 4. Iniciar en modo desarrollo
npm run dev
```

---

## 📡 Tabla de Endpoints y Paquetes de Base de Datos

| Método | Endpoint | Paquete / Función SQL | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/google` | `pkg_auth.login_google` | Login / Registro con Google OAuth |
| `GET` | `/api/auth/perfil/:id` | `pkg_auth.get_perfil` | Retorna el perfil del usuario |
| `GET` | `/api/sistemas` | `pkg_sistemas.listar_activos` | Catálogo de sistemas en venta |
| `GET` | `/api/sistemas/:id/validar-slug` | `pkg_sistemas.validar_slug` | Valida slug de empresa en tiempo real |
| `POST` | `/api/ventas/checkout` | `pkg_ventas.procesar_compra` | Procesa compra y crea licencia |
| `GET` | `/api/usuarios/:id/licencias` | `pkg_accesos.listar_mis_licencias` | Sistemas comprados por el usuario |
| `POST` | `/api/sso/generate-ticket` | `pkg_sso.generar_ticket` | Genera ticket temporal de salto SSO |
| `POST` | `/api/sso/verify-ticket` | `pkg_sso.canjear_ticket` | Canjea ticket desde sistema secundario |
| `POST` | `/api/admin/sistemas` | `pkg_admin.crear_sistema` | SuperAdmin da de alta nuevo software |
| `GET` | `/api/admin/metricas/:id` | `pkg_admin.obtener_metricas` | Estadísticas globales de ventas |
