import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { RegistroDonanteService } from './services/registro-donante.service';
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
import { ResponseMadresDonantes } from './interfaces/registro-donante.interface';

@Component({
  selector: 'posibles-donantes-table',
  templateUrl: './posibles-donantes-table.component.html',
  styleUrl: './posibles-donantes-table.component.scss',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    HeaderComponent,
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
      header: 'COD. DONANTE',
      field: 'codDonante',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'FECHA REGISTRO',
      field: 'fechaRegistro',
      width: '200px',
      tipo: 'text',
    },
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
      header: 'LABORATORIO',
      field: 'laboratorio',
      width: '200px',
      tipo: 'text',
    },
  ];

  dataRegistroDonante: any[] = [];
  dataRegistroDonanteByMadresDonantes: any[] = [];


  // requiredFields: string[] = ['nombre', 'apellido', 'documento', 'entidad'];

  constructor(
    private _registroDonanteService: RegistroDonanteService,
    private router: Router,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
    of(null)
      .pipe(
        concatMap(() => this.loadDataPosiblesDonantes()),
        concatMap(() => this.loadDataPosiblesDonantesByMadresDonantne())
      )
      .subscribe({
        complete: () => {
          this.formatDataByMadrePotenciales(this.dataRegistroDonante, this.dataRegistroDonanteByMadresDonantes);
          setTimeout(() => {
            this.loading = false;
          }, 1200)
        }, error: (err) => {
          this.loading = false;
          console.error('Error en la secuencia de peticiones', err);
        }
      })
  }

  loadDataPosiblesDonantes(): Observable<ApiResponse | null> {
    return this._registroDonanteService.getDataRegistroDonante().pipe(
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

  loadDataPosiblesDonantesByMadresDonantne(): Observable<ApiResponse | null> {
    return this._registroDonanteService.getDataMadresDonantesRegistered().pipe(
      tap((response) => {
        this.dataRegistroDonanteByMadresDonantes = [];
        if (response && response.data.length > 0) {
          this.dataRegistroDonanteByMadresDonantes = this.formatData(response.data);
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

  formatDataByMadrePotenciales(dataFirst: ResponseMadresDonantes[], dataSecond: ResponseMadresDonantes[]) {
    dataFirst.forEach((item, index) => {
      const flat = dataSecond.find((data) => data.id === item.id) != undefined ? dataSecond.find((data) => data.id === item.id) : item;
      this.dataRegistroDonante[index] =
      {
        ...item,
        codDonante: flat!.MadreDonante ? flat!.MadreDonante.id : null,
        fechaRegistro: flat!.fecha_registro ? flat!.fecha_registro.toLocaleString().split('T')[0] : '',
        nombre: flat!.infoMadre.nombre,
        apellido: flat!.infoMadre.apellido,
        documento: flat!.infoMadre.documento,
        laboratorio: flat!.MadreDonante ? flat!.laboratorio.map(lab => lab.fechaVencimiento).sort((a, b) => (a > b ? 1 : -1))[0] : "Sin Fecha",
        backgroundColorRow: flat!.MadreDonante ? flat!.MadreDonante.donanteApta === 1 ? 'donante-efectiva' : '' : ''
      }

    })
  }

  onRowClick(row: any): void {
    this._registroDonanteService.getInfoCompleteMadrePotencial(row.id).subscribe({
      next: (response) => {
        if (response) {
          console.log(response.data);
          this.router.navigate([
            '/blh/captacion/registro-donante-blh',
            row.documento,
          ],
            { state: { personInfo: response.data } }
          );
        } else {
          console.log(row);
           this.router.navigate([
            '/blh/captacion/registro-donante-blh',
            row.documento,
          ],
            { state: { personInfo: row } }
          );
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No se ha completado el registro de la madre donante',
            key: 'tr',
            life: 3000,
          });
        }

      },
    });
  }

  filtrarPorFecha(filtro: { year: number; month: number }): void {
    this.loadDataPosiblesDonantes().subscribe();
  }

  formatData(data: ResponseMadresDonantes[]) {
    return data.map((item) => {
      return {
        ...item,
        // nombre: item.nombre+' '+item.apellido
      }
    })
  }

  dateDiff(fechas: string[]): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (const fechaStr of fechas) {
      const fecha = new Date(fechaStr);
      fecha.setHours(0, 0, 0, 0);

      const diferenciaEnDias = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      if (diferenciaEnDias <= 15) {
        return true;
      }
    }
    return false;
  }

}
