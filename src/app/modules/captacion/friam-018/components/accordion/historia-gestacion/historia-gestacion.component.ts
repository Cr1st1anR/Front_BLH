import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import type { HistoriaGestacionData } from '../interfaces/historia-gestacion.interface';
import { ResponseMadresDonantes } from '../../posibles-donantes-table/interfaces/registro-donante.interface';

@Component({
  selector: 'historia-gestacion',
  imports: [
    FormsModule,
    AccordionModule,
    InputTextModule,
    DatePickerModule,
    RadioButton,
    CommonModule,
  ],
  templateUrl: './historia-gestacion.component.html',
  styleUrl: './historia-gestacion.component.scss',
})
export class HistoriaGestacionComponent implements HistoriaGestacionData, OnChanges {
  @Input() datosPrecargados: ResponseMadresDonantes = {} as ResponseMadresDonantes;

  lugarControlPrenatal: string = '';
  tipoIPS: number = 0;
  asistioControl: number | null = null;
  pesoInicial: string = '';
  pesoFinal: string = '';
  talla: string = '';
  tipoParto: string = '';
  semanasGestacion: number | null = null;
  fechaParto: Date | undefined;

  formErrors: { [key: string]: string } = {};
  isFormValid: boolean = false;
  visible: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosPrecargados'] && changes['datosPrecargados'].currentValue.id) {
      this.formatForm();
      this.visible = true;
    }
  }

  formatForm() {
    this.lugarControlPrenatal = this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.lugarControlPrenatal : '';
    this.tipoIPS = this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.tipoIps : 0;
    this.asistioControl =  this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.asistioControlPrenatal : null;
    this.pesoInicial = this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.pesoGestacionInicial : '';
    this.pesoFinal = this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.pesoGestacionFinal : '';
    this.talla = this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.talla : '';
    this.tipoParto = this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.preTermino === 1 ? 'pretermino' : 'termino' : '';
    this.semanasGestacion = this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.semanas : null;
    this.fechaParto = this.datosPrecargados.madreDonante ? new Date(this.datosPrecargados.madreDonante.gestacion.fechaParto!) : undefined;
  }
  validateNumericField(value: string): boolean {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0;
  }

  validateSemanas(semanas: number): boolean {
    return !isNaN(semanas) && semanas > 0;
    // return !isNaN(semanas) && semanas > 0 && semanas <= 45;
  }

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'lugarControlPrenatal':
        return !value || value.trim() === ''
          ? 'El lugar del control prenatal es obligatorio'
          : '';

      case 'tipoIPS':
        return !value || value.toString().trim() === ''
          ? 'Debe seleccionar una opcion'
          : '';

      case 'asistioControl':
        return value === null ? 'Debe seleccionar una opcion' : '';

      case 'pesoInicial':
        if (!value || value.toString().trim() === '')
          return 'El peso inicial es obligatorio';
        if (!this.validateNumericField(value))
          return 'El peso inicial debe ser un número válido mayor a 0';
        return '';

      case 'pesoFinal':
        if (!value || value.toString().trim() === '')
          return 'El peso final es obligatorio';
        if (!this.validateNumericField(value))
          return 'El peso final debe ser un número válido mayor a 0';
        return '';

      case 'talla':
        if (!value || value.toString().trim() === '') return 'La talla es obligatoria';
        if (!this.validateNumericField(value))
          return 'La talla debe ser un número válido mayor a 0';
        return '';

      case 'tipoParto':
        return !value || value.toString().trim() === ''
          ? 'Debe seleccionar una opcion'
          : '';

      case 'semanasGestacion':
        if (!value) return 'Las semanas de gestación son obligatorias';
        if (!this.validateSemanas(value))
          return 'Las semanas deben ser un número válido mayor a 0';
        return '';

      case 'fechaParto':
        return !value ? 'La fecha de parto es obligatoria' : '';

      default:
        return '';
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    const fieldsToValidate = [
      'lugarControlPrenatal',
      'tipoIPS',
      'asistioControl',
      'pesoInicial',
      'pesoFinal',
      'talla',
      'tipoParto',
      'semanasGestacion',
      'fechaParto',
    ];

    fieldsToValidate.forEach((field) => {
      const value = (this as any)[field];
      const error = this.validateField(field, value);
      if (error) {
        this.formErrors[field] = error;
        isValid = false;
      }
    });

    this.isFormValid = isValid;
    return isValid;
  }

  onFieldChange(fieldName: string, value: any): void {
    const error = this.validateField(fieldName, value);
    if (error) {
      this.formErrors[fieldName] = error;
    } else {
      delete this.formErrors[fieldName];
    }
  }

  onNumericInput(event: any): void {
    const value = event.target.value;
    event.target.value = value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
  }

  onIntegerInput(event: any): void {
    const value = event.target.value;
    event.target.value = value.replace(/[^0-9]/g, '');
  }

  getFormData() {
    if (!this.validateForm()) {
      throw new Error(
        'Formulario de Historia de Gestación inválido. Por favor, corrija los errores antes de continuar.'
      );
    }

    return {
      id: this.datosPrecargados.madreDonante ? this.datosPrecargados.madreDonante.gestacion.id : null,
      lugarControlPrenatal: this.lugarControlPrenatal,
      tipoIPS: this.tipoIPS,
      asistioControl: this.asistioControl,
      pesoInicial: this.pesoInicial,
      pesoFinal: this.pesoFinal,
      talla: this.talla,
      tipoParto: this.tipoParto,
      semanasGestacion: this.semanasGestacion || 0,
      fechaParto: this.fechaParto,
    };
  }
}
