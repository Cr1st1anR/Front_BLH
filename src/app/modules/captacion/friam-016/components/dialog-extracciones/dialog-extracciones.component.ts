import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

import { NewRegisterExtraccionComponent } from './new-register-extraccion/new-register-extraccion.component';
import { TableExtraccionComponent } from './table-extraccion/table-extraccion.component';
import type { LecheExtraidaTable } from '../interfaces/leche-extraida-table.interface';

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
  @Input() visible = false;
  @Input() rowData: LecheExtraidaTable | null = null;
  @Output() dialogClosed = new EventEmitter<void>();
  @ViewChild(TableExtraccionComponent) tableExtraccionComp!: TableExtraccionComponent;

  loading = false;

  constructor(private readonly messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue && this.rowData) {
      this.handleDialogOpen();
    }
  }

  /**
   * Genera el título dinámico del diálogo basado en los datos de la fila
   */
  getDialogTitle(): string {
    if (!this.rowData) return 'Extracciones';

    const nombre = this.rowData.apellidos_nombre || 'Sin nombre';
    const identificacion = this.rowData.identificacion || 'Sin CC';

    return `${nombre} (Identificación: ${identificacion})`;
  }

  /**
   * Delega la creación de nueva extracción al componente de tabla
   */
  onNuevaExtraccion(): void {
    this.tableExtraccionComp.crearNuevaExtraccion();
  }

  /**
   * Verifica si el botón de nueva extracción debe estar deshabilitado
   */
  isNewExtraccionButtonDisabled(): boolean {
    return this.tableExtraccionComp?.isAnyRowEditing() ?? false;
  }

  /**
   * Cierra el diálogo y emite el evento correspondiente
   */
  closeDialog(): void {
    this.visible = false;
    this.dialogClosed.emit();
  }

  /**
   * Maneja el evento de cierre del diálogo de PrimeNG
   */
  onHide(): void {
    this.closeDialog();
  }

  /**
   * Ejecuta las acciones necesarias cuando se abre el diálogo
   */
  private handleDialogOpen(): void {
    if (this.rowData) {
      const nombre = this.rowData.apellidos_nombre || 'Madre sin nombre';
      this.showInfoMessage(`Cargando extracciones para: ${nombre}`);

      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    }
  }

  /**
   * Muestra un mensaje informativo al usuario
   */
  private showInfoMessage(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: message,
      key: 'tr-dialog',
      life: 2000
    });
  }
}
