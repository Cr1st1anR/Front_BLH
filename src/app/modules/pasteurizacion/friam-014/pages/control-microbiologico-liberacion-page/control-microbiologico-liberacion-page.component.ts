import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
  FrascoPasteurizadoData,
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
  private infoControlOriginal: InfoControlBackend | null = null;

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

  // ============= CARGA DE EMPLEADOS =============

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
        console.error('Error al cargar empleados:', error);
        this.mostrarMensaje('error', 'Error', 'Error al cargar empleados');
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

  // ============= BÚSQUEDA DE FRASCOS =============

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
      this.loading.search = false; // ✅ Aseguramos que se desactive
    },
    error: (error) => {
      this.loading.search = false; // ✅ Aseguramos que se desactive en caso de error
      console.error('Error en búsqueda:', error);
      this.mostrarMensaje(
        'error',
        'Error en búsqueda',
        error.message || 'Error al buscar frascos pasteurizados'
      );

      // Limpiar datos en caso de error
      this.dataControlMicrobiologico = [];
      this.fechaPasteurizacion = null;
      this.esActualizacion = false;
      this.idInfoControl = null;
      this.infoControlOriginal = null;
      this.limpiarFormulario();
    },
    complete: () => {
      // ✅ Por si acaso, aseguramos que siempre se desactive
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

  // Verificar si es una respuesta 204 (sin contenido) o sin frascos
  if (response.status === 204 || frascos.length === 0) {
    this.mostrarMensaje(
      'info',
      'Sin resultados',
      `No se encontraron frascos pasteurizados para el ciclo ${ciclo}, lote ${lote}. Verifique que el ciclo y lote existan.`
    );
    this.dataControlMicrobiologico = [];
    this.fechaPasteurizacion = null;
    this.esActualizacion = false;
    this.idInfoControl = null;
    this.infoControlOriginal = null;
    this.limpiarFormulario();
    return;
  }

  // Guardar datos originales
  this.fechaPasteurizacion = this.parsearFechaLocal(frascos[0].controlReenvase.fecha);
  this.fechaPasteurizacionOriginal = frascos[0].controlReenvase.fecha;
  this.infoControlOriginal = infoControl;
  this.idInfoControl = infoControl?.id || null;
  this.esActualizacion = !!infoControl;

  // Generar registros para la tabla
  this.dataControlMicrobiologico = frascos.map((frasco, index) => {
    const timestamp = Date.now();
    const uniqueId = `search_${timestamp}_${ciclo}_${lote}_${index}_${frasco.numeroFrasco}`;
    const añoActual = new Date().getFullYear().toString().slice(-2);

    return {
      id: frasco.controlMicrobiologico?.id || null,
      numero_frasco_pasteurizado: `LHP ${añoActual} ${frasco.numeroFrasco}`,
      id_frasco_pasteurizado: frasco.id,
      coliformes_totales: this.convertirValorColiformes(frasco.controlMicrobiologico?.coliformes),
      conformidad: this.convertirValorConformidad(frasco.controlMicrobiologico?.conformidad),
      prueba_confirmatoria: this.convertirValorPruebaConfirmatoria(frasco.controlMicrobiologico?.pruebaConfirmatoria),
      liberacion_producto: this.convertirValorLiberacion(frasco.controlMicrobiologico?.liberacion),
      fecha_pasteurizacion: this.parsearFechaLocal(frascos[0].controlReenvase.fecha),
      ciclo: ciclo,
      lote: lote,
      _uid: uniqueId,
      isNew: !frasco.controlMicrobiologico
    };
  });

  // Si hay infoControl, cargar datos del formulario
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

// Agregar este nuevo método helper al final de la sección de MÉTODOS DE CONVERSIÓN DE VALORES:

/**
 * Parsea una fecha en formato string (YYYY-MM-DD) como fecha local
 * Evita problemas de zona horaria que pueden mostrar el día anterior
 * @param fechaString - Fecha en formato "YYYY-MM-DD"
 * @returns Date object en zona horaria local
 */
private parsearFechaLocal(fechaString: string): Date {
  const [year, month, day] = fechaString.split('-').map(Number);
  return new Date(year, month - 1, day); // month - 1 porque en JS los meses van de 0-11
}

  private cargarDatosFormularioDesdeBackend(infoControl: InfoControlBackend): void {
    // Separar fecha y hora de fechaSiembre
    const fechaSiembre = new Date(infoControl.fechaSiembre);
    this.datosFormulario.fechaSiembra = new Date(fechaSiembre.getFullYear(), fechaSiembre.getMonth(), fechaSiembre.getDate());
    this.datosFormulario.horaSiembraAux = fechaSiembre;
    this.datosFormulario.horaSiembra = this.convertDateToHours(fechaSiembre);

    // Separar fecha y hora de primeraLectura
    const primeraLectura = new Date(infoControl.primeraLectura);
    this.datosFormulario.fechaPrimeraLectura = new Date(primeraLectura.getFullYear(), primeraLectura.getMonth(), primeraLectura.getDate());
    this.datosFormulario.horaPrimeraLecturaAux = primeraLectura;
    this.datosFormulario.horaPrimeraLectura = this.convertDateToHours(primeraLectura);

    // Cargar responsables
    this.datosFormulario.responsableSiembra = infoControl.responsableSiembre.nombre;
    this.datosFormulario.responsableLectura = infoControl.responsableLectura.nombre;
    this.datosFormulario.responsableProcesamiento = infoControl.responsableProcesamiento.nombre;
    this.datosFormulario.coordinadorMedico = infoControl.coordinador.nombre;

    // Guardar IDs
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

    this.busquedaCicloLote = {
      ciclo: '',
      lote: ''
    };
    this.fechaPasteurizacion = null;
    this.dataControlMicrobiologico = [];
    this.esActualizacion = false;
    this.idInfoControl = null;
    this.infoControlOriginal = null;
    this.limpiarFormulario();

    this.mostrarMensaje('info', 'Información', 'Búsqueda limpiada');
  }

  // ============= MANEJO DEL FORMULARIO Y GUARDADO =============

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

  // CORRECCIÓN: Obtener IDs SIEMPRE que el formulario sea válido
  // No solo cuando NO es actualización, porque el usuario puede cambiar los selectores
  if (valido) {
    this.datosFormulario.responsableSiembraId = this.opcionesEmpleados.find(
      e => e.nombre === this.datosFormulario.responsableSiembra
    )?.id;

    this.datosFormulario.responsableLecturaId = this.opcionesEmpleados.find(
      e => e.nombre === this.datosFormulario.responsableLectura
    )?.id;

    this.datosFormulario.responsableProcesamientoId = this.opcionesEmpleados.find(
      e => e.nombre === this.datosFormulario.responsableProcesamiento
    )?.id;

    this.datosFormulario.coordinadorMedicoId = this.opcionesEmpleados.find(
      e => e.nombre === this.datosFormulario.coordinadorMedico
    )?.id;
  }

  return valido;
}

  private validarTodosLosRegistros(): boolean {
    if (this.dataControlMicrobiologico.length === 0) {
      return false;
    }

    return this.dataControlMicrobiologico.every(registro =>
      this.tableComponent.validarRegistroCompleto(registro)
    );
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
      console.error('Error al preparar payload:', error);
      return null;
    }
  }

  private enviarDatosCompletos(payload: PostPutControlMicrobiologicoPayload): void {
    this.loading.saving = true;

    const accion = this.esActualizacion ? 'actualizar' : 'guardar';
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
        console.error(`Error al ${accion}:`, error);
        this.mostrarMensaje('error', 'Error', error.message || `Error al ${accion} los datos. Por favor intente nuevamente`);
      }
    });
  }

  // ============= MÉTODOS AUXILIARES =============

  contarRegistrosCompletos(): number {
    if (!this.tableComponent) return 0;

    return this.dataControlMicrobiologico.filter(registro =>
      this.tableComponent.validarRegistroCompleto(registro)
    ).length;
  }

  puedeGuardar(): boolean {
    return this.dataControlMicrobiologico.length > 0 &&
      this.validarTodosLosRegistros() &&
      (!this.tableComponent || !this.tableComponent.isAnyRowEditing());
  }

  obtenerTextoBotonGuardar(): string {
    return this.esActualizacion ? 'Actualizar Datos' : 'Guardar Todos los Datos';
  }

  // ============= MÉTODOS DE CONVERSIÓN DE VALORES =============

  private convertirValorColiformes(valor: number | null | undefined): 0 | 1 | null {
    if (valor === null || valor === undefined) return null;
    return (valor === 0 || valor === 1) ? valor as (0 | 1) : null;
  }

  private convertirValorConformidad(valor: number | null | undefined): 0 | 1 | null {
    if (valor === null || valor === undefined) return null;
    return (valor === 0 || valor === 1) ? valor as (0 | 1) : null;
  }

  private convertirValorPruebaConfirmatoria(valor: number | null | undefined): 0 | 1 | null {
    if (valor === null || valor === undefined) return null;
    return (valor === 0 || valor === 1) ? valor as (0 | 1) : null;
  }

  private convertirValorLiberacion(valor: number | null | undefined): 0 | 1 | null {
    if (valor === null || valor === undefined) return null;
    return (valor === 0 || valor === 1) ? valor as (0 | 1) : null;
  }

  // ============= MENSAJES =============

  private mostrarMensaje(severity: TipoMensaje, summary: string, detail: string, life: number = 3000): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      key: 'tr',
      life
    });
  }
}
