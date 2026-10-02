/**
 * registro.js
 * Validación en el navegador (la misma de la Tarea 1). Si todo es válido el
 * formulario se envía a Flask, que vuelve a validar en el servidor.
 */
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-registro");
  const aviso = document.getElementById("aviso-resultado");

  enlazarRegionComuna("region", "comuna");
  marcarErroresServidor(formulario);

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

    marcar("nombres", validarTexto(formulario.nombres.value, 2, 60, "El nombre"));
    marcar("apellidos", validarTexto(formulario.apellidos.value, 2, 60, "El apellido"));
    marcar("run", validarRUT(formulario.run.value));
    marcar("fecha-nacimiento", validarFechaNacimiento(formulario["fecha-nacimiento"].value, 12));
    marcar("email", validarEmail(formulario.email.value));
    marcar("celular", validarCelular(formulario.celular.value));

    if (!formulario.region.value) {
      mostrarError("region", "Selecciona tu región.");
      esValido = false;
    }
    if (!formulario.comuna.value) {
      mostrarError("comuna", "Selecciona tu comuna.");
      esValido = false;
    }
    if (formulario.direccion.value.trim().length > 0) {
      marcar("direccion", validarTexto(formulario.direccion.value, 5, 100, "La dirección"));
    }

    if (!esValido) {
      evento.preventDefault();
      aviso.textContent = "Revisa los campos marcados en rojo antes de continuar.";
      aviso.classList.add("mostrar", "error");
    }
  });
});
