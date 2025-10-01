import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pdf-friam-037',
  imports: [CommonModule],
  templateUrl: './pdf-friam-037.component.html',
  styleUrl: './pdf-friam-037.component.scss',
})
export class PdfFriam037Component {
  @Input() datosPersonales: any;
  @Input() preguntasCondicionesFisicas: any[] = [];
  @Input() preguntasCondicionesPersonales: any[] = [];
  @Input() evaluacionLactancia: any;
  @Input() datosAdicionales: any;
  @Input() fechaVisita: any;

  @ViewChild('pdfContentRef') pdfContentRef!: ElementRef<HTMLDivElement>;

  getNativeElement(): HTMLElement | null {
    return this.pdfContentRef?.nativeElement || null;
  }
}
