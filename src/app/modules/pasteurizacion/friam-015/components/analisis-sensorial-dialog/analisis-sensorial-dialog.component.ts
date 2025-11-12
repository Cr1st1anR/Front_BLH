import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

import { AnalisisSensorialTableComponent } from '../analisis-sensorial-table/analisis-sensorial-table.component';
import type { SeleccionClasificacionData } from '../../interfaces/seleccion-clasificacion.interface';

@Component({
  selector: 'analisis-sensorial-dialog',
  standalone: true,
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule,
    AnalisisSensorialTableComponent
  ],
  templateUrl: './analisis-sensorial-dialog.component.html',
  styleUrl: './analisis-sensorial-dialog.component.scss',
  providers: [MessageService]
})
export class AnalisisSensorialDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() seleccionClasificacionData: SeleccionClasificacionData | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild(AnalisisSensorialTableComponent) analisisSensorialTableComp!: AnalisisSensorialTableComponent;

  loading: boolean = false;

  get dialogHeader(): string {
    if (this.seleccionClasificacionData?.no_frasco_procesado) {
      return `Análisis Sensorial - Frasco: ${this.seleccionClasificacionData.no_frasco_procesado}`;
    }
    return 'Análisis Sensorial';
  }

  get idSeleccionClasificacion(): number | null {
    return this.seleccionClasificacionData?.id || null;
  }

  constructor(private readonly messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue && this.seleccionClasificacionData) {
      this.mostrarMensajeCarga();
    }
  }

  closeDialog(): void {
    this.visible = false;
    this.dialogClosed.emit();
  }

  private mostrarMensajeCarga(): void {
    if (this.seleccionClasificacionData) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: `Cargando análisis sensorial para frasco: ${this.seleccionClasificacionData.no_frasco_procesado}`,
        key: 'tr',
        life: 2000,
      });
    }
  }
}
