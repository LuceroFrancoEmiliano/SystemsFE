import { store } from '../services/state.js';

let cardData = {
  number: '',
  name: '',
  expiry: '',
  cvv: '',
  dni: '',
  installments: '1'
};

let transferData = {
  comprobante: '',
  origen: 'Mercado Pago'
};

export function renderCheckoutView() {
  const user = store.currentUser;
  if (!user) {
    return `
      <div class="container animate-fade-in" style="max-width: 600px; margin: 3rem auto; text-align: center;">
        <div style="background: #fff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 3rem 2rem; box-shadow: var(--shadow-md);">
          <i data-lucide="lock" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">Inicia sesión para continuar la compra</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Para registrar la empresa a tu nombre y configurar tu subdominio privado.</p>
          <button class="btn btn-primary" onclick="window.navigate('login')">
            <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
            Iniciar Sesión o Registrarse
          </button>
        </div>
      </div>
    `;
  }

  const sys = store.sistemas.find(s => s.id_sistema === store.selectedCheckoutSystemId) || store.sistemas[0];
  if (!sys) {
    return `
      <div class="container animate-fade-in" style="max-width: 600px; margin: 3rem auto; text-align: center;">
        <div class="card" style="padding: 3rem 2rem;">
          <h3>No hay sistema seleccionado</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Por favor selecciona un producto desde el catálogo.</p>
          <button class="btn btn-primary" onclick="window.navigate('catalog')">Ir al Catálogo</button>
        </div>
      </div>
    `;
  }

  const step = store.checkoutStep;
  const data = store.checkoutData;

  const slugCalculado = data.slugEmpresa || (data.nombreEmpresa ? data.nombreEmpresa
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') : '');

  return `
    <div class="container animate-fade-in" style="max-width: 960px; margin: 0 auto 4rem; padding-top: 1rem;">
      
      <!-- Botón Volver -->
      <div style="margin-bottom: 1.5rem;">
        <button class="btn btn-secondary btn-sm" onclick="window.navigate('catalog')">
          <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i>
          Volver al Catálogo
        </button>
      </div>

      <!-- Barra de Progreso / Stepper -->
      <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; position: relative;">
          
          <!-- Step 1 Indicator -->
          <div style="display: flex; align-items: center; gap: 0.75rem; z-index: 2;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${step >= 1 ? 'var(--primary)' : '#f1f5f9'}; color: ${step >= 1 ? '#fff' : 'var(--text-dim)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; box-shadow: ${step === 1 ? '0 0 0 4px #eff6ff' : 'none'};">
              1
            </div>
            <div>
              <strong style="font-size: 0.88rem; color: ${step >= 1 ? 'var(--text-main)' : 'var(--text-dim)'}; display: block;">Datos de la Empresa</strong>
              <span style="font-size: 0.72rem; color: var(--text-dim);">Configura tu subdominio</span>
            </div>
          </div>

          <div style="flex-grow: 1; height: 2px; background: ${step >= 2 ? 'var(--primary)' : '#e2e8f0'}; margin: 0 1rem;"></div>

          <!-- Step 2 Indicator -->
          <div style="display: flex; align-items: center; gap: 0.75rem; z-index: 2;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${step >= 2 ? 'var(--primary)' : '#f1f5f9'}; color: ${step >= 2 ? '#fff' : 'var(--text-dim)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; box-shadow: ${step === 2 ? '0 0 0 4px #eff6ff' : 'none'};">
              2
            </div>
            <div>
              <strong style="font-size: 0.88rem; color: ${step >= 2 ? 'var(--text-main)' : 'var(--text-dim)'}; display: block;">Método de Pago & Datos</strong>
              <span style="font-size: 0.72rem; color: var(--text-dim);">Ingresa tus credenciales</span>
            </div>
          </div>

          <div style="flex-grow: 1; height: 2px; background: ${step >= 3 ? 'var(--accent-emerald)' : '#e2e8f0'}; margin: 0 1rem;"></div>

          <!-- Step 3 Indicator -->
          <div style="display: flex; align-items: center; gap: 0.75rem; z-index: 2;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${step >= 3 ? 'var(--accent-emerald)' : '#f1f5f9'}; color: ${step >= 3 ? '#fff' : 'var(--text-dim)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; box-shadow: ${step === 3 ? '0 0 0 4px #ecfdf5' : 'none'};">
              3
            </div>
            <div>
              <strong style="font-size: 0.88rem; color: ${step >= 3 ? 'var(--text-main)' : 'var(--text-dim)'}; display: block;">Confirmación</strong>
              <span style="font-size: 0.72rem; color: var(--text-dim);">Activación instantánea</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Layout Principal en 2 Columnas -->
      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start;">
        
        <!-- Columna Izquierda: Contenido del Paso Actual -->
        <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2.25rem; box-shadow: var(--shadow-md);">
          
          ${step === 1 ? `
            <!-- PASO 1: CONFIGURAR EMPRESA Y DATOS -->
            <div class="animate-fade-in">
              <span class="badge badge-primary" style="margin-bottom: 0.5rem;">Paso 1 de 3</span>
              <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-main);">
                Configuración de tu Empresa
              </h2>
              <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2rem;">
                Ingresa el nombre con el que operarás. Con estos datos se generará automáticamente tu entorno web privado y tu base de datos dedicada.
              </p>

              <form onsubmit="window.handleStep1Submit(event)">
                <div class="form-group" style="margin-bottom: 1.5rem;">
                  <label class="form-label" for="checkout-company-name">Nombre Comercial de tu Empresa:</label>
                  <input 
                    type="text" 
                    id="checkout-company-name" 
                    class="form-input" 
                    placeholder="Ej: Sodería San Martín" 
                    value="${data.nombreEmpresa}" 
                    required 
                    autofocus
                    oninput="window.onCheckoutCompanyInput(this.value)"
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                  <label class="form-label">Subdominio Web Dedicado:</label>
                  <div style="display: flex; align-items: center; background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.65rem 1rem;">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: var(--primary); font-size: 1rem;" id="slug-preview">
                      ${slugCalculado || 'tu-empresa'}
                    </span>
                    <span style="color: var(--text-dim); font-size: 0.9rem; font-weight: 600;">.misistema.com</span>
                  </div>
                </div>

                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 2rem; display: flex; gap: 0.75rem; align-items: flex-start;">
                  <i data-lucide="shield-check" style="width: 20px; height: 20px; color: var(--primary); flex-shrink: 0; margin-top: 2px;"></i>
                  <div>
                    <p style="font-size: 0.84rem; color: #1e3a8a; margin: 0; line-height: 1.5;">
                      <strong>Serás el Administrador Propietario de tu sistema:</strong> Tendrás tu base de datos propia, podrás dar de alta choferes y clientes, y acceder con tu cuenta central sin contraseñas extra.
                    </p>
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                  <button type="submit" class="btn btn-primary" id="btn-step1-next" ${slugCalculado.length < 3 ? 'disabled' : ''}>
                    Continuar al Método de Pago
                    <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                  </button>
                </div>
              </form>
            </div>
          ` : ''}

          ${step === 2 ? `
            <!-- PASO 2: MÉTODO DE PAGO Y CREDENCIALES DEL COMPRADOR -->
            <div class="animate-fade-in">
              <span class="badge badge-primary" style="margin-bottom: 0.5rem;">Paso 2 de 3</span>
              <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-main);">
                Método de Pago & Credenciales
              </h2>
              <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                Selecciona tu medio de pago e ingresa tus datos para procesar la transacción.
              </p>

              <!-- CAJA DESTACADA CON EL PRECIO -->
              <div class="checkout-price-reveal" style="padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;">
                <div>
                  <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary); font-weight: 800; display: block; letter-spacing: 0.05em;">Inversión de Licencia Web</span>
                  <strong style="font-size: 1.1rem; color: var(--text-main);">${sys.titulo}</strong>
                </div>
                <div style="text-align: right;">
                  <div class="price-amount" style="font-size: 2rem; line-height: 1;">$${sys.precio.toFixed(2)}</div>
                  <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700;">${sys.moneda} (Pago Único)</span>
                </div>
              </div>

              <!-- Selector de Métodos de Pago -->
              <label class="form-label" style="margin-bottom: 0.75rem;">Elige tu Forma de Pago:</label>
              <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem;">
                
                <label style="display: flex; align-items: center; justify-content: space-between; background: ${data.metodoPago === 'MERCADO_PAGO' ? '#eff6ff' : '#f8fafc'}; border: 2px solid ${data.metodoPago === 'MERCADO_PAGO' ? 'var(--primary)' : '#e2e8f0'}; padding: 0.85rem 1.1rem; border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="radio" name="payment_method" value="MERCADO_PAGO" ${data.metodoPago === 'MERCADO_PAGO' ? 'checked' : ''} onchange="window.onPaymentMethodChange(this.value)" />
                    <div>
                      <strong style="color: var(--text-main); font-size: 0.92rem; display: block;">Tarjeta de Débito / Crédito (Mercado Pago)</strong>
                      <span style="font-size: 0.78rem; color: var(--text-muted);">Procesamiento seguro instantáneo</span>
                    </div>
                  </div>
                  <i data-lucide="credit-card" style="width: 20px; height: 20px; color: var(--primary);"></i>
                </label>

                <label style="display: flex; align-items: center; justify-content: space-between; background: ${data.metodoPago === 'TRANSFERENCIA' ? '#eff6ff' : '#f8fafc'}; border: 2px solid ${data.metodoPago === 'TRANSFERENCIA' ? 'var(--primary)' : '#e2e8f0'}; padding: 0.85rem 1.1rem; border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="radio" name="payment_method" value="TRANSFERENCIA" ${data.metodoPago === 'TRANSFERENCIA' ? 'checked' : ''} onchange="window.onPaymentMethodChange(this.value)" />
                    <div>
                      <strong style="color: var(--text-main); font-size: 0.92rem; display: block;">Transferencia Bancaria Inmediata</strong>
                      <span style="font-size: 0.78rem; color: var(--text-muted);">Transferencia directa por CVU / Alias</span>
                    </div>
                  </div>
                  <i data-lucide="building-2" style="width: 20px; height: 20px; color: #16a34a;"></i>
                </label>

                <label style="display: flex; align-items: center; justify-content: space-between; background: ${data.metodoPago === 'TEST' ? '#eff6ff' : '#f8fafc'}; border: 2px solid ${data.metodoPago === 'TEST' ? 'var(--primary)' : '#e2e8f0'}; padding: 0.85rem 1.1rem; border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="radio" name="payment_method" value="TEST" ${data.metodoPago === 'TEST' ? 'checked' : ''} onchange="window.onPaymentMethodChange(this.value)" />
                    <div>
                      <strong style="color: var(--text-main); font-size: 0.92rem; display: block;">Prueba Inmediata (Modo Demo)</strong>
                      <span style="font-size: 0.78rem; color: var(--accent-emerald); font-weight: 600;">Activación simulada instantánea para testeo</span>
                    </div>
                  </div>
                  <i data-lucide="zap" style="width: 20px; height: 20px; color: var(--accent-amber);"></i>
                </label>

              </div>

              <!-- FORMULARIO DE TARJETA SI SELECCIONA MERCADO PAGO -->
              ${data.metodoPago === 'MERCADO_PAGO' ? `
                <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 2rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem;">
                    <i data-lucide="credit-card" style="width: 18px; height: 18px; color: var(--primary);"></i>
                    <strong style="font-size: 0.95rem; color: var(--text-main);">Ingresa los Datos de tu Tarjeta:</strong>
                  </div>

                  <div class="form-group" style="margin-bottom: 1rem;">
                    <label class="form-label" style="font-size: 0.82rem;">Número de Tarjeta:</label>
                    <input 
                      type="text" 
                      id="card-number" 
                      class="form-input" 
                      placeholder="4500 1234 5678 9010" 
                      maxlength="19" 
                      value="${cardData.number}"
                      oninput="window.handleCardNumberInput(this)"
                      required
                    />
                  </div>

                  <div class="form-group" style="margin-bottom: 1rem;">
                    <label class="form-label" style="font-size: 0.82rem;">Nombre del Titular (como figura en el plástico):</label>
                    <input 
                      type="text" 
                      id="card-name" 
                      class="form-input" 
                      placeholder="Ej: JUAN PEREZ" 
                      value="${cardData.name || user.nombre}"
                      oninput="cardData.name = this.value.toUpperCase()"
                      required
                    />
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                    <div>
                      <label class="form-label" style="font-size: 0.82rem;">Vencimiento (MM/AA):</label>
                      <input 
                        type="text" 
                        id="card-expiry" 
                        class="form-input" 
                        placeholder="12/28" 
                        maxlength="5" 
                        value="${cardData.expiry}"
                        oninput="window.handleCardExpiryInput(this)"
                        required
                      />
                    </div>

                    <div>
                      <label class="form-label" style="font-size: 0.82rem;">Código de Seguridad (CVV):</label>
                      <input 
                        type="password" 
                        id="card-cvv" 
                        class="form-input" 
                        placeholder="•••" 
                        maxlength="4" 
                        value="${cardData.cvv}"
                        oninput="cardData.cvv = this.value"
                        required
                      />
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 0.75rem;">
                    <div>
                      <label class="form-label" style="font-size: 0.82rem;">DNI / Documento:</label>
                      <input 
                        type="text" 
                        id="card-dni" 
                        class="form-input" 
                        placeholder="38123456" 
                        value="${cardData.dni}"
                        oninput="cardData.dni = this.value"
                      />
                    </div>

                    <div>
                      <label class="form-label" style="font-size: 0.82rem;">Plan de Cuotas:</label>
                      <select class="form-input" id="card-installments" onchange="cardData.installments = this.value">
                        <option value="1">1 pago de $${sys.precio.toFixed(2)} USD</option>
                        <option value="3">3 cuotas fijas de $${(sys.precio / 3).toFixed(2)} USD</option>
                        <option value="6">6 cuotas fijas de $${(sys.precio / 6).toFixed(2)} USD</option>
                      </select>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- DATOS DE TRANSFERENCIA SI SELECCIONA TRANSFERENCIA BANCARIA -->
              ${data.metodoPago === 'TRANSFERENCIA' ? `
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <i data-lucide="building-2" style="width: 20px; height: 20px; color: #16a34a;"></i>
                      <strong style="font-size: 0.95rem; color: #166534;">Transfiere el importe a esta cuenta:</strong>
                    </div>
                    <span class="badge badge-green" style="font-size: 0.7rem;">Oficial Systems</span>
                  </div>

                  <div style="font-size: 0.85rem; color: #14532d; display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1rem;">
                    <div><strong>Titular:</strong> ${store.configPagos?.titular || 'Emilia Ponce'}</div>
                    <div style="display: flex; align-items: center; justify-content: space-between; background: #dcfce7; padding: 0.4rem 0.65rem; border-radius: 6px;">
                      <span><strong>Alias:</strong> <code style="font-weight: 800; font-size: 0.95rem; color: #065f46;">${store.configPagos?.alias_transferencia || 'emiliaponceg.mp'}</code></span>
                      <button type="button" class="btn btn-ghost btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; color: #166534;" onclick="window.copyPaymentText('${store.configPagos?.alias_transferencia || 'emiliaponceg.mp'}', 'Alias')">
                        📋 Copiar
                      </button>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; background: #dcfce7; padding: 0.4rem 0.65rem; border-radius: 6px;">
                      <span><strong>CVU / CBU:</strong> <code style="font-family: monospace; font-size: 0.85rem; color: #065f46;">${store.configPagos?.cvu_transferencia || '0000003100085492019482'}</code></span>
                      <button type="button" class="btn btn-ghost btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; color: #166534;" onclick="window.copyPaymentText('${store.configPagos?.cvu_transferencia || '0000003100085492019482'}', 'CVU')">
                        📋 Copiar
                      </button>
                    </div>
                    <div><strong>Entidad:</strong> ${store.configPagos?.banco || 'Mercado Pago'}</div>
                  </div>

                  <!-- Campos de comprobante -->
                  <div style="border-top: 1px dashed #86efac; padding-top: 0.9rem;">
                    <label class="form-label" style="font-size: 0.82rem; color: #14532d;">N° de Operación / Comprobante de Transferencia:</label>
                    <input 
                      type="text" 
                      id="transfer-ref" 
                      class="form-input" 
                      placeholder="Ej: Transf #948201 / Op 38472910" 
                      value="${transferData.comprobante}"
                      oninput="transferData.comprobante = this.value"
                      required
                    />
                  </div>
                </div>
              ` : ''}

              <!-- Botones de Navegación -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
                <button type="button" class="btn btn-secondary" onclick="store.setCheckoutStep(1)">
                  <i data-lucide="arrow-left" style="width: 15px; height: 15px;"></i>
                  Paso Anterior
                </button>
                <button type="button" class="btn btn-primary" onclick="window.validateStep2AndContinue()">
                  Continuar a la Confirmación
                  <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i>
                </button>
              </div>
            </div>
          ` : ''}

          ${step === 3 ? `
            <!-- PASO 3: CONFIRMACIÓN FINAL Y ACTIVACIÓN -->
            <div class="animate-fade-in">
              <span class="badge badge-success" style="margin-bottom: 0.5rem;">Paso Final</span>
              <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-main);">
                Confirmación de la Orden
              </h2>
              <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2rem;">
                Revisa los datos finales antes de activar el sistema para tu empresa.
              </p>

              <!-- Tarjeta de Resumen Detallada -->
              <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 2rem;">
                
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.85rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 0.85rem; font-size: 0.9rem;">
                  <span style="color: var(--text-dim);">Software Seleccionado:</span>
                  <strong style="color: var(--text-main); font-size: 0.95rem;">${sys.titulo}</strong>
                </div>

                <div style="display: flex; justify-content: space-between; padding-bottom: 0.85rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 0.85rem; font-size: 0.9rem;">
                  <span style="color: var(--text-dim);">Empresa Registrada:</span>
                  <strong style="color: var(--text-main);">${data.nombreEmpresa}</strong>
                </div>

                <div style="display: flex; justify-content: space-between; padding-bottom: 0.85rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 0.85rem; font-size: 0.9rem;">
                  <span style="color: var(--text-dim);">Subdominio Privado:</span>
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">${slugCalculado}.misistema.com</span>
                </div>

                <div style="display: flex; justify-content: space-between; padding-bottom: 0.85rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 0.85rem; font-size: 0.9rem;">
                  <span style="color: var(--text-dim);">Administrador de Empresa:</span>
                  <span style="color: var(--text-main); font-weight: 600;">${user.nombre} (${user.email})</span>
                </div>

                <div style="display: flex; justify-content: space-between; padding-bottom: 0.85rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 0.85rem; font-size: 0.9rem;">
                  <span style="color: var(--text-dim);">Medio de Pago:</span>
                  <span style="color: var(--primary); font-weight: 700;">
                    ${data.metodoPago === 'MERCADO_PAGO' ? `💳 Tarjeta terminada en ${cardData.number.slice(-4) || '****'} (${cardData.installments || 1} pago/s)` : data.metodoPago === 'TRANSFERENCIA' ? `🏦 Transferencia Ref: ${transferData.comprobante || 'Confirmada'}` : '⚡ Modo Prueba / Demo'}
                  </span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; font-size: 1.1rem;">
                  <strong style="color: var(--text-main);">Total a Abonar:</strong>
                  <strong style="color: var(--primary-dark); font-size: 1.5rem; font-family: var(--font-mono);">$${sys.precio.toFixed(2)} ${sys.moneda}</strong>
                </div>

              </div>

              <!-- Botones Finales -->
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <button type="button" class="btn btn-secondary" onclick="store.setCheckoutStep(2)">
                  <i data-lucide="arrow-left" style="width: 15px; height: 15px;"></i>
                  Paso Anterior
                </button>
                <button type="button" class="btn btn-success" style="padding: 0.8rem 2rem; font-size: 1.05rem;" id="btn-confirm-pay" onclick="window.confirmFinalPurchase()">
                  <i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i>
                  Confirmar Pago y Activar Sistema
                </button>
              </div>

            </div>
          ` : ''}

        </div>

        <!-- Columna Derecha: Tarjeta Resumen del Producto -->
        <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); position: sticky; top: 100px;">
          <div style="height: 140px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 1rem; position: relative;">
            <img src="${sys.banner_url || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800'}" alt="${sys.titulo}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%);"></div>
            <span class="badge badge-primary" style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: #fff;">
              <i data-lucide="${sys.icono || 'box'}" style="width: 12px; height: 12px;"></i>
              ${sys.codigo}
            </span>
          </div>

          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">${sys.titulo}</h3>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 1rem;">${sys.descripcion_corta}</p>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 1rem; margin-bottom: 1rem;">
            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.5rem;">Incluye en tu Instancia:</span>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.8rem; color: #334155;">
              <li style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="check" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i>
                Subdominio dedicado para tu empresa
              </li>
              <li style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="check" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i>
                Cuentas de empleados ilimitadas
              </li>
              <li style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="check" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i>
                Acceso SSO unificado con tu cuenta
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  `;
}

// Handlers
window.onCheckoutCompanyInput = (val) => {
  const slug = val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  store.updateCheckoutData({
    nombreEmpresa: val,
    slugEmpresa: slug
  });

  const preview = document.getElementById('slug-preview');
  if (preview) {
    preview.innerText = slug || 'tu-empresa';
  }

  const nextBtn = document.getElementById('btn-step1-next');
  if (nextBtn) {
    nextBtn.disabled = slug.length < 3;
  }
};

window.handleStep1Submit = (e) => {
  e.preventDefault();
  const name = document.getElementById('checkout-company-name').value.trim();
  if (name.length < 3) {
    window.showToast('El nombre de empresa debe tener al menos 3 letras', 'error');
    return;
  }
  store.setCheckoutStep(2);
};

window.onPaymentMethodChange = (method) => {
  store.updateCheckoutData({ metodoPago: method });
};

window.handleCardNumberInput = (input) => {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
  input.value = formatted;
  cardData.number = formatted;
};

window.handleCardExpiryInput = (input) => {
  let val = input.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 2) {
    val = val.substring(0, 2) + '/' + val.substring(2);
  }
  input.value = val;
  cardData.expiry = val;
};

window.validateStep2AndContinue = () => {
  const metodo = store.checkoutData.metodoPago;

  if (metodo === 'MERCADO_PAGO') {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 15) {
      window.showToast('Por favor ingresa un número de tarjeta válido (16 dígitos)', 'error');
      return;
    }
    if (!cardData.expiry || cardData.expiry.length < 5) {
      window.showToast('Por favor ingresa el vencimiento (MM/AA)', 'error');
      return;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      window.showToast('Por favor ingresa el código CVV de seguridad', 'error');
      return;
    }
  } else if (metodo === 'TRANSFERENCIA') {
    const ref = document.getElementById('transfer-ref')?.value.trim();
    if (!ref) {
      window.showToast('Por favor ingresa el número o referencia del comprobante de transferencia', 'error');
      return;
    }
    transferData.comprobante = ref;
  }

  store.setCheckoutStep(3);
};

window.copyPaymentText = (text, label) => {
  navigator.clipboard.writeText(text).then(() => {
    window.showToast(`📋 ¡${label} copiado al portapapeles!`, 'success');
  }).catch(() => {
    window.showToast(`Copiado: ${text}`, 'info');
  });
};

window.confirmFinalPurchase = async () => {
  const btn = document.getElementById('btn-confirm-pay');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Procesando pago y creando base de datos...';
  }

  const sys = store.sistemas.find(s => s.id_sistema === store.selectedCheckoutSystemId) || store.sistemas[0];
  const refPago = store.checkoutData.metodoPago === 'MERCADO_PAGO'
    ? `Tarjeta **** ${cardData.number.slice(-4)}`
    : store.checkoutData.metodoPago === 'TRANSFERENCIA'
    ? `Transf ${transferData.comprobante}`
    : 'Demo Test';

  try {
    const lic = await store.buySystem({
      sistemaId: sys.id_sistema,
      nombreEmpresa: store.checkoutData.nombreEmpresa,
      slugEmpresa: store.checkoutData.slugEmpresa,
      metodoPago: store.checkoutData.metodoPago,
      referenciaPago: refPago
    });

    window.showToast(`🎉 ¡Pago aprobado! Licencia para "${store.checkoutData.nombreEmpresa}" activada con éxito.`, 'success');
    store.setCurrentView('library');
  } catch (err) {
    window.showToast(`Error al procesar la compra: ${err.message}`, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="check-circle-2" style="width: 18px; height: 18px;"></i> Confirmar Pago y Activar Sistema';
    }
  }
};
