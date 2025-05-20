import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Customer } from '../../interfaces/customer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'table-temperatura',
  imports: [TableModule, FormsModule, CommonModule],
  templateUrl: './table-temperatura.component.html',
  styleUrl: './table-temperatura.component.scss',
})
export class TableTemperaturaComponent implements OnChanges {
  @Input() dialogRow: Customer | null = null;
  @Input() dynamicColumns: string[] = ['T° CASA 1'];
  @Input() nuevaColumna: string | null = null;

  clonedCustomer: Customer | null = null;
  editingColumn: string | null = null;
  editingRow: Customer | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dialogRow'] && this.dialogRow) {
      this.clonedCustomer = null;
      this.editingColumn = null;
      this.editingRow = null;
    }

    if (changes['nuevaColumna'] && this.nuevaColumna && this.dialogRow) {
      this.editingColumn = this.nuevaColumna;
      this.clonedCustomer = { ...this.dialogRow };
    }
  }

  guardarEdicion(customer: Customer) {
    this.editingColumn = null;
    this.clonedCustomer = null;
  }

  cancelarEdicion() {
    if (this.dialogRow && this.clonedCustomer) {
      Object.assign(this.dialogRow, this.clonedCustomer);
    }
    this.editingColumn = null;
    this.clonedCustomer = null;
  }

  editarFila(customer: Customer) {
    this.clonedCustomer = { ...customer };
    this.editingRow = customer;
    this.editingColumn = null;
  }

  guardarFila() {
    this.editingRow = null;
    this.clonedCustomer = null;
  }

  cancelarEdicionFila() {
    if (this.dialogRow && this.clonedCustomer) {
      Object.assign(this.dialogRow, this.clonedCustomer);
    }
    this.editingRow = null;
    this.clonedCustomer = null;
  }
}

