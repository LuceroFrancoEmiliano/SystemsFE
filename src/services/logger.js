/**
 * ============================================================================
 * LOGGER PROFESIONAL DE EVENTOS, MÉTODOS Y CÓDIGOS HTTP PARA CONSOLA
 * ============================================================================
 */

const STYLES = {
  ROUTER: 'background: #2563eb; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  AUTH: 'background: #7c3aed; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  ADMIN: 'background: #e11d48; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  VENTAS: 'background: #059669; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  SSO: 'background: #0891b2; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  STATUS_OK: 'color: #10b981; font-weight: bold;',
  STATUS_ERR: 'color: #ef4444; font-weight: bold;',
  INFO: 'color: #64748b;'
};

export const Logger = {
  navigate(viewName) {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    console.log(
      `%c[NAVEGACIÓN]%c [${timestamp}] Método: GET /view/%c${viewName}%c | Código: %c200 OK`,
      STYLES.ROUTER,
      STYLES.INFO,
      'color: #2563eb; font-weight: bold;',
      STYLES.INFO,
      STYLES.STATUS_OK
    );
  },

  loginSuccess(user, method = 'POST /api/auth/login-password') {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    console.log(
      `%c[AUTH - LOGIN]%c [${timestamp}] Método: %c${method}%c | Código: %c200 OK%c | Usuario: ${user.nombre} (${user.rol_global})`,
      STYLES.AUTH,
      STYLES.INFO,
      'color: #7c3aed; font-weight: bold;',
      STYLES.INFO,
      STYLES.STATUS_OK,
      STYLES.INFO
    );
  },

  loginError(error, email) {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    console.warn(
      `%c[AUTH - ERROR]%c [${timestamp}] Método: POST /api/auth/login-password | Código: %c401 UNAUTHORIZED%c | Falló intento para: ${email} -> ${error}`,
      STYLES.AUTH,
      STYLES.INFO,
      STYLES.STATUS_ERR,
      STYLES.INFO
    );
  },

  logout() {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    console.log(
      `%c[AUTH - LOGOUT]%c [${timestamp}] Método: %cPOST /api/auth/logout%c | Código: %c200 OK%c | Sesión cerrada y redirigido a inicio`,
      STYLES.AUTH,
      STYLES.INFO,
      'color: #e11d48; font-weight: bold;',
      STYLES.INFO,
      STYLES.STATUS_OK,
      STYLES.INFO
    );
  },

  createSystem(system) {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    console.log(
      `%c[SUPERADMIN - SISTEMA]%c [${timestamp}] Método: %cPOST /api/sistemas/crear%c | Código: %c201 CREATED%c | Publicado: ${system.titulo} ($${system.precio} USD)`,
      STYLES.ADMIN,
      STYLES.INFO,
      'color: #e11d48; font-weight: bold;',
      STYLES.INFO,
      STYLES.STATUS_OK,
      STYLES.INFO
    );
  },

  buySystem(licencia, systemTitle) {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    console.log(
      `%c[VENTAS - CHECKOUT]%c [${timestamp}] Método: %cPOST /api/ventas/comprar%c | Código: %c200 OK%c | Licencia generada para: "${licencia.nombre_empresa}" (Subdominio: ${licencia.slug_empresa}.misistema.com) en ${systemTitle}`,
      STYLES.VENTAS,
      STYLES.INFO,
      'color: #059669; font-weight: bold;',
      STYLES.INFO,
      STYLES.STATUS_OK,
      STYLES.INFO
    );
  },

  ssoLaunch(ticket, systemTitle, companyName) {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    console.log(
      `%c[SSO HANDSHAKE]%c [${timestamp}] Método: %cPOST /api/sso/generar-ticket%c | Código: %c200 OK%c | Ticket: ${ticket.substring(0, 14)}... -> Redirigiendo a ${companyName} en ${systemTitle}`,
      STYLES.SSO,
      STYLES.INFO,
      'color: #0891b2; font-weight: bold;',
      STYLES.INFO,
      STYLES.STATUS_OK,
      STYLES.INFO
    );
  }
};
