// REEMPLAZA todo el contenido de auth.js con esto:
const API_URL = 'http://localhost:5000/api';

class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.init();
    }

    init() {
        this.updateNavigation();
        this.setupEventListeners();
    }

    updateNavigation() {
        const authLinks = document.getElementById('auth-links');
        const userMenu = document.getElementById('user-menu');
        const usernameSpan = document.getElementById('username');
        const userRoleSpan = document.getElementById('user-role');

        if (this.isLoggedIn()) {
            if (authLinks) authLinks.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (usernameSpan) usernameSpan.textContent = this.user.username;
            if (userRoleSpan) userRoleSpan.textContent = this.user.role;
        } else {
            if (authLinks) authLinks.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }

        // Actualizar UI de admin
        this.updateAdminUI();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const data = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.token = result.token;
                this.user = result.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.showMessage('Login exitoso! Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            this.showMessage('Error de conexión', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const data = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        const confirmPassword = document.getElementById('confirm-password').value;

        if (data.password !== confirmPassword) {
            this.showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Registro exitoso! Redirigiendo al login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            this.showMessage('Error de conexión', 'error');
        }
    }

    handleLogout(e) {
        e.preventDefault();
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        this.updateNavigation();
        window.location.href = 'index.html';
    }

    isLoggedIn() {
        return this.token && this.user;
    }

    isAdmin() {
        return this.isLoggedIn() && this.user && this.user.role === 'admin';
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    // En auth.js, busca showMessage y reemplaza su contenido:
showMessage(message, type) {
    // Solución temporal - usar alerts normales
    if (type === 'error') {
        alert('❌ ' + message);
    } else {
        alert('✅ ' + message);
    }
    
    // También mostrar en consola para debug
    console.log(`${type.toUpperCase()}: ${message}`);
}

    updateAdminUI() {
        const adminElements = document.querySelectorAll('.admin-only');
        const isAdmin = this.isAdmin();
        
        adminElements.forEach(element => {
            element.style.display = isAdmin ? 'block' : 'none';
        });

        // Mostrar rol en el navbar si existe el elemento
        const userRoleSpan = document.getElementById('user-role');
        if (userRoleSpan) {
            userRoleSpan.textContent = this.user ? `(${this.user.role})` : '';
        }
    }

    async makeAuthenticatedRequest(url, options = {}) {
        if (!this.isLoggedIn()) {
            throw new Error('Usuario no autenticado');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };
        const response = await fetch(`${API_URL}${url}`, mergedOptions);

        if (response.status === 401) {
            this.handleLogout(new Event('logout'));
            throw new Error('Sesión expirada');
        }

        return response;
    }
}

// Instancia global de Auth
const auth = new Auth();