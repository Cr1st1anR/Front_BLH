import { Component, ViewChild, OnInit } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { MedicamentosComponent } from './medicamentos/medicamentos.component';
import { ExamenesLaboratorioComponent } from './examenes-laboratorio/examenes-laboratorio.component';
import { HistoriaGestacionComponent } from './historia-gestacion/historia-gestacion.component';
import { DatosInscripcionComponent } from './datos-inscripcion/datos-inscripcion.component';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RegistroDonanteData } from '../posibles-donantes-table/interfaces/registro-donante.interface';
import { RegistroDonanteService } from '../posibles-donantes-table/services/registro-donante.service';
import { concatMap, Observable, of, tap } from 'rxjs';
import {
  ApiResponse,
  empleados,
} from '../../../friam-041/components/table-list/interfaces/linea-amiga.interface';

@Component({
  selector: 'accordion-registro',
  imports: [
    CommonModule,
    AccordionModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    DatePickerModule,
    FluidModule,
    MedicamentosComponent,
    ExamenesLaboratorioComponent,
    HistoriaGestacionComponent,
    DatosInscripcionComponent,
    HeaderComponent,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  providers: [MessageService, RegistroDonanteService],
})
export class AccordionComponent implements OnInit {
  loading: boolean = false;
  saving: boolean = false;

  @ViewChild(DatosInscripcionComponent)
  datosInscripcionComp!: DatosInscripcionComponent;
  @ViewChild(HistoriaGestacionComponent)
  historiaGestacionComp!: HistoriaGestacionComponent;
  @ViewChild(ExamenesLaboratorioComponent)
  examenesLabComp!: ExamenesLaboratorioComponent;
  @ViewChild(MedicamentosComponent) medicamentosComp!: MedicamentosComponent;

  documento: string | null = null;
  datosPrecargados: RegistroDonanteData = {} as RegistroDonanteData;
  empleadosOpt: empleados[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private _registroDonanteService: RegistroDonanteService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.documento = params.get('documento');
    });
  }

  ngOnInit() {
    this.loading = true;
    of(null)
      .pipe(concatMap(() => this.loadDataEmpleados()))
      .subscribe({
        complete: () => {
          setTimeout(() => {
            this.precargaDatos();
            this.loading = false;
          }, 1200);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en la secuencia de peticiones', err);
        },
      });
  }

  precargaDatos() {
    const personaData = localStorage.getItem('personInfo');
    this.datosPrecargados = personaData
      ? (JSON.parse(personaData) as RegistroDonanteData)
      : ({} as RegistroDonanteData);
    setTimeout(() => {
      this.loading = false;
    }, 1500);
  }

  loadDataEmpleados(): Observable<ApiResponse | null> {
    return this._registroDonanteService.getDataEmpleados().pipe(
      tap((response) => {
        this.empleadosOpt = [];
        if (response && response.data.length > 0) {
          this.empleadosOpt = response.data;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados correctamente',
            key: 'tr',
            life: 2000,
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para mostrar',
            key: 'tr',
            life: 2000,
          });
        }
      })
    );
  }

  onCancelar() {
    this.router.navigate(['/blh/captacion/registro-donante-blh']);
  }

  onLoadData() {
    this.saving = true;

    try {
      const datosInscripcion = this.datosInscripcionComp.getFormData();
      const historiaGestacion = this.historiaGestacionComp.getFormData();
      const examenesLab = this.examenesLabComp.getFormData();
      const medicamentos = this.medicamentosComp.getFormData();

      const body = {
        donanteExclusivo: datosInscripcion.donanteExclusiva,
        tipoDonante: datosInscripcion.donante_EoI,
        recoleccionDomicilio: datosInscripcion.recoleccionDomicilio,
        capacitado: datosInscripcion.capcitacion,
        donanteApta: medicamentos.donanteApta,
        firmaDonante: medicamentos.firmaDonante,
        firmaProfesional: medicamentos.profesionalResponsable,
        firmaAcompañante: medicamentos.firmaAcompanante,
        recibioEducacion: medicamentos.recibioEducacion,
        madrePotencial: {
          id: this.datosPrecargados.idMadrePotencial,
        },
        empleado: {
          id: medicamentos.empleado?.id,
        },
        hijosMadre: [
          {
            nombre: datosInscripcion.nombreHijo,
            peso: datosInscripcion.pesoBebe,
          },
        ],
        gestacion: {
          lugarControlPrenatal: historiaGestacion.lugarControlPrenatal,
          asistioControlPrenatal: historiaGestacion.asistioControl,
          tipoIps: historiaGestacion.tipoIPS,
          pesoGestacionInicial: historiaGestacion.pesoInicial,
          pesoGestacionFinal: historiaGestacion.pesoFinal,
          talla: historiaGestacion.talla,
          partoTermino: historiaGestacion.tipoParto === 'termino' ? 1 : 0,
          preTermino: historiaGestacion.tipoParto === 'pretermino' ? 1 : 0,
          semanas: parseInt(String(historiaGestacion.semanasGestacion)),
          fechaParto: historiaGestacion.fechaParto?.toString().split('T')[0],
        },
        examenPrenatal: {
          hemoglobina: examenesLab.hemoglobina,
          hematocrito: examenesLab.hematocrito,
          transfuciones: examenesLab.transfusiones,
          enfermedadesGestacion: examenesLab.enfermedadesGestacion,
          fuma: examenesLab.fuma,
          alcohol: examenesLab.alcohol,
        },
        medicamento: {
          medicamento: medicamentos.medicamentos,
          psicoactivos: medicamentos.psicoactivos,
        },
      };

      console.log('Datos completos del formulario:', body);

      setTimeout(() => {
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Datos guardados correctamente',
          key: 'tr',
          life: 2500,
        });

      setTimeout(() => {
        this.router.navigate(['/blh/captacion/registro-donante-blh']);
      }, 2500);

      }, 1500);
    } catch (error) {
      this.saving = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          error instanceof Error
            ? error.message
            : 'Error al validar el formulario',
        key: 'tr',
        life: 3000,
      });
    }
  }
}
