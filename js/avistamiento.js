/**
 * avistamiento.js
 * Puebla selects (tipo de ave, región/comuna, datalist de aves sugeridas)
 * y valida el formulario de reporte de avistamiento.
 */
document.addEventListener("DOMContentLoaded", () => {
  const selectTipo = document.getElementById("tipo-ave");
  const selectRegion = document.getElementById("region-avistamiento");
  const selectComuna = document.getElementById("comuna-avistamiento");
  const listaAves = document.getElementById("lista-aves");
  const formulario = document.getElementById("form-avistamiento");
  const aviso = document.getElementById("aviso-resultado");

  TIPOS_AVE.forEach((tipo) => {
    const opcion = document.createElement("option");
    opcion.value = tipo;
    opcion.textContent = tipo;
    selectTipo.appendChild(opcion);
  });

  AVES_SUGERIDAS.forEach((nombre) => {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    listaAves.appendChild(opcion);
  });

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
      selectComuna.innerHTML = '<option value="">Primero selecciona una región</option>';
      return;
    }
    selectComuna.disabled = false;
    selectComuna.innerHTML = '<option value="">Selecciona una comuna</option>';
    REGIONES_COMUNAS[region].forEach((comuna) => {
      const opcion = document.createElement("option");
      opcion.value = comuna;
      opcion.textContent = comuna;
      selectComuna.appendChild(opcion);
    });
  });

  // Por defecto, la fecha máxima seleccionable en el widget nativo es hoy.
  document.getElementById("fecha").setAttribute("max", new Date().toISOString().slice(0, 10));

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

    if (esValido) {
      aviso.textContent = `Avistamiento de "${formulario["nombre-ave"].value.trim()}" registrado correctamente.`;
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
