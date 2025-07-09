import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import SignaturePad from 'signature_pad';
import type { MedicamentosData } from '../interfaces/medicamentos.interface';
import { empleados } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'medicamentos',
  imports: [
    FormsModule,
    AccordionModule,
    Checkbox,
    InputTextModule,
    RadioButton,
    SelectModule
  ],
  templateUrl: './medicamentos.component.html',
  styleUrl: './medicamentos.component.scss',
})
export class MedicamentosComponent implements MedicamentosData, AfterViewInit, OnChanges {

  @Input() empleadosOpt!: empleados[];
  @ViewChild('canvasAcompanante', { static: true })
  canvasAcompananteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasDonante', { static: true })
  canvasDonanteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasProfesional', { static: true })
  canvasProfesionalRef!: ElementRef<HTMLCanvasElement>;
  medicamentos: string = '';
  ningunMedicamento: boolean = false;
  psicoactivos: string = '';
  recibioEducacion: string = '';
  responsableRegistro: string = '';
  firmaAcompanante: string = '';
  donanteApta: number | null = null;
  firmaDonante: string = '';
  profesionalResponsable: string = '';
  selectedEmpleado: empleados | null = null;
  private signaturePadAcompanante!: SignaturePad;
  private signaturePadDonante!: SignaturePad;
  private signaturePadProfesional!: SignaturePad;

  ngAfterViewInit() {
    this.signaturePadAcompanante = new SignaturePad(
      this.canvasAcompananteRef.nativeElement,
      { backgroundColor: '#fff' }
    );
    this.signaturePadAcompanante.addEventListener('endStroke', () => {
      this.firmaAcompanante = this.signaturePadAcompanante.toDataURL();
    });

    this.signaturePadDonante = new SignaturePad(
      this.canvasDonanteRef.nativeElement,
      { backgroundColor: '#fff' }
    );
    this.signaturePadDonante.addEventListener('endStroke', () => {
      this.firmaDonante = this.signaturePadDonante.toDataURL();
    });

    this.signaturePadProfesional = new SignaturePad(
      this.canvasProfesionalRef.nativeElement,
      { backgroundColor: '#fff' }
    );
    this.signaturePadProfesional.addEventListener('endStroke', () => {
      this.profesionalResponsable = this.signaturePadProfesional.toDataURL();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['empleadosOpt'] && changes['empleadosOpt'].currentValue.length > 0) {
      this.empleadosOpt = changes['empleadosOpt'].currentValue;
    }
  }
  getFormData() {
    return {
      medicamentos: this.medicamentos,
      ningunMedicamento: this.ningunMedicamento,
      psicoactivos: this.psicoactivos,
      recibioEducacion: this.recibioEducacion,
      responsableRegistro: this.responsableRegistro,
      firmaAcompanante: this.firmaAcompanante,
      donanteApta: this.donanteApta,
      firmaDonante: this.firmaDonante,
      profesionalResponsable: this.profesionalResponsable,
      empleado: this.selectedEmpleado
    };
  }

  clearFirmaAcompanante() {
    this.signaturePadAcompanante.clear();
    this.firmaAcompanante = '';
  }

  clearFirmaDonante() {
    this.signaturePadDonante.clear();
    this.firmaDonante = '';
  }

  clearFirmaProfesional() {
    this.signaturePadProfesional.clear();
    this.profesionalResponsable = '';
  }
}
