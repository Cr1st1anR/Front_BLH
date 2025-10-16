import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NewRegisterExtraccionComponent } from './new-register-extraccion/new-register-extraccion.component';
import { TableExtraccionComponent } from './table-extraccion/table-extraccion.component';

@Component({
  selector: 'dialog-extracciones',
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule,
    NewRegisterExtraccionComponent,
    TableExtraccionComponent
  ],
  templateUrl: './dialog-extracciones.component.html',
  styleUrl: './dialog-extracciones.component.scss',
  providers: [MessageService]
})
export class DialogExtraccionesComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() rowData: any = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild(TableExtraccionComponent) tableExtraccionComp!: TableExtraccionComponent;

  loading: boolean = false;

  constructor(private messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue && this.rowData) {
      this.onDialogOpen();
    }
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Obtener el título del dialog
   */
  getDialogTitle(): string {
    if (!this.rowData) {
      return 'Extracciones';
    }

    const nombre = this.rowData.apellidos_nombre || 'Sin nombre';
    const identificacion = this.rowData.identificacion || 'Sin CC';

    return `${nombre} (Identificación: ${identificacion})`;
  }

  /**
   * Crear nueva extracción
   */
  onNuevaExtraccion(): void {
    this.tableExtraccionComp.crearNuevaExtraccion();
  }

  /**
   * Verificar si el botón de nueva extracción debe estar deshabilitado
   */
  isNewExtraccionButtonDisabled(): boolean {
    return this.tableExtraccionComp?.isAnyRowEditing() ?? false;
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

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Lógica cuando se abre el dialog
   */
  private onDialogOpen(): void {
    console.log('Dialog abierto con datos:', this.rowData);

    if (this.rowData) {
      this.showInfoMessage(`Cargando extracciones para: ${this.rowData.apellidos_nombre}`);
    }
  }

  /**
   * Mostrar mensaje informativo
   */
  private showInfoMessage(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: message,
      key: 'tr-dialog',
      life: 2000,
    });
  }
}
