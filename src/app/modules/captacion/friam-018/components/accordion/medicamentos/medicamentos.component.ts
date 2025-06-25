import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import SignaturePad from 'signature_pad';
import type { MedicamentosData } from '../interfaces/medicamentos.interface';

@Component({
  selector: 'medicamentos',
  imports: [
    FormsModule,
    AccordionModule,
    Checkbox,
    InputTextModule,
    RadioButton,
  ],
  templateUrl: './medicamentos.component.html',
  styleUrl: './medicamentos.component.scss',
})
export class MedicamentosComponent implements MedicamentosData, AfterViewInit {
  medicamentos: string = '';
  ningunMedicamento: boolean = false;
  psicoactivos: string = '';
  recibioEducacion: string = '';
  responsableRegistro: string = '';
  firmaAcompanante: string = '';
  donanteApta: number = 0;
  firmaDonante: string = '';
  profesionalResponsable: string = '';

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
    };
  }

  @ViewChild('canvasAcompanante', { static: true })
  canvasAcompananteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasDonante', { static: true })
  canvasDonanteRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasProfesional', { static: true })
  canvasProfesionalRef!: ElementRef<HTMLCanvasElement>;

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
