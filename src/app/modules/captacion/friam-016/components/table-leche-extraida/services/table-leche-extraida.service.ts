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

  private readonly dataUpdated = new BehaviorSubject<boolean>(false);
  public readonly dataUpdated$ = this.dataUpdated.asObservable();

  constructor(private readonly http: HttpClient) { }

  getAllLecheSalaExtraccion(): Observable<LecheExtraidaTable[]> {
    return this.http.get<ApiResponse<LecheSalaExtraccion[]>>(`${environment.ApiBLH}/getAllLecheSalaExtraccion`)
      .pipe(
        map(response => this.transformToTableData(response.data))
      );
  }

  createLecheSalaExtraccion(data: LecheExtraidaCreate): Observable<LecheSalaExtraccion> {
    return this.http.post<ApiResponse<LecheSalaExtraccion>>(`${environment.ApiBLH}/postLecheSalaExtraccion`, data)
      .pipe(
        map(response => {
          this.notifyDataUpdate();
          return response.data;
        })
      );
  }

  updateLecheSalaExtraccion(id: number, data: LecheExtraidaCreate): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${environment.ApiBLH}/putLecheSalaExtraccion/${id}`, data)
      .pipe(
        map(response => {
          this.notifyDataUpdate();
          return response.data;
        })
      );
  }

  /**
   * Transforma los datos de la API al formato requerido por la tabla
   */
  private transformToTableData(apiData: LecheSalaExtraccion[]): LecheExtraidaTable[] {
    return apiData.map(item => ({
      id_extraccion: item.id,
      fecha_registro: this.formatDateForDisplay(item.fechaRegistro),
      apellidos_nombre: `${item.madrePotencial.infoMadre.nombre} ${item.madrePotencial.infoMadre.apellido}`,
      edad: this.calculateAge(item.madrePotencial.infoMadre.fechaNacimiento).toString(),
      identificacion: item.madrePotencial.infoMadre.documento,
      municipio: item.madrePotencial.infoMadre.ciudad,
      telefono: item.madrePotencial.infoMadre.telefono || '',
      eps: item.madrePotencial.infoMadre.eps,
      procedencia: item.procedencia,
      consejeria: item.consejeria,
      fecha_nacimiento_original: item.madrePotencial.infoMadre.fechaNacimiento,
      madrePotencial: item.madrePotencial.id
    }));
  }

  /**
   * Calcula la edad basada en la fecha de nacimiento evitando problemas de timezone
   */
  private calculateAge(birthDateString: string): number {
    if (!birthDateString) return 0;

    const dateOnly = this.extractDateOnly(birthDateString);
    const [year, month, day] = dateOnly.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Parsea una fecha desde string de la API a objeto Date
   */
  parseDateFromApi(dateString: string): Date | null {
    if (!dateString) return null;

    const dateOnly = this.extractDateOnly(dateString);
    const [year, month, day] = dateOnly.split('-').map(Number);

    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  /**
   * Extrae solo la parte de fecha de un string que puede incluir tiempo
   */
  private extractDateOnly(dateString: string): string {
    return dateString.includes('T') ? dateString.split('T')[0] : dateString;
  }

  /**
   * Formatea una fecha para mostrar en la tabla (DD/MM/YYYY)
   */
  private formatDateForDisplay(dateString: string): string {
    if (!dateString) return 'Sin fecha';

    const date = new Date(dateString + 'T00:00:00');

    return [
      date.getDate().toString().padStart(2, '0'),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getFullYear()
    ].join('/');
  }

  /**
   * Formatea una fecha para enviar a la API (YYYY-MM-DD)
   */
  formatDateForApi(date: Date): string {
    return [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0')
    ].join('-');
  }

  /**
   * Notifica que los datos han sido actualizados
   */
  private notifyDataUpdate(): void {
    this.dataUpdated.next(true);
  }

  /**
   * Reinicia el estado de actualización de datos
   */
  resetUpdateStatus(): void {
    this.dataUpdated.next(false);
  }
}
