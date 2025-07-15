import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import type { DatosInscripcionData } from '../interfaces/datos-inscripcion.interface';
import { RegistroDonanteData } from '../../posibles-donantes-table/interfaces/registro-donante.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'datos-inscripcion',
  imports: [
    FormsModule,
    AccordionModule,
    InputTextModule,
    DatePickerModule,
    RadioButton,
    CommonModule,
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
  eps: string = '';
  nombreHijo: string = '';
  departamento: string = '';
  profesion: string = '';


  formErrors: { [key: string]: string } = {};
  isFormValid: boolean = false;

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

  validateDocumento(documento: string): boolean {
    const documentoRegex = /^\d{10}$/;
    return documentoRegex.test(documento);
  }

  validateCelular(celular: string): boolean {
    const celularRegex = /^\d{10}$/;
    return celularRegex.test(celular);
  }

  validateCodigoDonante(codigo: string): boolean {
    return /^\d+$/.test(codigo);
  }

  validatePesoBebe(peso: string): boolean {
    const pesoNum = parseFloat(peso);
    return !isNaN(pesoNum) && pesoNum > 0;
  }

  validateEdad(edad: number): boolean {
  return !isNaN(edad) && edad > 0;
}

validateField(fieldName: string, value: any): string {
  switch (fieldName) {
    case 'nombre':
      return !value || value.trim() === '' ? 'El nombre es obligatorio' : '';

    case 'celular':
      const celular = this.datosPrecargados.celular;
      if (!celular || String(celular).trim() === '') {
        return 'El celular es obligatorio';
      }
      if (!this.validateCelular(String(celular))) {
        return 'El celular debe tener exactamente 10 dígitos';
      }
      return '';

    case 'fechaNacimiento':
      return !value ? 'La fecha de nacimiento es obligatoria' : '';

    case 'profesion':
      return !value || value.trim() === '' ? 'La profesión/oficio es obligatoria' : '';

    case 'barrio':
      const barrio = this.datosPrecargados.barrio;
      return !barrio || String(barrio).trim() === '' ? 'El barrio/vereda es obligatorio' : '';

    case 'telefono':
      const telefono = this.datosPrecargados.telefono;
      return !telefono || String(telefono).trim() === '' ? 'El teléfono es obligatorio' : '';

    case 'donanteExclusiva':
      return value === null ? 'Debe seleccionar una opcion' : '';

    case 'departamento':
      return !value || value.trim() === '' ? 'El departamento es obligatorio' : '';

    case 'direccion':
      const direccion = this.datosPrecargados.direccion;
      return !direccion || String(direccion).trim() === '' ? 'La dirección es obligatoria' : '';

    case 'nombreHijo':
      return !value || value.trim() === '' ? 'El nombre del hijo es obligatorio' : '';

    case 'eps':
      return !value || value.trim() === '' ? 'La EPS es obligatoria' : '';

    case 'ciudad':
      const ciudad = this.datosPrecargados.ciudad;
      return !ciudad || String(ciudad).trim() === '' ? 'La ciudad es obligatoria' : '';

    case 'recoleccionDomicilio':
      return value === null ? 'Debe seleccionar una opcion' : '';

    case 'pesoBebe':
      if (!value) return 'El peso del bebé es obligatorio';
      if (!this.validatePesoBebe(String(value))) return 'El peso debe ser un número válido mayor a 0';
      return '';

    case 'edad':
      if (!value) return 'La edad es obligatoria';
      if (!this.validateEdad(value)) return 'La edad debe ser un número válido mayor a 0';
      return '';

    case 'documento':
      const documento = this.datosPrecargados.documento;
      if (!documento || String(documento).trim() === '') {
        return 'El documento de identidad es obligatorio';
      }
      if (!this.validateDocumento(String(documento))) {
        return 'El documento debe tener exactamente 10 dígitos';
      }
      return '';

    case 'codDonante':
      if (value && !this.validateCodigoDonante(String(value))) {
        return 'El código debe contener solo números';
      }
      return '';

    case 'donante_EoI':
      return !value || value.trim() === '' ? 'Debe seleccionar el tipo de donante' : '';

    case 'fechaDiligenciamiento':
      return !value ? 'La fecha de diligenciamiento es obligatoria' : '';

    case 'capacitacion':
      return !value || value.trim() === '' ? 'El campo "Capacitada en" es obligatorio' : '';

    default:
      return '';
  }
}

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    const fieldsToValidate = [
      'nombre', 'celular', 'fechaNacimiento', 'profesion', 'barrio', 'telefono',
      'donanteExclusiva', 'departamento', 'direccion', 'nombreHijo', 'eps',
      'ciudad', 'recoleccionDomicilio', 'pesoBebe', 'edad', 'documento',
      'codDonante', 'donante_EoI', 'fechaDiligenciamiento', 'capacitacion'
    ];

    fieldsToValidate.forEach(field => {
      let value;
      switch (field) {
        case 'celular':
        case 'barrio':
        case 'telefono':
        case 'direccion':
        case 'ciudad':
        case 'documento':
          value = this.datosPrecargados[field];
          break;
        default:
          value = (this as any)[field];
      }

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

  onNumberInput(event: any): void {
    const value = event.target.value;
    event.target.value = value.replace(/[^0-9]/g, '');
  }

  onDocumentInput(event: any, maxLength: number): void {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    event.target.value = value;
  }

  getFormData() {
    if (!this.validateForm()) {
      throw new Error('Formulario inválido. Por favor, corrija los errores antes de continuar.');
    }

    return {
      nombre: this.nombre,
      celular: this.datosPrecargados.celular,
      fechaNacimiento: this.fechaNacimiento,
      profesion: this.profesion,
      barrio: this.datosPrecargados.barrio,
      telefono: this.datosPrecargados.telefono,
      donanteExclusiva: this.donanteExclusiva,
      departamento: this.departamento,
      direccion: this.datosPrecargados.direccion,
      nombreHijo: this.nombreHijo,
      eps: this.eps,
      ciudad: this.datosPrecargados.ciudad,
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
