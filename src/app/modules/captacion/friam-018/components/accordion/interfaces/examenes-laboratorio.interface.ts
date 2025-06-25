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
  transfusiones: number;
  enfermedadesGestacion: string;
  fuma: number;
  alcohol: number;
}
