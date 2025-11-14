import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

import { EnfriamientoTableComponent } from '../enfriamiento-table/enfriamiento-table.component';
import type { ControlTemperaturaData } from '../../interfaces/control-temperatura.interface';

@Component({
  selector: 'enfriamiento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule,
    EnfriamientoTableComponent
  ],
  templateUrl: './enfriamiento-dialog.component.html',
  styleUrl: './enfriamiento-dialog.component.scss',
  providers: [MessageService]
})
export class EnfriamientoDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() controlTemperaturaData: ControlTemperaturaData | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild(EnfriamientoTableComponent) enfriamientoTableComp!: EnfriamientoTableComponent;

  loading: boolean = false;

  get dialogHeader(): string {
    if (this.controlTemperaturaData?.lote) {
      return `Enfriamiento - Lote: ${this.controlTemperaturaData.lote} | Ciclo: ${this.controlTemperaturaData.ciclo || 'N/A'}`;
    }
    return 'Enfriamiento - Variación de Temperatura (°C) (Enfriador)';
  }

  get idControlTemperatura(): number | null {
    return this.controlTemperaturaData?.id || null;
  }

  constructor(private readonly messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue && this.controlTemperaturaData) {
      this.mostrarMensajeCarga();
    }
  }

  closeDialog(): void {
    this.visible = false;
    this.dialogClosed.emit();
  }

  private mostrarMensajeCarga(): void {
    if (this.controlTemperaturaData) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: `Cargando datos de enfriamiento para lote: ${this.controlTemperaturaData.lote}`,
        key: 'tr',
        life: 2000,
      });
    }
  }
}
