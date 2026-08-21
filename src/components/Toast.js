export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-root';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let iconName = 'info';
  let color = 'var(--primary-light)';
  if (type === 'success') {
    iconName = 'check-circle';
    color = 'var(--accent-emerald)';
  } else if (type === 'error') {
    iconName = 'alert-triangle';
    color = 'var(--accent-rose)';
  }

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="color: ${color}; width: 20px; height: 20px; flex-shrink: 0;"></i>
    <span style="font-size: 0.88rem; font-weight: 500;">${message}</span>
  `;

  container.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

window.showToast = showToast;
