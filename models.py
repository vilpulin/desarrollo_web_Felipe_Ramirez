import os
from sqlalchemy import (create_engine, Column, Integer, String, DateTime, Date, Text,
                        Numeric, ForeignKey)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, scoped_session

DB_URL = os.environ.get(
    "DATABASE_URL",
    "mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2?charset=utf8mb4",
)
engine = create_engine(DB_URL, pool_pre_ping=True)
Session = scoped_session(sessionmaker(bind=engine))
Base = declarative_base()


class Region(Base):
    __tablename__ = "region"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(200), nullable=False)
    comunas = relationship("Comuna", back_populates="region")


class Comuna(Base):
    __tablename__ = "comuna"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey("region.id"), nullable=False)
    region = relationship("Region", back_populates="comunas")


class Voluntario(Base):
    __tablename__ = "voluntario"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(80), nullable=False, unique=True)
    telefono = Column(String(15), nullable=False)
    run = Column(String(12), nullable=False, unique=True)
    fecha_nacimiento = Column(Date, nullable=True)
    direccion = Column(String(100), nullable=True)
    experiencia = Column(String(400), nullable=True)
    fecha_registro = Column(DateTime, nullable=False)
    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    comuna = relationship("Comuna")


class Ave(Base):
    __tablename__ = "ave"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(80), nullable=False)


class Avistamiento(Base):
    __tablename__ = "avistamiento"
    id = Column(Integer, primary_key=True)
    voluntario_id = Column(Integer, ForeignKey("voluntario.id"), nullable=False)
    ave_id = Column(Integer, ForeignKey("ave.id"), nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    lugar = Column(String(200), nullable=False)
    descripcion = Column(Text(500), nullable=True)
    tipo_ave = Column(String(40), nullable=False)
    cantidad = Column(Integer, nullable=False)
    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    latitud = Column(Numeric(9, 6), nullable=True)
    longitud = Column(Numeric(9, 6), nullable=True)
    comuna = relationship("Comuna")
    voluntario = relationship("Voluntario")
    ave = relationship("Ave")
    registros = relationship("Registro", back_populates="avistamiento")


class Registro(Base):
    __tablename__ = "registro"
    id = Column(Integer, primary_key=True)
    ruta_archivo = Column(String(300), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    avistamiento_id = Column(Integer, ForeignKey("avistamiento.id"), nullable=False)
    avistamiento = relationship("Avistamiento", back_populates="registros")
