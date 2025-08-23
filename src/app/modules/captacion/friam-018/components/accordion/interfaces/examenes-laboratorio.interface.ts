export interface ExamenesLaboratorioData {
  fechaRegistroLab: Date | null;
  vdrl: number | null;
  fechaVencimientoVdrl: Date | null;
  hbsag: number | null;
  fechaVencimientoHbsag: Date | null;
  hiv: number | null;
  fechaVencimientoHiv: Date | null;
  hemoglobina: number | null;
  hematocrito: number | null;
  transfusiones: number | null;
  enfermedadesGestacion: string | null;
  fuma: number | null;
  alcohol: number | null;
}
