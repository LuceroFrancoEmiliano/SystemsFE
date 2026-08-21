import { store } from '../services/state.js';

let adminSubTab = 'compradores'; // 'compradores' | 'nuevo-sistema'

export function renderAdminCompradoresView() {
  const user = store.currentUser;
  if (user.rol_global !== 'ADMIN') {
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

  return `
    <div class="container animate-fade-in">
      <div class="section-header">
        <div>
          <span class="badge badge-admin" style="margin-bottom: 0.5rem;">
            <i data-lucide="shield" style="width: 12px; height: 12px;"></i>
            Panel SuperAdmin (Franco)
          </span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Control de Compradores & Nuevos Sistemas</h2>
          <p style="font-size: 0.92rem;">Monitorea quién compró tus sistemas, su estado de uso y publica nuevos programas.</p>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm ${adminSubTab === 'compradores' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setAdminTab('compradores')">
            <i data-lucide="users" style="width: 14px; height: 14px;"></i>
            Compradores y Uso (${buyers.length})
          </button>
          <button class="btn btn-sm ${adminSubTab === 'nuevo-sistema' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setAdminTab('nuevo-sistema')">
            <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i>
            Publicar Nuevo Sistema
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
                <th>Sistema</th>
                <th>Empresa Registrada</th>
                <th>Fecha Compra</th>
                <th>Último Acceso</th>
                <th>Estado de Uso</th>
              </tr>
            </thead>
            <tbody>
              ${buyers.map(b => {
                const fechaCompra = new Date(b.fecha_compra).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                const fechaAcceso = b.ultimo_acceso ? new Date(b.ultimo_acceso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Nunca';

                return `
                  <tr>
                    <td>
                      <div class="buyer-user-cell">
                        <img src="${b.cliente_avatar}" alt="${b.cliente_nombre}" style="width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border-subtle);" />
                        <div>
                          <strong style="display: block; color: var(--text-main); font-size: 0.88rem;">${b.cliente_nombre}</strong>
                          <span style="font-size: 0.75rem; color: var(--text-dim);">${b.cliente_email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style="color: var(--text-main); font-size: 0.88rem;">${b.sistema_titulo}</strong>
                    </td>
                    <td>
                      <div>
                        <strong style="color: var(--text-main); font-size: 0.88rem; display: block;">${b.nombre_empresa}</strong>
                        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">${b.slug_empresa}.misistema.com</span>
                      </div>
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.83rem;">
                      ${fechaCompra}
                    </td>
                    <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">
                      ${fechaAcceso}
                    </td>
                    <td>
                      ${b.en_uso ? `
                        <span class="status-chip active">
                          <span class="status-dot"></span>
                          En Uso / Activo
                        </span>
                      ` : `
                        <span class="status-chip idle">
                          <span class="status-dot"></span>
                          Sin Actividad
                        </span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <!-- TAB 2: FORMULARIO PARA PUBLICAR NUEVO SISTEMA -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; max-width: 760px; margin: 0 auto;">
          <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: #fff;">Publicar Nuevo Software en la Tienda</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.75rem;">Completa este formulario y el producto aparecerá inmediatamente en el catálogo sin tocar código HTML.</p>

          <form onsubmit="window.handleCreateSystem(event)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label class="form-label">Título del Sistema:</label>
                <input type="text" id="sys-title" class="form-input" placeholder="Ej: BarberShop Pro" required />
              </div>
              <div>
                <label class="form-label">Código Único (Slug):</label>
                <input type="text" id="sys-code" class="form-input" placeholder="Ej: barbershop_v1" required />
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <label class="form-label">Descripción Corta (Tarjeta):</label>
              <input type="text" id="sys-short-desc" class="form-input" placeholder="Gestión de turnos, caja y barberos." required />
            </div>

            <div style="margin-bottom: 1rem;">
              <label class="form-label">Descripción Completa:</label>
              <textarea id="sys-desc" class="form-input" rows="3" placeholder="Detalles de funcionalidades..." required></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label class="form-label">Precio en USD (Oculto hasta el pago):</label>
                <input type="number" step="0.01" id="sys-price" class="form-input" placeholder="35.00" required />
              </div>
              <div>
                <label class="form-label">URL Base del Sistema Secundario:</label>
                <input type="text" id="sys-url" class="form-input" placeholder="http://localhost:4004" required />
              </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label class="form-label">Características Clave (Separadas por comas):</label>
              <input type="text" id="sys-features" class="form-input" placeholder="Agenda de turnos online, Control de comisiones, Recordatorios por WhatsApp" required />
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
      `}
    </div>
  `;
}

window.setAdminTab = (tab) => {
  adminSubTab = tab;
  store.notify();
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
  adminSubTab = 'compradores';
  store.notify();
};
