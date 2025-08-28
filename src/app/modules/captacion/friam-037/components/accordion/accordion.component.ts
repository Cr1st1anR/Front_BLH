import { Component, Input, input, ViewChild } from '@angular/core';
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
import { CategoriasResponse, PreguntasResponse, RespuestasVisita } from './interfaces/descripcion-situacion.interface';

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
export class AccordionComponent {

  idVisita: string | null = null
  documento: string | null = null;
  loading: boolean = false;
  saving: boolean = false;
  preguntas: PreguntasResponse[] = [];
  categorias: CategoriasResponse[] = [];
  dataVisitaMadre: any | null = null;

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

  loadDataVisitasMadres(): Observable<ApiResponse> {
    this.saving = true;

    return this._vistaServices.getVisitaMadre(this.idVisita!).pipe(
      tap((data) => {
        if (data) {
          setTimeout(() => {
            this.loading = false;
            this.saving = false;
            this.dataVisitaMadre = data.data;
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Datos guardados correctamente',
              key: 'tr',
              life: 1000,
            });
          }, 1000);
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos de madres donantes disponibles',
            key: 'tr',
            life: 3000
          });
          this.loading = false;
          this.saving = false;
        }

      })
    );

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

  onCancelar() {
    this.router.navigate(['/blh/captacion/visita-domiciliaria']);
  }

  onLoadData() {
    // const descripcionSituacion = this.descripcionSituacionComp.getFormData();
    // const evaluarLactancia = this.evaluarLactanciaComp.getFormData();
    // const datosAdicionales = this.datosAdicionalesComp.getFormData();

    // const datosCompletos = {
    //   descripcionSituacion,
    //   evaluarLactancia,
    //   datosAdicionales,
    // };

    // console.log('Datos completos del formulario:', datosCompletos);
  }
}
