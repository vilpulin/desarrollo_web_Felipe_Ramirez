/**
 * comentarios.js
 * - Carga el listado de comentarios de un avistamiento con fetch (GET JSON).
 * - Valida el formulario en el navegador y lo envía con fetch (POST JSON).
 * El contenido se inserta con textContent (nunca innerHTML): evita XSS.
 */
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-comentario");
  const contenedor = document.getElementById("lista-comentarios");
  const aviso = document.getElementById("aviso-comentario");
  const urlApi = formulario.getAttribute("action");

  function mostrarAviso(mensaje, esError) {
    aviso.textContent = mensaje;
    aviso.classList.add("mostrar");
    aviso.classList.toggle("error", esError);
  }

  function crearItem(c) {
    const item = document.createElement("article");
    item.className = "comentario";
    const cabecera = document.createElement("p");
    cabecera.className = "comentario__cabecera";
    const autor = document.createElement("strong");
    autor.textContent = c.nombre;
    const fecha = document.createElement("span");
    fecha.textContent = " · " + c.fecha;
    cabecera.appendChild(autor);
    cabecera.appendChild(fecha);
    const texto = document.createElement("p");
    texto.className = "comentario__texto";
    texto.textContent = c.texto;
    item.appendChild(cabecera);
    item.appendChild(texto);
    return item;
  }

  function dibujar(lista) {
    contenedor.replaceChildren();
    if (lista.length === 0) {
      const vacio = document.createElement("p");
      vacio.id = "estado-comentarios";
      vacio.textContent = "Aún no hay comentarios. ¡Sé el primero en comentar!";
      contenedor.appendChild(vacio);
      return;
    }
    lista.forEach((c) => contenedor.appendChild(crearItem(c)));
  }

  function cargar() {
    return fetch(contenedor.dataset.url, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(dibujar)
      .catch(() => {
        contenedor.replaceChildren();
        const err = document.createElement("p");
        err.className = "mensaje-error";
        err.textContent = "No se pudieron cargar los comentarios. Intenta recargar la página.";
        contenedor.appendChild(err);
      });
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    limpiarErrores(formulario);
    aviso.classList.remove("mostrar", "error");

    let esValido = true;
    const nombre = formulario.nombre.value;
    const texto = formulario.texto.value;
    const rNombre = validarTexto(nombre, 3, 50, "El nombre");
    if (!rNombre.valido) { mostrarError("comentario-nombre", rNombre.mensaje); esValido = false; }
    const rTexto = validarTexto(texto, 5, 300, "El comentario");
    if (!rTexto.valido) { mostrarError("comentario-texto", rTexto.mensaje); esValido = false; }
    if (!esValido) {
      mostrarAviso("Revisa los campos marcados antes de continuar.", true);
      return;
    }

    const boton = formulario.querySelector("button[type=submit]");
    boton.disabled = true;
    fetch(urlApi, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), texto: texto.trim() }),
    })
      .then((r) => r.json().then((datos) => ({ ok: r.ok, datos })))
      .then(({ ok, datos }) => {
        if (ok) {
          formulario.reset();
          mostrarAviso("¡Comentario agregado correctamente!", false);
          return cargar();
        }
        // El servidor rechazó los datos: mantenemos el formulario con sus mensajes
        const errores = datos.errores || {};
        if (errores.nombre) mostrarError("comentario-nombre", errores.nombre);
        if (errores.texto) mostrarError("comentario-texto", errores.texto);
        mostrarAviso(datos.error || "Revisa los campos marcados antes de continuar.", true);
      })
      .catch(() => mostrarAviso("No se pudo enviar el comentario. Intenta nuevamente.", true))
      .finally(() => { boton.disabled = false; });
  });

  cargar();
});
