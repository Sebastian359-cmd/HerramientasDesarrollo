/* ============================================================
   SGT · Panel de administración web (HTML + CSS + JS puro)
   - MODULOS: cada módulo define sus campos; la pantalla se arma sola.
   - api: capa de datos. Hoy usa datos de prueba en memoria.
     Cuando conecten el backend, solo se reemplaza el interior de api.*
   ============================================================ */

// t: tipo de campo (text | number | date | img | area)
// c: se muestra en la tabla | b: se muestra como badge | full: ocupa todo el ancho
const MODULOS = {
  productos: {
    titulo: 'Productos', icono: '', singular: 'producto',
    campos: [
      { k: 'nombre', l: 'Nombre', c: 1, req: 1 },
      { k: 'categoria', l: 'Categoría', c: 1, b: 1 },
      { k: 'precio', l: 'Precio', t: 'number', c: 1 },
      { k: 'imagen', l: 'Ruta de la imagen', t: 'img' },
      { k: 'descripcion', l: 'Descripción', t: 'area', full: 1 },
    ],
    datos: [
      { nombre: 'Servidor Rack 2U', categoria: 'Servidores', precio: 5200, imagen: 'images/img1.jpg', descripcion: 'Alto rendimiento' },
      { nombre: 'Cámara IA 4K', categoria: 'Video', precio: 800, imagen: 'images/img2.jpg', descripcion: 'Analítica de video' },
      { nombre: 'Switch 24 puertos', categoria: 'Redes', precio: 450, imagen: 'images/img3.jpg', descripcion: 'Gigabit gestionable' },
    ],
  },
  servicios: {
    titulo: 'Servicios', icono: '', singular: 'servicio',
    campos: [
      { k: 'nombre', l: 'Nombre', c: 1, req: 1 },
      { k: 'resumen', l: 'Resumen', c: 1 },
      { k: 'imagen', l: 'Ruta de la imagen', t: 'img' },
      { k: 'descripcion', l: 'Descripción', t: 'area', full: 1 },
    ],
    datos: [
      { nombre: 'Monitoreo 24/7', resumen: 'Vigilancia continua de la infraestructura', imagen: 'images/img1.jpg', descripcion: '' },
      { nombre: 'Soporte técnico', resumen: 'Atención por tickets con SLA', imagen: 'images/img2.jpg', descripcion: '' },
    ],
  },
  partners: {
    titulo: 'Partners', icono: '', singular: 'partner',
    campos: [
      { k: 'nombre', l: 'Nombre', c: 1, req: 1 },
      { k: 'web', l: 'Sitio web', c: 1 },
      { k: 'logo', l: 'Ruta del logo', t: 'img' },
    ],
    datos: [
      { nombre: 'Dell Technologies', web: 'https://www.dell.com', logo: 'images/img3.jpg' },
      { nombre: 'Cisco', web: 'https://www.cisco.com', logo: 'images/img2.jpg' },
    ],
  },
  novedades: {
    titulo: 'Novedades', icono: '', singular: 'novedad',
    campos: [
      { k: 'titulo', l: 'Título', c: 1, req: 1 },
      { k: 'categoria', l: 'Categoría', c: 1, b: 1 },
      { k: 'fecha', l: 'Fecha', t: 'date', c: 1 },
      { k: 'imagen', l: 'Ruta de la imagen', t: 'img' },
      { k: 'contenido', l: 'Contenido', t: 'area', full: 1 },
    ],
    datos: [
      { titulo: 'Nuevo centro de datos', categoria: 'Infraestructura', fecha: '2026-09-15', imagen: 'images/img4.jpg', contenido: '' },
      { titulo: 'Alianza con proveedor de IA', categoria: 'Alianzas', fecha: '2026-10-01', imagen: 'images/img1.jpg', contenido: '' },
    ],
  },
  categorias: {
    titulo: 'Categorías de novedad', icono: '', singular: 'categoría',
    campos: [
      { k: 'nombre', l: 'Nombre', c: 1, req: 1 },
      { k: 'descripcion', l: 'Descripción', c: 1, t: 'area', full: 1 },
    ],
    datos: [
      { nombre: 'Infraestructura', descripcion: 'Novedades de servidores y redes' },
      { nombre: 'Alianzas', descripcion: 'Acuerdos con partners' },
    ],
  },
  documentos: {
    titulo: 'Documentos', icono: '', singular: 'documento',
    campos: [
      { k: 'titulo', l: 'Título', c: 1, req: 1 },
      { k: 'tipo', l: 'Tipo', c: 1, b: 1 },
      { k: 'url', l: 'Enlace al archivo', c: 1 },
    ],
    datos: [
      { titulo: 'Brochure corporativo', tipo: 'PDF', url: 'docs/brochure.pdf' },
      { titulo: 'Política de SLA', tipo: 'PDF', url: 'docs/sla.pdf' },
    ],
  },
  clientes: {
    titulo: 'Clientes de referencia', icono: '', singular: 'cliente',
    campos: [
      { k: 'nombre', l: 'Nombre', c: 1, req: 1 },
      { k: 'sector', l: 'Sector', c: 1, b: 1 },
      { k: 'logo', l: 'Ruta del logo', t: 'img' },
    ],
    datos: [
      { nombre: 'Banco Andino', sector: 'Finanzas', logo: 'images/img2.jpg' },
      { nombre: 'Minera del Sur', sector: 'Minería', logo: 'images/img3.jpg' },
    ],
  },
  casos: {
    titulo: 'Casos de éxito', icono: '', singular: 'caso de éxito',
    campos: [
      { k: 'titulo', l: 'Título', c: 1, req: 1 },
      { k: 'cliente', l: 'Cliente', c: 1, b: 1 },
      { k: 'resultado', l: 'Resultado', c: 1 },
      { k: 'imagen', l: 'Ruta de la imagen', t: 'img' },
    ],
    datos: [
      { titulo: 'Migración a la nube', cliente: 'Banco Andino', resultado: '40 % menos de caídas', imagen: 'images/img1.jpg' },
    ],
  },
};

/* ---------- Capa de datos (mock en memoria) ---------- */
const db = {};
let nextId = 100;
Object.entries(MODULOS).forEach(([k, m]) => (db[k] = m.datos.map((d, i) => ({ id: i + 1, ...d }))));

// Para conectar el backend: reemplaza el cuerpo de cada función por un fetch()
// (con el token del administrador en el header Authorization).
const api = {
  list: async (m) => [...db[m]],
  save: async (m, obj) => {
    if (obj.id) db[m] = db[m].map((x) => (x.id === obj.id ? obj : x));
    else db[m].push({ ...obj, id: nextId++ });
  },
  remove: async (m, id) => { db[m] = db[m].filter((x) => x.id !== id); },
};

/* ---------- Utilidades ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PH = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48"><rect width="64" height="48" fill="#16223b"/><text x="32" y="28" fill="#8b9bb8" font-size="9" text-anchor="middle" font-family="sans-serif">sin imagen</text></svg>');
const imgTag = (src, cls = 'thumb') => `<img class="${cls}" src="${esc(src)}" alt="" onerror="this.onerror=null;this.src='${PH}'">`;
const money = (n) => Number(n || 0).toLocaleString('es-PE', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
let toastTimer;
const toast = (msg) => {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
};

/* ---------- Estado ---------- */
let mod = 'productos';
let busqueda = '';
let rows = [];

/* ---------- Render ---------- */
function renderNav() {
  $('#nav').innerHTML = Object.entries(MODULOS)
    .map(([k, m]) => `<a href="#${k}" class="nav-item ${k === mod ? 'active' : ''}">${m.icono} ${m.titulo}</a>`)
    .join('');
}

async function renderVista() {
  const m = MODULOS[mod];
  rows = await api.list(mod);
  busqueda = '';
  $('#vista').innerHTML = `
    <h1>${m.titulo}</h1>
    <p class="subtitle">Crea, edita y elimina el contenido que se muestra en la web pública</p>
    <div class="stats">
      <div class="card stat"><span>Total de registros</span><strong id="s-total"></strong></div>
      <div class="card stat"><span>Resultados de la búsqueda</span><strong id="s-vis"></strong></div>
    </div>
    <div class="card toolbar">
      <input class="input" id="buscar" placeholder="  Buscar en ${m.titulo.toLowerCase()}..." />
      <button class="btn ghost" id="limpiar">Limpiar</button>
      <button class="btn primary" id="nuevo">+ Nuevo ${m.singular}</button>
    </div>
    <div class="card"><div class="table-wrap" id="tabla"></div><div class="table-foot" id="foot"></div></div>`;
  renderTabla();
}

function filtrar() {
  const q = busqueda.toLowerCase().trim();
  return rows.filter((r) => MODULOS[mod].campos.some((c) => String(r[c.k] ?? '').toLowerCase().includes(q)));
}

function celda(c, r) {
  const v = r[c.k];
  if (c.b) return `<span class="badge">${esc(v)}</span>`;
  if (c.t === 'number') return `<strong>${money(v)}</strong>`;
  return esc(v);
}

function renderTabla() {
  const m = MODULOS[mod];
  const f = filtrar();
  const imgCampo = m.campos.find((c) => c.t === 'img');
  const cols = m.campos.filter((c) => c.c);
  $('#s-total').textContent = rows.length;
  $('#s-vis').textContent = f.length;
  $('#foot').textContent = `Mostrando ${f.length} de ${rows.length} registros`;
  $('#tabla').innerHTML = `
    <table>
      <thead><tr>
        ${imgCampo ? '<th>Imagen</th>' : ''}
        ${cols.map((c) => `<th>${c.l}</th>`).join('')}
        <th class="right">Acciones</th>
      </tr></thead>
      <tbody>${f.length ? f.map((r) => `
        <tr>
          ${imgCampo ? `<td>${imgTag(r[imgCampo.k])}</td>` : ''}
          ${cols.map((c, i) => `<td>${i === 0 ? `<strong>${esc(r[c.k])}</strong>` : celda(c, r)}</td>`).join('')}
          <td class="right">
            <button class="btn small" data-editar="${r.id}"> Editar</button>
            <button class="btn small danger" data-borrar="${r.id}"> Eliminar</button>
          </td>
        </tr>`).join('') : `<tr><td class="empty" colspan="${cols.length + 2}">No se encontraron registros. Prueba con otra búsqueda o crea uno nuevo.</td></tr>`}
      </tbody>
    </table>`;
}

/* ---------- Modal crear / editar ---------- */
function abrirModal(reg) {
  const m = MODULOS[mod];
  const r = reg || {};
  const imgCampo = m.campos.find((c) => c.t === 'img');
  const campo = (c) => {
    const val = esc(r[c.k] ?? '');
    const ctl = c.t === 'area'
      ? `<textarea class="input" name="${c.k}">${val}</textarea>`
      : `<input class="input" name="${c.k}" type="${c.t === 'number' || c.t === 'date' ? c.t : 'text'}" ${c.t === 'number' ? 'min="0" step="0.01"' : ''} value="${val}" ${c.req ? 'required' : ''} />`;
    return `<label class="${c.full ? 'full' : ''}">${c.l}${ctl}</label>`;
  };
  $('#modal-root').innerHTML = `
    <div class="overlay" id="overlay">
      <form class="modal" id="form" role="dialog" aria-modal="true">
        <h2>${reg ? 'Editar' : 'Nuevo'} ${m.singular}</h2>
        <div class="grid">${m.campos.map(campo).join('')}</div>
        ${imgCampo ? `<div class="preview">${imgTag(r[imgCampo.k] || '', 'thumb')}<span>Vista previa de la imagen</span></div>` : ''}
        <div class="actions">
          <button type="button" class="btn ghost" id="cancelar">Cancelar</button>
          <button type="submit" class="btn primary">${reg ? 'Guardar cambios' : 'Crear'}</button>
        </div>
      </form>
    </div>`;
  const form = $('#form');
  form.querySelector('input')?.focus();
  if (imgCampo) form.elements[imgCampo.k].addEventListener('input', (e) => (form.querySelector('.preview img').src = e.target.value));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = { ...(reg || {}) };
    m.campos.forEach((c) => (obj[c.k] = c.t === 'number' ? Number(form.elements[c.k].value) : form.elements[c.k].value.trim()));
    await api.save(mod, obj);
    cerrarModal();
    rows = await api.list(mod);
    renderTabla();
    toast(reg ? 'Cambios guardados' : 'Registro creado');
  });
}
const cerrarModal = () => ($('#modal-root').innerHTML = '');

/* ---------- Eventos ---------- */
document.addEventListener('click', async (e) => {
  const t = e.target;
  if (t.id === 'nuevo') abrirModal();
  if (t.id === 'limpiar') { $('#buscar').value = ''; busqueda = ''; renderTabla(); }
  if (t.id === 'cancelar' || t.id === 'overlay') cerrarModal();
  if (t.dataset.editar) abrirModal(rows.find((r) => r.id === Number(t.dataset.editar)));
  if (t.dataset.borrar && confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) {
    await api.remove(mod, Number(t.dataset.borrar));
    rows = await api.list(mod);
    renderTabla();
    toast('Registro eliminado');
  }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'buscar') { busqueda = e.target.value; renderTabla(); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });

function ruta() {
  const k = location.hash.slice(1);
  mod = MODULOS[k] ? k : 'productos';
  renderNav();
  renderVista();
}
window.addEventListener('hashchange', ruta);
ruta();