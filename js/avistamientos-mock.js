/**
 * avistamientos-mock.js
 * Datos de ejemplo para poblar el listado y los indicadores del prototipo.
 * En una versión real estos datos vendrían de un servidor; aquí son
 * constantes para poder mostrar la interfaz sin necesidad de backend.
 */
const AVISTAMIENTOS_MOCK = [
  { id: 1, ave: "Cóndor andino", tipo: "Rapaz", region: "Coquimbo", comuna: "Vicuña", lugar: "Valle del Elqui, mirador Cochiguaz", fecha: "2026-08-12", hora: "10:15", cantidad: 2, voluntario: "camila.rojas@correo.cl" },
  { id: 2, ave: "Chercán", tipo: "Passeriforme (ave canora)", region: "Metropolitana de Santiago", comuna: "Peñalolén", lugar: "Parque Mahuida", fecha: "2026-08-20", hora: "08:40", cantidad: 4, voluntario: "diego.paez@correo.cl" },
  { id: 3, ave: "Cisne de cuello negro", tipo: "Acuática / playera", region: "Los Ríos", comuna: "Valdivia", lugar: "Santuario Carlos Anwandter", fecha: "2026-07-30", hora: "17:05", cantidad: 36, voluntario: "florencia.saez@correo.cl" },
  { id: 4, ave: "Pelícano", tipo: "Marina", region: "Valparaíso", comuna: "Viña del Mar", lugar: "Caleta Portales", fecha: "2026-08-05", hora: "09:00", cantidad: 12, voluntario: "matias.leiva@correo.cl" },
  { id: 5, ave: "Garza grande", tipo: "Zancuda", region: "Maule", comuna: "San Clemente", lugar: "Ribera río Claro", fecha: "2026-08-18", hora: "07:30", cantidad: 3, voluntario: "camila.rojas@correo.cl" },
  { id: 6, ave: "Picaflor gigante", tipo: "Otro", region: "Coquimbo", comuna: "La Serena", lugar: "Jardín botánico", fecha: "2026-08-22", hora: "12:10", cantidad: 1, voluntario: "ignacio.fuentes@correo.cl" },
  { id: 7, ave: "Tiuque", tipo: "Rapaz", region: "La Araucanía", comuna: "Villarrica", lugar: "Borde camino rural", fecha: "2026-08-02", hora: "16:20", cantidad: 5, voluntario: "diego.paez@correo.cl" },
  { id: 8, ave: "Rayadito", tipo: "Passeriforme (ave canora)", region: "Los Lagos", comuna: "Puerto Varas", lugar: "Sendero Parque Vicente Pérez Rosales", fecha: "2026-07-25", hora: "11:00", cantidad: 6, voluntario: "florencia.saez@correo.cl" },
  { id: 9, ave: "Tagua común", tipo: "Acuática / playera", region: "Ñuble", comuna: "San Carlos", lugar: "Laguna Avendaño", fecha: "2026-08-14", hora: "18:45", cantidad: 9, voluntario: "matias.leiva@correo.cl" },
  { id: 10, ave: "Pilpilén", tipo: "Zancuda", region: "Biobío", comuna: "Concepción", lugar: "Desembocadura río Andalién", fecha: "2026-08-09", hora: "08:00", cantidad: 7, voluntario: "camila.rojas@correo.cl" },
  { id: 11, ave: "Gaviota dominicana", tipo: "Marina", region: "Antofagasta", comuna: "Antofagasta", lugar: "Balneario Municipal", fecha: "2026-07-28", hora: "10:50", cantidad: 15, voluntario: "ignacio.fuentes@correo.cl" },
  { id: 12, ave: "Cachaña", tipo: "Otro", region: "Los Ríos", comuna: "Panguipulli", lugar: "Bosque nativo cercano al lago", fecha: "2026-08-16", hora: "15:30", cantidad: 8, voluntario: "diego.paez@correo.cl" },
  { id: 13, ave: "Perdiz chilena", tipo: "Otro", region: "Libertador General Bernardo O'Higgins", comuna: "Rengo", lugar: "Predio agrícola", fecha: "2026-08-01", hora: "07:00", cantidad: 3, voluntario: "florencia.saez@correo.cl" },
  { id: 14, ave: "Loica", tipo: "Passeriforme (ave canora)", region: "Ñuble", comuna: "Chillán", lugar: "Campo abierto sector rural", fecha: "2026-07-19", hora: "09:20", cantidad: 2, voluntario: "matias.leiva@correo.cl" },
  { id: 15, ave: "Huairavo", tipo: "Zancuda", region: "Metropolitana de Santiago", comuna: "Maipú", lugar: "Humedal Los Batros", fecha: "2026-08-11", hora: "19:10", cantidad: 4, voluntario: "camila.rojas@correo.cl" },
  { id: 16, ave: "Yeco", tipo: "Marina", region: "Valparaíso", comuna: "Valparaíso", lugar: "Muelle Barón", fecha: "2026-08-06", hora: "08:15", cantidad: 6, voluntario: "ignacio.fuentes@correo.cl" },
  { id: 17, ave: "Queltehue", tipo: "Zancuda", region: "Coquimbo", comuna: "Ovalle", lugar: "Ribera embalse La Paloma", fecha: "2026-08-19", hora: "17:40", cantidad: 10, voluntario: "diego.paez@correo.cl" },
  { id: 18, ave: "Aguilucho común", tipo: "Rapaz", region: "La Araucanía", comuna: "Temuco", lugar: "Cerro Ñielol", fecha: "2026-08-03", hora: "13:00", cantidad: 1, voluntario: "florencia.saez@correo.cl" },
  { id: 19, ave: "Chincol", tipo: "Passeriforme (ave canora)", region: "Coquimbo", comuna: "Coquimbo", lugar: "Plaza de armas", fecha: "2026-07-22", hora: "08:05", cantidad: 5, voluntario: "matias.leiva@correo.cl" },
  { id: 20, ave: "Playero de Baird", tipo: "Acuática / playera", region: "Magallanes y de la Antártica Chilena", comuna: "Punta Arenas", lugar: "Costanera del estrecho", fecha: "2026-08-15", hora: "11:35", cantidad: 20, voluntario: "camila.rojas@correo.cl" },
  { id: 21, ave: "Carpintero negro", tipo: "Trepadora", region: "Los Lagos", comuna: "Ancud", lugar: "Parque Nacional Chiloé", fecha: "2026-08-08", hora: "10:00", cantidad: 2, voluntario: "ignacio.fuentes@correo.cl" },
  { id: 22, ave: "Codorniz", tipo: "Otro", region: "Maule", comuna: "Curicó", lugar: "Camino rural sector Los Niches", fecha: "2026-07-27", hora: "07:45", cantidad: 6, voluntario: "diego.paez@correo.cl" },
  { id: 23, ave: "Tenca", tipo: "Passeriforme (ave canora)", region: "Valparaíso", comuna: "Quillota", lugar: "Huerto familiar", fecha: "2026-08-21", hora: "09:50", cantidad: 3, voluntario: "florencia.saez@correo.cl" },
  { id: 24, ave: "Zorzal", tipo: "Passeriforme (ave canora)", region: "Metropolitana de Santiago", comuna: "La Reina", lugar: "Parque Padre Hurtado", fecha: "2026-08-13", hora: "08:25", cantidad: 4, voluntario: "matias.leiva@correo.cl" },
  { id: 25, ave: "Pato jergón grande", tipo: "Acuática / playera", region: "Biobío", comuna: "San Pedro de la Paz", lugar: "Laguna Grande", fecha: "2026-07-31", hora: "16:00", cantidad: 14, voluntario: "camila.rojas@correo.cl" },
  { id: 26, ave: "Choroy", tipo: "Otro", region: "La Araucanía", comuna: "Pucón", lugar: "Sendero Parque Nacional Villarrica", fecha: "2026-08-17", hora: "12:40", cantidad: 9, voluntario: "ignacio.fuentes@correo.cl" },
  { id: 27, ave: "Cernícalo", tipo: "Rapaz", region: "Coquimbo", comuna: "Illapel", lugar: "Cerros cercanos al pueblo", fecha: "2026-08-04", hora: "14:20", cantidad: 1, voluntario: "diego.paez@correo.cl" },
  { id: 28, ave: "Garza chica", tipo: "Zancuda", region: "Los Ríos", comuna: "Río Bueno", lugar: "Orilla río Bueno", fecha: "2026-08-10", hora: "18:00", cantidad: 5, voluntario: "florencia.saez@correo.cl" },
  { id: 29, ave: "Diuca común", tipo: "Passeriforme (ave canora)", region: "Ñuble", comuna: "Bulnes", lugar: "Sitio eriazo urbano", fecha: "2026-07-24", hora: "08:55", cantidad: 3, voluntario: "matias.leiva@correo.cl" },
  { id: 30, ave: "Pato cuchara", tipo: "Acuática / playera", region: "Metropolitana de Santiago", comuna: "Pudahuel", lugar: "Humedal El Yali (visita norte)", fecha: "2026-08-07", hora: "07:10", cantidad: 11, voluntario: "camila.rojas@correo.cl" },
  { id: 31, ave: "Fío-fío", tipo: "Passeriforme (ave canora)", region: "Los Lagos", comuna: "Frutillar", lugar: "Bosque costero", fecha: "2026-08-23", hora: "09:30", cantidad: 2, voluntario: "ignacio.fuentes@correo.cl" },
  { id: 32, ave: "Comesebo grande", tipo: "Passeriforme (ave canora)", region: "Valparaíso", comuna: "Casablanca", lugar: "Viñedo sector alto", fecha: "2026-07-21", hora: "10:40", cantidad: 4, voluntario: "diego.paez@correo.cl" },
  { id: 33, ave: "Peuco", tipo: "Rapaz", region: "Maule", comuna: "Talca", lugar: "Zona agrícola periurbana", fecha: "2026-08-24", hora: "13:15", cantidad: 1, voluntario: "florencia.saez@correo.cl" },
  { id: 34, ave: "Chirihue", tipo: "Passeriforme (ave canora)", region: "Biobío", comuna: "Los Ángeles", lugar: "Plaza central", fecha: "2026-07-26", hora: "08:20", cantidad: 6, voluntario: "matias.leiva@correo.cl" }
];
