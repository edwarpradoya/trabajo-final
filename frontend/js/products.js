class Products {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.categories = new Set();
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.renderProducts();
        this.setupEventListeners();
        this.updateCartCount();
    }

    async loadProducts() {
        try {
            if (!auth.isLoggedIn()) {
                window.location.href = 'login.html';
                return;
            }

            const response = await auth.makeAuthenticatedRequest('/products');
            if (response.ok) {
                this.products = await response.json();
                this.filteredProducts = [...this.products];
                this.extractCategories();
                this.populateCategoryFilter();
                this.renderProducts();
            } else {
                throw new Error('Error al cargar productos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar productos: ' + error.message);
        }
    }

    extractCategories() {
        this.categories.clear();
        this.products.forEach(product => {
            if (product.category_name) {
                this.categories.add(product.category_name);
            }
        });
    }

    populateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
            this.categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
            });
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterProducts());
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterProducts());
        }
    }

    filterProducts() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const category = document.getElementById('category-filter')?.value || '';

        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || product.category_name === category;
            return matchesSearch && matchesCategory;
        });

        this.renderProducts();
    }

// En la función renderProducts, modifica la parte de los botones:
// En products.js, reemplaza completamente la función renderProducts:
// En products.js, modifica la parte de la imagen en renderProducts:
renderProducts() {
    const container = document.getElementById('products-container') || 
                    document.getElementById('featured-products');
    
    if (!container) return;

    if (this.filteredProducts.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No se encontraron productos.</p></div>';
        return;
    }

    const isAdmin = auth.isAdmin();

    container.innerHTML = this.filteredProducts.map(product => {
        // Usar imagen personalizada si existe, sino placeholder genérico
        const imageUrl = product.image_url || 
            `https://via.placeholder.com/300x200/4CAF50/white?text=${encodeURIComponent(product.name)}`;
        
        return `
        <div class="col-md-4 mb-4">
            <div class="card product-card h-100">
                <img src="${imageUrl}" 
                    class="card-img-top product-image" 
                    alt="${product.name}"
                    style="height: 200px; object-fit: cover;"
                    onerror="this.src='https://via.placeholder.com/300x200/cccccc/666666?text=Imagen+No+Disponible'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text flex-grow-1">${product.description || 'Sin descripción'}</p>
                    <div class="mt-auto">
                        <p class="card-text">
                            <small class="text-muted">Categoría: ${product.category_name || 'Sin categoría'}</small>
                        </p>
                        <p class="card-text">
                            <span class="badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}">
                                ${product.quantity > 0 ? `${product.quantity} disponibles` : 'Agotado'}
                            </span>
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 text-primary">$${parseFloat(product.price).toFixed(2)}</span>
                            ${isAdmin ? `
                                <div>
                                    <button class="btn btn-warning btn-sm me-1" 
                                            onclick="editProduct(${product.id})">
                                        Editar
                                    </button>
                                    <button class="btn btn-danger btn-sm" 
                                            onclick="deleteProduct(${product.id})">
                                        Eliminar
                                    </button>
                                </div>
                            ` : `
                                <button class="btn btn-primary btn-sm" 
                                        onclick="products.addToCart(${product.id})"
                                        ${product.quantity === 0 ? 'disabled' : ''}>
                                    Agregar al Carrito
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

    addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity < product.quantity) {
            existingItem.quantity += 1;
        } else {
            alert('No hay suficiente stock disponible');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            maxQuantity: product.quantity,
            image: product.image_url  // ← ESTA ES LA LÍNEA IMPORTANTE
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartCount();
    showAddToCartMessage(productName); {
    if (typeof notificationManager !== 'undefined') {
        notificationManager.showCartToast(productName);
    } else {
        // Fallback si notificationManager no está disponible
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '1055';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ✅ ${productName} agregado al carrito
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        document.body.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
    }
}


}

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    showAddToCartMessage(productName) {
        // Crear toast de Bootstrap
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '1055';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ✅ ${productName} agregado al carrito
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        document.body.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
    }
}

// Instancia global de Products
const products = new Products();