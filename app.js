
// Paradise Nursery - shared cart & data logic
const LS_KEY = 'paradise_cart_v1';

// Demo catalog
const PRODUCTS = [
  { id: 'aloe', name: 'Aloe Vera', price: 299, category: 'Succulents', img: './images/plant1.svg' },
  { id: 'snake', name: 'Snake Plant', price: 499, category: 'Air Purifying', img: './images/plant2.svg' },
  { id: 'pothos', name: 'Golden Pothos', price: 349, category: 'Hanging', img: './images/plant3.svg' },
  { id: 'monstera', name: 'Monstera Deliciosa', price: 999, category: 'Tropical', img: './images/plant4.svg' },
  { id: 'peace', name: 'Peace Lily', price: 599, category: 'Air Purifying', img: './images/plant5.svg' },
  { id: 'zz', name: 'ZZ Plant', price: 799, category: 'Low Light', img: './images/plant6.svg' },
  { id: 'jade', name: 'Jade Plant', price: 399, category: 'Succulents', img: './images/plant7.svg' },
  { id: 'areca', name: 'Areca Palm', price: 1299, category: 'Tropical', img: './images/plant8.svg' }
];

function getCart(){
  try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch(e){ return {}; }
}
function setCart(cart){
  localStorage.setItem(LS_KEY, JSON.stringify(cart));
  updateCartCount();
}

function getTotalItems(cart = getCart()){
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}
function getCartTotal(cart = getCart()){
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return p ? sum + p.price * qty : sum;
  }, 0);
}

// Header badge updater (expects an element with id="cart-count")
function updateCartCount(){
  const el = document.getElementById('cart-count');
  if(el) el.textContent = getTotalItems();
}

// Add / remove
function addToCart(id, qty = 1){
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  if(cart[id] <= 0) delete cart[id];
  setCart(cart);
}
function removeFromCart(id){
  const cart = getCart();
  delete cart[id];
  setCart(cart);
}

// Render products on products.html
function renderProducts(){
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  // Group by category
  const categories = [...new Set(PRODUCTS.map(p => p.category))];
  const frag = document.createDocumentFragment();
  categories.forEach(cat => {
    const h = document.createElement('h2');
    h.textContent = cat;
    h.className = 'small';
    frag.appendChild(h);
    const wrap = document.createElement('div');
    wrap.className = 'grid product-grid';
    PRODUCTS.filter(p => p.category === cat).forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="thumb"><img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover"></div>
        <h3>${p.name}</h3>
        <div class="price">₹${p.price.toLocaleString('en-IN')}</div>
        <button class="btn" data-id="${p.id}">Add to Cart</button>
      `;
      wrap.appendChild(card);
    });
    frag.appendChild(wrap);
  });
  grid.appendChild(frag);

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if(!btn) return;
    addToCart(btn.getAttribute('data-id'), 1);
  });
}

// Render cart on cart.html
function renderCart(){
  const tbody = document.querySelector('#cart-table tbody');
  const totalItemsEl = document.getElementById('total-items');
  const totalCostEl = document.getElementById('total-cost');
  if(!tbody || !totalItemsEl || !totalCostEl) return;

  const cart = getCart();
  tbody.innerHTML = '';
  Object.entries(cart).forEach(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if(!p) return;
    const tr = document.createElement('tr');
    const subtotal = p.price * qty;
    tr.innerHTML = `
      <td style="width:80px"><img src="${p.img}" alt="${p.name}" style="width:64px;height:48px;object-fit:cover;border-radius:8px;border:1px solid rgba(148,163,184,.2)"></td>
      <td>${p.name}</td>
      <td>₹${p.price.toLocaleString('en-IN')}</td>
      <td>
        <div style="display:inline-flex; align-items:center; gap:8px">
          <button class="btn-qty" data-id="${p.id}" data-delta="-1" title="Decrease">−</button>
          <strong>${qty}</strong>
          <button class="btn-qty" data-id="${p.id}" data-delta="1" title="Increase">+</button>
        </div>
      </td>
      <td><strong>₹${subtotal.toLocaleString('en-IN')}</strong></td>
      <td><button class="btn-del" data-id="${p.id}" title="Remove">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Totals
  totalItemsEl.textContent = getTotalItems(cart);
  totalCostEl.textContent = '₹' + getCartTotal(cart).toLocaleString('en-IN');

  // Wire buttons
  tbody.addEventListener('click', (e) => {
    const decInc = e.target.closest('.btn-qty');
    const del = e.target.closest('.btn-del');
    if(decInc){
      const id = decInc.getAttribute('data-id');
      const delta = parseInt(decInc.getAttribute('data-delta'),10);
      addToCart(id, delta);
      renderCart(); // re-render
    }else if(del){
      const id = del.getAttribute('data-id');
      removeFromCart(id);
      renderCart();
    }
  });
}

// On DOM ready
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  // page-specific hooks
  if(document.getElementById('product-grid')) renderProducts();
  if(document.getElementById('cart-table')) renderCart();
});
