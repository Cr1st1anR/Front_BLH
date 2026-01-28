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
  PayloadDistribucionCompleta,
  PostDistribucionPayload,
  PutDistribucionPayload,
  DistribucionCompletaBackend,
  InfoDistribucionBackend
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
  identificacionActual: string = '';
  distribucionSeleccionada: string = '';

  datosReceptor: DatosReceptor = {
    id: null,
    responsable_prescripcion: '',
    nombre_bebe: '',
    identificacion_bebe: '',
    semanas_gestacion: '',
    eps: ''
  };

  opcionesDistribuciones: OpcionFechaDistribucion[] = [];
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

  // ✅ Mapeo de tipos de edad frontend <-> backend
  private readonly tipoEdadMap: Record<string, string> = {
    'Madura': 'M',
    'Transición': 'T',
    'Calostro': 'C'
  };

  private readonly tipoEdadReverseMap: Record<string, string> = {
    'M': 'Madura',
    'T': 'Transición',
    'C': 'Calostro'
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
    const hoy = new Date();
    this.mesAnoActual = {
      year: hoy.getFullYear(),
      month: hoy.getMonth() + 1
    };

    this.mostrarMensaje('info', 'Información', 'Seleccione una distribución existente o cree una nueva');
  }

  ngAfterViewInit(): void {
    if (this.mesAnoActual) {
      setTimeout(() => {
        this.cargarDistribucionesPorMes(this.mesAnoActual!);
      }, 500);
    }
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.mesAnoActual = filtro;
    this.limpiarSeleccion();
    this.cargarDistribucionesPorMes(filtro);
  }

  private limpiarSeleccion(): void {
    this.distribucionSeleccionada = '';
    this.mostrarFormulario = false;

    if (this.tableComponent) {
      this.tableComponent.limpiarDatos();
    }
  }

  // ✅ CORREGIDO: Cargar distribuciones por mes desde el backend
  private cargarDistribucionesPorMes(filtro: { year: number; month: number }): void {
    this.loading.fechas = true;

    // ✅ Limpiar opciones anteriores
    this.opcionesDistribuciones = [];

    this.distribucionService.getDistribucionesPorMes(filtro.month, filtro.year).subscribe({
      next: (distribuciones) => {
        // Ordenar alfabéticamente por identificación
        distribuciones.sort((a, b) =>
          a.identificacion.toString().localeCompare(b.identificacion.toString())
        );

        this.opcionesDistribuciones = distribuciones.map(dist => ({
          label: `${dist.identificacion} - ${dist.nombreBeneficiario}`,
          value: dist.id.toString(),
          identificacion: dist.identificacion.toString(),
          nombreBebe: dist.nombreBeneficiario,
          id_registro: dist.id
        }));

        this.loading.fechas = false;

        const cantidad = this.opcionesDistribuciones.length;
        if (cantidad > 0) {
          this.mostrarMensaje('success', 'Distribuciones cargadas',
            `Se encontraron ${cantidad} distribución${cantidad > 1 ? 'es' : ''}`);
        } else {
          // ✅ FIX: Mensaje cuando no hay distribuciones
          this.mostrarMensaje('info', 'Sin distribuciones',
            `No se encontraron distribuciones para ${this.obtenerNombreMes(filtro.month)} ${filtro.year}`);
        }
      },
      error: (error) => {
        this.loading.fechas = false;

        // ✅ FIX: Verificar si es un error 204 (No Content)
        if (error.message.includes('204') || error.message.includes('No Content')) {
          this.opcionesDistribuciones = [];
          this.mostrarMensaje('info', 'Sin distribuciones',
            `No se encontraron distribuciones para ${this.obtenerNombreMes(filtro.month)} ${filtro.year}`);
        } else {
          this.mostrarMensaje('error', 'Error',
            `Error al cargar distribuciones: ${error.message}`);
          console.error('Error al cargar distribuciones:', error);
        }
      }
    });
  }

  /**
   * ✅ NUEVO: Obtener nombre del mes
   */
  private obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || '';
  }

  onDistribucionSeleccionada(event: any): void {
    const idSeleccionado = event.value;
    if (!idSeleccionado) {
      this.limpiarFormulario();
      return;
    }

    const opcionSeleccionada = this.opcionesDistribuciones.find(opt => opt.value === idSeleccionado);
    if (!opcionSeleccionada) return;

    this.cargarDatosDistribucion(opcionSeleccionada.id_registro);
  }

  // ✅ INTEGRADO: Cargar datos completos de una distribución
  private cargarDatosDistribucion(idDistribucion: number, intentosRestantes: number = 3): void {
    if (!this.tableComponent) {
      if (intentosRestantes > 0) {
        setTimeout(() => {
          this.cargarDatosDistribucion(idDistribucion, intentosRestantes - 1);
        }, 300);
        return;
      } else {
        this.mostrarMensaje('error', 'Error', 'La tabla no está lista. Por favor, intente nuevamente.');
        return;
      }
    }

    this.loading.main = true;

    this.distribucionService.getDistribucionById(idDistribucion).subscribe({
      next: (distribucion) => {
        // Mapear datos del receptor
        this.datosReceptor = {
          id: distribucion.id,
          responsable_prescripcion: distribucion.responsable,
          nombre_bebe: distribucion.nombreBeneficiario,
          identificacion_bebe: distribucion.identificacion.toString(),
          semanas_gestacion: distribucion.semanasGestacion.toString(),
          eps: distribucion.eps
        };

        this.identificacionActual = distribucion.identificacion.toString();

        // Mapear registros de distribución
        const registros: DistribucionLecheProcesadaData[] = distribucion.infoDistribucion.map(info =>
          this.mapearInfoDistribucionARegistro(info)
        );

        // Ordenar por fecha (más antiguos primero)
        const registrosOrdenados = registros.sort((a, b) => {
          const fechaA = new Date(a.fecha!).getTime();
          const fechaB = new Date(b.fecha!).getTime();
          return fechaA - fechaB;
        });

        if (this.tableComponent && this.tableComponent.cargarDatosExternos) {
          this.tableComponent.cargarDatosExternos(registrosOrdenados);
        }

        this.idDistribucionActual = idDistribucion;
        this.esActualizacion = true;
        this.mostrarFormulario = true;
        this.loading.main = false;

        this.mostrarMensaje('success', 'Datos cargados',
          `Se han cargado ${registrosOrdenados.length} registro${registrosOrdenados.length > 1 ? 's' : ''} de ${distribucion.nombreBeneficiario}`);
      },
      error: (error) => {
        this.loading.main = false;
        this.mostrarMensaje('error', 'Error',
          `Error al cargar la distribución: ${error.message}`);
        console.error('Error al cargar distribución:', error);
      }
    });
  }

  /**
   * ✅ CORREGIDO: Mapea un registro de infoDistribucion del backend al formato del frontend
   */
  private mapearInfoDistribucionARegistro(info: InfoDistribucionBackend): DistribucionLecheProcesadaData {
    const frasco = info.frascoPasteurizado;

    // ✅ FIX: Parsear fecha sin conversión de zona horaria
    const fechaParts = info.fecha.split('-'); // "2026-01-26" -> ["2026", "01", "26"]
    const fechaLocal = new Date(
      parseInt(fechaParts[0]),
      parseInt(fechaParts[1]) - 1,
      parseInt(fechaParts[2])
    );

    return {
      id: info.id,
      fecha: fechaLocal,
      vol_distribuido: info.volumenDistribuido.toString(), // ✅ CORREGIDO: Usar volumenDistribuido de la distribución
      n_frasco_leche_procesada: `LHP 25 ${frasco.numeroFrasco}`,
      id_frasco_leche_procesada: frasco.id,
      calorias: frasco.controlReenvase.seleccionClasificacion.crematocrito.kcal.toString(),
      acidez_dornic: frasco.controlReenvase.seleccionClasificacion.acidezDornic.resultado.toString(),
      tipo_edad: this.tipoEdadReverseMap[info.tipo] || info.tipo,
      exclusiva: info.exclusiva,
      freezer: '3', // ✅ Siempre es 3 según tus especificaciones
      gaveta: frasco.entradasSalidasPasteurizada.gaveta.toString()
    };
  }

  crearNuevaDistribucion(): void {
    if (this.tableComponent?.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual');
      return;
    }

    if (this.tableComponent) {
      this.tableComponent.limpiarDatos();
    }

    this.limpiarFormulario();
    this.identificacionActual = '';
    this.distribucionSeleccionada = '';
    this.esActualizacion = false;
    this.mostrarFormulario = true;
    this.idDistribucionActual = null;

    this.mostrarMensaje('info', 'Nueva distribución',
      'Complete los datos del receptor y agregue registros de distribución');
  }

  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
  }

  // ✅ INTEGRADO: Guardar o actualizar con backend real
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
      this.mostrarMensaje('warn', 'Advertencia',
        'Debe confirmar o cancelar la edición actual antes de guardar');
      return;
    }

    if (this.esActualizacion) {
      this.actualizarDistribucion();
    } else {
      this.crearDistribucion();
    }
  }

  /**
   * ✅ CORREGIDO: Actualizar distribución existente
   */
  private actualizarDistribucion(): void {
    this.loading.saving = true;

    // Ordenar registros por fecha
    const registrosOrdenados = [...this.dataDistribucion].sort((a, b) => {
      const fechaA = new Date(a.fecha!).getTime();
      const fechaB = new Date(b.fecha!).getTime();
      return fechaA - fechaB;
    });

    // ✅ Separar registros nuevos de registros existentes
    const registrosNuevos = registrosOrdenados.filter(reg => reg.id === null || typeof reg.id === 'number' && reg.id > 1000000000000);
    const registrosExistentes = registrosOrdenados.filter(reg => reg.id !== null && !(typeof reg.id === 'number' && reg.id > 1000000000000));

    const promesas: Promise<any>[] = [];

    // ✅ ACTUALIZAR registros existentes con PUT
    registrosExistentes.forEach(registro => {
      const payload: PutDistribucionPayload = {
        idInfoDistribucion: registro.id!,
        fecha: this.convertirFechaParaBackend(registro.fecha!),
        volumenDistribuido: parseFloat(registro.vol_distribuido),
        frascoPasteurizado: { id: registro.id_frasco_leche_procesada! },
        tipo: this.tipoEdadMap[registro.tipo_edad] || registro.tipo_edad,
        nombreBeneficiario: this.datosReceptor.nombre_bebe,
        identificacion: parseInt(this.datosReceptor.identificacion_bebe),
        semanasGestacion: parseInt(this.datosReceptor.semanas_gestacion),
        eps: this.datosReceptor.eps,
        responsable: this.datosReceptor.responsable_prescripcion,
        exclusiva: registro.exclusiva
      };

      promesas.push(this.distribucionService.putDistribucion(this.idDistribucionActual!, payload).toPromise());
    });

    // ✅ CREAR nuevos registros con POST
    registrosNuevos.forEach(registro => {
      const payload: PostDistribucionPayload = {
        fecha: this.convertirFechaParaBackend(registro.fecha!),
        volumenDistribuido: parseFloat(registro.vol_distribuido),
        frascoPasteurizado: { id: registro.id_frasco_leche_procesada! },
        tipo: this.tipoEdadMap[registro.tipo_edad] || registro.tipo_edad,
        responsable: this.datosReceptor.responsable_prescripcion,
        nombreBeneficiario: this.datosReceptor.nombre_bebe,
        identificacion: parseInt(this.datosReceptor.identificacion_bebe),
        semanasGestacion: parseInt(this.datosReceptor.semanas_gestacion),
        eps: this.datosReceptor.eps,
        exclusiva: registro.exclusiva
      };

      promesas.push(this.distribucionService.postDistribucion(payload).toPromise());
    });

    Promise.all(promesas)
      .then(() => {
        this.loading.saving = false;
        this.identificacionActual = this.datosReceptor.identificacion_bebe;

        const mensaje = registrosNuevos.length > 0 && registrosExistentes.length > 0
          ? `Se actualizaron ${registrosExistentes.length} registro(s) y se crearon ${registrosNuevos.length} nuevo(s)`
          : registrosNuevos.length > 0
          ? `Se crearon ${registrosNuevos.length} nuevo(s) registro(s)`
          : `Se actualizaron ${registrosExistentes.length} registro(s)`;

        this.mostrarMensaje('success', 'Éxito', mensaje);

        // ✅ Recargar datos para obtener IDs reales del backend
        if (this.idDistribucionActual) {
          this.cargarDatosDistribucion(this.idDistribucionActual);
        }
      })
      .catch((error) => {
        this.loading.saving = false;
        this.mostrarMensaje('error', 'Error',
          `Error al guardar cambios: ${error.message}`);
        console.error('Error al actualizar:', error);
      });
  }

  /**
   * Crear nueva distribución
   */
  private crearDistribucion(): void {
    this.loading.saving = true;

    // Ordenar registros por fecha
    const registrosOrdenados = [...this.dataDistribucion].sort((a, b) => {
      const fechaA = new Date(a.fecha!).getTime();
      const fechaB = new Date(b.fecha!).getTime();
      return fechaA - fechaB;
    });

    // ✅ Crear cada registro individualmente
    const creaciones = registrosOrdenados.map(registro => {
      const payload: PostDistribucionPayload = {
        fecha: this.convertirFechaParaBackend(registro.fecha!),
        volumenDistribuido: parseFloat(registro.vol_distribuido),
        frascoPasteurizado: { id: registro.id_frasco_leche_procesada! },
        tipo: this.tipoEdadMap[registro.tipo_edad] || registro.tipo_edad,
        responsable: this.datosReceptor.responsable_prescripcion,
        nombreBeneficiario: this.datosReceptor.nombre_bebe,
        identificacion: parseInt(this.datosReceptor.identificacion_bebe),
        semanasGestacion: parseInt(this.datosReceptor.semanas_gestacion),
        eps: this.datosReceptor.eps,
        exclusiva: registro.exclusiva
      };

      return this.distribucionService.postDistribucion(payload).toPromise();
    });

    Promise.all(creaciones)
      .then((resultados) => {
        this.loading.saving = false;

        // Actualizar con el ID del primer registro creado
        if (resultados.length > 0 && resultados[0]) {
          this.idDistribucionActual = resultados[0].id;
        }

        this.identificacionActual = this.datosReceptor.identificacion_bebe;
        this.esActualizacion = true;

        this.mostrarMensaje('success', 'Éxito',
          'Todos los datos han sido guardados exitosamente');
      })
      .catch((error) => {
        this.loading.saving = false;
        this.mostrarMensaje('error', 'Error',
          `Error al guardar: ${error.message}`);
        console.error('Error al crear:', error);
      });
  }

  /**
   * Convierte una fecha a formato YYYY-MM-DD para el backend
   */
  private convertirFechaParaBackend(fecha: string | Date): string {
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);

    const year = fechaObj.getFullYear();
    const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(fechaObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
    return this.dataDistribucion.every(registro =>
      this.tableComponent.validarRegistroCompleto(registro)
    );
  }

  contarRegistrosCompletos(): number {
    if (!this.tableComponent || !this.dataDistribucion) return 0;
    return this.dataDistribucion.filter(registro =>
      this.tableComponent.validarRegistroCompleto(registro)
    ).length;
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

    if (this.tableComponent) {
      this.tableComponent.limpiarDatos();
    }

    this.identificacionActual = '';
    this.mostrarFormulario = false;
    this.esActualizacion = false;
    this.idDistribucionActual = null;
  }

  private mostrarMensaje(severity: TipoMensaje, summary: string, detail: string, life: number = 3000): void {
    this.messageService.add({ severity, summary, detail, key: 'tr', life });
  }
}
