// Modern Food Delivery Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚚 Carmeli\'s Bagels - Modern Food Delivery Site Loaded');

    // Initialize all features
    initializeLoading();
    initializeCart();
    initializeMenuFilters();
    initializeSearch();
    initializeScrollAnimations();
    initializeSmoothScrolling();

    // Home section click (legacy support)
    window.goToSection = function(section) {
        window.location.href = `menu.html#${section}`;
    };

    // Flash animation for sections (legacy support)
    const hash = window.location.hash.substring(1);
    if (hash) {
        const section = document.getElementById(hash);
        if (section) {
            section.classList.add('flash');
            setTimeout(() => section.classList.remove('flash'), 600);
        }
    }
});

// Loading Animation
function initializeLoading() {
    // Loading overlay is handled by CSS animation
    setTimeout(() => {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }, 2500);
}

// Cart Functionality
function initializeCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Add to cart buttons - prevent duplicate event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // Remove existing event listener if it exists
        button.removeEventListener('click', button._cartClickHandler);

        // Create and store the event handler
        button._cartClickHandler = function() {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            addToCart(name, price, this);
        };

        button.addEventListener('click', button._cartClickHandler);
    });

    // Cart modal
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('show.bs.modal', function() {
            renderCart();
        });

        // Continue shopping button handler
        const continueShoppingBtn = cartModal.querySelector('.btn-secondary[data-bs-dismiss="modal"]');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', function() {
                // Close modal using Bootstrap API
                const modal = bootstrap.Modal.getInstance(cartModal);
                if (modal) {
                    modal.hide();
                } else {
                    // Fallback: hide modal manually
                    cartModal.classList.remove('show');
                    cartModal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                }
            });
        }
    }

    // Cart click handler
    const cartIcon = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#cartModal"]');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = new bootstrap.Modal(cartModal);
            modal.show();
        });
    }
}

function addToCart(name, price, button) {
    // Prevent multiple rapid clicks
    if (button && button.disabled) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Success animation and feedback
    showNotification(`${name} נוסף לעגלה!`, 'success');

    // Button animation - disable during animation to prevent multiple clicks
    if (button) {
        button.disabled = true;
        button.classList.add('clicked');
        button.innerHTML = '<i class="fas fa-check me-2"></i>נוסף!';
        setTimeout(() => {
            button.classList.remove('clicked');
            button.innerHTML = '<i class="fas fa-cart-plus me-2"></i>הוסף לעגלה';
            button.disabled = false;
        }, 1000);
    }

    // Animate cart icon
    animateCartIcon();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');

    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartCountEl.style.transform = 'scale(1)';
        }, 200);
    }
}

function animateCartIcon() {
    const cartIcon = document.querySelector('.fa-shopping-cart');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3) rotate(10deg)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
    }
}

function renderCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p class="text-muted">העגלה שלך ריקה</p>
                <p class="small text-muted">הוסף מנות מהתפריט כדי להתחיל</p>
            </div>
        `;
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            cartItemsDiv.innerHTML += `
                <div class="cart-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${item.name}</h6>
                            <p class="text-muted small mb-1">₪${item.price.toFixed(2)} × ${item.quantity}</p>
                            <p class="fw-bold text-primary mb-0">₪${itemTotal.toFixed(2)}</p>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-outline-secondary btn-sm quantity-btn" data-action="decrease" data-index="${index}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="btn btn-outline-secondary btn-sm quantity-btn" data-action="increase" data-index="${index}">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-item" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        // Add delivery fee calculation
        const deliveryFee = total >= 80 ? 0 : 15;
        const finalTotal = total + deliveryFee;

        cartItemsDiv.innerHTML += `
            <hr>
            <div class="cart-summary">
                <div class="d-flex justify-content-between mb-2">
                    <span>סכום ביניים:</span>
                    <span>₪${total.toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>עמלת משלוח:</span>
                    <span class="${deliveryFee === 0 ? 'text-success' : ''}">₪${deliveryFee.toFixed(2)}</span>
                </div>
                ${deliveryFee === 0 ? '<small class="text-success">משלוח חינם מעל ₪80!</small>' : '<small class="text-muted">הזמן עוד ₪' + (80 - total).toFixed(2) + ' למשלוח חינם</small>'}
                <hr>
                <div class="cart-total">
                    <div class="d-flex justify-content-between">
                        <span class="fw-bold">סה"כ לתשלום:</span>
                        <span class="fw-bold fs-5 text-primary">₪${finalTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Add event listeners for quantity buttons and delete buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const action = this.getAttribute('data-action');
            updateQuantity(index, action);
        });
    });

    document.querySelectorAll('.delete-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

function updateQuantity(index, action) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (action === 'increase') {
        cart[index].quantity += 1;
    } else if (action === 'decrease') {
        cart[index].quantity -= 1;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemName = cart[index].name;
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showNotification(`${itemName} הוסר מהעגלה`, 'info');
}

// Menu Filtering and Search
function initializeMenuFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuGrid = document.getElementById('menuGrid');

    if (!menuGrid) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter menu items
            filterMenuItems(filter);
        });
    });
}

function initializeSearch() {
    const searchInput = document.getElementById('menuSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        searchMenuItems(searchTerm);
    });
}

function filterMenuItems(filter) {
    const menuCategories = document.querySelectorAll('.menu-category');

    menuCategories.forEach(category => {
        const categoryId = category.id;
        const items = category.querySelectorAll('.menu-item');

        if (filter === 'all' || categoryId === filter) {
            category.style.display = 'block';
            items.forEach(item => {
                item.style.display = 'block';
                animateItem(item);
            });
        } else {
            category.style.display = 'none';
        }
    });
}

function searchMenuItems(searchTerm) {
    const menuItems = document.querySelectorAll('.menu-item');
    const menuCategories = document.querySelectorAll('.menu-category');

    if (searchTerm === '') {
        // Show all items
        menuCategories.forEach(category => {
            category.style.display = 'block';
            const items = category.querySelectorAll('.menu-item');
            items.forEach(item => {
                item.style.display = 'block';
                animateItem(item);
            });
        });
        return;
    }

    menuCategories.forEach(category => {
        let hasVisibleItems = false;
        const items = category.querySelectorAll('.menu-item');

        items.forEach(item => {
            const itemName = item.querySelector('h5').textContent.toLowerCase();
            const itemDescription = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';

            if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                item.style.display = 'block';
                animateItem(item);
                hasVisibleItems = true;
            } else {
                item.style.display = 'none';
            }
        });

        category.style.display = hasVisibleItems ? 'block' : 'none';
    });
}

function animateItem(item) {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';

    setTimeout(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    }, 50);
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .featured-card, .menu-item').forEach(el => {
        observer.observe(el);
    });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)} me-2"></i>
            ${message}
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Add notification styles dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-content {
        background: white;
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        border-left: 4px solid var(--primary-color);
        display: flex;
        align-items: center;
        font-weight: 500;
    }

    .notification-success .notification-content {
        border-left-color: var(--success-color);
    }

    .notification-error .notification-content {
        border-left-color: var(--accent-color);
    }

    .notification-warning .notification-content {
        border-left-color: var(--secondary-color);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add loading class to body initially
    document.body.classList.add('loading');

    // Remove loading class after animations
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 2500);
});
