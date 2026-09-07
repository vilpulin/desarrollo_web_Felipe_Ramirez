/**
 * indicadores.js
 * Calcula indicadores simples a partir de AVISTAMIENTOS_MOCK y los grafica
 * con Chart.js (cargado desde CDN). Estos datos son solo de ejemplo.
 */
document.addEventListener("DOMContentLoaded", () => {
  // En el prototipo no existe un registro real de voluntarios, así que se usa
  // un total de referencia mayor a quienes ya reportaron un avistamiento.
  const TOTAL_VOLUNTARIOS_REGISTRADOS = 42;

  const datos = AVISTAMIENTOS_MOCK;
  const voluntariosActivos = new Set(datos.map((d) => d.voluntario));
  const totalEjemplares = datos.reduce((suma, d) => suma + d.cantidad, 0);
  const especiesDistintas = new Set(datos.map((d) => d.ave));

  // -------- KPIs --------
  const kpis = [
    { valor: TOTAL_VOLUNTARIOS_REGISTRADOS, etiqueta: "Voluntarios(as) registrados(as)" },
    { valor: datos.length, etiqueta: "Avistamientos registrados" },
    { valor: especiesDistintas.size, etiqueta: "Especies distintas reportadas" },
    { valor: voluntariosActivos.size, etiqueta: "Voluntarios(as) con al menos un reporte" },
    { valor: totalEjemplares, etiqueta: "Ejemplares observados en total" }
  ];

  const contenedorKpi = document.getElementById("grilla-kpi");
  kpis.forEach((kpi) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-kpi";
    tarjeta.innerHTML = `<span class="valor-kpi">${kpi.valor}</span><span class="etiqueta-kpi">${kpi.etiqueta}</span>`;
    contenedorKpi.appendChild(tarjeta);
  });

  // Paleta consistente con la identidad visual del sitio
  const colorMusgo = "#2F5233";
  const colorBarro = "#A8763E";
  const colorCielo = "#3E6E8E";
  const colorTinta = "#1F2E23";

  Chart.defaults.font.family = "'Work Sans', sans-serif";
  Chart.defaults.color = colorTinta;

  // -------- Gráfico 1: avistamientos por tipo de ave --------
  const conteoPorTipo = {};
  datos.forEach((d) => { conteoPorTipo[d.tipo] = (conteoPorTipo[d.tipo] || 0) + 1; });

  new Chart(document.getElementById("grafico-tipos"), {
    type: "bar",
    data: {
      labels: Object.keys(conteoPorTipo),
      datasets: [{
        label: "Avistamientos",
        data: Object.values(conteoPorTipo),
        backgroundColor: colorMusgo
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });

  // -------- Gráfico 2: avistamientos por región --------
  const conteoPorRegion = {};
  datos.forEach((d) => { conteoPorRegion[d.region] = (conteoPorRegion[d.region] || 0) + 1; });
  const regionesOrdenadas = Object.entries(conteoPorRegion).sort((a, b) => b[1] - a[1]);

  new Chart(document.getElementById("grafico-regiones"), {
    type: "bar",
    data: {
      labels: regionesOrdenadas.map((r) => r[0]),
      datasets: [{
        label: "Avistamientos",
        data: regionesOrdenadas.map((r) => r[1]),
        backgroundColor: colorBarro
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });

  // -------- Gráfico 3: evolución semanal --------
  function obtenerClaveSemana(fechaISO) {
    const fecha = new Date(fechaISO + "T00:00:00");
    const inicioAno = new Date(fecha.getFullYear(), 0, 1);
    const numeroSemana = Math.ceil((((fecha - inicioAno) / 86400000) + inicioAno.getDay() + 1) / 7);
    return `Sem. ${numeroSemana}`;
  }
  const conteoPorSemana = {};
  datos.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach((d) => {
    const clave = obtenerClaveSemana(d.fecha);
    conteoPorSemana[clave] = (conteoPorSemana[clave] || 0) + 1;
  });

  new Chart(document.getElementById("grafico-tiempo"), {
    type: "line",
    data: {
      labels: Object.keys(conteoPorSemana),
      datasets: [{
        label: "Avistamientos por semana",
        data: Object.values(conteoPorSemana),
        borderColor: colorCielo,
        backgroundColor: "rgba(62,110,142,0.15)",
        tension: 0.25,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });

  // -------- Gráfico 4: voluntarios más activos --------
  const conteoPorVoluntario = {};
  datos.forEach((d) => { conteoPorVoluntario[d.voluntario] = (conteoPorVoluntario[d.voluntario] || 0) + 1; });
  const voluntariosOrdenados = Object.entries(conteoPorVoluntario).sort((a, b) => b[1] - a[1]);

  new Chart(document.getElementById("grafico-voluntarios"), {
    type: "bar",
    data: {
      labels: voluntariosOrdenados.map((v) => v[0].split("@")[0]),
      datasets: [{
        label: "Avistamientos reportados",
        data: voluntariosOrdenados.map((v) => v[1]),
        backgroundColor: colorMusgo
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
});
