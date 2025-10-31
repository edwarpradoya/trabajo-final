class Cart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.init();
    }

    init() {
        this.renderCart();
        this.setupEventListeners();
        this.updateSummary();
    }

    renderCart() {
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');

    if (this.cart.length === 0) {
        if (cartItems) cartItems.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }

    if (cartItems) cartItems.style.display = 'block';
    if (emptyCart) emptyCart.style.display = 'none';

    if (cartItems) {
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item d-flex align-items-center">
                <img src="${item.image || `https://via.placeholder.com/80x80/4CAF50/white?text=${encodeURIComponent(item.name.substring(0, 2))}`}" 
                    alt="${item.name}" 
                    class="rounded" 
                    style="width: 80px; height: 80px; object-fit: cover;"
                    onerror="this.src='https://via.placeholder.com/80x80/cccccc/666666?text=IMG'">
                <div class="flex-grow-1 ms-3">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="text-muted mb-1">$${parseFloat(item.price).toFixed(2)} c/u</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, -1)">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold mb-2">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="btn btn-outline-danger btn-sm" onclick="cart.removeItem(${item.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }
}

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            this.removeItem(productId);
            return;
        }

        if (newQuantity > item.maxQuantity) {
            alert('No hay suficiente stock disponible');
            return;
        }

        item.quantity = newQuantity;
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        products.updateCartCount();
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        products.updateCartCount();
    }

    updateSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 5.99;
        const taxes = subtotal * 0.08; // 8% de impuestos
        const total = subtotal + shipping + taxes;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
        document.getElementById('taxes').textContent = `$${taxes.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    setupEventListeners() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.generateInvoice());
        }
    }

    generateInvoice() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 5.99;
        const taxes = subtotal * 0.08;
        const total = subtotal + shipping + taxes;

        const invoiceDetails = document.getElementById('invoice-details');
        const invoiceSection = document.getElementById('invoice-section');

        if (invoiceDetails && invoiceSection) {
            invoiceDetails.innerHTML = `
                <div class="mb-3">
                    <strong>Fecha:</strong> ${new Date().toLocaleDateString()}<br>
                    <strong>N° Factura:</strong> INV-${Date.now()}
                </div>
                ${this.cart.map(item => `
                    <div class="invoice-item d-flex justify-content-between">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="invoice-item d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="invoice-item d-flex justify-content-between">
                    <span>Envío:</span>
                    <span>${shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div class="invoice-item d-flex justify-content-between">
                    <span>Impuestos (8%):</span>
                    <span>$${taxes.toFixed(2)}</span>
                </div>
                <div class="invoice-total d-flex justify-content-between">
                    <span>TOTAL:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="mt-3 text-center">
                    <button class="btn btn-success w-100" onclick="cart.completePurchase()">
                        Confirmar Compra
                    </button>
                </div>
            `;

            invoiceSection.style.display = 'block';
            invoiceSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    completePurchase() {
        alert('¡Compra realizada con éxito! Gracias por tu compra.');
        this.cart = [];
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        products.updateCartCount();
        
        const invoiceSection = document.getElementById('invoice-section');
        if (invoiceSection) {
            invoiceSection.style.display = 'none';
        }
    }
}

// Instancia global de Cart
const cart = new Cart();