import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import type { DatosInscripcionData } from '../interfaces/datos-inscripcion.interface';
import { RegistroDonanteData } from '../../posibles-donantes-table/interfaces/registro-donante.interface';

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
export class DatosInscripcionComponent implements DatosInscripcionData, OnChanges {

  @Input() datosPrecargados: RegistroDonanteData = {} as RegistroDonanteData;

  nombre: string = '';
  donanteExclusiva: number | null = null;
  recoleccionDomicilio: number | null = null;
  donante_EoI: string = '';
  fechaDiligenciamiento: Date | undefined;
  fechaNacimiento: Date | undefined;
  edad: number | null = null;
  capacitacion: string = '';
  codDonante: number | null = null;
  pesoBebe: number | null = null;
  eps:string = '';
  nombreHijo: string = '';
  departamento: string = '';
  profesion: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosPrecargados'] && changes['datosPrecargados'].currentValue.documento) {
      this.formatForm();
    }
  }

  formatForm() {
    this.nombre = this.datosPrecargados.nombre + ' ' + this.datosPrecargados.apellido;
    this.fechaNacimiento = this.datosPrecargados.fechaNacimiento ? new Date(this.datosPrecargados.fechaNacimiento) : undefined;
    this.edad = this.ageCalculate(this.datosPrecargados.fechaNacimiento) || null;
  }

  getFormData() {
    return {
      nombre: this.nombre,
      celular: this.datosPrecargados.celular,
      fechaNacimiento: this.fechaNacimiento,
      profesion:this.profesion,
      barrio:this.datosPrecargados.barrio,
      telefono:this.datosPrecargados.telefono,
      donanteExclusiva: this.donanteExclusiva,
      departamento: this.departamento,
      direccion: this.datosPrecargados.direccion,
      nombreHijo: this.nombreHijo,
      eps: this.eps,
      ciudad:this.datosPrecargados.ciudad,
      recoleccionDomicilio: this.recoleccionDomicilio,
      pesoBebe: this.pesoBebe,
      edad: this.edad,
      documento: this.datosPrecargados.documento,
      codDonante: this.codDonante,
      donante_EoI: this.donante_EoI,
      fechaDiligenciamiento: this.fechaDiligenciamiento,
      capcitacion: this.capacitacion
    };
  }

  ageCalculate(age: Date): number {
    const fechaNacimiento = new Date(age);
    const fechaActual = new Date();
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaActual.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNacimiento.getDate())) {
      return edad - 1;
    }
    return edad;
  }
}
