import { store } from '../services/state.js';

export function renderDashboardView() {
  const clientes = store.clientes;
  const sifonesCalle = clientes.reduce((acc, c) => acc + c.sifones_prestados, 0);
  const bidonesCalle = clientes.reduce((acc, c) => acc + c.bidones_prestados, 0);
  const deudaTotal = clientes.reduce((acc, c) => acc + c.saldo_deudor, 0);

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            Panel de Control — ${store.empresa.nombre_empresa}
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Resumen operativo de envases en calle, clientes y stock en planta.
          </p>
        </div>

        <button class="btn btn-primary" onclick="window.navigateSod('reparto')">
          <i data-lucide="truck" style="width: 16px; height: 16px;"></i>
          Iniciar Reparto del Día
        </button>
      </div>

      <!-- Tarjetas KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: #e0f2fe; color: #0284c7;">
            <i data-lucide="users" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Clientes Activos</span>
            <strong style="display: block; font-size: 1.5rem; color: var(--text-main);">${clientes.length}</strong>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #dcfce7; color: #15803d;">
            <i data-lucide="droplet" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Sifones en Calle</span>
            <strong style="display: block; font-size: 1.5rem; color: var(--accent-emerald); font-family: var(--font-mono);">${sifonesCalle}</strong>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #f0fdfa; color: #0d9488;">
            <i data-lucide="container" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Bidones en Calle</span>
            <strong style="display: block; font-size: 1.5rem; color: #0d9488; font-family: var(--font-mono);">${bidonesCalle}</strong>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #fee2e2; color: #dc2626;">
            <i data-lucide="dollar-sign" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Deuda por Cobrar</span>
            <strong style="display: block; font-size: 1.5rem; color: #dc2626; font-family: var(--font-mono);">$${deudaTotal.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <!-- Resumen en 2 Columnas -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        
        <!-- Últimos Clientes y Estado de Envases -->
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Estado de Clientes y Envases</h3>
            <button class="btn btn-secondary btn-sm" onclick="window.navigateSod('clientes')">Ver Todos</button>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Zona</th>
                  <th>Sifones</th>
                  <th>Bidones</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                ${clientes.slice(0, 5).map(c => `
                  <tr>
                    <td>
                      <strong>${c.nombre}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-dim); display: block;">${c.direccion}</span>
                    </td>
                    <td><span class="badge badge-blue">${c.nombre_zona}</span></td>
                    <td><strong>${c.sifones_prestados}</strong> unid.</td>
                    <td><strong>${c.bidones_prestados}</strong> unid.</td>
                    <td>
                      <span style="font-weight: 700; color: ${c.saldo_deudor > 0 ? '#dc2626' : '#15803d'}; font-family: var(--font-mono);">
                        $${c.saldo_deudor.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stock en Planta -->
        <div class="card">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem;">Stock en Planta</h3>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-sm);">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); font-weight: 700;">Sifones de Soda</span>
              <div style="display: flex; justify-content: space-between; margin-top: 0.4rem;">
                <span style="color: #15803d; font-weight: 700;">150 Llenos</span>
                <span style="color: #b45309; font-weight: 700;">80 Vacíos</span>
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-sm);">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); font-weight: 700;">Bidones de 20 Litros</span>
              <div style="display: flex; justify-content: space-between; margin-top: 0.4rem;">
                <span style="color: #15803d; font-weight: 700;">45 Llenos</span>
                <span style="color: #b45309; font-weight: 700;">20 Vacíos</span>
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-sm);">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); font-weight: 700;">Bidones de 12 Litros</span>
              <div style="display: flex; justify-content: space-between; margin-top: 0.4rem;">
                <span style="color: #15803d; font-weight: 700;">30 Llenos</span>
                <span style="color: #b45309; font-weight: 700;">15 Vacíos</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
