import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type { ControlReenvaseData, DonanteOption, FrascoOption } from '../interfaces/control-reenvase.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlReenvaseService {

  constructor(private http: HttpClient) { }

  getMadresDonantes(): Observable<DonanteOption[]> {
    return this.http.get<any>(`${environment.ApiBLH}/GetMadreDonante`)
      .pipe(
        map(response => {
          const donantes = response.data || [];

          return donantes.map((madre: any) => ({
            label: `${madre.id_madre_donante} - ${madre.nombre} ${madre.apellido}`,
            value: madre.id_madre_donante.toString(),
            documento: madre.documento
          }));
        })
      );
  }

  getFrascosByMadreDonante(idMadreDonante: string): Observable<FrascoOption[]> {
    return this.http.get<any>(`${environment.ApiBLH}/getFrascosByMadreDonante/${idMadreDonante}`)
      .pipe(
        map(response => {
          const frascos = response.data || [];

          return frascos.map((frasco: any) => {
            const esExtraccion = frasco.extraccion !== null;
            const frascoData = esExtraccion ? frasco.extraccion : frasco.frascoRecolectado;

            if (!frascoData) return null;

            const codigoLHC = this.generarCodigoLHC(frasco.id);

            return {
              label: codigoLHC,
              value: codigoLHC,
              donante: idMadreDonante,
              volumen: frascoData.volumen ? frascoData.volumen.toString() : '0',
              // Información adicional para uso interno
              id_frasco_principal: frasco.id,
              id_frasco_data: frascoData.id,
              tipo: esExtraccion ? 'extraccion' : 'recolectado',
              fechaExtraccion: frascoData.fechaDeExtraccion || frascoData.fechaExtraccion,
              termo: frascoData.termo,
              gaveta: frascoData.gaveta,
              procedencia: frasco.procedencia,
              fechaVencimiento: frasco.fechaVencimiento,
              fechaEntrada: frasco.fechaEntrada,
              fechaSalida: frasco.fechaSalida
            };
          }).filter((frasco: any) => frasco !== null);
        })
      );
  }

  private generarCodigoLHC(id: number): string {
    const añoActual = new Date().getFullYear().toString().slice(-2);
    return `LHC ${añoActual} ${id}`;
  }

  getControlReenvaseData(): ControlReenvaseData[] {
    return [
      {
        id: 1,
        fecha: '2025-11-01',
        no_donante: '1',
        id_frasco_anterior: 5,
        volumen_frasco_anterior: '500',
        responsable: 'Juan López'
      },
      {
        id: 2,
        fecha: '2025-11-02',
        no_donante: '2',
        id_frasco_anterior: 6,
        volumen_frasco_anterior: '800',
        responsable: 'María Fernández'
      },
      {
        id: 3,
        fecha: '2025-11-03',
        no_donante: '3',
        id_frasco_anterior: 7,
        volumen_frasco_anterior: '1200',
        responsable: 'Juan López'
      },
      {
        id: 4,
        fecha: '2025-11-04',
        no_donante: '1',
        id_frasco_anterior: 8,
        volumen_frasco_anterior: '900',
        responsable: 'Pedro Sánchez'
      },
      {
        id: 5,
        fecha: '2025-11-06',
        no_donante: '2',
        id_frasco_anterior: 9,
        volumen_frasco_anterior: '1100',
        responsable: 'María Fernández'
      }
    ];
  }
}
