import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { LecheSalaExtraccion } from '../../interfaces/leche-sala-extraccion.interface';
import { LecheExtraidaCreate } from '../../interfaces/leche-extraida-create.interface';
import { LecheExtraidaTable } from '../../interfaces/leche-extraida-table.interface';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class TableLecheExtraidaService {

  // Subject para manejar actualizaciones de datos
  private dataUpdated = new BehaviorSubject<boolean>(false);
  public dataUpdated$ = this.dataUpdated.asObservable();

  constructor(private http: HttpClient) { }

  // Método para obtener todos los registros de leche extraída
  getAllLecheSalaExtraccion(): Observable<LecheExtraidaTable[]> {
    return this.http.get<ApiResponse<LecheSalaExtraccion[]>>(`${environment.ApiBLH}/getAllLecheSalaExtraccion`)
      .pipe(
        map(response => this.transformToTableData(response.data))
      );
  }

  // Método para crear un nuevo registro
  createLecheSalaExtraccion(data: LecheExtraidaCreate): Observable<LecheSalaExtraccion> {
    return this.http.post<ApiResponse<LecheSalaExtraccion>>(`${environment.ApiBLH}/postLecheSalaExtraccion`, data)
      .pipe(
        map(response => {
          this.notifyDataUpdate();
          return response.data;
        })
      );
  }

  // Método para actualizar un registro existente
  updateLecheSalaExtraccion(id: number, data: LecheExtraidaCreate): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${environment.ApiBLH}/putLecheSalaExtraccion/${id}`, data)
      .pipe(
        map(response => {
          this.notifyDataUpdate();
          return response.data;
        })
      );
  }

  // ✅ CORREGIDO: Método para transformar los datos de la API al formato de la tabla
  private transformToTableData(apiData: LecheSalaExtraccion[]): LecheExtraidaTable[] {
    return apiData.map(item => ({
      id_extraccion: item.id,
      fecha_registro: this.formatDateForDisplay(item.fechaRegistro),
      apellidos_nombre: `${item.madrePotencial.infoMadre.nombre} ${item.madrePotencial.infoMadre.apellido}`,
      edad: this.calculateAge(item.madrePotencial.infoMadre.fechaNacimiento),
      identificacion: item.madrePotencial.infoMadre.documento,
      municipio: item.madrePotencial.infoMadre.ciudad,
      telefono: item.madrePotencial.infoMadre.telefono || '',
      eps: item.madrePotencial.infoMadre.eps,
      procedencia: item.procedencia,
      consejeria: item.consejeria,
      // ✅ AGREGAR: Campo para mantener la fecha de nacimiento original
      fecha_nacimiento_original: item.madrePotencial.infoMadre.fechaNacimiento
    }));
  }

  // ✅ CORREGIDO: Método para calcular la edad evitando problemas de timezone
  private calculateAge(birthDateString: string): number {
    if (!birthDateString) return 0;

    // Parsear la fecha de nacimiento como fecha local
    let dateOnly = birthDateString;
    if (birthDateString.includes('T')) {
      dateOnly = birthDateString.split('T')[0];
    }

    const [year, month, day] = dateOnly.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day, 12, 0, 0, 0); // mediodía para evitar problemas de zona
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // ✅ NUEVO: Método para parsear fecha de nacimiento desde string de la API
  parseDateFromApi(dateString: string): Date | null {
    if (!dateString) return null;

    let dateOnly = dateString;
    if (dateString.includes('T')) {
      dateOnly = dateString.split('T')[0];
    }

    const [year, month, day] = dateOnly.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0); // mediodía para evitar problemas de zona horaria
  }

  // Método para formatear fecha para mostrar en la tabla
  private formatDateForDisplay(dateString: string): string {
    if (!dateString) return 'Sin fecha';

    // Crear la fecha interpretándola como fecha local (sin conversión de timezone)
    const date = new Date(dateString + 'T00:00:00');

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Método para formatear fecha para enviar a la API
  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Método para notificar actualizaciones de datos
  private notifyDataUpdate(): void {
    this.dataUpdated.next(true);
  }

  // Método para resetear el estado de actualización
  resetUpdateStatus(): void {
    this.dataUpdated.next(false);
  }
}
