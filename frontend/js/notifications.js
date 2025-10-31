// Sistema de Notificaciones Mejorado
class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.style.position = 'fixed';
            this.container.style.top = '20px';
            this.container.style.right = '20px';
            this.container.style.zIndex = '9999';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }
    }

    showAlert(message, type = 'info', duration = 5000) {
        const alertId = 'alert-' + Date.now();
        
        const alertHTML = `
            <div id="${alertId}" class="custom-alert ${type}">
                <div class="alert-content">
                    <div class="alert-icon">
                        ${this.getIcon(type)}
                    </div>
                    <div class="alert-message">${message}</div>
                    <button class="alert-close" onclick="notificationManager.closeAlert('${alertId}')">
                        &times;
                    </button>
                </div>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', alertHTML);

        // Auto-cerrar después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                this.closeAlert(alertId);
            }, duration);
        }

        return alertId;
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    closeAlert(alertId) {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.classList.add('hide');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }
    }

    // Notificación de éxito
    success(message, duration = 3000) {
        return this.showAlert(message, 'success', duration);
    }

    // Notificación de error
    error(message, duration = 5000) {
        return this.showAlert(message, 'error', duration);
    }

    // Notificación de advertencia
    warning(message, duration = 4000) {
        return this.showAlert(message, 'warning', duration);
    }

    // Notificación informativa
    info(message, duration = 4000) {
        return this.showAlert(message, 'info', duration);
    }

    // Modal de confirmación mejorado
    confirm(message, title = 'Confirmar') {
        return new Promise((resolve) => {
            const modalId = 'confirm-modal-' + Date.now();
            
            const modalHTML = `
                <div class="modal fade confirm-modal" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${title}</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div style="font-size: 48px; margin-bottom: 15px;">❓</div>
                                <p style="font-size: 16px; line-height: 1.5;">${message}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-danger" id="confirm-ok">Aceptar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modalElement = document.getElementById(modalId);
            const modal = new bootstrap.Modal(modalElement);
            
            modalElement.addEventListener('shown.bs.modal', () => {
                document.getElementById('confirm-ok').focus();
            });

            document.getElementById('confirm-ok').addEventListener('click', () => {
                modal.hide();
                resolve(true);
            });

            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
                resolve(false);
            });

            modal.show();
        });
    }

    // Toast para agregar al carrito
    showCartToast(productName) {
        const toast = document.createElement('div');
        toast.className = 'toast cart-toast align-items-center';
        toast.style.zIndex = '9999';
        
        toast.innerHTML = `
            <div class="toast-body">
                ✅ <strong>${productName}</strong> agregado al carrito
            </div>
        `;
        
        document.body.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, {
            animation: true,
            autohide: true,
            delay: 3000
        });
        
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
    }
}

// Instancia global
const notificationManager = new NotificationManager();