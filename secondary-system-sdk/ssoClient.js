/**
 * ============================================================================
 * SSO CLIENT HELPER (Para tus Sistemas Secundarios)
 * ============================================================================
 * Copia este archivo dentro de cualquier sistema nuevo que programes (ej. Sodería).
 * No requiere ninguna librería externa pesada, usa `fetch` nativo de Node.js 18+.
 */

export class SystemsSSOClient {
  /**
   * @param {Object} config
   * @param {string} config.mainApiUrl - URL del API central (ej: 'http://localhost:3000/api/sso/verify-ticket')
   * @param {string} config.apiSecret - Clave secreta del sistema generada en el panel Admin
   */
  constructor({ mainApiUrl, apiSecret }) {
    this.mainApiUrl = mainApiUrl || 'http://localhost:3000/api/sso/verify-ticket';
    this.apiSecret = apiSecret;

    if (!this.apiSecret) {
      console.warn('[SSO Client Warning]: apiSecret no ha sido configurado');
    }
  }

  /**
   * Canjea y valida un ticket de un solo uso recibido en la URL
   * @param {string} ticket - El ticket recibido en ?ticket=tk_...
   * @returns {Promise<{valido: boolean, usuario?: object, empresa?: object, error?: string}>}
   */
  async verificarTicket(ticket) {
    if (!ticket) {
      return { valido: false, error: 'Ticket no proporcionado' };
    }

    try {
      const response = await fetch(this.mainApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-System-Secret': this.apiSecret,
        },
        body: JSON.stringify({ ticket, api_secret: this.apiSecret }),
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('[SSO Verification Error]:', err.message);
      return { valido: false, error: 'No se pudo conectar con el Sistema Central' };
    }
  }
}

export default SystemsSSOClient;
