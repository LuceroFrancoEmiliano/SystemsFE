/**
 * ============================================================================
 * MOTOR INTELIGENTE DE BOT DE WHATSAPP (SODERÍA CLOUD PRO)
 * Procesa mensajes en lenguaje natural de clientes y extrae pedidos de soda/agua
 * ============================================================================
 */

export const WhatsAppBotEngine = {
  // Precios base por defecto (o de la empresa)
  PRECIO_CAJON_SODA: 2400, // 6 sifones
  PRECIO_SIFON_INDIVIDUAL: 400,
  PRECIO_BIDON_20L: 2800,

  // Interpretar mensaje de texto enviado por el cliente
  parseIncomingMessage(text, cliente) {
    if (!text || typeof text !== 'string') {
      return {
        intent: 'DESCONOCIDO',
        sifones: 0,
        bidones: 0,
        monto: 0,
        respuesta: 'Disculpa, no entendí tu mensaje. Puedes responder por ejemplo: "Quiero 2 sifones y 1 bidón" o "Esta semana no necesito".'
      };
    }

    const clean = text.toLowerCase().trim();

    // 1. Detectar si el cliente NO necesita entrega esta semana
    const noKeywords = ['no necesito', 'no quiero', 'paso', 'esta semana no', 'esta vuelta no', 'por ahora no', 'tengo lleno', 'no gracias', 'nada gracias'];
    const isNegative = noKeywords.some(k => clean.includes(k)) || (clean === 'no' || clean === 'no.');

    if (isNegative) {
      return {
        intent: 'NO_NECESITA',
        sifones: 0,
        bidones: 0,
        monto: 0,
        respuesta: `¡Entendido ${cliente.nombre}! ✅ Registramos que para este reparto no necesitas reposición. ¡Te volvemos a consultar la próxima semana!`
      };
    }

    // 2. Extraer cantidades de Sifones de Soda
    let sifones = 0;
    
    // Detectar cajones (1 cajón = 6 sifones)
    const matchCajon = clean.match(/(\d+|un|una|dos|tres|cuatro)\s*(cajon|cajones|caja|cajas)/i);
    if (matchCajon) {
      const numStr = matchCajon[1];
      const num = this.wordToNumber(numStr);
      sifones += num * 6;
    }

    // Detectar sifones sueltos
    const matchSifones = clean.match(/(\d+|un|una|dos|tres|cuatro|cinco|seis|doce)\s*(sifon|sifones|soda|sodas)/i);
    if (matchSifones && !matchCajon) {
      const numStr = matchSifones[1];
      const num = this.wordToNumber(numStr);
      sifones += num;
    }

    // 3. Extraer cantidades de Bidones / Botellones de Agua
    let bidones = 0;
    const matchBidones = clean.match(/(\d+|un|una|dos|tres|cuatro|cinco)\s*(bidon|bidones|botellon|botellones|agua|20l)/i);
    if (matchBidones) {
      const numStr = matchBidones[1];
      bidones += this.wordToNumber(numStr);
    }

    // Si solo puso "si", "traeme lo de siempre" o "si quiero"
    if (sifones === 0 && bidones === 0 && (clean.includes('si') || clean.includes('lo de siempre') || clean.includes('dale') || clean.includes('traeme'))) {
      sifones = cliente.sifones_prestados || 6;
      bidones = cliente.bidones_prestados || 0;
    }

    // Si no se detectó nada
    if (sifones === 0 && bidones === 0) {
      return {
        intent: 'CONSULTA',
        sifones: 0,
        bidones: 0,
        monto: 0,
        respuesta: `Hola ${cliente.nombre}! Recibimos tu consulta. Para agendar tu pedido de soda o agua, responde por ejemplo: "Quiero 6 sifones y 1 bidón" o "No necesito esta semana".`
      };
    }

    // 4. Calcular costo total estimado
    const costoSifones = (sifones / 6) * this.PRECIO_CAJON_SODA;
    const costoBidones = bidones * this.PRECIO_BIDON_20L;
    const montoTotal = costoSifones + costoBidones;
    const deudaAnterior = cliente.saldo_deudor || 0;
    const totalPagar = montoTotal + deudaAnterior;

    // 5. Construir respuesta de confirmación para el cliente
    let detalleItems = [];
    if (sifones > 0) detalleItems.push(`• ${sifones} sifones de soda`);
    if (bidones > 0) detalleItems.push(`• ${bidones} bidón(es) de agua 20L`);

    const respuesta = `¡Excelente ${cliente.nombre}! 🚚 Tu pedido para mañana fue AGENDADO con éxito:\n\n${detalleItems.join('\n')}\n\n💵 *Total a abonar:* $${montoTotal.toFixed(2)}${deudaAnterior > 0 ? ` (+ $${deudaAnterior.toFixed(2)} de saldo pendiente)` : ''}\n💰 *Total final:* $${totalPagar.toFixed(2)}\n\n¡El chofer pasará por tu domicilio en el horario habitual!`;

    return {
      intent: 'PEDIDO_CONFIRMADO',
      sifones,
      bidones,
      monto: montoTotal,
      deudaAnterior,
      totalPagar,
      respuesta
    };
  },

  wordToNumber(word) {
    if (!isNaN(word)) return Number(word);
    const map = {
      'un': 1,
      'una': 1,
      'uno': 1,
      'dos': 2,
      'tres': 3,
      'cuatro': 4,
      'cinco': 5,
      'seis': 6,
      'doce': 12
    };
    return map[word.toLowerCase()] || 1;
  },

  // Generar mensaje inicial saliente del Bot
  generarMensajeAviso(cliente, empresa) {
    const deuda = cliente.saldo_deudor || 0;
    return `Hola ${cliente.nombre}! 🚚 Te escribimos de *${empresa.nombre_empresa}*.\n\nMañana estaremos pasando con el camión de reparto por tu zona (*${cliente.nombre_zona}*).\n${deuda > 0 ? `📌 *Tu saldo actual es:* $${deuda.toFixed(2)}\n` : ''}\n¿Vas a necesitar que te repongamos soda o bidones de agua?\n\n👉 *Respondé este mensaje diciendo qué necesitás* (ej: "2 cajones de soda y 1 bidon" o "Esta semana no"). ¡Gracias!`;
  }
};
