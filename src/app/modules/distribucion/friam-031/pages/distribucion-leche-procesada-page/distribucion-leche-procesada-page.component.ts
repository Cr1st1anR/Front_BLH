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
  private mesAnoActual: { year: number; month: number } | null = null;

  // ✅ MOCK: Base de datos simulada
  private mockDatabase = {
    distribuciones: [
      {
        id: 1,
        fecha: new Date(2025, 11, 5),
        receptor: {
          id: 1,
          responsable_prescripcion: 'Dr. Carlos Ramírez',
          nombre_bebe: 'María Pérez',
          identificacion_bebe: '1234567890',
          semanas_gestacion: '38',
          eps: 'SURA'
        },
        registros: [
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
        ]
      },
      {
        id: 2,
        fecha: new Date(2025, 11, 10),
        receptor: {
          id: 2,
          responsable_prescripcion: 'Dra. Ana Martínez',
          nombre_bebe: 'Juan García',
          identificacion_bebe: '9876543210',
          semanas_gestacion: '36',
          eps: 'SANITAS'
        },
        registros: [
          {
            id: 3,
            fecha: new Date(2025, 11, 10),
            vol_distribuido: '180',
            n_frasco_leche_procesada: 'LHP 25 3',
            id_frasco_leche_procesada: 3,
            calorias: '700',
            acidez_dornic: '3.6',
            tipo_edad: 'Calostro',
            exclusiva: 1,
            freezer: '1',
            gaveta: '5'
          }
        ]
      },
      {
        id: 3,
        fecha: new Date(2025, 11, 15),
        receptor: {
          id: 3,
          responsable_prescripcion: 'Dr. Luis Fernández',
          nombre_bebe: 'Ana Rodríguez',
          identificacion_bebe: '5555555555',
          semanas_gestacion: '40',
          eps: 'COOMEVA'
        },
        registros: [
          {
            id: 4,
            fecha: new Date(2025, 11, 15),
            vol_distribuido: '220',
            n_frasco_leche_procesada: 'LHP 25 4',
            id_frasco_leche_procesada: 4,
            calorias: '690',
            acidez_dornic: '3.4',
            tipo_edad: 'Madura',
            exclusiva: 0,
            freezer: '2',
            gaveta: '10'
          },
          {
            id: 5,
            fecha: new Date(2025, 11, 15),
            vol_distribuido: '150',
            n_frasco_leche_procesada: 'LHP 25 5',
            id_frasco_leche_procesada: 5,
            calorias: '710',
            acidez_dornic: '3.7',
            tipo_edad: 'Transición',
            exclusiva: 1,
            freezer: '3',
            gaveta: '15'
          }
        ]
      }
    ]
  };

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
    // ✅ Cargar automáticamente el mes actual
    const hoy = new Date();
    this.mesAnoActual = {
      year: hoy.getFullYear(),
      month: hoy.getMonth() + 1
    };

    this.cargarFechasDistribucionPorMes(this.mesAnoActual);
    this.mostrarMensaje('info', 'Información', 'Seleccione una distribución existente o cree una nueva');
  }

  ngAfterViewInit(): void {
    // Inicialización adicional si es necesaria
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.mesAnoActual = filtro;
    this.limpiarSeleccion();
    this.cargarFechasDistribucionPorMes(filtro);
  }

  private limpiarSeleccion(): void {
    this.fechaDistribucionSeleccionada = '';
    this.mostrarFormulario = false;
    this.tableComponent?.limpiarDatos();
  }

  private cargarFechasDistribucionPorMes(filtro: { year: number; month: number }): void {
    this.loading.fechas = true;

    // ✅ Filtrar distribuciones del mes seleccionado
    setTimeout(() => {
      const distribucionesFiltradas = this.mockDatabase.distribuciones.filter(dist => {
        const fecha = new Date(dist.fecha);
        return fecha.getMonth() + 1 === filtro.month && fecha.getFullYear() === filtro.year;
      });

      this.opcionesFechasDistribucion = distribucionesFiltradas.map(dist => ({
        label: `${this.formatearFecha(dist.fecha)} - ${dist.receptor.nombre_bebe}`,
        value: dist.fecha.toISOString(),
        fecha: dist.fecha,
        id_registro: dist.id,
        nombreBebe: dist.receptor.nombre_bebe
      }));

      this.loading.fechas = false;

      const cantidad = this.opcionesFechasDistribucion.length;
      if (cantidad > 0) {
        this.mostrarMensaje('success', 'Fechas cargadas', `Se encontraron ${cantidad} distribución${cantidad > 1 ? 'es' : ''}`);
      } else {
        this.mostrarMensaje('info', 'Sin registros', 'No se encontraron distribuciones para este mes');
      }
    }, 500);
  }

  private formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  onFechaDistribucionSeleccionada(event: any): void {
    const fechaSeleccionada = event.value;
    if (!fechaSeleccionada) {
      this.limpiarFormulario();
      return;
    }

    const opcionSeleccionada = this.opcionesFechasDistribucion.find(opt => opt.value === fechaSeleccionada);
    if (!opcionSeleccionada) return;

    this.cargarDatosDistribucion(opcionSeleccionada.id_registro!);
  }

  private cargarDatosDistribucion(idDistribucion: number): void {
    this.loading.main = true;

    // ✅ Buscar la distribución específica
    setTimeout(() => {
      const distribucion = this.mockDatabase.distribuciones.find(d => d.id === idDistribucion);

      if (!distribucion) {
        this.loading.main = false;
        this.mostrarMensaje('error', 'Error', 'No se encontró la distribución seleccionada');
        return;
      }

      // Cargar datos del receptor
      this.datosReceptor = { ...distribucion.receptor };

      // Cargar registros específicos de ese bebé
      this.tableComponent.cargarDatosExternos([...distribucion.registros]);

      this.fechaDistribucionActual = new Date(distribucion.fecha);
      this.idDistribucionActual = idDistribucion;
      this.esActualizacion = true;
      this.mostrarFormulario = true;
      this.loading.main = false;

      this.mostrarMensaje('success', 'Datos cargados', `Se han cargado los datos de ${distribucion.receptor.nombre_bebe}`);
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

    // ✅ Limpiar la tabla para nueva distribución
    this.tableComponent?.limpiarDatos();

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
