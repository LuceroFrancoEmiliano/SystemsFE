import { store } from '../services/state.js';

export function renderContactView() {
  const contactEmail = store.contactEmail || 'franco.soporte@systems.com';

  return `
    <div class="container animate-fade-in" style="max-width: 860px; margin: 0 auto 4rem;">
      <div class="section-header" style="text-align: center; display: block; border-bottom: none; margin-bottom: 2rem;">
        <span class="badge badge-primary" style="margin-bottom: 0.5rem;">
          <i data-lucide="mail" style="width: 12px; height: 12px;"></i>
          Canal de Soporte Directo
        </span>
        <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem;">Contacto Directo</h2>
        <p style="font-size: 1rem; color: var(--text-muted); max-width: 580px; margin: 0 auto;">
          Para consultas comerciales, asesoramiento de software, personalizaciones o soporte técnico, la atención se realiza <strong>exclusivamente vía e-mail</strong>.
        </p>
      </div>

      <!-- Tarjeta Principal de Contacto -->
      <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-md); margin-bottom: 2rem;">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 2rem;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #eff6ff; border: 1px solid #bfdbfe; display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 1rem; box-shadow: var(--shadow-sm);">
            <i data-lucide="send" style="width: 28px; height: 28px;"></i>
          </div>
          <h3 style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">Escríbeme por Correo Electrónico</h3>
          <span style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.25rem;">Respuesta garantizada en menos de 24 horas hábiles.</span>

          <!-- Email Badge con Copiar -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <i data-lucide="at-sign" style="width: 18px; height: 18px; color: var(--primary);"></i>
            <span style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: 700; color: var(--text-main);" id="contact-email-text">${contactEmail}</span>
            <button class="btn btn-secondary btn-sm" onclick="window.copyContactEmail('${contactEmail}')" title="Copiar correo">
              <i data-lucide="copy" style="width: 13px; height: 13px;"></i>
              Copiar
            </button>
          </div>

          <a href="mailto:${contactEmail}?subject=Consulta%20sobre%20Sistemas%20Web" class="btn btn-primary" style="padding: 0.8rem 2rem; font-size: 1rem;">
            <i data-lucide="mail"></i>
            Abrir mi Cliente de Correo
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 2rem;" />

        <!-- Formulario Rápido que abre el Mail con el Asunto y Mensaje -->
        <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem;">
          O redacta tu mensaje aquí para enviarlo:
        </h4>

        <form onsubmit="window.handleSendEmail(event, '${contactEmail}')">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label class="form-label">Tu Nombre:</label>
              <input type="text" id="contact-name" class="form-input" placeholder="Ej: Juan Perez" required />
            </div>
            <div>
              <label class="form-label">Sistema de Interés:</label>
              <select id="contact-system" class="form-input">
                <option value="General">Consulta General</option>
                <option value="Sodería Cloud Pro">Sodería Cloud Pro</option>
                <option value="GymMaster Suite">GymMaster Suite</option>
                <option value="OmniPoint Facturación">OmniPoint Facturación & Stock</option>
                <option value="Desarrollo a Medida">Desarrollo de Nuevo Software</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <label class="form-label">Asunto:</label>
            <input type="text" id="contact-subject" class="form-input" placeholder="Ej: Consulta sobre implementación en mi empresa" required />
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label class="form-label">Mensaje o Consulta:</label>
            <textarea id="contact-message" class="form-input" rows="4" placeholder="Escribe aquí tu consulta en detalle..." required></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="submit" class="btn btn-success">
              <i data-lucide="send"></i>
              Enviar Correo Electrónico
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

window.copyContactEmail = (email) => {
  navigator.clipboard.writeText(email);
  window.showToast(`📋 Correo "${email}" copiado al portapapeles.`, 'success');
};

window.handleSendEmail = (e, targetEmail) => {
  e.preventDefault();
  const name = document.getElementById('contact-name').value;
  const sys = document.getElementById('contact-system').value;
  const subject = document.getElementById('contact-subject').value;
  const msg = document.getElementById('contact-message').value;

  const fullSubject = encodeURIComponent(`[${sys}] ${subject}`);
  const body = encodeURIComponent(`Hola Franco,\n\nMi nombre es ${name}.\n\nConsulta:\n${msg}\n\nSaludos!`);

  window.location.href = `mailto:${targetEmail}?subject=${fullSubject}&body=${body}`;
  window.showToast('✉️ Abriendo tu aplicación de correo...', 'info');
};
