const cart = [];
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const cartField = document.querySelector('#cart-field');
const orderForm = document.querySelector('#order-form');
const year = document.querySelector('#year');
const clearButton = document.querySelector('#clear-cart');

// ==============================
// MAPLE & MOSS SETTINGS
// ==============================
// 1) Create an EmailJS account.
// 2) Add your EmailJS Public Key, Service ID, and Template ID below.
// 3) Create a Stripe Payment Link and paste it below.
// Official docs:
// EmailJS browser SDK: https://www.emailjs.com/docs/sdk/installation/
// Stripe Payment Links: https://docs.stripe.com/payment-links/create

const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/YOUR_PAYMENT_LINK';
const BUSINESS_EMAIL = 'hello@mapleandmoss.com';

if (year) year.textContent = new Date().getFullYear();

if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

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

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartText() {
  if (!cart.length) return '';
  return cart.map((item) => `${item.qty} x ${item.name} - $${item.price * item.qty}`).join('\n');
}

function renderCart() {
  cartItems.innerHTML = '';

  if (!cart.length) {
    cartItems.innerHTML = '<li class="empty">No loaves added yet.</li>';
    cartTotal.textContent = '$0';
    cartField.value = '';
    return;
  }

  const total = getCartTotal();

  cart.forEach((item) => {
    const itemTotal = item.price * item.qty;

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
  cartField.value = `${getCartText()}\nTotal: $${total}`;
}

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { action, name } = button.dataset;

  if (action === 'increase') updateQuantity(name, 1);
  if (action === 'decrease') updateQuantity(name, -1);
  if (action === 'remove') removeItem(name);
});

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!cart.length) {
    alert('Please add at least one item to your order first.');
    document.querySelector('#menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const submitButton = orderForm.querySelector('button[type="submit"]');
  const status = document.querySelector('#order-status');
  const formData = new FormData(orderForm);
  const total = getCartTotal();

  const order = {
    customer_name: formData.get('name'),
    customer_email: formData.get('email'),
    customer_phone: formData.get('phone') || 'N/A',
    fulfillment: formData.get('fulfillment'),
    address: formData.get('address') || 'N/A',
    notes: formData.get('notes') || 'N/A',
    order_items: getCartText(),
    order_total: `$${total}`,
    business_email: BUSINESS_EMAIL,
  };

  submitButton.disabled = true;
  submitButton.textContent = 'Sending order...';
  status.textContent = '';

  try {
    if (!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
      throw new Error('EmailJS is not configured yet.');
    }

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, order);

    status.textContent = 'Order sent! Opening payment page now.';

    if (STRIPE_PAYMENT_LINK.includes('YOUR_PAYMENT_LINK')) {
      alert('Order sent. Add your real Stripe Payment Link in script.js to collect payment online.');
    } else {
      window.open(STRIPE_PAYMENT_LINK, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error(error);

    const subject = 'New Maple & Moss Order Request';
    const body = [
      'New Maple & Moss order request',
      '',
      `Name: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      `Phone: ${order.customer_phone}`,
      `Pickup/Delivery: ${order.fulfillment}`,
      `Address/Pickup note: ${order.address}`,
      '',
      'Order:',
      cartField.value,
      '',
      `Notes: ${order.notes}`,
    ].join('\n');

    status.textContent = 'EmailJS is not configured yet, so your email app will open with the order details.';
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send Order + Pay';
  }
});

if (clearButton) clearButton.addEventListener('click', clearCart);
