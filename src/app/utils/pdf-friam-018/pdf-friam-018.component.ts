import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pdf-friam-018',
  imports: [CommonModule],
  templateUrl: './pdf-friam-018.component.html',
  styleUrl: './pdf-friam-018.component.scss',
})
export class PdfFriam018Component {
  @Input() datosInscripcion: any;
  @Input() historiaGestacion: any;
  @Input() examenesLab: any;
  @Input() medicamentos: any;

  @ViewChild('pdfContentRef') pdfContentRef!: ElementRef<HTMLDivElement>;

  getNativeElement(): HTMLElement | null {
    return this.pdfContentRef?.nativeElement || null;
  }
}
