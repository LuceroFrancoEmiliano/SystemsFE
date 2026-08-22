/**
 * ============================================================================
 * SERVICIO DE INTEGRACIÓN CON WHATSAPP (Avisos de Reparto & Comprobantes)
 * ============================================================================
 */

export const WhatsAppService = {
  cleanPhone(phone) {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  },

  // 1. Mensaje: Aviso de paso del camión por la zona
  sendAvisoPaso({ clienteNombre, clienteTelefono, empresaNombre, nombreZona, diaReparto }) {
    const phone = this.cleanPhone(clienteTelefono);
    const texto = `Hola ${clienteNombre}! 🚚 Te escribimos de *${empresaNombre}*.\n\nTe avisamos que mañana estaremos pasando con el camión de reparto por tu zona (*${nombreZona || 'tu barrio'}*).\n\n¿Vas a necesitar cajones de soda o bidones de agua? Respondénos por acá para guardártelos! 💧`;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  },

  // 2. Mensaje: Comprobante digital de entrega
  sendComprobanteEntrega({ clienteNombre, clienteTelefono, empresaNombre, sifones, bidones, cobrado, metodo, saldo }) {
    const phone = this.cleanPhone(clienteTelefono);
    const texto = `Hola ${clienteNombre}! 💧 Comprobante de entrega de *${empresaNombre}*:\n\n📦 *Entregado hoy:*\n• Sifones de soda: ${sifones}\n• Bidones de agua: ${bidones}\n\n💵 *Total abonado:* $${Number(cobrado).toFixed(2)} (${metodo})\n📌 *Saldo actual:* $${Number(saldo).toFixed(2)}\n\n¡Muchas gracias por tu compra!`;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }
};
