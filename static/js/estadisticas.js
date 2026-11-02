/**
 * estadisticas.js
 * Pide los datos a Flask con fetch (JSON desde la base de datos) y dibuja los
 * gráficos en el navegador con Chart.js:
 *   1) líneas: avistamientos por día   2) torta: por tipo de ave
 *   3) barras: voluntarios por comuna
 */
document.addEventListener("DOMContentLoaded", () => {
  const raiz = document.getElementById("grafico-contenedor");
  const COLORES = ["#FFFFFF", "#FFD941", "#00b7ff", "#329c46", "#FFA52C", "#86007D", "#0000F9", "#1A1000"];

  // Estilo coherente con la paleta de la Tarea 1 (texto blanco sobre fondo ámbar)
  Chart.defaults.color = "#FFFFFF";
  Chart.defaults.borderColor = "rgba(255,255,255,0.35)";
  Chart.defaults.font.family = "ui-monospace, Consolas, 'Liberation Mono', monospace";

  function pedir(url, idEstado, dibujar) {
    const estado = document.getElementById(idEstado);
    fetch(url, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((datos) => {
        if (!datos.labels.length) {
          estado.textContent = "Aún no hay datos para mostrar.";
          return;
        }
        estado.hidden = true;
        dibujar(datos);
      })
      .catch(() => { estado.textContent = "No se pudieron cargar los datos del gráfico."; });
  }

  const enteros = { beginAtZero: true, ticks: { precision: 0 } };

  pedir(raiz.dataset.urlDia, "estado-dia", (d) => {
    new Chart(document.getElementById("grafico-dia"), {
      type: "line",
      data: { labels: d.labels, datasets: [{
        label: "Avistamientos", data: d.valores, borderColor: "#FFD941",
        backgroundColor: "#FFD941", tension: 0, pointRadius: 3 }] },
      options: { responsive: true, maintainAspectRatio: false,
        scales: { x: { title: { display: true, text: "Día" } },
                  y: { ...enteros, title: { display: true, text: "Cantidad de avistamientos" } } },
        plugins: { legend: { display: false } } },
    });
  });

  pedir(raiz.dataset.urlTipo, "estado-tipo", (d) => {
    new Chart(document.getElementById("grafico-tipo"), {
      type: "pie",
      data: { labels: d.labels, datasets: [{ data: d.valores,
        backgroundColor: COLORES, borderColor: "#AD6400", borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { color: "#FFFFFF" } } } },
    });
  });

  pedir(raiz.dataset.urlComuna, "estado-comuna", (d) => {
    new Chart(document.getElementById("grafico-comuna"), {
      type: "bar",
      data: { labels: d.labels, datasets: [{ label: "Voluntarios", data: d.valores,
        backgroundColor: "#FFFFFF" }] },
      options: { responsive: true, maintainAspectRatio: false,
        scales: { x: { title: { display: true, text: "Comuna" } },
                  y: { ...enteros, title: { display: true, text: "Voluntarios registrados" } } },
        plugins: { legend: { display: false } } },
    });
  });
});
