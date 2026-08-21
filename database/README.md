# 🗄️ Base de Datos & Paquetes PL/pgSQL (Sistema Central)

Esta base de datos contiene **el 100% de la lógica de negocio**, validaciones y generación de respuestas JSON preformateadas. 

---

## ⚡ Estructura de Paquetes (Schemas PL/pgSQL)

| Paquete | Función Principal | Descripción |
| :--- | :--- | :--- |
| **`pkg_auth`** | `login_google(email, nombre, avatar, google_id)` | Registra o logea al usuario y retorna su perfil con roles en JSON. |
| **`pkg_auth`** | `get_perfil(id_usuario)` | Retorna los datos del perfil activo. |
| **`pkg_sistemas`** | `listar_activos()` | Retorna todo el catálogo de sistemas en venta en formato JSON. |
| **`pkg_sistemas`** | `validar_slug(id_sistema, slug)` | Valida en vivo si el nombre de empresa está disponible para ese sistema. |
| **`pkg_ventas`** | `procesar_compra(...)` | Crea la licencia (tenant), asigna el rol de Administrador de Empresa y registra la transacción de pago de forma atómica. |
| **`pkg_accesos`** | `listar_mis_licencias(id_usuario)` | Lista todos los sistemas comprados por el usuario para su biblioteca. |
| **`pkg_accesos`** | `verificar_acceso(id_user, id_sist, slug)` | Retorna un booleano ultra rápido sobre si un usuario tiene acceso a ese perfil. |
| **`pkg_sso`** | `generar_ticket(id_usuario, id_licencia)` | Genera un token seguro de un solo uso (TTL 60s) para saltar al sistema secundario. |
| **`pkg_sso`** | `canjear_ticket(ticket, api_secret)` | Valida el ticket, quema el token, autentica al backend secundario con su `api_secret` y le devuelve los datos de la empresa y del usuario. |
| **`pkg_admin`** | `crear_sistema(...)` | Permite al SuperAdmin dar de alta nuevos productos sin tocar código. |
| **`pkg_admin`** | `obtener_metricas(admin_id)` | Retorna ingresos totales, licencias activas y usuarios. |

---

## 🚀 Cómo ejecutar en PostgreSQL

### Opción A: Con 1 solo comando (psql)
```bash
# Crear la base de datos si no existe
createdb -U postgres systems_db

# Ejecutar el script maestro
psql -U postgres -d systems_db -f database/init_all.sql
```

### Opción B: Desde pgAdmin / DBeaver / DataGrip
1. Abre tu cliente SQL favorito conectado a PostgreSQL.
2. Abre y ejecuta `01_schema.sql`.
3. Abre y ejecuta `02_packages.sql`.
4. Abre y ejecuta `03_seed_data.sql`.

---

## 💡 ¿Cómo llama el Backend de Node.js a estos paquetes?

Dado que los paquetes devuelven `jsonb` directamente, el código de Node.js es una **simple línea sin procesar nada**:

```javascript
// Ejemplo en Node.js (Express o Fastify)
app.get('/api/sistemas', async (req, res) => {
  const result = await db.query('SELECT pkg_sistemas.listar_activos() as data');
  res.json(result.rows[0].data); // Directo, ultra veloz (<2ms), 0 uso de RAM
});
```
