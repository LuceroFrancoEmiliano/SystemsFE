import { store } from '../services/state.js';

export function renderManualsView() {
  const sistemas = store.sistemas;

  return `
    <div class="container animate-fade-in">
      <div class="section-header">
        <div>
          <span class="badge badge-cyan" style="margin-bottom: 0.5rem;">
            <i data-lucide="book-open" style="width: 12px; height: 12px;"></i>
            Centro de Documentación
          </span>
          <h2 style="font-size: 1.8rem; font-weight: 800;">Manuales de Usuario y Guías</h2>
          <p style="font-size: 0.92rem;">Aprende a configurar y exprimir al máximo cada una de las herramientas de software empresarial.</p>
        </div>
      </div>

      <!-- Info banner -->
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); padding: 1.25rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; box-shadow: var(--shadow-sm);">
          <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        </div>
        <div>
          <strong style="color: var(--text-main); font-size: 0.92rem; display: block;">Documentación Oficial en Preparación</strong>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">
            Los manuales paso a paso completos se publicarán e integrarán detalladamente al finalizar el desarrollo de cada sistema.
          </p>
        </div>
      </div>

      ${sistemas.length === 0 ? `
        <div style="background: #ffffff; border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 4rem 2rem; text-align: center; box-shadow: var(--shadow-sm); margin-bottom: 4rem;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #f0f9ff; display: flex; align-items: center; justify-content: center; color: var(--accent-cyan); margin: 0 auto 1.25rem;">
            <i data-lucide="book-open" style="width: 28px; height: 28px;"></i>
          </div>
          <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">No hay manuales cargados</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin: 0 auto;">
            A medida que publiques sistemas en el catálogo, sus respectivas guías y manuales aparecerán organizados en esta sección.
          </p>
        </div>
      ` : `
        <!-- Grid de Manuales por Sistema -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 4rem;">
          ${sistemas.map(sys => `
            <div class="system-card" style="padding: 1.5rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 38px; height: 38px; border-radius: var(--radius-sm); background: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                    <i data-lucide="${sys.icono || 'book'}" style="width: 20px; height: 20px;"></i>
                  </div>
                  <div>
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${sys.titulo}</h3>
                    <span style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${sys.codigo}</span>
                  </div>
                </div>
                <span class="badge badge-primary" style="font-size: 0.68rem;">Manual v1.0</span>
              </div>

              <p style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.5;">
                ${sys.manual_resumen || sys.descripcion_corta}
              </p>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 0.85rem; margin-bottom: 1.25rem;">
                <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); display: block; margin-bottom: 0.4rem;">Contenido del Manual:</span>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.8rem; color: #334155;">
                  <li style="display: flex; align-items: center; gap: 0.45rem;">
                    <i data-lucide="check" style="width: 12px; height: 12px; color: var(--accent-emerald);"></i>
                    1. Configuración de datos de empresa y slug
                  </li>
                  <li style="display: flex; align-items: center; gap: 0.45rem;">
                    <i data-lucide="check" style="width: 12px; height: 12px; color: var(--accent-emerald);"></i>
                    2. Creación y asignación de roles a empleados
                  </li>
                  <li style="display: flex; align-items: center; gap: 0.45rem;">
                    <i data-lucide="check" style="width: 12px; height: 12px; color: var(--accent-emerald);"></i>
                    3. Flujo operativo diario y reportes
                  </li>
                </ul>
              </div>

              <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="window.showToast('📖 El visor interactivo del manual se abrirá al completar el desarrollo del software.', 'info')">
                <i data-lucide="file-text" style="width: 14px; height: 14px;"></i>
                Ver Guía del Usuario
              </button>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}
