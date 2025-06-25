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
  providers: [MessageService],
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.documento = params.get('documento');
      // console.log('Documento recibido:', this.documento);
    });
  }

  ngOnInit() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1500);
  }

  onCancelar() {
    this.router.navigate(['/blh/captacion/registro-donante-blh']);
  }

  onLoadData() {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Datos guardados correctamente',
        key: 'tr',
        life: 2500,
      });
    }, 1500);

    const datosInscripcion = this.datosInscripcionComp.getFormData();
    const historiaGestacion = this.historiaGestacionComp.getFormData();
    const examenesLab = this.examenesLabComp.getFormData();
    const medicamentos = this.medicamentosComp.getFormData();

    const datosCompletos = {
      datosInscripcion,
      historiaGestacion,
      examenesLab,
      medicamentos,
    };

    console.log('Datos completos del formulario:', datosCompletos);
  }
}
