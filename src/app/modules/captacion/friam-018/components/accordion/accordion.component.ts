import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { MedicamentosComponent } from './medicamentos/medicamentos.component';
import { ExamenesLaboratorioComponent } from './examenes-laboratorio/examenes-laboratorio.component';
import { HistoriaGestacionComponent } from './historia-gestacion/historia-gestacion.component';
import { DatosInscripcionComponent } from './datos-inscripcion/datos-inscripcion.component';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'accordion',
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
  ],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {
  documento: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      this.documento = params.get('documento');
      //console.log('Documento:', this.documento);
    });
  }
}
