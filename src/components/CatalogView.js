import { store } from '../services/state.js';

export function renderCatalogView() {
  const sistemas = store.sistemas.filter(s => s.activo);
  const isAdmin = store.currentUser?.rol_global === 'ADMIN';

  return `
    <div class="container animate-fade-in">
      <div class="section-header">
        <div>
          <span class="badge badge-cyan" style="margin-bottom: 0.5rem;">Soluciones Disponibles</span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Catálogo de Software Especializado</h2>
          <p style="font-size: 0.92rem;">Sistemas completos listos para desplegar la instancia de tu negocio en segundos.</p>
        </div>
        ${isAdmin ? `
          <button class="btn btn-primary btn-sm" onclick="window.navigate('admin')">
            <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i>
            + Publicar Nuevo Sistema
          </button>
        ` : ''}
      </div>

      ${sistemas.length === 0 ? `
        <div style="background: #ffffff; border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 4rem 2rem; text-align: center; box-shadow: var(--shadow-sm); margin-bottom: 4rem;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; color: var(--primary); margin: 0 auto 1.25rem;">
            <i data-lucide="box" style="width: 28px; height: 28px;"></i>
          </div>
          <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">No hay sistemas publicados aún</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 1.5rem;">
            ${isAdmin ? 'Como SuperAdmin, puedes dar de alta tu primer software desde el formulario del Panel de Administración.' : 'Próximamente se publicarán nuevas soluciones de software para empresas.'}
          </p>
          ${isAdmin ? `
            <button class="btn btn-primary" onclick="window.navigate('admin')">
              <i data-lucide="plus"></i>
              Publicar Mi Primer Sistema
            </button>
          ` : ''}
        </div>
      ` : `
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
      `}
    </div>
  `;
}
