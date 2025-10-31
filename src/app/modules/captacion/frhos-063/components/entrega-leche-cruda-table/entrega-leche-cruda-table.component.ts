import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, catchError, of } from 'rxjs';

import { TableModule, Table } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { EntregaLecheCrudaService } from '../../services/entrega-leche-cruda.service';
import type {
  EntregaLecheCrudaData,
  ResponsableOption,
  MadreOption,
  Empleado,
  LecheDistribucionRequest,
  LecheDistribucionResponse,
  MadrePotencial
} from '../../interfaces/entrega-leche-cruda.interface';

@Component({
  selector: 'entrega-leche-cruda-table',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ProgressSpinnerModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    AutoCompleteModule
  ],
  templateUrl: './entrega-leche-cruda-table.component.html',
  styleUrl: './entrega-leche-cruda-table.component.scss',
  providers: [MessageService]
})
export class EntregaLecheCrudaTableComponent implements OnInit {

  @ViewChild('tableEntregaLeche') table!: Table;

  loading = false;
  editingRow: EntregaLecheCrudaData | null = null;
  hasNewRowInEditing = false;
  clonedData: Record<string, EntregaLecheCrudaData> = {};
  savingInProgress = false;

  dataEntregaLecheCrudaOriginal: EntregaLecheCrudaData[] = [];
  dataEntregaLecheCrudaFiltered: EntregaLecheCrudaData[] = [];
  filtroFecha: { year: number; month: number } | null = null;

  opcionesResponsables: ResponsableOption[] = [];
  opcionesMadres: MadreOption[] = [];
  madresSugeridas: MadreOption[] = [];

  private tempIdCounter = -1;
  private madreSeleccionada: MadreOption | null = null;
  private responsableSeleccionado: ResponsableOption | null = null;

  readonly headersEntregaLecheCruda = [
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date' },
    { header: 'NOMBRE DE LA MADRE', field: 'nombre_madre', width: '200px', tipo: 'autocomplete' },
    { header: 'VOLUMEN LECHE MATERNA A.M', field: 'volumen_leche_materna_am', width: '180px', tipo: 'text' },
    { header: 'VOLUMEN LECHE MATERNA P.M', field: 'volumen_leche_materna_pm', width: '180px', tipo: 'text' },
    { header: 'PERDIDAS', field: 'perdidas', width: '100px', tipo: 'number' },
    { header: 'RESPONSABLE', field: 'responsable', width: '150px', tipo: 'select' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' },
  ];

  get dataEntregaLecheCruda(): EntregaLecheCrudaData[] {
    return this.dataEntregaLecheCrudaFiltered;
  }

  set dataEntregaLecheCruda(value: EntregaLecheCrudaData[]) {
    this.dataEntregaLecheCrudaFiltered = value;
  }

  constructor(
    private readonly entregaLecheCrudaService: EntregaLecheCrudaService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.inicializarOpciones();
    this.loadDataEntregaLecheCruda();
  }

  private inicializarOpciones(): void {
    forkJoin({
      madres: this.entregaLecheCrudaService.getMadresInternasNoDonantes()
        .pipe(catchError(() => of({ data: [] }))),
      empleados: this.entregaLecheCrudaService.getEmpleados()
        .pipe(catchError(() => of({ data: [] })))
    }).subscribe({
      next: ({ madres, empleados }) => {
        const madresData = this.extractDataFromResponse(madres);
        const empleadosData = this.extractDataFromResponse(empleados);

        this.opcionesMadres = Array.isArray(madresData) && madresData.length > 0
          ? this.mapMadresToOptions(madresData)
          : [];

        this.opcionesResponsables = Array.isArray(empleadosData) && empleadosData.length > 0
          ? this.mapEmpleadosToOptions(empleadosData)
          : [];
      },
      error: () => {
        this.showErrorMessage('Error al cargar las opciones de madres y responsables');
      }
    });
  }

  buscarMadres(event: any): void {
    const query = event.query?.toLowerCase() || '';

    this.madresSugeridas = query.length >= 2
      ? this.opcionesMadres.filter(madre =>
        madre.label.toLowerCase().includes(query) ||
        (madre.documento && madre.documento.includes(query))
      )
      : [];
  }

  onMadreSeleccionada(event: any, rowData: EntregaLecheCrudaData): void {
    let madreEncontrada: MadreOption | undefined;

    if (typeof event === 'object' && event.value) {
      madreEncontrada = this.opcionesMadres.find(m => m.value === event.value);
      if (madreEncontrada) {
        rowData.nombre_madre = event.value;
      }
    } else if (typeof event === 'string') {
      rowData.nombre_madre = event;
      madreEncontrada = this.opcionesMadres.find(m => m.value === event);
    } else if (event?.label) {
      madreEncontrada = this.opcionesMadres.find(m => m.label === event.label || m.value === event.label);
      if (madreEncontrada) {
        rowData.nombre_madre = madreEncontrada.value;
      }
    }

    this.madreSeleccionada = madreEncontrada || null;
  }

  onResponsableSeleccionado(event: any, rowData: EntregaLecheCrudaData): void {
    if (event?.value) {
      rowData.responsable = event.value;
      this.responsableSeleccionado = this.opcionesResponsables.find(r => r.value === event.value) || null;
    }
  }

  isMadreFieldDisabled(rowData: EntregaLecheCrudaData): boolean {
    return !rowData.isNew;
  }

  private loadDataEntregaLecheCruda(): void {
    this.loading = true;

    this.entregaLecheCrudaService.getLecheDistribucion()
      .pipe(catchError(() => of({ data: [] })))
      .subscribe({
        next: (response) => {
          const data = this.extractDataFromResponse(response);

          if (Array.isArray(data)) {
            this.dataEntregaLecheCrudaOriginal = this.mapResponseToFrontendData(data);
            this.dataEntregaLecheCrudaFiltered = [...this.dataEntregaLecheCrudaOriginal];
          } else {
            this.dataEntregaLecheCrudaOriginal = [];
            this.dataEntregaLecheCrudaFiltered = [];
          }

          this.showSuccessMessageInitial();
          this.loading = false;
        },
        error: (error) => this.handleError(error)
      });
  }

  private extractDataFromResponse(response: any): any[] {
    if (response?.data && 'status' in response) {
      return response.data || [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      return [response];
    }

    return [];
  }

  private extractSingleFromResponse(response: any): any {
    if (response?.data && 'status' in response) {
      return response.data;
    }

    if (response && typeof response === 'object' && !Array.isArray(response)) {
      return response;
    }

    return null;
  }

  filtrarPorFecha(filtro: { year: number; month: number } | null): void {
    this.aplicarFiltroConNotificacion(filtro);
  }

  aplicarFiltroInicialConNotificacion(filtro: { year: number; month: number } | null): void {
    this.aplicarFiltroConNotificacion(filtro);
  }

  private aplicarFiltroConNotificacion(filtro: { year: number; month: number } | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  private aplicarFiltros(): void {
    let datosFiltrados = [...this.dataEntregaLecheCrudaOriginal];

    if (this.filtroFecha) {
      datosFiltrados = this.filtrarPorMesYAno(datosFiltrados, this.filtroFecha);
    }

    this.dataEntregaLecheCrudaFiltered = datosFiltrados;
  }

  private filtrarPorMesYAno(datos: EntregaLecheCrudaData[], filtro: { year: number; month: number }): EntregaLecheCrudaData[] {
    return datos.filter(item => {
      if (!item.fecha) return false;

      const fechaParseada = this.parsearFechaSegura(item.fecha);
      if (!fechaParseada) return false;

      if (isNaN(fechaParseada.getTime())) return false;

      const mesItem = fechaParseada.getMonth() + 1;
      const añoItem = fechaParseada.getFullYear();

      return mesItem === filtro.month && añoItem === filtro.year;
    });
  }

  private mostrarNotificacionFiltro(): void {
    const cantidad = this.dataEntregaLecheCrudaFiltered.length;
    const totalOriginal = this.dataEntregaLecheCrudaOriginal.length;
    const pluralText = cantidad > 1 ? 's' : '';

    if (this.filtroFecha) {
      const nombreMes = this.obtenerNombreMes(this.filtroFecha.month);
      const año = this.filtroFecha.year;

      const severity = cantidad > 0 ? 'info' : 'warn';
      const summary = cantidad > 0 ? 'Filtro aplicado' : 'Sin resultados';
      const detail = cantidad > 0
        ? `${cantidad} de ${totalOriginal} registro${pluralText} encontrado${pluralText} para ${nombreMes} ${año}`
        : `No se encontraron registros para ${nombreMes} ${año}`;

      this.messageService.add({ severity, summary, detail, key: 'tr', life: 3000 });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Filtro removido',
        detail: `Mostrando todos los registros (${totalOriginal})`,
        key: 'tr',
        life: 2000,
      });
    }
  }

  private obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ] as const;
    return meses[mes - 1] || 'Mes inválido';
  }

  private parsearFechaSegura(fechaString: string | Date): Date | null {
    if (!fechaString) return null;
    if (fechaString instanceof Date) return fechaString;

    if (typeof fechaString === 'string') {
      if (fechaString.includes('-')) {
        const [year, month, day] = fechaString.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
      }

      if (fechaString.includes('/')) {
        const [day, month, year] = fechaString.split('/').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
      }
    }

    return null;
  }

  crearNuevoRegistro(): void {
    if (this.hasNewRowInEditing) {
      this.showWarningMessage('Debe guardar o cancelar el registro actual antes de crear uno nuevo');
      return;
    }

    if (this.isAnyRowEditing()) {
      this.showWarningMessage('Debe completar la edición actual antes de crear un nuevo registro');
      return;
    }

    const nuevoRegistro = this.createNewRecord();

    this.dataEntregaLecheCrudaOriginal.push(nuevoRegistro);
    this.dataEntregaLecheCrudaFiltered.push(nuevoRegistro);
    this.dataEntregaLecheCrudaFiltered = [...this.dataEntregaLecheCrudaFiltered];

    this.hasNewRowInEditing = true;
    this.editingRow = nuevoRegistro;

    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);
    this.showInfoMessage('Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  private removeNewRowFromData(dataRow: EntregaLecheCrudaData): void {
    const originalIndex = this.dataEntregaLecheCrudaOriginal.findIndex(item =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew)
    );

    if (originalIndex !== -1) {
      this.dataEntregaLecheCrudaOriginal.splice(originalIndex, 1);
    }

    const filteredIndex = this.dataEntregaLecheCrudaFiltered.findIndex(item =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew)
    );

    if (filteredIndex !== -1) {
      this.dataEntregaLecheCrudaFiltered.splice(filteredIndex, 1);
      this.dataEntregaLecheCrudaFiltered = [...this.dataEntregaLecheCrudaFiltered];
    }
  }

  private guardarNuevoRegistro(dataRow: EntregaLecheCrudaData, rowElement: HTMLTableRowElement): void {
    if (!this.madreSeleccionada) {
      const madreEncontrada = this.opcionesMadres.find(m => m.value === dataRow.nombre_madre);
      if (madreEncontrada) {
        this.madreSeleccionada = madreEncontrada;
      } else {
        this.savingInProgress = false;
        this.showErrorMessage('Debe seleccionar una madre válida del listado de sugerencias');
        return;
      }
    }

    if (!this.responsableSeleccionado) {
      const responsableEncontrado = this.opcionesResponsables.find(r => r.value === dataRow.responsable);
      if (responsableEncontrado) {
        this.responsableSeleccionado = responsableEncontrado;
      } else {
        this.savingInProgress = false;
        this.showErrorMessage('Debe seleccionar un responsable válido');
        return;
      }
    }

    const request = this.mapFrontendToRequest(dataRow, this.madreSeleccionada.id, this.responsableSeleccionado.id);

    this.entregaLecheCrudaService.postLecheDistribucion(request)
      .subscribe({
        next: () => {
          this.resetearEstadoEdicion();
          this.loadDataEntregaLecheCruda();
          this.showSuccessMessage('Registro creado exitosamente');
        },
        error: () => {
          this.savingInProgress = false;
          this.showErrorMessage('Error al crear el registro');
        }
      });
  }

  private createNewRecord(): EntregaLecheCrudaData {
    return {
      id: null,
      fecha: null,
      nombre_madre: '',
      volumen_leche_materna_am: '',
      volumen_leche_materna_pm: '',
      perdidas: 0,
      responsable: '',
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  onRowEditInit(dataRow: EntregaLecheCrudaData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.showWarningMessage('Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
    this.editingRow = dataRow;

    if (!dataRow.isNew && dataRow.empleado?.id) {
      this.responsableSeleccionado = this.opcionesResponsables.find(r => r.id === dataRow.empleado!.id) || null;
    }

    if (!dataRow.isNew) {
      this.hasNewRowInEditing = false;
    }
  }

  onRowEditSave(dataRow: EntregaLecheCrudaData, index: number, event: MouseEvent): void {
    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (this.savingInProgress) return;

    if (!this.validateRequiredFields(dataRow)) {
      this.showErrorMessage('Por favor complete todos los campos requeridos');
      return;
    }

    this.savingInProgress = true;

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: EntregaLecheCrudaData, index: number): void {
    this.savingInProgress = false;

    if (dataRow.isNew) {
      this.removeNewRowFromData(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      const rowId = this.getRowId(dataRow);
      this.dataEntregaLecheCrudaFiltered[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }

    this.editingRow = null;
    this.madreSeleccionada = null;
    this.responsableSeleccionado = null;
    this.dataEntregaLecheCrudaFiltered = [...this.dataEntregaLecheCrudaFiltered];
  }

  private actualizarRegistroExistente(dataRow: EntregaLecheCrudaData, rowElement: HTMLTableRowElement): void {
    if (!dataRow.id) {
      this.savingInProgress = false;
      this.showErrorMessage('No se puede actualizar un registro sin ID');
      return;
    }

    const madreId = dataRow.madrePotencial?.id;
    const empleadoId = dataRow.empleado?.id;
    const empleadoFinalId = this.responsableSeleccionado?.id || empleadoId;

    if (!madreId || !empleadoFinalId) {
      this.savingInProgress = false;
      this.showErrorMessage('Error: No se puede determinar la madre o empleado para la actualización');
      return;
    }

    const request = this.mapFrontendToRequest(dataRow, madreId, empleadoFinalId);

    this.entregaLecheCrudaService.putLecheDistribucion(dataRow.id, request)
      .subscribe({
        next: () => {
          const rowId = this.getRowId(dataRow);
          delete this.clonedData[rowId];

          if (this.responsableSeleccionado && dataRow.empleado && this.responsableSeleccionado.id !== dataRow.empleado.id) {
            dataRow.empleado = { id: this.responsableSeleccionado.id, nombre: this.responsableSeleccionado.value } as any;
            dataRow.responsable = this.responsableSeleccionado.value;
          }

          this.editingRow = null;
          this.savingInProgress = false;
          this.madreSeleccionada = null;
          this.responsableSeleccionado = null;

          this.table.saveRowEdit(dataRow, rowElement);
          this.showSuccessMessage('Registro actualizado exitosamente');
        },
        error: () => {
          this.savingInProgress = false;
          this.showErrorMessage('Error al actualizar el registro');
        }
      });
  }

  private getRowId(dataRow: EntregaLecheCrudaData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  private validateRequiredFields(dataRow: EntregaLecheCrudaData): boolean {
    const hasVolume = dataRow.volumen_leche_materna_am?.trim() || dataRow.volumen_leche_materna_pm?.trim();

    return !!(
      dataRow.fecha &&
      dataRow.nombre_madre?.trim() &&
      hasVolume &&
      dataRow.responsable?.trim()
    );
  }

  private mapResponseToFrontendData(response: LecheDistribucionResponse[]): EntregaLecheCrudaData[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .map(item => {
        try {
          return this.mapSingleResponseToFrontend(item);
        } catch {
          return null;
        }
      })
      .filter((item): item is EntregaLecheCrudaData => item !== null);
  }

  private mapSingleResponseToFrontend(response: LecheDistribucionResponse): EntregaLecheCrudaData {
    if (!response?.madrePotencial?.infoMadre || !response.empleado) {
      throw new Error('Respuesta incompleta del servidor');
    }

    const fechaParseada = response.fecha ? this.parsearFechaSegura(response.fecha) : null;
    const { infoMadre } = response.madrePotencial;

    return {
      id: response.id,
      fecha: fechaParseada,
      nombre_madre: `${infoMadre.nombre || ''} ${infoMadre.apellido || ''}`.trim(),
      volumen_leche_materna_am: response.volumenManana?.toString() || '',
      volumen_leche_materna_pm: response.volumenTarde?.toString() || '',
      perdidas: response.perdidas || 0,
      responsable: response.empleado.nombre || '',
      madrePotencial: response.madrePotencial,
      empleado: response.empleado
    };
  }

  private mapFrontendToRequest(data: EntregaLecheCrudaData, madreId: number, empleadoId: number): LecheDistribucionRequest {
    const volumenAm = data.volumen_leche_materna_am?.trim() ?
      parseFloat(data.volumen_leche_materna_am) : null;
    const volumenPm = data.volumen_leche_materna_pm?.trim() ?
      parseFloat(data.volumen_leche_materna_pm) : null;

    return {
      fecha: this.formatDateForAPI(data.fecha),
      volumenManana: volumenAm,
      volumenTarde: volumenPm,
      perdidas: data.perdidas || null,
      madrePotencial: { id: madreId },
      empleado: { id: empleadoId }
    };
  }

  private mapMadresToOptions(madres: MadrePotencial[]): MadreOption[] {
    if (!Array.isArray(madres)) {
      return [];
    }

    return madres
      .map(madre => {
        try {
          if (!madre.infoMadre) return null;

          const { nombre = '', apellido = '', documento = '' } = madre.infoMadre;
          const nombreCompleto = `${nombre} ${apellido}`.trim();

          if (!nombreCompleto) return null;

          return {
            label: nombreCompleto,
            value: nombreCompleto,
            documento,
            id: madre.id
          };
        } catch {
          return null;
        }
      })
      .filter((madre): madre is MadreOption => madre !== null);
  }

  private mapEmpleadosToOptions(empleados: Empleado[]): ResponsableOption[] {
    if (!Array.isArray(empleados)) {
      return [];
    }

    return empleados
      .map(empleado => {
        try {
          const nombre = empleado.nombre || 'Sin nombre';
          return { label: nombre, value: nombre, id: empleado.id };
        } catch {
          return null;
        }
      })
      .filter((empleado): empleado is ResponsableOption => empleado !== null);
  }

  private formatDateForAPI(fecha: string | Date | null): string {
    if (!fecha) return '';

    const date = fecha instanceof Date ? fecha : new Date(fecha);

    return [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0')
    ].join('-');
  }

  private resetEditingState(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
    this.madreSeleccionada = null;
    this.responsableSeleccionado = null;
  }

  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
    this.savingInProgress = false;
    this.madreSeleccionada = null;
    this.responsableSeleccionado = null;
  }

  isEditing(rowData: EntregaLecheCrudaData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: EntregaLecheCrudaData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  private showSuccessMessageInitial(): void {
    const cantidad = this.dataEntregaLecheCrudaOriginal.length;
    const pluralText = cantidad > 1 ? 's' : '';

    const messageConfig = cantidad > 0
      ? {
        severity: 'success' as const,
        summary: 'Éxito',
        detail: `${cantidad} registro${pluralText} de entrega de leche cruda cargado${pluralText}`
      }
      : {
        severity: 'info' as const,
        summary: 'Información',
        detail: 'No se encontraron registros de entrega de leche cruda'
      };

    this.messageService.add({ ...messageConfig, key: 'tr', life: 2000 });
  }

  private showSuccessMessage(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      key: 'tr',
      life: 2000,
    });
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      key: 'tr',
      life: 3000,
    });
  }

  private showWarningMessage(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      key: 'tr',
      life: 3000,
    });
  }

  private showInfoMessage(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: message,
      key: 'tr',
      life: 2000,
    });
  }

  private handleError(error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos de entrega de leche cruda',
      key: 'tr',
      life: 3000,
    });
    this.loading = false;
  }
}
