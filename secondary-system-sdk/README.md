# 🔌 SDK de Conexión para Sistemas Secundarios (SSO Handshake)

Cuando programes un nuevo sistema web (ej. Sodería, Gimnasio, Restaurante, etc.) y quieras que los compradores del Sistema Central entren automáticamente con su cuenta y su empresa configurada, solo debes seguir estos 2 pasos:

---

### Paso 1: Copiar `ssoClient.js` a tu nuevo proyecto
Copia el archivo [`ssoClient.js`](file:///c:/Users/elemi/Desktop/Programacion/SystemsFE/secondary-system-sdk/ssoClient.js) dentro de la carpeta `src/services/` de tu sistema secundario.

---

### Paso 2: Crear la ruta de recepción en tu backend secundario

```javascript
import { SystemsSSOClient } from './services/ssoClient.js';

const sso = new SystemsSSOClient({
  mainApiUrl: process.env.MAIN_API_URL || 'http://localhost:3000/api/sso/verify-ticket',
  apiSecret: process.env.SYSTEM_SECRET_KEY, // La clave secreta de este sistema
});

// Ruta que recibe al usuario cuando hace clic en "Acceder" en la tienda
app.get('/sso/callback', async (req, res) => {
  const { ticket } = req.query;

  // 1. Validar el ticket de un solo uso con el sistema central
  const { valido, usuario, empresa, error } = await sso.verificarTicket(ticket);

  if (!valido) {
    return res.status(401).send('Error de autenticación: ' + error);
  }

  // 2. Guardar sesión local de tu sistema
  // usuario = { id_usuario_central, email, nombre }
  // empresa = { id_licencia, nombre_empresa, slug, rol_en_sistema: 'ADMIN_PROPIETARIO' }

  // 3. Redirigir al dashboard de su empresa
  res.redirect(`/app/${empresa.slug}/dashboard`);
});
```

---

### 📦 ¿Cómo maneja este sistema los empleados de la empresa?
El comprador ahora es el **Dueño / Administrador** de `empresa.slug`. Dentro de tu sistema secundario, puedes permitirle agregar empleados directamente en una tabla local de empleados, asociándolos siempre con ese `slug` de empresa.
