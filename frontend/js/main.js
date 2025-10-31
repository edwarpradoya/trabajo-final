// Código principal que se ejecuta en index.html
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos destacados
    loadFeaturedProducts();
    
    // Actualizar contador del carrito
    updateCartCount();
});

async function loadFeaturedProducts() {
    try {
        if (!auth.isLoggedIn()) {
            return;
        }

        const response = await auth.makeAuthenticatedRequest('/products');
        if (response.ok) {
            const products = await response.json();
            const featuredProducts = products.slice(0, 3); // Mostrar primeros 3 productos
            
            const container = document.getElementById('featured-products');
            if (container) {
                container.innerHTML = featuredProducts.map(product => `
                    <div class="col-md-4 mb-4">
                        <div class="card product-card h-100">
                            <img src="https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}" 
                                class="card-img-top product-image" 
                                alt="${product.name}">
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
                                        <a href="products.html" class="btn btn-primary btn-sm">
                                            Ver Detalles
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error al cargar productos destacados:', error);
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}