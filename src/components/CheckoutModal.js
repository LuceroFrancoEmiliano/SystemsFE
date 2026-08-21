import { store } from '../services/state.js';

let currentCheckoutSystem = null;
let currentStep = 1; // 1: Configurar Empresa, 2: Resumen y Pago con precio revelado
let companyName = '';
let companySlug = '';
let paymentMethod = 'MERCADO_PAGO';

export function openCheckoutModal(systemId) {
  currentCheckoutSystem = store.sistemas.find(s => s.id_sistema === Number(systemId));
  currentStep = 1;
  companyName = '';
  companySlug = '';
  paymentMethod = 'MERCADO_PAGO';
  renderModal();
}

export function closeCheckoutModal() {
  currentCheckoutSystem = null;
  const modalContainer = document.getElementById('modal-root');
  if (modalContainer) modalContainer.innerHTML = '';
}

function updateSlug() {
  const input = document.getElementById('company-name-input');
  if (!input) return;
  companyName = input.value;
  companySlug = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const slugPreview = document.getElementById('slug-preview');
  if (slugPreview) {
    slugPreview.textContent = companySlug ? `${companySlug}.misistema.com` : 'tu-empresa.misistema.com';
  }

  const nextBtn = document.getElementById('btn-checkout-step1');
  if (nextBtn) {
    nextBtn.disabled = companySlug.length < 3;
  }
}

function goToStep2() {
  if (!companySlug || companySlug.length < 3) {
    window.showToast('Ingresa un nombre de empresa válido (mínimo 3 letras)', 'error');
    return;
  }
  currentStep = 2;
  renderModal();
}

function processPayment() {
  try {
    const user = store.currentUser;
    const licencia = store.buySystem({
      sistemaId: currentCheckoutSystem.id_sistema,
      nombreEmpresa: companyName,
      slugEmpresa: companySlug,
      metodoPago: paymentMethod,
    });

    closeCheckoutModal();
    window.showToast(`🎉 ¡Felicitaciones! Has adquirido ${currentCheckoutSystem.titulo} para ${companyName}.`, 'success');
    window.navigate('library');
  } catch (err) {
    window.showToast(err.message, 'error');
  }
}

function renderModal() {
  const modalContainer = document.getElementById('modal-root');
  if (!modalContainer || !currentCheckoutSystem) return;

  const sys = currentCheckoutSystem;
  const user = store.currentUser;

  modalContainer.innerHTML = `
    <div class="modal-backdrop animate-fade-in" onclick="if(event.target === this) window.closeCheckout()">
      <div class="modal-content animate-scale-up">
        
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <i data-lucide="${sys.icono}" style="color: var(--primary-light);"></i>
            <span>${currentStep === 1 ? 'Configura tu Nueva Instancia' : 'Confirmación y Pago'}</span>
          </div>
          <button class="modal-close-btn" onclick="window.closeCheckout()">
            <i data-lucide="x"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          ${currentStep === 1 ? `
            <!-- PASO 1: Configurar Empresa -->
            <div class="form-group">
              <p style="font-size: 0.88rem; margin-bottom: 1.25rem;">
                Estás a punto de activar <strong>${sys.titulo}</strong>. Tu cuenta actual (<strong>${user.nombre}</strong>) será automáticamente el <strong>Administrador Propietario</strong> de tu sistema.
              </p>

              <label class="form-label" for="company-name-input">Nombre de tu Empresa o Negocio:</label>
              <input 
                type="text" 
                id="company-name-input" 
                class="form-input" 
                placeholder="Ej: Sodería San Martín, Titan Gym, etc." 
                value="${companyName}"
                oninput="window.onCompanyNameInput()"
                autofocus
              />

              <div class="slug-preview-box">
                <div>
                  <span style="font-size: 0.72rem; color: var(--text-dim); display: block;">Acceso web dedicado para tu empresa:</span>
                  <span class="slug-url-text" id="slug-preview">${companySlug ? `${companySlug}.misistema.com` : 'tu-empresa.misistema.com'}</span>
                </div>
                <span class="slug-status-badge">
                  <i data-lucide="check-circle" style="width: 13px; height: 13px; display: inline;"></i> Disponible
                </span>
              </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-top: 1rem;">
              <p style="font-size: 0.8rem; color: var(--text-muted);">
                <i data-lucide="users" style="width: 14px; height: 14px; display: inline; color: var(--accent-cyan);"></i>
                Dentro de tu sistema podrás crear a todos tus empleados (cajeros, operarios, vendedores) y asignarles permisos.
              </p>
            </div>
          ` : `
            <!-- PASO 2: Resumen y Revelación del Precio -->
            <div>
              <p style="font-size: 0.88rem; margin-bottom: 1rem; color: var(--text-muted);">
                Revisa los datos de tu nueva empresa antes de proceder al pago:
              </p>

              <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                  <span style="color: var(--text-dim);">Sistema:</span>
                  <strong style="color: var(--text-main);">${sys.titulo}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                  <span style="color: var(--text-dim);">Empresa Registrada:</span>
                  <strong style="color: var(--accent-cyan);">${companyName} (${companySlug})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                  <span style="color: var(--text-dim);">Administrador:</span>
                  <span style="color: var(--text-main); font-weight: 600;">${user.nombre} (${user.email})</span>
                </div>
              </div>

              <!-- REVELACIÓN DEL PRECIO FINAL -->
              <div class="checkout-price-reveal">
                <div>
                  <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--primary-light); font-weight: 700; display: block;">Total a Pagar</span>
                  <span style="font-size: 0.85rem; color: var(--text-muted);">Licencia Completa de Acceso Web</span>
                </div>
                <div class="price-amount">$${sys.precio.toFixed(2)} <span style="font-size: 0.9rem; color: var(--accent-cyan);">${sys.moneda}</span></div>
              </div>

              <!-- Método de Pago -->
              <label class="form-label">Método de Pago:</label>
              <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
                <label style="flex: 1; display: flex; align-items: center; gap: 0.5rem; background: var(--bg-input); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.85rem;">
                  <input type="radio" name="payment" value="MERCADO_PAGO" checked />
                  <span>Mercado Pago / Tarjeta</span>
                </label>
                <label style="flex: 1; display: flex; align-items: center; gap: 0.5rem; background: var(--bg-input); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.85rem;">
                  <input type="radio" name="payment" value="TEST" />
                  <span>Prueba Inmediata (Demo)</span>
                </label>
              </div>
            </div>
          `}
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          ${currentStep === 1 ? `
            <button class="btn btn-secondary" onclick="window.closeCheckout()">Cancelar</button>
            <button id="btn-checkout-step1" class="btn btn-primary" onclick="window.onCheckoutNext()" ${companySlug.length < 3 ? 'disabled' : ''}>
              Continuar al Pago
              <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i>
            </button>
          ` : `
            <button class="btn btn-secondary" onclick="window.onCheckoutBack()">Atrás</button>
            <button class="btn btn-success" onclick="window.onCheckoutConfirm()">
              <i data-lucide="credit-card" style="width: 16px; height: 16px;"></i>
              Pagar $${sys.precio.toFixed(2)} y Activar Sistema
            </button>
          `}
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Exportar funciones a window para eventos inline
window.openCheckout = openCheckoutModal;
window.closeCheckout = closeCheckoutModal;
window.onCompanyNameInput = updateSlug;
window.onCheckoutNext = goToStep2;
window.onCheckoutBack = () => { currentStep = 1; renderModal(); };
window.onCheckoutConfirm = processPayment;
