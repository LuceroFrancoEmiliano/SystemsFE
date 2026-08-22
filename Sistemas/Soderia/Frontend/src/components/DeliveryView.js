import { store } from '../services/state.js';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function renderDeliveryView() {
  const dia = store.diaSeleccionado;
  const clientesDelDia = store.getClientesDelDia(dia);
  
  const totalParadas = clientesDelDia.length;
  const entregadasOK = clientesDelDia.filter(c => store.getEstadoEntregaCliente(c.id_cliente)?.estado === 'OK').length;
  const noEstaban = clientesDelDia.filter(c => store.getEstadoEntregaCliente(c.id_cliente)?.estado === 'NO_ESTABA').length;
  const pendientes = totalParadas - (entregadasOK + noEstaban);

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            Rutas de Reparto Automáticas
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Las entregas se asignan solas por día de la semana sin que tengas que programar camiones manualmente.
          </p>
        </div>
      </div>

      <!-- Selector de Día Semanal -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <strong style="font-size: 0.88rem; color: var(--text-main);">Seleccionar Día de Reparto:</strong>
          <span class="badge badge-blue">Ruta Automática</span>
        </div>

        <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem;">
          ${DIAS.map(d => {
            const isSelected = store.diaSeleccionado === d;
            const countDia = store.clientes.filter(c => (c.dias_visita || []).includes(d)).length;
            return `
              <button 
                type="button" 
                class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm"
                style="padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;"
                onclick="window.selectAdminDeliveryDay('${d}')"
              >
                ${d} (${countDia} clientes)
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Métricas de la Jornada para el Día Seleccionado -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: #e0f2fe; color: #0284c7;">
            <i data-lucide="map-pin" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Total Paradas (${dia})</span>
            <strong style="display: block; font-size: 1.5rem; color: var(--text-main);">${totalParadas}</strong>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #dcfce7; color: #15803d;">
            <i data-lucide="check-circle-2" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Entregadas OK</span>
            <strong style="display: block; font-size: 1.5rem; color: var(--accent-emerald); font-family: var(--font-mono);">${entregadasOK}</strong>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #fee2e2; color: #dc2626;">
            <i data-lucide="x-circle" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">No Estaban</span>
            <strong style="display: block; font-size: 1.5rem; color: #dc2626; font-family: var(--font-mono);">${noEstaban}</strong>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: #fef3c7; color: #b45309;">
            <i data-lucide="clock" style="width: 24px; height: 24px;"></i>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Pendientes</span>
            <strong style="display: block; font-size: 1.5rem; color: #b45309; font-family: var(--font-mono);">${pendientes}</strong>
          </div>
        </div>
      </div>

      <!-- Tabla de Entregas Programadas para el Día -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">
            Clientes a Visitar el ${dia}
          </h3>
        </div>

        ${totalParadas === 0 ? `
          <div style="padding: 3rem 1rem; text-align: center;">
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
              No hay clientes asignados para entrega el día ${dia}.
            </p>
            <button class="btn btn-primary btn-sm" onclick="window.navigateSod('clientes')">
              Configurar Clientes y Días
            </button>
          </div>
        ` : `
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Sifones Actuales</th>
                  <th>Bidones Actuales</th>
                  <th>Saldo Deuda</th>
                  <th>Estado Hoy</th>
                </tr>
              </thead>
              <tbody>
                ${clientesDelDia.map((c, idx) => {
                  const st = store.getEstadoEntregaCliente(c.id_cliente);
                  return `
                    <tr>
                      <td><strong style="color: var(--text-dim);">#${idx + 1}</strong></td>
                      <td><strong>${c.nombre}</strong></td>
                      <td>${c.direccion}</td>
                      <td><strong style="color: var(--primary);">${c.sifones_prestados || 0}</strong> unid.</td>
                      <td><strong style="color: var(--accent-cyan);">${c.bidones_prestados || 0}</strong> unid.</td>
                      <td>
                        <strong style="color: ${(c.saldo_deudor || 0) > 0 ? '#dc2626' : '#15803d'}; font-family: var(--font-mono);">
                          $${(c.saldo_deudor || 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        ${st?.estado === 'OK' ? `
                          <span class="badge badge-green">
                            <i data-lucide="check" style="width: 12px; height: 12px; display: inline;"></i>
                            OK Entregado ($${(st.monto_cobrado || 0).toFixed(2)})
                          </span>
                        ` : st?.estado === 'NO_ESTABA' ? `
                          <span class="badge" style="background: #fee2e2; color: #dc2626;">
                            <i data-lucide="x" style="width: 12px; height: 12px; display: inline;"></i>
                            No Estaba
                          </span>
                        ` : `
                          <span class="badge badge-blue">
                            ⏳ En Calle / Pendiente
                          </span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

    </div>
  `;
}

window.selectAdminDeliveryDay = (dia) => {
  store.setDiaSeleccionado(dia);
};
