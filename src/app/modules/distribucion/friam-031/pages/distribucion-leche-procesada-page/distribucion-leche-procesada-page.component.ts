import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';

import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { NewRegisterButtonComponent } from "src/app/shared/components/new-register-button/new-register-button.component";
import { DistribucionLecheProcesadaTableComponent } from '../../components/distribucion-leche-procesada-table/distribucion-leche-procesada-table.component';
import { DistribucionLecheProcesadaService } from '../../services/distribucion-leche-procesada.service';

import type {
  DatosReceptor,
  DistribucionLecheProcesadaData,
  LoadingState,
  OpcionFechaDistribucion,
  EpsOption,
  TipoMensaje,
  PayloadDistribucionCompleta
} from '../../interfaces/distribucion-leche-procesada.interface';

@Component({
  selector: 'distribucion-leche-procesada-page',
  standalone: true,
  imports: [
    HeaderComponent,
    MonthPickerComponent,
    NewRegisterButtonComponent,
    DistribucionLecheProcesadaTableComponent,
    CommonModule,
    FormsModule,
    ToastModule,
    ProgressSpinnerModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
    DividerModule
  ],
  templateUrl: './distribucion-leche-procesada-page.component.html',
  styleUrl: './distribucion-leche-procesada-page.component.scss',
  providers: [MessageService]
})
export class DistribucionLecheProcesadaPageComponent implements OnInit, AfterViewInit {

  @ViewChild(DistribucionLecheProcesadaTableComponent)
  tableComponent!: DistribucionLecheProcesadaTableComponent;

  readonly loading: LoadingState = {
    main: false,
    empleados: false,
    frascos: false,
    saving: false,
    fechas: false
  };

  mostrarFormulario: boolean = false;
  esActualizacion: boolean = false;
  fechaDistribucionActual: Date | null = null;
  fechaDistribucionSeleccionada: string = '';

  datosReceptor: DatosReceptor = {
    id: null,
    responsable_prescripcion: '',
    nombre_bebe: '',
    identificacion_bebe: '',
    semanas_gestacion: '',
    eps: ''
  };

  opcionesFechasDistribucion: OpcionFechaDistribucion[] = [];
  opcionesEps: EpsOption[] = [
    { label: 'SURA', value: 'SURA' },
    { label: 'SANITAS', value: 'SANITAS' },
    { label: 'COOMEVA', value: 'COOMEVA' },
    { label: 'SALUD TOTAL', value: 'SALUD TOTAL' },
    { label: 'NUEVA EPS', value: 'NUEVA EPS' },
    { label: 'COMPENSAR', value: 'COMPENSAR' },
    { label: 'FAMISANAR', value: 'FAMISANAR' },
    { label: 'CAFESALUD', value: 'CAFESALUD' }
  ];

  private idDistribucionActual: number | null = null;
  private isInitialized = false;

  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.isAnyRowEditing() ?? false;
  }

  get dataDistribucion(): DistribucionLecheProcesadaData[] {
    return this.tableComponent?.dataDistribucion || [];
  }

  constructor(
    private readonly distribucionService: DistribucionLecheProcesadaService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.mostrarMensaje('info', 'Información', 'Seleccione un mes para ver las distribuciones disponibles o cree una nueva');
  }

  ngAfterViewInit(): void {
    // La inicialización se hará cuando seleccionen un mes
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.cargarFechasDistribucionPorMes(filtro);
    this.tableComponent?.filtrarPorFecha(filtro);
  }

  private cargarFechasDistribucionPorMes(filtro: { year: number; month: number }): void {
    this.loading.fechas = true;

    // ✅ MOCK: Simular carga de fechas desde el backend
    setTimeout(() => {
      const mockFechas: OpcionFechaDistribucion[] = [
        {
          label: '05/12/2025 - María Pérez',
          value: '2025-12-05',
          fecha: new Date(2025, 11, 5),
          id_registro: 1,
          nombreBebe: 'María Pérez'
        },
        {
          label: '10/12/2025 - Juan García',
          value: '2025-12-10',
          fecha: new Date(2025, 11, 10),
          id_registro: 2,
          nombreBebe: 'Juan García'
        },
        {
          label: '15/12/2025 - Ana Rodríguez',
          value: '2025-12-15',
          fecha: new Date(2025, 11, 15),
          id_registro: 3,
          nombreBebe: 'Ana Rodríguez'
        }
      ];

      this.opcionesFechasDistribucion = mockFechas;
      this.loading.fechas = false;

      const cantidad = mockFechas.length;
      if (cantidad > 0) {
        this.mostrarMensaje('success', 'Fechas cargadas', `Se encontraron ${cantidad} distribución${cantidad > 1 ? 'es' : ''}`);
      } else {
        this.mostrarMensaje('info', 'Sin registros', 'No se encontraron distribuciones para este mes');
        this.limpiarFormulario();
      }
    }, 500);
  }

  onFechaDistribucionSeleccionada(event: any): void {
    const fechaSeleccionada = event.value;
    if (!fechaSeleccionada) return;

    const opcionSeleccionada = this.opcionesFechasDistribucion.find(opt => opt.value === fechaSeleccionada);
    if (!opcionSeleccionada) return;

    this.cargarDatosDistribucion(opcionSeleccionada.id_registro!);
  }

  private cargarDatosDistribucion(idDistribucion: number): void {
    this.loading.main = true;

    // ✅ MOCK: Simular carga de datos desde el backend
    setTimeout(() => {
      // Datos del receptor
      this.datosReceptor = {
        id: 1,
        responsable_prescripcion: 'Dr. Carlos Ramírez',
        nombre_bebe: 'María Pérez',
        identificacion_bebe: '1234567890',
        semanas_gestacion: '38',
        eps: 'SURA'
      };

      // Datos de la tabla (registros de distribución)
      const mockRegistros: DistribucionLecheProcesadaData[] = [
        {
          id: 1,
          fecha: new Date(2025, 11, 5),
          vol_distribuido: '150',
          n_frasco_leche_procesada: 'LHP 25 1',
          id_frasco_leche_procesada: 1,
          calorias: '680',
          acidez_dornic: '3.5',
          tipo_edad: 'Madura',
          exclusiva: 1,
          freezer: '3',
          gaveta: '12'
        },
        {
          id: 2,
          fecha: new Date(2025, 11, 5),
          vol_distribuido: '200',
          n_frasco_leche_procesada: 'LHP 25 2',
          id_frasco_leche_procesada: 2,
          calorias: '720',
          acidez_dornic: '3.8',
          tipo_edad: 'Transición',
          exclusiva: 0,
          freezer: '2',
          gaveta: '8'
        }
      ];

      this.tableComponent.cargarDatosExternos(mockRegistros);
      this.fechaDistribucionActual = new Date(2025, 11, 5);
      this.idDistribucionActual = idDistribucion;
      this.esActualizacion = true;
      this.mostrarFormulario = true;
      this.loading.main = false;

      this.mostrarMensaje('success', 'Datos cargados', 'Se han cargado los datos de la distribución');
    }, 500);
  }

  crearNuevaDistribucion(): void {
    if (this.tableComponent?.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual');
      return;
    }

    this.limpiarFormulario();
    this.fechaDistribucionActual = new Date();
    this.fechaDistribucionSeleccionada = '';
    this.esActualizacion = false;
    this.mostrarFormulario = true;
    this.idDistribucionActual = null;

    this.mostrarMensaje('info', 'Nueva distribución', 'Complete los datos del receptor y agregue registros de distribución');
  }

  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
  }

  guardarOActualizarDatos(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los campos del receptor');
      return;
    }

    if (!this.validarTodosLosRegistros()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los registros de la tabla');
      return;
    }

    if (this.tableComponent?.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar la edición actual antes de guardar');
      return;
    }

    const payload = this.prepararPayloadCompleto();
    if (!payload) {
      this.mostrarMensaje('error', 'Error', 'Error al preparar los datos');
      return;
    }

    this.enviarDatosCompletos(payload);
  }

  private validarFormulario(): boolean {
    return !!(
      this.datosReceptor.responsable_prescripcion?.trim() &&
      this.datosReceptor.nombre_bebe?.trim() &&
      this.datosReceptor.identificacion_bebe?.trim() &&
      this.datosReceptor.semanas_gestacion?.trim() &&
      this.datosReceptor.eps?.trim()
    );
  }

  private validarTodosLosRegistros(): boolean {
    if (!this.dataDistribucion || this.dataDistribucion.length === 0) return false;
    return this.dataDistribucion.every(registro => this.tableComponent.validarRegistroCompleto(registro));
  }

  private prepararPayloadCompleto(): PayloadDistribucionCompleta | null {
    try {
      const payload: PayloadDistribucionCompleta = {
        datosReceptor: {
          ...(this.esActualizacion && this.datosReceptor.id ? { id: this.datosReceptor.id } : {}),
          responsable_prescripcion: this.datosReceptor.responsable_prescripcion,
          nombre_bebe: this.datosReceptor.nombre_bebe,
          identificacion_bebe: this.datosReceptor.identificacion_bebe,
          semanas_gestacion: this.datosReceptor.semanas_gestacion,
          eps: this.datosReceptor.eps
        },
        registrosDistribucion: this.dataDistribucion.map(registro => ({
          ...(this.esActualizacion && registro.id ? { id: registro.id } : {}),
          fecha: registro.fecha,
          vol_distribuido: registro.vol_distribuido,
          n_frasco_leche_procesada: registro.n_frasco_leche_procesada,
          id_frasco_leche_procesada: registro.id_frasco_leche_procesada,
          calorias: registro.calorias,
          acidez_dornic: registro.acidez_dornic,
          tipo_edad: registro.tipo_edad,
          exclusiva: registro.exclusiva,
          freezer: registro.freezer,
          gaveta: registro.gaveta
        }))
      };

      return payload;
    } catch (error) {
      return null;
    }
  }

  private enviarDatosCompletos(payload: PayloadDistribucionCompleta): void {
    this.loading.saving = true;

    // ✅ MOCK: Simular guardado en el backend
    setTimeout(() => {
      this.loading.saving = false;
      const mensaje = this.esActualizacion
        ? 'Todos los datos han sido actualizados exitosamente'
        : 'Todos los datos han sido guardados exitosamente';

      this.mostrarMensaje('success', 'Éxito', mensaje);
      this.esActualizacion = true;

      if (!this.idDistribucionActual) {
        this.idDistribucionActual = Date.now();
      }
    }, 1500);
  }

  contarRegistrosCompletos(): number {
    if (!this.tableComponent || !this.dataDistribucion) return 0;
    return this.dataDistribucion.filter(registro => this.tableComponent.validarRegistroCompleto(registro)).length;
  }

  puedeGuardar(): boolean {
    return this.validarFormulario() &&
      this.dataDistribucion.length > 0 &&
      this.validarTodosLosRegistros() &&
      (!this.tableComponent || !this.tableComponent.isAnyRowEditing());
  }

  obtenerTextoBotonGuardar(): string {
    return this.esActualizacion ? 'Actualizar' : 'Guardar';
  }

  limpiarFormulario(): void {
    this.datosReceptor = {
      id: null,
      responsable_prescripcion: '',
      nombre_bebe: '',
      identificacion_bebe: '',
      semanas_gestacion: '',
      eps: ''
    };

    this.tableComponent?.limpiarDatos();
    this.fechaDistribucionActual = null;
    this.mostrarFormulario = false;
    this.esActualizacion = false;
    this.idDistribucionActual = null;
  }

  private mostrarMensaje(severity: TipoMensaje, summary: string, detail: string, life: number = 3000): void {
    this.messageService.add({ severity, summary, detail, key: 'tr', life });
  }
}
