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
  ChangeDetectorRef,
  NgZone,
  OnDestroy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TableCondicionesComponent } from './table-condiciones/table-condiciones.component';
import { ButtonModule } from 'primeng/button';
import SignaturePad from 'signature_pad';
import { SecondaryDialogCondicionesService } from './services/secondary-dialog-condiciones.service';
import { DatosCompletos } from '../interfaces/datos-completos.interface';

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
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() visible: boolean = false;
  @Input() visitaData: any = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild('canvasUsuaria', { static: false })
  canvasUsuariaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasVisitante', { static: false })
  canvasVisitanteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(TableCondicionesComponent)
  tableCondicionesComp!: TableCondicionesComponent;

  loading: boolean = false;
  guardandoDatos: boolean = false;

  // Campos del formulario
  observaciones: string = '';
  recomendacionesEducacion: string = '';
  firmaUsuaria: string = '';
  firmaVisitante: string = '';

  // Modo de visualización
  modoSoloLectura: boolean = false;
  datosExistentes: any = null;

  // SignaturePad instances
  private signaturePadUsuaria!: SignaturePad;
  private signaturePadVisitante!: SignaturePad;
  private signaturePadInitialized: boolean = false;

  // Validación de errores
  formErrors: { [key: string]: string } = {};

  constructor(
    private messageService: MessageService,
    private secondaryDialogService: SecondaryDialogCondicionesService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    if (this.visible) {
      setTimeout(() => {
        this.initializeSignaturePadsIfReady();
      }, 300);
    }
  }

  ngOnDestroy() {
    this.cleanupSignaturePads();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (changes['visible'].currentValue) {
        this.loading = true;
        this.resetFormulario();
        this.signaturePadInitialized = false;

        if (this.visitaData?.id_visita) {
          this.cargarDatosVisita();
        } else {
          setTimeout(() => {
            this.loading = false;
            this.cdr.detectChanges();

            setTimeout(() => {
              this.initializeSignaturePadsIfReady();
            }, 500);

            this.messageService.add({
              severity: 'info',
              summary: 'Nueva visita',
              detail: 'Complete el formulario para la nueva visita',
              key: 'tr-secondary',
              life: 2000,
            });
          }, 500);
        }
      } else {
        this.cleanupSignaturePads();
      }
    }
  }

  private initializeSignaturePadsIfReady(): void {
    if (this.signaturePadInitialized || this.loading) {
      console.log('❌ SignaturePad ya inicializado o aún cargando');
      return;
    }

    if (!this.canvasUsuariaRef?.nativeElement || !this.canvasVisitanteRef?.nativeElement) {
      console.log('❌ Canvas no disponibles aún');
      setTimeout(() => {
        this.initializeSignaturePadsIfReady();
      }, 200);
      return;
    }

    try {
      this.ngZone.runOutsideAngular(() => {
        this.cleanupSignaturePads();

        console.log('🔧 Inicializando SignaturePads...');

        const canvasUsuaria = this.canvasUsuariaRef.nativeElement;
        const canvasVisitante = this.canvasVisitanteRef.nativeElement;

        this.setupCanvas(canvasUsuaria);
        this.setupCanvas(canvasVisitante);

        this.signaturePadUsuaria = new SignaturePad(canvasUsuaria, {
          backgroundColor: '#ffffff',
          penColor: '#000000',
          minWidth: 1,
          maxWidth: 3,
          throttle: 16,
          minDistance: 5,
          velocityFilterWeight: 0.7,
          dotSize: 1.5
        });

        this.signaturePadVisitante = new SignaturePad(canvasVisitante, {
          backgroundColor: '#ffffff',
          penColor: '#000000',
          minWidth: 1,
          maxWidth: 3,
          throttle: 16,
          minDistance: 5,
          velocityFilterWeight: 0.7,
          dotSize: 1.5
        });

        if (!this.modoSoloLectura) {
          this.signaturePadUsuaria.addEventListener('beginStroke', () => {
            console.log('✅ Iniciando trazo en firma usuaria');
          });

          this.signaturePadUsuaria.addEventListener('endStroke', () => {
            console.log('✅ Finalizando trazo en firma usuaria');
            this.ngZone.run(() => {
              this.firmaUsuaria = this.signaturePadUsuaria.toDataURL();
              this.onFieldChange('firmaUsuaria', this.firmaUsuaria);
            });
          });

          this.signaturePadVisitante.addEventListener('beginStroke', () => {
            console.log('✅ Iniciando trazo en firma visitante');
          });

          this.signaturePadVisitante.addEventListener('endStroke', () => {
            console.log('✅ Finalizando trazo en firma visitante');
            this.ngZone.run(() => {
              this.firmaVisitante = this.signaturePadVisitante.toDataURL();
              this.onFieldChange('firmaVisitante', this.firmaVisitante);
            });
          });

          console.log('✅ Eventos de SignaturePad configurados');
        } else {
          this.signaturePadUsuaria.off();
          this.signaturePadVisitante.off();
          console.log('🔒 SignaturePads deshabilitados (modo solo lectura)');
        }

        this.signaturePadInitialized = true;
        console.log('✅ SignaturePads inicializados correctamente');

        this.ngZone.run(() => {
          this.loadExistingSignatures();
        });
      });

    } catch (error) {
      console.error('❌ Error al inicializar SignaturePads:', error);
    }
  }

  private setupCanvas(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    canvas.style.touchAction = 'none';
    canvas.style.backgroundColor = '#ffffff';

    console.log(`✅ Canvas configurado: ${rect.width}x${rect.height}, ratio: ${devicePixelRatio}`);
  }

  // ✅ CORRECCIÓN: Método mejorado para cargar firmas existentes
  private loadExistingSignatures(): void {
    if (this.firmaUsuaria && this.signaturePadUsuaria) {
      try {
        this.signaturePadUsuaria.fromDataURL(this.firmaUsuaria);
        console.log('✅ Firma usuaria cargada desde datos existentes');
      } catch (error) {
        console.error('❌ Error al cargar firma usuaria:', error);
      }
    }

    if (this.firmaVisitante && this.signaturePadVisitante) {
      try {
        this.signaturePadVisitante.fromDataURL(this.firmaVisitante);
        console.log('✅ Firma visitante cargada desde datos existentes');
      } catch (error) {
        console.error('❌ Error al cargar firma visitante:', error);
      }
    }
  }

  private cleanupSignaturePads(): void {
    try {
      if (this.signaturePadUsuaria) {
        this.signaturePadUsuaria.off();
        this.signaturePadUsuaria = null as any;
      }

      if (this.signaturePadVisitante) {
        this.signaturePadVisitante.off();
        this.signaturePadVisitante = null as any;
      }

      this.signaturePadInitialized = false;
      console.log('🧹 SignaturePads limpiados correctamente');
    } catch (error) {
      console.error('❌ Error al limpiar SignaturePads:', error);
    }
  }

  private cargarDatosVisita(): void {
    this.secondaryDialogService.getDetallesVisita(this.visitaData.id_visita)
      .subscribe({
        next: (detalles) => {
          console.log('🔍 Detalles recibidos:', detalles);

          if (detalles && detalles.datosVisitaSeguimiento) {
            this.modoSoloLectura = true;
            this.datosExistentes = detalles;
            this.cargarDatosEnFormulario(detalles);

            this.messageService.add({
              severity: 'success',
              summary: 'Datos cargados',
              detail: 'Visita completada - Modo solo lectura',
              key: 'tr-secondary',
              life: 2000,
            });
          } else {
            this.modoSoloLectura = false;
            this.datosExistentes = null;

            this.messageService.add({
              severity: 'info',
              summary: 'Visita pendiente',
              detail: 'Complete el formulario para esta visita',
              key: 'tr-secondary',
              life: 2000,
            });
          }

          this.loading = false;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.initializeSignaturePadsIfReady();
          }, 300);
        },
        error: (error) => {
          console.error('Error al cargar datos de visita:', error);
          this.modoSoloLectura = false;
          this.loading = false;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.initializeSignaturePadsIfReady();
          }, 300);

          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No se pudieron cargar datos previos. Puede completar el formulario.',
            key: 'tr-secondary',
            life: 3000,
          });
        }
      });
  }

  // ✅ CORRECCIÓN: Cargar datos en formulario con firmas
  private cargarDatosEnFormulario(detalles: any): void {
    const datos = detalles.datosVisitaSeguimiento;
    this.observaciones = datos.observaciones || '';
    this.recomendacionesEducacion = datos.recomendaciones || '';

    // ✅ CARGAR FIRMAS INMEDIATAMENTE
    if (datos.firmaUsuario) {
      this.firmaUsuaria = datos.firmaUsuario;
      console.log('🖊️ Firma usuaria encontrada en datos');
    }

    if (datos.firmaEvaluador) {
      this.firmaVisitante = datos.firmaEvaluador;
      console.log('🖊️ Firma evaluador encontrada en datos');
    }

    // Cargar respuestas en el componente de tabla
    if (detalles.respuestas && detalles.respuestas.length > 0) {
      setTimeout(() => {
        this.cargarRespuestasExistentes(detalles.respuestas);
      }, 200);
    }

    // ✅ FORZAR CARGA DE FIRMAS DESPUÉS DE INICIALIZAR SIGNATUREPADS
    setTimeout(() => {
      if (this.signaturePadInitialized) {
        this.loadExistingSignatures();
      } else {
        // Esperar a que se inicialicen
        const interval = setInterval(() => {
          if (this.signaturePadInitialized) {
            this.loadExistingSignatures();
            clearInterval(interval);
          }
        }, 100);

        // Timeout de seguridad
        setTimeout(() => {
          clearInterval(interval);
        }, 3000);
      }
    }, 500);
  }

  private cargarRespuestasExistentes(respuestas: any[]): void {
    if (!this.tableCondicionesComp) {
      console.log('❌ Componente de tabla no disponible aún');
      return;
    }

    console.log('🔄 Cargando respuestas existentes:', respuestas);

    const respuestasMap = new Map<number, number | null>();
    respuestas.forEach(resp => {
      const preguntaId = typeof resp.pregunta === 'object' ? resp.pregunta.id : resp.pregunta;
      respuestasMap.set(preguntaId, resp.respuesta);
    });

    this.tableCondicionesComp.cargarRespuestasExistentes(respuestasMap);

    console.log('✅ Respuestas cargadas en la tabla');
  }

  private resetFormulario(): void {
    this.observaciones = '';
    this.recomendacionesEducacion = '';
    this.firmaUsuaria = '';
    this.firmaVisitante = '';
    this.formErrors = {};
    this.modoSoloLectura = false;
    this.datosExistentes = null;
    this.guardandoDatos = false;
  }

  validateField(fieldName: string, value: any): string {
    if (this.modoSoloLectura) return '';

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
    if (this.modoSoloLectura) return;

    const error = this.validateField(fieldName, value);
    if (error) {
      this.formErrors[fieldName] = error;
    } else {
      delete this.formErrors[fieldName];
    }
  }

  validateForm(): boolean {
    if (this.modoSoloLectura) return true;

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
    if (this.modoSoloLectura) return { isValid: true, message: '' };

    const condicionesData = this.tableCondicionesComp.getCondicionesData();
    const condicionesSinResponder = condicionesData.filter(
      (c) => c.respuesta === undefined // Solo las que no se han tocado
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
    if (this.modoSoloLectura || !this.signaturePadUsuaria) return;

    this.signaturePadUsuaria.clear();
    this.firmaUsuaria = '';
    this.onFieldChange('firmaUsuaria', this.firmaUsuaria);
    console.log('🧹 Firma usuaria limpiada');
  }

  clearFirmaVisitante() {
    if (this.modoSoloLectura || !this.signaturePadVisitante) return;

    this.signaturePadVisitante.clear();
    this.firmaVisitante = '';
    this.onFieldChange('firmaVisitante', this.firmaVisitante);
    console.log('🧹 Firma visitante limpiada');
  }

  onGuardar() {
    if (this.modoSoloLectura) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'Esta visita ya está completada y no se puede modificar',
        key: 'tr-secondary',
        life: 2000,
      });
      return;
    }

    const formValid = this.validateForm();
    const condicionesValidation = this.validateCondiciones();

    if (formValid && condicionesValidation.isValid) {
      this.guardandoDatos = true;

      const respuestasParaAPI = this.tableCondicionesComp.getRespuestasParaAPI();

      const datosCompletos: DatosCompletos = {
        idVisitaSeguimiento: this.visitaData.id_visita,
        observaciones: this.observaciones,
        recomendaciones: this.recomendacionesEducacion,
        firmaUsuario: this.firmaUsuaria,
        firmaEvaluador: this.firmaVisitante,
        respuestas: respuestasParaAPI
      };

      console.log('Datos completos para enviar:', datosCompletos);

      this.secondaryDialogService.guardarFormularioCompleto(datosCompletos)
        .subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            this.guardandoDatos = false;

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Formulario guardado correctamente en la base de datos',
              key: 'tr-secondary',
              life: 2500,
            });

            setTimeout(() => {
              this.closeDialog();
            }, 1500);
          },
          error: (error) => {
            console.error('Error al guardar:', error);
            this.guardandoDatos = false;

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo guardar el formulario. Intente nuevamente.',
              key: 'tr-secondary',
              life: 4000,
            });
          }
        });

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
    this.cleanupSignaturePads();
    this.visible = false;
    this.dialogClosed.emit();
  }

  get puedeEditar(): boolean {
    return !this.modoSoloLectura && !this.guardandoDatos;
  }

  get textoBotonPrincipal(): string {
    if (this.modoSoloLectura) {
      return 'Cerrar';
    }
    return this.guardandoDatos ? 'Guardando...' : 'Guardar';
  }
}
