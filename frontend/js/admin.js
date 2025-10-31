// Funciones para administración de productos
class AdminManager {
    constructor() {
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadCategories();
    }

    async loadCategories() {
        try {
            const response = await auth.makeAuthenticatedRequest('/admin/categories');
            if (response.ok) {
                this.categories = await response.json();
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            if (typeof notificationManager !== 'undefined') {
                notificationManager.error('Error al cargar categorías: ' + error.message);
            } else {
                alert('Error al cargar categorías: ' + error.message);
            }
        }
    }

    async createProduct(productData) {
        try {
            const response = await auth.makeAuthenticatedRequest('/admin/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                if (typeof notificationManager !== 'undefined') {
                    notificationManager.success('Producto creado exitosamente');
                } else {
                    alert('✅ Producto creado exitosamente');
                }
                if (typeof products !== 'undefined') {
                    products.loadProducts();
                }
                return true;
            } else {
                const error = await response.json();
                if (typeof notificationManager !== 'undefined') {
                    notificationManager.error('Error: ' + error.message);
                } else {
                    alert('❌ Error: ' + error.message);
                }
                return false;
            }
        } catch (error) {
            if (typeof notificationManager !== 'undefined') {
                notificationManager.error('Error: ' + error.message);
            } else {
                alert('❌ Error: ' + error.message);
            }
            return false;
        }
    }

    async updateProduct(productId, productData) {
        try {
            const response = await auth.makeAuthenticatedRequest(`/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                if (typeof notificationManager !== 'undefined') {
                    notificationManager.success('Producto actualizado exitosamente');
                } else {
                    alert('✅ Producto actualizado exitosamente');
                }
                if (typeof products !== 'undefined') {
                    products.loadProducts();
                }
                return true;
            } else {
                const error = await response.json();
                if (typeof notificationManager !== 'undefined') {
                    notificationManager.error('Error: ' + error.message);
                } else {
                    alert('❌ Error: ' + error.message);
                }
                return false;
            }
        } catch (error) {
            if (typeof notificationManager !== 'undefined') {
                notificationManager.error('Error: ' + error.message);
            } else {
                alert('❌ Error: ' + error.message);
            }
            return false;
        }
    }

    async deleteProduct(productId) {
        const confirmed = confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.');
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await auth.makeAuthenticatedRequest(`/admin/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (typeof notificationManager !== 'undefined') {
                    notificationManager.success('Producto eliminado exitosamente');
                } else {
                    alert('✅ Producto eliminado exitosamente');
                }
                if (typeof products !== 'undefined') {
                    products.loadProducts();
                }
                return true;
            } else {
                const error = await response.json();
                if (typeof notificationManager !== 'undefined') {
                    notificationManager.error('Error: ' + error.message);
                } else {
                    alert('❌ Error: ' + error.message);
                }
                return false;
            }
        } catch (error) {
            if (typeof notificationManager !== 'undefined') {
                notificationManager.error('Error: ' + error.message);
            } else {
                alert('❌ Error: ' + error.message);
            }
            return false;
        }
    }
}

// Instancia global de AdminManager
const adminManager = new AdminManager();

// Modal para crear/editar productos
function openCreateProductModal(product = null) {
    if (!auth.isAdmin()) {
        if (typeof notificationManager !== 'undefined') {
            notificationManager.warning('No tienes permisos de administrador');
        } else {
            alert('⚠️ No tienes permisos de administrador');
        }
        return;
    }

    const modalHtml = `
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${product ? 'Editar' : 'Crear'} Producto</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Nombre del Producto *</label>
                                        <input type="text" class="form-control" id="productName" 
                                            value="${product ? product.name : ''}" required
                                            placeholder="Ej: Carne de Res Premium">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Descripción</label>
                                        <textarea class="form-control" id="productDescription" rows="3" 
                                            placeholder="Ej: Corte premium de res, ideal para asar...">${product ? product.description : ''}</textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Precio ($) *</label>
                                        <input type="number" class="form-control" id="productPrice" 
                                            value="${product ? product.price : ''}" step="0.01" min="0" required
                                            placeholder="Ej: 25.99">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Cantidad en Stock *</label>
                                        <input type="number" class="form-control" id="productQuantity" 
                                            value="${product ? product.quantity : ''}" min="0" required
                                            placeholder="Ej: 50">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Categoría *</label>
                                        <select class="form-select" id="productCategory" required>
                                            <option value="">Seleccionar categoría</option>
                                            ${adminManager.categories.map(cat => 
                                                `<option value="${cat.id}" ${product && product.category_id === cat.id ? 'selected' : ''}>
                                                    ${cat.name}
                                                </option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">URL de la Imagen</label>
                                        <input type="url" class="form-control" id="productImage" 
                                            value="${product ? (product.image_url || '') : ''}"
                                            placeholder="https://ejemplo.com/imagen.jpg">
                                        <div class="form-text">
                                            Pegar aquí el enlace directo a la imagen del producto
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Vista Previa</label>
                                        <div id="imagePreview" class="border rounded p-2 text-center" 
                                            style="height: 150px; background: #f8f9fa;">
                                            ${product && product.image_url ? 
                                                `<img src="${product.image_url}" alt="Vista previa" style="max-height: 140px; max-width: 100%;">` : 
                                                '<div class="text-muted mt-5">No hay imagen</div>'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="saveProduct(${product ? product.id : null})">
                            ${product ? 'Actualizar' : 'Crear'} Producto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remover modal existente
    const existingModal = document.getElementById('productModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Agregar evento para vista previa de imagen
    const imageInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');
    
    if (imageInput && preview) {
        imageInput.addEventListener('input', function() {
            if (this.value) {
                preview.innerHTML = `<img src="${this.value}" alt="Vista previa" 
                    style="max-height: 140px; max-width: 100%;" 
                    onerror="this.parentElement.innerHTML='<div class=\\'text-danger mt-5\\'>Error cargando imagen</div>'">`;
            } else {
                preview.innerHTML = '<div class="text-muted mt-5">No hay imagen</div>';
            }
        });
    }
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

async function saveProduct(productId = null) {
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        category_id: parseInt(document.getElementById('productCategory').value),
        image_url: document.getElementById('productImage').value || null
    };

    if (productId) {
        await adminManager.updateProduct(productId, productData);
    } else {
        await adminManager.createProduct(productData);
    }

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modal.hide();
}

function editProduct(productId) {
    if (!auth.isAdmin()) {
        if (typeof notificationManager !== 'undefined') {
            notificationManager.warning('No tienes permisos de administrador');
        } else {
            alert('⚠️ No tienes permisos de administrador');
        }
        return;
    }

    const product = products.products.find(p => p.id === productId);
    if (product) {
        openCreateProductModal(product);
    } else {
        if (typeof notificationManager !== 'undefined') {
            notificationManager.error('Producto no encontrado');
        } else {
            alert('❌ Producto no encontrado');
        }
    }
}

function deleteProduct(productId) {
    if (!auth.isAdmin()) {
        if (typeof notificationManager !== 'undefined') {
            notificationManager.warning('No tienes permisos de administrador');
        } else {
            alert('⚠️ No tienes permisos de administrador');
        }
        return;
    }

    adminManager.deleteProduct(productId);
}

// Hacer las funciones globales
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.openCreateProductModal = openCreateProductModal;
window.saveProduct = saveProduct;