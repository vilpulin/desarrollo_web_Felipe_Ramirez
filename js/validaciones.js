/**
 * validaciones.js
 * Reglas de validación en JavaScript exigidas por el enunciado (el atributo
 * "required" del formulario NO cuenta como regla de validación). Cada
 * función retorna: { valido: boolean, mensaje: string }.
 */

/** Valida formato y dígito verificador de un RUN/RUT chileno (ej: 12.345.678-5) */
function validarRUT(valor) {
  const limpio = valor.replace(/\./g, "").replace(/\s/g, "").toUpperCase();
  const patron = /^\d{7,8}-[0-9K]$/;
  if (!patron.test(limpio)) {
    return { valido: false, mensaje: "Formato esperado: 12345678-9 (con guion y dígito verificador)." };
  }
  const [numero, dv] = limpio.split("-");
  let suma = 0;
  let multiplo = 2;
  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  if (dvEsperado !== dv) {
    return { valido: false, mensaje: "El dígito verificador no corresponde al número de RUN ingresado." };
  }
  return { valido: true, mensaje: "" };
}

/** Valida formato general de un correo electrónico */
function validarEmail(valor) {
  const patron = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!patron.test(valor)) {
    return { valido: false, mensaje: "Ingresa un correo válido, por ejemplo nombre@dominio.cl" };
  }
  return { valido: true, mensaje: "" };
}

/** Valida celular chileno: acepta +56 9 XXXXXXXX, 9XXXXXXXX o con espacios/guiones */
function validarCelular(valor) {
  const limpio = valor.replace(/[\s-]/g, "");
  const patron = /^(\+?56)?9\d{8}$/;
  if (!patron.test(limpio)) {
    return { valido: false, mensaje: "Ingresa un celular chileno válido, ej: +56 9 1234 5678" };
  }
  return { valido: true, mensaje: "" };
}

/** Valida que una fecha (yyyy-mm-dd) no sea futura ni anterior a un mínimo de años atrás */
function validarFechaAvistamiento(valorFecha, anosMaximoAtras = 5) {
  if (!valorFecha) {
    return { valido: false, mensaje: "Debes indicar la fecha del avistamiento." };
  }
  const fecha = new Date(valorFecha + "T00:00:00");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha.getTime() > hoy.getTime()) {
    return { valido: false, mensaje: "La fecha del avistamiento no puede ser futura." };
  }
  const limiteAtras = new Date();
  limiteAtras.setFullYear(limiteAtras.getFullYear() - anosMaximoAtras);
  limiteAtras.setHours(0, 0, 0, 0);
  if (fecha.getTime() < limiteAtras.getTime()) {
    return { valido: false, mensaje: `La fecha es demasiado antigua (máximo ${anosMaximoAtras} años atrás). Si el dato es correcto, contacta a la coordinación.` };
  }
  return { valido: true, mensaje: "" };
}

/** Valida que una fecha de nacimiento corresponda a una persona mayor de una edad mínima */
function validarFechaNacimiento(valorFecha, edadMinima = 12) {
  if (!valorFecha) {
    return { valido: true, mensaje: "" }; // campo opcional
  }
  const fecha = new Date(valorFecha + "T00:00:00");
  const hoy = new Date();
  if (fecha.getTime() > hoy.getTime()) {
    return { valido: false, mensaje: "La fecha de nacimiento no puede ser futura." };
  }
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const noHaCumplido = (hoy.getMonth() < fecha.getMonth()) ||
    (hoy.getMonth() === fecha.getMonth() && hoy.getDate() < fecha.getDate());
  if (noHaCumplido) edad--;
  if (edad < edadMinima) {
    return { valido: false, mensaje: `Debes tener al menos ${edadMinima} años para registrarte como voluntario(a).` };
  }
  if (edad > 110) {
    return { valido: false, mensaje: "Revisa la fecha de nacimiento ingresada." };
  }
  return { valido: true, mensaje: "" };
}

/** Valida que se haya adjuntado un archivo de foto o video, y que su extensión sea válida */
function validarArchivoMultimedia(fileInput) {
  if (!fileInput.files || fileInput.files.length === 0) {
    return { valido: false, mensaje: "Debes adjuntar al menos una foto o video del avistamiento." };
  }
  const archivo = fileInput.files[0];
  const extensionesValidas = ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "webm"];
  const extension = archivo.name.split(".").pop().toLowerCase();
  if (!extensionesValidas.includes(extension)) {
    return { valido: false, mensaje: "Formato no admitido. Usa foto (jpg, png, webp, gif) o video (mp4, mov, webm)." };
  }
  const maxMB = 50;
  if (archivo.size > maxMB * 1024 * 1024) {
    return { valido: false, mensaje: `El archivo supera el tamaño máximo permitido (${maxMB} MB).` };
  }
  return { valido: true, mensaje: "" };
}

/** Valida un texto obligatorio con largo mínimo/máximo */
function validarTexto(valor, minimo = 2, maximo = 80, etiqueta = "Este campo") {
  const limpio = valor.trim();
  if (limpio.length < minimo) {
    return { valido: false, mensaje: `${etiqueta} debe tener al menos ${minimo} caracteres.` };
  }
  if (limpio.length > maximo) {
    return { valido: false, mensaje: `${etiqueta} no puede superar ${maximo} caracteres.` };
  }
  return { valido: true, mensaje: "" };
}

/** Valida coordenadas geográficas opcionales (latitud/longitud dentro de Chile aprox.) */
function validarCoordenada(valor, tipo) {
  if (valor === "" || valor === null) return { valido: true, mensaje: "" }; // opcional
  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return { valido: false, mensaje: "La coordenada debe ser un número." };
  }
  if (tipo === "lat" && (numero < -56 || numero > -17)) {
    return { valido: false, mensaje: "La latitud debe estar dentro del territorio continental chileno (-56 a -17)." };
  }
  if (tipo === "lon" && (numero < -76 || numero > -66)) {
    return { valido: false, mensaje: "La longitud debe estar dentro del territorio continental chileno (-76 a -66)." };
  }
  return { valido: true, mensaje: "" };
}

/**
 * Muestra un mensaje de error bajo un campo específico.
 * Requiere que exista un elemento con id = `${idCampo}-error`.
 */
function mostrarError(idCampo, mensaje) {
  const campo = document.getElementById(idCampo);
  const error = document.getElementById(`${idCampo}-error`);
  if (error) error.textContent = mensaje;
  if (campo) campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
}

/** Limpia todos los mensajes de error de un formulario */
function limpiarErrores(formulario) {
  formulario.querySelectorAll(".mensaje-error").forEach((el) => (el.textContent = ""));
  formulario.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
}
