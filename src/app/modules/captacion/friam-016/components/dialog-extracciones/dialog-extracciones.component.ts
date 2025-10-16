import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
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
  @Input() visible = false;
  @Input() rowData: any = null;
  @Output() dialogClosed = new EventEmitter<void>();
  @ViewChild(TableExtraccionComponent) tableExtraccionComp!: TableExtraccionComponent;

  loading = false;

  constructor(private messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue && this.rowData) {
      this.onDialogOpen();
    }
  }

  getDialogTitle(): string {
    if (!this.rowData) return 'Extracciones';

    const nombre = this.rowData.apellidos_nombre || 'Sin nombre';
    const identificacion = this.rowData.identificacion || 'Sin CC';

    return `${nombre} (Identificación: ${identificacion})`;
  }

  onNuevaExtraccion(): void {
    this.tableExtraccionComp.crearNuevaExtraccion();
  }

  isNewExtraccionButtonDisabled(): boolean {
    return this.tableExtraccionComp?.isAnyRowEditing() ?? false;
  }

  closeDialog(): void {
    this.visible = false;
    this.dialogClosed.emit();
  }

  onHide(): void {
    this.closeDialog();
  }

  private onDialogOpen(): void {
    if (this.rowData) {
      this.showInfoMessage(`Cargando extracciones para: ${this.rowData.apellidos_nombre}`);
    }
  }

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
