/**
 * comun.js
 * - Carga las comunas de una región desde Flask (/api/comunas/<id>) en cascada.
 * - Marca como inválidos los campos que el servidor devolvió con error.
 */
function cargarComunas(selectRegion, selectComuna, seleccionada) {
  selectComuna.innerHTML = "";
  const regionId = selectRegion.value;
  if (!regionId) {
    selectComuna.disabled = true;
    selectComuna.innerHTML = '<option value="">Primero selecciona una región</option>';
    return;
  }
  fetch("/api/comunas/" + encodeURIComponent(regionId))
    .then((r) => r.json())
    .then((lista) => {
      selectComuna.disabled = false;
      selectComuna.innerHTML = '<option value="">Selecciona una comuna</option>';
      lista.forEach((c) => {
        const opcion = document.createElement("option");
        opcion.value = c.id;
        opcion.textContent = c.nombre;
        if (String(c.id) === String(seleccionada)) opcion.selected = true;
        selectComuna.appendChild(opcion);
      });
    });
}

function enlazarRegionComuna(idRegion, idComuna) {
  const selectRegion = document.getElementById(idRegion);
  const selectComuna = document.getElementById(idComuna);
  selectRegion.addEventListener("change", () => cargarComunas(selectRegion, selectComuna, ""));
  if (selectRegion.value) {
    cargarComunas(selectRegion, selectComuna, selectComuna.dataset.seleccionada);
  }
}

function marcarErroresServidor(formulario) {
  formulario.querySelectorAll(".mensaje-error").forEach((p) => {
    if (p.textContent.trim() !== "") {
      const campo = document.getElementById(p.id.replace(/-error$/, ""));
      if (campo) campo.setAttribute("aria-invalid", "true");
    }
  });
}
