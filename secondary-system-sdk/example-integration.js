/**
 * ============================================================================
 * EJEMPLO DE INTEGRACIÓN EN UN SISTEMA SECUNDARIO (ej. Backend de Sodería)
 * ============================================================================
 * Así de fácil es recibir al usuario logueado en tu nuevo sistema.
 */

import express from 'express';
import { SystemsSSOClient } from './ssoClient.js';

const app = express();
const PORT = 4001; // Puerto del sistema de Sodería

// 1. Inicializas el cliente con la clave que te dio el panel Admin
const sso = new SystemsSSOClient({
  mainApiUrl: 'http://localhost:3000/api/sso/verify-ticket',
  apiSecret: 'sec_live_soderia_98a72f1b4c',
});

// 2. Ruta de recepción del ticket SSO
// Cuando el usuario hace clic en "Acceder a mi sistema", el Main lo manda aquí:
app.get('/sso/callback', async (req, res) => {
  const { ticket } = req.query;

  // Verificamos el ticket contra el Main de forma invisible
  const resultado = await sso.verificarTicket(ticket);

  if (!resultado.valido) {
    return res.status(401).send(`Acceso no autorizado: ${resultado.error}`);
  }

  // ¡LISTO! Ya tienes los datos completos del comprador y de su empresa
  const { usuario, empresa } = resultado;

  console.log(`[LOGIN SSO EXITOSO]: Usuario ${usuario.nombre} (${usuario.email}) entrando a empresa "${empresa.nombre_empresa}" (slug: ${empresa.slug})`);

  // Aquí guardas la sesión local (en cookie, JWT local o sesión Express)
  // ej: req.session.user = usuario; req.session.tenant = empresa;

  // Rediriges al usuario directo a su panel de administración
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 40px; background: #0f172a; color: white;">
        <h1>¡Bienvenido a tu Sistema de Sodería!</h1>
        <p><strong>Empresa:</strong> ${empresa.nombre_empresa} (Perfil: ${empresa.slug})</p>
        <p><strong>Usuario Central:</strong> ${usuario.nombre} (${usuario.email})</p>
        <p><strong>Tu Rol:</strong> ${empresa.rol_en_sistema}</p>
        <hr/>
        <p>Sesión iniciada correctamente sin volver a escribir contraseña.</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Sistema Secundario de Prueba corriendo en: http://localhost:${PORT}`);
});
