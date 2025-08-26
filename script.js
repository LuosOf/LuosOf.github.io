// ========================================
// MobiliAri - JavaScript Application
// ========================================

// Global state
let currentUser = null;
let cart = [];
let products = [];
let currentSection = 'catalogo';
let filteredProducts = [];

// Sample product data
const sampleProducts = [
    {
        id: 1,
        name: "Sofá Elegante",
        description: "Sofá moderno de 3 plazas en tela premium",
        price: 12500,
        category: "salas",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        inStock: true
    },
    {
        id: 2,
        name: "Mesa de Comedor Roble",
        description: "Mesa rectangular de roble para 6 personas",
        price: 8900,
        category: "comedores",
        imageUrl: "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        inStock: true
    },
    {
        id: 3,
        name: "Cama King Size",
        description: "Cama tapizada con cabecero acolchado",
        price: 15600,
        category: "dormitorios",
        imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        inStock: true
    },
    {
        id: 4,
        name: "Escritorio Ejecutivo",
        description: "Escritorio de cedro con cajones organizadores",
        price: 7200,
        category: "oficina",
        imageUrl: "https://images.unsplash.com/photo-1541558869434-2840d308329a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        inStock: true
    },
    {
        id: 5,
        name: "Silla de Comedor",
        description: "Silla tapizada con patas de madera",
        price: 2100,
        category: "comedores",
        imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        inStock: true
    },
    {
        id: 6,
        name: "Armario Modular",
        description: "Armario de melamina blanca con espejos",
        price: 18900,
        category: "dormitorios",
        imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        inStock: true
    }
];

// Material pricing for customization
const materialPrices = {
    roble: 200,
    pino: 120,
    cedro: 180,
    mdf: 80,
    melamina: 100
};

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    products = sampleProducts;
    filteredProducts = [...products];
    initializeEventListeners();
    loadProducts();
});

// ========================================
// Event Listeners
// ========================================
function initializeEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Customization form
    document.getElementById('customizeForm').addEventListener('submit', handleCustomization);
    
    // Search and filter
    document.getElementById('searchInput').addEventListener('input', searchProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('priceFilter').addEventListener('change', filterProducts);
}

// ========================================
// Authentication
// ========================================
function handleLogin(e) {
    e.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!userType || !email || !password) {
        showAlert('Por favor, completa todos los campos', 'danger');
        return;
    }
    
    // Simulate login
    currentUser = {
        id: generateId(),
        email: email,
        userType: userType
    };
    
    // Hide login modal and show main interface
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
    
    showMainInterface();
    showAlert(`¡Bienvenido ${email}!`, 'success');
}

function logout() {
    currentUser = null;
    cart = [];
    updateCartDisplay();
    
    // Hide main interface and show login modal
    document.getElementById('ecommerceInterface').classList.add('d-none');
    document.getElementById('adminInterface').classList.add('d-none');
    
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
    
    // Reset form
    document.getElementById('loginForm').reset();
    
    showAlert('Sesión cerrada correctamente', 'info');
}

function showMainInterface() {
    if (currentUser.userType === 'administrador') {
        document.getElementById('adminInterface').classList.remove('d-none');
        showAdminSection('dashboard');
        loadAdminData();
    } else {
        document.getElementById('ecommerceInterface').classList.remove('d-none');
        showSection('catalogo');
    }
}

// ========================================
// Navigation
// ========================================
function showSection(section) {
    currentSection = section;
    
    // Hide all sections
    document.getElementById('catalogoSection').classList.add('d-none');
    document.getElementById('personalizarSection').classList.add('d-none');
    document.getElementById('heroSection').style.display = 'none';
    
    // Show selected section
    if (section === 'catalogo') {
        document.getElementById('catalogoSection').classList.remove('d-none');
        document.getElementById('heroSection').style.display = 'block';
        loadProducts();
    } else if (section === 'personalizar') {
        document.getElementById('personalizarSection').classList.remove('d-none');
        resetCustomizationForm();
    }
    
    // Update navigation
    updateNavigation(section);
}

function updateNavigation(activeSection) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section
    document.querySelectorAll(`[onclick="showSection('${activeSection}')"]`).forEach(link => {
        link.classList.add('active');
    });
}

// ========================================
// Product Management
// ========================================
function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search display-1 text-muted"></i>
                <h4 class="mt-3 text-muted">No se encontraron productos</h4>
                <p class="text-muted">Intenta ajustar tus filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card product-card fade-in">
                <div class="position-relative overflow-hidden">
                    <img src="${product.imageUrl}" 
                         class="card-img-top" 
                         alt="${product.name}"
                         style="height: 250px; object-fit: cover;">
                    <div class="position-absolute top-0 end-0 m-3">
                        <span class="price-tag">$${formatPrice(product.price)}</span>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted">${product.description}</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-wood flex-fill" onclick="showProductDetail(${product.id})">
                            <i class="bi bi-eye me-1"></i>Ver Detalles
                        </button>
                        <button class="btn btn-wood" onclick="addToCart(${product.id})">
                            <i class="bi bi-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    filterProducts();
    
    if (query) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query)
        );
    }
    
    loadProducts();
}

function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    
    filteredProducts = [...products];
    
    // Category filter
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }
    
    // Price filter
    if (priceFilter) {
        const [min, max] = priceFilter.split('-').map(p => parseInt(p.replace('+', '')));
        filteredProducts = filteredProducts.filter(product => {
            if (max) {
                return product.price >= min && product.price <= max;
            } else {
                return product.price >= min;
            }
        });
    }
    
    loadProducts();
}

function filterByCategory(category) {
    document.getElementById('categoryFilter').value = category;
    filterProducts();
    showSection('catalogo');
}

function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modalContent = document.getElementById('productModalContent');
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.imageUrl}" class="img-fluid rounded" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h4>${product.name}</h4>
                <p class="text-muted">${product.description}</p>
                <h3 class="text-wood">$${formatPrice(product.price)}</h3>
                <div class="mt-3">
                    <span class="badge bg-wood">✅ En Stock</span>
                    <span class="badge bg-secondary ms-2">${getCategoryName(product.category)}</span>
                </div>
            </div>
        </div>
    `;
    
    // Set up add to cart button
    document.getElementById('addToCartFromModal').onclick = () => {
        addToCart(productId);
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    };
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// ========================================
// Shopping Cart
// ========================================
function addToCart(productId, customSpecs = null) {
    if (!currentUser) {
        showAlert('Debes iniciar sesión para agregar productos al carrito', 'warning');
        return;
    }
    
    let item;
    
    if (customSpecs) {
        // Custom product
        item = {
            id: generateId(),
            productId: null,
            name: customSpecs.name,
            price: customSpecs.totalPrice,
            quantity: 1,
            isCustom: true,
            customSpecs: customSpecs,
            imageUrl: null
        };
    } else {
        // Regular product
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.productId === productId && !item.isCustom);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            item = {
                id: generateId(),
                productId: productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                isCustom: false,
                customSpecs: null,
                imageUrl: product.imageUrl
            };
            cart.push(item);
        }
    }
    
    if (item && !cart.find(cartItem => cartItem.id === item.id)) {
        cart.push(item);
    }
    
    updateCartDisplay();
    showAlert('Producto agregado al carrito', 'success');
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
    showAlert('Producto eliminado del carrito', 'info');
}

function updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart count badge
    document.getElementById('cartCount').textContent = cartCount;
    
    // Update cart total
    document.getElementById('cartTotal').textContent = `$${formatPrice(cartTotal)}`;
    
    // Update cart items
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x text-muted display-1"></i>
                <p class="text-muted mt-3">Tu carrito está vacío</p>
            </div>
        `;
        document.getElementById('checkoutBtn').disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="d-flex align-items-center">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" class="me-3" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem;" alt="${item.name}">` : '<div class="me-3 bg-wood text-white d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; border-radius: 0.5rem;"><i class="bi bi-gear"></i></div>'}
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.name}</h6>
                        ${item.isCustom ? '<small class="text-warning"><i class="bi bi-gear me-1"></i>Personalizado</small>' : ''}
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold">$${formatPrice(item.price * item.quantity)}</div>
                                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        document.getElementById('checkoutBtn').disabled = false;
    }
}

function toggleCart() {
    const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
    cartOffcanvas.show();
}

function checkout() {
    if (cart.length === 0) return;
    
    showAlert('🚧 Funcionalidad de pago en desarrollo. ¡Gracias por tu interés!', 'info');
}

// ========================================
// Customization
// ========================================
function updatePreview() {
    const form = document.getElementById('customizeForm');
    const formData = new FormData(form);
    
    const tipo = formData.get('tipo');
    const material = formData.get('material');
    const ancho = formData.get('ancho');
    const alto = formData.get('alto');
    const profundidad = formData.get('profundidad');
    const acabado = formData.get('acabado');
    
    const previewContainer = document.getElementById('previewContainer');
    const costBreakdown = document.getElementById('costBreakdown');
    
    if (tipo && material && ancho && alto && profundidad && acabado) {
        // Show preview
        previewContainer.innerHTML = `
            <div class="text-center">
                <i class="bi bi-check-circle text-success display-1"></i>
                <h5 class="mt-3">${capitalizeFirst(tipo)} Personalizado</h5>
                <div class="text-start mt-3 small">
                    <p><strong>Material:</strong> ${capitalizeFirst(material)}</p>
                    <p><strong>Dimensiones:</strong> ${ancho} × ${alto} × ${profundidad} cm</p>
                    <p><strong>Acabado:</strong> ${capitalizeFirst(acabado)}</p>
                </div>
            </div>
        `;
        
        // Calculate price
        const volume = (parseInt(ancho) * parseInt(alto) * parseInt(profundidad)) / 1000000; // m³
        const materialCost = materialPrices[material] * volume * 1000;
        const laborCost = materialCost * 0.5;
        const finishCost = materialCost * 0.2;
        const total = Math.round(materialCost + laborCost + finishCost);
        
        document.getElementById('materialCost').textContent = `$${formatPrice(materialCost)}`;
        document.getElementById('laborCost').textContent = `$${formatPrice(laborCost)}`;
        document.getElementById('finishCost').textContent = `$${formatPrice(finishCost)}`;
        document.getElementById('totalCost').textContent = `$${formatPrice(total)}`;
        
        costBreakdown.style.display = 'block';
        
        // Store calculation for later use
        form.dataset.totalPrice = total;
    } else {
        previewContainer.innerHTML = `
            <i class="bi bi-box text-muted display-1"></i>
            <p class="text-muted mt-3">Selecciona las opciones para ver la vista previa</p>
        `;
        costBreakdown.style.display = 'none';
    }
}

function handleCustomization(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const totalPrice = parseInt(form.dataset.totalPrice);
    
    if (!totalPrice) {
        showAlert('Completa todos los campos para generar la cotización', 'warning');
        return;
    }
    
    const customSpecs = {
        name: `${capitalizeFirst(formData.get('tipo'))} Personalizado`,
        tipo: formData.get('tipo'),
        material: formData.get('material'),
        ancho: formData.get('ancho'),
        alto: formData.get('alto'),
        profundidad: formData.get('profundidad'),
        acabado: formData.get('acabado'),
        notas: formData.get('notas'),
        totalPrice: totalPrice
    };
    
    addToCart(null, customSpecs);
    resetCustomizationForm();
}

function resetCustomizationForm() {
    document.getElementById('customizeForm').reset();
    document.getElementById('previewContainer').innerHTML = `
        <i class="bi bi-box text-muted display-1"></i>
        <p class="text-muted mt-3">Selecciona las opciones para ver la vista previa</p>
    `;
    document.getElementById('costBreakdown').style.display = 'none';
}

function previewCustomization() {
    updatePreview();
}

// ========================================
// Admin Functions
// ========================================

// Sample admin data
const adminOrders = [
    { id: 'ORD001', cliente: 'juan@email.com', producto: 'Sofá Elegante', total: 12500, estado: 'pendiente', fecha: '2024-08-25' },
    { id: 'ORD002', cliente: 'maria@email.com', producto: 'Mesa Comedor', total: 8900, estado: 'procesando', fecha: '2024-08-24' },
    { id: 'ORD003', cliente: 'carlos@email.com', producto: 'Cama King', total: 15600, estado: 'completado', fecha: '2024-08-23' },
    { id: 'ORD004', cliente: 'ana@email.com', producto: 'Escritorio', total: 7200, estado: 'pendiente', fecha: '2024-08-22' }
];

const adminUsers = [
    { email: 'juan@email.com', tipo: 'cliente', pedidos: 3, registro: '2024-07-15', estado: 'activo' },
    { email: 'maria@email.com', tipo: 'cliente', pedidos: 1, registro: '2024-08-01', estado: 'activo' },
    { email: 'carlos@email.com', tipo: 'cliente', pedidos: 2, registro: '2024-06-10', estado: 'activo' },
    { email: 'admin@mobiliari.com', tipo: 'administrador', pedidos: 0, registro: '2024-01-01', estado: 'activo' }
];

function showAdminSection(section) {
    // Hide all admin sections
    document.getElementById('adminDashboard').classList.add('d-none');
    document.getElementById('adminProductos').classList.add('d-none');
    document.getElementById('adminPedidos').classList.add('d-none');
    document.getElementById('adminUsuarios').classList.add('d-none');
    document.getElementById('adminReportes').classList.add('d-none');
    
    // Show selected section
    document.getElementById(`admin${capitalizeFirst(section === 'dashboard' ? 'Dashboard' : capitalizeFirst(section))}`).classList.remove('d-none');
    
    // Update navigation
    updateAdminNavigation(section);
    
    // Load section-specific data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'productos':
            loadAdminProducts();
            break;
        case 'pedidos':
            loadAdminOrders();
            break;
        case 'usuarios':
            loadAdminUsers();
            break;
        case 'reportes':
            loadReports();
            break;
    }
}

function updateAdminNavigation(activeSection) {
    // Remove active class from all nav links
    document.querySelectorAll('#adminNavbar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section
    document.querySelectorAll(`[onclick="showAdminSection('${activeSection}')"]`).forEach(link => {
        link.classList.add('active');
    });
}

function loadAdminData() {
    // Set current date
    const currentDate = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = currentDate;
    
    loadDashboardData();
}

function loadDashboardData() {
    // Load recent orders in dashboard
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    recentOrdersTable.innerHTML = adminOrders.slice(0, 5).map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.cliente}</td>
            <td>${order.producto}</td>
            <td>$${formatPrice(order.total)}</td>
            <td><span class="badge bg-${getStatusColor(order.estado)}">${capitalizeFirst(order.estado)}</span></td>
            <td>${formatDate(order.fecha)}</td>
        </tr>
    `).join('');
}

function loadAdminProducts() {
    const adminProductsTable = document.getElementById('adminProductsTable');
    adminProductsTable.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.imageUrl}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" alt="${product.name}">
            </td>
            <td>${product.name}</td>
            <td><span class="badge bg-wood">${getCategoryName(product.category)}</span></td>
            <td>$${formatPrice(product.price)}</td>
            <td><span class="badge bg-success">✅ En Stock</span></td>
            <td>
                <div class="btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm me-1" onclick="editProduct(${product.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${product.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadAdminOrders() {
    const adminOrdersTable = document.getElementById('adminOrdersTable');
    adminOrdersTable.innerHTML = adminOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.cliente}</td>
            <td>${order.producto}</td>
            <td>$${formatPrice(order.total)}</td>
            <td><span class="badge bg-${getStatusColor(order.estado)}">${capitalizeFirst(order.estado)}</span></td>
            <td>${formatDate(order.fecha)}</td>
            <td>
                <div class="btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm me-1" onclick="viewOrder('${order.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning btn-sm" onclick="updateOrderStatus('${order.id}')">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadAdminUsers() {
    const adminUsersTable = document.getElementById('adminUsersTable');
    adminUsersTable.innerHTML = adminUsers.map(user => `
        <tr>
            <td>${user.email}</td>
            <td><span class="badge bg-${user.tipo === 'administrador' ? 'danger' : 'primary'}">${capitalizeFirst(user.tipo)}</span></td>
            <td>${user.pedidos}</td>
            <td>${formatDate(user.registro)}</td>
            <td><span class="badge bg-success">${capitalizeFirst(user.estado)}</span></td>
            <td>
                <div class="btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm me-1" onclick="editUser('${user.email}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteUser('${user.email}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadReports() {
    // This would typically load actual chart data
    showAlert('📊 Módulo de reportes cargado. Aquí se mostrarían gráficos interactivos.', 'info');
}

// Admin action functions
function editProduct(productId) {
    showAlert('🔧 Función de editar producto en desarrollo', 'info');
}

function deleteProduct(productId) {
    showAlert('🗑️ Función de eliminar producto en desarrollo', 'warning');
}

function viewOrder(orderId) {
    showAlert(`👁️ Viendo detalles del pedido ${orderId}`, 'info');
}

function updateOrderStatus(orderId) {
    showAlert(`🔄 Actualizando estado del pedido ${orderId}`, 'info');
}

function editUser(email) {
    showAlert(`✏️ Editando usuario ${email}`, 'info');
}

function deleteUser(email) {
    showAlert(`🗑️ Eliminando usuario ${email}`, 'warning');
}

function filterOrders(status) {
    // Update button states
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    showAlert(`🔍 Filtrando pedidos por estado: ${status}`, 'info');
    loadAdminOrders(); // In a real app, this would filter the data
}

// ========================================
// Utility Functions
// ========================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-MX').format(Math.round(price));
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCategoryName(category) {
    const categories = {
        salas: '🛋️ Salas',
        comedores: '🍽️ Comedores',
        dormitorios: '🛏️ Dormitorios',
        oficina: '💼 Oficina'
    };
    return categories[category] || category;
}

function getStatusColor(status) {
    const statusColors = {
        pendiente: 'warning',
        procesando: 'info',
        completado: 'success',
        cancelado: 'danger'
    };
    return statusColors[status] || 'secondary';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// ========================================
// Initialize cart offcanvas close behavior
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const cartOffcanvas = document.getElementById('cartOffcanvas');
    cartOffcanvas.addEventListener('hidden.bs.offcanvas', function() {
        // Optional: Add any cleanup when cart is closed
    });
});