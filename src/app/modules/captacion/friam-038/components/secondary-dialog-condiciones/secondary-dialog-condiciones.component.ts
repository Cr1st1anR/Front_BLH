import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TableCondicionesComponent } from './table-condiciones/table-condiciones.component';
import { ButtonModule } from 'primeng/button';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'secondary-dialog-condiciones',
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule,
    TableCondicionesComponent,
    ButtonModule,
    FormsModule,
  ],
  templateUrl: './secondary-dialog-condiciones.component.html',
  styleUrl: './secondary-dialog-condiciones.component.scss',
  providers: [MessageService],
})
export class SecondaryDialogCondicionesComponent
  implements OnChanges, AfterViewInit
{
  @Input() visible: boolean = false;
  @Input() visitaData: any = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild('canvasUsuaria', { static: true })
  canvasUsuariaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasVisitante', { static: true })
  canvasVisitanteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(TableCondicionesComponent)
  tableCondicionesComp!: TableCondicionesComponent;

  loading: boolean = false;

  // Campos del formulario
  observaciones: string = '';
  recomendacionesEducacion: string = '';
  firmaUsuaria: string = '';
  firmaVisitante: string = '';

  // SignaturePad instances
  private signaturePadUsuaria!: SignaturePad;
  private signaturePadVisitante!: SignaturePad;

  // Validación de errores
  formErrors: { [key: string]: string } = {};

  constructor(private messageService: MessageService) {}

  ngAfterViewInit() {
    this.initializeSignaturePads();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue) {
      this.loading = true;

      setTimeout(() => {
        this.loading = false;
        this.initializeSignaturePads();

        if (this.visitaData) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Detalles de visita cargados correctamente',
            key: 'tr-secondary',
            life: 2000,
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para mostrar',
            key: 'tr-secondary',
            life: 2000,
          });
        }
      }, 800);
    }
  }

  private initializeSignaturePads() {
    if (this.visible && this.canvasUsuariaRef && this.canvasVisitanteRef) {
      // SignaturePad para firma usuaria
      this.signaturePadUsuaria = new SignaturePad(
        this.canvasUsuariaRef.nativeElement,
        { backgroundColor: '#fff' }
      );
      this.signaturePadUsuaria.addEventListener('endStroke', () => {
        this.firmaUsuaria = this.signaturePadUsuaria.toDataURL();
        this.onFieldChange('firmaUsuaria', this.firmaUsuaria);
      });

      // SignaturePad para firma visitante
      this.signaturePadVisitante = new SignaturePad(
        this.canvasVisitanteRef.nativeElement,
        { backgroundColor: '#fff' }
      );
      this.signaturePadVisitante.addEventListener('endStroke', () => {
        this.firmaVisitante = this.signaturePadVisitante.toDataURL();
        this.onFieldChange('firmaVisitante', this.firmaVisitante);
      });
    }
  }

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'observaciones':
        return !value || value.trim() === ''
          ? 'Las observaciones son obligatorias'
          : '';

      case 'recomendacionesEducacion':
        return !value || value.trim() === ''
          ? 'Las recomendaciones y/o educación son obligatorias'
          : '';

      case 'firmaUsuaria':
        return !value || value.trim() === ''
          ? 'La firma usuaria es obligatoria'
          : '';

      case 'firmaVisitante':
        return !value || value.trim() === ''
          ? 'La firma de quien realiza la visita es obligatoria'
          : '';

      default:
        return '';
    }
  }

  onFieldChange(fieldName: string, value: any): void {
    const error = this.validateField(fieldName, value);
    if (error) {
      this.formErrors[fieldName] = error;
    } else {
      delete this.formErrors[fieldName];
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    const fieldsToValidate = [
      'observaciones',
      'recomendacionesEducacion',
      'firmaUsuaria',
      'firmaVisitante',
    ];

    fieldsToValidate.forEach((field) => {
      const value = (this as any)[field];
      const error = this.validateField(field, value);
      if (error) {
        this.formErrors[field] = error;
        isValid = false;
      }
    });

    return isValid;
  }

  validateCondiciones(): { isValid: boolean; message: string } {
    const condicionesData = this.tableCondicionesComp.getCondicionesData();
    const condicionesSinResponder = condicionesData.filter(
      (c) => c.respuesta === null
    );

    if (condicionesSinResponder.length > 0) {
      return {
        isValid: false,
        message: `Faltan ${condicionesSinResponder.length} condiciones por evaluar`,
      };
    }

    return { isValid: true, message: '' };
  }

  clearFirmaUsuaria() {
    if (this.signaturePadUsuaria) {
      this.signaturePadUsuaria.clear();
      this.firmaUsuaria = '';
      this.onFieldChange('firmaUsuaria', this.firmaUsuaria);
    }
  }

  clearFirmaVisitante() {
    if (this.signaturePadVisitante) {
      this.signaturePadVisitante.clear();
      this.firmaVisitante = '';
      this.onFieldChange('firmaVisitante', this.firmaVisitante);
    }
  }

  private transformCondicionesData(condiciones: any[]): any[] {
    return condiciones.map((condicion) => ({
      id: condicion.id,
      descripcion: condicion.descripcion,
      valor:
        condicion.respuesta === 'SI'
          ? 1
          : condicion.respuesta === 'NO'
          ? 0
          : 'no_aplica',
    }));
  }

  onGuardar() {
    // Validar formulario principal
    const formValid = this.validateForm();

    // Validar condiciones
    const condicionesValidation = this.validateCondiciones();

    if (formValid && condicionesValidation.isValid) {
      // Obtener datos de condiciones
      const condicionesData = this.tableCondicionesComp.getCondicionesData();
      const condicionesTransformadas =
        this.transformCondicionesData(condicionesData);

      const formData = {
        observaciones: this.observaciones,
        recomendacionesEducacion: this.recomendacionesEducacion,
        firmaUsuaria: this.firmaUsuaria,
        firmaVisitante: this.firmaVisitante,
        condiciones: condicionesTransformadas,
        visitaData: this.visitaData,
      };

      console.log('Datos completos del formulario:', formData);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Datos guardados correctamente',
        key: 'tr-secondary',
        life: 2500,
      });

      setTimeout(() => {
        this.closeDialog();
      }, 1000);
    } else {
      let errorMessage = 'Por favor, corrija los siguientes errores:\n';

      if (!formValid) {
        errorMessage += '• Complete todos los campos obligatorios\n';
      }

      if (!condicionesValidation.isValid) {
        errorMessage += `• ${condicionesValidation.message}`;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: errorMessage,
        key: 'tr-secondary',
        life: 4000,
      });
    }
  }

  closeDialog() {
    this.visible = false;
    this.dialogClosed.emit();
  }
}
