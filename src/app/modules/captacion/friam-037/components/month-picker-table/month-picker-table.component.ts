import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'month-picker-table',
  imports: [FormsModule, DatePicker],
  templateUrl: './month-picker-table.component.html',
  styleUrl: './month-picker-table.component.scss',
})
export class MonthPickerTableComponent {
    date: Date | undefined
}
