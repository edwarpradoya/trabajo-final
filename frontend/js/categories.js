class CategoriesManager {
    constructor() {
        this.categories = [];
        this.init();
    }

    async init() {
        if (!auth.isAdmin()) {
            notificationManager.warning('No tienes permisos de administrador');
            window.location.href = 'index.html';
            return;
        }
        await this.loadCategories();
    }

    async loadCategories() {
        try {
            const response = await auth.makeAuthenticatedRequest('/admin/categories');
            if (response.ok) {
                this.categories = await response.json();
                this.renderCategories();
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            notificationManager.error('Error al cargar categorías: ' + error.message);
        }
    }

    renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container) return;

        if (this.categories.length === 0) {
            container.innerHTML = '<p class="text-center">No hay categorías registradas.</p>';
            return;
        }

        container.innerHTML = this.categories.map(category => `
            <div class="category-item d-flex justify-content-between align-items-center p-3 border-bottom">
                <div>
                    <h5 class="mb-1">${category.name}</h5>
                    <p class="text-muted mb-0">${category.description || 'Sin descripción'}</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">
                    Eliminar
                </button>
            </div>
        `).join('');
    }

    async createCategory(categoryData) {
        try {
            const response = await auth.makeAuthenticatedRequest('/admin/categories', {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });

            if (response.ok) {
                notificationManager.success('Categoría creada exitosamente');
                await this.loadCategories();
                return true;
            } else {
                const error = await response.json();
                notificationManager.error('Error: ' + error.message);
                return false;
            }
        } catch (error) {
            notificationManager.error('Error: ' + error.message);
            return false;
        }
    }

    async deleteCategory(categoryId) {
        const confirmed = await notificationManager.confirm(
            '¿Estás seguro de que quieres eliminar esta categoría?',
            'Eliminar Categoría'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await auth.makeAuthenticatedRequest(`/admin/categories/${categoryId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                notificationManager.success('Categoría eliminada exitosamente');
                await this.loadCategories();
                return true;
            } else {
                const error = await response.json();
                notificationManager.error('Error: ' + error.message);
                return false;
            }
        } catch (error) {
            notificationManager.error('Error: ' + error.message);
            return false;
        }
    }
}

// Instancia global
const categoriesManager = new CategoriesManager();

function openCreateCategoryModal() {
    const modalHtml = `
        <div class="modal fade" id="categoryModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Crear Categoría</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="categoryForm">
                            <div class="mb-3">
                                <label class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="categoryName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descripción</label>
                                <textarea class="form-control" id="categoryDescription" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="saveCategory()">
                            Crear Categoría
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('categoryModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
}

async function saveCategory() {
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };

    await categoriesManager.createCategory(categoryData);

    const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
    modal.hide();
}

function deleteCategory(categoryId) {
    categoriesManager.deleteCategory(categoryId);
}