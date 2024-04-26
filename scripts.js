const fetchProducts = async() => {// Función para obtener productos de la API FAKESTORE
    try {
        const response = await fetch('https://fakestoreapi.com/products');// Petición para obtener productos
        const products = await response.json();// Convertir la respuesta a formato JSON, lo utilizamos para intercambiar datos entre un servidor y un cliente
        displayProducts(products);// Mostrar los productos en la página
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};


const displayProducts = (products) => {// Función para mostrar los productos en la página
    const container = document.getElementById('products-container');// Obtener el contenedor de productos
    container.innerHTML = products.map(product => `
        <div class="col-12">
            <div class="card h-100 product-card" data-product-id="${product.id}">
                <img src="${product.image}" class="card-img-top mt-3" alt="${product.title}">
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="text-muted">Precio: $${product.price}</p>
                    <button class="btn btn-warning add-to-cart-button" data-product-id="${product.id}">
                        <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                        Añadir al carrito
                    </button>
                </div>
            </div>
        </div>
    `).join('');//unir todos los productos en un mismo carrito

    document.querySelectorAll('.add-to-cart-button').forEach(button => {// Agregar evento clic a cada botón de "Añadir al carrito"
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const productId = button.getAttribute('data-product-id');// Obtener el ID del producto
            const productToAdd = products.find(product => product.id.toString() === productId);// Encontrar el producto a agregar
            addToCart(productToAdd);// Agregar el producto al carrito
        });
    });

    document.querySelectorAll('.product-card').forEach(card => {// Agregar evento clic a cada tarjeta de producto
        card.addEventListener('click', (event) => {
            const productId = card.getAttribute('data-product-id');// Obtener el ID del producto
            const product = products.find(p => p.id.toString() === productId);// Encontrar el producto seleccionado
            showModalDetails(product);// Mostrar detalles del producto en un modal
        });
    });
};


let productInModal;

const showModalDetails = (product) => {
    productInModal = product;

    document.getElementById('productDetailsModalLabel').textContent = product.title;
    document.querySelector('#productDetailsModal .modal-body').innerHTML = `
   
        <img src="${product.image}" alt="${product.title}" class="img-fluid mb-2 card-img-top mt-3">
        <p class="text-muted">Categoría: ${product.category}</p>
        <p class="text-muted">Rating: ${product.rating.rate} (${product.rating.count} votos)</p>
        <h5>Descripción:</h5>
        <p>${product.description}</p>
        <h5 class="text-muted">Precio: $${product.price}</h5>
    `;

    var modal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
    modal.show();
};

const addToCartFromModal = () => {
    addToCart(productInModal);// Muestra el modal utilizando Bootstrap ( popup del carrito)
    var modal = bootstrap.Modal.getInstance(document.getElementById('productDetailsModal'));
    modal.hide();
};



let cart = JSON.parse(localStorage.getItem('cart')) || [];

const addToCart = (product) => {
    const cartItem = cart.find(item => item.id === product.id);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification(`Se agregó "${product.title}" al carrito.`);
};

const updateCartUI = () => {
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        const totalPrice = cart.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2);

        const cartSidebar = document.getElementById('cart-sidebar');
        cartSidebar.innerHTML = `
        <div class="cart-sidebar-header">
            <h5>Carrito de Compras</h5>
            <button onclick="toggleCartSidebar()" class="close-cart-sidebar mb-2">&times;</button>
        </div>
        ${cart.map(item => `
            <div class="cart-item d-flex justify-content-between align-items-center">
                <img src="${item.image}" alt="${item.title}" class="img-fluid cart-item-image" style="max-width: 50px; height: auto;">
                <h6 class="cart-item-title">${item.title}</h6>
                <p class="cart-item-price">${item.quantity} x $${item.price.toFixed(2)}</p>
                <div>
                    <button onclick="changeQuantity(${item.id}, -1)" class="btn btn-sm btn-outline-secondary">-</button>
                    <button onclick="changeQuantity(${item.id}, 1)" class="btn btn-sm btn-outline-secondary">+</button>
                    <button onclick="removeFromCart(${item.id})" class="btn btn-sm btn-danger mt-2">Eliminar</button>
                </div>
            </div>
        `).join('')}
        <div class="cart-total">
            <strong>Total: $${totalPrice}</strong>
        </div>
    `;
};
// eliminar del carrito

const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification(`Se elimino del carrito.`);
};

const changeQuantity = (productId, delta) => {
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += delta;

        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }
    }
};


const toggleCartSidebar = () => {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.style.display = cartSidebar.style.display === 'block' ? 'none' : 'block';
};


const showAlert = (message) => {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    setTimeout(() => {
        $(alert).alert('close');
    }, 1000);
};

const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'toast align-items-center text-white bg-success border-0 m-3';
    notification.role = 'alert';
    notification.ariaLive = 'assertive';
    notification.ariaAtomic = 'true';
    notification.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.body.appendChild(notification);

    const toast = new bootstrap.Toast(notification, {
        delay: 3000
    });

    toast.show();
    
    notification.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(notification);
    });
};
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
});