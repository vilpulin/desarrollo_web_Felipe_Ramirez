import os
from datetime import datetime

from flask import (Flask, render_template, request, redirect, url_for, flash,
                   jsonify, abort, session)
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from models import (Session, Region, Comuna, Voluntario, Ave, Avistamiento,
                    Registro)
import validators as v

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-cambiar-en-produccion")
app.config["MAX_CONTENT_LENGTH"] = (v.MAX_ARCHIVOS * v.MAX_BYTES) + 1024 * 1024
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_REL = "uploads"  # carpeta dentro de /static
UPLOAD_DIR = os.path.join(BASE_DIR, "static", UPLOAD_REL)
POR_PAGINA = 8
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.jinja_env.globals["es_video"] = v.es_video
app.jinja_env.globals["TIPOS_AVE"] = v.TIPOS_AVE


@app.teardown_appcontext
def cerrar_sesion(exc=None):
    Session.remove()


def fecha_fmt(dt):
    return dt.strftime("%d-%m-%Y · %H:%M")


app.jinja_env.filters["fecha"] = fecha_fmt


def comuna_en_region(comuna_id, region_id):
    c = Session().get(Comuna, comuna_id)
    return c is not None and c.region_id == region_id


def regiones():
    return Session().scalars(select(Region).order_by(Region.id)).all()


# ---------------------------------------------------------------- Portada
@app.route("/")
def index():
    ultimos = Session().scalars(
        select(Avistamiento)
        .options(joinedload(Avistamiento.ave), joinedload(Avistamiento.comuna)
                 .joinedload(Comuna.region))
        .order_by(Avistamiento.id.desc()).limit(2)).unique().all()
    return render_template("index.html", ultimos=ultimos)


@app.route("/indicadores")
def indicadores():
    return render_template("indicadores.html")


# ------------------------------------------------------------- Voluntario
@app.route("/api/comunas/<int:region_id>")
def api_comunas(region_id):
    cs = Session().scalars(select(Comuna).where(Comuna.region_id == region_id)
                           .order_by(Comuna.nombre)).all()
    return jsonify([{"id": c.id, "nombre": c.nombre.strip()} for c in cs])


@app.route("/registro")
def registro():
    return render_template("registro.html", regiones=regiones(), errores={}, datos={})


@app.route("/registro", methods=["POST"])
def guardar_voluntario():
    s = Session()
    errores, d = v.validar_voluntario(request.form, comuna_en_region)
    if not errores:
        if s.scalar(select(Voluntario.id).where(func.lower(Voluntario.email) == d["email"].lower())):
            errores["email"] = "Ya existe un voluntario(a) registrado con este correo."
        if s.scalar(select(Voluntario.id).where(Voluntario.run == d["_run"])):
            errores["run"] = "Ya existe un voluntario(a) registrado con este RUN."
    if errores:
        return render_template("registro.html", regiones=regiones(),
                               errores=errores, datos=d), 400
    vol = Voluntario(nombre=f"{d['nombres']} {d['apellidos']}", run=d["_run"],
                     fecha_nacimiento=d["_nac"], email=d["email"],
                     telefono=d["_celular"], comuna_id=int(d["comuna"]),
                     direccion=d["direccion"] or None,
                     experiencia=d["experiencia"] or None,
                     fecha_registro=datetime.now())
    try:
        s.add(vol)
        s.commit()
    except IntegrityError:
        s.rollback()
        errores["email"] = "Ya existe un voluntario(a) con ese correo o RUN."
        return render_template("registro.html", regiones=regiones(),
                               errores=errores, datos=d), 400
    except Exception:
        s.rollback()
        flash("Ocurrió un error al guardar tu registro. Intenta nuevamente.", "error")
        return redirect(url_for("registro"))
    session["email_voluntario"] = vol.email  # para precargar el formulario siguiente
    return render_template("registro_ok.html", nombre=d["nombres"])


# ------------------------------------------------------------ Avistamiento
def _form_avistamiento(errores, datos, status=200):
    s = Session()
    aves = s.scalars(select(Ave.nombre).order_by(Ave.nombre)).all()
    return render_template("avistamiento.html", regiones=regiones(), aves=aves,
                           errores=errores, datos=datos), status


@app.route("/avistamiento")
def nuevo_avistamiento():
    return _form_avistamiento({}, {"email-voluntario": session.get("email_voluntario", ""),
                                   "cantidad": "1"})


@app.route("/avistamiento", methods=["POST"])
def guardar_avistamiento():
    s = Session()
    errores, d, archivos = v.validar_avistamiento(
        request.form, request.files,
        lambda em: s.scalar(select(Voluntario).where(func.lower(Voluntario.email) == em.lower())),
        lambda nom: s.scalar(select(Ave).where(func.lower(Ave.nombre) == nom.lower())),
        comuna_en_region)
    if errores:
        return _form_avistamiento(errores, d, 400)

    guardados = []
    try:
        av = Avistamiento(voluntario_id=d["_voluntario"].id, ave_id=d["_ave"].id,
                          tipo_ave=d["tipo-ave"], cantidad=int(d["cantidad"]),
                          comuna_id=int(d["comuna-avistamiento"]),
                          lugar=d["lugar-especifico"], latitud=d["_lat"],
                          longitud=d["_lon"], fecha_hora=d["_fecha_hora"],
                          descripcion=d["descripcion"] or None)
        s.add(av)
        s.flush()
        for f in archivos:
            nombre = v.nombre_unico(f.filename)
            f.save(os.path.join(UPLOAD_DIR, nombre))
            guardados.append(nombre)
            s.add(Registro(ruta_archivo=UPLOAD_REL, nombre_archivo=nombre,
                           avistamiento_id=av.id))
        s.commit()
    except Exception:
        s.rollback()
        for nombre in guardados:  # sin archivos huérfanos si falla la BD
            try:
                os.remove(os.path.join(UPLOAD_DIR, nombre))
            except OSError:
                pass
        flash("Ocurrió un error al guardar el avistamiento. Intenta nuevamente.", "error")
        return redirect(url_for("nuevo_avistamiento"))
    flash(f"Avistamiento de «{d['_ave'].nombre}» registrado correctamente. ¡Gracias!", "ok")
    return redirect(url_for("index"))


# ---------------------------------------------------------- Listado/detalle
ORDENES = {
    "fecha-desc": [Avistamiento.fecha_hora.desc()],
    "fecha-asc": [Avistamiento.fecha_hora.asc()],
    "lugar-asc": [Avistamiento.lugar.asc()],
    "ave-asc": [Ave.nombre.asc()],
    "cantidad-desc": [Avistamiento.cantidad.desc()],
}


@app.route("/avistamientos")
def listado():
    s = Session()
    tipo = request.args.get("tipo", "")
    if tipo not in v.TIPOS_AVE:
        tipo = ""
    region = request.args.get("region", "")
    region = int(region) if region.isdigit() else None
    busqueda = request.args.get("busqueda", "").strip()[:80]
    orden = request.args.get("orden", "fecha-desc")
    if orden not in ORDENES:
        orden = "fecha-desc"

    base = (select(Avistamiento).join(Ave).join(Comuna, Avistamiento.comuna_id == Comuna.id))
    if tipo:
        base = base.where(Avistamiento.tipo_ave == tipo)
    if region:
        base = base.where(Comuna.region_id == region)
    if busqueda:
        base = base.where(Ave.nombre.icontains(busqueda, autoescape=True)
                          | Avistamiento.lugar.icontains(busqueda, autoescape=True)
                          | Comuna.nombre.icontains(busqueda, autoescape=True))

    total = s.scalar(select(func.count()).select_from(base.subquery()))
    paginas = max(1, -(-total // POR_PAGINA))
    try:
        pagina = int(request.args.get("pagina", 1))
    except ValueError:
        pagina = 1
    pagina = min(max(pagina, 1), paginas)

    filas = s.scalars(
        base.options(joinedload(Avistamiento.ave),
                     joinedload(Avistamiento.comuna).joinedload(Comuna.region))
        .order_by(*ORDENES[orden], Avistamiento.id.desc())
        .limit(POR_PAGINA).offset((pagina - 1) * POR_PAGINA)).unique().all()

    filtros = {k: val for k, val in (("tipo", tipo), ("region", region or ""),
               ("busqueda", busqueda), ("orden", orden if orden != "fecha-desc" else "")) if val}
    return render_template("listado.html", filas=filas, pagina=pagina,
                           paginas=paginas, total=total, regiones=regiones(),
                           f_tipo=tipo, f_region=region, f_busqueda=busqueda,
                           f_orden=orden, filtros=filtros)


@app.route("/avistamientos/<int:av_id>")
def detalle(av_id):
    av = Session().scalars(
        select(Avistamiento).where(Avistamiento.id == av_id)
        .options(joinedload(Avistamiento.ave), joinedload(Avistamiento.voluntario),
                 joinedload(Avistamiento.comuna).joinedload(Comuna.region),
                 joinedload(Avistamiento.registros))).unique().first()
    if av is None:
        abort(404)
    # conserva filtros/página del listado para el botón "Volver"
    volver = {k: request.args[k] for k in ("tipo", "region", "busqueda", "orden", "pagina")
              if request.args.get(k)}
    return render_template("detalle.html", av=av, volver=volver)


@app.errorhandler(404)
def no_encontrado(e):
    return render_template("404.html"), 404


@app.errorhandler(413)
def demasiado_grande(e):
    flash("Los archivos enviados superan el tamaño máximo permitido (50 MB por archivo).", "error")
    return redirect(url_for("nuevo_avistamiento"))


if __name__ == "__main__":
    app.run(debug=True)
