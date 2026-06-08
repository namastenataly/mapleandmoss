const cart = [];
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const cartField = document.querySelector('#cart-field');

document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelectorAll('.menu-card button').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.menu-card');
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    const existing = cart.find((item) => item.name === name);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    renderCart();
  });
});

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
    cartText.push(`${item.qty} x ${item.name} ($${itemTotal})`);

    const li = document.createElement('li');
    li.innerHTML = `<span>${item.qty} × ${item.name}</span><strong>$${itemTotal}</strong>`;
    cartItems.appendChild(li);
  });

  cartTotal.textContent = `$${total}`;
  cartField.value = `${cartText.join(', ')} | Total: $${total}`;
}
