import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RadioButton } from 'primeng/radiobutton';
import type { DescripcionSituacionData } from '../interfaces/descripcion-situacion.interface';

@Component({
  selector: 'descripcion-situacion',
  imports: [FormsModule, AccordionModule, RadioButton],
  templateUrl: './descripcion-situacion.component.html',
  styleUrl: './descripcion-situacion.component.scss',
})
export class DescripcionSituacionComponent implements DescripcionSituacionData {
  espacioAdecuado: number | null = null;
  libreVectores: number | null = null;
  libreContaminantes: number | null = null;
  espacioLimpio: number | null = null;
  lavamanos: number | null = null;
  refrigeracion: number | null = null;

  excedenteLeche: number | null = null;
  higieneDonante: number | null = null;
  saludDonante: number | null = null;
  saludHijo: number | null = null;
  examenesNegativos: number | null = null;
  tatuajes: number | null = null;
  transfusiones: number | null = null;
  medicamento: number | null = null;
  psicoactivos: number | null = null;
  recolectores: number | null = null;

  getFormData() {
    return {
      espacioAdecuado: this.espacioAdecuado,
      libreVectores: this.libreVectores,
      libreContaminantes: this.libreContaminantes,
      espacioLimpio: this.espacioLimpio,
      lavamanos: this.lavamanos,
      refrigeracion: this.refrigeracion,

      excedenteLeche: this.excedenteLeche,
      higieneDonante: this.higieneDonante,
      saludDonante: this.saludDonante,
      saludHijo: this.saludHijo,
      examenesNegativos: this.examenesNegativos,
      tatuajes: this.tatuajes,
      transfusiones: this.transfusiones,
      medicamento: this.medicamento,
      psicoactivos: this.psicoactivos,
      recolectores: this.recolectores,
    };
  }
}
