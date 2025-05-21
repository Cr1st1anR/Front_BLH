import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import type { HistoriaGestacionData } from '../interfaces/historia-gestacion.interface';

@Component({
  selector: 'historia-gestacion',
  imports: [
    FormsModule,
    AccordionModule,
    InputTextModule,
    DatePickerModule,
    RadioButton,
  ],
  templateUrl: './historia-gestacion.component.html',
  styleUrl: './historia-gestacion.component.scss',
})
export class HistoriaGestacionComponent implements HistoriaGestacionData{
  lugarControlPrenatal: string = '';
  tipoIPS: string = '';
  asistioControl: string = '';
  pesoInicial: string = '';
  pesoFinal: string = '';
  talla: string = '';
  tipoParto: string = '';
  semanasGestacion: number = 0;
  fechaParto: Date | undefined;
}
