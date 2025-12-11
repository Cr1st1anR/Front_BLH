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
  PayloadControlMicrobiologico
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
  esActualizacion: boolean = false; // Indica si es actualización o guardado nuevo

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

    // Verificar si hay edición activa en la tabla
    if (this.tableComponent && this.tableComponent.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar la edición actual antes de buscar');
      return;
    }

    this.loading.search = true;
    const ciclo = parseInt(String(this.busquedaCicloLote.ciclo));
    const lote = parseInt(String(this.busquedaCicloLote.lote));

    this.controlMicrobiologicoService.getFrascosPasteurizadosPorCicloLote(ciclo, lote).subscribe({
      next: (frascos: FrascoPasteurizadoData[]) => {
        this.procesarResultadosBusqueda(frascos, ciclo, lote);
        this.loading.search = false;
      },
      error: (error) => {
        this.loading.search = false;
        this.mostrarMensaje('error', 'Error', 'Error al buscar frascos pasteurizados');
      }
    });
  }

  private procesarResultadosBusqueda(frascos: FrascoPasteurizadoData[], ciclo: number, lote: number): void {
    if (frascos.length === 0) {
      this.mostrarMensaje('info', 'Sin resultados', `No se encontraron frascos pasteurizados para el ciclo ${ciclo}, lote ${lote}`);
      this.dataControlMicrobiologico = [];
      this.fechaPasteurizacion = null;
      this.esActualizacion = false;
      return;
    }

    this.fechaPasteurizacion = new Date(frascos[0].fechaPasteurizacion);

    // Generar registros desde el servicio
    this.dataControlMicrobiologico = frascos.map((frasco, index) =>
      this.controlMicrobiologicoService.crearRegistroDesdeFramco(frasco, ciclo, lote, index)
    );

    // Determinar si es actualización (verificar si tiene datos guardados previamente)
    // En producción, esto vendría del backend indicando si ya existe un registro
    this.esActualizacion = frascos.some(frasco => (frasco as any).tieneRegistroGuardado);

    this.mostrarMensaje('success', 'Búsqueda exitosa', `Se encontraron ${frascos.length} frasco${frascos.length > 1 ? 's' : ''} pasteurizado${frascos.length > 1 ? 's' : ''}`);
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
    // Verificar si hay edición activa en la tabla
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
      coordinadorMedico: ''
    };
  }

  guardarOActualizarDatos(): void {
    // Procesar las horas antes de validar
    this.procesarHorasFormulario();

    // Validar que el formulario esté completo
    if (!this.validarFormulario()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los campos del formulario');
      return;
    }

    // Validar que todos los registros de la tabla estén completos
    if (!this.validarTodosLosRegistros()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los registros de la tabla antes de guardar');
      return;
    }

    // Verificar que no haya edición activa
    if (this.tableComponent && this.tableComponent.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar la edición actual antes de guardar');
      return;
    }

    // Preparar payload completo
    const payload = this.prepararPayloadCompleto();

    if (!payload) {
      this.mostrarMensaje('error', 'Error', 'Error al preparar los datos para guardar');
      return;
    }

    // Enviar al backend
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
    return !!(
      this.datosFormulario.fechaSiembra &&
      this.datosFormulario.horaSiembra &&
      this.datosFormulario.fechaPrimeraLectura &&
      this.datosFormulario.horaPrimeraLectura &&
      this.datosFormulario.responsableSiembra &&
      this.datosFormulario.responsableLectura &&
      this.datosFormulario.responsableProcesamiento &&
      this.datosFormulario.coordinadorMedico
    );
  }

  private validarTodosLosRegistros(): boolean {
    if (this.dataControlMicrobiologico.length === 0) {
      return false;
    }

    return this.dataControlMicrobiologico.every(registro =>
      this.tableComponent.validarRegistroCompleto(registro)
    );
  }

  private prepararPayloadCompleto(): PayloadControlMicrobiologico | null {
    try {
      const payload: PayloadControlMicrobiologico = {
        datosFormulario: {
          fechaSiembra: this.datosFormulario.fechaSiembra!,
          horaSiembra: this.datosFormulario.horaSiembra!,
          fechaPrimeraLectura: this.datosFormulario.fechaPrimeraLectura!,
          horaPrimeraLectura: this.datosFormulario.horaPrimeraLectura!,
          responsableSiembra: this.datosFormulario.responsableSiembra!,
          responsableLectura: this.datosFormulario.responsableLectura!,
          responsableProcesamiento: this.datosFormulario.responsableProcesamiento!,
          coordinadorMedico: this.datosFormulario.coordinadorMedico!
        },
        registrosControl: this.dataControlMicrobiologico.map(registro => ({
          numero_frasco_pasteurizado: registro.numero_frasco_pasteurizado,
          id_frasco_pasteurizado: registro.id_frasco_pasteurizado!,
          coliformes_totales: registro.coliformes_totales!,
          conformidad: registro.conformidad!,
          prueba_confirmatoria: registro.prueba_confirmatoria ?? null,
          liberacion_producto: registro.liberacion_producto!,
          fecha_pasteurizacion: registro.fecha_pasteurizacion!,
          ciclo: Number(registro.ciclo),
          lote: Number(registro.lote)
        }))
      };

      return payload;
    } catch (error) {
      console.error('Error al preparar payload:', error);
      return null;
    }
  }

  private enviarDatosCompletos(payload: PayloadControlMicrobiologico): void {
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

        // NO limpiamos los datos, solo actualizamos el estado a "actualización"
        this.esActualizacion = true;
      },
      error: (error) => {
        this.loading.saving = false;
        console.error(`Error al ${accion}:`, error);
        this.mostrarMensaje('error', 'Error', `Error al ${accion} los datos. Por favor intente nuevamente`);
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
