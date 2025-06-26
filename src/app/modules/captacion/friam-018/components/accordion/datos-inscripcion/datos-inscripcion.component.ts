import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import type { DatosInscripcionData } from '../interfaces/datos-inscripcion.interface';

@Component({
  selector: 'datos-inscripcion',
  imports: [
    FormsModule,
    AccordionModule,
    InputTextModule,
    DatePickerModule,
    RadioButton,
  ],
  templateUrl: './datos-inscripcion.component.html',
  styleUrl: './datos-inscripcion.component.scss',
})
export class DatosInscripcionComponent implements DatosInscripcionData {
  nombre: string = '';
  donanteExclusiva: number | null = null;
  recoleccionDomicilio: number | null = null;
  donante_EoI: string = '';
  fechaDiligenciamiento: Date | undefined;
  fechaNacimiento: Date | undefined;

  getFormData() {
    return {
      nombre: this.nombre,
      donanteExclusiva: this.donanteExclusiva,
      recoleccionDomicilio: this.recoleccionDomicilio,
      donante_EoI: this.donante_EoI,
      fechaDiligenciamiento: this.fechaDiligenciamiento,
      fechaNacimiento: this.fechaNacimiento,
    };
  }
}
