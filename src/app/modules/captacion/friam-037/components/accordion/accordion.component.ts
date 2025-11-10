import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { FormsModule } from '@angular/forms';
import { DescripcionSituacionComponent } from './descripcion-situacion/descripcion-situacion.component';
import { EvaluarLactanciaComponent } from './evaluar-lactancia/evaluar-lactancia.component';
import { DatosAdicionalesComponent } from './datos-adicionales/datos-adicionales.component';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { VisitaDomiciliariaService } from '../visita-domiciliaria-table/services/visita-domiciliaria.service';
import { concatMap, Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../../../friam-041/components/table-list/interfaces/linea-amiga.interface';
import { BodyRespuestasVisita, CategoriasResponse, PreguntasResponse, RespuestasVisita } from './interfaces/descripcion-situacion.interface';
import { BodyVisita } from './interfaces/descripcion-situacion.interface';

@Component({
  selector: 'accordion-visita',
  imports: [
    AccordionModule,
    HeaderComponent,
    FormsModule,
    DescripcionSituacionComponent,
    EvaluarLactanciaComponent,
    DatosAdicionalesComponent,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  providers: [MessageService],
})
export class AccordionComponent implements OnInit, OnDestroy {

  idVisita: string | null = null
  documento: string | null = null;
  loading: boolean = false;
  saving: boolean = false;
  preguntas: PreguntasResponse[] = [];
  categorias: CategoriasResponse[] = [];
  dataVisitaMadre: any | null = null;
  respuestasDescripcion: PreguntasResponse[][] = []
  private hasUnsavedChanges: boolean = true;
  isReadOnlyMode: boolean = false;

  @ViewChild(DescripcionSituacionComponent)
  descripcionSituacionComp!: DescripcionSituacionComponent;
  @ViewChild(EvaluarLactanciaComponent)
  evaluarLactanciaComp!: EvaluarLactanciaComponent;
  @ViewChild(DatosAdicionalesComponent)
  datosAdicionalesComp!: DatosAdicionalesComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private _vistaServices: VisitaDomiciliariaService
  ) { }

  ngOnInit() {
    history.pushState(null, '', window.location.href);
    this.idVisita = this.route.snapshot.paramMap.get('documento');
    this.loading = true;

    of(null).pipe(
      concatMap(() => this.loadDataVisitasMadres()),
      concatMap(() => this.loadPreguntas()),
      concatMap(() => this.loadCategoriasPreguntas())
    ).subscribe({
      complete: () => {
        setTimeout(() => {
          this.loading = false;
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en la secuencia de peticiones', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la data de las casas de visita.' });
      }
    });
  }

  ngOnDestroy(): void {
    this.hasUnsavedChanges = false;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges && !this.isReadOnlyMode) {
      $event.preventDefault();
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent): void {
    if (this.hasUnsavedChanges && !this.isReadOnlyMode) {
      const confirmLeave = confirm('Si abandona esta página, la información llenada se perderá. ¿Está seguro de que desea continuar?');
      if (confirmLeave) {
        this.hasUnsavedChanges = false;
        window.location.href = '/blh/captacion/visita-domiciliaria';
      } else {
        history.pushState(null, '', window.location.href);
      }
    }
  }

  loadDataVisitasMadres(): Observable<ApiResponse> {
    this.saving = true;
    return this._vistaServices.getVisitaMadre(this.idVisita!).pipe(
      tap((data) => {
        if (data && data.data) {
          setTimeout(() => {
            this.loading = false;
            this.saving = false;
            this.respuestasDescripcion = this.formatData(data.data);
            this.dataVisitaMadre = data.data;

            this.isReadOnlyMode = this.isVisitaCompleta(data.data);

            if (this.isReadOnlyMode) {
              this.hasUnsavedChanges = false;
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Datos cargados correctamente',
              key: 'tr',
              life: 1000,
            });
          }, 1000);
        } else {
          this.loading = false;
          this.saving = false;
          this.dataVisitaMadre = null;
        }
      })
    );
  }

  private isVisitaCompleta(visitaData: any): boolean {
    const respuestasCompletas = Array.isArray(visitaData.respuestas) && visitaData.respuestas.length >= 16;
    const evaluacionCompleta = !!visitaData.evaluacionLactancia;
    const datosAdicionalesCompletos = !!(visitaData.observaciones &&
      visitaData.recomendaciones &&
      visitaData.donante_efectiva !== null &&
      visitaData.firmaUsuario &&
      visitaData.firmaEvaluador);

    return respuestasCompletas && evaluacionCompleta && datosAdicionalesCompletos;
  }

  loadPreguntas(): Observable<ApiResponse> {
    return this._vistaServices.getPreguntas().pipe(
      tap((data) => {
        if (data && data.data.length > 0) {
          this.preguntas = data.data;
        } else {

        }
      })
    );
  }

  loadCategoriasPreguntas(): Observable<ApiResponse> {
    return this._vistaServices.getCategorias().pipe(
      tap((data) => {
        if (data && data.data.length > 0) {
          this.categorias = data.data;
        } else {

        }
      })
    );
  }

  formatData(data: any): PreguntasResponse[][] {
    const dataAux = data.respuestas || [];
    const agrupado: PreguntasResponse[][] = Object.values(
      dataAux.reduce((acc: any, item: any) => {
        const idClasificacion = item.pregunta.clasificacion.id;
        if (!acc[idClasificacion]) {
          acc[idClasificacion] = [];
        }
        acc[idClasificacion].push(item);
        return acc;
      }, {})
    );
    return agrupado;
  }

  onCancelar() {
    if (!this.isReadOnlyMode) {
      const confirmCancel = confirm('Si cancela, la información llenada se perderá. ¿Está seguro de que desea continuar?');
      if (confirmCancel) {
        this.hasUnsavedChanges = false;
        this.router.navigate(['/blh/captacion/visita-domiciliaria']);
      }
    } else {
      this.router.navigate(['/blh/captacion/visita-domiciliaria']);
    }
  }

  onLoadData() {
    try {
      const descripcionSituacion = this.descripcionSituacionComp.getFormData();
      // Validar y obtener datos de evaluar lactancia
      const evaluarLactancia = this.evaluarLactanciaComp.getFormData();

      // Validar y obtener datos adicionales
      const datosAdicionales = this.datosAdicionalesComp.getFormData();

      // Si llegamos aquí, todas las validaciones pasaron
      const bodyVisita: BodyVisita = {
        observaciones: datosAdicionales.observacionesVisita || '',
        recomendaciones: datosAdicionales.recomendaciones || '',
        donante_efectiva: datosAdicionales.donanteEfectiva || 0,
        firmaUsuario: datosAdicionales.firmaUsuaria || '',
        firmaEvaluador: datosAdicionales.firmaVisita || '',
        madrePotencial: {
          id: parseInt(this.idVisita!)
        },
        evaluacionLactancia: evaluarLactancia
      };

      this.saveVisitaMadre(bodyVisita).pipe(
        concatMap((dataResponse) =>
          this.saveRespuestasDescripcion(dataResponse, descripcionSituacion)
        )
      ).subscribe({
        next: () => {
          this.hasUnsavedChanges = false;
          setTimeout(() => {
            this.router.navigate(['/blh/captacion/visita-domiciliaria']);
          }, 2000);
        },
        error: (err) => console.error('Error en cadena:', err)
      });


    } catch (error: any) {
      // Mostrar errores de validación
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: error.message,
        key: 'tr',
        life: 5000,
      });

      console.warn('Errores de validación:', error.message);
    }
  }

  // Método adicional para validar individualmente cada componente
  validateAllSections(): { isValid: boolean; errors: string[] } {
    const allErrors: string[] = [];

    try {
      // Validar evaluar lactancia
      const lactanciaValidation = this.evaluarLactanciaComp.validateForm();
      if (!lactanciaValidation.isValid) {
        allErrors.push(...lactanciaValidation.errors.map(err => `Evaluar Lactancia: ${err}`));
      }
    } catch (error: any) {
      allErrors.push(`Evaluar Lactancia: Error de validación`);
    }

    try {
      // Validar datos adicionales
      const datosValidation = this.datosAdicionalesComp.validateForm();
      if (!datosValidation.isValid) {
        allErrors.push(...datosValidation.errors.map(err => `Datos Adicionales: ${err}`));
      }
    } catch (error: any) {
      allErrors.push(`Datos Adicionales: Error de validación`);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  saveVisitaMadre(body: BodyVisita): Observable<ApiResponse> {
    this.saving = true;

    return this._vistaServices.postDataVisitaMadres(body).pipe(
      tap({
        next: () => {
          this.saving = false;
        },
        error: (error) => {
          this.saving = false;
          console.error('Error al guardar la visita:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar la visita. Inténtalo nuevamente.',
            key: 'tr',
            life: 3000,
          });
        }
      })
    );
  }

  saveRespuestasDescripcion(dataResponse: any, dataBody: BodyRespuestasVisita[]): Observable<ApiResponse> {
    dataBody.map(x => {
      x.visitaMadre = dataResponse.data.id;
    });

    return this._vistaServices.postRespuestasVisita(dataBody).pipe(
      tap({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Visita guardada correctamente',
            key: 'tr',
            life: 3000,
          });
          this.saving = false;
        },
        error: (error) => {
          console.error('Error al guardar las respuestas de la descripción:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron guardar las respuestas de la descripción. Inténtalo nuevamente.',
            key: 'tr',
            life: 3000,
          });
        }
      })
    );
  }


}
