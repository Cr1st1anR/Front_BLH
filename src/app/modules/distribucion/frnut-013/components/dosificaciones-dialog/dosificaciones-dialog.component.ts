import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NewRegisterButtonComponent } from "src/app/shared/components/new-register-button/new-register-button.component";
import { DosificacionesTableComponent } from "../dosificaciones-table/dosificaciones-table.component";
import type { IngresoLechePasteurizadaData } from '../../interfaces/ingreso-leche-pasteurizada.interface';

@Component({
  selector: 'dosificaciones-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ProgressSpinnerModule,
    ToastModule,
    NewRegisterButtonComponent,
    DosificacionesTableComponent
  ],
  templateUrl: './dosificaciones-dialog.component.html',
  styleUrl: './dosificaciones-dialog.component.scss',
  providers: [MessageService]
})
export class DosificacionesDialogComponent implements OnInit, OnChanges {

  @Input() visible: boolean = false;
  @Input() ingresoLechePasteurizadaData: IngresoLechePasteurizadaData | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild(DosificacionesTableComponent)
  private readonly tableComponent!: DosificacionesTableComponent;

  loading: boolean = false;

  constructor(
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Sin necesidad de cargar empleados
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue && this.ingresoLechePasteurizadaData) {
      this.mostrarMensajeCarga();
    }
  }

  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.isAnyRowEditing() ?? false;
  }

  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
  }

  closeDialog(): void {
    this.visible = false;
    this.dialogClosed.emit();
  }

  calcularVolumenTotal(): number {
    return this.tableComponent?.calcularVolumenTotal() ?? 0;
  }

  obtenerVolumenRestante(): number {
    return this.tableComponent?.obtenerVolumenRestante() ?? 0;
  }

  private mostrarMensajeCarga(): void {
    if (this.ingresoLechePasteurizadaData) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: `Cargando dosificaciones para frasco: ${this.ingresoLechePasteurizadaData.n_frasco}`,
        key: 'tr',
        life: 2000,
      });
    }
  }
}
