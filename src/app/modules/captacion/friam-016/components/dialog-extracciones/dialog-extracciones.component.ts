import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'dialog-extracciones',
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule
  ],
  templateUrl: './dialog-extracciones.component.html',
  styleUrl: './dialog-extracciones.component.scss',
  providers: [MessageService]
})
export class DialogExtraccionesComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() rowData: any = null;
  @Output() dialogClosed = new EventEmitter<void>();

  loading: boolean = false;

  constructor(private messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue && this.rowData) {
      this.onDialogOpen();
    }
  }

  /**
   * Obtener el título del dialog
   */
  getDialogTitle(): string {
    if (!this.rowData) {
      return 'Detalles de Extracción';
    }

    const nombre = this.rowData.apellidos_nombre || 'Sin nombre';
    const identificacion = this.rowData.identificacion || 'Sin ID';

    return `Extracciones - ${nombre} (ID: ${identificacion})`;
  }

  /**
   * Lógica cuando se abre el dialog
   */
  private onDialogOpen(): void {
    console.log('Dialog abierto con datos:', this.rowData);

    // Mostrar mensaje informativo
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: `Abriendo detalles para: ${this.rowData.apellidos_nombre}`,
      key: 'tr-dialog',
      life: 2000,
    });
  }

  /**
   * Cerrar el dialog
   */
  closeDialog(): void {
    this.visible = false;
    this.dialogClosed.emit();
  }

  /**
   * Manejar el evento onHide del dialog
   */
  onHide(): void {
    this.closeDialog();
  }
}
