/**
 * listado.js
 * Filtra, ordena y pagina AVISTAMIENTOS_MOCK en el navegador (sin backend).
 */
document.addEventListener("DOMContentLoaded", () => {
  const REGISTROS_POR_PAGINA = 8;

  const selectTipo = document.getElementById("filtro-tipo");
  const selectRegion = document.getElementById("filtro-region");
  const inputBusqueda = document.getElementById("filtro-busqueda");
  const selectOrden = document.getElementById("orden");
  const botonLimpiar = document.getElementById("boton-limpiar-filtros");
  const cuerpoTabla = document.getElementById("cuerpo-tabla");
  const paginacion = document.getElementById("paginacion");
  const resumen = document.getElementById("resumen-resultados");

  let paginaActual = 1;

  // Poblar filtros
  TIPOS_AVE.forEach((tipo) => {
    const opcion = document.createElement("option");
    opcion.value = tipo;
    opcion.textContent = tipo;
    selectTipo.appendChild(opcion);
  });
  Object.keys(REGIONES_COMUNAS).forEach((region) => {
    const opcion = document.createElement("option");
    opcion.value = region;
    opcion.textContent = region;
    selectRegion.appendChild(opcion);
  });

  function obtenerDatosFiltrados() {
    const tipo = selectTipo.value;
    const region = selectRegion.value;
    const busqueda = inputBusqueda.value.trim().toLowerCase();

    let datos = AVISTAMIENTOS_MOCK.filter((registro) => {
      const coincideTipo = !tipo || registro.tipo === tipo;
      const coincideRegion = !region || registro.region === region;
      const coincideBusqueda = !busqueda ||
        registro.ave.toLowerCase().includes(busqueda) ||
        registro.lugar.toLowerCase().includes(busqueda) ||
        registro.comuna.toLowerCase().includes(busqueda);
      return coincideTipo && coincideRegion && coincideBusqueda;
    });

    const criterio = selectOrden.value;
    datos = datos.slice().sort((a, b) => {
      switch (criterio) {
        case "fecha-asc":
          return `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`);
        case "fecha-desc":
          return `${b.fecha}T${b.hora}`.localeCompare(`${a.fecha}T${a.hora}`);
        case "lugar-asc":
          return a.lugar.localeCompare(b.lugar, "es");
        case "ave-asc":
          return a.ave.localeCompare(b.ave, "es");
        case "cantidad-desc":
          return b.cantidad - a.cantidad;
        default:
          return 0;
      }
    });

    return datos;
  }

  function formatearFecha(fecha, hora) {
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}-${mes}-${anio} · ${hora}`;
  }

  function renderizar() {
    const datos = obtenerDatosFiltrados();
    const totalPaginas = Math.max(1, Math.ceil(datos.length / REGISTROS_POR_PAGINA));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;

    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    const pagina = datos.slice(inicio, inicio + REGISTROS_POR_PAGINA);

    cuerpoTabla.innerHTML = "";
    if (pagina.length === 0) {
      const fila = document.createElement("tr");
      fila.innerHTML = `<td colspan="5">No se encontraron avistamientos con los filtros seleccionados.</td>`;
      cuerpoTabla.appendChild(fila);
    }

    pagina.forEach((registro) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${registro.ave}</td>
        <td><span class="etiqueta-tipo">${registro.tipo}</span></td>
        <td>${registro.lugar}<br><small>${registro.comuna}, ${registro.region}</small></td>
        <td>${formatearFecha(registro.fecha, registro.hora)}</td>
        <td>${registro.cantidad}</td>
      `;
      cuerpoTabla.appendChild(fila);
    });

    resumen.textContent = `Mostrando ${pagina.length} de ${datos.length} avistamiento(s) — página ${paginaActual} de ${totalPaginas}.`;

    renderizarPaginacion(totalPaginas);
  }

  function renderizarPaginacion(totalPaginas) {
    paginacion.innerHTML = "";

    const crearBoton = (etiqueta, pagina, deshabilitado, actual) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.textContent = etiqueta;
      if (deshabilitado) boton.disabled = true;
      if (actual) boton.setAttribute("aria-current", "page");
      boton.addEventListener("click", () => {
        paginaActual = pagina;
        renderizar();
      });
      return boton;
    };

    paginacion.appendChild(crearBoton("‹ Anterior", paginaActual - 1, paginaActual === 1, false));

    for (let i = 1; i <= totalPaginas; i++) {
      paginacion.appendChild(crearBoton(String(i), i, false, i === paginaActual));
    }

    paginacion.appendChild(crearBoton("Siguiente ›", paginaActual + 1, paginaActual === totalPaginas, false));
  }

  [selectTipo, selectRegion, selectOrden].forEach((el) =>
    el.addEventListener("change", () => { paginaActual = 1; renderizar(); })
  );
  inputBusqueda.addEventListener("input", () => { paginaActual = 1; renderizar(); });

  botonLimpiar.addEventListener("click", () => {
    selectTipo.value = "";
    selectRegion.value = "";
    inputBusqueda.value = "";
    selectOrden.value = "fecha-desc";
    paginaActual = 1;
    renderizar();
  });

  document.querySelectorAll("th button[data-orden]").forEach((boton) => {
    boton.addEventListener("click", () => {
      selectOrden.value = boton.dataset.orden;
      paginaActual = 1;
      renderizar();
    });
  });

  renderizar();
});
