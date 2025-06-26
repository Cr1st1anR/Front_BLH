import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import SignaturePad from 'signature_pad';
import type { DatosAdicionalesData } from '../interfaces/datos-adicionales.interface';

@Component({
  selector: 'datos-adicionales',
  standalone: true,
  imports: [FormsModule, AccordionModule, InputTextModule, RadioButton],
  templateUrl: './datos-adicionales.component.html',
  styleUrl: './datos-adicionales.component.scss',
})
export class DatosAdicionalesComponent implements AfterViewInit, DatosAdicionalesData {
  observacionesVisita: string = '';
  recomendaciones: string = '';
  // donanteEfectiva: number = 0;
  donanteEfectiva: number | null = null; 
  firmaUsuaria: string = '';
  firmaVisita: string = '';

  getFormData() {
    return {
      observacionesVisita: this.observacionesVisita,
      recomendaciones: this.recomendaciones,
      donanteEfectiva: this.donanteEfectiva,
      firmaUsuaria: this.firmaUsuaria,
      firmaVisita: this.firmaVisita,
    };
  }

  @ViewChild('canvasUsuaria', { static: true })
  canvasUsuariaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasVisita', { static: true })
  canvasVisitaRef!: ElementRef<HTMLCanvasElement>;

  private signaturePadUsuaria!: SignaturePad;
  private signaturePadVisita!: SignaturePad;

  ngAfterViewInit() {
    this.signaturePadUsuaria = new SignaturePad(
      this.canvasUsuariaRef.nativeElement,
      {
        backgroundColor: '#fff',
      }
    );
    this.signaturePadUsuaria.addEventListener('endStroke', () => {
      this.firmaUsuaria = this.signaturePadUsuaria.toDataURL();
    });

    this.signaturePadVisita = new SignaturePad(
      this.canvasVisitaRef.nativeElement,
      {
        backgroundColor: '#fff',
      }
    );
    this.signaturePadVisita.addEventListener('endStroke', () => {
      this.firmaVisita = this.signaturePadVisita.toDataURL();
    });
  }

  clearFirmaUsuaria() {
    this.signaturePadUsuaria.clear();
    this.firmaUsuaria = '';
  }

  clearFirmaVisita() {
    this.signaturePadVisita.clear();
    this.firmaVisita = '';
  }
}
