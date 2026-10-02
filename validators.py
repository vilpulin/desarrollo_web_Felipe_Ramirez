"""
Validaciones del lado del servidor. Replican las reglas de validaciones.js
(Tarea 1): el navegador no es de fiar, así que todo se revisa de nuevo aquí.
"""
import os
import re
import uuid
from datetime import date, datetime

from werkzeug.utils import secure_filename

TIPOS_AVE = [
    "Rapaz", "Passeriforme (ave canora)", "Acuática / playera", "Marina",
    "Zancuda", "Trepadora", "Columbiforme (paloma/tórtola)", "Otro",
]
MAX_ARCHIVOS = 5
MAX_BYTES = 50 * 1024 * 1024
IMG_EXT = {"jpg", "jpeg", "png", "webp", "gif"}
VID_EXT = {"mp4", "mov", "webm"}

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$")
CEL_RE = re.compile(r"^(\+?56)?9\d{8}$")
RUT_RE = re.compile(r"^\d{7,8}-[0-9K]$")


def _texto(valor, minimo, maximo, etiqueta):
    n = len(valor.strip())
    if n < minimo:
        return f"{etiqueta} debe tener al menos {minimo} caracteres."
    if n > maximo:
        return f"{etiqueta} no puede superar {maximo} caracteres."
    return ""


def normalizar_run(valor):
    return valor.replace(".", "").replace(" ", "").upper()


def validar_run(valor):
    limpio = normalizar_run(valor)
    if not RUT_RE.match(limpio):
        return "Formato esperado: 12345678-9 (con guion y dígito verificador)."
    numero, dv = limpio.split("-")
    suma, mult = 0, 2
    for d in reversed(numero):
        suma += int(d) * mult
        mult = 2 if mult == 7 else mult + 1
    resto = 11 - (suma % 11)
    esperado = "0" if resto == 11 else "K" if resto == 10 else str(resto)
    return "" if esperado == dv else "El dígito verificador no corresponde al número de RUN ingresado."


def _hace_anos(hoy, anos):
    try:
        return hoy.replace(year=hoy.year - anos)
    except ValueError:  # 29 de febrero
        return hoy.replace(year=hoy.year - anos, day=28)


def _fecha(valor):
    try:
        return datetime.strptime(valor, "%Y-%m-%d").date()
    except ValueError:
        return None


def validar_voluntario(f, comuna_pertenece_a_region):
    """f: request.form. Retorna (errores, datos_limpios)."""
    e = {}
    nombres = f.get("nombres", "").strip()
    apellidos = f.get("apellidos", "").strip()
    run = f.get("run", "")
    nac = f.get("fecha-nacimiento", "").strip()
    email = f.get("email", "").strip()
    celular = re.sub(r"[\s-]", "", f.get("celular", ""))
    region = f.get("region", "").strip()
    comuna = f.get("comuna", "").strip()
    direccion = f.get("direccion", "").strip()
    experiencia = f.get("experiencia", "").strip()

    if m := _texto(nombres, 2, 60, "El nombre"): e["nombres"] = m
    if m := _texto(apellidos, 2, 60, "El apellido"): e["apellidos"] = m
    if m := validar_run(run): e["run"] = m

    nac_d = None
    if nac:
        nac_d = _fecha(nac)
        hoy = date.today()
        if nac_d is None:
            e["fecha-nacimiento"] = "Ingresa una fecha de nacimiento válida."
        elif nac_d > hoy:
            e["fecha-nacimiento"] = "La fecha de nacimiento no puede ser futura."
        else:
            edad = hoy.year - nac_d.year - ((hoy.month, hoy.day) < (nac_d.month, nac_d.day))
            if edad < 12:
                e["fecha-nacimiento"] = "Debes tener al menos 12 años para registrarte como voluntario(a)."
            elif edad > 110:
                e["fecha-nacimiento"] = "Revisa la fecha de nacimiento ingresada."

    if not EMAIL_RE.match(email) or len(email) > 80:
        e["email"] = "Ingresa un correo válido, por ejemplo nombre@dominio.cl (máx. 80 caracteres)."
    if not CEL_RE.match(celular):
        e["celular"] = "Ingresa un celular chileno válido, ej: +56 9 1234 5678"

    if not region.isdigit():
        e["region"] = "Selecciona tu región."
    if not comuna.isdigit():
        e["comuna"] = "Selecciona tu comuna."
    elif region.isdigit() and not comuna_pertenece_a_region(int(comuna), int(region)):
        e["comuna"] = "La comuna no corresponde a la región seleccionada."

    if direccion and (m := _texto(direccion, 5, 100, "La dirección")): e["direccion"] = m
    if len(experiencia) > 400: e["experiencia"] = "La experiencia no puede superar 400 caracteres."

    datos = dict(nombres=nombres, apellidos=apellidos, run=run, email=email,
                 celular=f.get("celular", ""), region=region, comuna=comuna,
                 direccion=direccion, experiencia=experiencia, nacimiento=nac)
    datos["_run"] = normalizar_run(run)
    datos["_celular"] = "+569" + celular[-8:] if CEL_RE.match(celular) else ""
    datos["_nac"] = nac_d
    return e, datos


def validar_avistamiento(f, files, buscar_voluntario, buscar_ave, comuna_pertenece_a_region):
    """Retorna (errores, datos, archivos_validos)."""
    e = {}
    email = f.get("email-voluntario", "").strip()
    tipo = f.get("tipo-ave", "").strip()
    nombre_ave = f.get("nombre-ave", "").strip()
    cantidad = f.get("cantidad", "").strip()
    region = f.get("region-avistamiento", "").strip()
    comuna = f.get("comuna-avistamiento", "").strip()
    lugar = f.get("lugar-especifico", "").strip()
    lat = f.get("latitud", "").strip().replace(",", ".")
    lon = f.get("longitud", "").strip().replace(",", ".")
    fecha = f.get("fecha", "").strip()
    hora = f.get("hora", "").strip()
    desc = f.get("descripcion", "").strip()

    voluntario = None
    if not EMAIL_RE.match(email):
        e["email-voluntario"] = "Ingresa un correo válido, por ejemplo nombre@dominio.cl"
    else:
        voluntario = buscar_voluntario(email)
        if voluntario is None:
            e["email-voluntario"] = "Ese correo no corresponde a un voluntario(a) registrado."

    if tipo not in TIPOS_AVE: e["tipo-ave"] = "Selecciona el tipo de ave."
    ave = None
    if m := _texto(nombre_ave, 2, 60, "El nombre del ave"):
        e["nombre-ave"] = m
    else:
        ave = buscar_ave(nombre_ave)
        if ave is None:
            e["nombre-ave"] = "Ese nombre no está en el listado de aves; elige una de las sugerencias."

    if not cantidad.isdigit() or int(cantidad) < 1:
        e["cantidad"] = "Ingresa un número entero de al menos 1 ejemplar."
    elif int(cantidad) > 5000:
        e["cantidad"] = "Esa cantidad parece muy alta; revisa el valor ingresado."

    if not region.isdigit(): e["region-avistamiento"] = "Selecciona la región del avistamiento."
    if not comuna.isdigit():
        e["comuna-avistamiento"] = "Selecciona la comuna del avistamiento."
    elif region.isdigit() and not comuna_pertenece_a_region(int(comuna), int(region)):
        e["comuna-avistamiento"] = "La comuna no corresponde a la región seleccionada."
    if m := _texto(lugar, 3, 120, "El lugar específico"): e["lugar-especifico"] = m

    def coord(valor, minimo, maximo, nombre):
        if valor == "":
            return None, ""
        try:
            n = float(valor)
        except ValueError:
            return None, "La coordenada debe ser un número."
        if not (minimo <= n <= maximo) or n != n:
            return None, f"La {nombre} debe estar dentro del territorio continental chileno ({minimo} a {maximo})."
        return round(n, 6), ""
    lat_v, m = coord(lat, -56, -17, "latitud")
    if m: e["latitud"] = m
    lon_v, m = coord(lon, -76, -66, "longitud")
    if m: e["longitud"] = m

    fecha_d = _fecha(fecha)
    hoy = date.today()
    if fecha_d is None:
        e["fecha"] = "Debes indicar la fecha del avistamiento."
    elif fecha_d > hoy:
        e["fecha"] = "La fecha del avistamiento no puede ser futura."
    elif fecha_d < _hace_anos(hoy, 5):
        e["fecha"] = "La fecha es demasiado antigua (máximo 5 años atrás)."
    fecha_hora = None
    try:
        h = datetime.strptime(hora, "%H:%M").time()
        if fecha_d and "fecha" not in e:
            fecha_hora = datetime.combine(fecha_d, h)
            if fecha_hora > datetime.now():
                e["hora"] = "La fecha y hora del avistamiento no pueden ser futuras."
    except ValueError:
        e["hora"] = "Indica la hora aproximada del avistamiento."

    if desc and (m := _texto(desc, 5, 500, "La descripción")): e["descripcion"] = m

    archivos = [a for a in files.getlist("archivo") if a and a.filename]
    if not archivos:
        e["archivo"] = "Debes adjuntar al menos una foto o video del avistamiento."
    elif len(archivos) > MAX_ARCHIVOS:
        e["archivo"] = f"Puedes adjuntar como máximo {MAX_ARCHIVOS} archivos."
    else:
        for a in archivos:
            msg = _validar_archivo(a)
            if msg:
                e["archivo"] = msg
                break

    datos = {"email-voluntario": email, "tipo-ave": tipo, "nombre-ave": nombre_ave,
             "cantidad": cantidad, "region-avistamiento": region,
             "comuna-avistamiento": comuna, "lugar-especifico": lugar,
             "latitud": lat, "longitud": lon, "fecha": fecha, "hora": hora,
             "descripcion": desc}
    datos.update(_voluntario=voluntario, _ave=ave, _fecha_hora=fecha_hora,
                 _lat=lat_v, _lon=lon_v)
    return e, datos, archivos


def extension(nombre):
    return nombre.rsplit(".", 1)[-1].lower() if "." in nombre else ""


def _validar_archivo(a):
    ext = extension(a.filename)
    if ext not in IMG_EXT | VID_EXT:
        return f"Formato no admitido en «{secure_filename(a.filename) or 'archivo'}». Usa foto (jpg, png, webp, gif) o video (mp4, mov, webm)."
    cab = a.stream.read(16)
    a.stream.seek(0, os.SEEK_END)
    tam = a.stream.tell()
    a.stream.seek(0)
    if tam == 0 or tam > MAX_BYTES:
        return "Cada archivo debe pesar entre 1 byte y 50 MB."
    if not _firma_ok(cab, ext):
        return f"«{secure_filename(a.filename) or 'archivo'}» no es realmente un archivo {ext}."
    return ""


def _firma_ok(cab, ext):
    """Revisa los primeros bytes: no basta con confiar en la extensión."""
    if ext in ("jpg", "jpeg"): return cab.startswith(b"\xff\xd8\xff")
    if ext == "png": return cab.startswith(b"\x89PNG\r\n\x1a\n")
    if ext == "gif": return cab[:6] in (b"GIF87a", b"GIF89a")
    if ext == "webp": return cab[:4] == b"RIFF" and cab[8:12] == b"WEBP"
    if ext in ("mp4", "mov"): return cab[4:8] == b"ftyp"
    if ext == "webm": return cab.startswith(b"\x1a\x45\xdf\xa3")
    return False


def nombre_unico(original):
    """uuid + nombre saneado: evita colisiones y rutas maliciosas (../)."""
    return f"{uuid.uuid4().hex}_{secure_filename(original) or 'archivo'}"


def es_video(nombre):
    return extension(nombre) in VID_EXT
