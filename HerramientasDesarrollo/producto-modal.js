const API_PUBLICA_PRODUCTOS =
    "https://sgt.azorweb.dev/api/public/web/productos";

const API_PUBLICA_SERVICIOS =
    "https://sgt.azorweb.dev/api/public/web/servicios";

let productoModalActual = null;
let cantidadModal = 1;
let modalBootstrapInstance = null;

// Convierte una ruta de imagen relativa en una URL completa.
function resolverImagenModal(producto) {
    const imagen = producto.url_img || producto.imagen;

    if (!imagen) return "";

    if (/^(https?:|data:|blob:)/i.test(imagen)) {
        return imagen;
    }

    return "https://sgt.azorweb.dev" +
        (imagen.startsWith("/") ? "" : "/") +
        imagen;
}

// Obtiene el valor de un campo aunque tenga distintos nombres.
function obtenerCampo(objeto, nombres) {
    for (const nombre of nombres) {
        if (objeto[nombre] !== undefined &&
            objeto[nombre] !== null &&
            objeto[nombre] !== "") {
            return objeto[nombre];
        }
    }

    return null;
}

document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.getElementById("modalProductoEspecifico");

    if (modalEl && window.bootstrap) {
        modalBootstrapInstance = new bootstrap.Modal(modalEl);
    } else if (modalEl) {
        console.error(
            "No se pudo inicializar el modal. Comprueba que Bootstrap JS esté cargado."
        );
    }

    document.getElementById("modal-btn-menos")?.addEventListener("click", () => {
        if (cantidadModal > 1) {
            cantidadModal--;
            actualizarContadorModal();
        }
    });

    document.getElementById("modal-btn-mas")?.addEventListener("click", () => {
        const stock = obtenerCampo(productoModalActual || {}, [
            "stock",
            "cantidad_stock",
            "existencias"
        ]);

        // Si la API no informa stock, no se inventa un límite.
        const max = stock === null ? 99 : Number(stock);

        if (cantidadModal < max) {
            cantidadModal++;
            actualizarContadorModal();
        }
    });

    document.getElementById("modal-btn-confirmar")?.addEventListener("click", () => {
        if (!productoModalActual) return;

        const precio = obtenerCampo(productoModalActual, [
            "precio",
            "precio_venta",
            "precioVenta"
        ]);

        if (precio === null || !Number.isFinite(Number(precio))) {
            alert("Este producto no tiene un precio disponible en la API.");
            return;
        }

        const subtotal = Number(precio) * cantidadModal;

        alert(
            `Seleccionaste:\n${cantidadModal} x ${productoModalActual.nombre}\n` +
            `Subtotal: S/ ${subtotal.toFixed(2)}`
        );

        modalBootstrapInstance?.hide();
    });
});

/**
 * Abre el modal y busca el producto real en la API pública.
 * @param {number|string} idProducto
 */

async function abrirDetalleProducto(idElemento, tipo = "producto") {
    cantidadModal = 1;

    const loader = document.getElementById("modal-cargando");
    const errorBox = document.getElementById("modal-error");
    const contenido = document.getElementById("modal-detalle-contenido");

    if (!loader || !errorBox || !contenido) {
        console.error("Faltan elementos HTML necesarios para el modal.");
        return;
    }

    loader.style.display = "block";
    errorBox.style.display = "none";
    contenido.style.display = "none";

    modalBootstrapInstance?.show();

    try {
        productoModalActual = null;

        const api = tipo === "servicio"
            ? API_PUBLICA_SERVICIOS
            : API_PUBLICA_PRODUCTOS;

        const respuesta = await fetch(api);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status} al consultar ${api}`);
        }

        const datos = await respuesta.json();

        const elementos = Array.isArray(datos)
            ? datos
            : datos.productos || datos.servicios || datos.data || datos.content || [];

        if (!Array.isArray(elementos)) {
            throw new Error("La API no devolvió una lista válida.");
        }

        productoModalActual = elementos.find(
            elemento => String(elemento.id) === String(idElemento)
        );

        if (!productoModalActual) {
            throw new Error(
                `No se encontró el ${tipo} con ID ${idElemento}.`
            );
        }

        const elemento = productoModalActual;

        const nombre = elemento.nombre || elemento.nombre_servicio || "Sin nombre";

        const categoria = obtenerCampo(elemento, [
            "categoria",
            "tipo_evento",
            "tipo",
            "tipo_producto"
        ]);

        const descripcion = obtenerCampo(elemento, [
            "descripcion",
            "descripcion_corta",
            "descripcion_larga"
        ]);

        const precio = obtenerCampo(elemento, [
            "precio",
            "precio_venta",
            "precioVenta"
        ]);

        const stock = obtenerCampo(elemento, [
            "stock",
            "cantidad_stock",
            "existencias"
        ]);

        document.getElementById("modal-producto-nombre").textContent = nombre;

        document.getElementById("modal-categoria").textContent =
            categoria || (tipo === "servicio" ? "Servicio" : "Producto");

        document.getElementById("modal-descripcion").textContent =
            descripcion || "Sin descripción disponible.";

        document.getElementById("modal-precio").textContent =
            precio !== null && Number.isFinite(Number(precio))
                ? `S/ ${Number(precio).toFixed(2)}`
                : "Precio no disponible";

        document.getElementById("modal-stock").textContent =
            stock !== null
                ? `Stock disponible: ${stock} unidades`
                : "Stock no disponible";

        const img = document.getElementById("modal-img");
        const urlImagen = resolverImagenModal(elemento);

        img.alt = nombre;

        if (urlImagen) {
            img.src = urlImagen;
            img.style.display = "";
            img.onerror = () => {
                img.onerror = null;
                img.removeAttribute("src");
                img.style.display = "none";
            };
        } else {
            img.removeAttribute("src");
            img.style.display = "none";
        }

        actualizarContadorModal();

        loader.style.display = "none";
        contenido.style.display = "grid";

    } catch (error) {
        console.error("Error al cargar el detalle:", error);

        loader.style.display = "none";
        contenido.style.display = "none";
        errorBox.textContent = error.message;
        errorBox.style.display = "block";
    }
}

function actualizarContadorModal() {
    const display = document.getElementById("modal-display-cantidad");
    const btnMenos = document.getElementById("modal-btn-menos");
    const btnMas = document.getElementById("modal-btn-mas");
    const txtSubtotal = document.getElementById("modal-subtotal");

    if (!display || !btnMenos || !btnMas || !txtSubtotal) return;

    const stock = obtenerCampo(productoModalActual || {}, [
        "stock",
        "cantidad_stock",
        "existencias"
    ]);

    const precio = obtenerCampo(productoModalActual || {}, [
        "precio",
        "precio_venta",
        "precioVenta"
    ]);

    display.textContent = cantidadModal;
    btnMenos.disabled = cantidadModal <= 1;

    const max = stock === null ? 99 : Number(stock);
    btnMas.disabled = cantidadModal >= max;

    if (precio !== null && Number.isFinite(Number(precio))) {
        const subtotal = Number(precio) * cantidadModal;
        txtSubtotal.textContent = `Subtotal: S/ ${subtotal.toFixed(2)}`;
    } else {
        txtSubtotal.textContent = "Subtotal no disponible";
    }
}
