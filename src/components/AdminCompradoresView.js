import { store } from '../services/state.js';

let adminSubTab = 'compradores'; // 'compradores' | 'precios' | 'nuevo-sistema'

export function renderAdminCompradoresView() {
  const user = store.currentUser;
  if (user?.rol_global !== 'ADMIN') {
    return `
      <div class="container animate-fade-in" style="padding: 4rem 1rem; text-align: center;">
        <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: var(--radius-lg); padding: 3rem 2rem; max-width: 500px; margin: 0 auto;">
          <i data-lucide="shield-alert" style="width: 48px; height: 48px; color: #fda4af; margin-bottom: 1rem;"></i>
          <h2 style="color: #fff; margin-bottom: 0.5rem;">Acceso Restringido</h2>
          <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Este panel es exclusivo para el SuperAdmin (Franco). Usa el selector de usuario arriba a la derecha para cambiar de rol.</p>
        </div>
      </div>
    `;
  }

  const buyers = store.getBuyersList();
  const sistemas = store.sistemas;

  return `
    <div class="container animate-fade-in" style="padding-bottom: 4rem;">
      <div class="section-header" style="margin-bottom: 2rem;">
        <div>
          <span class="badge badge-admin" style="margin-bottom: 0.5rem;">
            <i data-lucide="shield" style="width: 12px; height: 12px;"></i>
            Panel SuperAdmin (Franco)
          </span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Control de Compradores, Sistemas & Precios</h2>
          <p style="font-size: 0.92rem; color: var(--text-muted);">Monitorea tus clientes, cambia los precios de tus sistemas y publica nuevo software.</p>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-sm ${adminSubTab === 'compradores' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setAdminTab('compradores')">
            <i data-lucide="users" style="width: 14px; height: 14px;"></i>
            Compradores (${buyers.length})
          </button>
          <button class="btn btn-sm ${adminSubTab === 'precios' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setAdminTab('precios')">
            <i data-lucide="tag" style="width: 14px; height: 14px;"></i>
            Catálogo & Precios (${sistemas.length})
          </button>
          <button class="btn btn-sm ${adminSubTab === 'pagos' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setAdminTab('pagos')">
            <i data-lucide="wallet" style="width: 14px; height: 14px;"></i>
            Datos de Cobro (CBU/Alias)
          </button>
          <button class="btn btn-sm ${adminSubTab === 'nuevo-sistema' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setAdminTab('nuevo-sistema')">
            <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i>
            Publicar Nuevo
          </button>
        </div>
      </div>

      ${adminSubTab === 'compradores' ? `
        <!-- TAB 1: LISTADO DE CLIENTES Y ESTADO DE USO -->
        <div class="buyers-table-wrap">
          <table class="buyers-table">
            <thead>
              <tr>
                <th>Cliente Comprador</th>
                <th>Sistema & Empresa</th>
                <th>Comprobante / Pago</th>
                <th>Fecha Compra</th>
                <th>Estado de Licencia</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${buyers.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-dim);">
                    Aún no hay compras registradas. Registra una cuenta de prueba y compra un sistema para ver el flujo.
                  </td>
                </tr>
              ` : buyers.map(b => {
                const fechaCompra = new Date(b.fecha_compra).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                const isPending = b.estado_licencia === 'PENDIENTE_APROBACION' || b.estado_licencia === 'PENDIENTE';
                const isRejected = b.estado_licencia === 'RECHAZADA';

                return `
                  <tr style="${isPending ? 'background: #fffbeb;' : ''}">
                    <td>
                      <div class="buyer-user-cell">
                        <img src="${b.cliente_avatar}" alt="${b.cliente_nombre}" style="width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border-subtle);" />
                        <div>
                          <strong style="display: block; color: var(--text-main); font-size: 0.88rem;">${b.cliente_nombre}</strong>
                          <span style="font-size: 0.75rem; color: var(--text-dim);">${b.cliente_email}</span>
                          ${b.cliente_telefono ? `<span style="font-size: 0.72rem; color: var(--accent-cyan); display: block;">📱 ${b.cliente_telefono}</span>` : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style="color: var(--text-main); font-size: 0.88rem;">${b.sistema_titulo}</strong>
                        <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">${b.nombre_empresa}</span>
                        <code style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-cyan);">${b.slug_empresa}.misistema.com</code>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style="color: var(--primary); font-size: 0.88rem; display: block;">$${parseFloat(b.monto_pago || 0).toFixed(2)} USD</strong>
                        <span style="font-size: 0.75rem; color: var(--text-dim);">${b.metodo_pago || 'TRANSFERENCIA'}</span>
                        ${b.referencia_pago ? `<div style="font-family: var(--font-mono); font-size: 0.72rem; background: #e0f2fe; color: #0369a1; padding: 0.15rem 0.35rem; border-radius: 4px; display: inline-block; margin-top: 0.2rem;">${b.referencia_pago}</div>` : ''}
                      </div>
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.83rem;">
                      ${fechaCompra}
                    </td>
                    <td>
                      ${isPending ? `
                        <span class="status-chip" style="background: #fef3c7; color: #92400e; border: 1px solid #fde68a;">
                          <span class="status-dot" style="background: #f59e0b;"></span>
                          Pendiente Verificación
                        </span>
                      ` : isRejected ? `
                        <span class="status-chip" style="background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;">
                          <span class="status-dot" style="background: #ef4444;"></span>
                          Rechazada
                        </span>
                      ` : `
                        <span class="status-chip active">
                          <span class="status-dot"></span>
                          Activa / Aprobada
                        </span>
                      `}
                    </td>
                    <td style="text-align: right;">
                      ${isPending ? `
                        <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
                          <button class="btn btn-success btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="window.handleApproveBuyer(${b.id_licencia})">
                            <i data-lucide="check" style="width: 12px; height: 12px;"></i>
                            Aprobar Pago
                          </button>
                          <button class="btn btn-danger btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="window.handleRejectBuyer(${b.id_licencia})">
                            <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                            Rechazar
                          </button>
                        </div>
                      ` : `
                        <span style="font-size: 0.78rem; color: #16a34a; font-weight: 700;">✓ Verificado</span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${adminSubTab === 'precios' ? `
        <!-- TAB 2: GESTIÓN DE PRECIOS DEL CATÁLOGO -->
        <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.2rem;">
                Ajuste de Precios en Vivo
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
                Modifica el precio en dólares (USD) de cualquiera de tus sistemas. El cambio se aplica de inmediato en la tienda y en Neon Cloud.
              </p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${sistemas.map(s => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: #f8fafc; gap: 1rem; flex-wrap: wrap;">
                
                <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 260px;">
                  <img src="${s.banner_url || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800'}" alt="${s.titulo}" style="width: 56px; height: 56px; border-radius: var(--radius-sm); object-fit: cover;" />
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <strong style="font-size: 1.05rem; color: var(--text-main);">${s.titulo}</strong>
                      <span class="badge badge-primary" style="font-size: 0.7rem;">${s.codigo}</span>
                    </div>
                    <span style="font-size: 0.82rem; color: var(--text-muted); display: block;">${s.url_base}</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <span style="font-size: 0.9rem; font-weight: 800; color: var(--text-main);">$</span>
                    <input 
                      type="number" 
                      id="price-input-${s.id_sistema}" 
                      class="form-input" 
                      style="width: 110px; font-weight: 800; font-size: 1.1rem; text-align: center; color: var(--primary); padding: 0.4rem;" 
                      value="${s.precio}" 
                      step="1"
                    />
                    <span style="font-size: 0.75rem; color: var(--text-dim); font-weight: 700;">USD</span>
                  </div>

                  <button 
                    type="button" 
                    class="btn btn-primary btn-sm" 
                    style="padding: 0.55rem 1rem;" 
                    onclick="window.savePrice(${s.id_sistema})"
                  >
                    <i data-lucide="save" style="width: 14px; height: 14px;"></i>
                    Guardar Precio
                  </button>
                </div>

              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${adminSubTab === 'pagos' ? `
        <!-- TAB 3: CONFIGURACIÓN DE CUENTAS DE COBRO (CBU/ALIAS) -->
        <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; max-width: 760px; margin: 0 auto; box-shadow: var(--shadow-md);">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: #dcfce7; color: #166534; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="wallet" style="width: 22px; height: 22px;"></i>
            </div>
            <div>
              <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin: 0;">Datos de Cobro por Transferencia</h3>
              <span style="font-size: 0.84rem; color: var(--text-muted);">Estos son los datos que verán tus clientes al momento de pagar en el checkout.</span>
            </div>
          </div>

          <form onsubmit="window.handleSavePaymentConfig(event)" style="margin-top: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div>
                <label class="form-label">Alias de Mercado Pago / Banco:</label>
                <input 
                  type="text" 
                  id="pay-alias" 
                  class="form-input" 
                  style="font-weight: 800; color: #065f46; background: #f0fdf4;" 
                  value="${store.configPagos?.alias_transferencia || 'emiliaponceg.mp'}" 
                  required 
                />
              </div>

              <div>
                <label class="form-label">CBU / CVU (22 Dígitos):</label>
                <input 
                  type="text" 
                  id="pay-cvu" 
                  class="form-input" 
                  style="font-family: var(--font-mono); font-size: 0.9rem;" 
                  value="${store.configPagos?.cvu_transferencia || '0000003100085492019482'}" 
                  required 
                />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
              <div>
                <label class="form-label">Nombre del Titular de la Cuenta:</label>
                <input 
                  type="text" 
                  id="pay-titular" 
                  class="form-input" 
                  value="${store.configPagos?.titular || 'Emilia Ponce'}" 
                  required 
                />
              </div>

              <div>
                <label class="form-label">Entidad Bancaria o Billetera:</label>
                <input 
                  type="text" 
                  id="pay-banco" 
                  class="form-input" 
                  value="${store.configPagos?.banco || 'Mercado Pago'}" 
                  required 
                />
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="submit" class="btn btn-success" style="padding: 0.75rem 1.5rem;">
                <i data-lucide="check"></i>
                Guardar Datos de Cobro
              </button>
            </div>
          </form>
        </div>
      ` : ''}

      ${adminSubTab === 'nuevo-sistema' ? `
        <!-- TAB 4: FORMULARIO PARA PUBLICAR NUEVO SISTEMA -->
        <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; max-width: 760px; margin: 0 auto; box-shadow: var(--shadow-md);">
          <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-main); font-weight: 800;">Publicar Nuevo Software en la Tienda</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.75rem;">Completa este formulario y el producto aparecerá inmediatamente en el catálogo sin tocar código.</p>

          <form onsubmit="window.handleCreateSystem(event)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label class="form-label">Título del Sistema:</label>
                <input type="text" id="sys-title" class="form-input" placeholder="Ej: Gimnasio Pro" required />
              </div>
              <div>
                <label class="form-label">Código Único (Slug):</label>
                <input type="text" id="sys-code" class="form-input" placeholder="Ej: gym_v1" required />
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <label class="form-label">Descripción Corta (Tarjeta):</label>
              <input type="text" id="sys-short-desc" class="form-input" placeholder="Control de socios, cuotas y torniquetes." required />
            </div>

            <div style="margin-bottom: 1rem;">
              <label class="form-label">Descripción Completa:</label>
              <textarea id="sys-desc" class="form-input" rows="3" placeholder="Detalles de funcionalidades..." required></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label class="form-label">Precio en USD:</label>
                <input type="number" step="0.01" id="sys-price" class="form-input" placeholder="80.00" required />
              </div>
              <div>
                <label class="form-label">URL Base del Sistema:</label>
                <input type="text" id="sys-url" class="form-input" placeholder="http://localhost:5175" required />
              </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label class="form-label">Características Clave (Separadas por comas):</label>
              <input type="text" id="sys-features" class="form-input" placeholder="Control de accesos con QR, Cobro de cuotas recurrente, Rutinas" required />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="button" class="btn btn-secondary" onclick="window.setAdminTab('compradores')">Cancelar</button>
              <button type="submit" class="btn btn-success">
                <i data-lucide="check"></i>
                Publicar Sistema en Catálogo
              </button>
            </div>
          </form>
        </div>
      ` : ''}

    </div>
  `;
}

window.setAdminTab = (tab) => {
  adminSubTab = tab;
  store.notify();
};

window.handleApproveBuyer = async (licenciaId) => {
  if (!confirm('¿Confirmas que recibiste el dinero completo de esta transferencia en tu cuenta bancaria?')) return;
  const ok = await store.approveLicense(licenciaId);
  if (ok) {
    window.showToast('✅ Licencia aprobada y habilitada para el cliente.', 'success');
  } else {
    window.showToast('Error al aprobar licencia', 'error');
  }
};

window.handleRejectBuyer = async (licenciaId) => {
  const motivo = prompt('Ingresa el motivo del rechazo (ej: Monto transferido insuficiente):', 'Monto no coincide con el valor del sistema');
  if (!motivo) return;
  const ok = await store.rejectLicense(licenciaId, motivo);
  if (ok) {
    window.showToast('🚫 Licencia rechazada.', 'info');
  } else {
    window.showToast('Error al rechazar licencia', 'error');
  }
};

window.savePrice = async (sistemaId) => {
  const input = document.getElementById(`price-input-${sistemaId}`);
  if (!input) return;

  const newPrice = input.value;
  try {
    const updated = await store.updateSystemPrice(sistemaId, newPrice);
    window.showToast(`💰 Precio de "${updated.titulo}" actualizado a $${updated.precio} USD`, 'success');
  } catch (e) {
    window.showToast(`Error: ${e.message}`, 'error');
  }
};

window.handleSavePaymentConfig = async (e) => {
  e.preventDefault();
  const alias = document.getElementById('pay-alias').value.trim();
  const cvu = document.getElementById('pay-cvu').value.trim();
  const titular = document.getElementById('pay-titular').value.trim();
  const banco = document.getElementById('pay-banco').value.trim();

  try {
    await store.updatePaymentConfig({
      alias_transferencia: alias,
      cvu_transferencia: cvu,
      titular,
      banco
    });
    window.showToast('✅ Datos de cobro (Alias/CVU) guardados exitosamente en Neon Cloud', 'success');
  } catch (err) {
    window.showToast(`Error: ${err.message}`, 'error');
  }
};

window.handleCreateSystem = (e) => {
  e.preventDefault();
  const title = document.getElementById('sys-title').value;
  const code = document.getElementById('sys-code').value;
  const shortDesc = document.getElementById('sys-short-desc').value;
  const desc = document.getElementById('sys-desc').value;
  const price = document.getElementById('sys-price').value;
  const url = document.getElementById('sys-url').value;
  const features = document.getElementById('sys-features').value.split(',').map(f => f.trim()).filter(Boolean);

  store.addSystem({
    titulo: title,
    codigo: code,
    descripcion_corta: shortDesc,
    descripcion: desc,
    precio: price,
    url_base: url,
    caracteristicas: features,
    icono: 'box'
  });

  window.showToast(`✅ Sistema "${title}" publicado en el catálogo exitosamente.`, 'success');
  adminSubTab = 'precios';
  store.notify();
};
