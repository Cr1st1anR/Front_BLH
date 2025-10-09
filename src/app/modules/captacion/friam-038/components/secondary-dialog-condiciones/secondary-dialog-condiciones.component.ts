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
import type { DatosCompletos } from '../interfaces/datos-completos.interface';
import type { ValidationResult, FormErrors } from '../interfaces/validation.interface';

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
  implements OnChanges, AfterViewInit, OnDestroy {
  @Input() visible: boolean = false;
  @Input() visitaData: any = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild('canvasUsuaria', { static: false })
  canvasUsuariaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasVisitante', { static: false })
  canvasVisitanteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(TableCondicionesComponent)
  tableCondicionesComp!: TableCondicionesComponent;

  // Estados del componente
  loading: boolean = false;
  guardandoDatos: boolean = false;
  modoSoloLectura: boolean = false;
  datosExistentes: any = null;

  // Campos del formulario
  observaciones: string = '';
  recomendacionesEducacion: string = '';
  firmaUsuaria: string = '';
  firmaVisitante: string = '';

  // SignaturePad instances
  private signaturePadUsuaria!: SignaturePad;
  private signaturePadVisitante!: SignaturePad;
  private signaturePadInitialized: boolean = false;

  // Validación
  formErrors: FormErrors = {};

  // Configuración SignaturePad
  private readonly signaturePadConfig = {
    backgroundColor: '#ffffff',
    penColor: '#000000',
    minWidth: 1,
    maxWidth: 3,
    throttle: 16,
    minDistance: 5,
    velocityFilterWeight: 0.7,
    dotSize: 1.5
  };

  // Campos requeridos para validación
  private readonly requiredFields = [
    'observaciones',
    'recomendacionesEducacion',
    'firmaUsuaria',
    'firmaVisitante',
  ];

  constructor(
    private readonly messageService: MessageService,
    private readonly secondaryDialogService: SecondaryDialogCondicionesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) { }

  ngAfterViewInit(): void {
    if (this.visible) {
      setTimeout(() => this.initializeSignaturePadsIfReady(), 300);
    }
  }

  ngOnDestroy(): void {
    this.cleanupSignaturePads();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      this.handleVisibilityChange(changes['visible'].currentValue);
    }
  }

  /**
   * Manejar cambio de visibilidad del diálogo
   */
  private handleVisibilityChange(isVisible: boolean): void {
    if (isVisible) {
      this.openDialog();
    } else {
      this.closeDialog();
    }
  }

  /**
   * Lógica para abrir el diálogo
   */
  private openDialog(): void {
    this.loading = true;
    this.resetFormulario();
    this.signaturePadInitialized = false;

    if (this.visitaData?.id_visita) {
      this.cargarDatosVisita();
    } else {
      this.inicializarNuevaVisita();
    }
  }

  /**
   * Inicializar formulario para nueva visita
   */
  private inicializarNuevaVisita(): void {
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();

      setTimeout(() => this.initializeSignaturePadsIfReady(), 500);

      this.mostrarMensaje('info', 'Nueva visita', 'Complete el formulario para la nueva visita');
    }, 500);
  }

  /**
   * Cargar datos de una visita existente
   */
  private cargarDatosVisita(): void {
    this.secondaryDialogService.getDetallesVisita(this.visitaData.id_visita)
      .subscribe({
        next: (detalles) => {
          this.procesarDatosVisita(detalles);
        },
        error: (error) => {
          this.manejarErrorCargaDatos(error);
        }
      });
  }

  /**
   * Procesar datos de visita recibidos
   */
  private procesarDatosVisita(detalles: any): void {
    if (detalles && detalles.datosVisitaSeguimiento) {
      this.modoSoloLectura = true;
      this.datosExistentes = detalles;
      this.cargarDatosEnFormulario(detalles);

      this.mostrarMensaje('success', 'Datos cargados', 'Visita completada - Modo solo lectura');
    } else {
      this.modoSoloLectura = false;
      this.datosExistentes = null;

      this.mostrarMensaje('info', 'Visita pendiente', 'Complete el formulario para esta visita');
    }

    this.finalizarCargaDatos();
  }

  /**
   * Finalizar proceso de carga de datos
   */
  private finalizarCargaDatos(): void {
    this.loading = false;
    this.cdr.detectChanges();

    setTimeout(() => this.initializeSignaturePadsIfReady(), 300);
  }

  /**
   * Manejar error en carga de datos
   */
  private manejarErrorCargaDatos(error: any): void {
    console.error('Error al cargar datos de visita:', error);
    this.modoSoloLectura = false;
    this.finalizarCargaDatos();

    this.mostrarMensaje('warn', 'Advertencia',
      'No se pudieron cargar datos previos. Puede completar el formulario.');
  }

  /**
   * Inicializar SignaturePads si están listos
   */
  private initializeSignaturePadsIfReady(): void {
    if (this.signaturePadInitialized || this.loading) return;

    if (!this.canvasUsuariaRef?.nativeElement || !this.canvasVisitanteRef?.nativeElement) {
      setTimeout(() => this.initializeSignaturePadsIfReady(), 200);
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.setupSignaturePads();
    });
  }

  /**
   * Configurar SignaturePads
   */
  private setupSignaturePads(): void {
    try {
      this.cleanupSignaturePads();

      const canvasUsuaria = this.canvasUsuariaRef.nativeElement;
      const canvasVisitante = this.canvasVisitanteRef.nativeElement;

      this.setupCanvas(canvasUsuaria);
      this.setupCanvas(canvasVisitante);

      this.signaturePadUsuaria = new SignaturePad(canvasUsuaria, this.signaturePadConfig);
      this.signaturePadVisitante = new SignaturePad(canvasVisitante, this.signaturePadConfig);

      if (!this.modoSoloLectura) {
        this.setupSignaturePadEvents();
      } else {
        this.disableSignaturePads();
      }

      this.signaturePadInitialized = true;
      this.ngZone.run(() => this.loadExistingSignatures());

    } catch (error) {
      console.error('Error al inicializar SignaturePads:', error);
    }
  }

  /**
   * Configurar canvas con resolución adecuada
   */
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
  }

  /**
   * Configurar eventos de SignaturePad
   */
  private setupSignaturePadEvents(): void {
    this.signaturePadUsuaria.addEventListener('endStroke', () => {
      this.ngZone.run(() => {
        this.firmaUsuaria = this.signaturePadUsuaria.toDataURL();
        this.onFieldChange('firmaUsuaria', this.firmaUsuaria);
      });
    });

    this.signaturePadVisitante.addEventListener('endStroke', () => {
      this.ngZone.run(() => {
        this.firmaVisitante = this.signaturePadVisitante.toDataURL();
        this.onFieldChange('firmaVisitante', this.firmaVisitante);
      });
    });
  }

  /**
   * Deshabilitar SignaturePads para modo solo lectura
   */
  private disableSignaturePads(): void {
    this.signaturePadUsuaria.off();
    this.signaturePadVisitante.off();
  }

  /**
   * Cargar firmas existentes en los SignaturePads
   */
  private loadExistingSignatures(): void {
    if (this.firmaUsuaria && this.signaturePadUsuaria) {
      try {
        this.signaturePadUsuaria.fromDataURL(this.firmaUsuaria);
      } catch (error) {
        console.error('Error al cargar firma usuaria:', error);
      }
    }

    if (this.firmaVisitante && this.signaturePadVisitante) {
      try {
        this.signaturePadVisitante.fromDataURL(this.firmaVisitante);
      } catch (error) {
        console.error('Error al cargar firma visitante:', error);
      }
    }
  }

  /**
   * Cargar datos existentes en el formulario
   */
  private cargarDatosEnFormulario(detalles: any): void {
    const datos = detalles.datosVisitaSeguimiento;
    this.observaciones = datos.observaciones || '';
    this.recomendacionesEducacion = datos.recomendaciones || '';

    if (datos.firmaUsuario) {
      this.firmaUsuaria = datos.firmaUsuario;
    }

    if (datos.firmaEvaluador) {
      this.firmaVisitante = datos.firmaEvaluador;
    }

    // Cargar respuestas en el componente de tabla
    if (detalles.respuestas && detalles.respuestas.length > 0) {
      setTimeout(() => {
        this.cargarRespuestasExistentes(detalles.respuestas);
      }, 200);
    }

    // Forzar carga de firmas después de inicializar SignaturePads
    this.programarCargaFirmas();
  }

  /**
   * Programar carga de firmas con reintentos
   */
  private programarCargaFirmas(): void {
    setTimeout(() => {
      if (this.signaturePadInitialized) {
        this.loadExistingSignatures();
      } else {
        const interval = setInterval(() => {
          if (this.signaturePadInitialized) {
            this.loadExistingSignatures();
            clearInterval(interval);
          }
        }, 100);

        // Timeout de seguridad
        setTimeout(() => clearInterval(interval), 3000);
      }
    }, 500);
  }

  /**
   * Cargar respuestas existentes en la tabla
   */
  private cargarRespuestasExistentes(respuestas: any[]): void {
    if (!this.tableCondicionesComp) return;

    const respuestasMap = new Map<number, number | null>();
    respuestas.forEach(resp => {
      const preguntaId = typeof resp.pregunta === 'object' ? resp.pregunta.id : resp.pregunta;
      respuestasMap.set(preguntaId, resp.respuesta);
    });

    this.tableCondicionesComp.cargarRespuestasExistentes(respuestasMap);
  }

  /**
   * Limpiar SignaturePads
   */
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
    } catch (error) {
      console.error('Error al limpiar SignaturePads:', error);
    }
  }

  /**
   * Resetear formulario a estado inicial
   */
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

  /**
   * Validar campo individual
   */
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

  /**
   * Manejar cambio en campo del formulario
   */
  onFieldChange(fieldName: string, value: any): void {
    if (this.modoSoloLectura) return;

    const error = this.validateField(fieldName, value);
    if (error) {
      this.formErrors[fieldName] = error;
    } else {
      delete this.formErrors[fieldName];
    }
  }

  /**
   * Validar formulario completo
   */
  validateForm(): boolean {
    if (this.modoSoloLectura) return true;

    this.formErrors = {};
    let isValid = true;

    this.requiredFields.forEach((field) => {
      const value = (this as any)[field];
      const error = this.validateField(field, value);
      if (error) {
        this.formErrors[field] = error;
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Validar condiciones de la tabla
   */
  validateCondiciones(): ValidationResult {
    if (this.modoSoloLectura) return { isValid: true, message: '' };

    const condicionesData = this.tableCondicionesComp.getCondicionesData();
    const condicionesSinResponder = condicionesData.filter(
      (c) => c.respuesta === undefined
    );

    if (condicionesSinResponder.length > 0) {
      return {
        isValid: false,
        message: `Faltan ${condicionesSinResponder.length} condiciones por evaluar`,
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Limpiar firma usuaria
   */
  clearFirmaUsuaria(): void {
    if (this.modoSoloLectura || !this.signaturePadUsuaria) return;

    this.signaturePadUsuaria.clear();
    this.firmaUsuaria = '';
    this.onFieldChange('firmaUsuaria', this.firmaUsuaria);
  }

  /**
   * Limpiar firma visitante
   */
  clearFirmaVisitante(): void {
    if (this.modoSoloLectura || !this.signaturePadVisitante) return;

    this.signaturePadVisitante.clear();
    this.firmaVisitante = '';
    this.onFieldChange('firmaVisitante', this.firmaVisitante);
  }

  /**
   * Guardar formulario completo
   */
  onGuardar(): void {
    if (this.modoSoloLectura) {
      this.mostrarMensaje('info', 'Información',
        'Esta visita ya está completada y no se puede modificar');
      return;
    }

    const formValid = this.validateForm();
    const condicionesValidation = this.validateCondiciones();

    if (formValid && condicionesValidation.isValid) {
      this.procesarGuardado();
    } else {
      this.mostrarErroresValidacion(formValid, condicionesValidation);
    }
  }

  /**
   * Procesar guardado de datos
   */
  private procesarGuardado(): void {
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

    this.secondaryDialogService.guardarFormularioCompleto(datosCompletos)
      .subscribe({
        next: (response) => {
          this.manejarExitoGuardado();
        },
        error: (error) => {
          this.manejarErrorGuardado(error);
        }
      });
  }

  /**
   * Manejar éxito en guardado
   */
  private manejarExitoGuardado(): void {
    this.guardandoDatos = false;

    this.mostrarMensaje('success', 'Éxito',
      'Formulario guardado correctamente en la base de datos');

    setTimeout(() => this.closeDialog(), 1500);
  }

  /**
   * Manejar error en guardado
   */
  private manejarErrorGuardado(error: any): void {
    console.error('Error al guardar:', error);
    this.guardandoDatos = false;

    this.mostrarMensaje('error', 'Error',
      'No se pudo guardar el formulario. Intente nuevamente.');
  }

  /**
   * Mostrar errores de validación
   */
  private mostrarErroresValidacion(formValid: boolean, condicionesValidation: ValidationResult): void {
    let errorMessage = 'Por favor, corrija los siguientes errores:\n';

    if (!formValid) {
      errorMessage += '• Complete todos los campos obligatorios\n';
    }

    if (!condicionesValidation.isValid) {
      errorMessage += `• ${condicionesValidation.message}`;
    }

    this.mostrarMensaje('error', 'Error de validación', errorMessage);
  }

  /**
   * Mostrar mensaje toast
   */
  private mostrarMensaje(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      key: 'tr-secondary',
      life: severity === 'error' ? 4000 : 2500,
    });
  }

  /**
   * Cerrar diálogo
   */
  closeDialog(): void {
    this.cleanupSignaturePads();
    this.visible = false;
    this.dialogClosed.emit();
  }

  // Getters para el template
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
