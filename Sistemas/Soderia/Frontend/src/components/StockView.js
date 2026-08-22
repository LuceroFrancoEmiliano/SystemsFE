import { store } from '../services/state.js';

export function renderStockView() {
  const stock = store.metricas.stock_planta;

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            Stock & Depósito en Planta
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Control de envases llenos para la venta y envases vacíos para lavado y llenado.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        ${stock.map(s => `
          <div class="card">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
              <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: #e0f2fe; color: var(--primary); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="package" style="width: 22px; height: 22px;"></i>
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 700;">${s.tipo_envase.replace('_', ' ')}</h3>
                <span style="font-size: 0.75rem; color: var(--text-dim);">Envase Retornable</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div style="background: #dcfce7; padding: 1rem; border-radius: var(--radius-sm); text-align: center;">
                <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #15803d; display: block;">Llenos en Depósito</span>
                <strong style="font-size: 1.8rem; color: #15803d; font-family: var(--font-mono);">${s.llenos}</strong>
              </div>

              <div style="background: #fef3c7; padding: 1rem; border-radius: var(--radius-sm); text-align: center;">
                <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #b45309; display: block;">Vacíos a Llenar</span>
                <strong style="font-size: 1.8rem; color: #b45309; font-family: var(--font-mono);">${s.vacios}</strong>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="window.showToast('Producción registrada', 'success')">
              + Registrar Llenado de Planta
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
