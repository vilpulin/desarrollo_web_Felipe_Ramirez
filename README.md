# CC5002 — Tarea 1: Sistema de Avistamientos de Aves de Chile

Prototipo de interfaz (HTML5 + CSS3 + JavaScript) para el sistema de
avistamientos de aves de la Unión de Ornitólogos de Chile.

## Estructura de archivos

```
index.html             Portada y navegación general
registro.html          Registro de voluntario(a)
avistamiento.html      Formulario para informar un avistamiento
listado.html           Listado de avistamientos: filtro, orden y paginación
indicadores.html       Indicadores y gráficos
css/estilos.css        Hoja de estilos única, compartida por todas las páginas
js/validaciones.js     Funciones de validación reutilizables (RUT, email, celular,
                       fechas, archivo adjunto, coordenadas, textos)
js/datos-chile.js      Constantes: regiones/comunas de Chile, tipos de ave, aves
                       sugeridas para el <datalist>
js/avistamientos-mock.js  Datos de ejemplo (34 registros) usados por el listado y
                       los indicadores, ya que el prototipo no tiene backend
js/registro.js         Lógica específica del formulario de registro
js/avistamiento.js     Lógica específica del formulario de avistamiento
js/listado.js          Filtro, orden y paginación en el navegador
js/indicadores.js      Cálculo de KPIs y gráficos (Chart.js vía CDN)
```

## Decisiones de diseño e implementación

- **Sin backend ni almacenamiento**, tal como pide el enunciado: los formularios
  validan en el navegador y, al enviarse correctamente, solo muestran un mensaje de
  confirmación (`aviso-resultado`). El listado y los indicadores usan datos de ejemplo
  constantes (`AVISTAMIENTOS_MOCK`) en vez de datos reales, para poder mostrar cómo
  se vería la interfaz con información cargada.

- **HTML semántico**: se usan `<header>`, `<nav>`, `<main>`, `<footer>`, `<fieldset>`/
  `<legend>` para agrupar campos relacionados de un formulario, y `<table>` con
  `<caption>`/`<th scope="col">` para el listado, evitando `<div>` salvo cuando no
  existe una etiqueta semántica más adecuada (por ejemplo, como contenedor de layout
  puro en la grilla de tarjetas).

- **Obligatorio vs. opcional**: todo campo obligatorio usa `required` **y además** se
  valida explícitamente en JavaScript (el enunciado indica que `required` por sí solo
  no cuenta como validación). Los campos opcionales llevan la palabra "(opcional)" en
  su etiqueta mediante la clase `.opcional`, y si se completan igual se valida su
  formato (por ejemplo, la dirección o la descripción).

- **Reglas de validación implementadas en `validaciones.js`**:
  - RUT/RUN chileno: formato `12345678-9` y verificación real del dígito verificador
    (módulo 11), no solo una expresión regular.
  - Correo electrónico: formato general `usuario@dominio.tld`.
  - Celular: acepta `+56 9 XXXXXXXX` y variantes con espacios/guiones.
  - Fecha de nacimiento: no puede ser futura y exige una edad mínima (12 años) para
    registrarse como voluntario(a).
  - Fecha de avistamiento: no puede ser futura **ni** anterior a 5 años (regla propia,
    pensada para mantener la base de datos enfocada en cambios recientes de
    población, que es justamente la preocupación de la Unión de Ornitólogos).
  - Archivo adjunto: en `avistamiento.html` es obligatorio adjuntar una foto o video;
    se valida que exista un archivo, que su extensión sea una de las admitidas
    (imagen o video) y que no supere 50 MB.
  - Coordenadas (opcionales): si se ingresan, deben ser numéricas y quedar dentro de
    rangos geográficos razonables para el territorio continental de Chile.

- **Región y comuna en cascada**: `js/datos-chile.js` contiene todas las regiones de
  Chile con sus comunas. El `<select>` de comuna se deshabilita y se repuebla cada vez
  que cambia la región, tanto en el registro de voluntario como en el formulario de
  avistamiento.

- **Listado (`listado.html` / `listado.js`)**: permite filtrar por tipo de ave, por
  región y por texto libre (nombre de ave, lugar o comuna); permite ordenar por fecha
  (ascendente/descendente), lugar, nombre de ave o cantidad de ejemplares, tanto desde
  el `<select>` "Ordenar por" como haciendo clic en los encabezados de columna; y pagina
  los resultados de a 8 filas, con botones "Anterior/Siguiente" y números de página.

- **Indicadores (`indicadores.html` / `indicadores.js`)**: se muestran 5 KPIs (voluntarios
  registrados, avistamientos, especies distintas, voluntarios con al menos un reporte,
  ejemplares observados) y 4 gráficos (por tipo de ave, por región, evolución semanal y
  voluntarios más activos), construidos con la librería [Chart.js](https://www.chartjs.org/)
  cargada desde CDN.

- **Diseño visual**: la identidad se inspira en un cuaderno de campo de ornitólogo
  (fondo tipo papel con líneas suaves, verde bosque como color de marca, acento cálido
  tipo sello de cuaderno) para que el sistema se sienta propio del contexto de
  observación de aves y no una plantilla genérica. Tipografía `Fraunces` (serif, para
  títulos) + `Work Sans` (sans-serif, para texto), cargadas desde Google Fonts.

- **Accesibilidad básica**: foco visible (`:focus-visible`), asociación de errores a su
  campo mediante `aria-invalid` y `role="alert"`, `<caption>` y `scope="col"` en la
  tabla, y textos alternativos (`aria-label`) en los gráficos.

- **Validación W3C**: se verificó localmente el HTML5 y CSS3 de todas las páginas con
  el mismo motor que usa el validador oficial (Nu Html Checker / validator.w3.org y
  jigsaw.w3.org), sin errores reportados al momento de la entrega.

## Puntos pendientes de decisión que se comentarán en la entrevista

- Cómo se traduciría la "identificación por correo" del formulario de avistamiento a
  un inicio de sesión real en una siguiente iteración del sistema.
- Qué pasaría con archivos adjuntos muy grandes en un backend real (compresión,
  límites de almacenamiento, procesamiento asíncrono).
