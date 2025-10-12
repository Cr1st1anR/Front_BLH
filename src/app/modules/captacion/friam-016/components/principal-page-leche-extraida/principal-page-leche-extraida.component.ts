import { Component } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { TableLecheExtraidaComponent } from "../table-leche-extraida/table-leche-extraida.component";

@Component({
  selector: 'principal-page-leche-extraida',
  imports: [HeaderComponent, MonthPickerComponent, TableLecheExtraidaComponent],
  templateUrl: './principal-page-leche-extraida.component.html',
  styleUrl: './principal-page-leche-extraida.component.scss',
})
export class PrincipalPageLecheExtraidaComponent { }
