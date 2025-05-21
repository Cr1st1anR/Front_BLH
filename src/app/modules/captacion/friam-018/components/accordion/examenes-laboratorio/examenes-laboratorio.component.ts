import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import type { ExamenesLaboratorioData } from '../interfaces/examenes-laboratorio.interface';

@Component({
  selector: 'examenes-laboratorio',
  imports: [
    FormsModule,
    AccordionModule,
    InputTextModule,
    DatePickerModule,
    RadioButton,
  ],
  templateUrl: './examenes-laboratorio.component.html',
  styleUrl: './examenes-laboratorio.component.scss',
})
export class ExamenesLaboratorioComponent implements ExamenesLaboratorioData {
  fechaRegistroLab: Date | null = null;
  vdrl: string = '';
  fechaVencimientoVdrl: Date | null = null;
  hbsag: string = '';
  fechaVencimientoHbsag: Date | null = null;
  hiv: string = '';
  fechaVencimientoHiv: Date | null = null;
  hemoglobina: string = '';
  hematocrito: string = '';
  transfusiones: string = '';
  enfermedadesGestacion: string = '';
  fuma: string = '';
  alcohol: string = '';
}
