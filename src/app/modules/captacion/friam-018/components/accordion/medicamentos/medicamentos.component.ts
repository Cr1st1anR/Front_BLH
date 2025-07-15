import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import SignaturePad from 'signature_pad';
import type { MedicamentosData } from '../interfaces/medicamentos.interface';
import { empleados } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'medicamentos',
  imports: [
    FormsModule,
    AccordionModule,
    Checkbox,
    InputTextModule,
    RadioButton,
    SelectModule,
    CommonModule,
  ],
  templateUrl: './medicamentos.component.html',
  styleUrl: './medicamentos.component.scss',
})
export class MedicamentosComponent
  implements MedicamentosData, AfterViewInit, OnChanges
{
  @Input() empleadosOpt!: empleados[];
  @ViewChild('canvasAcompanante', { static: true })
  canvasAcompananteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasDonante', { static: true })
  canvasDonanteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasProfesional', { static: true })
  canvasProfesionalRef!: ElementRef<HTMLCanvasElement>;

  medicamentos: string = '';
  ningunMedicamento: boolean = false;
  psicoactivos: string = '';
  recibioEducacion: string = '';
  responsableRegistro: string = '';
  firmaAcompanante: string = '';
  donanteApta: number | null = null;
  firmaDonante: string = '';
  profesionalResponsable: string = '';
  selectedEmpleado: empleados | null = null;

  private signaturePadAcompanante!: SignaturePad;
  private signaturePadDonante!: SignaturePad;
  private signaturePadProfesional!: SignaturePad;

  formErrors: { [key: string]: string } = {};
  isFormValid: boolean = false;

  ngAfterViewInit() {
    this.signaturePadAcompanante = new SignaturePad(
      this.canvasAcompananteRef.nativeElement,
      { backgroundColor: '#fff' }
    );
    this.signaturePadAcompanante.addEventListener('endStroke', () => {
      this.firmaAcompanante = this.signaturePadAcompanante.toDataURL();
      this.onFieldChange('firmaAcompanante', this.firmaAcompanante);
    });

    this.signaturePadDonante = new SignaturePad(
      this.canvasDonanteRef.nativeElement,
      { backgroundColor: '#fff' }
    );
    this.signaturePadDonante.addEventListener('endStroke', () => {
      this.firmaDonante = this.signaturePadDonante.toDataURL();
      this.onFieldChange('firmaDonante', this.firmaDonante);
    });

    this.signaturePadProfesional = new SignaturePad(
      this.canvasProfesionalRef.nativeElement,
      { backgroundColor: '#fff' }
    );
    this.signaturePadProfesional.addEventListener('endStroke', () => {
      this.profesionalResponsable = this.signaturePadProfesional.toDataURL();
      this.onFieldChange('profesionalResponsable', this.profesionalResponsable);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['empleadosOpt'] &&
      changes['empleadosOpt'].currentValue.length > 0
    ) {
      this.empleadosOpt = changes['empleadosOpt'].currentValue;
    }
  }

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'medicamentos':
        if (this.ningunMedicamento) {
          return '';
        }
        return !value || value.trim() === ''
          ? 'Debe especificar los medicamentos o marcar "Ninguno"'
          : '';

      case 'psicoactivos':
        return !value || value.trim() === '' ? 'Este campo es obligatorio' : '';

      case 'recibioEducacion':
        return !value || value.trim() === '' ? 'Este campo es obligatorio' : '';

      case 'selectedEmpleado':
        return !value ? 'Debe seleccionar un responsable del registro' : '';

      case 'donanteApta':
        return value === null ? 'Debe seleccionar una opcion' : '';

      case 'firmaDonante':
        return !value || value.trim() === ''
          ? 'La firma del donante es obligatoria'
          : '';

      case 'profesionalResponsable':
        return !value || value.trim() === ''
          ? 'La firma del profesional responsable es obligatoria'
          : '';

      case 'firmaAcompanante':
        return '';

      default:
        return '';
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    const fieldsToValidate = [
      'medicamentos',
      'psicoactivos',
      'recibioEducacion',
      'selectedEmpleado',
      'donanteApta',
      'firmaDonante',
      'profesionalResponsable',
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

  onNingunMedicamentoChange(): void {
    if (this.ningunMedicamento) {
      this.medicamentos = '';
      delete this.formErrors['medicamentos'];
    } else {
      this.onFieldChange('medicamentos', this.medicamentos);
    }
  }

  getFormData() {
    if (!this.validateForm()) {
      throw new Error(
        'Formulario de Medicamentos inválido. Por favor, corrija los errores antes de continuar.'
      );
    }

    return {
      medicamentos: this.medicamentos,
      ningunMedicamento: this.ningunMedicamento,
      psicoactivos: this.psicoactivos,
      recibioEducacion: this.recibioEducacion,
      responsableRegistro: this.responsableRegistro,
      firmaAcompanante: this.firmaAcompanante,
      donanteApta: this.donanteApta,
      firmaDonante: this.firmaDonante,
      profesionalResponsable: this.profesionalResponsable,
      empleado: this.selectedEmpleado,
    };
  }

  clearFirmaAcompanante() {
    this.signaturePadAcompanante.clear();
    this.firmaAcompanante = '';
    this.onFieldChange('firmaAcompanante', this.firmaAcompanante);
  }

  clearFirmaDonante() {
    this.signaturePadDonante.clear();
    this.firmaDonante = '';
    this.onFieldChange('firmaDonante', this.firmaDonante);
  }

  clearFirmaProfesional() {
    this.signaturePadProfesional.clear();
    this.profesionalResponsable = '';
    this.onFieldChange('profesionalResponsable', this.profesionalResponsable);
  }
}
