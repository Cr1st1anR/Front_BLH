import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { MedicamentosComponent } from "./medicamentos/medicamentos.component";
import { ExamenesLaboratorioComponent } from "./examenes-laboratorio/examenes-laboratorio.component";
import { HistoriaGestacionComponent } from "./historia-gestacion/historia-gestacion.component";
import { DatosInscripcionComponent } from "./datos-inscripcion/datos-inscripcion.component";


@Component({
  selector: 'accordion',
  imports: [
    CommonModule,
    AccordionModule,
    HeaderComponent,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    DatePickerModule,
    FluidModule,
    MedicamentosComponent,
    ExamenesLaboratorioComponent,
    HistoriaGestacionComponent,
    DatosInscripcionComponent
],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {}
