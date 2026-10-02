/**
 * avistamiento.js
 * Validación en el navegador del formulario de avistamiento (Tarea 1).
 * Si es válido se envía a Flask, que valida nuevamente y guarda en la BD.
 */
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-avistamiento");
  const aviso = document.getElementById("aviso-resultado");

  enlazarRegionComuna("region-avistamiento", "comuna-avistamiento");
  marcarErroresServidor(formulario);

  // Fecha máxima seleccionable: hoy (en hora local, no UTC)
  const hoy = new Date();
  const local = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000);
  document.getElementById("fecha").setAttribute("max", local.toISOString().slice(0, 10));

  formulario.addEventListener("submit", (evento) => {
    limpiarErrores(formulario);
    aviso.classList.remove("mostrar", "error");

    let esValido = true;
    const marcar = (idCampo, resultado) => {
      if (!resultado.valido) {
        mostrarError(idCampo, resultado.mensaje);
        esValido = false;
      }
    };

    marcar("email-voluntario", validarEmail(formulario["email-voluntario"].value));

    if (!formulario["tipo-ave"].value) {
      mostrarError("tipo-ave", "Selecciona el tipo de ave.");
      esValido = false;
    }
    marcar("nombre-ave", validarTexto(formulario["nombre-ave"].value, 2, 60, "El nombre del ave"));

    const cantidad = Number(formulario.cantidad.value);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      mostrarError("cantidad", "Ingresa un número entero de al menos 1 ejemplar.");
      esValido = false;
    } else if (cantidad > 5000) {
      mostrarError("cantidad", "Esa cantidad parece muy alta; revisa el valor ingresado.");
      esValido = false;
    }

    if (!formulario["region-avistamiento"].value) {
      mostrarError("region-avistamiento", "Selecciona la región del avistamiento.");
      esValido = false;
    }
    if (!formulario["comuna-avistamiento"].value) {
      mostrarError("comuna-avistamiento", "Selecciona la comuna del avistamiento.");
      esValido = false;
    }
    marcar("lugar-especifico", validarTexto(formulario["lugar-especifico"].value, 3, 120, "El lugar específico"));
    marcar("latitud", validarCoordenada(formulario.latitud.value, "lat"));
    marcar("longitud", validarCoordenada(formulario.longitud.value, "lon"));
    marcar("fecha", validarFechaAvistamiento(formulario.fecha.value, 5));
    if (!formulario.hora.value) {
      mostrarError("hora", "Indica la hora aproximada del avistamiento.");
      esValido = false;
    }
    marcar("archivo", validarArchivoMultimedia(formulario.archivo));
    if (formulario.descripcion.value.trim().length > 0) {
      marcar("descripcion", validarTexto(formulario.descripcion.value, 5, 500, "La descripción"));
    }

    if (!esValido) {
      evento.preventDefault();
      aviso.textContent = "Revisa los campos marcados en rojo antes de continuar.";
      aviso.classList.add("mostrar", "error");
    }
  });
});
