// Sistema de Notificaciones Mejorado y Estético
class NotificationSystem {
    constructor() {
        this.containerId = 'notification-container';
        this.notificationCount = 0;
        this.initContainer();
    }

    // Inicializar el contenedor de notificaciones
    initContainer() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Mostrar notificación
    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        const container = this.initContainer();
        
        // Agregar progress bar
        const progressBar = this.createProgressBar(duration);
        notification.appendChild(progressBar);
        
        container.appendChild(notification);
        this.notificationCount++;

        // Auto-remover después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        return notification;
    }

    // Crear elemento de notificación
    createNotification(message, type) {
        const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `custom-alert ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">${icons[type] || 'ℹ'}</span>
                <span class="alert-message">${message}</span>
                <button class="alert-close" onclick="notifier.hideNotificationById('${notificationId}')">×</button>
            </div>
        `;

        return notification;
    }

    // Crear barra de progreso
    createProgressBar(duration) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'notification-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress-bar';
        progressBar.style.width = '100%';
        progressBar.style.transition = `width ${duration}ms linear`;
        
        progressContainer.appendChild(progressBar);
        
        // Iniciar animación de la barra de progreso
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 50);

        return progressContainer;
    }

    // Ocultar notificación por ID
    hideNotificationById(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            this.hideNotification(notification);
        }
    }

    // Ocultar notificación con animación
    hideNotification(notification) {
        if (!notification || notification.classList.contains('hide')) {
            return;
        }

        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
                this.notificationCount--;
                
                // Reorganizar notificaciones restantes
                this.reorganizeNotifications();
            }
        }, 400);
    }

    // Reorganizar notificaciones después de eliminar una
    reorganizeNotifications() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const notifications = Array.from(container.children);
        notifications.forEach((notification, index) => {
            notification.style.transform = `translateY(${index * -15}px)`;
        });
    }

    // Métodos rápidos para tipos específicos
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }

    // Notificación específica para carrito
    cartSuccess(productName, quantity = 1) {
        const message = quantity > 1 ? 
            `${quantity} × "${productName}" agregados al carrito` :
            `"${productName}" agregado al carrito`;
        
        return this.success(`🛒 ${message}`, 3000);
    }

    // Notificación de stock bajo
    lowStock(productName, availableStock) {
        this.warning(`📦 Stock bajo: "${productName}" (${availableStock} disponibles)`);
    }

    // Notificación de producto agotado
    outOfStock(productName) {
        this.error(`❌ "${productName}" agotado`);
    }

    // Notificación de login
    loginSuccess(username) {
        this.success(`👋 ¡Bienvenido, ${username}!`, 3000);
    }

    // Notificación de logout
    logoutSuccess() {
        this.info('👋 Sesión cerrada correctamente', 3000);
    }

    // Limpiar todas las notificaciones
    clearAll() {
        const container = document.getElementById(this.containerId);
        if (container) {
            const notifications = Array.from(container.children);
            notifications.forEach(notification => {
                this.hideNotification(notification);
            });
        }
    }
}

// Toast para el carrito (más simple)
class CartToast {
    static show(message, duration = 2500) {
        const toast = document.createElement('div');
        toast.className = 'position-fixed top-0 start-50 translate-middle-x mt-3 cart-toast';
        toast.style.zIndex = '9999';
        
        toast.innerHTML = `
            <div class="toast show" role="alert">
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remover
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    static productAdded(productName, quantity = 1) {
        const message = quantity > 1 ? 
            `✅ ${quantity} × ${productName} agregados al carrito` :
            `✅ ${productName} agregado al carrito`;
        this.show(message);
    }
}

// Modal de confirmación mejorado
class ConfirmModal {
    static show(options) {
        return new Promise((resolve) => {
            const modalId = 'confirm-modal-' + Date.now();
            
            const modalHTML = `
                <div class="modal confirm-modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${options.title || 'Confirmar acción'}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="text-center mb-3">
                                    <i class="fas fa-question-circle fa-3x text-primary mb-3"></i>
                                    <p class="mb-0">${options.message}</p>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                    ${options.cancelText || 'Cancelar'}
                                </button>
                                <button type="button" class="btn btn-primary" id="confirm-btn">
                                    ${options.confirmText || 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Agregar modal al DOM
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer);

            const modalElement = document.getElementById(modalId);
            const modal = new bootstrap.Modal(modalElement);

            // Configurar evento de confirmación
            document.getElementById('confirm-btn').onclick = () => {
                modal.hide();
                resolve(true);
            };

            // Configurar evento cuando se cierra el modal
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
                resolve(false);
            });

            modal.show();
        });
    }
}

// Instancia global del sistema de notificaciones
const notificationManager = new NotificationSystem();

// Función de utilidad para mostrar notificaciones provisionales
function showTempNotification(message, type = 'info', duration = 3000) {
    return notificationManager.show(message, type, duration);
}

// Hacer disponible globalmente
window.notificationManager = notificationManager;
window.showTempNotification = showTempNotification;
window.CartToast = CartToast;
window.ConfirmModal = ConfirmModal;
