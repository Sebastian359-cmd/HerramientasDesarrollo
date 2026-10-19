// URL base de los endpoints documentados en Swagger
const API_SWAGGER_PRODUCTOS = 'http://localhost:8080/api/productos';

// Fallback con mock de prueba por si el backend aún no está encendido
const PRODUCTOS_BACKUP = [
    {
        id: 1,
        nombre: 'Servidor Rack 2U',
        categoria: 'Servidores',
        precio: 5200,
        imagen: 'img/p1.jpg',
        descripcion: 'Servidor de alta densidad diseñado para cargas de trabajo críticas y virtualización continua.',
        stock: 12
    },
    {
        id: 2,
        nombre: 'Cámara IA 4K',
        categoria: 'Video',
        precio: 800,
        imagen: 'img/p2.jpg',
        descripcion: 'Cámara inteligente con reconocimiento facial y conteo de personas en tiempo real.',
        stock: 20
    },
    {
        id: 3,
        nombre: 'Switch 24 puertos',
        categoria: 'Redes',
        precio: 450,
        imagen: 'img/p3.jpg',
        descripcion: 'Switch gestionable Gigabit de capa 2/3 con soporte PoE+ para equipos empresariales.',
        stock: 15
    }
];

let productoModalActual = null;
let cantidadModal = 1;
let modalBootstrapInstance = null;

// Inicializa el modal de Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('modalProductoEspecifico');
    if (modalEl && window.bootstrap) {
        modalBootstrapInstance = new bootstrap.Modal(modalEl);
    }

    // Configurar listeners de incremento / decremento
    document.getElementById('modal-btn-menos')?.addEventListener('click', () => {
        if (cantidadModal > 1) {
            cantidadModal--;
            actualizarContadorModal();
        }
    });

    document.getElementById('modal-btn-mas')?.addEventListener('click', () => {
        const max = productoModalActual?.stock ?? 99;
        if (cantidadModal < max) {
            cantidadModal++;
            actualizarContadorModal();
        }
    });

    document.getElementById('modal-btn-confirmar')?.addEventListener('click', () => {
        if (!productoModalActual) return;
        const subtotal = productoModalActual.precio * cantidadModal;
        alert(`Añadido:\n${cantidadModal}x ${productoModalActual.nombre}\nTotal: S/. ${subtotal.toFixed(2)}`);
        modalBootstrapInstance?.hide();
    });
});

/**
 * Función principal que llama la tarjeta al hacer clic
 * @param {number|string} idProducto 
 */
async function abrirDetalleProducto(idProducto) {
    cantidadModal = 1;
    const loader = document.getElementById('modal-cargando');
    const errorBox = document.getElementById('modal-error');
    const contenido = document.getElementById('modal-detalle-contenido');

    loader.style.display = 'block';
    errorBox.style.display = 'none';
    contenido.style.display = 'none';

    // Abrir ventana modal
    modalBootstrapInstance?.show();

    try {
        productoModalActual = null;

        // 1. Intentar consultar endpoint de Swagger
        try {
            const res = await fetch(`${API_SWAGGER_PRODUCTOS}/${idProducto}`);
            if (res.ok) {
                productoModalActual = await res.json();
            }
        } catch (e) {
            console.warn('API Swagger no alcanzable, usando datos de respaldo.');
        }

        // 2. Si no responde el backend, buscar en el mock local
        if (!productoModalActual) {
            productoModalActual = PRODUCTOS_BACKUP.find(p => p.id == idProducto) || PRODUCTOS_BACKUP[0];
        }

        if (!productoModalActual) {
            throw new Error('No se pudo cargar la información del producto.');
        }

        // 3. Renderizar campos
        document.getElementById('modal-producto-nombre').textContent = productoModalActual.nombre;
        document.getElementById('modal-categoria').textContent = productoModalActual.categoria || 'Producto';
        document.getElementById('modal-precio').textContent = `S/. ${Number(productoModalActual.precio).toFixed(2)}`;
        document.getElementById('modal-descripcion').textContent = productoModalActual.descripcion || 'Sin descripción disponible.';
        
        const stock = productoModalActual.stock ?? 10;
        document.getElementById('modal-stock').textContent = `Stock disponible: ${stock} unidades`;

        const img = document.getElementById('modal-img');
        img.src = productoModalActual.imagen || 'img/p1.jpg';
        img.alt = productoModalActual.nombre;

        actualizarContadorModal();

        loader.style.display = 'none';
        contenido.style.display = 'grid';

    } catch (err) {
        loader.style.display = 'none';
        errorBox.textContent = err.message;
        errorBox.style.display = 'block';
    }
}

function actualizarContadorModal() {
    const display = document.getElementById('modal-display-cantidad');
    const btnMenos = document.getElementById('modal-btn-menos');
    const btnMas = document.getElementById('modal-btn-mas');
    const txtSubtotal = document.getElementById('modal-subtotal');

    display.textContent = cantidadModal;
    btnMenos.disabled = cantidadModal <= 1;
    btnMas.disabled = cantidadModal >= (productoModalActual?.stock ?? 99);

    if (productoModalActual) {
        const sub = productoModalActual.precio * cantidadModal;
        txtSubtotal.textContent = `Subtotal: S/. ${sub.toFixed(2)}`;
    }
}