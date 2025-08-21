import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
import { ResponseMadresDonantes } from '../../posibles-donantes-table/interfaces/registro-donante.interface';
import { RegistroDonanteService } from '../../posibles-donantes-table/services/registro-donante.service';

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
export class ExamenesLaboratorioComponent implements ExamenesLaboratorioData, OnChanges {
  @Input() datosPrecargados: ResponseMadresDonantes = {} as ResponseMadresDonantes;

  fechaRegistroLab: Date | null = null;
  vdrl: number | null = null;
  fechaVencimientoVdrl: Date | null = null;
  docVdrl: string = '';
  hbsag: number | null = null;
  fechaVencimientoHbsag: Date | null = null;
  docHbsag: string = '';
  hiv: number | null = null;
  docHiv: string = '';
  fechaVencimientoHiv: Date | null = null;
  hemoglobina: number | null = null;
  hematocrito: number | null = null;
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
  visible: boolean = false;

  constructor(
    private messageService: MessageService,
    private _registroDonanteService: RegistroDonanteService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosPrecargados'] && changes['datosPrecargados'].currentValue.id) {
      this.formatForm();
      this.visible = true;
    }
  }

  formatForm() {
    this.fechaRegistroLab = this.datosPrecargados.MadreDonante ? new Date(this.datosPrecargados.laboratorio[0].fechaRegistro!) : null;
    this.vdrl = this.datosPrecargados.MadreDonante ? this.datosPrecargados.laboratorio[0].resultado : null;
    this.fechaVencimientoVdrl = this.datosPrecargados.MadreDonante ? new Date(this.datosPrecargados.laboratorio[0].fechaVencimiento!) : null;
    this.hbsag = this.datosPrecargados.MadreDonante ? this.datosPrecargados.laboratorio[1].resultado : null;
    this.fechaVencimientoHbsag = this.datosPrecargados.MadreDonante ? new Date(this.datosPrecargados.laboratorio[1].fechaVencimiento!) : null;
    this.hiv = this.datosPrecargados.MadreDonante ? this.datosPrecargados.laboratorio[2].resultado : null;
    this.fechaVencimientoHiv = this.datosPrecargados.MadreDonante ? new Date(this.datosPrecargados.laboratorio[2].fechaVencimiento!) : null;
    this.docVdrl = this.datosPrecargados.MadreDonante ? this.datosPrecargados.laboratorio[0].documento : '';
    this.docHbsag = this.datosPrecargados.MadreDonante ? this.datosPrecargados.laboratorio[1].documento : '';
    this.docHiv = this.datosPrecargados.MadreDonante ? this.datosPrecargados.laboratorio[2].documento : '';
    this.hemoglobina = this.datosPrecargados.MadreDonante ? this.datosPrecargados.MadreDonante.examenesPrenatal.hemoglobina : null;
    this.hematocrito = this.datosPrecargados.MadreDonante ? this.datosPrecargados.MadreDonante.examenesPrenatal.hematocrito : null;
    this.transfusiones = this.datosPrecargados.MadreDonante ? this.datosPrecargados.MadreDonante.examenesPrenatal.transfuciones : null;
    this.enfermedadesGestacion = this.datosPrecargados.MadreDonante ? this.datosPrecargados.MadreDonante.examenesPrenatal.enfermedadesGestacion : '';
    this.fuma = this.datosPrecargados.MadreDonante ? this.datosPrecargados.MadreDonante.examenesPrenatal.fuma : null;
    this.alcohol = this.datosPrecargados.MadreDonante ? this.datosPrecargados.MadreDonante.examenesPrenatal.alcohol : null;
    if (this.datosPrecargados.MadreDonante) {
      this.datosPrecargados.laboratorio.map((lab) => {
        lab.fechaVencimiento = new Date(lab.fechaVencimiento);
      });
    }
  }

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'archivoVdrl':
        return !this.files['vdrl']
          ? 'Debe adjuntar el archivo del examen VDRL'
          : '';

      case 'hbsag':
        return !value || value.toString().trim() === ''
          ? 'Debe seleccionar una opcion'
          : '';

      case 'fechaVencimientoHbsag':
        return !value ? 'La fecha de vencimiento de HbsAg es obligatoria' : '';

      case 'archivoHbsag':
        return !this.files['hbsag']
          ? 'Debe adjuntar el archivo del examen HbsAg'
          : '';

      case 'hiv':
        return !value || value.toString().trim() === ''
          ? 'Debe seleccionar una opcion'
          : '';

      case 'fechaVencimientoHiv':
        return !value ? 'La fecha de vencimiento de HIV es obligatoria' : '';

      case 'archivoHiv':
        return !this.files['hiv']
          ? 'Debe adjuntar el archivo del examen HIV'
          : '';

      case 'hemoglobina':
        return !value || value.toString().trim() === ''
          ? 'Este campo es obligatorio'
          : '';

      case 'hematocrito':
        return !value || value.toString().trim() === ''
          ? 'Este campo es obligatorio'
          : '';

      case 'transfusiones':
        return value === null
          ? 'Debe seleccionar una opcion'
          : '';

      case 'enfermedadesGestacion':
        return !value || value.toString().trim() === ''
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
      const formData = new FormData();
      const fechaVencimiento = tipo === 'vdrl' ? this.fechaVencimientoVdrl : tipo === 'hbsag' ? this.fechaVencimientoHbsag : this.fechaVencimientoHiv;
      const tipoLaboratorio = tipo === 'vdrl' ? '1' : tipo === 'hbsag' ? '2' : '3';
      const resultado = tipo === 'vdrl' ? this.vdrl : tipo === 'hbsag' ? this.hbsag : this.hiv;

      formData.append('pdf', this.files[tipo] as File);
      formData.append('resultado', resultado?.toString() || '');
      formData.append('fechaVencimiento', fechaVencimiento?.toISOString().split('T')[0] || '');
      formData.append('madrePotencial', this.datosPrecargados.id?.toString() || '');
      formData.append('tipoLaboratorio', tipoLaboratorio);
      setTimeout(() => {
        this.uploading[tipo] = false;
        this._registroDonanteService.uploadPdf(formData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Archivo de ${tipo.toUpperCase()} subido correctamente`,
              key: 'tr',
              life: 2500,
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al subir el archivo',
              key: 'tr',
              life: 2500,
            });
          },
        });
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
      id: this.datosPrecargados.MadreDonante ? this.datosPrecargados.MadreDonante.examenesPrenatal.id : null,
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
      laboratorios: this.files
    };
  }

  downloadPDF(index: number) {
    const doc = index === 0 ? this.docVdrl : index === 1 ? this.docHbsag : this.docHiv;
    if (doc) {
      this._registroDonanteService.getPDF(doc).subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${doc}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al descargar el archivo',
            key: 'tr',
            life: 2500,
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay archivo disponible para descargar',
        key: 'tr',
        life: 2500,
      });
    }
  }
}
