import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { RegistroDonanteService } from './services/registro-donante.service';
import { RegistroDonanteData } from './interfaces/registro-donante.interface';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { MonthPickerTableComponent } from '../month-picker-table/month-picker-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { catchError, concatMap, Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../../../friam-041/components/table-list/interfaces/linea-amiga.interface';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AccordionComponent } from '../accordion/accordion.component';

@Component({
  selector: 'posibles-donantes-table',
  templateUrl: './posibles-donantes-table.component.html',
  styleUrl: './posibles-donantes-table.component.scss',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    HeaderComponent,
    MonthPickerTableComponent,
    ProgressSpinnerModule,
    ToastModule,
    DatePickerModule,
    ButtonModule
  ],
  providers: [RegistroDonanteService, MessageService],
})
export class PosiblesDonantesTableComponent implements OnInit {
  @ViewChild(AccordionComponent)
  acordionComponente!: AccordionComponent;

  loading: boolean = false;

  headersTablePosiblesDonantes: any[] = [
    {
      header: 'NOMBRES',
      field: 'nombre',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'APELLIDOS',
      field: 'apellido',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'NO. DOC',
      field: 'documento',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'REMITE',
      field: 'entidad',
      width: '200px',
      tipo: 'text',
    },
  ];

  dataRegistroDonante: RegistroDonanteData[] = [];

  // requiredFields: string[] = ['nombre', 'apellido', 'documento', 'entidad'];

  constructor(
    private _registroDonanteService: RegistroDonanteService,
    private router: Router,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();
    of(null)
      .pipe(
        concatMap(() => this.loadDataPosiblesDonantes(mesActual, anioActual)),
      )
      .subscribe({
        complete: () => {
          setTimeout(() => {
            this.loading = false;
          }, 1200)
        }, error: (err) => {
          this.loading = false;
          console.error('Error en la secuencia de peticiones', err);
        }
      })
  }

  loadDataPosiblesDonantes(mes: number, anio: number): Observable<ApiResponse | null> {
    return this._registroDonanteService.getDataRegistroDonante(mes, anio).pipe(
      tap((response) => {
        this.dataRegistroDonante = [];
        if (response && response.data.length > 0) {
          this.dataRegistroDonante = this.formatData(response.data);
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados correctamente',
            key: 'tr',
            life: 2000,
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para mostrar',
            key: 'tr',
            life: 2000,
          });
        }

      }),
      catchError((error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al obtener datos',
          key: 'tr',
          life: 3000,
        });
        console.error('Error en getDataFriam041:', error);
        return of(null);
      })
    )
  }

  onRowClick(row: RegistroDonanteData) {
    localStorage.setItem('personInfo', JSON.stringify(row));
    this.router.navigate([
      '/blh/captacion/registro-donante-blh',
      row.documento,
    ]);
  }

  filtrarPorFecha(filtro: { year: number; month: number }): void {
    this.loadDataPosiblesDonantes(filtro.month, filtro.year).subscribe();
  }

  formatData(data: RegistroDonanteData[]) {
    return data.map((item) => {
      return {
        ...item,
        // nombre: item.nombre+' '+item.apellido
      }
    })
  }
}
