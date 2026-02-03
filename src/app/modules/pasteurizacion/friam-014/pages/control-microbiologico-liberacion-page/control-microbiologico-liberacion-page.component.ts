import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';

import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { ControlMicrobiologicoLiberacionTableComponent } from "../../components/control-microbiologico-liberacion-table/control-microbiologico-liberacion-table.component";
import { ControlMicrobiologicoLiberacionService } from '../../services/control-microbiologico-liberacion.service';
import type {
  ControlMicrobiologicoLiberacionData,
  LoadingState,
  BusquedaCicloLote,
  TipoMensaje,
  DatosFormulario,
  EmpleadoOption,
  PostPutControlMicrobiologicoPayload,
  GetControlMicrobiologicoResponse,
  InfoControlBackend
} from '../../interfaces/control-microbiologico-liberacion.interface';

@Component({
  selector: 'control-microbiologico-liberacion-page',
  imports: [
    HeaderComponent,
    ControlMicrobiologicoLiberacionTableComponent,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ToastModule,
    ProgressSpinnerModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    DividerModule
  ],
  templateUrl: './control-microbiologico-liberacion-page.component.html',
  styleUrl: './control-microbiologico-liberacion-page.component.scss',
  providers: [MessageService]
})
export class ControlMicrobiologicoLiberacionPageComponent implements OnInit {

  @ViewChild(ControlMicrobiologicoLiberacionTableComponent)
  tableComponent!: ControlMicrobiologicoLiberacionTableComponent;

  readonly loading: LoadingState = {
    main: false,
    search: false,
    empleados: false,
    saving: false
  };

  dataControlMicrobiologico: ControlMicrobiologicoLiberacionData[] = [];
  fechaPasteurizacion: Date | null = null;
  esActualizacion: boolean = false;

  private idInfoControl: number | null = null;
  private fechaPasteurizacionOriginal: string = '';

  busquedaCicloLote: BusquedaCicloLote = {
    ciclo: '',
    lote: ''
  };

  datosFormulario: DatosFormulario = {
    fechaSiembra: null,
    horaSiembra: '',
    horaSiembraAux: null,
    fechaPrimeraLectura: null,
    horaPrimeraLectura: '',
    horaPrimeraLecturaAux: null,
    responsableSiembra: '',
    responsableLectura: '',
    responsableProcesamiento: '',
    coordinadorMedico: ''
  };

  opcionesEmpleados: EmpleadoOption[] = [];
  opcionesResponsables: { label: string; value: string }[] = [];
  opcionesCoordinadores: { label: string; value: string }[] = [];

  constructor(
    private readonly controlMicrobiologicoService: ControlMicrobiologicoLiberacionService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.mostrarMensaje('info', 'Información', 'Utilice la búsqueda por ciclo y lote para cargar los frascos pasteurizados');
    this.cargarEmpleados();
  }

  // ============= UTILIDADES PARA CÓDIGOS DE FRASCOS =============

  private obtenerAñoDesdeOrActual(fecha?: Date | string | null): string {
    if (fecha) {
      const fechaParseada = fecha instanceof Date ? fecha : this.parsearFechaLocal(fecha as string);
      if (fechaParseada && !isNaN(fechaParseada.getTime())) {
        return fechaParseada.getFullYear().toString().slice(-2);
      }
    }
    return new Date().getFullYear().toString().slice(-2);
  }

  private generarCodigoLHP(numeroFrasco: number, fechaPasteurizacion?: Date | string | null): string {
    const año = this.obtenerAñoDesdeOrActual(fechaPasteurizacion);
    return `LHP ${año} ${numeroFrasco}`;
  }

  // ============= CARGA DE DATOS =============

  private cargarEmpleados(): void {
    this.loading.empleados = true;

    this.controlMicrobiologicoService.getEmpleados().subscribe({
      next: (empleados: EmpleadoOption[]) => {
        this.opcionesEmpleados = empleados;
        this.procesarOpcionesEmpleados(empleados);
        this.loading.empleados = false;
      },
      error: (error) => {
        this.loading.empleados = false;
        this.mostrarMensaje('error', 'Error', this.obtenerMensajeError(error));
      }
    });
  }

  private procesarOpcionesEmpleados(empleados: EmpleadoOption[]): void {
    this.opcionesResponsables = empleados.map(emp => ({
      label: emp.nombre,
      value: emp.nombre
    }));

    this.opcionesCoordinadores = empleados
      .filter(emp =>
        emp.cargo.toLowerCase().includes('coordinador') ||
        emp.cargo.toLowerCase().includes('médico')
      )
      .map(emp => ({
        label: emp.nombre,
        value: emp.nombre
      }));
  }

  buscarFrascosPorCicloLote(): void {
    if (!this.validarBusqueda()) return;

    if (this.tableComponent && this.tableComponent.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar la edición actual antes de buscar');
      return;
    }

    this.loading.search = true;
    const ciclo = parseInt(String(this.busquedaCicloLote.ciclo));
    const lote = parseInt(String(this.busquedaCicloLote.lote));

    this.controlMicrobiologicoService.getControlMicrobiologicoCompleto(ciclo, lote).subscribe({
      next: (response: GetControlMicrobiologicoResponse) => {
        this.procesarResultadosBusquedaCompletos(response, ciclo, lote);
        this.loading.search = false;
      },
      error: (error) => {
        this.loading.search = false;
        this.mostrarMensaje('error', 'Error en búsqueda', this.obtenerMensajeError(error));
        this.limpiarDatos();
      },
      complete: () => {
        this.loading.search = false;
      }
    });
  }

  private procesarResultadosBusquedaCompletos(
    response: GetControlMicrobiologicoResponse,
    ciclo: number,
    lote: number
  ): void {
    const frascos = response.data.frascos;
    const infoControl = response.data.infoControl;

    if (response.status === 204 || frascos.length === 0) {
      this.mostrarMensaje(
        'info',
        'Sin resultados',
        `No se encontraron frascos pasteurizados para el ciclo ${ciclo}, lote ${lote}. Verifique que el ciclo y lote existan.`
      );
      this.limpiarDatos();
      return;
    }

    this.fechaPasteurizacion = this.parsearFechaLocal(frascos[0].controlReenvase.fecha);
    this.fechaPasteurizacionOriginal = frascos[0].controlReenvase.fecha;
    this.idInfoControl = infoControl?.id || null;
    this.esActualizacion = !!infoControl;

    this.dataControlMicrobiologico = frascos.map((frasco, index) => {
      const timestamp = Date.now();
      const uniqueId = `search_${timestamp}_${ciclo}_${lote}_${index}_${frasco.numeroFrasco}`;
      // Usar la fecha de pasteurización del frasco para generar el código
      const fechaPasteurizacionFrasco = frascos[0].controlReenvase.fecha;

      return {
        id: frasco.controlMicrobiologico?.id || null,
        numero_frasco_pasteurizado: this.generarCodigoLHP(frasco.numeroFrasco, fechaPasteurizacionFrasco),
        id_frasco_pasteurizado: frasco.id,
        coliformes_totales: this.convertirValor(frasco.controlMicrobiologico?.coliformes),
        conformidad: this.convertirValor(frasco.controlMicrobiologico?.conformidad),
        prueba_confirmatoria: this.convertirValor(frasco.controlMicrobiologico?.pruebaConfirmatoria),
        liberacion_producto: this.convertirValor(frasco.controlMicrobiologico?.liberacion),
        fecha_pasteurizacion: this.parsearFechaLocal(frascos[0].controlReenvase.fecha),
        ciclo: ciclo,
        lote: lote,
        _uid: uniqueId,
        isNew: !frasco.controlMicrobiologico
      };
    });

    if (infoControl) {
      this.cargarDatosFormularioDesdeBackend(infoControl);
    } else {
      this.limpiarFormulario();
    }

    const mensaje = this.esActualizacion
      ? `Se encontraron ${frascos.length} frasco${frascos.length > 1 ? 's' : ''} con datos guardados`
      : `Se encontraron ${frascos.length} frasco${frascos.length > 1 ? 's' : ''} sin datos guardados`;

    this.mostrarMensaje('success', 'Búsqueda exitosa', mensaje);
  }

  private parsearFechaLocal(fechaString: string): Date {
    const [year, month, day] = fechaString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private cargarDatosFormularioDesdeBackend(infoControl: InfoControlBackend): void {
    const fechaSiembre = new Date(infoControl.fechaSiembre);
    this.datosFormulario.fechaSiembra = new Date(fechaSiembre.getFullYear(), fechaSiembre.getMonth(), fechaSiembre.getDate());
    this.datosFormulario.horaSiembraAux = fechaSiembre;
    this.datosFormulario.horaSiembra = this.convertDateToHours(fechaSiembre);

    const primeraLectura = new Date(infoControl.primeraLectura);
    this.datosFormulario.fechaPrimeraLectura = new Date(primeraLectura.getFullYear(), primeraLectura.getMonth(), primeraLectura.getDate());
    this.datosFormulario.horaPrimeraLecturaAux = primeraLectura;
    this.datosFormulario.horaPrimeraLectura = this.convertDateToHours(primeraLectura);

    this.datosFormulario.responsableSiembra = infoControl.responsableSiembre.nombre;
    this.datosFormulario.responsableLectura = infoControl.responsableLectura.nombre;
    this.datosFormulario.responsableProcesamiento = infoControl.responsableProcesamiento.nombre;
    this.datosFormulario.coordinadorMedico = infoControl.coordinador.nombre;

    this.datosFormulario.responsableSiembraId = infoControl.responsableSiembre.id;
    this.datosFormulario.responsableLecturaId = infoControl.responsableLectura.id;
    this.datosFormulario.responsableProcesamientoId = infoControl.responsableProcesamiento.id;
    this.datosFormulario.coordinadorMedicoId = infoControl.coordinador.id;
  }

  private validarBusqueda(): boolean {
    const cicloStr = String(this.busquedaCicloLote.ciclo || '').trim();
    const loteStr = String(this.busquedaCicloLote.lote || '').trim();

    const cicloValido = cicloStr && !isNaN(Number(cicloStr));
    const loteValido = loteStr && !isNaN(Number(loteStr));

    if (!cicloValido || !loteValido) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor ingrese valores válidos para el ciclo y lote');
      return false;
    }

    if (Number(cicloStr) <= 0 || Number(loteStr) <= 0) {
      this.mostrarMensaje('warn', 'Advertencia', 'El ciclo y lote deben ser números mayores a 0');
      return false;
    }

    return true;
  }

  limpiarBusqueda(): void {
    if (this.tableComponent && this.tableComponent.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar la edición actual antes de limpiar');
      return;
    }

    this.busquedaCicloLote = { ciclo: '', lote: '' };
    this.limpiarDatos();
    this.mostrarMensaje('info', 'Información', 'Búsqueda limpiada');
  }

  private limpiarDatos(): void {
    this.dataControlMicrobiologico = [];
    this.fechaPasteurizacion = null;
    this.esActualizacion = false;
    this.idInfoControl = null;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.datosFormulario = {
      fechaSiembra: null,
      horaSiembra: '',
      horaSiembraAux: null,
      fechaPrimeraLectura: null,
      horaPrimeraLectura: '',
      horaPrimeraLecturaAux: null,
      responsableSiembra: '',
      responsableLectura: '',
      responsableProcesamiento: '',
      coordinadorMedico: '',
      responsableSiembraId: undefined,
      responsableLecturaId: undefined,
      responsableProcesamientoId: undefined,
      coordinadorMedicoId: undefined
    };
  }

  guardarOActualizarDatos(): void {
    this.procesarHorasFormulario();

    if (!this.validarFormulario()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los campos del formulario');
      return;
    }

    if (!this.validarTodosLosRegistros()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los registros de la tabla antes de guardar');
      return;
    }

    if (this.tableComponent && this.tableComponent.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar la edición actual antes de guardar');
      return;
    }

    const payload = this.prepararPayloadCompleto();

    if (!payload) {
      this.mostrarMensaje('error', 'Error', 'Error al preparar los datos para guardar');
      return;
    }

    this.enviarDatosCompletos(payload);
  }

  private procesarHorasFormulario(): void {
    if (this.datosFormulario.horaSiembraAux) {
      this.datosFormulario.horaSiembra = this.convertDateToHours(this.datosFormulario.horaSiembraAux);
    }

    if (this.datosFormulario.horaPrimeraLecturaAux) {
      this.datosFormulario.horaPrimeraLectura = this.convertDateToHours(this.datosFormulario.horaPrimeraLecturaAux);
    }
  }

  private convertDateToHours(fecha: Date): string {
    if (!fecha) return '';
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  private validarFormulario(): boolean {
    const valido = !!(
      this.datosFormulario.fechaSiembra &&
      this.datosFormulario.horaSiembra &&
      this.datosFormulario.fechaPrimeraLectura &&
      this.datosFormulario.horaPrimeraLectura &&
      this.datosFormulario.responsableSiembra &&
      this.datosFormulario.responsableLectura &&
      this.datosFormulario.responsableProcesamiento &&
      this.datosFormulario.coordinadorMedico
    );

    if (valido) {
      this.datosFormulario.responsableSiembraId = this.opcionesEmpleados.find(e => e.nombre === this.datosFormulario.responsableSiembra)?.id;
      this.datosFormulario.responsableLecturaId = this.opcionesEmpleados.find(e => e.nombre === this.datosFormulario.responsableLectura)?.id;
      this.datosFormulario.responsableProcesamientoId = this.opcionesEmpleados.find(e => e.nombre === this.datosFormulario.responsableProcesamiento)?.id;
      this.datosFormulario.coordinadorMedicoId = this.opcionesEmpleados.find(e => e.nombre === this.datosFormulario.coordinadorMedico)?.id;
    }

    return valido;
  }

  private validarTodosLosRegistros(): boolean {
    if (this.dataControlMicrobiologico.length === 0) return false;
    return this.dataControlMicrobiologico.every(registro => this.tableComponent.validarRegistroCompleto(registro));
  }

  private prepararPayloadCompleto(): PostPutControlMicrobiologicoPayload | null {
    try {
      const fechaSiembre = new Date(this.datosFormulario.fechaSiembra!);
      const [horasSiembra, minutosSiembra] = this.datosFormulario.horaSiembra!.split(':');
      fechaSiembre.setHours(parseInt(horasSiembra), parseInt(minutosSiembra), 0, 0);

      const primeraLectura = new Date(this.datosFormulario.fechaPrimeraLectura!);
      const [horasLectura, minutosLectura] = this.datosFormulario.horaPrimeraLectura!.split(':');
      primeraLectura.setHours(parseInt(horasLectura), parseInt(minutosLectura), 0, 0);

      const payload: PostPutControlMicrobiologicoPayload = {
        infoControl: {
          ...(this.esActualizacion && this.idInfoControl ? { id: this.idInfoControl } : {}),
          fechaSiembre: fechaSiembre.toISOString(),
          primeraLectura: primeraLectura.toISOString(),
          responsableSiembre: { id: this.datosFormulario.responsableSiembraId! },
          responsableLectura: { id: this.datosFormulario.responsableLecturaId! },
          responsableProcesamiento: { id: this.datosFormulario.responsableProcesamientoId! },
          coordinador: { id: this.datosFormulario.coordinadorMedicoId! }
        },
        controles: this.dataControlMicrobiologico.map(registro => ({
          ...(this.esActualizacion && registro.id ? { id: registro.id } : {}),
          idFrascoPasteurizado: registro.id_frasco_pasteurizado!,
          fecha: this.fechaPasteurizacionOriginal,
          coliformes: registro.coliformes_totales!,
          conformidad: registro.conformidad!,
          pruebaConfirmatoria: registro.prueba_confirmatoria ?? 0,
          liberacion: registro.liberacion_producto!,
          observaciones: ''
        }))
      };

      return payload;
    } catch (error) {
      return null;
    }
  }

  private enviarDatosCompletos(payload: PostPutControlMicrobiologicoPayload): void {
    this.loading.saving = true;

    const metodo = this.esActualizacion
      ? this.controlMicrobiologicoService.actualizarControlMicrobiologicoCompleto(payload)
      : this.controlMicrobiologicoService.guardarControlMicrobiologicoCompleto(payload);

    metodo.subscribe({
      next: (response) => {
        this.loading.saving = false;
        const mensaje = this.esActualizacion
          ? 'Todos los datos han sido actualizados exitosamente'
          : 'Todos los datos han sido guardados exitosamente';

        this.mostrarMensaje('success', 'Éxito', mensaje);
        this.esActualizacion = true;

        if (!this.idInfoControl && response.data) {
          this.idInfoControl = response.data.infoControl?.id || null;
        }
      },
      error: (error) => {
        this.loading.saving = false;
        this.mostrarMensaje('error', 'Error', this.obtenerMensajeError(error));
      }
    });
  }

  contarRegistrosCompletos(): number {
    if (!this.tableComponent) return 0;
    return this.dataControlMicrobiologico.filter(registro => this.tableComponent.validarRegistroCompleto(registro)).length;
  }

  puedeGuardar(): boolean {
    return this.dataControlMicrobiologico.length > 0 &&
      this.validarTodosLosRegistros() &&
      (!this.tableComponent || !this.tableComponent.isAnyRowEditing());
  }

  obtenerTextoBotonGuardar(): string {
    return this.esActualizacion ? 'Actualizar Datos' : 'Guardar Todos los Datos';
  }

  private convertirValor(valor: number | null | undefined): 0 | 1 | null {
    if (valor === null || valor === undefined) return null;
    return (valor === 0 || valor === 1) ? valor as (0 | 1) : null;
  }

  private obtenerMensajeError(error: any): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) return 'No se encontraron registros para el ciclo y lote especificados';
      if (error.status === 500) return 'Error interno del servidor';
      if (error.status === 0) return 'No se pudo conectar con el servidor';
      if (error.error && error.error.message) return error.error.message;
      return `Error del servidor (${error.status})`;
    }
    return error.message || 'Ocurrió un error desconocido';
  }

  private mostrarMensaje(severity: TipoMensaje, summary: string, detail: string, life: number = 3000): void {
    this.messageService.add({ severity, summary, detail, key: 'tr', life });
  }
}
