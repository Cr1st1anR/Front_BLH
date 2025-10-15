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
      return 'Detalles de Extracción';
    }

    const nombre = this.rowData.apellidos_nombre || 'Sin nombre';
    const identificacion = this.rowData.identificacion || 'Sin ID';

    return `Extracciones - ${nombre} (ID: ${identificacion})`;
  }

  /**
   * Obtener información básica formateada
   */
  getBasicInfo(): { label: string; value: string }[] {
    if (!this.rowData) return [];

    return [
      {
        label: 'Fecha de Registro',
        value: this.rowData.fecha_registro || 'N/A'
      },
      {
        label: 'Apellidos y Nombre',
        value: this.rowData.apellidos_nombre || 'N/A'
      },
      {
        label: 'Edad',
        value: this.rowData.edad?.toString() || 'N/A'
      },
      {
        label: 'Identificación',
        value: this.rowData.identificacion || 'N/A'
      },
      {
        label: 'Municipio',
        value: this.rowData.municipio || 'N/A'
      },
      {
        label: 'Teléfono',
        value: this.rowData.telefono || 'N/A'
      },
      {
        label: 'EPS',
        value: this.rowData.eps || 'N/A'
      },
      {
        label: 'Procedencia',
        value: this.rowData.procedencia || 'N/A'
      }
    ];
  }

  /**
   * Obtener información de consejería
   */
  getConsejeriaInfo(): string {
    if (!this.rowData?.consejeria) return 'No especificada';

    const individual = this.rowData.consejeria.individual === 1 ? 'Individual: Sí' :
                      this.rowData.consejeria.individual === 0 ? 'Individual: No' : '';
    const grupal = this.rowData.consejeria.grupal === 1 ? 'Grupal: Sí' :
                   this.rowData.consejeria.grupal === 0 ? 'Grupal: No' : '';

    const partes = [individual, grupal].filter(Boolean);
    return partes.length > 0 ? partes.join(' | ') : 'No especificada';
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
      this.showInfoMessage(`Abriendo extracciones para: ${this.rowData.apellidos_nombre}`);
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
