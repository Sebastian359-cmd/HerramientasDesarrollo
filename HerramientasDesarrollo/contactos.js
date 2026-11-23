document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const cartCount = document.getElementById('cartCount');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  try {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    if (cartCount && Array.isArray(carrito)) {
      cartCount.textContent = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
    }
  } catch {
    // Sin items en carrito aún
  }
});