import { store } from '../services/state.js';

export function renderStoreView() {
  const sistemas = store.sistemas.filter(s => s.activo);

  return `
    <div class="container animate-fade-in">
      <div class="section-header">
        <div>
          <span class="badge badge-primary" style="margin-bottom: 0.5rem;">
            <i data-lucide="shopping-bag" style="width: 12px; height: 12px;"></i>
            Tienda Oficial
          </span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Todos los Sistemas & Precios</h2>
          <p style="font-size: 0.92rem;">Explora los planes y precios transparentes de cada sistema para activar tu empresa hoy mismo.</p>
        </div>
      </div>

      <div class="systems-grid">
        ${sistemas.map(sys => `
          <div class="system-card" style="border: 1px solid var(--border-subtle);">
            <div class="system-card-image-wrap">
              <img src="${sys.banner_url}" alt="${sys.titulo}" class="system-card-image" />
              <div class="system-card-overlay"></div>
              <span class="badge badge-primary system-card-badge">
                <i data-lucide="${sys.icono}" style="width: 12px; height: 12px;"></i>
                Web App
              </span>
            </div>

            <div class="system-card-body">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
                <h3 class="system-card-title" style="margin-bottom: 0;">${sys.titulo}</h3>
                <div style="text-align: right; background: #eff6ff; padding: 0.35rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid #bfdbfe; flex-shrink: 0;">
                  <span style="font-size: 1.25rem; font-weight: 800; color: var(--primary); font-family: var(--font-mono);">$${sys.precio.toFixed(2)}</span>
                  <span style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; display: block;">${sys.moneda}</span>
                </div>
              </div>

              <p class="system-card-desc">${sys.descripcion_corta}</p>

              <ul class="feature-list">
                ${sys.caracteristicas.map(feat => `
                  <li class="feature-item">
                    <i data-lucide="check-circle-2" class="feature-icon-check" style="width: 15px; height: 15px;"></i>
                    <span>${feat}</span>
                  </li>
                `).join('')}
              </ul>

              <div class="system-card-footer">
                <div>
                  <span style="font-size: 0.72rem; color: var(--text-dim); display: block;">Modalidad:</span>
                  <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-emerald);">Licencia Completa</span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.startCheckout(${sys.id_sistema})">
                  <i data-lucide="shopping-cart" style="width: 14px; height: 14px;"></i>
                  Comprar Ahora
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
