export interface VisitaMadresResponse {
    id:                   number;
    educacion_presencial: number;
    fecha_llamada:        Date;
    llamada:              string;
    asesoria:             number;
    donante_efectiva:     number;
    fecha_visita:         Date;
    observacion:          string;
    fecha_registro:       Date;
    infoMadre:            InfoMadre;
}

export interface InfoMadre {
    id:              number;
    nombre:          string;
    apellido:        string;
    documento:       string;
    fechaNacimiento: Date;
    fechaParto:      Date;
    telefono:        string;
    celular:         string;
    departamento:    string;
    ciudad:          string;
    barrio:          string;
    direccion:       string;
    profesion:       string;
    eps:             string;
}