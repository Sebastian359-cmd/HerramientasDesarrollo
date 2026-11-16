
const API_PUBLICA_PRODUCTOS =
  "https://sgt.azorweb.dev/api/public/web/productos";

const API_PUBLICA_SERVICIOS =
  "https://sgt.azorweb.dev/api/public/web/servicios";

let productoModalActual = null;
let cantidadModal = 1;
let modalBootstrapInstance = null;

// Guardamos las listas por separado para no consultar repetidamente.
const cacheElementos = {
  producto: null,
  servicio: null
};

// Evita que una petición anterior sobrescriba una más reciente.
let numeroSolicitud = 0;

// Obtener un campo aunque tenga distintos nombres.
function obtenerCampo(objeto, nombres) {
  if (!objeto) return null;

  for (const nombre of nombres) {
    const valor = objeto[nombre];

    if (
      valor !== undefined &&
      valor !== null &&
      valor !== ""
    ) {
      return valor;
    }
  }

  return null;
}

// Obtener el ID de cada elemento.
function obtenerId(elemento) {
  return obtenerCampo(elemento, [
    "id",
    "id_producto",
    "id_servicio",
    "producto_id",
    "servicio_id"
  ]);
}

// Convertir la imagen en URL completa.
function resolverImagenModal(producto) {
  const imagen = obtenerCampo(producto, [
    "url_img",
    "imagen"
  ]);

  if (!imagen) return "";

  if (/^(https?:|data:|blob:)/i.test(imagen)) {
    return imagen;
  }

  return "https://sgt.azorweb.dev" +
    (imagen.startsWith("/") ? "" : "/") +
    imagen;
}

// Obtener características.
function generarCaracteristicas(elemento) {
  let valor = obtenerCampo(elemento, [
    "caracteristicas",
    "caracteristica",
    "especificaciones",
    "atributos",
    "tags"
  ]);

  if (!valor) return [];

  if (typeof valor === "string") {
    valor = valor.split(",").map(item => item.trim());
  }

  if (!Array.isArray(valor) && typeof valor === "object") {
    valor = Object.entries(valor).map(([clave, dato]) => {
      return dato ? `${clave}: ${dato}` : clave;
    });
  }

  if (!Array.isArray(valor)) return [];

  return valor.map(caracteristica => {
    if (
      typeof caracteristica === "string" ||
      typeof caracteristica === "number"
    ) {
      return String(caracteristica).trim();
    }

    if (caracteristica && typeof caracteristica === "object") {
      return String(
        caracteristica.nombre ||
        caracteristica.nombre_caracteristica ||
        caracteristica.caracteristica ||
        caracteristica.valor ||
        caracteristica.descripcion ||
        ""
      ).trim();
    }

    return "";
  }).filter(Boolean);
}

// Obtener la lista de la API.
function obtenerLista(datos, tipo) {
  if (Array.isArray(datos)) return datos;

  const lista = tipo === "servicio"
    ? datos.servicios || datos.data || datos.content
    : datos.productos || datos.data || datos.content;

  if (Array.isArray(lista)) return lista;

  return [];
}

// Consultar productos o servicios.
async function cargarElementos(tipo) {
  if (cacheElementos[tipo]) {
    return cacheElementos[tipo];
  }

  const api = tipo === "servicio"
    ? API_PUBLICA_SERVICIOS
    : API_PUBLICA_PRODUCTOS;

  const respuesta = await fetch(api);

  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  const elementos = obtenerLista(datos, tipo);

  if (!elementos.length) {
    throw new Error(`No se encontraron ${tipo}s en la API.`);
  }

  cacheElementos[tipo] = elementos;



  return elementos;
}



// Inicializar el modal.
document.addEventListener("DOMContentLoaded", () => {

  const modalEl = document.getElementById(
    "modalProductoEspecifico"
  );

  if (!modalEl || !window.bootstrap) {
    console.error("No se pudo inicializar Bootstrap Modal.");
    return;
  }

  modalBootstrapInstance = new bootstrap.Modal(modalEl);

  // Evitar la advertencia de foco al ocultar el modal.
  modalEl.addEventListener("hide.bs.modal", () => {
    if (modalEl.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    productoModalActual = null;
    cantidadModal = 1;
  });

  document.getElementById("modal-btn-menos")
    .addEventListener("click", () => {
      if (cantidadModal > 1) {
        cantidadModal--;
        actualizarContadorModal();
      }
    });

  document.getElementById("modal-btn-mas")
    .addEventListener("click", () => {
      if (!productoModalActual) return;

      const stock = obtenerCampo(productoModalActual, [
        "stock",
        "cantidad_stock",
        "existencias"
      ]);

      const max = stock === null ? 99 : Number(stock);

      if (Number.isFinite(max) && cantidadModal < max) {
        cantidadModal++;
        actualizarContadorModal();
      }
    });

  document.getElementById("modal-btn-confirmar")
    .addEventListener("click", () => {

      if (!productoModalActual) return;

      const precio = obtenerCampo(productoModalActual, [
        "precio",
        "precio_venta",
        "precioVenta"
      ]);

      if (
        precio === null ||
        !Number.isFinite(Number(precio))
      ) {
        alert("Este elemento no tiene un precio disponible.");
        return;
      }

      const stock = obtenerCampo(productoModalActual, [
        "stock",
        "cantidad_stock",
        "existencias"
      ]);

      if (
        stock !== null &&
        (!Number.isFinite(Number(stock)) ||
          Number(stock) < cantidadModal)
      ) {
        alert("No hay suficiente stock disponible.");
        return;
      }

      const nombre = obtenerCampo(productoModalActual, [
        "nombre",
        "nombre_servicio"
      ]) || "Sin nombre";

      const subtotal = Number(precio) * cantidadModal;

      alert(
        `Seleccionaste:\n${cantidadModal} x ${nombre}\n` +
        `Subtotal: S/ ${subtotal.toFixed(2)}`
      );

      modalBootstrapInstance.hide();
    });

});

// Abrir detalle de un producto o servicio.

async function abrirDetalleProducto(slugElemento, tipo = "producto") {

  const solicitudActual = ++numeroSolicitud;

  cantidadModal = 1;
  productoModalActual = null;

  const loader = document.getElementById("modal-cargando");
  const errorBox = document.getElementById("modal-error");
  const contenido = document.getElementById("modal-detalle-contenido");

  if (!loader || !errorBox || !contenido) {
    console.error("Faltan elementos HTML del modal.");
    return;
  }

  // Limpiar datos anteriores.
  document.getElementById("modal-producto-nombre").textContent = "";
  document.getElementById("modal-categoria").textContent = "";
  document.getElementById("modal-descripcion").textContent = "";
  document.getElementById("modal-precio").textContent = "";
  document.getElementById("modal-stock").textContent = "";
  document.getElementById("modal-caracteristicas").replaceChildren();

  const img = document.getElementById("modal-img");
  img.removeAttribute("src");
  img.style.display = "none";

  loader.style.display = "block";
  errorBox.style.display = "none";
  contenido.style.display = "none";

  actualizarContadorModal();
  modalBootstrapInstance?.show();

  try {
    if (tipo !== "producto" && tipo !== "servicio") {
      throw new Error("Tipo de elemento no válido.");
    }

    const elementos = await cargarElementos(tipo);

    if (solicitudActual !== numeroSolicitud) return;



    const elementoEncontrado = elementos.find(
      elemento => String(elemento.slug) === String(slugElemento)
    );

    if (!elementoEncontrado) {
      throw new Error(
        `No se encontró el ${tipo} con slug ${slugElemento}.`
      );
    }

    productoModalActual = elementoEncontrado;

    const nombre = obtenerCampo(elementoEncontrado, [
      "nombre",
      "nombre_servicio"
    ]) || "Sin nombre";

    const categoria = obtenerCampo(elementoEncontrado, [
      "categoria",
      "tipo_evento",
      "tipo",
      "tipo_producto"
    ]);

    const descripcion = obtenerCampo(elementoEncontrado, [
      "descripcion",
      "descripcion_corta",
      "descripcion_larga"
    ]);

    const precio = obtenerCampo(elementoEncontrado, [
      "precio",
      "precio_venta",
      "precioVenta"
    ]);

    const stock = obtenerCampo(elementoEncontrado, [
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
        : "S/ 1500";

    document.getElementById("modal-stock").textContent =
      stock !== null
        ? `Stock disponible: ${stock} unidades`
        : "999 en stock";

    // Características.
    const contenedorCaracteristicas = document.getElementById(
      "modal-caracteristicas"
    );

    const caracteristicas = generarCaracteristicas(elementoEncontrado);

    caracteristicas.forEach(texto => {
      const chip = document.createElement("span");
      chip.className = "prod-chip";
      chip.textContent = texto;
      contenedorCaracteristicas.appendChild(chip);
    });

    contenedorCaracteristicas.style.display =
      caracteristicas.length ? "flex" : "none";

    // Imagen.
    const urlImagen = resolverImagenModal(elementoEncontrado);

    img.alt = nombre;

    if (urlImagen) {
      img.src = urlImagen;
      img.style.display = "";

      img.onerror = () => {
        img.onerror = null;
        img.removeAttribute("src");
        img.style.display = "none";
      };
    }

    actualizarContadorModal();

    loader.style.display = "none";
    contenido.style.display = "grid";

  } catch (error) {
    if (solicitudActual !== numeroSolicitud) return;

    console.error("Error al cargar detalle:", error);

    loader.style.display = "none";
    contenido.style.display = "none";

    errorBox.textContent = error.message;
    errorBox.style.display = "block";
  }
}


// Actualizar cantidad y subtotal.
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

  btnMas.disabled =
    !Number.isFinite(max) || cantidadModal >= max;

  if (
    precio !== null &&
    Number.isFinite(Number(precio))
  ) {
    const subtotal = Number(precio) * cantidadModal;

    txtSubtotal.textContent =
      `Subtotal: S/ ${subtotal.toFixed(2)}`;
  } else {
    txtSubtotal.textContent = "Subtotal no disponible";
  }
}
