import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import type { MedicamentosData } from '../interfaces/medicamentos.interface';

@Component({
  selector: 'medicamentos',
  imports: [FormsModule, AccordionModule, Checkbox, InputTextModule, RadioButton],
  templateUrl: './medicamentos.component.html',
  styleUrl: './medicamentos.component.scss',
})
export class MedicamentosComponent implements MedicamentosData {
  medicamentos: string = '';
  ningunMedicamento: boolean = false;
  psicoactivos: string = '';
  recibioEducacion: string = '';
  responsableRegistro: string = '';
  firmaAcompanante: string = '';
  donanteApta: string = '';
  firmaDonante: string = '';
  profesionalResponsable: string = '';
}
