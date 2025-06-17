import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RadioButton } from 'primeng/radiobutton';

@Component({
  selector: 'descripcion-situacion',
  imports: [FormsModule, AccordionModule, RadioButton],
  templateUrl: './descripcion-situacion.component.html',
  styleUrl: './descripcion-situacion.component.scss',
})
export class DescripcionSituacionComponent {
  espacioAdecuado: string = '';
  libreVectores: string = '';
  libreContaminantes: string = '';
  espacioLimpio: string = '';
  lavamanos: string = '';
  refrigeracion: string = '';

  excedenteLeche: string = '';
  higieneDonante: string = '';
  saludDonante: string = '';
  saludHijo: string = '';
  examenesNegativos: string = '';
  tatuajes: string = '';
  transfusiones: string = '';
  medicamento: string = '';
  psicoactivos: string = '';
  recolectores: string = '';
}
