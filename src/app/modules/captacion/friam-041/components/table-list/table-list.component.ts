import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { NewRegisterComponent } from '../new-register/new-register.component';
import { MonthPickerComponent } from '../month-picker/month-picker.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LineaAmigaService } from './services/linea-amiga.service';
import { ApiResponse, empleados, entidades, lineaAmigaData } from './interfaces/linea-amiga.interface';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { catchError, concatMap, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-table-list',
  imports: [
    TableModule,
    HeaderComponent,
    MonthPickerComponent,
    NewRegisterComponent,
    FormsModule,
    CommonModule,
    SelectModule,
    DatePickerModule,
    RippleModule,
    ButtonModule,
    InputTextModule,
    RadioButtonModule,
    ToastModule,
    MultiSelectModule,
    ProgressSpinnerModule

  ],
  templateUrl: './table-list.component.html',
  styleUrl: './table-list.component.scss',
  providers: [LineaAmigaService, MessageService],
})

export class TableListComponent implements OnInit {

  @ViewChild('tableVap') table!: Table;

  dataTableLienaAmiga: lineaAmigaData[] = [];
  clonedTableLienaAmiga: { [s: number]: lineaAmigaData } = {};
  filtroActual: { year: number; month: number } | null = null;
  entidadesOpt: entidades[] = [];
  selectedEntidades: any[] = [];
  loading: boolean = false;

  editingRow: lineaAmigaData | null = null;
  hasNewRowInEditing: boolean = false;

  headersTableLineaAmiga: any[] = [
    {
      header: 'REMITE', field: 'entidad', rowspan: 2, width: '200px', tipo: "select",
      options: null, label: "nombre", placeholder: "Seleccione la entidad", clase: ""
    },
    { header: 'NOMBRES', field: 'nombre', rowspan: 2, width: '200px', tipo: "text", clase: "" },
    { header: 'APELLIDOS', field: 'apellido', rowspan: 2, width: '200px', tipo: "text", clase: "" },
    { header: 'FECHA PARTO', field: 'fechaParto', rowspan: 2, width: '200px', tipo: "date", clase: "" },
    { header: 'NO. DOC', field: 'documento', rowspan: 2, width: '200px', tipo: "text", clase: "" },
    { header: 'EDAD', field: 'fechaNacimiento', rowspan: 2, width: '200px', tipo: "date", clase: "" },
    { header: 'TELEFONO', field: 'telefono', rowspan: 2, width: '200px', tipo: "text", clase: "" },
    { header: 'BARRIO', field: 'barrio', rowspan: 2, width: '200px', tipo: "text", clase: "" },
    { header: 'DIRECCION', field: 'direccion', rowspan: 2, width: '200px', tipo: "text", clase: "" },
    { header: 'EDUCACION PRESENCIAL', field: 'educacionPresencial', rowspan: 2, width: '320px', tipo: "checkbox", clase: "" },
    { header: 'FECHA LLAMADA', field: 'fechaLlamada', rowspan: 2, width: '200px', tipo: "date", clase: "" },
    { header: 'LLAMADA', field: "llamada", colspan: 2, align: 'center', width: '320px', tipo: "checkbox", clase: "" },
    {
      header: 'RESPONSABLE', field: 'responsable', rowspan: 2, width: '200px', tipo: "select",
      options: null, label: "nombre", placeholder: "Seleccione un responsable", clase: ""
    },
    { header: 'RECIBE ASESORIA', field: "asesoria", colspan: 2, align: 'center', width: '320px', tipo: "checkbox", clase: "" },
    { header: 'POSIBLE DONANTE', field: "donanteEfectiva", colspan: 2, align: 'center', width: '320px', tipo: "checkbox", clase: "" },
    { header: 'FECHA VISITA', field: 'fechaVisita', rowspan: 2, width: '200px', tipo: "date", clase: "" },
    { header: 'OBSERVACIONES', field: 'observacion', rowspan: 2, width: '200px', tipo: "text", clase: "" },
    { header: 'ACCIONES', field: 'acciones', rowspan: 2, width: '150px' }
  ];

  requiredFields: string[] = ['entidad', 'nombre', 'apellido', 'fechaParto', 'documento', 'fechaNacimiento', 'telefono', 'barrio', 'direccion', 'responsable'];

  constructor(
    private _lineaAmigaService: LineaAmigaService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loading = true;
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();

    of(null).pipe(
      concatMap(() => this.loadDataEmpleados()),
      concatMap(() => this.loadDataEntidades()),
      concatMap(() => this.loadDataLieneaAmiga(mesActual, anioActual))
    ).subscribe({
      complete: () => {
        setTimeout(() => {
          this.loading = false;
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en la secuencia de peticiones', err);
      }
    });
  }

  loadDataEntidades(): Observable<ApiResponse> {
    return this._lineaAmigaService.getDataEntidades().pipe(
      tap((data) => {
        if (data) {
          this.headersTableLineaAmiga[0].options = data.data;
        } else {
          this.entidadesOpt = [];
        }
      })
    );
  }

  loadDataEmpleados(): Observable<ApiResponse> {
    return this._lineaAmigaService.getDataEmpleados().pipe(
      tap((data) => {
        if (data) {
          this.headersTableLineaAmiga[12].options = data.data;
        }
      })
    );
  }

  loadDataLieneaAmiga(mes: number, anio: number): Observable<ApiResponse | null> {
    return this._lineaAmigaService.getDataFriam041(mes, anio).pipe(
      tap((data) => {
        if (data) {
          this.dataTableLienaAmiga = this.formatData(data.data);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados para la fecha seleccionada',
            key: 'tr',
            life: 3000
          });
        } else {
          this.dataTableLienaAmiga = [];
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para la fecha seleccionada',
            key: 'tr',
            life: 3000
          });
        }
      }),
      catchError((error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al obtener datos',
          key: 'tr',
          life: 3000
        });
        console.error('Error en getDataFriam041:', error);
        return of(null);
      })
    );
  }

  onRowEditInit(dataRow: lineaAmigaData): void {
    // Verificar si hay una nueva fila en edición
    if (this.hasNewRowInEditing && (!this.editingRow || this.editingRow.idMadrePotencial === undefined)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la fila nueva antes de editar otra.',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    // Cancelar edición actual si existe
    if (this.editingRow && this.table) {
      this.cancelCurrentEditing();
    }

    this.clonedTableLienaAmiga[dataRow.idMadrePotencial as number] = { ...dataRow };
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: lineaAmigaData, index: number, event: MouseEvent) {
    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    // Sincronizar fechaNacimiento con fechaNacAux
    if (dataRow.fechaNacAux) {
      dataRow.fechaNacimiento = new Date(dataRow.fechaNacAux);
    }

    const invalidField = this.requiredFields.find(field => this.isFieldInvalid(field, dataRow));
    if (invalidField) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `El campo "${invalidField}" es obligatorio.`,
        key: 'tr',
        life: 3000
      });
      return;
    }

    // Limpiar estado de edición
    this.editingRow = null;
    this.hasNewRowInEditing = false;

    const newDataRow = Object.assign({}, dataRow,
      {
        fechaParto: dataRow.fechaParto ? ((new Date(dataRow.fechaParto)).toISOString()).split('T')[0] : null,
        fechaNacimiento: dataRow.fechaNacAux ? ((new Date(dataRow.fechaNacAux)).toISOString()).split('T')[0] : null,
        fechaLlamada: dataRow.fechaLlamada ? ((new Date(dataRow.fechaLlamada)).toISOString()).split('T')[0] : null,
        fechaVisita: dataRow.fechaVisita ? ((new Date(dataRow.fechaVisita)).toISOString()).split('T')[0] : null
      }
    );
    const body = this.formatInputBody(newDataRow);
    delete this.clonedTableLienaAmiga[dataRow.idMadrePotencial as number];

    if (dataRow.idMadrePotencial === undefined) {
      this._lineaAmigaService.postDataLineaAmiga(body).subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: 'Exito', detail: 'Datos guardados', key: 'tr', life: 3000 });
          this.dataTableLienaAmiga[this.dataTableLienaAmiga.length - 1].fechaNacimiento = this.ageCalculate((this.dataTableLienaAmiga.filter((item) => item.idMadrePotencial === undefined)[0].fechaNacimiento as Date));
          this.table.saveRowEdit(dataRow, rowElement);
        },
        error: (error) => {
          this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Hubo un error al guardar', key: 'tr', life: 3000 });
        }
      })
    } else {
      this._lineaAmigaService.putDataLineaAmiga(body).subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: 'Exito', detail: 'Datos actualizados', key: 'tr', life: 3000 });
          dataRow.fechaNacimiento = this.ageCalculate((newDataRow.fechaNacimiento as Date));
          this.table.saveRowEdit(dataRow, rowElement);
        },
        error: (error) => {
          this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Hubo un error al actualizar', key: 'tr', life: 3000 });
        }
      })
    }
  }

  onRowEditCancel(dataRow: lineaAmigaData, index: number): void {
    if (dataRow.idMadrePotencial === undefined) {
      // Es una nueva fila, eliminarla
      this.dataTableLienaAmiga.splice(index, 1);
      this.dataTableLienaAmiga = [...this.dataTableLienaAmiga];
      this.hasNewRowInEditing = false;
    } else {
      // Restaurar datos originales
      this.dataTableLienaAmiga[index] = this.clonedTableLienaAmiga[dataRow.idMadrePotencial as number];
      delete this.clonedTableLienaAmiga[dataRow.idMadrePotencial as number];
    }
    this.editingRow = null;
  }

  agregarFilaVacia() {
    if (this.hasNewRowInEditing) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la fila actual antes de crear una nueva',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    // Cancelar edición actual si existe
    if (this.editingRow && this.table) {
      this.cancelCurrentEditing();
    }

    const nuevoRegistro: lineaAmigaData = {
      entidad: '',
      nombre: '',
      apellido: '',
      fechaParto: '',
      documento: '',
      fechaNacimiento: null,
      telefono: '',
      barrio: '',
      direccion: '',
      educacionPresencial: null,
      fechaLlamada: '',
      llamada: '',
      responsable: null,
      asesoria: null,
      donanteEfectiva: null,
      fechaVisita: '',
      observacion: '',
      fechaRegistro: '',
    };

    this.dataTableLienaAmiga.push(nuevoRegistro);
    this.dataTableLienaAmiga = [...this.dataTableLienaAmiga];
    this.hasNewRowInEditing = true;

    setTimeout(() => {
      this.table.initRowEdit(nuevoRegistro);
    }, 100);
  }

  filtrarPorFecha(filtro: { year: number; month: number }): void {
    this.loadDataLieneaAmiga(filtro.month, filtro.year).subscribe();
  }

  formatData(data: lineaAmigaData[]): lineaAmigaData[] {
    return data.map((item) => {
      return {
        ...item,
        fechaParto: item.fechaParto ? new Date(item.fechaParto) : null,
        fechaLlamada: item.fechaLlamada ? new Date(item.fechaLlamada) : null,
        fechaVisita: item.fechaVisita ? new Date(item.fechaVisita) : null,
        fechaNacimiento: item.fechaNacimiento ? this.ageCalculate(item.fechaNacimiento as Date) : null,
        fechaNacAux: new Date(item.fechaNacimiento as Date),
        entidad: this.headersTableLineaAmiga[0].options.find((entidad: entidades) => entidad.nombre === item.entidad) || '',
        responsable: this.headersTableLineaAmiga[12].options.find((empleado: empleados) => empleado.nombre === item.responsable) || '',
      };
    });
  }

  formatInputBody(body: lineaAmigaData) {
    return {
      id: body?.idMadrePotencial,
      educacion_presencial: body.educacionPresencial,
      fecha_llamada: body.fechaLlamada,
      llamada: body.llamada === '' ? null : body.llamada,
      asesoria: body.asesoria,
      donante_efectiva: body.donanteEfectiva,
      fecha_visita: body.fechaVisita,
      observacion: body.observacion,
      entidad: body.entidad,
      empleado: body.responsable,
      fecha_registro: (new Date().toISOString()).split('T')[0],
      infoMadre: {
        id: body?.infoMadre,
        nombre: body.nombre,
        apellido: body.apellido,
        documento: body.documento,
        fechaNacimiento: body.fechaNacimiento,
        fechaParto: body.fechaParto,
        telefono: body.telefono,
        barrio: body.barrio,
        direccion: body.direccion
      },
    }
  }

  ageCalculate(age: Date): number {
    const fechaNacimiento = new Date(age);
    const fechaActual = new Date();
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaActual.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNacimiento.getDate())) {
      return edad - 1;
    }
    return edad;
  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return this.requiredFields.includes(field) &&
      (dataRow[field] === null || dataRow[field] === undefined || dataRow[field] === '');
  }

  // Método privado para cancelar la edición actual
  private cancelCurrentEditing(): void {
    if (this.editingRow && this.table) {
      try {
        this.table.cancelRowEdit(this.editingRow);
      } catch (error) {
        // Ignorar errores del cancelRowEdit
      }

      const index = this.dataTableLienaAmiga.findIndex(
        (row) => row === this.editingRow
      );
      if (index !== -1) {
        if (this.editingRow.idMadrePotencial === undefined) {
          // Es una nueva fila, eliminarla
          this.dataTableLienaAmiga.splice(index, 1);
          this.dataTableLienaAmiga = [...this.dataTableLienaAmiga];
        } else {
          // Restaurar datos originales si existen
          if (this.clonedTableLienaAmiga[this.editingRow.idMadrePotencial as number]) {
            this.dataTableLienaAmiga[index] = this.clonedTableLienaAmiga[this.editingRow.idMadrePotencial as number];
            delete this.clonedTableLienaAmiga[this.editingRow.idMadrePotencial as number];
          }
        }
      }
      this.editingRow = null;
      this.hasNewRowInEditing = false;
    }
  }

  // Métodos de utilidad para el control de estado
  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: lineaAmigaData): boolean {
    return this.isAnyRowEditing() && this.editingRow !== rowData;
  }
}
