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
import { BodyMadreDonante, ResponseMadresDonantes } from '../posibles-donantes-table/interfaces/registro-donante.interface';
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
  datosPrecargados: ResponseMadresDonantes = {} as ResponseMadresDonantes;
  empleadosOpt: empleados[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private _registroDonanteService: RegistroDonanteService
  ) {

    const navigation = this.router.getCurrentNavigation();
    this.datosPrecargados = navigation?.extras?.state?.['personInfo'];

    this.route.paramMap.subscribe((params) => {
      this.documento = params.get('documento');
    });
  }

  ngOnInit() {
    this.loading = true;
    this.precargaDatos();
  }

  precargaDatos() {
    setTimeout(() => {
      this.loading = false
    }, 1000);
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

      const body: BodyMadreDonante = {
        madreDonante: {
          id: this.datosPrecargados.MadreDonante.id,
          recoleccionDomicilio: datosInscripcion.recoleccionDomicilio,
          donanteApta: medicamentos.donanteApta,
          recibioEducacion: medicamentos.recibioEducacion,
          capacitado: datosInscripcion.capcitacion,
          tipoDonante: datosInscripcion.donante_EoI,
          donanteExclusivo: datosInscripcion.donanteExclusiva,
          firmaDonante: medicamentos.firmaDonante,
          firmaProfesional: medicamentos.profesionalResponsable,
          firmaAcompañante: medicamentos.firmaAcompanante,
          madrePotencial: this.datosPrecargados.id,
        },
        infoMadre: {
          id: this.datosPrecargados.infoMadre,
          ciudad: datosInscripcion.ciudad,
          celular: datosInscripcion.celular,
          fechaNacimiento: datosInscripcion.fechaNacimiento?.toISOString().split('T')[0],
          profesion: datosInscripcion.profesion,
          barrio: datosInscripcion.barrio,
          telefono: datosInscripcion.telefono,
          direccion: datosInscripcion.direccion,
          nombre: datosInscripcion.nombre,
          eps: datosInscripcion.eps,
          nombreHijo: datosInscripcion.nombreHijo,
          documento: datosInscripcion.documento,
          departamento: datosInscripcion.departamento,
          fechaParto: historiaGestacion.fechaParto?.toISOString().split('T')[0],
        },
        empleado: {
          id: medicamentos.empleado?.id,
        },
        hijosMadre: [
          {
            nombre: datosInscripcion.nombreHijo,
            peso: datosInscripcion.pesoBebe as string | null,
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
          fechaParto: historiaGestacion.fechaParto?.toISOString().split('T')[0],
        },
        examenPrenatal: {
          hemoglobina: examenesLab.hemoglobina ,
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

      debugger

      this._registroDonanteService
        .postDataRegistroDonante(body as BodyMadreDonante)
        .subscribe({
          next: (response: ApiResponse) => {
            if (response.status === 200) {
              this.saving = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Datos guardados correctamente',
                key: 'tr',
                life: 2500,
              });
            } else {
              throw new Error(response.statusmsg || 'Error al guardar los datos');
            }

            this.router.navigate(['/blh/captacion/registro-donante-blh']);

          },
          error: (error) => {
            throw error;
          },
        });
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
