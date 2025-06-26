export interface ExamenesLaboratorioData {
  fechaRegistroLab: Date | null;
  vdrl: string;
  fechaVencimientoVdrl: Date | null;
  hbsag: string;
  fechaVencimientoHbsag: Date | null;
  hiv: string;
  fechaVencimientoHiv: Date | null;
  hemoglobina: string;
  hematocrito: string;
  transfusiones: number | null;
  enfermedadesGestacion: string;
  fuma: number | null;
  alcohol: number | null;
}
