# CC5002 — Tarea 3: Avistamientos de Aves de Chile (Flask + SQLAlchemy + MySQL)

Continuación de la Tarea 1: se conserva el diseño, los formularios, las validaciones en JavaScript
(`static/js/validaciones.js`) y el listado con filtros/orden/paginación; ahora los datos viajan a Flask
y se guardan en MySQL.

## Puesta en marcha
```bash
pip install -r requirements.txt
mysql -u root -p < sql/tarea2.sql                  # esquema (modificado, ver abajo) y usuario cc5002
mysql -u root -p tarea2 < sql/region-comuna.sql
mysql -u root -p tarea2 < sql/aves.sql
mysql -u root -p tarea2 < sql/tabla-comentario.sql   # NUEVO en Tarea 3: tabla comentario
python app.py                                      # http://127.0.0.1:5000
```
Credenciales: localhost:3306, base `tarea2`, usuario `cc5002`, clave `programacionweb`
(sobrescribibles con `DATABASE_URL`; la clave de sesión con `SECRET_KEY`).

## Rutas
| Ruta | Función |
|---|---|
| `/` | Portada: bienvenida, menú y resumen de los 2 últimos avistamientos |
| `/registro` (GET/POST) | Formulario de voluntario; POST valida en servidor e inserta en `voluntario` |
| `/avistamiento` (GET/POST) | Formulario de avistamiento; POST valida e inserta en `avistamiento` + `registro` |
| `/avistamientos` | Listado paginado (8 por página) con filtros por tipo/región/texto y orden |
| `/avistamientos/<id>` | Detalle con fotos y videos leídos desde la BD |
| `/indicadores` | **Estadísticas**: 3 gráficos generados en el navegador + enlace «Volver a la portada» |
| `/api/estadisticas/avistamientos-por-dia` | JSON para el gráfico de líneas |
| `/api/estadisticas/avistamientos-por-tipo` | JSON para el gráfico de torta |
| `/api/estadisticas/voluntarios-por-comuna` | JSON para el gráfico de barras |
| `/api/avistamientos/<id>/comentarios` (GET/POST) | Lista / agrega comentarios (JSON, usados con `fetch`) |

## Ajustes al modelo de datos (permitidos por el enunciado)
La Tarea 1 pedía más datos que el modelo base, por lo que `sql/tarea2.sql` agrega:
- `voluntario`: `run` (único), `fecha_nacimiento`, `direccion`, `experiencia`; `email` también es único.
  `nombre` guarda «nombres apellidos» y `telefono` se normaliza a `+569XXXXXXXX`.
- `avistamiento`: `tipo_ave`, `cantidad`, `comuna_id` (FK a `comuna`), `latitud`, `longitud`.
  `fecha_hora` combina la fecha y la hora del formulario.

## Decisiones
- **Identificación por correo** (como en la Tarea 1): el avistamiento se asocia al voluntario cuyo correo
  se ingresa; si no existe, se muestra error. Tras registrarse, el correo queda precargado (cookie de sesión
  firmada, no por URL, para no exponer datos).
- **Nombre del ave**: se sigue usando `<datalist>`, ahora alimentado desde la tabla `ave`; el servidor exige que
  el nombre exista en ella (la FK `ave_id` es obligatoria). Cambio respecto de la Tarea 1, donde era texto libre.
- **Doble validación**: las mismas reglas de `validaciones.js` están en `validators.py` (RUN con módulo 11, correo,
  celular, edad mínima 12, fecha de avistamiento no futura ni > 5 años, coordenadas dentro de Chile, etc.).
  Si el servidor detecta errores, vuelve a mostrar el formulario con los datos ingresados y los mensajes (HTTP 400).
  También verifica que la comuna pertenezca a la región y que RUN/correo no estén repetidos.
- **Entradas maliciosas**: Jinja con autoescape (XSS); consultas parametrizadas de SQLAlchemy (SQL injection);
  búsqueda con `autoescape` de `%`/`_`; parámetros de URL tipados y saneados (`pagina`, `orden`, `tipo`, `region`);
  los ids de `<select>` se comprueban contra la BD.
- **Archivos**: hasta 5 por avistamiento (foto: jpg/png/webp/gif, video: mp4/mov/webm), 50 MB c/u. Se valida
  extensión y firma binaria real, se renombran como `uuid_nombre-saneado` y se guardan en `static/uploads/`.
  En `registro`: `ruta_archivo` = `uploads`, `nombre_archivo` = nombre guardado; una fila por archivo.
- **Transacción**: avistamiento y registros se insertan juntos; si algo falla, rollback y se borran los
  archivos ya escritos.
- **Listado**: filtros, búsqueda, orden y paginación ahora se hacen en SQL (parámetros GET), y los enlaces de
  página/encabezado conservan los filtros. Al abrir un detalle, «Volver al listado» regresa a la misma página y filtros.
- `fecha_registro` = `datetime.now()` al insertar el voluntario.
- Sin implementar (fuera de alcance): protección CSRF y autenticación real (pendiente ya anunciado en la Tarea 1).

---
## Tarea 3

### Estadísticas (`/indicadores`)
- Los datos salen de la BD con consultas agregadas (`GROUP BY`) en tres URLs JSON de Flask; el navegador las pide con
  `fetch` y dibuja los gráficos (`static/js/estadisticas.js`).
- **Biblioteca de gráficos: [Chart.js](https://www.chartjs.org/) 4.4.4** (licencia MIT, ya usada en la Tarea 1). Se incluye
  una copia local en `static/js/vendor/` (con su licencia), así que no depende de un CDN.
- **Líneas — avistamientos por día:** se cuenta por la *fecha del avistamiento* (`fecha_hora`), pues la tabla no guarda
  la fecha en que se ingresó el registro. Los días sin avistamientos entre el primero y el último se muestran con 0
  para no distorsionar la línea.
- **Torta — por tipo de ave:** `avistamiento.tipo_ave`.
- **Barras — voluntarios por comuna:** solo aparecen comunas con al menos un voluntario registrado.
- Si no hay datos, cada gráfico muestra «Aún no hay datos para mostrar»; si falla la petición, un mensaje de error.

### Comentarios (detalle del avistamiento)
- Tabla `comentario` creada con `sql/tabla-comentario.sql` (sin modificarla); modelo `Comentario` en `models.py`.
- **Formulario:** nombre (3–50 caracteres) y texto (textarea `rows=3 cols=40`, mínimo 5 caracteres), botón «Agregar comentario».
  Se valida en el navegador (`comentarios.js`, reutilizando `validaciones.js`) y de nuevo en el servidor (`validar_comentario`).
- **Asíncrono:** el envío (`POST` JSON) y el listado (`GET` JSON) usan `fetch`; la página no se recarga. Si el servidor
  rechaza los datos (HTTP 400), el formulario sigue visible con los mensajes de error bajo cada campo; si todo sale bien se
  limpia el formulario y se refresca la lista (más reciente primero, con fecha, nombre y texto).
- **Límite superior del texto = 300**, porque así está definida la columna `comentario.texto` (VARCHAR(300)); el enunciado solo fija el mínimo.
- **Seguridad:** el contenido se inserta en el DOM con `textContent` (no `innerHTML`) y la BD usa consultas parametrizadas,
  de modo que `<script>…` se muestra como texto. El servidor revisa los tipos recibidos (un JSON con listas u objetos se rechaza).
- `fecha` se guarda con `datetime.now()` del servidor al insertar.
- Sin implementar (fuera de alcance): protección CSRF, límite de frecuencia (anti-spam) y autenticación de comentaristas.
