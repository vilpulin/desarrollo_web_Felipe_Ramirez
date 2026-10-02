# CC5002 — Tarea 2: Avistamientos de Aves de Chile (Flask + SQLAlchemy + MySQL)

Continuación de la Tarea 1: se conserva el diseño, los formularios, las validaciones en JavaScript
(`static/js/validaciones.js`) y el listado con filtros/orden/paginación; ahora los datos viajan a Flask
y se guardan en MySQL.

## Puesta en marcha
```bash
pip install -r requirements.txt
mysql -u root -p < sql/tarea2.sql                  # esquema (modificado, ver abajo) y usuario cc5002
mysql -u root -p tarea2 < sql/region-comuna.sql
mysql -u root -p tarea2 < sql/aves.sql
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
| `/indicadores` | Marcador de posición (las estadísticas son de la siguiente tarea) |

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
