import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import SignaturePad from 'signature_pad';
import type { DatosAdicionalesData } from '../interfaces/datos-adicionales.interface';
import { RespuestasVisita } from '../interfaces/descripcion-situacion.interface';

@Component({
  selector: 'datos-adicionales',
  standalone: true,
  imports: [FormsModule, AccordionModule, InputTextModule, RadioButton],
  templateUrl: './datos-adicionales.component.html',
  styleUrl: './datos-adicionales.component.scss',
})
export class DatosAdicionalesComponent implements AfterViewInit, DatosAdicionalesData, OnChanges, OnInit {

  @Input() data: RespuestasVisita | null = null;
  @ViewChild('canvasUsuaria', { static: true })
  canvasUsuariaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasVisita', { static: true })
  canvasVisitaRef!: ElementRef<HTMLCanvasElement>;
  private signaturePadUsuaria!: SignaturePad;
  private signaturePadVisita!: SignaturePad;

  dataForm: RespuestasVisita | null = null;
  observacionesVisita: string = '';
  recomendaciones: string = '';
  donanteEfectiva: number | null = null;
  firmaUsuaria: string = '';
  firmaVisita: string = '';
  mostrar: boolean = false;

  ngOnInit(): void {
    this.signaturePadUsuaria = new SignaturePad(
      this.canvasUsuariaRef.nativeElement,
      {
        backgroundColor: '#fff',
      }
    );
    this.signaturePadUsuaria.addEventListener('endStroke', () => {
      this.firmaUsuaria = this.signaturePadUsuaria.toDataURL();
      // this.onFieldChange('firmaUsuaria', this.firmaUsuaria);
    });
    this.signaturePadVisita = new SignaturePad(
      this.canvasVisitaRef.nativeElement,
      {
        backgroundColor: '#fff',
      }
    );
    this.signaturePadVisita.addEventListener('endStroke', () => {
      this.firmaVisita = this.signaturePadVisita.toDataURL();
      // this.onFieldChange('firmaVisita', this.firmaVisita);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'].currentValue != null) {
      this.formatForm();
      this.mostrar = true
    }
  }
  ngAfterViewInit() {
  }

  formatForm() {
    this.dataForm = this.data;
    this.recomendaciones = this.data!.recomendaciones;
    this.observacionesVisita = this.data!.observaciones;
    this.donanteEfectiva = this.data!.donante_efectiva;
    this.mostrarFirma(this.data!.firmaEvaluador, 'evaluador');
    this.mostrarFirma(this.data!.firmaUsuario, 'usuario');

  }

  getFormData() {
    return {
      observacionesVisita: this.observacionesVisita || '',
      recomendaciones: this.recomendaciones || '',
      donanteEfectiva: this.donanteEfectiva || 0,
      firmaUsuaria: this.firmaUsuaria || '',
      firmaVisita: this.firmaVisita || '',
    };
  }

  clearFirmaUsuaria() {
    this.signaturePadUsuaria.clear();
    this.firmaUsuaria = '';
  }

  clearFirmaVisita() {
    this.signaturePadVisita.clear();
    this.firmaVisita = '';
  }

  mostrarFirma(firmaBase64: string, opt: string) {
    if (firmaBase64 && firmaBase64.length > 0) {
      switch (opt) {
        case 'evaluador':
          this.signaturePadUsuaria.fromDataURL(firmaBase64);
          break;
        case 'usuario':
          this.signaturePadVisita.fromDataURL(firmaBase64);
          break;

      }
    }
  }

  // onFieldChange(fieldName: string, value: any): void {
  //   const error = this.validateField(fieldName, value);
  //   if (error) {
  //     this.formErrors[fieldName] = error;
  //   } else {
  //     delete this.formErrors[fieldName];
  //   }
  // }
}
