import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-month-picker',
  imports: [FormsModule, DatePicker],
  templateUrl: './month-picker.component.html',
  styleUrl: './month-picker.component.scss',
})
export class MonthPickerComponent implements OnInit {
  date: Date = new Date(); // Inicializar con la fecha actual

  @Output() dateChange = new EventEmitter<{ year: number; month: number }>();

  ngOnInit(): void {
    // Emitir la fecha inicial al cargar el componente
    this.onDateChange();
  }

  onDateChange(): void {
    if (this.date) {
      const year = this.date.getFullYear();
      const month = this.date.getMonth() + 1; // Los meses son 0-indexados
      this.dateChange.emit({ year, month });
    }
  }
}
