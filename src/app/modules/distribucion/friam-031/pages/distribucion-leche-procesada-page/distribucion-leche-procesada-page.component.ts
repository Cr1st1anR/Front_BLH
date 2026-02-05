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
  EntidadOption,
  TipoMensaje,
  PostDistribucionPayload,
  PutDistribucionPayload,
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
  distribucionSeleccionada: string = '';

  datosReceptor: DatosReceptor = {
    id: null,
    responsable_prescripcion: '',
    nombre_bebe: '',
    identificacion_bebe: '',
    semanas_gestacion: '',
    eps: null
  };

  opcionesDistribuciones: OpcionFechaDistribucion[] = [];
  opcionesEps: EpsOption[] = [];

  private idDistribucionActual: number | null = null;
  private mesAnoActual: { year: number; month: number } | null = null;
  private cargaInicialCompletada: boolean = false;

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

    this.cargarEntidades();

    this.mostrarMensaje('info', 'Información', 'Seleccione una distribución existente o cree una nueva');
  }

  private cargarEntidades(): void {
    this.distribucionService.getAllEntidades().subscribe({
      next: (entidades: EntidadOption[]) => {
        this.opcionesEps = entidades;
      },
      error: (error: Error) => {
        this.mostrarMensaje('error', 'Error',
          `Error al cargar EPS: ${error.message}`);
        console.error('Error al cargar EPS:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.mesAnoActual) {
      setTimeout(() => {
        this.cargarDistribucionesPorMes(this.mesAnoActual!);
        this.cargaInicialCompletada = true;
      }, 500);
    }
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    if (!this.cargaInicialCompletada) {
      if (filtro.year === this.mesAnoActual?.year && filtro.month === this.mesAnoActual?.month) {
        return;
      }
    }

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

  private cargarDistribucionesPorMes(filtro: { year: number; month: number }): void {
    this.loading.fechas = true;
    this.opcionesDistribuciones = [];

    this.distribucionService.getDistribucionesPorMes(filtro.month, filtro.year).subscribe({
      next: (distribuciones) => {
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
          this.mostrarMensaje('info', 'Sin distribuciones',
            `No se encontraron distribuciones para ${this.obtenerNombreMes(filtro.month)} ${filtro.year}`);
        }
      },
      error: (error) => {
        this.loading.fechas = false;

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
        this.datosReceptor = {
          id: distribucion.id,
          responsable_prescripcion: distribucion.responsable,
          nombre_bebe: distribucion.nombreBeneficiario,
          identificacion_bebe: distribucion.identificacion.toString(),
          semanas_gestacion: distribucion.semanasGestacion.toString(),
          eps: distribucion.eps?.id || null
        };

        const registros: DistribucionLecheProcesadaData[] = distribucion.infoDistribucion.map(info =>
          this.mapearInfoDistribucionARegistro(info)
        );

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

  private mapearInfoDistribucionARegistro(info: InfoDistribucionBackend): DistribucionLecheProcesadaData {
    const frasco = info.frascoPasteurizado;

    const fechaParts = info.fecha.split('-');
    const fechaLocal = new Date(
      parseInt(fechaParts[0]),
      parseInt(fechaParts[1]) - 1,
      parseInt(fechaParts[2])
    );

    const fechaPasteurizacion = frasco.controlReenvase?.fecha
      ? new Date(frasco.controlReenvase.fecha)
      : new Date();

    const añoPasteurizacion = fechaPasteurizacion.getFullYear().toString().slice(-2);

    return {
      id: info.id,
      fecha: fechaLocal,
      vol_distribuido: info.volumenDistribuido.toString(),
      n_frasco_leche_procesada: `LHP ${añoPasteurizacion} ${frasco.numeroFrasco}`,
      id_frasco_leche_procesada: frasco.id,
      calorias: frasco.controlReenvase.seleccionClasificacion.crematocrito.kcal.toString(),
      acidez_dornic: frasco.controlReenvase.seleccionClasificacion.acidezDornic.resultado.toString(),
      tipo_edad: this.tipoEdadReverseMap[info.tipo] || info.tipo,
      exclusiva: info.exclusiva,
      freezer: '3',
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

  private actualizarDistribucion(): void {
    this.loading.saving = true;

    const registrosOrdenados = [...this.dataDistribucion].sort((a, b) => {
      const fechaA = new Date(a.fecha!).getTime();
      const fechaB = new Date(b.fecha!).getTime();
      return fechaA - fechaB;
    });

    const registrosNuevos = registrosOrdenados.filter(reg => reg.id === null || typeof reg.id === 'number' && reg.id > 1000000000000);
    const registrosExistentes = registrosOrdenados.filter(reg => reg.id !== null && !(typeof reg.id === 'number' && reg.id > 1000000000000));

    const promesas: Promise<any>[] = [];

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
        eps: { id: this.datosReceptor.eps! },
        responsable: this.datosReceptor.responsable_prescripcion,
        exclusiva: registro.exclusiva
      };

      promesas.push(this.distribucionService.putDistribucion(this.idDistribucionActual!, payload).toPromise());
    });

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
        eps: { id: this.datosReceptor.eps! },
        exclusiva: registro.exclusiva
      };

      promesas.push(this.distribucionService.postDistribucion(payload).toPromise());
    });

    Promise.all(promesas)
      .then(() => {
        this.loading.saving = false;

        const mensaje = registrosNuevos.length > 0 && registrosExistentes.length > 0
          ? `Se actualizaron ${registrosExistentes.length} registro(s) y se crearon ${registrosNuevos.length} nuevo(s)`
          : registrosNuevos.length > 0
          ? `Se crearon ${registrosNuevos.length} nuevo(s) registro(s)`
          : `Se actualizaron ${registrosExistentes.length} registro(s)`;

        this.mostrarMensaje('success', 'Éxito', mensaje);

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

  private crearDistribucion(): void {
    this.loading.saving = true;

    const registrosOrdenados = [...this.dataDistribucion].sort((a, b) => {
      const fechaA = new Date(a.fecha!).getTime();
      const fechaB = new Date(b.fecha!).getTime();
      return fechaA - fechaB;
    });

    let idDistribucionCreada: number | null = null;

    const crearRegistrosSecuencialmente = async () => {
      for (const registro of registrosOrdenados) {
        const payload: PostDistribucionPayload = {
          fecha: this.convertirFechaParaBackend(registro.fecha!),
          volumenDistribuido: parseFloat(registro.vol_distribuido),
          frascoPasteurizado: { id: registro.id_frasco_leche_procesada! },
          tipo: this.tipoEdadMap[registro.tipo_edad] || registro.tipo_edad,
          responsable: this.datosReceptor.responsable_prescripcion,
          nombreBeneficiario: this.datosReceptor.nombre_bebe,
          identificacion: parseInt(this.datosReceptor.identificacion_bebe),
          semanasGestacion: parseInt(this.datosReceptor.semanas_gestacion),
          eps: { id: this.datosReceptor.eps! },
          exclusiva: registro.exclusiva
        };

        try {
          const resultado = await this.distribucionService.postDistribucion(payload).toPromise();

          if (!idDistribucionCreada && resultado) {
            idDistribucionCreada = resultado.id;
          }
        } catch (error) {
          throw error;
        }
      }
    };

    crearRegistrosSecuencialmente()
      .then(() => {
        this.loading.saving = false;

        if (idDistribucionCreada) {
          this.idDistribucionActual = idDistribucionCreada;
        }

        this.esActualizacion = true;

        this.mostrarMensaje('success', 'Éxito',
          `Se crearon ${registrosOrdenados.length} registro(s) exitosamente`);

        if (this.idDistribucionActual) {
          this.cargarDatosDistribucion(this.idDistribucionActual);
        }
      })
      .catch((error) => {
        this.loading.saving = false;
        this.mostrarMensaje('error', 'Error',
          `Error al guardar: ${error.message}`);
        console.error('Error al crear:', error);
      });
  }

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
      this.datosReceptor.eps !== null
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
      eps: null
    };

    if (this.tableComponent) {
      this.tableComponent.limpiarDatos();
    }

    this.mostrarFormulario = false;
    this.esActualizacion = false;
    this.idDistribucionActual = null;
  }

  private mostrarMensaje(severity: TipoMensaje, summary: string, detail: string, life: number = 3000): void {
    this.messageService.add({ severity, summary, detail, key: 'tr', life });
  }
}
