/**
 * registro.js
 * Llena el <select> de regiones desde REGIONES_COMUNAS, actualiza el
 * <select> de comunas en cascada, y valida el formulario completo al
 * enviarlo (sin depender del atributo "required").
 */
document.addEventListener("DOMContentLoaded", () => {
  const selectRegion = document.getElementById("region");
  const selectComuna = document.getElementById("comuna");
  const formulario = document.getElementById("form-registro");
  const aviso = document.getElementById("aviso-resultado");

  // Poblar regiones
  Object.keys(REGIONES_COMUNAS).forEach((region) => {
    const opcion = document.createElement("option");
    opcion.value = region;
    opcion.textContent = region;
    selectRegion.appendChild(opcion);
  });

  selectRegion.addEventListener("change", () => {
    const region = selectRegion.value;
    selectComuna.innerHTML = "";
    if (!region) {
      selectComuna.disabled = true;
      const vacio = document.createElement("option");
      vacio.value = "";
      vacio.textContent = "Primero selecciona una región";
      selectComuna.appendChild(vacio);
      return;
    }
    selectComuna.disabled = false;
    const vacio = document.createElement("option");
    vacio.value = "";
    vacio.textContent = "Selecciona una comuna";
    selectComuna.appendChild(vacio);
    REGIONES_COMUNAS[region].forEach((comuna) => {
      const opcion = document.createElement("option");
      opcion.value = comuna;
      opcion.textContent = comuna;
      selectComuna.appendChild(opcion);
    });
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
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

    if (esValido) {
      aviso.textContent = `¡Gracias, ${formulario.nombres.value.trim()}! Tu registro fue validado correctamente.`;
      aviso.classList.add("mostrar");
      formulario.reset();
      selectComuna.disabled = true;
      selectComuna.innerHTML = '<option value="">Primero selecciona una región</option>';
    } else {
      aviso.textContent = "Revisa los campos marcados en rojo antes de continuar.";
      aviso.classList.add("mostrar", "error");
    }
  });
});
