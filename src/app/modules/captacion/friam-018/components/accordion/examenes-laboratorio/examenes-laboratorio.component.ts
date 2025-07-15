import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import type { ExamenesLaboratorioData } from '../interfaces/examenes-laboratorio.interface';

@Component({
  selector: 'examenes-laboratorio',
  imports: [
    FormsModule,
    AccordionModule,
    InputTextModule,
    DatePickerModule,
    RadioButton,
    FileUpload,
    ToastModule,
    ButtonModule,
    ProgressSpinnerModule,
    CommonModule,
  ],
  templateUrl: './examenes-laboratorio.component.html',
  styleUrl: './examenes-laboratorio.component.scss',
  providers: [MessageService],
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
  transfusiones: number | null = null;
  enfermedadesGestacion: string = '';
  fuma: number | null = null;
  alcohol: number | null = null;

  fileNames = { vdrl: '', hbsag: '', hiv: '' };
  files: { [key: string]: File | null } = {
    vdrl: null,
    hbsag: null,
    hiv: null,
  };

  uploading: { [key: string]: boolean } = {
    vdrl: false,
    hbsag: false,
    hiv: false,
  };

  formErrors: { [key: string]: string } = {};
  isFormValid: boolean = false;

  constructor(private messageService: MessageService) {}

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'fechaRegistroLab':
        return !value ? 'La fecha de registro es obligatoria' : '';

      case 'vdrl':
        return !value || value.trim() === ''
          ? 'Debe seleccionar una opcion'
          : '';

      case 'fechaVencimientoVdrl':
        return !value ? 'La fecha de vencimiento de VDRL es obligatoria' : '';

      case 'archivoVdrl':
        return !this.files['vdrl']
          ? 'Debe adjuntar el archivo del examen VDRL'
          : '';

      case 'hbsag':
        return !value || value.trim() === ''
          ? 'Debe seleccionar una opcion'
          : '';

      case 'fechaVencimientoHbsag':
        return !value ? 'La fecha de vencimiento de HbsAg es obligatoria' : '';

      case 'archivoHbsag':
        return !this.files['hbsag']
          ? 'Debe adjuntar el archivo del examen HbsAg'
          : '';

      case 'hiv':
        return !value || value.trim() === ''
          ? 'Debe seleccionar una opcion'
          : '';

      case 'fechaVencimientoHiv':
        return !value ? 'La fecha de vencimiento de HIV es obligatoria' : '';

      case 'archivoHiv':
        return !this.files['hiv']
          ? 'Debe adjuntar el archivo del examen HIV'
          : '';

      case 'hemoglobina':
        return !value || value.trim() === ''
          ? 'Este campo es obligatorio'
          : '';

      case 'hematocrito':
        return !value || value.trim() === ''
          ? 'Este campo es obligatorio'
          : '';

      case 'transfusiones':
        return value === null
          ? 'Debe seleccionar una opcion'
          : '';

      case 'enfermedadesGestacion':
        return !value || value.trim() === ''
          ? 'Este campo es obligatorio'
          : '';

      case 'fuma':
        return value === null ? 'Debe seleccionar una opcion' : '';

      case 'alcohol':
        return value === null ? 'Debe seleccionar una opcion' : '';

      default:
        return '';
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    const fieldsToValidate = [
      'fechaRegistroLab',
      'vdrl',
      'fechaVencimientoVdrl',
      'archivoVdrl',
      'hbsag',
      'fechaVencimientoHbsag',
      'archivoHbsag',
      'hiv',
      'fechaVencimientoHiv',
      'archivoHiv',
      'hemoglobina',
      'hematocrito',
      'transfusiones',
      'enfermedadesGestacion',
      'fuma',
      'alcohol',
    ];

    fieldsToValidate.forEach((field) => {
      let value;
      switch (field) {
        case 'archivoVdrl':
        case 'archivoHbsag':
        case 'archivoHiv':
          value = field;
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

  onFileSelect(event: any, tipo: 'vdrl' | 'hbsag' | 'hiv') {
    const file = event.files?.[0];
    this.fileNames[tipo] = file ? file.name : '';
    this.files[tipo] = file || null;

    this.onFieldChange(
      `archivo${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
      this.files[tipo]
    );
  }

  onUpload(tipo: 'vdrl' | 'hbsag' | 'hiv') {
    if (this.files[tipo]) {
      this.uploading[tipo] = true;

      setTimeout(() => {
        this.uploading[tipo] = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Archivo de ${tipo.toUpperCase()} subido correctamente`,
          key: 'tr',
          life: 2500,
        });

        //  logica de subida de archivos
        // llamar a un servicio
      }, 1500);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione un archivo antes de subir',
        key: 'tr',
        life: 2500,
      });
    }
  }

  getFormData() {
    if (!this.validateForm()) {
      throw new Error(
        'Formulario de Exámenes de Laboratorio inválido. Por favor, corrija los errores antes de continuar.'
      );
    }

    return {
      fechaRegistroLab: this.fechaRegistroLab,
      vdrl: this.vdrl,
      fechaVencimientoVdrl: this.fechaVencimientoVdrl,
      hbsag: this.hbsag,
      fechaVencimientoHbsag: this.fechaVencimientoHbsag,
      hiv: this.hiv,
      fechaVencimientoHiv: this.fechaVencimientoHiv,
      hemoglobina: this.hemoglobina,
      hematocrito: this.hematocrito,
      transfusiones: this.transfusiones,
      enfermedadesGestacion: this.enfermedadesGestacion,
      fuma: this.fuma,
      alcohol: this.alcohol,
    };
  }
}
