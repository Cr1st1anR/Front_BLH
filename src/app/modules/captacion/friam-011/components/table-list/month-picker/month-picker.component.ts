import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-month-picker',
  imports: [FormsModule, DatePicker],
  templateUrl: './month-picker.component.html',
  styleUrl: './month-picker.component.scss',
})
export class MonthPickerComponent {
  date: Date | undefined; // Fecha seleccionada

  @Output() dateChange = new EventEmitter<{ year: number; month: number }>();

  onDateChange(): void {
    if (this.date) {
      const year = this.date.getFullYear();
      const month = this.date.getMonth() + 1; // Los meses son 0-indexados
      this.dateChange.emit({ year, month });
    }
  }
}
