import { store } from '../services/state.js';

export function renderCatalogView() {
  const sistemas = store.sistemas.filter(s => s.activo);

  return `
    <div class="container animate-fade-in">
      <div class="section-header">
        <div>
          <span class="badge badge-cyan" style="margin-bottom: 0.5rem;">Soluciones Disponibles</span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Catálogo de Software Especializado</h2>
          <p style="font-size: 0.92rem;">Sistemas completos listos para desplegar la instancia de tu negocio en segundos.</p>
        </div>
      </div>

      <div class="systems-grid">
        ${sistemas.map(sys => `
          <div class="system-card">
            <div class="system-card-image-wrap">
              <img src="${sys.banner_url}" alt="${sys.titulo}" class="system-card-image" />
              <div class="system-card-overlay"></div>
              <span class="badge badge-primary system-card-badge">
                <i data-lucide="${sys.icono}" style="width: 12px; height: 12px;"></i>
                Web App Cloud
              </span>
            </div>

            <div class="system-card-body">
              <h3 class="system-card-title">${sys.titulo}</h3>
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
                <span class="system-access-hint">
                  <i data-lucide="zap" style="width: 13px; height: 13px; display: inline;"></i>
                  Instancia Dedicada
                </span>
                <button class="btn btn-primary btn-sm" onclick="window.startCheckout(${sys.id_sistema})">
                  Adquirir Sistema
                  <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
