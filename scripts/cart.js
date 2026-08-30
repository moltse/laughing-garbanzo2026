// CART.JS — общий скрипт корзины для index.html и cart.html
// Корзина хранится в localStorage 
const CART_STORAGE_KEY = 'restaurant_cart';
const DELIVERY_PRICE = 150;
const SERVICE_FEE = 100;

function getCart() {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge(cart);
}

function addToCart({ id, name, price, image }) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price: Number(price), image, quantity: 1 });
    }
    saveCart(cart);
}
function changeQuantity(id, delta) {
    const cart = getCart();
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += delta;

    const updatedCart = item.quantity <= 0
        ? cart.filter(item => item.id !== id)
        : cart;

    saveCart(updatedCart);
    renderOrderCard();
}

function clearCart() {
    saveCart([]);
    renderOrderCard();
}

function updateCartBadge(cart = getCart()) {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalQty > 0 ? ` (${totalQty})` : '';
}
document.addEventListener('DOMContentLoaded', () => updateCartBadge());


document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-button');
    if (!btn) return;

    const dish = btn.closest('.dish');
    if (!dish) return;

    addToCart({
        id: dish.dataset.id,
        name: dish.dataset.name,
        price: dish.dataset.price,
        image: dish.dataset.image
    });
    // короткая визуальная реакция на клик (стиль .added можно добавить в CSS)
    btn.classList.add('added');
    setTimeout(() => btn.classList.remove('added'), 300);
});

function renderOrderCard() {
    const container = document.getElementById('order-items');
    const template = document.getElementById('order-item-template');
    if (!container || !template) return; // мы не на странице корзины — выходим

    const cart = getCart();
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">Корзина пуста</p>';
    } else {
        cart.forEach(item => {
            const node = template.content.cloneNode(true);
            const root = node.querySelector('.order-item');

            root.dataset.id = item.id;

            const imageEl = node.querySelector('.item-image-placeholder');
            if (item.image) imageEl.style.backgroundImage = `url('${item.image}')`;

            node.querySelector('.item-name-placeholder').textContent = item.name;
            node.querySelector('.item-qty-placeholder').textContent = item.quantity;
            node.querySelector('.item-price-placeholder').textContent =
                (item.price * item.quantity).toLocaleString('ru-RU') + ' ₽';

            container.appendChild(node);
        });
    }

    updatePaymentSummary(cart);
}

function updatePaymentSummary(cart) {
    const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const grandTotal = cart.length ? itemsTotal + DELIVERY_PRICE + SERVICE_FEE : 0;

    const itemsTotalEl = document.getElementById('item-price-placeholder-total');
    const deliveryEl = document.getElementById('delivery-price-placeholder');
    const commissionEl = document.getElementById('commission-placeholder');
    const grandTotalEl = document.getElementById('full-price-placeholder');

    if (itemsTotalEl) itemsTotalEl.textContent = itemsTotal.toLocaleString('ru-RU') + ' ₽';
    if (deliveryEl) deliveryEl.textContent = DELIVERY_PRICE.toLocaleString('ru-RU') + ' ₽';
    if (commissionEl) commissionEl.textContent = SERVICE_FEE.toLocaleString('ru-RU') + ' ₽';
    if (grandTotalEl) grandTotalEl.textContent = 'Итого: ' + grandTotal.toLocaleString('ru-RU') + ' ₽';
}

// "+" / "-" внутри карточки заказа (делегирование — строки создаются динамически)
document.addEventListener('click', (e) => {
    const plusBtn = e.target.closest('.qty-increase-btn');
    const minusBtn = e.target.closest('.qty-decrease-btn');
    if (!plusBtn && !minusBtn) return;

    const root = e.target.closest('.order-item');
    if (!root) return;

    changeQuantity(root.dataset.id, plusBtn ? 1 : -1);
});

// Кнопка "Очистить все"
document.addEventListener('click', (e) => {
    if (e.target.closest('#clear-all-button')) {
        clearCart();
    }
});

// Кнопка "Оплатить"
document.addEventListener('click', (e) => {
    if (e.target.closest('#pay-button')) {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Корзина пуста — сначала добавьте блюда.');
            return;
        }
        alert('Заказ оформлен! Спасибо за покупку 🍜');
        clearCart();
        location.href = 'index.html';
    }
});

document.addEventListener('DOMContentLoaded', renderOrderCard);