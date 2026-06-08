const cart = [];
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const cartField = document.querySelector('#cart-field');
const orderForm = document.querySelector('#order-form');
const year = document.querySelector('#year');

const BUSINESS_EMAIL = 'hello@mapleandmoss.com'; // Change this to your real email.

year.textContent = new Date().getFullYear();

document.querySelectorAll('.menu-card button').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.menu-card');
    addToCart(card.dataset.name, Number(card.dataset.price));
    document.querySelector('#order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

function addToCart(name, price) {
  const existing = cart.find((item) => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  renderCart();
}

function updateQuantity(name, change) {
  const item = cart.find((cartItem) => cartItem.name === name);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    const index = cart.findIndex((cartItem) => cartItem.name === name);
    cart.splice(index, 1);
  }

  renderCart();
}

function removeItem(name) {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) cart.splice(index, 1);
  renderCart();
}

function clearCart() {
  cart.splice(0, cart.length);
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = '';

  if (!cart.length) {
    cartItems.innerHTML = '<li class="empty">No loaves added yet.</li>';
    cartTotal.textContent = '$0';
    cartField.value = '';
    return;
  }

  let total = 0;
  const cartText = [];

  cart.forEach((item) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    cartText.push(`${item.qty} x ${item.name} - $${itemTotal}`);

    const li = document.createElement('li');
    li.className = 'cart-line';
    li.innerHTML = `
      <div>
        <span class="cart-name">${item.qty} × ${item.name}</span>
        <small>$${item.price} each</small>
      </div>
      <div class="cart-actions">
        <button type="button" aria-label="Decrease ${item.name}" data-action="decrease" data-name="${item.name}">−</button>
        <button type="button" aria-label="Increase ${item.name}" data-action="increase" data-name="${item.name}">+</button>
        <button type="button" aria-label="Remove ${item.name}" data-action="remove" data-name="${item.name}">Remove</button>
        <strong>$${itemTotal}</strong>
      </div>
    `;
    cartItems.appendChild(li);
  });

  cartTotal.textContent = `$${total}`;
  cartField.value = `${cartText.join('\n')}\nTotal: $${total}`;
}

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { action, name } = button.dataset;

  if (action === 'increase') updateQuantity(name, 1);
  if (action === 'decrease') updateQuantity(name, -1);
  if (action === 'remove') removeItem(name);
});

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!cart.length) {
    alert('Please add at least one item to your order first.');
    document.querySelector('#menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const formData = new FormData(orderForm);
  const subject = 'New Maple & Moss Order Request';
  const body = [
    'New Maple & Moss order request',
    '',
    `Name: ${formData.get('name')}`,
    `Email: ${formData.get('email')}`,
    `Phone: ${formData.get('phone') || 'N/A'}`,
    `Pickup/Delivery: ${formData.get('fulfillment')}`,
    `Address/Pickup note: ${formData.get('address') || 'N/A'}`,
    '',
    'Order:',
    cartField.value,
    '',
    `Notes: ${formData.get('notes') || 'N/A'}`,
  ].join('\n');

  window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const clearButton = document.querySelector('#clear-cart');
if (clearButton) clearButton.addEventListener('click', clearCart);
