import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

import { CalentamientoTableComponent } from '../calentamiento-table/calentamiento-table.component';
import type { ControlTemperaturaData } from '../../interfaces/control-temperatura.interface';

@Component({
  selector: 'calentamiento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule,
    CalentamientoTableComponent
  ],
  templateUrl: './calentamiento-dialog.component.html',
  styleUrl: './calentamiento-dialog.component.scss',
  providers: [MessageService]
})
export class CalentamientoDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() controlTemperaturaData: ControlTemperaturaData | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild(CalentamientoTableComponent) calentamientoTableComp!: CalentamientoTableComponent;

  loading: boolean = false;

  get dialogHeader(): string {
    if (this.controlTemperaturaData?.lote) {
      return `Calentamiento - Lote: ${this.controlTemperaturaData.lote} | Ciclo: ${this.controlTemperaturaData.ciclo || 'N/A'}`;
    }
    return 'Calentamiento - Variación de Temperatura (°C) (Baño María)';
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
        detail: `Cargando datos de calentamiento para lote: ${this.controlTemperaturaData.lote}`,
        key: 'tr',
        life: 2000,
      });
    }
  }
}
