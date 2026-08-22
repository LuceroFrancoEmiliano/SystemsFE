/**
 * ============================================================================
 * CLIENTE SSO PARA SODERÍA CLOUD PRO
 * Valida tickets con el Sistema Central (Main Hub) y ejecuta sso_handshake en BD
 * ============================================================================
 */

import { callPackage } from '../db.js';

export class SoderiaSSOClient {
  constructor(config = {}) {
    this.mainApiUrl = config.mainApiUrl || process.env.MAIN_HUB_URL || 'http://localhost:3000';
    this.apiSecret = config.apiSecret || process.env.SYSTEM_SECRET || 'sec_soderia_live_2026';
  }

  async verifyAndProvisionTicket(ticket) {
    if (!ticket) {
      return { valido: false, error: 'Ticket no proporcionado' };
    }

    try {
      // 1. Validar ticket con el Sistema Central
      const response = await fetch(`${this.mainApiUrl}/api/sso/verify-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-System-Secret': this.apiSecret
        },
        body: JSON.stringify({
          ticket,
          api_secret: this.apiSecret
        })
      });

      const data = await response.json();

      if (!data.valido) {
        return { valido: false, error: data.error || 'Ticket inválido o expirado' };
      }

      // 2. Ejecutar Handshake en la base de datos de Sodería (Auto-provisionamiento)
      const handshake = await callPackage('pkg_sod_auth.sso_handshake', [
        data.licencia.slug_empresa,
        data.licencia.nombre_empresa,
        data.usuario.email,
        data.usuario.nombre
      ]);

      if (!handshake.ok) {
        return { valido: false, error: handshake.error };
      }

      return {
        valido: true,
        empresa: handshake.empresa,
        usuario: handshake.usuario
      };
    } catch (error) {
      console.error('[SSO Handshake Error]:', error.message);
      return { valido: false, error: 'Error de comunicación con el Sistema Central' };
    }
  }
}

export const ssoClient = new SoderiaSSOClient();
