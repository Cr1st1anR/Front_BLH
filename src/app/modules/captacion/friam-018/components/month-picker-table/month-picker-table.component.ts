import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'month-picker-table',
  imports: [FormsModule, DatePicker],
  templateUrl: './month-picker-table.component.html',
  styleUrl: './month-picker-table.component.scss',
})
export class MonthPickerTableComponent {
  date: Date | undefined = new Date();
  @Output() dateChange = new EventEmitter<{ year: number; month: number }>();

  constructor() {
  }
  onDateChange(): void {
    if (this.date) {
      const year = this.date.getFullYear();
      const month = this.date.getMonth() + 1;
      this.dateChange.emit({ year, month });
    }
  }
}
