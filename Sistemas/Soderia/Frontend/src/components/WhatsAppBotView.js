import { store } from '../services/state.js';
import { WhatsAppBotEngine } from '../services/whatsappBot.js';

let selectedSimClientId = null;
let simChatLog = [];

export function renderWhatsAppBotView() {
  const clientes = store.clientes;
  const pedidos = Object.values(store.pedidosWhatsapp);

  if (!selectedSimClientId && clientes.length > 0) {
    selectedSimClientId = clientes[0].id_cliente;
  }

  const activeClient = clientes.find(c => c.id_cliente === Number(selectedSimClientId)) || clientes[0];

  const totalPedidos = pedidos.filter(p => p.intent === 'PEDIDO_CONFIRMADO').length;
  const totalMontoAgendado = pedidos.filter(p => p.intent === 'PEDIDO_CONFIRMADO').reduce((acc, p) => acc + (p.monto || 0), 0);
  const totalNoNecesitan = pedidos.filter(p => p.intent === 'NO_NECESITA').length;

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            🤖 Bot Inteligente de WhatsApp & Auto-Pedidos
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Envía avisos de reposición automáticos, interpreta lo que el cliente responde y actualiza la hoja de ruta del chofer sola.
          </p>
        </div>

        <button class="btn btn-primary" onclick="window.sendBroadcastTomorrow()">
          <i data-lucide="send" style="width: 16px; height: 16px;"></i>
          Despachar Avisos a Clientes de Mañana
        </button>
      </div>

      <!-- KPIs del Bot -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: #dcfce7; color: #15803d;">
            <i data-lucide="message-square" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Pedidos Confirmados</span>
            <strong style="display: block; font-size: 1.5rem; color: var(--accent-emerald); font-family: var(--font-mono);">${totalPedidos}</strong>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #e0f2fe; color: #0284c7;">
            <i data-lucide="dollar-sign" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Ventas Pre-Agendadas</span>
            <strong style="display: block; font-size: 1.5rem; color: var(--primary); font-family: var(--font-mono);">$${totalMontoAgendado.toFixed(2)}</strong>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #fef3c7; color: #b45309;">
            <i data-lucide="user-x" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Esta Semana No Piden</span>
            <strong style="display: block; font-size: 1.5rem; color: #b45309; font-family: var(--font-mono);">${totalNoNecesitan}</strong>
          </div>
        </div>
      </div>

      <!-- Simulador de WhatsApp y Lista de Pedidos en 2 Columnas -->
      <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 1.5rem; align-items: start;">
        
        <!-- SIMULADOR INTERACTIVO DE CHAT WHATSAPP -->
        <div class="card" style="padding: 0; overflow: hidden; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
          
          <!-- Encabezado estilo WhatsApp -->
          <div style="background: #075e54; color: #fff; padding: 0.9rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: #25d366; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800;">
                <i data-lucide="bot" style="width: 20px; height: 20px;"></i>
              </div>
              <div>
                <strong style="display: block; font-size: 0.95rem;">Bot Sodería Auto-Pedidos</strong>
                <span style="font-size: 0.72rem; color: #bbf7d0;">En línea las 24hs</span>
              </div>
            </div>

            ${clientes.length > 0 ? `
              <select 
                id="sim-client-select" 
                style="background: #0a4f47; color: #fff; border: 1px solid #128c7e; padding: 0.35rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.78rem;"
                onchange="window.changeSimClient(this.value)"
              >
                ${clientes.map(c => `
                  <option value="${c.id_cliente}" ${activeClient?.id_cliente === c.id_cliente ? 'selected' : ''}>
                    Cliente: ${c.nombre}
                  </option>
                `).join('')}
              </select>
            ` : ''}
          </div>

          <!-- Cuerpo de Conversación -->
          <div style="background: #e5ddd5; padding: 1.25rem; min-height: 340px; max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem;">
            
            ${activeClient ? `
              <!-- Mensaje saliente inicial del Bot -->
              <div style="align-self: flex-start; max-width: 85%; background: #ffffff; padding: 0.75rem 0.9rem; border-radius: 0 10px 10px 10px; font-size: 0.84rem; line-height: 1.4; box-shadow: 0 1px 1px rgba(0,0,0,0.1); white-space: pre-line;">
                ${WhatsAppBotEngine.generarMensajeAviso(activeClient, store.empresa)}
                <div style="font-size: 0.65rem; color: #888; text-align: right; margin-top: 0.3rem;">09:00 AM ✓✓</div>
              </div>
            ` : `
              <p style="text-align: center; color: #777; padding: 2rem 0;">Crea un cliente primero para probar el simulador de WhatsApp.</p>
            `}

            <!-- Mensajes simulados en tiempo real -->
            ${simChatLog.map(msg => `
              <div style="
                align-self: ${msg.sender === 'cliente' ? 'flex-end' : 'flex-start'};
                max-width: 85%;
                background: ${msg.sender === 'cliente' ? '#dcf8c6' : '#ffffff'};
                padding: 0.75rem 0.9rem;
                border-radius: ${msg.sender === 'cliente' ? '10px 0 10px 10px' : '0 10px 10px 10px'};
                font-size: 0.84rem;
                line-height: 1.4;
                box-shadow: 0 1px 1px rgba(0,0,0,0.1);
                white-space: pre-line;
              ">
                ${msg.text}
                <div style="font-size: 0.65rem; color: #888; text-align: right; margin-top: 0.3rem;">
                  ${msg.time} ${msg.sender === 'cliente' ? '✓✓' : ''}
                </div>
              </div>
            `).join('')}

          </div>

          <!-- Input para escribir como Cliente -->
          <div style="background: #f0f0f0; padding: 0.75rem; border-top: 1px solid #ddd;">
            <div style="display: flex; gap: 0.4rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
              <span style="font-size: 0.72rem; color: #666; font-weight: 700; display: block; width: 100%;">Respuestas de Prueba Rápidas:</span>
              <button class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 0.25rem 0.5rem; background: #fff;" onclick="window.sendSimMessage('Hola, dejame 2 sifones de soda y un botellon de agua')">
                "2 sifones y 1 botellón de agua"
              </button>
              <button class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 0.25rem 0.5rem; background: #fff;" onclick="window.sendSimMessage('Esta semana no necesito nada gracias')">
                "Esta semana no necesito"
              </button>
              <button class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 0.25rem 0.5rem; background: #fff;" onclick="window.sendSimMessage('Traeme 2 cajones de soda')">
                "2 cajones de soda"
              </button>
            </div>

            <form onsubmit="window.handleSendSimChat(event)" style="display: flex; gap: 0.5rem;">
              <input 
                type="text" 
                id="sim-chat-input" 
                class="form-input" 
                placeholder="Escribe como si fueras el cliente..." 
                style="background: #fff; border-radius: var(--radius-full); padding: 0.6rem 1rem; font-size: 0.88rem;"
                required 
              />
              <button type="submit" class="btn btn-primary" style="border-radius: var(--radius-full); padding: 0 1.2rem; background: #128c7e;">
                <i data-lucide="send" style="width: 16px; height: 16px;"></i>
              </button>
            </form>
          </div>

        </div>

        <!-- TABLA DE PEDIDOS AUTO-PROCESADOS -->
        <div class="card">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-main);">
            Pedidos Procesados por el Bot
          </h3>

          ${pedidos.length === 0 ? `
            <div style="padding: 3rem 1rem; text-align: center;">
              <i data-lucide="bot" style="width: 36px; height: 36px; color: var(--text-dim); margin-bottom: 0.5rem;"></i>
              <p style="color: var(--text-muted); font-size: 0.88rem;">Aún no se procesaron mensajes de WhatsApp.</p>
              <p style="color: var(--text-dim); font-size: 0.8rem; margin-top: 0.25rem;">Usa el simulador de la izquierda para probar respuestas reales.</p>
            </div>
          ` : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Mensaje Recibido</th>
                    <th>Interpretado</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${pedidos.map(p => `
                    <tr>
                      <td><strong>${p.cliente_nombre}</strong></td>
                      <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        "${p.mensaje_original}"
                      </td>
                      <td>
                        ${p.intent === 'PEDIDO_CONFIRMADO' ? `
                          <strong style="color: var(--primary); font-size: 0.82rem;">
                            ${p.sifones > 0 ? `${p.sifones} sif.` : ''} ${p.bidones > 0 ? `${p.bidones} bid.` : ''}
                          </strong>
                        ` : '<span style="color: var(--text-dim); font-size: 0.8rem;">Sin mercadería</span>'}
                      </td>
                      <td>
                        <strong style="font-family: var(--font-mono); color: ${p.monto > 0 ? '#15803d' : 'inherit'};">
                          $${(p.monto || 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span class="badge ${p.intent === 'PEDIDO_CONFIRMADO' ? 'badge-green' : p.intent === 'NO_NECESITA' ? 'badge-amber' : 'badge-blue'}">
                          ${p.intent === 'PEDIDO_CONFIRMADO' ? 'Confirmado' : p.intent === 'NO_NECESITA' ? 'No Necesita' : 'Consulta'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

      </div>

    </div>
  `;
}

// Handlers del Simulador
window.changeSimClient = (val) => {
  selectedSimClientId = Number(val);
  simChatLog = [];
  store.notify();
};

window.sendSimMessage = (texto) => {
  const input = document.getElementById('sim-chat-input');
  if (input) {
    input.value = texto;
    window.handleSendSimChat(new Event('submit'));
  }
};

window.handleSendSimChat = (e) => {
  e.preventDefault();
  const input = document.getElementById('sim-chat-input');
  if (!input || !input.value.trim()) return;

  const texto = input.value.trim();
  input.value = '';

  const activeClient = store.clientes.find(c => c.id_cliente === Number(selectedSimClientId)) || store.clientes[0];
  if (!activeClient) return;

  const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // 1. Añadir mensaje del cliente al chat
  simChatLog.push({
    sender: 'cliente',
    text: texto,
    time: horaActual
  });

  // 2. Procesar con el motor inteligente del Bot
  const resultado = store.procesarMensajeWhatsApp({
    id_cliente: activeClient.id_cliente,
    texto
  });

  // 3. Añadir respuesta del Bot al chat
  if (resultado) {
    setTimeout(() => {
      simChatLog.push({
        sender: 'bot',
        text: resultado.respuesta_bot,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      });
      store.notify();
    }, 400);
  }

  store.notify();
};

window.sendBroadcastTomorrow = () => {
  window.showToast('🚀 Avisos masivos de WhatsApp despachados a clientes de mañana', 'success');
};
