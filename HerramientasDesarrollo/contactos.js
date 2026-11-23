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



/* ==================== SLIDER AUTOMÁTICO Y MANUAL ==================== */
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  let currentSlide = 0;
  let sliderInterval;

  function showSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function startAutoSlide() {
    if (sliderInterval) clearInterval(sliderInterval);
    sliderInterval = setInterval(() => showSlide(currentSlide + 1), 5500);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      startAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      startAutoSlide();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.index));
      startAutoSlide();
    });
  });

  startAutoSlide();



  /* ==================== VALIDACIÓN Y ENVÍO DE FORMULARIO ==================== */
  const contactForm = document.getElementById('contactForm');
  const mensajeInput = document.getElementById('mensaje');
  const charCounter = document.getElementById('charCounter');
  const formSuccess = document.getElementById('formSuccess');
  const ticketRef = document.getElementById('ticketRef');
  const submitBtn = document.getElementById('submitBtn');

  if (mensajeInput && charCounter) {
    mensajeInput.addEventListener('input', () => {
      charCounter.textContent = `${mensajeInput.value.length} / 500`;
    });
  }

  function setError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (input) input.classList.toggle('invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message;
  }

  function validateForm() {
    let isValid = true;

    const nombre = document.getElementById('nombre').value.trim();
    const empresa = document.getElementById('empresa').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const servicio = document.getElementById('servicio').value;
    const ruc = document.getElementById('ruc').value.trim();
    const mensaje = mensajeInput.value.trim();
    const privacidad = document.getElementById('privacidad').checked;

    if (nombre.length < 3) {
      setError('nombre', 'Ingresa tu nombre completo (mínimo 3 caracteres).');
      isValid = false;
    } else {
      setError('nombre', '');
    }

    if (empresa.length < 2) {
      setError('empresa', 'Ingresa el nombre de tu empresa u organización.');
      isValid = false;
    } else {
      setError('empresa', '');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('email', 'Ingresa un correo electrónico válido.');
      isValid = false;
    } else {
      setError('email', '');
    }

    const phoneRegex = /^[0-9+\s()-]{7,15}$/;
    if (!phoneRegex.test(telefono)) {
      setError('telefono', 'Ingresa un número telefónico válido.');
      isValid = false;
    } else {
      setError('telefono', '');
    }

    if (!servicio) {
      setError('servicio', 'Selecciona una solución o servicio de interés.');
      isValid = false;
    } else {
      setError('servicio', '');
    }

    if (ruc && !/^\d{11}$/.test(ruc)) {
      setError('ruc', 'El RUC debe contener exactamente 11 dígitos numéricos.');
      isValid = false;
    } else {
      setError('ruc', '');
    }

    if (mensaje.length < 15) {
      setError('mensaje', 'Describe tu consulta con al menos 15 caracteres.');
      isValid = false;
    } else {
      setError('mensaje', '');
    }

    if (!privacidad) {
      setError('privacidad', 'Debes aceptar la política de privacidad para continuar.');
      isValid = false;
    } else {
      setError('privacidad', '');
    }

    return isValid;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formSuccess.hidden = true;

      if (!validateForm()) return;

      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Enviando solicitud...';

      setTimeout(() => {
        const codigo = `CFBD-${Math.floor(100000 + Math.random() * 900000)}`;
        const registro = {
          codigo,
          nombre: document.getElementById('nombre').value.trim(),
          empresa: document.getElementById('empresa').value.trim(),
          email: document.getElementById('email').value.trim(),
          telefono: document.getElementById('telefono').value.trim(),
          servicio: document.getElementById('servicio').value,
          ruc: document.getElementById('ruc').value.trim(),
          mensaje: mensajeInput.value.trim(),
          fecha: new Date().toISOString()
        };

        const historial = JSON.parse(localStorage.getItem('cfbd_contactos') || '[]');
        historial.push(registro);
        localStorage.setItem('cfbd_contactos', JSON.stringify(historial));

        ticketRef.textContent = codigo;
        formSuccess.hidden = false;
        contactForm.reset();
        charCounter.textContent = '0 / 500';
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Enviar mensaje';
      }, 600);
    });
  }