const API_BASE = "https://sgt.azorweb.dev";

const TIPOS = {
  producto: { nombre: "Productos", etiqueta: "Producto", dot: "prod" },
  servicio: { nombre: "Servicios", etiqueta: "Servicio", dot: "serv" },
};

const IMAGEN_VACIA =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">' +
      '<rect width="100%" height="100%" fill="#111827"/>' +
      '<text x="50%" y="50%" fill="#4a5a78" font-family="Arial" font-size="18" ' +
      'text-anchor="middle" dominant-baseline="middle">Sin imagen</text></svg>',
  );

const estado = {
  items: [],
  categoria: "all",
};

const dom = {
  contenedor: document.getElementById("product-container"),
  busqueda: document.getElementById("search-input"),
  limpiarBusqueda: document.getElementById("search-clear"),
  orden: document.getElementById("sort-select"),
  categorias: document.querySelector(".cat-list"),
  reiniciar: document.getElementById("reset-btn"),
};

async function pedirJSON(ruta) {
  const respuesta = await fetch(API_BASE + ruta);
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status} en ${ruta}`);
  return respuesta.json();
}

async function cargarItems() {
  const [productos, servicios] = await Promise.all([
    pedirJSON("/api/public/web/productos"),
    pedirJSON("/api/public/web/servicios"),
  ]);

  return [
    ...productos.map((p) => ({ ...p, tipo: "producto" })),
    ...servicios.map((s) => ({ ...s, tipo: "servicio" })),
  ];
}

function coincideConBusqueda(item, texto) {
  if (!texto) return true;
  const campos = [item.nombre, item.subtitulo, item.descripcion_corta];
  return campos.some((campo) => (campo || "").toLowerCase().includes(texto));
}

function coincideConCategoria(item) {
  return estado.categoria === "all" || item.tipo === estado.categoria;
}

const ORDENAMIENTOS = {
  az: (a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"),
  za: (a, b) => (b.nombre || "").localeCompare(a.nombre || "", "es"),
  default: (a, b) => Number(!!b.destacado) - Number(!!a.destacado),
};

function obtenerItemsVisibles() {
  const texto = dom.busqueda.value.trim().toLowerCase();

  return estado.items
    .filter(
      (item) => coincideConBusqueda(item, texto) && coincideConCategoria(item),
    )
    .sort(ORDENAMIENTOS[dom.orden.value]);
}
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

function resolverImagen(item) {
  if (!item.url_img) return IMAGEN_VACIA;
  if (/^(https?:|data:)/i.test(item.url_img)) return item.url_img;
  return API_BASE + (item.url_img.startsWith("/") ? "" : "/") + item.url_img;
}

function crearTarjeta(item) {
  const tipo = TIPOS[item.tipo];
  const etiqueta = item.destacado
    ? `${tipo.etiqueta} · Destacado`
    : tipo.etiqueta;

  const descripcion =
    item.descripcion_corta || item.descripcion || "Sin descripción disponible.";

  const caracteristicas = (item.caracteristicas || [])
    .slice(0, 3)
    .map((texto) => `<span class="prod-chip">${escaparHTML(texto)}</span>`)
    .join("");

  return `
        <article class="prod-card">
            <div class="prod-img">
                <img
                    src="${escaparHTML(resolverImagen(item))}"
                    alt="${escaparHTML(item.nombre)}"
                    loading="lazy"
                />
            </div>

            <div class="prod-body">
                <span class="prod-codigo">${escaparHTML(etiqueta)}</span>

                <h3>${escaparHTML(item.nombre)}</h3>

                ${
                  item.subtitulo
                    ? `<small class="prod-ubicacion">${escaparHTML(item.subtitulo)}</small>`
                    : ""
                }

                <p>${escaparHTML(descripcion)}</p>

                <div class="prod-chips">
                    ${caracteristicas}
                </div>

                <button
                    class="prod-btn"
                    type="button"
                    onclick="abrirDetalleProducto(${JSON.stringify(item.id)}, '${item.tipo}')">
                    Ver detalle
                </button>
            </div>
        </article>
    `;
}

function mostrarMensaje(texto) {
  dom.contenedor.innerHTML = `<p class="prod-mensaje">${texto}</p>`;
}

function mostrarItems() {
  const visibles = obtenerItemsVisibles();

  if (visibles.length === 0) {
    mostrarMensaje(
      "No se encontraron productos ni servicios con esos filtros.",
    );
    return;
  }

  dom.contenedor.innerHTML = `
    <p class="prod-resumen">${visibles.length} de ${estado.items.length} productos y servicios</p>
    <div class="prod-grid">${visibles.map(crearTarjeta).join("")}</div>`;

  dom.contenedor.querySelectorAll(".prod-img img").forEach((img) => {
    img.addEventListener("error", () => (img.src = IMAGEN_VACIA), {
      once: true,
    });
  });
}

function mostrarCategorias() {
  const botones = [
    { id: "all", nombre: "Todos", dot: "all", cantidad: estado.items.length },
  ];

  for (const [id, tipo] of Object.entries(TIPOS)) {
    const cantidad = estado.items.filter((item) => item.tipo === id).length;
    if (cantidad > 0)
      botones.push({ id, nombre: tipo.nombre, dot: tipo.dot, cantidad });
  }

  dom.categorias.innerHTML = botones
    .map(
      (b) => `
      <button class="cat-btn ${b.id === estado.categoria ? "active" : ""}" data-cat="${b.id}">
        <span class="cat-dot ${b.dot}"></span>
        ${b.nombre}
        <span class="cat-count">${b.cantidad}</span>
      </button>`,
    )
    .join("");
}

function actualizarPantalla() {
  dom.limpiarBusqueda.classList.toggle(
    "visible",
    dom.busqueda.value.length > 0,
  );
  mostrarCategorias();
  mostrarItems();
}

dom.busqueda.addEventListener("input", actualizarPantalla);
dom.orden.addEventListener("change", actualizarPantalla);

dom.categorias.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".cat-btn");
  if (!boton) return;
  estado.categoria = boton.dataset.cat;
  actualizarPantalla();
});

dom.limpiarBusqueda.addEventListener("click", () => {
  dom.busqueda.value = "";
  dom.busqueda.focus();
  actualizarPantalla();
});

dom.reiniciar.addEventListener("click", () => {
  dom.busqueda.value = "";
  dom.orden.value = "default";
  estado.categoria = "all";
  actualizarPantalla();
});

async function iniciar() {
  mostrarMensaje("Cargando productos y servicios...");
  try {
    estado.items = await cargarItems();
    actualizarPantalla();
  } catch (error) {
    console.error(error);
    mostrarMensaje(
      "No se pudieron cargar los productos. Revisa la consola (F12).",
    );
  }
}

iniciar();
