export interface MadreDonante {
  id: number;
  donanteExclusivo: number;
  tipoDonante: string; // CAMBIO: era tipoDonanteApta
  recoleccionDomicilio: number;
  capacitado: string;
  reciboEducacionEn?: string; // Hacer opcional
  donanteApta: number;
  firmaDonanteApta?: string; // Hacer opcional
  firmaProfesional?: string; // Hacer opcional
  fechaDiligenciamiento?: string; // Hacer opcional
  activo: number;
  madrePotencial: MadrePotencial;
}

export interface MadrePotencial {
  id: number;
  idMadrePotencial: number;
  infoMadre: InfoMadre;
}

export interface InfoMadre {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  celular: string;
  direccion: string;
}

export interface MadreTabla {
  id_seguimiento: number;
  codigo_donante: string;
  nombres: string;
  apellidos: string;
  donante: string;
  fecha_visita: string | null;
}
