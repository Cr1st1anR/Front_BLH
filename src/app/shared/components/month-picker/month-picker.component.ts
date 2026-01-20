import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'shared-month-picker',
  imports: [FormsModule, DatePicker],
  templateUrl: './month-picker.component.html',
  styleUrl: './month-picker.component.scss',
})
export class MonthPickerComponent implements OnInit {
  @Input() autoSelectCurrent: boolean = true;

  date: Date | undefined;

  @Output() dateChange = new EventEmitter<{ year: number; month: number }>();

  ngOnInit(): void {
    if (this.autoSelectCurrent) {
      this.date = new Date();
      this.onDateChange();
    }
  }

  onDateChange(): void {
    if (this.date) {
      const year = this.date.getFullYear();
      const month = this.date.getMonth() + 1;
      this.dateChange.emit({ year, month });
    } else {
      this.dateChange.emit({ year: 0, month: 0 });
    }
  }
}
