const CONTAINER_ID = 'app-toast-container';

function getContainer(): HTMLDivElement {
  let container = document.getElementById(CONTAINER_ID) as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.style.position = 'fixed';
    container.style.top = '16px';
    container.style.right = '16px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message: string, type: 'error' | 'success' | 'info' = 'info') {
  const container = getContainer();

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '6px';
  toast.style.color = '#fff';
  toast.style.fontSize = '14px';
  toast.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
  toast.style.backgroundColor =
    type === 'error' ? '#d32f2f' : type === 'success' ? '#2e7d32' : '#323232';
  toast.style.transition = 'opacity 0.3s ease';
  toast.style.opacity = '0';

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export default showToast;
